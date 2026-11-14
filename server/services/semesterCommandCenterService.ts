// server/services/semesterCommandCenterService.ts
// Academic Semester Command Center Engine & Orchestration Service

import {
  AcademicSemesterConfig,
  SemesterSubject,
  SemesterUnit,
  SemesterTopic,
  AcademicEvent,
  AcademicPhase,
  SemesterStudyStreamNode,
  SlipTest,
  MinorExam,
  EndSemReadiness,
  AcademicRecoveryPlan,
  DailyAcademicGuidance,
  WeeklyAcademicReview,
  SemesterOverviewDashboardData,
  PriorityLevel,
  FocusMode,
} from '../models/semesterCommandCenterTypes';
import { OnboardingService } from './onboardingService';

// Initial realistic default state for B.Tech Semester 6/7 student
let currentSemesterConfig: AcademicSemesterConfig = {
  id: 'sem_curr_01',
  student_id: 'std_demo_btech',
  semester_number: 6,
  academic_year: '2025-2026',
  branch: 'CSE',
  section: 'A',
  start_date: '2026-01-05',
  end_date: '2026-05-15',
  total_teaching_weeks: 16,
  current_week: 9,
  current_phase_number: 6,
  target_gpa: 9.0,
  daily_study_hours_budget: 3.5,
  academic_goals: [
    'Maintain >= 9.0 SGPA to qualify for Tier-1 placements',
    'Score 25+/30 in Minor 2 across all core subjects',
    'Complete Distributed Systems & Cloud Lab with full marks',
  ],
  created_at: new Date('2026-01-05').toISOString(),
  updated_at: new Date().toISOString(),
};

let semesterSubjects: SemesterSubject[] = [
  {
    id: 'sub_dbms',
    semester_id: 'sem_curr_01',
    name: 'Database Management Systems',
    code: 'CS601PC',
    credits: 4,
    subject_type: 'CORE',
    difficulty: 'HARD',
    priority: 'CRITICAL',
    progress_percent: 78,
    syllabus_remaining_percent: 22,
    exam_proximity_days: 6,
    target_grade: 'A+',
    units: [
      {
        id: 'u_dbms_1',
        unit_number: 1,
        name: 'Database Architecture & ER Modeling',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [
          { id: 't_1', name: 'Database System Concepts & Architecture', estimated_hours: 3, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'EASY', completed: true, revision_count: 2 },
          { id: 't_2', name: 'Entity Relationship (ER) Model & Schema Mapping', estimated_hours: 4, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'MEDIUM', completed: true, revision_count: 2 },
        ],
      },
      {
        id: 'u_dbms_2',
        unit_number: 2,
        name: 'Relational Model & Advanced SQL',
        weightage_percent: 25,
        status: 'COMPLETED',
        topics: [
          { id: 't_3', name: 'Relational Algebra & Tuple Calculus', estimated_hours: 4, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: true, revision_count: 2 },
          { id: 't_4', name: 'Complex SQL Queries, Views & Joins', estimated_hours: 5, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'HARD', completed: true, revision_count: 3 },
        ],
      },
      {
        id: 'u_dbms_3',
        unit_number: 3,
        name: 'Schema Refinement & Normal Forms',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [
          { id: 't_5', name: 'Functional Dependencies & Armstrong Axioms', estimated_hours: 3, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: true, revision_count: 1 },
          { id: 't_6', name: '1NF, 2NF, 3NF, BCNF & Lossless Joins', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'HARD', completed: true, revision_count: 2 },
        ],
      },
      {
        id: 'u_dbms_4',
        unit_number: 4,
        name: 'Transaction Management & Concurrency Control',
        weightage_percent: 20,
        status: 'IN_PROGRESS',
        topics: [
          { id: 't_7', name: 'ACID Properties & Transaction States', estimated_hours: 3, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'EASY', completed: true, revision_count: 1 },
          { id: 't_8', name: 'Two-Phase Locking (2PL) & Deadlock Resolution', estimated_hours: 4, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 },
        ],
      },
      {
        id: 'u_dbms_5',
        unit_number: 5,
        name: 'Indexing, Hashing & Storage Engines',
        weightage_percent: 15,
        status: 'NOT_STARTED',
        topics: [
          { id: 't_9', name: 'B+ Tree Indexing & File Organization', estimated_hours: 4, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 },
        ],
      },
    ],
  },
  {
    id: 'sub_os',
    semester_id: 'sem_curr_01',
    name: 'Operating Systems & Concurrency',
    code: 'CS602PC',
    credits: 4,
    subject_type: 'CORE',
    difficulty: 'HARD',
    priority: 'HIGH',
    progress_percent: 72,
    syllabus_remaining_percent: 28,
    exam_proximity_days: 18,
    target_grade: 'A',
    units: [
      {
        id: 'u_os_1',
        unit_number: 1,
        name: 'OS Structure & Process Management',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [
          { id: 't_os_1', name: 'System Calls & Process Control Blocks', estimated_hours: 4, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'MEDIUM', completed: true, revision_count: 2 },
        ],
      },
      {
        id: 'u_os_2',
        unit_number: 2,
        name: 'CPU Scheduling & Thread Models',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [
          { id: 't_os_2', name: 'Multi-Level Queue & Round Robin Scheduling', estimated_hours: 4, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: true, revision_count: 1 },
        ],
      },
      {
        id: 'u_os_3',
        unit_number: 3,
        name: 'Process Synchronization & Deadlocks',
        weightage_percent: 25,
        status: 'IN_PROGRESS',
        topics: [
          { id: 't_os_3', name: 'Semaphores, Mutex & Classical IPC Problems', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'HARD', completed: true, revision_count: 1 },
          { id: 't_os_4', name: 'Bankers Algorithm & Deadlock Detection', estimated_hours: 4, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 },
        ],
      },
      {
        id: 'u_os_4',
        unit_number: 4,
        name: 'Memory Management & Virtual Memory',
        weightage_percent: 20,
        status: 'NOT_STARTED',
        topics: [
          { id: 't_os_5', name: 'Paging, Segmentation & Page Replacement Algorithms', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 },
        ],
      },
      {
        id: 'u_os_5',
        unit_number: 5,
        name: 'File Systems & Storage Architecture',
        weightage_percent: 15,
        status: 'NOT_STARTED',
        topics: [
          { id: 't_os_6', name: 'Disk Scheduling & RAID Architectures', estimated_hours: 3, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'EASY', completed: false, revision_count: 0 },
        ],
      },
    ],
  },
  {
    id: 'sub_cn',
    semester_id: 'sem_curr_01',
    name: 'Computer Networks',
    code: 'CS603PC',
    credits: 3,
    subject_type: 'CORE',
    difficulty: 'MEDIUM',
    priority: 'MEDIUM',
    progress_percent: 65,
    syllabus_remaining_percent: 35,
    exam_proximity_days: 24,
    target_grade: 'A',
    units: [
      {
        id: 'u_cn_1',
        unit_number: 1,
        name: 'Physical & Data Link Layer Protocols',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [{ id: 't_cn_1', name: 'OSI Reference Model & Framing', estimated_hours: 4, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'EASY', completed: true, revision_count: 2 }],
      },
      {
        id: 'u_cn_2',
        unit_number: 2,
        name: 'Network Layer & Routing Protocols',
        weightage_percent: 25,
        status: 'COMPLETED',
        topics: [{ id: 't_cn_2', name: 'IPv4/IPv6 Subnetting & OSPF/BGP Routing', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'HARD', completed: true, revision_count: 1 }],
      },
      {
        id: 'u_cn_3',
        unit_number: 3,
        name: 'Transport Layer & Congestion Control',
        weightage_percent: 25,
        status: 'IN_PROGRESS',
        topics: [{ id: 't_cn_3', name: 'TCP 3-Way Handshake & Flow Control', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 }],
      },
      {
        id: 'u_cn_4',
        unit_number: 4,
        name: 'Application Layer & Network Security',
        weightage_percent: 15,
        status: 'NOT_STARTED',
        topics: [{ id: 't_cn_4', name: 'DNS, HTTP/HTTPS, SSL/TLS Handshake', estimated_hours: 4, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 }],
      },
      {
        id: 'u_cn_5',
        unit_number: 5,
        name: 'Wireless & Next-Gen Networking',
        weightage_percent: 15,
        status: 'NOT_STARTED',
        topics: [{ id: 't_cn_5', name: 'Software Defined Networking (SDN)', estimated_hours: 3, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'EASY', completed: false, revision_count: 0 }],
      },
    ],
  },
  {
    id: 'sub_ml',
    semester_id: 'sem_curr_01',
    name: 'Machine Learning & Neural Networks',
    code: 'CS604PE',
    credits: 3,
    subject_type: 'ELECTIVE',
    difficulty: 'HARD',
    priority: 'HIGH',
    progress_percent: 60,
    syllabus_remaining_percent: 40,
    exam_proximity_days: 28,
    target_grade: 'A+',
    units: [
      {
        id: 'u_ml_1',
        unit_number: 1,
        name: 'Supervised Learning Foundations',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [{ id: 't_ml_1', name: 'Linear & Logistic Regression with Cost Functions', estimated_hours: 4, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'MEDIUM', completed: true, revision_count: 2 }],
      },
      {
        id: 'u_ml_2',
        unit_number: 2,
        name: 'Tree Models & Ensemble Techniques',
        weightage_percent: 20,
        status: 'COMPLETED',
        topics: [{ id: 't_ml_2', name: 'Random Forests & Gradient Boosting (XGBoost)', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'HARD', completed: true, revision_count: 1 }],
      },
      {
        id: 'u_ml_3',
        unit_number: 3,
        name: 'Unsupervised Learning & Clustering',
        weightage_percent: 20,
        status: 'IN_PROGRESS',
        topics: [{ id: 't_ml_3', name: 'K-Means, PCA & Dimensionality Reduction', estimated_hours: 4, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'MEDIUM', completed: false, revision_count: 0 }],
      },
      {
        id: 'u_ml_4',
        unit_number: 4,
        name: 'Deep Learning & Backpropagation',
        weightage_percent: 25,
        status: 'NOT_STARTED',
        topics: [{ id: 't_ml_4', name: 'Multi-Layer Perceptrons & Activation Functions', estimated_hours: 5, conceptual_difficulty: 'HARD', practical_difficulty: 'HARD', completed: false, revision_count: 0 }],
      },
      {
        id: 'u_ml_5',
        unit_number: 5,
        name: 'Model Evaluation & Optimization',
        weightage_percent: 15,
        status: 'NOT_STARTED',
        topics: [{ id: 't_ml_5', name: 'ROC/AUC, Cross Validation & Hyperparameter Tuning', estimated_hours: 3, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'EASY', completed: false, revision_count: 0 }],
      },
    ],
  },
  {
    id: 'sub_dblab',
    semester_id: 'sem_curr_01',
    name: 'Database & SQL Programming Lab',
    code: 'CS605PC',
    credits: 2,
    subject_type: 'LAB',
    difficulty: 'MEDIUM',
    priority: 'MEDIUM',
    progress_percent: 85,
    syllabus_remaining_percent: 15,
    exam_proximity_days: 12,
    target_grade: 'O',
    units: [
      {
        id: 'u_dblab_1',
        unit_number: 1,
        name: 'DDL & DML Implementation',
        weightage_percent: 50,
        status: 'COMPLETED',
        topics: [{ id: 't_dblab_1', name: 'Complex Joins, Stored Procedures & Triggers', estimated_hours: 6, conceptual_difficulty: 'MEDIUM', practical_difficulty: 'HARD', completed: true, revision_count: 2 }],
      },
      {
        id: 'u_dblab_2',
        unit_number: 2,
        name: 'Database Connectivity & Web Tier',
        weightage_percent: 50,
        status: 'IN_PROGRESS',
        topics: [{ id: 't_dblab_2', name: 'JDBC/Node-Postgres Integration with Connection Pooling', estimated_hours: 6, conceptual_difficulty: 'HARD', practical_difficulty: 'HARD', completed: false, revision_count: 0 }],
      },
    ],
  },
];

