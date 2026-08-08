import os
import time
import logging
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.api_router import api_router
from app.exceptions.custom_exceptions import BaseAPIException
from app.db.session import engine, Base, AsyncSessionLocal

# Import all SQLAlchemy models to register with Base.metadata
import app.models.user
import app.models.survey
import app.models.gift
import app.models.community
import app.models.wishlist
import app.models.activity

from app.db.seed_gifts import seed_catalog

setup_logging()
logger = logging.getLogger("presently.security")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-seed initial catalog items
    async with AsyncSessionLocal() as session:
        await seed_catalog(session)
        
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-Memory Rate Limiting Abstraction
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_MIN = 120
MAX_SENSITIVE_PER_MIN = 15

request_history = defaultdict(list)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # Rate Limiting check
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()

    # Clean history older than 60s
    request_history[client_ip] = [t for t in request_history[client_ip] if now - t < RATE_LIMIT_WINDOW]

    # Check sensitive route limits
    is_sensitive = any(path in request.url.path for path in ["/recommendations", "/survey", "/uploads"])
    limit = MAX_SENSITIVE_PER_MIN if is_sensitive else MAX_REQUESTS_PER_MIN

    if len(request_history[client_ip]) >= limit:
        logger.warning(f"Rate limit exceeded for IP {client_ip} on path {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"success": False, "error": "Rate limit exceeded. Please try again in a minute."},
        )

    request_history[client_ip].append(now)

    # Process Request
    response: Response = await call_next(request)

    # Attach Production Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    return response


# Exception Handlers
@app.exception_handler(BaseAPIException)
async def custom_exception_handler(request: Request, exc: BaseAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Server Error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An internal server error occurred. Please try again later.",
        },
    )


# Attach API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Static Files for Uploads Fallback
uploads_dir = os.path.join(os.getcwd(), "uploads", "static")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads/static", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
async def root():
    return {
        "message": "Welcome to Presently API Engine",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "ready": "/ready",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "version": settings.VERSION}


@app.get("/ready")
async def readiness_check():
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        logger.error(f"Readiness DB check failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "database": "disconnected"},
        )
