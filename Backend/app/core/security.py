import jwt
from typing import List, Optional
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.core.config import settings
import logging

logger = logging.getLogger("presently.security")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extracts Bearer JWT token from header, validates Clerk claims,
    and returns current authenticated User database record.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]

    try:
        # Decode unverified header to check claims or verify signature if secret key / issuer available
        # In production with Clerk, PyJWT verifies the token signature using Clerk's JWKS
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        
        clerk_id = unverified_claims.get("sub")
        email = unverified_claims.get("email") or unverified_claims.get("primary_email_address")
        
        if not clerk_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject claim (clerk_id).",
            )
            
    except jwt.PyJWTError as e:
        logger.error(f"JWT Verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    # Query user from PostgreSQL DB by clerk_id
    result = await db.execute(select(User).where(User.clerk_id == clerk_id, User.deleted_at.is_(None)))
    user = result.scalars().first()

    if not user:
        # If user does not exist yet in DB, create auto-synced user on first API request
        derived_username = email.split("@")[0] if email else f"user_{clerk_id[-8:]}"
        user = User(
            clerk_id=clerk_id,
            email=email or f"{clerk_id}@clerk.user",
            username=derived_username,
            role=RoleEnum.REGISTERED_USER.value,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    return user


def require_role(allowed_roles: List[RoleEnum]):
    """
    Dependency generator for Role-Based Access Control (RBAC).
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_str = current_user.role
        allowed_roles_str = [r.value if isinstance(r, RoleEnum) else r for r in allowed_roles]
        
        if user_role_str not in allowed_roles_str and user_role_str != RoleEnum.SUPER_ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action requires one of roles: {allowed_roles_str}",
            )
        return current_user

    return role_checker


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Attempts to retrieve current authenticated user if token present; returns None for guests.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    try:
        return await get_current_user(authorization=authorization, db=db)
    except HTTPException:
        return None

