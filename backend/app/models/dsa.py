"""
SQLAlchemy Models for Phase 8 DSA Lab & Algorithm Visualization
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .student import Base

class DSATopicModel(Base):
    __tablename__ = "dsa_topics"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(32), index=True, nullable=False)  # DATA_STRUCTURE, ALGORITHM, TECHNIQUE
    description = Column(Text, nullable=False)
    difficulty = Column(String(32), index=True, nullable=False)  # BEGINNER, EASY, MEDIUM, HARD, ADVANCED
    order_index = Column(Integer, default=0, index=True, nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)
    icon = Column(String(64), nullable=True)
    concepts = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    algorithms = relationship("AlgorithmModel", back_populates="topic", cascade="all, delete-orphan")
    problems = relationship("DSAProblemModel", back_populates="topic", cascade="all, delete-orphan")


class AlgorithmModel(Base):
    __tablename__ = "dsa_algorithms"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    topic_id = Column(String(64), ForeignKey("dsa_topics.id", ondelete="CASCADE"), index=True, nullable=False)
    description = Column(Text, nullable=False)
    concept = Column(Text, nullable=False)
    pseudocode = Column(JSON, default=list, nullable=False)
    time_complexity = Column(String(64), nullable=False)
    space_complexity = Column(String(64), nullable=False)
    best_case = Column(String(64), nullable=False)
    average_case = Column(String(64), nullable=False)
    worst_case = Column(String(64), nullable=False)
    stable = Column(Boolean, default=False, nullable=False)
    in_place = Column(Boolean, default=True, nullable=False)
    visualization_type = Column(String(32), nullable=False)
    supported_languages = Column(JSON, default=list, nullable=False)
    default_input = Column(JSON, nullable=True)
    comparison_tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    topic = relationship("DSATopicModel", back_populates="algorithms")
    problems = relationship("DSAProblemModel", back_populates="algorithm")


class DSAProblemModel(Base):
    __tablename__ = "dsa_problems"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    topic_id = Column(String(64), ForeignKey("dsa_topics.id", ondelete="CASCADE"), index=True, nullable=False)
    algorithm_id = Column(String(64), ForeignKey("dsa_algorithms.id", ondelete="SET NULL"), index=True, nullable=True)
    difficulty = Column(String(32), index=True, nullable=False)
    constraints = Column(JSON, default=list, nullable=False)
    input_format = Column(Text, nullable=False)
    output_format = Column(Text, nullable=False)
    examples = Column(JSON, default=list, nullable=False)
    starter_code = Column(JSON, default=dict, nullable=False)
    hints = Column(JSON, default=list, nullable=False)
    solution_explanation = Column(Text, nullable=True)
    supported_languages = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    topic = relationship("DSATopicModel", back_populates="problems")
    algorithm = relationship("AlgorithmModel", back_populates="problems")


class DSAProgressModel(Base):
    __tablename__ = "dsa_progress"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    topics_viewed = Column(JSON, default=list, nullable=False)
    algorithms_viewed = Column(JSON, default=list, nullable=False)
    visualizations_completed = Column(JSON, default=list, nullable=False)
    problems_attempted = Column(JSON, default=list, nullable=False)
    problems_solved = Column(JSON, default=list, nullable=False)
    hints_used = Column(Integer, default=0, nullable=False)
    weak_topics = Column(JSON, default=list, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
