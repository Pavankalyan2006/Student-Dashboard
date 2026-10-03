"""
SQLAlchemy Models for Phase 7 Coding Lab Module
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .student import Base

class CodingProblemModel(Base):
    __tablename__ = "coding_problems"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(32), index=True, nullable=False)  # BEGINNER, EASY, MEDIUM, HARD, ADVANCED
    topic = Column(String(100), index=True, nullable=False)
    constraints = Column(JSON, default=list, nullable=False)
    input_format = Column(Text, nullable=False)
    output_format = Column(Text, nullable=False)
    examples = Column(JSON, default=list, nullable=False)
    starter_code = Column(JSON, default=dict, nullable=False)
    supported_languages = Column(JSON, default=list, nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    hints = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    test_cases = relationship("CodingTestCaseModel", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("CodeSubmissionModel", back_populates="problem", cascade="all, delete-orphan")


class CodingTestCaseModel(Base):
    __tablename__ = "coding_test_cases"

    id = Column(String(64), primary_key=True, index=True)
    problem_id = Column(String(64), ForeignKey("coding_problems.id", ondelete="CASCADE"), index=True, nullable=False)
    input = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    problem = relationship("CodingProblemModel", back_populates="test_cases")


class CodingSessionModel(Base):
    __tablename__ = "coding_sessions"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    language = Column(String(32), nullable=False)
    source_code = Column(Text, nullable=False)
    stdin = Column(Text, default="", nullable=False)
    problem_id = Column(String(64), ForeignKey("coding_problems.id", ondelete="SET NULL"), index=True, nullable=True)
    status = Column(String(32), default="active", nullable=False)
    last_execution_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SavedCodeModel(Base):
    __tablename__ = "saved_code"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    language = Column(String(32), nullable=False)
    source_code = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_opened_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class CodeExecutionModel(Base):
    __tablename__ = "code_executions"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    session_id = Column(String(64), ForeignKey("coding_sessions.id", ondelete="SET NULL"), index=True, nullable=True)
    problem_id = Column(String(64), ForeignKey("coding_problems.id", ondelete="SET NULL"), index=True, nullable=True)
    language = Column(String(32), nullable=False)
    source_code_snapshot = Column(Text, nullable=False)
    stdin = Column(Text, default="", nullable=False)
    status = Column(String(32), index=True, nullable=False)  # QUEUED, RUNNING, SUCCESS, COMPILATION_ERROR, etc.
    stdout = Column(Text, default="", nullable=False)
    stderr = Column(Text, default="", nullable=False)
    exit_code = Column(Integer, default=0, nullable=False)
    execution_time_ms = Column(Integer, default=0, nullable=False)
    memory_kb = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)


class CodeSubmissionModel(Base):
    __tablename__ = "code_submissions"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    problem_id = Column(String(64), ForeignKey("coding_problems.id", ondelete="CASCADE"), index=True, nullable=False)
    language = Column(String(32), nullable=False)
    source_code = Column(Text, nullable=False)
    status = Column(String(32), index=True, nullable=False)  # ACCEPTED, WRONG_ANSWER, etc.
    passed_tests = Column(Integer, default=0, nullable=False)
    total_tests = Column(Integer, default=0, nullable=False)
    execution_time_ms = Column(Integer, default=0, nullable=False)
    test_results = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationships
    problem = relationship("CodingProblemModel", back_populates="submissions")
