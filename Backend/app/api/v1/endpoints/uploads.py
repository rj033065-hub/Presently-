import os
import uuid
import time
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger("presently.uploads")

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}

# Ensure local fallback uploads directory exists
LOCAL_UPLOADS_DIR = os.path.join(os.getcwd(), "uploads", "static")
os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: Optional[str] = Form("community"),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an image file (Max size 5MB, format: JPEG/PNG/WEBP/GIF).
    Saves to Cloudinary if credentials configured; otherwise fallback to local static storage.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format '{file.content_type}'. Allowed types: JPEG, PNG, WEBP, GIF.",
        )

    # Read content to check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        size_mb = round(len(contents) / (1024 * 1024), 2)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds 5MB limit ({size_mb}MB provided).",
        )

    # Check Cloudinary configuration
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_CLOUD_NAME != "":
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=getattr(settings, "CLOUDINARY_API_KEY", ""),
                api_secret=getattr(settings, "CLOUDINARY_API_SECRET", ""),
                secure=True,
            )

            result = cloudinary.uploader.upload(
                contents,
                folder=f"presently/{folder}",
                resource_type="image",
            )
            url = result.get("secure_url") or result.get("url")
            return {"url": url, "public_id": result.get("public_id")}
        except Exception as e:
            logger.warning(f"Cloudinary upload failed ({str(e)}), falling back to local storage.")

    # Sanitize folder parameter to prevent path traversal
    safe_folder = "".join(c for c in (folder or "community") if c.isalnum() or c in ("_", "-")).lower()
    if not safe_folder:
        safe_folder = "community"

    # Local fallback storage
    raw_ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    ext = "".join(c for c in raw_ext if c.isalnum()).lower() or "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        ext = "jpg"

    filename = f"{safe_folder}_{uuid.uuid4().hex[:12]}.{ext}"
    file_path = os.path.join(LOCAL_UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    local_url = f"/uploads/static/{filename}"
    logger.info(f"Saved uploaded image to local storage: {local_url}")
    return {"url": local_url, "filename": filename}


@router.post("/signature")
async def get_upload_signature(
    folder: str = Form("community_posts"),
    current_user: User = Depends(get_current_user),
):
    """
    Generates pre-signed parameters for direct client Cloudinary upload.
    """
    timestamp = int(time.time())
    return {
        "timestamp": timestamp,
        "folder": f"presently/{folder}",
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
    }