let academicEvents: AcademicEvent[] = [
  {
    id: 'ev_01',
    student_id: 'std_demo_btech',
    subject_id: 'sub_dbms',
    event_type: 'SLIP_TEST',
    title: 'DBMS Slip Test (Unit 3 Normalization & 4 ACID)',
    date: '2026-10-07',
    start_time: '10:00 AM',
    end_time: '11:00 AM',
    priority: 'CRITICAL',
    syllabus_scope: 'Unit 3: 3NF/BCNF + Unit 4: ACID properties',
    status: 'UPCOMING',
    notes: 'Faculty announced 20 marks test impacting internal evaluation.',
  },
  {
    id: 'ev_02',
    student_id: 'std_demo_btech',
    subject_id: 'sub_dblab',
    event_type: 'LAB_EXAM',
    date: '2026-10-15',
    start_time: '02:00 PM',
    end_time: '05:00 PM',
    priority: 'HIGH',
    title: 'Internal Database Lab Practical & Viva',
    syllabus_scope: 'Experiments 1 through 8',
    status: 'UPCOMING',
    notes: 'Includes viva on normal forms and stored procedure execution.',
  },
  {
    id: 'ev_03',
    student_id: 'std_demo_btech',
    subject_id: 'sub_os',
    event_type: 'MINOR_2',
    date: '2026-10-22',
    start_time: '09:30 AM',
    end_time: '11:30 AM',
    priority: 'CRITICAL',
    title: 'Minor Examination 2 (All Subjects)',
    syllabus_scope: 'Units 3 and 4 across all registered subjects',
    status: 'UPCOMING',
    notes: 'Counts for 30 marks of mid-semester grade evaluation.',
  },
  {
    id: 'ev_04',
    student_id: 'std_demo_btech',
    subject_id: 'sub_cn',
    event_type: 'QUIZ',
    date: '2026-10-11',
    start_time: '11:30 AM',
    end_time: '12:00 PM',
    priority: 'MEDIUM',
    title: 'Computer Networks Online MCQ Quiz',
    syllabus_scope: 'Subnetting & Distance Vector Routing',
    status: 'UPCOMING',
  },
  {
    id: 'ev_05',
    student_id: 'std_demo_btech',
    event_type: 'END_SEMESTER',
    date: '2026-11-20',
    priority: 'CRITICAL',
    title: 'Final End-Semester University Examinations Begin',
    syllabus_scope: '100% Comprehensive Syllabus (Units 1-5)',
    status: 'UPCOMING',
    notes: 'Targeting >= 9.0 SGPA.',
  },
];

