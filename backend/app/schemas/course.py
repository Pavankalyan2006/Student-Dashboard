"""
Pydantic Schemas for Courses & Learning Module (Phase 4)
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class CourseBase(BaseModel):
    id: str
    title: str
    slug: str
    code: str
    description: str
    short_description: str
    branch: str
    semester: int
    difficulty: str
    thumbnail: str
    estimated_minutes: int
    is_published: bool
    prerequisites: List[str] = []
    skills: List[str] = []

class CourseCardResponse(CourseBase):
    total_lessons: int
    completed_lessons: int = 0
    progress_percentage: int = 0
    is_enrolled: bool = False
    is_bookmarked: bool = False

class CourseLessonResponse(BaseModel):
    id: str
    chapter_id: str
    course_id: str
    title: str
    slug: str
    description: str
    content: str
    lesson_type: str
    order_index: int
    estimated_minutes: int
    is_published: bool
    is_completed: bool = False
    progress_percentage: int = 0

class CourseChapterResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: str
    order_index: int
    lessons: List[CourseLessonResponse] = []

class CourseDetailResponse(CourseBase):
    chapters: List[CourseChapterResponse] = []
    progress_percentage: int = 0
    completed_lessons: int = 0
    total_lessons: int = 0
    is_bookmarked: bool = False
    is_enrolled: bool = False

class LessonNavigationResponse(CourseLessonResponse):
    course_title: str
    course_code: str
    chapter_title: str
    prev_lesson: Optional[dict] = None
    next_lesson: Optional[dict] = None
