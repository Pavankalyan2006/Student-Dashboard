"""
Pydantic Schemas for Phase 11 Placement Preparation & AI Mock Interview System
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class TopicConceptSchema(BaseModel):
    id: str
    title: str
    summary: str
    formula: Optional[str] = None
    example: Optional[str] = None
    key_takeaway: Optional[str] = None

class CommonInterviewQuestionSchema(BaseModel):
    id: str
    question: str
    answer_outline: str
    frequency: Optional[str] = None

class PlacementTopicResponse(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    description: str
    difficulty: str
    order_index: int
    prerequisites: List[str]
    is_active: bool
    concepts: List[TopicConceptSchema]
    common_questions: List[CommonInterviewQuestionSchema]
    recommended_resources: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlacementQuestionResponse(BaseModel):
    id: str
    topic_id: str
    category: str
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    difficulty: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlacementCompanyResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    website: str
    logo_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlacementRoleResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    skill_requirements: List[str]
    technical_topics: List[str]
    recommended_projects: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreatePlacementPlanRequest(BaseModel):
    target_role_id: str
    target_company_id: Optional[str] = None
    duration_weeks: Optional[int] = 4
    hours_per_day: Optional[int] = 2

class PlacementPlanTaskResponse(BaseModel):
    id: str
    plan_id: str
    student_id: str
    title: str
    description: str
    category: str
    scheduled_week: int
    scheduled_date: str
    status: str
    source_type: str
    source_id: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlacementPlanResponse(BaseModel):
    id: str
    student_id: str
    title: str
    target_role_id: str
    target_company_id: Optional[str] = None
    duration_weeks: int
    start_date: datetime
    target_date: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreateMockInterviewRequest(BaseModel):
    interview_type: str
    role_id: str
    company_id: Optional[str] = None
    project_id: Optional[str] = None
    difficulty: Optional[str] = "MEDIUM"
    mode: Optional[str] = "SIMULATION"
    duration_minutes: Optional[int] = 30
    max_questions: Optional[int] = 5
    focus_areas: Optional[List[str]] = None

class SubmitInterviewAnswerRequest(BaseModel):
    question_id: str
    answer_text: str
    duration_seconds: Optional[int] = 60

class AnswerEvaluationSchema(BaseModel):
    covered_concepts: List[str]
    missing_concepts: List[str]
    strengths: List[str]
    improvements: List[str]
    score: int
    clarity_feedback: Optional[str] = None
    follow_up_needed: bool
    suggested_follow_up: Optional[str] = None

class MockInterviewQuestionResponse(BaseModel):
    id: str
    session_id: str
    question_number: int
    question: str
    question_type: str
    topic: str
    difficulty: str
    expected_concepts: List[str]
    follow_up_to: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MockInterviewSessionResponse(BaseModel):
    id: str
    student_id: str
    interview_type: str
    role_id: Optional[str] = None
    company_id: Optional[str] = None
    project_id: Optional[str] = None
    difficulty: str
    mode: str
    duration_minutes: int
    status: str
    current_question_index: int
    max_questions: int
    overall_score: Optional[int] = None
    feedback_summary: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