let academicPhases: AcademicPhase[] = [
  { id: 'p_1', phase_number: 1, name: 'Phase 1: Foundation & Unit 1 Setup', description: 'Initial lectures, syllabus blueprint, foundational concepts.', start_date: '2026-01-05', end_date: '2026-01-25', is_current: false, focus_mode: 'LEARNING' },
  { id: 'p_2', phase_number: 2, name: 'Phase 2: Syllabus Acceleration', description: 'In-depth unit 2 coverage and first batch of lab experiments.', start_date: '2026-01-26', end_date: '2026-02-15', is_current: false, focus_mode: 'LEARNING' },
  { id: 'p_3', phase_number: 3, name: 'Phase 3: Minor 1 Preparation', description: 'Intensive revision of units 1 & 2 for first mid-term.', start_date: '2026-02-16', end_date: '2026-03-05', is_current: false, focus_mode: 'EXAM_PREPARATION' },
  { id: 'p_4', phase_number: 4, name: 'Phase 4: Post-Minor 1 Recovery', description: 'Analyzing minor 1 mistakes, recovering weak concepts, starting unit 3.', start_date: '2026-03-06', end_date: '2026-03-20', is_current: false, focus_mode: 'POST_EXAM_ANALYSIS' },
  { id: 'p_5', phase_number: 5, name: 'Phase 5: Core Syllabus Block 2', description: 'Units 3 and 4 across DBMS, OS, Networks, ML.', start_date: '2026-03-21', end_date: '2026-04-10', is_current: false, focus_mode: 'CONSOLIDATION' },
  { id: 'p_6', phase_number: 6, name: 'Phase 6: Slip Test & Minor 2 Readiness', description: 'Targeted slip tests, mid-term 2 readiness and lab vivas.', start_date: '2026-04-11', end_date: '2026-04-30', is_current: true, focus_mode: 'EXAM_PREPARATION' },
  { id: 'p_7', phase_number: 7, name: 'Phase 7: Syllabus Completion (Unit 5)', description: 'Finishing the remaining 15-20% syllabus across all subjects.', start_date: '2026-05-01', end_date: '2026-05-10', is_current: false, focus_mode: 'LEARNING' },
  { id: 'p_8', phase_number: 8, name: 'Phase 8: Comprehensive End-Sem Revision', description: 'Full mock exams, previous year question papers, formula sheets.', start_date: '2026-05-11', end_date: '2026-05-20', is_current: false, focus_mode: 'FINAL_REVISION' },
  { id: 'p_9', phase_number: 9, name: 'Phase 9: University End-Semester Exams', description: 'Peak execution, daily focused revision before each subject paper.', start_date: '2026-05-21', end_date: '2026-06-05', is_current: false, focus_mode: 'EXAM_MODE' },
];

