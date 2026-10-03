"""
SQLAlchemy Models for Phase 12 Resume Builder, Career Assistant & Skill Assessment
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .student import Base

class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    template = Column(String(32), default="TECHNICAL", nullable=False)  # CLASSIC, MODERN, TECHNICAL, MINIMAL, ACADEMIC
    target_role = Column(String(255), nullable=False)
    target_industry = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    status = Column(String(32), default="DRAFT", nullable=False)  # DRAFT, ACTIVE, ARCHIVED
    section_order = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("ResumeProfileModel", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    educations = relationship("ResumeEducationModel", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("ResumeSkillModel", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("ResumeProjectModel", back_populates="resume", cascade="all, delete-orphan")
    experiences = relationship("ResumeExperienceModel", back_populates="resume", cascade="all, delete-orphan")
    certifications = relationship("ResumeCertificationModel", back_populates="resume", cascade="all, delete-orphan")
    achievements = relationship("ResumeAchievementModel", back_populates="resume", cascade="all, delete-orphan")
    versions = relationship("ResumeVersionModel", back_populates="resume", cascade="all, delete-orphan")


class ResumeProfileModel(Base):
    __tablename__ = "resume_profiles"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(64), nullable=True)
    location = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    headline = Column(String(255), nullable=True)

    resume = relationship("ResumeModel", back_populates="profile")


class ResumeEducationModel(Base):
    __tablename__ = "resume_education"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    field_of_study = Column(String(255), nullable=False)
    start_date = Column(String(32), nullable=False)
    end_date = Column(String(32), nullable=False)
    grade = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    resume = relationship("ResumeModel", back_populates="educations")


class ResumeSkillModel(Base):
    __tablename__ = "resume_skills"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    skill = Column(String(128), nullable=False)
    category = Column(String(64), default="PROGRAMMING", nullable=False)
    proficiency = Column(String(32), default="INTERMEDIATE", nullable=False)
    source = Column(String(64), default="STUDENT_ENTERED", nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    resume = relationship("ResumeModel", back_populates="skills")


class ResumeProjectModel(Base):
    __tablename__ = "resume_projects"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    project_id = Column(String(64), nullable=True)
    title = Column(String(255), nullable=False)
    description_override = Column(Text, nullable=True)
    highlighted_features = Column(JSON, default=list, nullable=False)
    technologies = Column(JSON, default=list, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    resume = relationship("ResumeModel", back_populates="projects")


class ResumeExperienceModel(Base):
    __tablename__ = "resume_experience"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    organization = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(String(32), nullable=False)
    end_date = Column(String(32), nullable=False)
    description = Column(Text, nullable=True)
    achievements = Column(JSON, default=list, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    resume = relationship("ResumeModel", back_populates="experiences")


class ResumeCertificationModel(Base):
    __tablename__ = "resume_certifications"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(String(32), nullable=False)
    credential_id = Column(String(255), nullable=True)
    credential_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    resume = relationship("ResumeModel", back_populates="certifications")


class ResumeAchievementModel(Base):
    __tablename__ = "resume_achievements"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String(32), nullable=True)
    source = Column(String(64), default="STUDENT_ENTERED", nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    resume = relationship("ResumeModel", back_populates="achievements")


class ResumeVersionModel(Base):
    __tablename__ = "resume_versions"

    id = Column(String(64), primary_key=True, index=True)
    resume_id = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    version_number = Column(Integer, nullable=False)
    content_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    created_by = Column(String(128), default="Student", nullable=False)

    resume = relationship("ResumeModel", back_populates="versions")


class JobDescriptionModel(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SkillModel(Base):
    __tablename__ = "skills"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    category = Column(String(64), index=True, nullable=False)
    description = Column(Text, nullable=False)
    parent_skill_id = Column(String(64), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class StudentSkillModel(Base):
    __tablename__ = "student_skills"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id = Column(String(64), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    source = Column(String(64), default="STUDENT_DECLARED", nullable=False)
    evidence_count = Column(Integer, default=0, nullable=False)
    proficiency = Column(String(32), default="INTERMEDIATE", nullable=False)
    confidence = Column(String(32), default="LIMITED_EVIDENCE", nullable=False)  # VERIFIED, STRONG_EVIDENCE, etc.
    last_updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    evidence = relationship("SkillEvidenceModel", back_populates="student_skill", cascade="all, delete-orphan")


class SkillEvidenceModel(Base):
    __tablename__ = "skill_evidence"

    id = Column(String(64), primary_key=True, index=True)
    student_skill_id = Column(String(64), ForeignKey("student_skills.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id = Column(String(64), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    source_type = Column(String(64), nullable=False)  # COURSE, QUIZ, DSA, CODING, PROJECT, CERTIFICATION, ASSESSMENT
    source_id = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    student_skill = relationship("StudentSkillModel", back_populates="evidence")


class SkillAssessmentModel(Base):
    __tablename__ = "skill_assessments"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    skill_id = Column(String(64), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    difficulty = Column(String(32), default="INTERMEDIATE", nullable=False)
    question_count = Column(Integer, default=5, nullable=False)
    status = Column(String(32), default="NOT_STARTED", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    score = Column(Float, nullable=True)
    quiz_id = Column(String(64), nullable=True)
    quiz_attempt_id = Column(String(64), nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)


class CareerRoadmapModel(Base):
    __tablename__ = "career_roadmaps"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    role_id = Column(String(64), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(32), default="IN_PROGRESS", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    steps = relationship("CareerRoadmapStepModel", back_populates="roadmap", cascade="all, delete-orphan")


class CareerRoadmapStepModel(Base):
    __tablename__ = "career_roadmap_steps"

    id = Column(String(64), primary_key=True, index=True)
    roadmap_id = Column(String(64), ForeignKey("career_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    status = Column(String(32), default="NOT_STARTED", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    estimated_effort = Column(String(64), nullable=False)
    source_type = Column(String(64), nullable=False)  # COURSE, DSA, CODING, QUIZ, PROJECT, NOTES, PLACEMENT
    source_id = Column(String(64), nullable=True)
    url = Column(String(500), nullable=True)

    roadmap = relationship("CareerRoadmapModel", back_populates="steps")
