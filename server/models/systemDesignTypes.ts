// server/models/systemDesignTypes.ts
// Comprehensive System Design Lab Domain Types

export type SystemDesignLevel = 1 | 2 | 3 | 4 | 5;

export type ComponentCategory =
  | 'APPLICATION'
  | 'STORAGE'
  | 'COMMUNICATION'
  | 'INFRASTRUCTURE'
  | 'DISTRIBUTED';

export type ComponentType =
  // Application
  | 'WEB_CLIENT'
  | 'MOBILE_CLIENT'
  | 'WEB_SERVER'
  | 'APP_SERVER'
  | 'BACKEND_SERVICE'
  | 'API_GATEWAY'
  | 'REVERSE_PROXY'
  | 'LOAD_BALANCER'
  | 'AUTH_SERVICE'
  // Storage
  | 'SQL_DATABASE'
  | 'NOSQL_DATABASE'
  | 'CACHE'
  | 'OBJECT_STORAGE'
  | 'SEARCH_INDEX'
  | 'DATA_WAREHOUSE'
  | 'VECTOR_DATABASE'
  // Communication
  | 'MESSAGE_QUEUE'
  | 'EVENT_BUS'
  | 'STREAMING_PLATFORM'
  | 'WEBSOCKET_SERVICE'
  | 'NOTIFICATION_SERVICE'
  | 'BACKGROUND_WORKER'
  // Infrastructure
  | 'CDN'
  | 'DNS'
  | 'CONTAINER'
  | 'CONTAINER_ORCHESTRATION'
  | 'MONITORING_SERVICE'
  | 'LOGGING_SERVICE'
  | 'SECRETS_MANAGER'
  | 'FIREWALL'
  | 'RATE_LIMITER'
  // Distributed
  | 'PRIMARY_DB'
  | 'READ_REPLICA'
  | 'SHARD'
  | 'LEADER'
  | 'FOLLOWER'
  | 'REGIONAL_DEPLOYMENT'
  | 'FAILOVER_COMPONENT'
  | 'EXTERNAL_API';

export type ConnectionProtocol =
  | 'HTTP/REST'
  | 'HTTPS'
  | 'gRPC'
  | 'WebSocket'
  | 'TCP'
  | 'UDP'
  | 'Kafka'
  | 'AMQP'
  | 'SQL'
  | 'Redis/RESP'
  | 'GraphQL'
  | 'Replication_Log'
  | 'Event';

export interface ArchitectureComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  type: ComponentType;
  tech_choice?: string;
  description: string;
  position: { x: number; y: number };
  properties?: {
    instances?: number;
    capacity_rps?: number;
    storage_capacity_gb?: number;
    cache_hit_ratio?: number;
    memory_gb?: number;
    port?: number;
    is_spof?: boolean;
    region?: string;
    custom_notes?: string;
  };
}

export interface ArchitectureConnection {
  id: string;
  from: string; // source component id
  to: string; // target component id
  protocol: ConnectionProtocol;
  label?: string;
  description?: string;
  direction?: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL';
  is_async?: boolean;
}

// -------------------------------------------------------------
// Learning Roadmap & Lessons
// -------------------------------------------------------------
export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface SystemDesignLesson {
  id: string;
  level: SystemDesignLevel;
  level_name: string;
  order_index: number;
  slug: string;
  title: string;
  summary: string;
  estimated_minutes: number;
  content_markdown: string;
  key_decisions: string[];
  advantages: string[];
  disadvantages: string[];
  common_mistakes: string[];
  practical_examples: string[];
  related_topics: string[];
  sample_diagram?: {
    components: Array<{ name: string; type: string; role: string }>;
    data_flow: string[];
  };
  knowledge_check: KnowledgeCheckQuestion[];
}

export interface SystemDesignLevelInfo {
  level: SystemDesignLevel;
  name: string;
  tagline: string;
  description: string;
  total_lessons: number;
  completed_lessons: number;
  lessons: SystemDesignLesson[];
}

