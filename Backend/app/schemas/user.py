from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")


class UserResponse(UserBase):
    id: UUID
    clerk_id: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Profile Schemas
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)
    preferred_currency: Optional[str] = Field(None, min_length=3, max_length=3)
    theme_preference: Optional[str] = Field(None, pattern=r"^(light|dark|system)$")


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    preferred_currency: str
    theme_preference: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# User Settings Schemas
class SettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    privacy_level: Optional[str] = Field(None, pattern=r"^(public|private|friends)$")


class SettingsResponse(BaseModel):
    id: UUID
    user_id: UUID
    email_notifications: bool
    marketing_emails: bool
    privacy_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Auth Sync Payload (from Clerk webhook or frontend initial sync)
class AuthSyncRequest(BaseModel):
    clerk_id: str
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
