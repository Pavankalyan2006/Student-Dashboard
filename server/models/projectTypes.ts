export type ProjectType =
  | 'MINI_PROJECT'
  | 'MAJOR_PROJECT'
  | 'FINAL_YEAR_PROJECT'
  | 'RESEARCH_PROJECT'
  | 'PERSONAL_PROJECT'
  | 'OPEN_SOURCE_PROJECT';

export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'ARCHIVED';

export type TechnologyCategory =
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATABASE'
  | 'AI'
  | 'ML'
  | 'API'
  | 'AUTH'
  | 'STORAGE'
  | 'DEPLOYMENT'
  | 'TESTING'
  | 'DEVOPS'
  | 'OTHER';

export type ArchitectureNodeType =
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATABASE'
  | 'AI'
  | 'SERVICE'
  | 'EXTERNAL_API'
  | 'STORAGE'
  | 'USER'
  | 'OTHER';

export type ModulePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ModuleStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type ProjectTaskStatus = TaskStatus;

export type MilestoneStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export type ProjectDocumentType =
  | 'ABSTRACT'
  | 'SRS'
  | 'REPORT'
  | 'ARCHITECTURE'
  | 'MODULE_DOCUMENTATION'
  | 'TEST_PLAN'
  | 'PRESENTATION_CONTENT'
  | 'OTHER';

export type DocumentStatus = 'DRAFT' | 'REVIEW' | 'FINAL';

export type RequirementType =
  | 'FUNCTIONAL'
  | 'NON_FUNCTIONAL'
  | 'TECHNICAL'
  | 'SECURITY'
  | 'USER';

export type RequirementPriority = 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'FUTURE';
export type RequirementStatus = 'PROPOSED' | 'ACCEPTED' | 'IMPLEMENTED' | 'DEFERRED';

export type RiskCategory =
  | 'TECHNICAL'
  | 'SCHEDULE'
  | 'RESOURCE'
  | 'SECURITY'
  | 'DATA'
  | 'DEPENDENCY'
  | 'OTHER';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskStatus = 'IDENTIFIED' | 'MITIGATING' | 'RESOLVED';

export type ActivityType =
  | 'PROJECT_CREATED'
  | 'MODULE_CREATED'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'MILESTONE_COMPLETED'
  | 'DOCUMENTATION_GENERATED'
  | 'ARCHITECTURE_UPDATED'
  | 'TECH_UPDATED';

export interface Project {
  id: string;
  student_id: string;
  title: string;
  slug: string;
  description: string;
  project_type: ProjectType;
  domain: string;
  problem_statement: string;
  objectives: string[];
  target_users: string;
  expected_outcome: string;
  status: ProjectStatus;
  progress_percentage: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ProjectTechnology {
  id: string;
  project_id: string;
  category: TechnologyCategory;
  technology: string;
  version?: string;
  reason?: string;
  is_required: boolean;
}

export interface ArchitectureNode {
  id: string;
  project_id: string;
  name: string;
  type: ArchitectureNodeType;
  description?: string;
  position: { x: number; y: number };
}

export interface ArchitectureEdge {
  id: string;
  project_id: string;
  source_node: string;
  target_node: string;
  label?: string;
}

export interface ProjectArchitecture {
  id: string;
  project_id: string;
  architecture_type: string;
  description: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  data_flow?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectModule {
  id: string;
  project_id: string;
  name: string;
  description: string;
  purpose: string;
  priority: ModulePriority;
  status: ModuleStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  module_id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimated_hours?: number;
  actual_hours?: number;
  order_index: number;
  due_date?: string;
  depends_on_task_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  target_date: string;
  status: MilestoneStatus;
  order_index: number;
  created_at: string;
  completed_at?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: ProjectDocumentType;
  title: string;
  content: string;
  version: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectRequirement {
  id: string;
  project_id: string;
  type: RequirementType;
  title: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  created_at: string;
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  risk: string;
  category: RiskCategory;
  probability: RiskLevel;
  impact: RiskLevel;
  mitigation: string;
  status: RiskStatus;
  created_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  student_id: string;
  activity_type: ActivityType;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProjectIdea {
  title: string;
  problem: string;
  solution: string;
  users: string;
  features: string[];
  technologies: { category: TechnologyCategory; name: string }[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimated_scope: string;
}

export interface ProjectProgressSummary {
  overall_percentage: number;
  tasks_total: number;
  tasks_completed: number;
  modules_total: number;
  modules_completed: number;
  milestones_total: number;
  milestones_completed: number;
  documents_total: number;
  last_activity_at: string;
}

export interface CreateProjectRequest {
  title: string;
  project_type: ProjectType;
  domain: string;
  description?: string;
  problem_statement?: string;
  objectives?: string[];
  target_users?: string;
  expected_outcome?: string;
  technologies?: {
    category: TechnologyCategory;
    technology: string;
    reason?: string;
    is_required?: boolean;
  }[];
  modules?: {
    name: string;
    description: string;
    purpose?: string;
    priority?: ModulePriority;
  }[];
}

export interface GenerateProjectIdeasRequest {
  branch?: string;
  domain?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  project_type?: ProjectType;
  preferred_technologies?: string[];
  time_available_weeks?: number;
  team_size?: number;
}

export interface GenerateDocumentationRequest {
  document_type: ProjectDocumentType;
  custom_instructions?: string;
  target_section?: string;
}

export interface GeneratePlanRequest {
  focus_area?: string;
  timeline_weeks?: number;
}