// -------------------------------------------------------------
// Challenges & Submissions
// -------------------------------------------------------------
export interface SystemDesignChallenge {
  id: string;
  number: number;
  title: string;
  slug: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  target_users: string;
  description: string;
  functional_requirements: string[];
  non_functional_requirements: string[];
  constraints_and_assumptions: string[];
  expected_deliverables: string[];
  scale_estimation_benchmarks: {
    daily_active_users: string;
    requests_per_second: string;
    peak_requests_per_second: string;
    read_write_ratio: string;
    storage_per_year: string;
    bandwidth: string;
  };
  evaluation_rubric: {
    scalability_weight: number;
    reliability_weight: number;
    data_consistency_weight: number;
    security_weight: number;
    observability_weight: number;
    cost_awareness_weight: number;
  };
  hints: string[];
  starter_components?: Array<{ name: string; category: ComponentCategory; type: ComponentType; tech: string }>;
  reference_solution: {
    overview: string;
    components: ArchitectureComponent[];
    connections: ArchitectureConnection[];
    key_tradeoffs: string[];
    bottlenecks_and_mitigations: string[];
  };
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  student_id: string;
  project_id: string;
  submitted_at: string;
  version: number;
  score: number; // 0 - 100
  passed: boolean;
  rubric_breakdown: {
    scalability: { score: number; max: number; feedback: string };
    reliability: { score: number; max: number; feedback: string };
    consistency: { score: number; max: number; feedback: string };
    security: { score: number; max: number; feedback: string };
    observability: { score: number; max: number; feedback: string };
    cost: { score: number; max: number; feedback: string };
  };
  structural_findings: {
    spofs: string[];
    missing_components: string[];
    disconnected_nodes: string[];
    warnings: string[];
  };
  ai_suggestions: string[];
}

// -------------------------------------------------------------
// Design Projects & Versions
// -------------------------------------------------------------
export interface DesignProjectVersion {
  version_number: number;
  created_at: string;
  note: string;
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
}

export interface StudioDiagram {
  id: string;
  kind: 'class' | 'sequence' | 'flowchart' | 'er';
  title: string;
  source: string;
  updated_at: string;
}

