"""
SQLAlchemy Models for Phase 6 Document AI Module
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .student import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_extension = Column(String(20), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_key = Column(String(255), nullable=False)
    status = Column(String(32), default="UPLOADING", index=True, nullable=False)
    page_count = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    author = Column(String(255), nullable=True)
    language = Column(String(20), default="en", nullable=False)
    doc_metadata = Column("metadata", JSON, default=dict, nullable=False)
    is_favorite = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_opened_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    processing_error = Column(Text, nullable=True)

    # Relationships
    pages = relationship("DocumentPageModel", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunkModel", back_populates="document", cascade="all, delete-orphan")
    summaries = relationship("DocumentSummaryModel", back_populates="document", cascade="all, delete-orphan")


class DocumentPageModel(Base):
    __tablename__ = "document_pages"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    page_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    page_metadata = Column("metadata", JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    document = relationship("DocumentModel", back_populates="pages")
    chunks = relationship("DocumentChunkModel", back_populates="page", cascade="all, delete-orphan")


class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    page_id = Column(String(64), ForeignKey("document_pages.id", ondelete="CASCADE"), index=True, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    chunk_metadata = Column("metadata", JSON, default=dict, nullable=False)
    embedding_reference = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    document = relationship("DocumentModel", back_populates="chunks")
    page = relationship("DocumentPageModel", back_populates="chunks")


class DocumentSummaryModel(Base):
    __tablename__ = "document_summaries"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    summary_level = Column(String(32), default="standard", nullable=False)
    title = Column(String(255), nullable=False)
    overview = Column(Text, nullable=False)
    main_topics = Column(JSON, default=list, nullable=False)
    key_concepts = Column(JSON, default=list, nullable=False)
    important_points = Column(JSON, default=list, nullable=False)
    summary = Column(Text, nullable=False)
    exam_points = Column(JSON, default=list, nullable=False)
    definitions = Column(JSON, default=list, nullable=False)
    formulas = Column(JSON, default=list, nullable=False)
    conclusion = Column(Text, nullable=False)
    page_range = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    document = relationship("DocumentModel", back_populates="summaries")
