export interface AIConversation {
  id: string;
  student_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  message_count?: number;
}

export interface ToolExecutionSummary {
  id: string;
  tool_name: string;
  status: 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result?: any;
}

export interface AgentPlanItem {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface AICitationItem {
  id: string;
  title: string;
  source: string;
  page?: number | string;
  link?: string;
}

export interface AIAttachmentItem {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  url?: string;
}

export interface AIMessageMetadata {
  toolCalls?: ToolExecutionSummary[];
  agentPlan?: AgentPlanItem[];
  suggestedActions?: string[];
  citations?: AICitationItem[];
  attachments?: AIAttachmentItem[];
  feedback?: {
    is_helpful: boolean;
    reason?: string;
  };
}

export interface AIMessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: AIMessageMetadata;
}

export interface StudentLearningContext {
  student: {
    id: string;
    name: string;
    email: string;
    branch: string;
    semester: number;
  };
  current_course: {
    name: string;
    code: string;
    progress: number;
  };
  current_lesson: {
    title: string;
    topic: string;
    progress: number;
  };
  current_project: {
    title: string;
    progress: number;
    milestone: string;
  };
  recent_topics: string[];
  weak_areas: string[];
  suggested_actions: string[];
}