export interface SystemDesignProject {
  id: string;
  student_id: string;
  challenge_id?: string;
  title: string;
  description: string;
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
  requirements?: {
    functional: string[];
    non_functional: string[];
    assumptions: string[];
  };
  capacity_estimate?: CapacityCalculation;
  database_design?: DatabaseDesign;
  api_specification?: ApiSpecification;
  /** Architecture Studio diagrams (class, sequence, flowchart, ER), kept as editable text. */
  diagrams?: StudioDiagram[];
  versions: DesignProjectVersion[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// Requirements & Capacity Estimation
// -------------------------------------------------------------
export interface CapacityCalculationInput {
  daily_active_users: number;
  requests_per_user_per_day: number;
  peak_traffic_factor: number;
  read_percentage: number;
  write_percentage: number;
  average_read_payload_kb: number;
  average_write_payload_kb: number;
  retention_years: number;
  replication_factor: number;
}

export interface CapacityCalculation {
  inputs: CapacityCalculationInput;
  results: {
    daily_total_requests: number;
    average_rps: number;
    peak_rps: number;
    read_rps: number;
    write_rps: number;
    peak_read_rps: number;
    peak_write_rps: number;
    daily_raw_storage_gb: number;
    yearly_raw_storage_tb: number;
    replicated_yearly_storage_tb: number;
    total_retention_storage_tb: number;
    average_bandwidth_mbps: number;
    peak_bandwidth_mbps: number;
  };
  formulas_used: Record<string, string>;
  limitations: string[];
}

// -------------------------------------------------------------
// Database Design Workspace
// -------------------------------------------------------------
export type SqlDialect = 'POSTGRESQL' | 'MYSQL' | 'COCKROACHDB';

export interface DatabaseAttribute {
  name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key?: boolean;
  references?: { table: string; field: string };
  is_nullable: boolean;
  is_unique?: boolean;
  default_value?: string;
  index_type?: 'NONE' | 'BTREE' | 'HASH' | 'GIN';
  comment?: string;
}

export interface DatabaseEntity {
  id: string;
  name: string;
  description?: string;
  attributes: DatabaseAttribute[];
  table_type?: 'RELATIONAL' | 'DOCUMENT' | 'KEY_VALUE' | 'WIDE_COLUMN';
}

export interface DatabaseRelationship {
  id: string;
  source_entity: string;
  target_entity: string;
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
  on_delete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT';
}

export interface DatabaseDesign {
  entities: DatabaseEntity[];
  relationships: DatabaseRelationship[];
  tradeoffs_notes?: string;
  sharding_strategy?: string;
  replication_notes?: string;
  generated_sql?: Record<SqlDialect, string>;
}

// -------------------------------------------------------------
// API Design Workspace
// -------------------------------------------------------------
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  description: string;
  auth_required: boolean;
  rate_limit?: string;
  idempotent?: boolean;
  parameters: Array<{
    name: string;
    in: 'query' | 'header' | 'path';
    required: boolean;
    data_type: string;
    description?: string;
  }>;
  request_body_schema?: string;
  response_schemas: Array<{
    status_code: number;
    description: string;
    schema_json: string;
  }>;
}

export interface ApiSpecification {
  title: string;
  version: string;
  base_url: string;
  endpoints: ApiEndpoint[];
  generated_openapi_yaml?: string;
  generated_openapi_json?: string;
}

// -------------------------------------------------------------
// Scalability & Architecture Simulator
// -------------------------------------------------------------
export type SimulationType =
  | 'LOAD_BALANCING'
  | 'CACHING'
  | 'READ_REPLICAS'
  | 'HORIZONTAL_SCALING'
  | 'QUEUE_PROCESSING'
  | 'AVAILABILITY_ANALYSIS'
  | 'COST_ESTIMATION';

export interface LoadBalancingSimParams {
  incoming_rps: number;
  instances: number;
  per_instance_capacity_rps: number;
  algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'IP_HASH';
}

export interface CachingSimParams {
  total_rps: number;
  cache_hit_ratio_percent: number;
  cache_capacity_mb: number;
  eviction_policy: 'LRU' | 'LFU' | 'FIFO';
}

export interface ReadReplicasSimParams {
  total_rps: number;
  read_percentage: number;
  replica_count: number;
  primary_capacity_rps: number;
  replica_capacity_rps: number;
  replication_lag_ms: number;
}

export interface HorizontalScalingSimParams {
  base_instances: number;
  scale_target_utilization: number;
  max_instances: number;
  current_rps: number;
  per_instance_rps: number;
}

export interface QueueProcessingSimParams {
  job_arrival_rate_per_sec: number;
  worker_count: number;
  worker_processing_rate_per_sec: number;
  simulation_duration_minutes: number;
}

export interface AvailabilitySimParams {
  dns_availability: number;
  lb_availability: number;
  app_availability: number;
  db_availability: number;
  cache_availability: number;
  redundant_lb: boolean;
  redundant_app: boolean;
  db_has_replica: boolean;
}

export interface CostSimParams {
  app_instances: number;
  app_instance_cost_per_mo: number;
  db_instances: number;
  db_instance_cost_per_mo: number;
  cache_instances: number;
  cache_instance_cost_per_mo: number;
  storage_tb: number;
  storage_cost_per_tb_mo: number;
  egress_bandwidth_gb: number;
  egress_cost_per_gb: number;
}

export interface SimulationResult {
  simulation_type: SimulationType;
  timestamp: string;
  status: 'STABLE' | 'WARNING' | 'OVERLOADED';
  metrics: Record<string, number | string>;
  chart_data: Array<{ time_or_step?: string | number; [key: string]: any }>;
  bottlenecks_detected: string[];
  recommendations: string[];
  educational_disclaimer: string;
}

// -------------------------------------------------------------
// System Design Interview Practice
// -------------------------------------------------------------
export type InterviewStep =
  | 'REQUIREMENTS_CLARIFICATION'
  | 'SCALE_ESTIMATION'
  | 'API_DESIGN'
  | 'DATA_MODEL'
  | 'HIGH_LEVEL_DESIGN'
  | 'DETAILED_DESIGN'
  | 'BOTTLENECK_ANALYSIS'
  | 'RELIABILITY_SECURITY'
  | 'TRADEOFFS_REVIEW'
  | 'FINAL_SUMMARY';

export interface InterviewSession {
  id: string;
  student_id: string;
  challenge_id: string;
  challenge_title: string;
  target_role: 'JUNIOR_SDE' | 'MID_SDE' | 'SENIOR_SDE' | 'STAFF_ARCHITECT';
  duration_minutes: number;
  current_step: InterviewStep;
  step_index: number; // 0 to 9
  step_responses: Record<InterviewStep, {
    student_notes: string;
    diagram_snapshot?: string;
    interviewer_feedback?: string;
    completed_at?: string;
  }>;
  overall_score?: number; // 0 to 100
  debrief_feedback?: {
    strengths: string[];
    improvements: string[];
    overall_verdict: string;
    rubric_scores: Record<string, number>;
  };
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  started_at: string;
  completed_at?: string;
}

// -------------------------------------------------------------
// Unified Progress & Analytics
// -------------------------------------------------------------
export interface SystemDesignProgress {
  student_id: string;
  completed_lessons: string[]; // lesson_ids
  passed_knowledge_checks: Record<string, number>; // lesson_id -> score
  completed_challenges: string[]; // challenge_ids
  total_projects_created: number;
  interview_sessions_completed: number;
  highest_challenge_score: number;
  mastered_concepts: string[];
  weak_concepts: string[];
  readiness_score: number; // 0 - 100
  last_activity_at: string;
  updated_at: string;
}
