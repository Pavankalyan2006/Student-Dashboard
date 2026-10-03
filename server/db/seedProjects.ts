import {
  Project,
  ProjectTechnology,
  ProjectArchitecture,
  ProjectModule,
  ProjectTask,
  ProjectMilestone,
  ProjectDocument,
  ProjectRequirement,
  ProjectRisk,
  ProjectActivity,
} from '../models/projectTypes';

export const seedProjects: Project[] = [
  {
    id: 'proj_seed_ai_health_01',
    student_id: 'std_01j8k9x2p4',
    title: 'Smart Health Prognosis & Clinical Decision Support System',
    slug: 'smart-health-prognosis-cdss',
    description:
      'An AI-powered multi-modal clinical decision support system that analyzes real-time vitals, lab reports, and patient history to predict acute decompensation risk.',
    project_type: 'MAJOR_PROJECT',
    domain: 'AI/ML',
    problem_statement:
      'Hospital intensive care and emergency units face critical diagnostic delays due to fragmented patient data and lack of automated early-warning telemetry.',
    objectives: [
      'Implement real-time patient vital sign streaming and anomaly detection',
      'Train explainable gradient-boosted and transformer models for sepsis risk prediction',
      'Provide FHIR/HL7-compliant REST APIs for clinical record interoperability',
      'Build an intuitive responsive clinician dashboard with urgent triage notifications',
    ],
    target_users: 'ICU clinicians, hospital triage nurses, and medical researchers',
    expected_outcome:
      'A validated clinical decision support platform achieving >88% AUROC on early decompensation warnings with under 1.5s inference latency.',
    status: 'IN_PROGRESS',
    progress_percentage: 58,
    tags: ['Healthcare', 'Deep Learning', 'FastAPI', 'React', 'FHIR'],
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'proj_seed_campus_iot_02',
    student_id: 'std_01j8k9x2p4',
    title: 'Autonomous Campus Energy & Environmental Telemetry Grid',
    slug: 'autonomous-campus-iot-grid',
    description:
      'IoT mesh network monitoring ambient indoor climate, lighting, and power dissipation across university academic blocks to optimize HVAC consumption.',
    project_type: 'MINI_PROJECT',
    domain: 'IoT',
    problem_statement:
      'Uncontrolled power usage across university lecture halls and laboratories causes unnecessary institutional electricity expenditure and high carbon footprint.',
    objectives: [
      'Deploy ESP32 sensor nodes for real-time ambient temp/humidity and occupancy telemetry',
      'Implement MQTT pub-sub broker with time-series ingestion into InfluxDB',
      'Automate relay cutoffs during zero-occupancy lab intervals',
    ],
    target_users: 'Campus estate managers, electrical maintenance officers, and students',
    expected_outcome:
      'Reduced auxiliary classroom power waste by at least 22% with automated schedule optimization.',
    status: 'PLANNING',
    progress_percentage: 20,
    tags: ['IoT', 'ESP32', 'MQTT', 'Energy'],
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedTechnologies: ProjectTechnology[] = [
  {
    id: 'tech_01',
    project_id: 'proj_seed_ai_health_01',
    category: 'FRONTEND',
    technology: 'React 19 + TypeScript',
    version: '19.0.0',
    reason: 'Type-safe component hierarchy with high-frequency telemetry re-rendering support',
    is_required: true,
  },
  {
    id: 'tech_02',
    project_id: 'proj_seed_ai_health_01',
    category: 'BACKEND',
    technology: 'FastAPI',
    version: '0.115.0',
    reason: 'High-throughput async Python ASGI server with native Pydantic validation',
    is_required: true,
  },
  {
    id: 'tech_03',
    project_id: 'proj_seed_ai_health_01',
    category: 'DATABASE',
    technology: 'PostgreSQL + TimescaleDB',
    version: '16.2',
    reason: 'Relational clinical records joined with high-cardinality time-series vital records',
    is_required: true,
  },
  {
    id: 'tech_04',
    project_id: 'proj_seed_ai_health_01',
    category: 'AI',
    technology: 'PyTorch & LightGBM',
    version: '2.4.0',
    reason: 'Pretrained neural temporal models combined with interpretable tree classifiers',
    is_required: true,
  },
  {
    id: 'tech_05',
    project_id: 'proj_seed_ai_health_01',
    category: 'API',
    technology: 'HL7 FHIR REST standard',
    version: 'R4',
    reason: 'Industry-standard hospital information system interoperability',
    is_required: true,
  },
  {
    id: 'tech_06',
    project_id: 'proj_seed_ai_health_01',
    category: 'DEPLOYMENT',
    technology: 'Docker & Kubernetes',
    version: '24.0',
    reason: 'Reproducible microservice containerization and isolated model inference scaling',
    is_required: false,
  },
];

export const seedArchitectures: ProjectArchitecture[] = [
  {
    id: 'arch_proj_01',
    project_id: 'proj_seed_ai_health_01',
    architecture_type: 'Microservices with Async Pipeline',
    description:
      'Decoupled telemetry ingestion pipeline streaming patient metrics through an async message broker into ML inference services and clinician web portals.',
    data_flow:
      'Patient Monitors / EHR -> FHIR Ingestion Gateway -> Redis Queue -> PyTorch ML Service -> PostgreSQL -> Web Clinician UI',
    nodes: [
      {
        id: 'node_user',
        project_id: 'proj_seed_ai_health_01',
        name: 'Clinician / Nurse',
        type: 'USER',
        description: 'Authorized medical personnel on ICU bedside workstations or tablets',
        position: { x: 50, y: 150 },
      },
      {
        id: 'node_frontend',
        project_id: 'proj_seed_ai_health_01',
        name: 'React Web Portal',
        type: 'FRONTEND',
        description: 'Real-time telemetry charts, alert dashboards, and clinical note forms',
        position: { x: 250, y: 150 },
      },
      {
        id: 'node_api',
        project_id: 'proj_seed_ai_health_01',
        name: 'FastAPI Gateway',
        type: 'BACKEND',
        description: 'Authentication, REST endpoint routing, and validation',
        position: { x: 450, y: 150 },
      },
      {
        id: 'node_ai_service',
        project_id: 'proj_seed_ai_health_01',
        name: 'Inference Microservice',
        type: 'AI',
        description: 'PyTorch acute decompensation & sepsis risk model',
        position: { x: 650, y: 70 },
      },
      {
        id: 'node_db',
        project_id: 'proj_seed_ai_health_01',
        name: 'PostgreSQL & Timescale',
        type: 'DATABASE',
        description: 'Patient records, vital metrics, and diagnostic logs',
        position: { x: 650, y: 230 },
      },
      {
        id: 'node_ehr',
        project_id: 'proj_seed_ai_health_01',
        name: 'Hospital EHR / FHIR',
        type: 'EXTERNAL_API',
        description: 'External laboratory and admission records',
        position: { x: 450, y: 310 },
      },
    ],
    edges: [
      {
        id: 'edge_1',
        project_id: 'proj_seed_ai_health_01',
        source_node: 'node_user',
        target_node: 'node_frontend',
        label: 'HTTPS / Web UI',
      },
      {
        id: 'edge_2',
        project_id: 'proj_seed_ai_health_01',
        source_node: 'node_frontend',
        target_node: 'node_api',
        label: 'REST & WebSockets',
      },
      {
        id: 'edge_3',
        project_id: 'proj_seed_ai_health_01',
        source_node: 'node_api',
        target_node: 'node_ai_service',
        label: 'gRPC / JSON Inference',
      },
      {
        id: 'edge_4',
        project_id: 'proj_seed_ai_health_01',
        source_node: 'node_api',
        target_node: 'node_db',
        label: 'SQLAlchemy Async',
      },
      {
        id: 'edge_5',
        project_id: 'proj_seed_ai_health_01',
        source_node: 'node_api',
        target_node: 'node_ehr',
        label: 'FHIR Rest Sync',
      },
    ],
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedModules: ProjectModule[] = [
  {
    id: 'mod_01',
    project_id: 'proj_seed_ai_health_01',
    name: 'Authentication & Security',
    description: 'Role-based access control (Doctor, Nurse, Admin) with JWT and audit trail.',
    purpose: 'Enforce strict HIPAA compliance and safeguard sensitive patient medical records.',
    priority: 'HIGH',
    status: 'COMPLETED',
    order_index: 1,
    created_at: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mod_02',
    project_id: 'proj_seed_ai_health_01',
    name: 'EHR Ingestion & Parser',
    description: 'FHIR JSON parser and automated vital sign streaming pipeline.',
    purpose: 'Normalize laboratory datasets and continuous vitals into structured tensors.',
    priority: 'HIGH',
    status: 'COMPLETED',
    order_index: 2,
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mod_03',
    project_id: 'proj_seed_ai_health_01',
    name: 'Diagnostic Inference Engine',
    description: 'Neural risk scoring model with SHAP explainability attribution.',
    purpose: 'Provide sub-second risk probability with top contributing physiological factors.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    order_index: 3,
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mod_04',
    project_id: 'proj_seed_ai_health_01',
    name: 'Clinician Triage Dashboard',
    description: 'Interactive real-time web portal displaying patient vital trajectories.',
    purpose: 'Equip bedside clinicians with immediate visual alerts and triage rankings.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    order_index: 4,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedTasks: ProjectTask[] = [
  {
    id: 'task_01',
    project_id: 'proj_seed_ai_health_01',
    module_id: 'mod_01',
    title: 'Design JWT authentication with token revocation',
    description: 'Implement secure login, password hashing with bcrypt, and Redis blacklisting.',
    priority: 'HIGH',
    status: 'DONE',
    estimated_hours: 8,
    actual_hours: 7,
    order_index: 1,
    created_at: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task_02',
    project_id: 'proj_seed_ai_health_01',
    module_id: 'mod_02',
    title: 'Create FHIR patient resource schema & validator',
    description: 'Pydantic models for Patient, Observation, and DiagnosticReport endpoints.',
    priority: 'HIGH',
    status: 'DONE',
    estimated_hours: 12,
    actual_hours: 10,
    order_index: 2,
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task_03',
    project_id: 'proj_seed_ai_health_01',
    module_id: 'mod_03',
    title: 'Train gradient boosted model on MIMIC-III benchmark',
    description: 'Preprocess vital timeseries data and evaluate 12-hour mortality AUROC.',
    priority: 'HIGH',
    status: 'DONE',
    estimated_hours: 20,
    actual_hours: 18,
    order_index: 3,
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task_04',
    project_id: 'proj_seed_ai_health_01',
    module_id: 'mod_03',
    title: 'Implement SHAP feature contribution API endpoint',
    description: 'Compute TreeSHAP values for incoming patient observations and return top 5 factors.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    estimated_hours: 10,
    actual_hours: 4,
    order_index: 4,
    depends_on_task_id: 'task_03',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task_05',
    project_id: 'proj_seed_ai_health_01',
    module_id: 'mod_04',
    title: 'Build real-time vital alert component in React',
    description: 'WebSocket listener displaying toast notifications when risk threshold > 0.75.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    estimated_hours: 14,
    actual_hours: 6,
    order_index: 5,
    depends_on_task_id: 'task_04',
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task_06',
    project_id: 'proj_seed_ai_health_01',
    module_id: 'mod_04',
    title: 'Add patient historical vital trends chart',
    description: 'Multi-line SVG / Recharts visualization of heart rate, SpO2, and MAP over 24h.',
    priority: 'MEDIUM',
    status: 'TODO',
    estimated_hours: 10,
    order_index: 6,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedMilestones: ProjectMilestone[] = [
  {
    id: 'mile_01',
    project_id: 'proj_seed_ai_health_01',
    title: 'Project Charter & IEEE SRS Signoff',
    description: 'Literature review, requirements definition, and architecture validation.',
    target_date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'COMPLETED',
    order_index: 1,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mile_02',
    project_id: 'proj_seed_ai_health_01',
    title: 'Data Ingestion & Benchmark Model Training',
    description: 'Normalized MIMIC-III benchmark pipeline and baseline model accuracy > 85%.',
    target_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'COMPLETED',
    order_index: 2,
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mile_03',
    project_id: 'proj_seed_ai_health_01',
    title: 'Clinical Dashboard & Real-Time Alerts',
    description: 'End-to-end integration of WebSockets, triage lists, and explainability cards.',
    target_date: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'IN_PROGRESS',
    order_index: 3,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mile_04',
    project_id: 'proj_seed_ai_health_01',
    title: 'Testing, Final Documentation & Project Viva',
    description: 'Comprehensive unit/integration test suite and IEEE project report.',
    target_date: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'UPCOMING',
    order_index: 4,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedDocuments: ProjectDocument[] = [
  {
    id: 'doc_proj_01',
    project_id: 'proj_seed_ai_health_01',
    document_type: 'ABSTRACT',
    title: 'Project Abstract — Smart Health Prognosis System',
    content: `# Academic Abstract

## Title
**Smart Health Prognosis & Clinical Decision Support System**

## Summary
In modern acute hospital environments, the timely recognition of physiological deterioration is critical to mitigating in-hospital mortality. This capstone engineering project presents a robust, end-to-end Clinical Decision Support System (CDSS) leveraging deep temporal machine learning and modern microservice architecture. 

The system continuously streams multi-modal patient telemetry—including electrocardiogram (ECG) telemetry, continuous pulse oximetry ($SpO_2$), mean arterial pressure (MAP), and discrete hematology lab reports. Using an optimized ensemble of LightGBM and Temporal Convolutional Networks (TCN) validated against the MIMIC-III intensive care dataset, the inference pipeline predicts 12-hour acute decompensation events with an AUROC exceeding 0.88 while maintaining an inference turnaround under 1.5 seconds.

Furthermore, to overcome the "black-box" dilemma in medical machine learning, the system embeds TreeSHAP feature attributions directly into the clinician interface, highlighting physiological anomalies that prompted the triage alert. The backend conforms to the HL7 FHIR R4 standard, guaranteeing interoperability with legacy Hospital Information Systems (HIS).`,
    version: 1,
    status: 'FINAL',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'doc_proj_02',
    project_id: 'proj_seed_ai_health_01',
    document_type: 'SRS',
    title: 'Software Requirements Specification (SRS) — CDSS',
    content: `# Software Requirements Specification (SRS)
## For Smart Health Prognosis & Clinical Decision Support System

### 1. Introduction
#### 1.1 Purpose
This document establishes the formal functional and non-functional requirements for the Smart Health Prognosis CDSS, designed for final-year engineering capstone submission and clinical trial evaluation.

#### 1.2 Scope
The software encompasses telemetry data ingestion, machine learning risk estimation, real-time alerting, and an interactive web portal for intensive care physicians and nurses.

### 2. Overall Description
#### 2.1 User Classes
- **Attending Physicians**: High-privilege users requiring detailed diagnostic explanations, risk factor trends, and diagnostic validation.
- **Triage / Bedside Nurses**: Operational users needing high-visibility alerts, bed occupancy overviews, and vital entry forms.
- **System Administrators**: Hospital IT personnel managing user credentials, audit trails, and FHIR connectors.

### 3. System Requirements
#### 3.1 Functional Requirements
- **FR-1**: The system shall ingest streaming physiological vitals at 1Hz frequency via secure WebSockets.
- **FR-2**: The system shall compute risk prediction scores within 1500ms of metric arrival.
- **FR-3**: The system shall calculate top 5 contributing features using SHAP explanation vectors.
- **FR-4**: The system shall emit visual and audible triage alerts when predicted risk exceeds 0.75.

#### 3.2 Non-Functional Requirements
- **NFR-1 (Security)**: All communications must be encrypted using TLS 1.3. Patient identifiable data must be stored with AES-256 encryption.
- **NFR-2 (Availability)**: The clinical ingestion gateway must ensure 99.9% uptime during hospital shifts.
- **NFR-3 (Usability)**: Critical alert notifications must be viewable within 1 click from any dashboard screen.`,
    version: 2,
    status: 'FINAL',
    created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedRequirements: ProjectRequirement[] = [
  {
    id: 'req_01',
    project_id: 'proj_seed_ai_health_01',
    type: 'FUNCTIONAL',
    title: 'Real-time telemetry streaming at 1Hz',
    description: 'Ingest continuous heart rate, SpO2, and MAP vitals with zero dropped packets.',
    priority: 'MUST_HAVE',
    status: 'IMPLEMENTED',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_02',
    project_id: 'proj_seed_ai_health_01',
    type: 'FUNCTIONAL',
    title: 'Model explainability with SHAP values',
    description: 'Output top 5 physiological risk drivers with every automated triage calculation.',
    priority: 'MUST_HAVE',
    status: 'ACCEPTED',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_03',
    project_id: 'proj_seed_ai_health_01',
    type: 'SECURITY',
    title: 'HIPAA-compliant encrypted data at rest',
    description: 'Encrypt patient medical records in PostgreSQL using AES-256 field encryption.',
    priority: 'MUST_HAVE',
    status: 'IMPLEMENTED',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_04',
    project_id: 'proj_seed_ai_health_01',
    type: 'NON_FUNCTIONAL',
    title: 'Sub-1500ms end-to-end inference latency',
    description: 'Ensure total roundtrip from vital observation arrival to alert display is under 1.5 seconds.',
    priority: 'SHOULD_HAVE',
    status: 'ACCEPTED',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedRisks: ProjectRisk[] = [
  {
    id: 'risk_01',
    project_id: 'proj_seed_ai_health_01',
    risk: 'High false positive alert rate causing clinician alarm fatigue',
    category: 'TECHNICAL',
    probability: 'MEDIUM',
    impact: 'HIGH',
    mitigation: 'Implement exponential moving average smoothing and configurable confidence thresholds.',
    status: 'MITIGATING',
    created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'risk_02',
    project_id: 'proj_seed_ai_health_01',
    risk: 'MIMIC-III dataset distribution shift when deployed on local hospital hardware',
    category: 'DATA',
    probability: 'HIGH',
    impact: 'HIGH',
    mitigation: 'Apply transfer learning calibration and validate against local de-identified cohort.',
    status: 'IDENTIFIED',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
];

export const seedActivities: ProjectActivity[] = [
  {
    id: 'act_01',
    project_id: 'proj_seed_ai_health_01',
    student_id: 'std_01j8k9x2p4',
    activity_type: 'PROJECT_CREATED',
    message: 'Project "Smart Health Prognosis & Clinical Decision Support System" initialized.',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act_02',
    project_id: 'proj_seed_ai_health_01',
    student_id: 'std_01j8k9x2p4',
    activity_type: 'ARCHITECTURE_UPDATED',
    message: 'Added microservice architecture diagram with 6 nodes and 5 edges.',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act_03',
    project_id: 'proj_seed_ai_health_01',
    student_id: 'std_01j8k9x2p4',
    activity_type: 'DOCUMENTATION_GENERATED',
    message: 'Generated IEEE-format Software Requirements Specification (SRS) v2.',
    created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act_04',
    project_id: 'proj_seed_ai_health_01',
    student_id: 'std_01j8k9x2p4',
    activity_type: 'TASK_COMPLETED',
    message: 'Completed task: "Train gradient boosted model on MIMIC-III benchmark".',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];
