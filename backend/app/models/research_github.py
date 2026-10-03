"""
SQLAlchemy Models for Phase 13 Research Assistant, GitHub Integration & Advanced AI Tools
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .student import Base

# ============================================================================
# Research Assistant Models
# ============================================================================

class ResearchProjectModel(Base):
    __tablename__ = "research_projects"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    domain = Column(String(128), nullable=False)
    branch = Column(String(128), nullable=False)
    research_type = Column(String(64), default="RESEARCH_PAPER", nullable=False)
    objective = Column(Text, nullable=False)
    research_question = Column(Text, nullable=True)
    status = Column(String(32), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    papers = relationship("ResearchPaperModel", back_populates="project", cascade="all, delete-orphan")
    questions = relationship("ResearchQuestionModel", back_populates="project", cascade="all, delete-orphan")
    gaps = relationship("ResearchGapModel", back_populates="project", cascade="all, delete-orphan")
    ideas = relationship("ResearchIdeaModel", back_populates="project", cascade="all, delete-orphan")
    methodology = relationship("ResearchMethodologyModel", back_populates="project", uselist=False, cascade="all, delete-orphan")
    citations = relationship("ResearchCitationModel", back_populates="project", cascade="all, delete-orphan")
    literature_review = relationship("LiteratureReviewModel", back_populates="project", uselist=False, cascade="all, delete-orphan")


class ResearchPaperModel(Base):
    __tablename__ = "research_papers"

    id = Column(String(64), primary_key=True, index=True)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    document_id = Column(String(64), nullable=True)
    title = Column(String(512), nullable=False)
    abstract = Column(Text, nullable=False)
    authors = Column(JSON, default=list, nullable=False)
    publication_year = Column(Integer, nullable=False)
    venue = Column(String(255), nullable=False)
    doi = Column(String(128), nullable=True)
    url = Column(String(512), nullable=True)
    provider = Column(String(64), default="MANUAL", nullable=False)
    external_id = Column(String(128), nullable=True)
    citation_count = Column(Integer, default=0, nullable=False)
    is_saved = Column(Boolean, default=True, nullable=False)
    metadata_ = Column("metadata", JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="papers")


class ResearchQuestionModel(Base):
    __tablename__ = "research_questions"

    id = Column(String(64), primary_key=True, index=True)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    question = Column(Text, nullable=False)
    category = Column(String(64), default="PRIMARY", nullable=False)
    status = Column(String(32), default="INVESTIGATING", nullable=False)
    evidence = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="questions")


class ResearchGapModel(Base):
    __tablename__ = "research_gaps"

    id = Column(String(64), primary_key=True, index=True)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), default="METHODOLOGY", nullable=False)
    evidence = Column(JSON, default=list, nullable=False)
    confidence_status = Column(String(32), default="MEDIUM", nullable=False)
    related_questions = Column(JSON, default=list, nullable=False)
    supporting_paper_ids = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="gaps")


class ResearchIdeaModel(Base):
    __tablename__ = "research_ideas"

    id = Column(String(64), primary_key=True, index=True)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    problem = Column(Text, nullable=False)
    motivation = Column(Text, nullable=False)
    proposed_approach = Column(Text, nullable=False)
    technologies = Column(JSON, default=list, nullable=False)
    dataset_possibilities = Column(Text, nullable=False)
    evaluation_approach = Column(Text, nullable=False)
    expected_contribution = Column(Text, nullable=False)
    related_paper_ids = Column(JSON, default=list, nullable=False)
    related_project_ids = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="ideas")


class ResearchMethodologyModel(Base):
    __tablename__ = "research_methodologies"

    id = Column(String(64), primary_key=True, index=True)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    system_architecture = Column(Text, nullable=False)
    experimental_design = Column(Text, nullable=False)
    dataset_plan = Column(Text, nullable=False)
    data_collection = Column(Text, nullable=False)
    preprocessing = Column(Text, nullable=False)
    model_selection = Column(Text, nullable=False)
    evaluation_metrics = Column(JSON, default=list, nullable=False)
    baseline_comparison = Column(Text, nullable=False)
    reproducibility_checklist = Column(JSON, default=list, nullable=False)
    is_proposed = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="methodology")


class ResearchCitationModel(Base):
    __tablename__ = "research_citations"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), index=True, nullable=True)
    paper_id = Column(String(64), nullable=True)
    source_type = Column(String(32), default="PAPER", nullable=False)
    citation_style = Column(String(32), default="APA", nullable=False)
    formatted_citation = Column(Text, nullable=False)
    bibtex = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="citations")


class LiteratureReviewModel(Base):
    __tablename__ = "literature_reviews"

    id = Column(String(64), primary_key=True, index=True)
    research_project_id = Column(String(64), ForeignKey("research_projects.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    organization_style = Column(String(32), default="thematic", nullable=False)
    outline = Column(JSON, default=list, nullable=False)
    sections = Column(JSON, default=list, nullable=False)
    synthesized_findings = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("ResearchProjectModel", back_populates="literature_review")


# ============================================================================
# GitHub Integration Models
# ============================================================================

class GitHubConnectionModel(Base):
    __tablename__ = "github_connections"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    github_user_id = Column(String(64), nullable=False)
    username = Column(String(128), nullable=False)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    encrypted_token = Column(Text, nullable=False)
    scopes = Column(JSON, default=list, nullable=False)
    is_connected = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class GitHubRepositoryModel(Base):
    __tablename__ = "github_repositories"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    github_connection_id = Column(String(64), nullable=False)
    external_repo_id = Column(String(64), nullable=False)
    owner = Column(String(128), nullable=False)
    name = Column(String(128), nullable=False)
    full_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    visibility = Column(String(32), default="PUBLIC", nullable=False)
    default_branch = Column(String(64), default="main", nullable=False)
    language = Column(String(64), default="TypeScript", nullable=False)
    stars = Column(Integer, default=0, nullable=False)
    forks = Column(Integer, default=0, nullable=False)
    open_issues_count = Column(Integer, default=0, nullable=False)
    url = Column(String(512), nullable=False)
    clone_url = Column(String(512), nullable=False)
    linked_project_id = Column(String(64), nullable=True)
    analysis_status = Column(String(32), default="NOT_ANALYZED", nullable=False)
    last_synced_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class GitHubRepositoryFileModel(Base):
    __tablename__ = "github_repository_files"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(String(64), ForeignKey("github_repositories.id", ondelete="CASCADE"), index=True, nullable=False)
    path = Column(String(512), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(32), default="file", nullable=False)
    size = Column(Integer, default=0, nullable=False)
    sha = Column(String(64), nullable=False)
    content = Column(Text, nullable=True)


class GitHubCommitModel(Base):
    __tablename__ = "github_commits"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(String(64), ForeignKey("github_repositories.id", ondelete="CASCADE"), index=True, nullable=False)
    hash = Column(String(64), nullable=False)
    message = Column(Text, nullable=False)
    author = Column(String(128), nullable=False)
    branch = Column(String(64), default="main", nullable=False)
    files_changed = Column(Integer, default=0, nullable=False)
    additions = Column(Integer, default=0, nullable=False)
    deletions = Column(Integer, default=0, nullable=False)
    committed_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class GitHubIssueModel(Base):
    __tablename__ = "github_issues"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(String(64), ForeignKey("github_repositories.id", ondelete="CASCADE"), index=True, nullable=False)
    number = Column(Integer, nullable=False)
    title = Column(String(512), nullable=False)
    body = Column(Text, nullable=True)
    status = Column(String(32), default="open", nullable=False)
    author = Column(String(128), nullable=False)
    labels = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class GitHubPullRequestModel(Base):
    __tablename__ = "github_pull_requests"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(String(64), ForeignKey("github_repositories.id", ondelete="CASCADE"), index=True, nullable=False)
    number = Column(Integer, nullable=False)
    title = Column(String(512), nullable=False)
    body = Column(Text, nullable=True)
    status = Column(String(32), default="open", nullable=False)
    author = Column(String(128), nullable=False)
    branch = Column(String(64), nullable=False)
    target_branch = Column(String(64), default="main", nullable=False)
    files_changed = Column(Integer, default=0, nullable=False)
    additions = Column(Integer, default=0, nullable=False)
    deletions = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class GitHubRepositoryAnalysisModel(Base):
    __tablename__ = "github_repository_analyses"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(String(64), ForeignKey("github_repositories.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    architecture_components = Column(JSON, default=list, nullable=False)
    technologies = Column(JSON, default=list, nullable=False)
    frameworks = Column(JSON, default=list, nullable=False)
    entry_points = Column(JSON, default=list, nullable=False)
    apis = Column(JSON, default=list, nullable=False)
    database_usage = Column(JSON, default=list, nullable=False)
    dependencies = Column(JSON, default=list, nullable=False)
    potential_security_concerns = Column(JSON, default=list, nullable=False)
    maintainability_observations = Column(JSON, default=list, nullable=False)
    observed_facts = Column(JSON, default=list, nullable=False)
    ai_suggestions = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
