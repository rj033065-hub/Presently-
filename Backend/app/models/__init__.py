from app.db.session import Base
from app.models.user import User, UserProfile, UserSettings, Role, Permission, AuditLog, user_roles, role_permissions, RoleEnum
from app.models.gift import GiftCategory, GiftTag, GiftItem, GiftImage, GiftReview, gift_item_tags
from app.models.survey import Recipient, Survey, SurveyQuestion, SurveyAnswer, AIRecommendation, AIRecommendationItem, AIConversation, AIMessage
from app.models.wishlist import Wishlist, WishlistItem
from app.models.community import (
    CommunityPost,
    PostImage,
    Comment,
    PostLike,
    SavedPost,
    Report,
    CommunityCategory,
    CommunityTag,
    community_post_categories,
    community_post_tags,
)
from app.models.system import Notification, NotificationPreference, ReminderExecution, SearchHistory, SystemSetting

from app.models.planner import GiftPlan
from app.models.activity import UserActivity

__all__ = [
    "Base",
    "User",
    "UserProfile",
    "UserSettings",
    "Role",
    "Permission",
    "AuditLog",
    "user_roles",
    "role_permissions",
    "RoleEnum",
    "GiftCategory",
    "GiftTag",
    "GiftItem",
    "GiftImage",
    "GiftReview",
    "gift_item_tags",
    "Recipient",
    "Survey",
    "SurveyQuestion",
    "SurveyAnswer",
    "AIRecommendation",
    "AIRecommendationItem",
    "AIConversation",
    "AIMessage",
    "Wishlist",
    "WishlistItem",
    "GiftPlan",
    "UserActivity",
    "CommunityPost",
    "PostImage",
    "Comment",
    "PostLike",
    "SavedPost",
    "Report",
    "CommunityCategory",
    "CommunityTag",
    "community_post_categories",
    "community_post_tags",
    "Notification",
    "NotificationPreference",
    "ReminderExecution",
    "SearchHistory",
    "SystemSetting",
]


