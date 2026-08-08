import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    Numeric,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship as rel
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False, index=True)
    birth_date = Column(Date, nullable=True, index=True)
    gender = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    surveys = rel("Survey", back_populates="recipient")


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("recipients.id", ondelete="SET NULL"), nullable=True, index=True)
    occasion = Column(String(100), nullable=False, index=True)
    min_budget = Column(Numeric(10, 2), nullable=False, default=0.0)
    max_budget = Column(Numeric(10, 2), nullable=False, default=100.0)
    status = Column(String(50), nullable=False, default="draft", index=True)  # draft | submitted | archived
    current_step = Column(Integer, nullable=False, default=1)
    survey_payload = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    recipient = rel("Recipient", back_populates="surveys")
    answers = rel("SurveyAnswer", back_populates="survey", cascade="all, delete-orphan")
    recommendation = rel("AIRecommendation", back_populates="survey", uselist=False, cascade="all, delete-orphan")


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    input_type = Column(String(50), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    display_order = Column(Integer, nullable=False, default=0)


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = Column(UUID(as_uuid=True), ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("survey_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_value = Column(JSON, nullable=False)

    survey = rel("Survey", back_populates="answers")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = Column(UUID(as_uuid=True), ForeignKey("surveys.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    recipient_name = Column(String(255), nullable=True)
    occasion = Column(String(100), nullable=True)
    ai_model_used = Column(String(50), nullable=False, default="gpt-4o")
    prompt_tokens = Column(Integer, nullable=False, default=0)
    completion_tokens = Column(Integer, nullable=False, default=0)
    execution_time_ms = Column(Integer, nullable=False, default=0)
    is_favorite = Column(Boolean, nullable=False, default=False, index=True)
    share_token = Column(String(100), nullable=True, unique=True, index=True)
    summary = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    survey = rel("Survey", back_populates="recommendation")
    items = rel("AIRecommendationItem", back_populates="recommendation", cascade="all, delete-orphan")


class AIRecommendationItem(Base):
    __tablename__ = "ai_recommendation_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recommendation_id = Column(UUID(as_uuid=True), ForeignKey("ai_recommendations.id", ondelete="CASCADE"), nullable=False, index=True)
    gift_item_id = Column(UUID(as_uuid=True), ForeignKey("gift_items.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="Gift Idea")
    category = Column(String(100), nullable=False, default="General")
    estimated_price = Column(Numeric(10, 2), nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    match_score = Column(Integer, nullable=False, default=90)
    strategy_label = Column(String(100), nullable=False, default="Top Pick")
    ai_reasoning = Column(Text, nullable=False)
    pros = Column(JSON, nullable=True)
    cons = Column(JSON, nullable=True)
    personalization_tips = Column(Text, nullable=True)
    buy_url = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    is_fallback = Column(Boolean, nullable=False, default=False)

    recommendation = rel("AIRecommendation", back_populates="items")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Gift Assistance Chat")
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    messages = rel("AIMessage", back_populates="conversation", cascade="all, delete-orphan")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    conversation = rel("AIConversation", back_populates="messages")
