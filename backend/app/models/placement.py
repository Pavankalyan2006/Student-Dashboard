"""
SQLAlchemy Models for Phase 11 Placement Preparation & AI Mock Interview System
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .student import Base

class PlacementTopicModel(Base):
    __tablename__ = "placement_topics"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(64), index=True, nullable=False)  # APTITUDE, LOGICAL_REASONING, VERBAL, PROGRAMMING, DSA, DBMS, SQL, etc.
    description = Column(Text, nullable=False)
    difficulty = Column(String(32), index=True, nullable=False)  # BEGINNER, EASY, MEDIUM, HARD, ADVANCED
    order_index = Column(Integer, default=0, index=True, nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    concepts = Column(JSON, default=list, nullable=False)
    common_questions = Column(JSON, default=list, nullable=False)
    recommended_resources = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    questions = relationship("PlacementQuestionModel", back_populates="topic", cascade="all, delete-orphan")


class PlacementQuestionModel(Base):
    __tablename__ = "placement_questions"

    id = Column(String(64), primary_key=True, index=True)
    topic_id = Column(String(64), ForeignKey("placement_topics.id", ondelete="CASCADE"), index=True, nullable=False)
    category = Column(String(64), index=True, nullable=False)
    question_type = Column(String(32), nullable=False)  # MULTIPLE_CHOICE, NUMERICAL, TEXT, CODE, SQL
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(32), index=True, nullable=False)
    question_metadata = Column("metadata", JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    topic = relationship("PlacementTopicModel", back_populates="questions")


class PlacementCompanyModel(Base):
    __tablename__ = "placement_companies"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    website = Column(String(500), nullable=False)
    logo_url = Column(String(500), nullable=True)
    company_metadata = Column("metadata", JSON, default=dict, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profiles = relationship("CompanyPreparationProfileModel", back_populates="company", cascade="all, delete-orphan")


class PlacementRoleModel(Base):
    __tablename__ = "placement_roles"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    skill_requirements = Column(JSON, default=list, nullable=False)
    technical_topics = Column(JSON, default=list, nullable=False)
    recommended_projects = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class CompanyPreparationProfileModel(Base):
    __tablename__ = "company_preparation_profiles"

    id = Column(String(64), primary_key=True, index=True)
    company_id = Column(String(64), ForeignKey("placement_companies.id", ondelete="CASCADE"), index=True, nullable=False)
    role_id = Column(String(64), ForeignKey("placement_roles.id", ondelete="SET NULL"), index=True, nullable=True)
    overview = Column(Text, nullable=False)
    reported_rounds = Column(JSON, default=list, nullable=False)
    topics = Column(JSON, default=list, nullable=False)
    coding_topics = Column(JSON, default=list, nullable=False)
    technical_topics = Column(JSON, default=list, nullable=False)
    hr_topics = Column(JSON, default=list, nullable=False)
    source_metadata = Column(JSON, default=dict, nullable=False)
    last_verified_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    company = relationship("PlacementCompanyModel", back_populates="profiles")


class PlacementPlanModel(Base):
    __tablename__ = "placement_plans"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    target_role_id = Column(String(64), ForeignKey("placement_roles.id", ondelete="CASCADE"), index=True, nullable=False)
    target_company_id = Column(String(64), ForeignKey("placement_companies.id", ondelete="SET NULL"), index=True, nullable=True)
    duration_weeks = Column(Integer, default=4, nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    target_date = Column(DateTime, nullable=False)
    status = Column(String(32), default="ACTIVE", index=True, nullable=False)  # ACTIVE, COMPLETED, PAUSED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tasks = relationship("PlacementPlanTaskModel", back_populates="plan", cascade="all, delete-orphan")


class PlacementPlanTaskModel(Base):
    __tablename__ = "placement_plan_tasks"

    id = Column(String(64), primary_key=True, index=True)
    plan_id = Column(String(64), ForeignKey("placement_plans.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), index=True, nullable=False)
    scheduled_week = Column(Integer, default=1, index=True, nullable=False)
    scheduled_date = Column(String(32), nullable=False)
    status = Column(String(32), default="PENDING", index=True, nullable=False)  # PENDING, IN_PROGRESS, COMPLETED
    source_type = Column(String(32), nullable=False)  # TOPIC, QUIZ, CODING, DSA, MOCK_INTERVIEW, PROJECT, COURSE
    source_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    plan = relationship("PlacementPlanModel", back_populates="tasks")


class MockInterviewSessionModel(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    interview_type = Column(String(32), index=True, nullable=False)  # TECHNICAL, CODING, HR, BEHAVIORAL, PROJECT, MIXED
    role_id = Column(String(64), ForeignKey("placement_roles.id", ondelete="SET NULL"), index=True, nullable=True)
    company_id = Column(String(64), ForeignKey("placement_companies.id", ondelete="SET NULL"), index=True, nullable=True)
    project_id = Column(String(64), index=True, nullable=True)
    difficulty = Column(String(32), default="MEDIUM", nullable=False)
    mode = Column(String(32), default="SIMULATION", nullable=False)  # PRACTICE, SIMULATION
    duration_minutes = Column(Integer, default=30, nullable=False)
    status = Column(String(32), default="READY", index=True, nullable=False)  # READY, IN_PROGRESS, COMPLETED, ABANDONED
    current_question_index = Column(Integer, default=1, nullable=False)
    max_questions = Column(Integer, default=5, nullable=False)
    overall_score = Column(Integer, nullable=True)
    feedback_summary = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationships
    questions = relationship("MockInterviewQuestionModel", back_populates="session", cascade="all, delete-orphan")
    answers = relationship("MockInterviewAnswerModel", back_populates="session", cascade="all, delete-orphan")


class MockInterviewQuestionModel(Base):
    __tablename__ = "mock_interview_questions"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("mock_interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    question_number = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String(32), nullable=False)  # TECHNICAL, CODING, HR, BEHAVIORAL, PROJECT, CONCEPTUAL
    topic = Column(String(128), nullable=False)
    difficulty = Column(String(32), default="MEDIUM", nullable=False)
    expected_concepts = Column(JSON, default=list, nullable=False)
    follow_up_to = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("MockInterviewSessionModel", back_populates="questions")


class MockInterviewAnswerModel(Base):
    __tablename__ = "mock_interview_answers"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("mock_interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id = Column(String(64), ForeignKey("mock_interview_questions.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    answer_text = Column(Text, nullable=False)
    duration_seconds = Column(Integer, default=60, nullable=False)
    evaluation = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("MockInterviewSessionModel", back_populates="answers")
