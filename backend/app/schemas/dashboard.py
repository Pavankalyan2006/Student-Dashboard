"""
Pydantic Schemas for B.Tech Student Dashboard (Phase 2)
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class DashboardStudent(BaseModel):
    id: str
    name: str
    email: str
    branch: str
    semester: int
    role: str
    avatar_url: Optional[str] = None
    learning_streak: int = 7
    focus_topic: str

class DashboardSummary(BaseModel):
    overall_progress: int = Field(ge=0, le=100)
    streak_days: int = 7
    longest_streak: int = 14
    courses_active: int = 4
    projects_active: int = 2
    dsa_solved: int = 142
    study_hours_this_week: float = 22.5
    credits_completed: int = 98
    total_credits: int = 160

class ContinueLearning(BaseModel):
    course_id: str
    course_name: str
    lesson_id: str
    lesson_title: str
    progress: int = Field(ge=0, le=100)
    next_topic: str
    category: str
    total_lessons: int
    completed_lessons: int

class TodayPlanItem(BaseModel):
    id: str
    title: str
    type: str
    estimated_time: str
    is_completed: bool
    action_url: str

class CourseProgressItem(BaseModel):
    id: str
    name: str
    code: str
    progress: int = Field(ge=0, le=100)
    completed_lessons: int
    total_lessons: int
    last_accessed: str
    category: str
    color: Optional[str] = "#2563EB"

class LearningRecommendation(BaseModel):
    id: str
    title: str
    type: str
    reason: str
    difficulty: str
    estimated_time: str
    action_url: str

class SkillArea(BaseModel):
    topic: str
    score: int
    subject: str
    recommendation: Optional[str] = None
    action_url: Optional[str] = None

class RecentActivityItem(BaseModel):
    id: str
    title: str
    type: str
    timestamp: str
    formatted_time: str
    link: str
    status: str

class ProjectSummary(BaseModel):
    id: str
    title: str
    progress: int = Field(ge=0, le=100)
    current_milestone: str
    next_step: str
    tech_stack: List[str]
    link: str

class UpcomingCalendarItem(BaseModel):
    id: str
    title: str
    type: str
    date: str
    time: str
    status: str
    link: str

class RecentBookmarkItem(BaseModel):
    id: str
    title: str
    type: str
    link: str
    created_at: str

class WeeklyStudyData(BaseModel):
    day: str
    minutes: int
    problems_solved: int

class CategoryDistribution(BaseModel):
    category: str
    progress: int

class LearningAnalytics(BaseModel):
    weekly_study_minutes: List[WeeklyStudyData]
    category_distribution: List[CategoryDistribution]

class DashboardResponse(BaseModel):
    student: DashboardStudent
    summary: DashboardSummary
    continue_learning: Optional[ContinueLearning] = None
    today_plan: List[TodayPlanItem] = []
    course_progress: List[CourseProgressItem] = []
    recommendations: List[LearningRecommendation] = []
    weak_areas: List[SkillArea] = []
    strengths: List[SkillArea] = []
    recent_activity: List[RecentActivityItem] = []
    projects: List[ProjectSummary] = []
    upcoming_items: List[UpcomingCalendarItem] = []
    bookmarks: List[RecentBookmarkItem] = []
    analytics: LearningAnalytics
    is_new_student: bool = False
