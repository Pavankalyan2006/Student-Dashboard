import { UserRole } from '../../models/types';

export type AgentName =
  | 'LearningAgent'
  | 'CourseAgent'
  | 'NotesAgent'
  | 'DocumentRAGAgent'
  | 'CodingAgent'
  | 'DSAAgent'
  | 'QuizAgent'
  | 'ProjectAgent'
  | 'PlacementAgent'
  | 'InterviewAgent'
  | 'ResumeAgent'
  | 'CareerAgent'
  | 'SkillAgent'
  | 'ResearchAgent'
  | 'GitHubAgent'
  | 'CommunityAgent'
  | 'ProgressAgent'
  | 'StudyPlannerAgent'
  | 'RevisionAgent'
  | 'FlashcardAgent'
  | 'LabAssistantAgent'
  | 'VivaAgent'
  | 'ExamPreparationAgent'
  | 'DoubtSolverAgent'
  | 'DatabaseAgent'
  | 'SQLDatabaseAgent'
  | 'SystemDesignAgent'
  | 'MLExperimentAgent'
  | 'KnowledgeBaseAgent'
  | 'InternshipTrackerAgent'
  | 'ApplicationTrackerAgent'
  | 'RecommendationAgent'
  | 'ProfileAgent'
  | 'ExternalPlatformAgent'
  | 'ProfessionalProfileAgent'
  | 'CodingPlatformAgent'
  | 'JobPlatformAgent'
  | 'ExternalSkillEvidenceAgent';

export type AgentCategory =
  | 'CORE_LEARNING'
  | 'CODE_AND_ALGORITHMS'
  | 'ASSESSMENT_AND_EXAMS'
  | 'PROJECTS_AND_SYSTEMS'
  | 'CAREER_AND_PLACEMENTS'
  | 'RESEARCH_AND_INNOVATION'
  | 'STUDENT_CONTEXT_AND_PROGRESS';

export interface AgentDefinition {
  name: AgentName;
  version: string;
  category: AgentCategory;
  description: string;
  capabilities: string[];
  allowedTools: string[];
  permissions: UserRole[];
  timeoutMs: number;
  maxRetries: number;
  dependencies: AgentName[];
  enabled: boolean;
  modelTier: 'FAST' | 'ADVANCED' | 'CODE' | 'REASONING';
  supportedDomains?: string[];
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface AgentContext {
  student_id: string;
  role: UserRole;
  conversation_id: string;
  request_id: string;
  current_page?: string;
  current_course?: { id?: string; name: string; code: string; progress: number };
  current_lesson?: { id?: string; title: string; topic: string };
  current_project?: { id: string; title: string; repo?: string };
  current_research?: { id: string; title: string };
  selected_documents?: string[];
  selected_papers?: string[];
  selected_repository?: string;
  student_goals?: string[];
  student_progress?: Record<string, any>;
  student_preferences?: Record<string, any>;
  client_metadata?: Record<string, any>;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  agent: AgentName;
  action: string;
  params: Record<string, any>;
  dependencies: string[]; // Task IDs that must complete first
  status: TaskStatus;
  result?: AgentResult;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface AgentResult {
  agent: AgentName;
  status: 'success' | 'failure' | 'partial';
  summary: string;
  data: Record<string, any>;
  evidenceType: 'OBSERVED_DATA' | 'AI_RECOMMENDATION' | 'INFERENCE' | 'USER_PROVIDED';
  sources: SourceProvenance[];
  warnings?: string[];
  nextActions?: string[];
  toolCallsExecuted?: Array<{
    toolName: string;
    parameters: Record<string, any>;
    resultSummary: string;
  }>;
}

export interface SourceProvenance {
  sourceType:
    | 'STUDENT_DATABASE'
    | 'COURSE_DATABASE'
    | 'PROJECT_DATABASE'
    | 'GITHUB_API'
    | 'RESEARCH_PROVIDER'
    | 'DOCUMENT_RAG'
    | 'AI_INFERENCE';
  sourceId: string;
  title: string;
  location?: string;
  link?: string;
  page?: number | string;
  retrievedAt: string;
  confidence?: number;
}

export interface AgentMessage {
  taskId: string;
  fromAgent: AgentName | 'MasterAgent';
  toAgent: AgentName | 'MasterAgent';
  messageType: 'TASK_REQUEST' | 'RESULT' | 'ERROR' | 'CLARIFICATION';
  payload: Record<string, any>;
  sourceIds?: string[];
  timestamp: string;
}

export interface IntentClassification {
  intent: string;
  domains: string[];
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  targetAgents: AgentName[];
  requiresStudentContext: boolean;
  requiresTools: boolean;
  requiresConfirmation: boolean;
  confidence: number;
  clarificationPrompt?: string;
}

export interface TaskPlan {
  workflowId: string;
  intent: IntentClassification;
  tasks: AgentTask[];
  estimatedDurationMs: number;
}

export interface SynthesizedResponse {
  understanding: string;
  findings: string;
  plan: string;
  result: string;
  sources: SourceProvenance[];
  nextActions: string[];
  disclosures: string[];
  markdownContent: string;
}

export interface AgentWorkflowRecord {
  id: string;
  conversation_id: string;
  student_id: string;
  workflow_type: string;
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  agents_involved: AgentName[];
  tasks: Array<{
    id: string;
    agent: AgentName;
    title: string;
    status: TaskStatus;
    durationMs?: number;
    error?: string;
  }>;
  started_at: string;
  completed_at?: string;
  total_duration_ms?: number;
}

export interface AgentExecutionMetric {
  agentName: AgentName;
  version: string;
  enabled: boolean;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageDurationMs: number;
  toolCallsCount: number;
  lastExecutedAt?: string;
}
