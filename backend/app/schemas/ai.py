"""
Pydantic Schemas for AI Learning Agent & Conversations (Phase 3)
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class ToolParameterSchema(BaseModel):
    type: str
    description: str
    required: bool = False

class ToolDefinitionSchema(BaseModel):
    name: str
    description: str
    parameters: Dict[str, ToolParameterSchema]
    permissions: List[str]
    timeoutMs: int = 5000
    confirmationRequired: bool = False
    category: str = "READ_ONLY"

class ToolExecutionSummary(BaseModel):
    id: str
    tool_name: str
    status: str
    parameters: Dict[str, Any]
    result: Optional[Any] = None

class AgentPlanItem(BaseModel):
    step: int
    title: str
    description: str
    status: str

class AICitationItem(BaseModel):
    id: str
    title: str
    source: str
    page: Optional[int] = None
    link: Optional[str] = None

class AIAttachmentItem(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    url: Optional[str] = None

class AIMessageMetadata(BaseModel):
    toolCalls: Optional[List[ToolExecutionSummary]] = None
    agentPlan: Optional[List[AgentPlanItem]] = None
    suggestedActions: Optional[List[str]] = None
    citations: Optional[List[AICitationItem]] = None
    attachments: Optional[List[AIAttachmentItem]] = None
    feedback: Optional[Dict[str, Any]] = None

class AIMessageSchema(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str
    metadata: Optional[AIMessageMetadata] = None

class AIConversationSchema(BaseModel):
    id: str
    student_id: str
    title: str
    created_at: str
    updated_at: str
    is_archived: bool = False
    is_pinned: bool = False
    message_count: int = 0

class ConversationDetailResponse(BaseModel):
    conversation: AIConversationSchema
    messages: List[AIMessageSchema] = []

class StudentLearningContext(BaseModel):
    student: Dict[str, Any]
    current_course: Dict[str, Any]
    current_lesson: Dict[str, Any]
    current_project: Dict[str, Any]
    recent_topics: List[str] = []
    weak_areas: List[str] = []
    suggested_actions: List[str] = []

class MessageFeedbackRequest(BaseModel):
    is_helpful: bool
    reason: Optional[str] = None
