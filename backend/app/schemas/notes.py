"""
Pydantic Schemas for AI Notes Generator & Learning Materials (Phase 5)
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

NoteSourceType = Literal['topic', 'course', 'lesson', 'selected_content', 'document']
NoteType = Literal['STUDY_NOTES', 'EXAM_NOTES', 'QUICK_REVISION', 'INTERVIEW_NOTES', 'DETAILED_NOTES']
StudentLevel = Literal['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
NoteLength = Literal['SHORT', 'MEDIUM', 'DETAILED']

class NoteSectionSchema(BaseModel):
    id: str
    title: str
    content: str
    order_index: int
    section_type: Optional[str] = 'concept'

class WorkedExampleSchema(BaseModel):
    title: str
    explanation: str
    code: Optional[str] = None
    language: Optional[str] = 'cpp'

class InterviewQASchema(BaseModel):
    question: str
    answer: str
    difficulty: Optional[str] = 'medium'

class FormulaItemSchema(BaseModel):
    name: str
    latex: str
    explanation: str

class StructuredNoteContentSchema(BaseModel):
    title: str
    overview: str
    learning_objectives: List[str] = []
    sections: List[NoteSectionSchema] = []
    examples: List[WorkedExampleSchema] = []
    key_points: List[str] = []
    common_mistakes: List[str] = []
    exam_points: List[str] = []
    interview_questions: List[InterviewQASchema] = []
    summary: str
    practice_questions: List[str] = []
    formulas: List[FormulaItemSchema] = []

class NoteGenerateRequest(BaseModel):
    source_type: NoteSourceType = 'topic'
    topic: Optional[str] = None
    course_id: Optional[str] = None
    chapter_id: Optional[str] = None
    lesson_id: Optional[str] = None
    document_id: Optional[str] = None
    selected_content: Optional[str] = None
    level: StudentLevel = 'INTERMEDIATE'
    note_type: NoteType = 'STUDY_NOTES'
    length: NoteLength = 'MEDIUM'
    tags: List[str] = []

class NoteUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    structured_data: Optional[StructuredNoteContentSchema] = None
    change_summary: Optional[str] = 'User edits'

class FlashcardItemSchema(BaseModel):
    id: str
    question: str
    answer: str
    concept: str
    difficulty: Optional[str] = 'medium'

class QuizQuestionItemSchema(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str
    topic: Optional[str] = None

class NoteCardResponse(BaseModel):
    id: str
    student_id: str
    title: str
    description: str
    source_type: NoteSourceType
    source_id: Optional[str] = None
    source_title: Optional[str] = None
    note_type: NoteType
    level: StudentLevel
    tags: List[str] = []
    is_favorite: bool = False
    content_preview: str
    reading_time_minutes: int
    created_at: str
    updated_at: str

class NoteDetailResponse(BaseModel):
    id: str
    student_id: str
    title: str
    description: str
    source_type: NoteSourceType
    source_id: Optional[str] = None
    source_title: Optional[str] = None
    chapter_id: Optional[str] = None
    lesson_id: Optional[str] = None
    note_type: NoteType
    level: StudentLevel
    length: NoteLength
    content: str
    structured_data: Optional[StructuredNoteContentSchema] = None
    tags: List[str] = []
    is_favorite: bool = False
    version: int = 1
    created_at: str
    updated_at: str
