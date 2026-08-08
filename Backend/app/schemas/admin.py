from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AdminDashboardOverviewResponse(BaseModel):
    total_users: int
    active_users: int
    total_gifts: int
    published_posts: int
    pending_reports: int
    ai_recommendations_count: int
    saved_gifts_count: int
    upcoming_gift_plans_count: int
    unread_notifications_count: int
    recent_activity: List[Dict[str, Any]]


class AdminUserRoleUpdate(BaseModel):
    role: str


class AdminUserSuspendRequest(BaseModel):
    reason: Optional[str] = None


class AdminTagMergeRequest(BaseModel):
    source_tag_id: str
    target_tag_id: str


class AdminReportResolveRequest(BaseModel):
    action: str  # "actioned" | "dismissed"
    moderation_note: Optional[str] = None
    hide_content: Optional[bool] = False
    suspend_user: Optional[bool] = False


class AdminActivityLogResponse(BaseModel):
    id: str
    admin_user_id: Optional[str] = None
    action: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