let studyStreamNodes: SemesterStudyStreamNode[] = [
  { id: 'node_1', title: 'Syllabus Intelligence & Dependency Map', type: 'SYLLABUS_OVERVIEW', subject_id: 'sub_dbms', subject_name: 'DBMS', status: 'COMPLETED', deadline: '2026-01-10', estimated_time_minutes: 45, actual_time_minutes: 40, priority: 'HIGH', action_route: '/semester-command-center/syllabus' },
  { id: 'node_2', title: 'Study Unit 1: ER Model & Relational Algebra', type: 'UNIT_STUDY', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_1', unit_number: 1, status: 'COMPLETED', deadline: '2026-01-20', estimated_time_minutes: 180, actual_time_minutes: 195, score: 92, priority: 'HIGH', action_route: '/courses' },
  { id: 'node_3', title: 'Unit 1 Knowledge Check & Quiz', type: 'QUIZ', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_1', unit_number: 1, status: 'COMPLETED', deadline: '2026-01-22', estimated_time_minutes: 30, score: 95, priority: 'MEDIUM', action_route: '/quiz' },
  { id: 'node_4', title: 'Study Unit 2: SQL & Relational Calculus', type: 'UNIT_STUDY', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_2', unit_number: 2, status: 'COMPLETED', deadline: '2026-02-05', estimated_time_minutes: 240, actual_time_minutes: 220, priority: 'HIGH', action_route: '/courses' },
  { id: 'node_5', title: 'Minor 1 Examination & Performance Review', type: 'MINOR_EXAM', subject_id: 'sub_dbms', subject_name: 'DBMS', status: 'COMPLETED', deadline: '2026-02-28', estimated_time_minutes: 120, score: 26, priority: 'CRITICAL', action_route: '/semester-command-center/minors' },
  { id: 'node_6', title: 'Study Unit 3: Normalization (3NF & BCNF)', type: 'UNIT_STUDY', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_3', unit_number: 3, status: 'COMPLETED', deadline: '2026-03-25', estimated_time_minutes: 210, actual_time_minutes: 240, priority: 'CRITICAL', action_route: '/courses' },
  { id: 'node_7', title: 'Unit 3 Slip Test Preparation & Revision', type: 'SLIP_TEST', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_3', unit_number: 3, status: 'ACTIVE', deadline: '2026-10-07', estimated_time_minutes: 60, priority: 'CRITICAL', action_route: '/semester-command-center/slip-tests' },
  { id: 'node_8', title: 'Study Unit 4: Two-Phase Locking & Deadlocks', type: 'UNIT_STUDY', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_4', unit_number: 4, status: 'ACTIVE', deadline: '2026-10-12', estimated_time_minutes: 180, priority: 'HIGH', action_route: '/courses' },
  { id: 'node_9', title: 'Minor 2 Comprehensive Review', type: 'MINOR_EXAM', subject_id: 'sub_dbms', subject_name: 'DBMS', status: 'LOCKED', deadline: '2026-10-22', estimated_time_minutes: 120, priority: 'CRITICAL', action_route: '/semester-command-center/minors' },
  { id: 'node_10', title: 'Study Unit 5: Indexing & B+ Trees', type: 'UNIT_STUDY', subject_id: 'sub_dbms', subject_name: 'DBMS', unit_id: 'u_dbms_5', unit_number: 5, status: 'LOCKED', deadline: '2026-11-05', estimated_time_minutes: 150, priority: 'MEDIUM', action_route: '/courses' },
  { id: 'node_11', title: 'Full Syllabus Mock Test 1 & Error Review', type: 'MOCK_TEST', subject_id: 'sub_dbms', subject_name: 'DBMS', status: 'LOCKED', deadline: '2026-11-14', estimated_time_minutes: 180, priority: 'HIGH', action_route: '/exams' },
  { id: 'node_12', title: 'End-Semester Final Examination', type: 'END_SEMESTER', subject_id: 'sub_dbms', subject_name: 'DBMS', status: 'LOCKED', deadline: '2026-11-20', estimated_time_minutes: 180, priority: 'CRITICAL', action_route: '/semester-command-center/end-semester' },
];

let slipTests: SlipTest[] = [
  {
    id: 'st_01',
    subject_id: 'sub_dbms',
    subject_name: 'Database Management Systems',
    title: 'Slip Test 1: Normalization & Functional Dependencies',
    date: '2026-10-07',
    units: [3],
    topics: ['3NF Decomposition', 'BCNF Validation', 'Lossless Join Property'],
    marks: 20,
    duration_minutes: 45,
    status: 'SCHEDULED',
    preparation_plan: {
      revision_list: [
        'Review Armstrong Axioms in Notes',
        'Solve 5 dependency canonical cover exercises',
        'Verify 3NF vs BCNF comparison table',
      ],
      practice_questions_count: 8,
      quiz_id: 'quiz_norm_01',
    },
  },
  {
    id: 'st_02',
    subject_id: 'sub_os',
    subject_name: 'Operating Systems',
    title: 'Slip Test 2: Process Synchronization & Classical IPC',
    date: '2026-10-14',
    units: [3],
    topics: ['Dining Philosophers Problem', 'Bounded Buffer Semaphores', 'Peterson Algorithm'],
    marks: 25,
    duration_minutes: 50,
    status: 'SCHEDULED',
    preparation_plan: {
      revision_list: [
        'Understand semaphore wait() and signal() atomic execution',
        'Diagram Peterson solution 2-process synchronization',
      ],
      practice_questions_count: 10,
    },
  },
];

let minorExams: MinorExam[] = [
  {
    id: 'min_01',
    minor_type: 'MINOR_1',
    title: 'Mid-Semester Examination 1',
    start_date: '2026-02-25',
    end_date: '2026-03-02',
    preparation_days_left: 0,
    focus_mode: 'POST_EXAM_ANALYSIS',
    subjects: [
      { subject_id: 'sub_dbms', subject_name: 'DBMS', exam_date: '2026-02-25', units_covered: [1, 2], syllabus_remaining_percent: 0, mock_test_done: true },
      { subject_id: 'sub_os', subject_name: 'Operating Systems', exam_date: '2026-02-27', units_covered: [1, 2], syllabus_remaining_percent: 0, mock_test_done: true },
      { subject_id: 'sub_cn', subject_name: 'Computer Networks', exam_date: '2026-03-01', units_covered: [1, 2], syllabus_remaining_percent: 0, mock_test_done: true },
    ],
  },
  {
    id: 'min_02',
    minor_type: 'MINOR_2',
    title: 'Mid-Semester Examination 2',
    start_date: '2026-10-22',
    end_date: '2026-10-27',
    preparation_days_left: 18,
    focus_mode: 'EXAM_PREPARATION',
    subjects: [
      { subject_id: 'sub_dbms', subject_name: 'DBMS', exam_date: '2026-10-22', units_covered: [3, 4], syllabus_remaining_percent: 20, mock_test_done: false },
      { subject_id: 'sub_os', subject_name: 'Operating Systems', exam_date: '2026-10-24', units_covered: [3, 4], syllabus_remaining_percent: 30, mock_test_done: false },
      { subject_id: 'sub_cn', subject_name: 'Computer Networks', exam_date: '2026-10-26', units_covered: [3, 4], syllabus_remaining_percent: 35, mock_test_done: false },
      { subject_id: 'sub_ml', subject_name: 'Machine Learning', exam_date: '2026-10-27', units_covered: [3, 4], syllabus_remaining_percent: 40, mock_test_done: false },
    ],
  },
];

let endSemReadinessList: EndSemReadiness[] = [
  {
    subject_id: 'sub_dbms',
    subject_name: 'Database Management Systems',
    subject_code: 'CS601PC',
    exam_date: '2026-11-20',
    days_remaining: 47,
    total_units: 5,
    completed_units: 3.8,
    revised_units: 3,
    mock_tests_completed: 1,
    mock_tests_target: 3,
    readiness_percent: 82,
    strong_topics: ['SQL Queries', 'Relational Algebra', 'ACID Properties'],
    weak_topics: ['BCNF Multi-Valued Dependencies', 'Two-Phase Commit (2PC)'],
    end_sem_prep_stream: [
      'Complete Unit 4 (Deadlocks) & Unit 5 (B+ Trees)',
      'Revise Normalization proof algorithms',
      'Solve 2024 & 2025 End-Sem Question Papers',
      'Attempt Full 3-Hour AI Mock Exam',
    ],
  },
  {
    subject_id: 'sub_os',
    subject_name: 'Operating Systems & Concurrency',
    subject_code: 'CS602PC',
    exam_date: '2026-11-23',
    days_remaining: 50,
    total_units: 5,
    completed_units: 3.5,
    revised_units: 2,
    mock_tests_completed: 0,
    mock_tests_target: 3,
    readiness_percent: 74,
    strong_topics: ['Process States', 'CPU Scheduling Gantt Charts'],
    weak_topics: ['Bankers Safety Algorithm', 'Page Replacement Inverted Tables'],
    end_sem_prep_stream: [
      'Finish Bankers Deadlock Proofs',
      'Study Virtual Memory Paging and LRU Replacement',
      'Solve previous university 10-mark long-answer questions',
    ],
  },
  {
    subject_id: 'sub_cn',
    subject_name: 'Computer Networks',
    subject_code: 'CS603PC',
    exam_date: '2026-11-26',
    days_remaining: 53,
    total_units: 5,
    completed_units: 3.2,
    revised_units: 2,
    mock_tests_completed: 0,
    mock_tests_target: 2,
    readiness_percent: 68,
    strong_topics: ['OSI Model Layers', 'Framing & CRC Error Detection'],
    weak_topics: ['TCP Congestion Window Dynamics (AIMD)', 'Subnet Masking Calculations'],
    end_sem_prep_stream: [
      'Practice 15 Numerical Problems on CIDR / Subnetting',
      'Deep dive into TCP 3-Way Handshake & FIN state machine',
      'Take Computer Networks Midterm Mock Quiz',
    ],
  },
  {
    subject_id: 'sub_ml',
    subject_name: 'Machine Learning',
    subject_code: 'CS604PE',
    exam_date: '2026-11-29',
    days_remaining: 56,
    total_units: 5,
    completed_units: 3.0,
    revised_units: 1,
    mock_tests_completed: 0,
    mock_tests_target: 2,
    readiness_percent: 63,
    strong_topics: ['Linear Regression Matrix Formulation', 'Decision Tree Gini Index'],
    weak_topics: ['Backpropagation Gradient Derivation', 'Support Vector Machine Kernels'],
    end_sem_prep_stream: [
      'Derive Backprop calculus on paper with step-by-step weight updates',
      'Review SVM hyperplane margin formulation',
      'Execute Jupyter notebook ML experiments in ML Lab',
    ],
  },
];

let recoveryPlans: AcademicRecoveryPlan[] = [
  {
    id: 'rec_01',
    missed_item_title: 'Missed DBMS Unit 3 Practice Session (Functional Dependencies)',
    missed_item_type: 'STUDY_SESSION',
    missed_date: '2026-10-02',
    urgency: 'HIGH',
    is_resolved: false,
    recommendations: [
      'Do not attempt to squeeze 3 hours into one night. The recovery plan distributes it over 3 days.',
      'Priority: High because Slip Test on Unit 3 is in 3 days.',
    ],
    schedule_adjustments: [
      { day: 'Today', duration_minutes: 45, task: 'Complete Canonical Cover & 3NF decomposition examples', type: 'STUDY' },
      { day: 'Tomorrow', duration_minutes: 30, task: 'Solve 6 practice questions on BCNF validation', type: 'PRACTICE' },
      { day: 'Day 3', duration_minutes: 20, task: 'Quick Flashcard review of Armstrong Axioms', type: 'REVISION' },
      { day: 'Day 4', duration_minutes: 15, task: 'Attempt 10-question Normalization Checkpoint Quiz', type: 'QUIZ' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Per-student state.
// The arrays above are the original demo seed. They are copied only for the demo
// accounts; every other student starts empty and builds their own semester from the
// syllabus they entered during onboarding plus what they add on this page.
// ---------------------------------------------------------------------------
const DEMO_STUDENT_IDS = new Set(['std_demo_1', 'std_01j8k9x2p4', 'std_demo_btech']);

interface TopicProgress {
  completed: boolean;
  revision_count: number;
}

export interface StudentSemesterState {
  config: AcademicSemesterConfig;
  config_customized: boolean;
  seed_subjects: SemesterSubject[]; // demo accounts only
  custom_subjects: SemesterSubject[];
  topic_progress: Record<string, TopicProgress>;
  events: AcademicEvent[];
  stream_nodes: SemesterStudyStreamNode[];
  slip_tests: SlipTest[];
  minor_exams: MinorExam[];
  end_sem: EndSemReadiness[];
  recovery_plans: AcademicRecoveryPlan[];
  phases: AcademicPhase[];
}

/** Holder object so the snapshot persistence can save and restore the Map. */
export const semesterStateStore: { states: Map<string, StudentSemesterState> } = {
  states: new Map(),
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function blankConfig(studentId: string): AcademicSemesterConfig {
  const now = new Date().toISOString();
  return {
    id: `sem_${studentId}`,
    student_id: studentId,
    semester_number: 1,
    academic_year: '',
    branch: 'CSE' as AcademicSemesterConfig['branch'],
    section: '',
    start_date: '',
    end_date: '',
    total_teaching_weeks: 16,
    current_week: 0,
    current_phase_number: 1,
    daily_study_hours_budget: 0,
    academic_goals: [],
    created_at: now,
    updated_at: now,
  };
}

function stateFor(studentId: string): StudentSemesterState {
  let st = semesterStateStore.states.get(studentId);
  if (st) return st;
  if (DEMO_STUDENT_IDS.has(studentId)) {
    st = {
      config: { ...clone(currentSemesterConfig), student_id: studentId },
      config_customized: true,
      seed_subjects: clone(semesterSubjects),
      custom_subjects: [],
      topic_progress: {},
      events: clone(academicEvents),
      stream_nodes: clone(studyStreamNodes),
      slip_tests: clone(slipTests),
      minor_exams: clone(minorExams),
      end_sem: clone(endSemReadinessList),
      recovery_plans: clone(recoveryPlans),
      phases: clone(academicPhases),
    };
  } else {
    st = {
      config: blankConfig(studentId),
      config_customized: false,
      seed_subjects: [],
      custom_subjects: [],
      topic_progress: {},
      events: [],
      stream_nodes: [],
      slip_tests: [],
      minor_exams: [],
      end_sem: [],
      recovery_plans: [],
      // Generic semester lifecycle without invented dates.
      phases: academicPhases.map((ph) => ({ ...ph, start_date: '', end_date: '', is_current: ph.phase_number === 1 })),
    };
  }
  semesterStateStore.states.set(studentId, st);
  return st;
}

function computeCurrentWeek(cfg: AcademicSemesterConfig): number {
  if (!cfg.start_date) return cfg.current_week || 0;
  const start = new Date(cfg.start_date).getTime();
  if (Number.isNaN(start)) return cfg.current_week || 0;
  const week = Math.floor((Date.now() - start) / (7 * 24 * 3600 * 1000)) + 1;
  return Math.max(0, Math.min(cfg.total_teaching_weeks || week, week));
}

function recalcProgress(sub: SemesterSubject): SemesterSubject {
  const topics = sub.units.flatMap((u) => u.topics || []);
  const done = topics.filter((t) => t.completed).length;
  sub.progress_percent = topics.length ? Math.round((done / topics.length) * 100) : 0;
  sub.syllabus_remaining_percent = 100 - sub.progress_percent;
  for (const u of sub.units) {
    const ut = u.topics || [];
    const ud = ut.filter((t) => t.completed).length;
    u.status = ut.length && ud === ut.length ? 'COMPLETED' : ud > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
  }
  return sub;
}

/** Subjects from the student's onboarding syllabus, with their saved topic progress applied. */
function syllabusSubjects(studentId: string, st: StudentSemesterState): SemesterSubject[] {
  let syllabus: any;
  try {
    syllabus = OnboardingService.getSemesterSyllabusSync(studentId);
  } catch {
    return [];
  }
  if (!syllabus?.subjects?.length) return [];
  const typeMap: Record<string, SemesterSubject['subject_type']> = {
    THEORY: 'CORE', CORE: 'CORE', LAB: 'LAB', PROJECT: 'PROJECT', ELECTIVE: 'ELECTIVE', AUDIT: 'OTHER',
  };
  return syllabus.subjects.map((s: any, idx: number): SemesterSubject => {
    const units: SemesterUnit[] = (s.syllabus_units || []).map((u: any, ui: number) => ({
      id: `unit_${s.id}_${ui}`,
      unit_number: u.unit_number || ui + 1,
      name: u.title || `Unit ${ui + 1}`,
      status: 'NOT_STARTED' as const,
      topics: (u.topics || []).map((t: string, ti: number): SemesterTopic => {
        const id = `topic_${s.id}_${ui}_${ti}`;
        const saved = st.topic_progress[id];
        return {
          id,
          name: t || `Topic ${ti + 1}`,
          estimated_hours: 2,
          conceptual_difficulty: 'MEDIUM',
          practical_difficulty: 'MEDIUM',
          completed: saved?.completed ?? false,
          revision_count: saved?.revision_count ?? 0,
        };
      }),
    }));
    return recalcProgress({
      id: s.id,
      semester_id: st.config.id,
      name: s.name,
      code: s.code || '',
      credits: s.credits || 0,
      subject_type: typeMap[s.subject_type] || 'OTHER',
      difficulty: 'MEDIUM',
      priority: 'MEDIUM',
      progress_percent: 0,
      syllabus_remaining_percent: 100,
      units,
    });
  });
}

function syllabusEvents(studentId: string, subjects: SemesterSubject[]): AcademicEvent[] {
  let syllabus: any;
  try {
    syllabus = OnboardingService.getSemesterSyllabusSync(studentId);
  } catch {
    return [];
  }
  if (!syllabus?.academic_dates?.length) return [];
  const eventTypeMap: Record<string, AcademicEvent['event_type']> = {
    INTERNAL_EXAM: 'MINOR_1', MINOR_EXAM: 'MINOR_1', SLIP_TEST: 'SLIP_TEST', QUIZ: 'QUIZ',
    LAB_ASSESSMENT: 'LAB_EXAM', ASSIGNMENT: 'ASSIGNMENT', PROJECT_REVIEW: 'PROJECT_REVIEW', END_SEMESTER: 'END_SEMESTER',
  };
  return syllabus.academic_dates.map((d: any): AcademicEvent => ({
    id: d.id,
    student_id: studentId,
    subject_id: d.subject_id || undefined,
    title: d.label || 'Academic date',
    event_type: eventTypeMap[d.type] || 'OTHER',
    date: d.date,
    priority: 'MEDIUM',
    status: new Date(d.date).getTime() < Date.now() ? 'COMPLETED' : 'UPCOMING',
    notes: d.notes,
  }));
}

function allSubjects(studentId: string): SemesterSubject[] {
  const st = stateFor(studentId);
  const fromSyllabus = syllabusSubjects(studentId, st);
  const base = fromSyllabus.length ? fromSyllabus : st.seed_subjects;
  return [...base, ...st.custom_subjects];
}

function effectiveConfig(studentId: string): AcademicSemesterConfig {
  const st = stateFor(studentId);
  let cfg = st.config;
  try {
    const edu = OnboardingService.getEducationProfileSync(studentId);
    if (edu && !st.config_customized) {
      cfg = {
        ...cfg,
        semester_number: edu.current_semester || cfg.semester_number,
        branch: (edu.branch as AcademicSemesterConfig['branch']) || cfg.branch,
      };
    }
  } catch {}
  return { ...cfg, current_week: computeCurrentWeek(cfg) };
}

function deriveGuidance(studentId: string, subjects: SemesterSubject[], st: StudentSemesterState): DailyAcademicGuidance {
  const today = new Date().toISOString().split('T')[0];
  const pending = subjects
    .map((sub) => {
      const unit = sub.units.find((u) => (u.topics || []).some((t) => !t.completed));
      return { sub, unit };
    })
    .filter((x) => x.unit)
    .sort((a, b) => a.sub.progress_percent - b.sub.progress_percent);
  const first = pending[0];
  const second = pending[1];
  const firstTopics = first ? first.unit!.topics.filter((t) => !t.completed).slice(0, 3) : [];
  const dayMs = 24 * 3600 * 1000;
  return {
    date: today,
    primary_focus: {
      subject_name: first?.sub.name || '',
      unit_name: first?.unit?.name || '',
      target_topics: firstTopics.map((t) => t.name),
      estimated_minutes: firstTopics.reduce((a, t) => a + (t.estimated_hours || 0) * 60, 0),
    },
    secondary_focus: {
      subject_name: second?.sub.name || '',
      task_description: second ? `Continue ${second.unit!.name}` : '',
      estimated_minutes: second ? 45 : 0,
    },
    quick_practice: { title: '', action_url: '', count: 0 },
    upcoming_slip_tests: st.slip_tests
      .filter((t) => t.status === 'SCHEDULED' && new Date(t.date).getTime() >= Date.now() - dayMs)
      .map((t) => ({
        subject_name: subjects.find((sub) => sub.id === t.subject_id)?.name || t.title,
        days_left: Math.max(0, Math.ceil((new Date(t.date).getTime() - Date.now()) / dayMs)),
        date: t.date,
      })),
    revision_due: [],
    completed_items: [],
  };
}

function deriveWeeklyReview(cfg: AcademicSemesterConfig, subjects: SemesterSubject[]): WeeklyAcademicReview {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 24 * 3600 * 1000);
  return {
    week_number: cfg.current_week,
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
    // No weekly history is recorded yet, so no deltas or hours are claimed.
    subject_deltas: [],
    strong_topics: subjects.filter((s) => s.progress_percent >= 70).map((s) => s.name),
    needs_attention: subjects.filter((s) => s.units.some((u) => u.topics.length) && s.progress_percent < 30).map((s) => s.name),
    next_week_priorities: [],
    study_hours_completed: 0,
    study_hours_target: Math.round((cfg.daily_study_hours_budget || 0) * 7 * 10) / 10,
  };
}

function requireStudent(studentId?: string): string {
  if (!studentId) throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
  return studentId;
}

const ACADEMIC_EVENT_TYPES = [
  'SEMESTER_START', 'SEMESTER_END', 'CLASS', 'HOLIDAY', 'SLIP_TEST', 'QUIZ', 'ASSIGNMENT', 'LAB', 'LAB_EXAM',
  'MINOR_1', 'MINOR_2', 'MINOR_3', 'PROJECT_REVIEW', 'SEMINAR', 'REVISION', 'STUDY_DAY', 'END_SEMESTER', 'OTHER',
] as const satisfies readonly AcademicEvent['event_type'][];

export const semesterCommandCenterService = {
  // 1. Complete semester overview for one student
  getOverview: (studentIdArg?: string): SemesterOverviewDashboardData => {
    const studentId = requireStudent(studentIdArg);
    const st = stateFor(studentId);
    const config = effectiveConfig(studentId);
    const subjects = allSubjects(studentId);
    const isDemo = DEMO_STUDENT_IDS.has(studentId);
    const events = [...syllabusEvents(studentId, subjects), ...st.events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const activePhase = st.phases.find((ph) => ph.is_current) || st.phases[0];
    const avgSyllabusProgress = Math.round(subjects.reduce((acc, sub) => acc + sub.progress_percent, 0) / Math.max(subjects.length, 1));
    const allTopics = subjects.flatMap((sub) => (sub.units || []).flatMap((u) => u.topics || []));
    const revisedPct = allTopics.length
      ? Math.round((allTopics.filter((t) => (t.revision_count || 0) > 0).length / allTopics.length) * 100)
      : 0;
    const labSubjects = subjects.filter((sub) => sub.subject_type === 'LAB');
    const labPct = labSubjects.length
      ? Math.round(labSubjects.reduce((acc, sub) => acc + sub.progress_percent, 0) / labSubjects.length)
      : 0;
    const pastEvents = events.filter((e) => new Date(e.date).getTime() < Date.now());
    const assessmentPct = events.length ? Math.round((pastEvents.length / events.length) * 100) : 0;

    return {
      config,
      overall_progress_percent: avgSyllabusProgress,
      syllabus_progress_percent: avgSyllabusProgress,
      revision_progress_percent: revisedPct,
      assessment_progress_percent: assessmentPct,
      lab_progress_percent: labPct,
      assignment_progress_percent: 0,
      exam_prep_progress_percent: revisedPct,
      current_phase: activePhase,
      all_phases: st.phases,
      subjects,
      upcoming_events: events.filter((e) => e.status === 'UPCOMING'),
      today_guidance: isDemo ? semesterCommandCenterService.getTodayGuidance() : deriveGuidance(studentId, subjects, st),
      active_recovery_plans: st.recovery_plans.filter((r) => !r.is_resolved),
      latest_weekly_review: isDemo ? semesterCommandCenterService.getLatestWeeklyReview() : deriveWeeklyReview(config, subjects),
    };
  },

  // 2. Setup / Update semester config (only the caller's own config)
  updateConfig: (studentIdArg: string | undefined, configUpdate: Partial<AcademicSemesterConfig>): AcademicSemesterConfig => {
    const studentId = requireStudent(studentIdArg);
    const st = stateFor(studentId);
    const { id: _id, student_id: _sid, created_at: _c, ...allowed } = configUpdate as any;
    if (allowed.target_gpa !== undefined && (typeof allowed.target_gpa !== 'number' || allowed.target_gpa < 0 || allowed.target_gpa > 10)) {
      throw Object.assign(new Error('target_gpa must be a number between 0 and 10'), { statusCode: 400 });
    }
    if (allowed.semester_number !== undefined && (!Number.isInteger(allowed.semester_number) || allowed.semester_number < 1 || allowed.semester_number > 10)) {
      throw Object.assign(new Error('semester_number must be an integer between 1 and 10'), { statusCode: 400 });
    }
    // The first save starts from the profile-derived values so branch/semester are not reset.
    const base = st.config_customized ? st.config : { ...effectiveConfig(studentId) };
    st.config = { ...base, ...allowed, updated_at: new Date().toISOString() };
    st.config_customized = true;
    return effectiveConfig(studentId);
  },

  // 3. Subject management
  getSubjects: (studentIdArg?: string): SemesterSubject[] => allSubjects(requireStudent(studentIdArg)),

  getSubjectById: (studentIdArg: string | undefined, subjectId: string): SemesterSubject | undefined =>
    allSubjects(requireStudent(studentIdArg)).find((sub) => sub.id === subjectId),

  addSubject: (
    studentIdArg: string | undefined,
    subject: Omit<SemesterSubject, 'id' | 'semester_id' | 'progress_percent' | 'syllabus_remaining_percent'>
  ): SemesterSubject => {
    const studentId = requireStudent(studentIdArg);
    if (!subject?.name || !String(subject.name).trim()) {
      throw Object.assign(new Error('Subject name is required'), { statusCode: 400 });
    }
    const st = stateFor(studentId);
    const stamp = Date.now();
    const newSubject: SemesterSubject = recalcProgress({
      ...subject,
      name: String(subject.name).trim(),
      id: `sub_${stamp}`,
      semester_id: st.config.id,
      progress_percent: 0,
      syllabus_remaining_percent: 100,
      units: subject.units || [],
    });
    st.custom_subjects.push(newSubject);
    return newSubject;
  },

  updateSubjectUnits: (studentIdArg: string | undefined, subjectId: string, units: SemesterUnit[]): SemesterSubject => {
    const studentId = requireStudent(studentIdArg);
    if (!Array.isArray(units)) throw Object.assign(new Error('units must be an array'), { statusCode: 400 });
    const st = stateFor(studentId);
    const own = [...st.custom_subjects, ...st.seed_subjects].find((sub) => sub.id === subjectId);
    if (own) {
      own.units = units;
      return recalcProgress(own);
    }
    const fromSyllabus = syllabusSubjects(studentId, st).find((sub) => sub.id === subjectId);
    if (!fromSyllabus) throw Object.assign(new Error('Subject not found'), { statusCode: 404 });
    // Syllabus structure comes from onboarding; only topic progress is stored here.
    const known = new Set(fromSyllabus.units.flatMap((u) => u.topics.map((t) => t.id)));
    for (const u of units) {
      for (const t of u.topics || []) {
        if (known.has(t.id)) st.topic_progress[t.id] = { completed: !!t.completed, revision_count: t.revision_count || 0 };
      }
    }
    return syllabusSubjects(studentId, st).find((sub) => sub.id === subjectId)!;
  },

  // 4. Academic events
  getEvents: (studentIdArg?: string): AcademicEvent[] => {
    const studentId = requireStudent(studentIdArg);
    const st = stateFor(studentId);
    return [...syllabusEvents(studentId, allSubjects(studentId)), ...st.events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  addEvent: (studentIdArg: string | undefined, eventData: Omit<AcademicEvent, 'id' | 'student_id'>): AcademicEvent => {
    const studentId = requireStudent(studentIdArg);
    if (!eventData?.title || !String(eventData.title).trim()) {
      throw Object.assign(new Error('Event title is required'), { statusCode: 400 });
    }
    if (!eventData.date || !/^\d{4}-\d{2}-\d{2}/.test(eventData.date) || Number.isNaN(new Date(eventData.date).getTime())) {
      throw Object.assign(new Error('Event date must be a valid YYYY-MM-DD date'), { statusCode: 400 });
    }
    const st = stateFor(studentId);
    // Only known fields are kept, each within limits, so a request cannot store arbitrary data.
    const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);
    const time = (v: unknown) => (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v) ? v : undefined);
    const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);
    const newEvent: AcademicEvent = {
      title: String(eventData.title).trim().slice(0, 140),
      date: eventData.date.slice(0, 10),
      event_type: pick(eventData.event_type, ACADEMIC_EVENT_TYPES, 'OTHER'),
      priority: pick(eventData.priority, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const, 'MEDIUM') as AcademicEvent['priority'],
      status: pick(eventData.status, ['UPCOMING', 'COMPLETED', 'MISSED', 'CANCELLED'] as const, 'UPCOMING'),
      subject_id: text(eventData.subject_id, 60),
      start_time: time(eventData.start_time),
      end_time: time(eventData.end_time),
      syllabus_scope: text(eventData.syllabus_scope, 300),
      notes: text(eventData.notes, 500),
      id: `ev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      student_id: studentId,
    };
    st.events.push(newEvent);
    st.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return newEvent;
  },

  // 5. Study stream
  getStudyStream: (studentIdArg: string | undefined, subjectId?: string): SemesterStudyStreamNode[] => {
    const st = stateFor(requireStudent(studentIdArg));
    return subjectId ? st.stream_nodes.filter((n) => n.subject_id === subjectId) : st.stream_nodes;
  },

  updateStreamNodeStatus: (
    studentIdArg: string | undefined,
    nodeId: string,
    status: SemesterStudyStreamNode['status']
  ): SemesterStudyStreamNode => {
    const st = stateFor(requireStudent(studentIdArg));
    const node = st.stream_nodes.find((n) => n.id === nodeId);
    if (!node) throw Object.assign(new Error('Stream node not found'), { statusCode: 404 });
    node.status = status;
    if (status === 'COMPLETED') node.actual_time_minutes = node.estimated_time_minutes;
    return node;
  },

  // 6. Slip tests
  getSlipTests: (studentIdArg?: string): SlipTest[] => stateFor(requireStudent(studentIdArg)).slip_tests,

  addSlipTest: (studentIdArg: string | undefined, testData: Omit<SlipTest, 'id'>): SlipTest => {
    const st = stateFor(requireStudent(studentIdArg));
    if (!testData?.title || !testData.date) throw Object.assign(new Error('title and date are required'), { statusCode: 400 });
    const newTest: SlipTest = { ...testData, id: `st_${Date.now()}`, status: testData.status || 'SCHEDULED' };
    st.slip_tests.push(newTest);
    return newTest;
  },

  recordSlipTestScore: (studentIdArg: string | undefined, testId: string, score: number, weakTopics: string[]): SlipTest => {
    const st = stateFor(requireStudent(studentIdArg));
    const test = st.slip_tests.find((t) => t.id === testId);
    if (!test) throw Object.assign(new Error('Slip test not found'), { statusCode: 404 });
    if (typeof score !== 'number' || score < 0 || score > test.marks) {
      throw Object.assign(new Error(`score must be between 0 and ${test.marks}`), { statusCode: 400 });
    }
    const weak = Array.isArray(weakTopics) ? weakTopics : [];
    test.status = 'COMPLETED';
    test.score = score;
    test.weak_topics = weak;
    if (score < test.marks * 0.6) {
      st.recovery_plans.unshift({
        id: `rec_st_${Date.now()}`,
        missed_item_title: `Low score in ${test.title} (${score}/${test.marks})`,
        missed_item_type: 'SLIP_TEST_RECOVERY',
        missed_date: test.date,
        urgency: 'HIGH',
        is_resolved: false,
        recommendations: weak.length ? [`Weak topics you reported: ${weak.join(', ')}.`] : ['Review the topics this test covered.'],
        schedule_adjustments: weak.slice(0, 3).map((t, i) => ({
          day: `Day ${i + 1}`,
          duration_minutes: 30,
          task: `Revise ${t}`,
          type: 'STUDY' as const,
        })),
      });
    }
    return test;
  },

  // 7-9. Minor exams, end-sem readiness, recovery plans
  getMinorExams: (studentIdArg?: string): MinorExam[] => stateFor(requireStudent(studentIdArg)).minor_exams,
  getEndSemReadiness: (studentIdArg?: string): EndSemReadiness[] => stateFor(requireStudent(studentIdArg)).end_sem,
  getRecoveryPlans: (studentIdArg?: string): AcademicRecoveryPlan[] => stateFor(requireStudent(studentIdArg)).recovery_plans,
  resolveRecoveryPlan: (studentIdArg: string | undefined, planId: string): void => {
    const plan = stateFor(requireStudent(studentIdArg)).recovery_plans.find((p) => p.id === planId);
    if (!plan) throw Object.assign(new Error('Recovery plan not found'), { statusCode: 404 });
    plan.is_resolved = true;
  },

  // 10. Today's guidance: the demo seed for demo accounts, derived from subjects for everyone else.
  getGuidanceFor: (studentIdArg?: string): DailyAcademicGuidance => {
    const studentId = requireStudent(studentIdArg);
    if (DEMO_STUDENT_IDS.has(studentId)) return semesterCommandCenterService.getTodayGuidance();
    return deriveGuidance(studentId, allSubjects(studentId), stateFor(studentId));
  },
  getWeeklyReviewFor: (studentIdArg?: string): WeeklyAcademicReview => {
    const studentId = requireStudent(studentIdArg);
    if (DEMO_STUDENT_IDS.has(studentId)) return semesterCommandCenterService.getLatestWeeklyReview();
    return deriveWeeklyReview(effectiveConfig(studentId), allSubjects(studentId));
  },

  // 10. Today's Academic Guidance (Section 19)
  getTodayGuidance: (): DailyAcademicGuidance => {
    return {
      date: new Date().toISOString().split('T')[0],
      primary_focus: {
        subject_name: 'Database Management Systems',
        unit_name: 'Unit 3: Normalization & Functional Dependencies',
        target_topics: ['3NF Decomposition Theorem', 'BCNF Check Algorithm', 'Lossless Join Conditions'],
        estimated_minutes: 90,
      },
      secondary_focus: {
        subject_name: 'Operating Systems',
        task_description: 'Revise Semaphores and Peterson 2-process synchronization in Notes',
        estimated_minutes: 45,
      },
      quick_practice: {
        title: 'Solve 10 Normalization & SQL Queries in SQL Lab',
        action_url: '/sql-lab',
        count: 10,
      },
      upcoming_slip_tests: [
        { subject_name: 'DBMS', days_left: 3, date: '2026-10-07' },
        { subject_name: 'Operating Systems', days_left: 10, date: '2026-10-14' },
      ],
      revision_due: [
        { subject_name: 'Computer Networks', unit_name: 'Unit 2: Subnetting', reason: 'Spaced repetition interval due (7 days since last quiz)' },
      ],
      completed_items: [
        'Reviewed ACID properties in DBMS Unit 4',
      ],
    };
  },

  // 11. Weekly Academic Review (Section 20)
  getLatestWeeklyReview: (): WeeklyAcademicReview => {
    return {
      week_number: 9,
      start_date: '2026-09-28',
      end_date: '2026-10-04',
      subject_deltas: [
        { subject_name: 'DBMS', progress_delta_percent: 14, status: 'AHEAD' },
        { subject_name: 'Operating Systems', progress_delta_percent: 8, status: 'ON_TRACK' },
        { subject_name: 'Computer Networks', progress_delta_percent: 6, status: 'ON_TRACK' },
        { subject_name: 'Machine Learning', progress_delta_percent: 4, status: 'BEHIND' },
      ],
      strong_topics: [
        'DBMS Relational Algebra & Joins',
        'OS Process Scheduling (Round Robin)',
        'ML Decision Tree Formulations',
      ],
      needs_attention: [
        'OS Semaphores & Deadlock Banker Algorithm',
        'ML Backpropagation Matrix Derivation',
      ],
      next_week_priorities: [
        '1. Crack DBMS Slip Test on Normalization (Score >= 18/20)',
        '2. Finish OS Unit 3 Bankers Algorithm proofs',
        '3. Catch up ML Unit 3 Unsupervised Clustering (2 lagging sessions)',
      ],
      study_hours_completed: 21.5,
      study_hours_target: 24.5,
    };
  },
};
