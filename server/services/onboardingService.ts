import crypto from 'crypto';
import { db } from '../db/database';
import { logger } from '../core/logging';
import { NotFoundError, ValidationError } from '../core/exceptions';
import {
  OnboardingStatus,
  OnboardingStepId,
  OnboardingStepStatus,
  BasicProfileData,
  EducationProfile,
  SemesterSyllabusData,
  AcademicSubject,
  AcademicDate,
  LearningPreferences,
  StudentSkillsAssessment,
  SkillSelfAssessment,
  AcademicHistory,
  CareerGoals,
  PortfolioProject,
  StudyConstraints,
  ProfileCompletion,
  ProfileSectionStatus,
  StudentMemoryEntry,
  StudentIntelligenceContext,
  StudentRecommendation,
  StudentAIPersona,
} from '../models/onboardingTypes';
import { EventBus } from '../events/eventBus';
import { GoalService } from './goalService';

// --- In-Memory Stores ---
const onboardingStatuses = new Map<string, OnboardingStatus>();
const educationProfiles = new Map<string, EducationProfile>();
const semesterSyllabusData = new Map<string, SemesterSyllabusData>();
const learningPreferences = new Map<string, LearningPreferences>();
const skillsAssessments = new Map<string, StudentSkillsAssessment>();
const academicHistories = new Map<string, AcademicHistory>();
const careerGoals = new Map<string, CareerGoals>();
const portfolioProjects = new Map<string, PortfolioProject[]>();
const studyConstraints = new Map<string, StudyConstraints>();
const studentMemories = new Map<string, StudentMemoryEntry[]>();
const studentRecommendations = new Map<string, StudentRecommendation[]>();
const studentAIPersonas = new Map<string, StudentAIPersona>();

/** Exposed so the snapshot persistence can save and restore onboarding data across restarts. */
export const onboardingStores = {
  onboardingStatuses,
  educationProfiles,
  semesterSyllabusData,
  learningPreferences,
  skillsAssessments,
  academicHistories,
  careerGoals,
  portfolioProjects,
  studyConstraints,
  studentMemories,
  studentRecommendations,
  studentAIPersonas,
};

export const ONBOARDING_STEPS: { id: OnboardingStepId; label: string }[] = [
  { id: 'ACCOUNT_IDENTITY', label: '1. Account Registration and Identity' },
  { id: 'PERSONAL_PROFILE', label: '2. Personal and General Profile' },
  { id: 'EDUCATION_BACKGROUND', label: '3. Education and Academic Background' },
  { id: 'SEMESTER_SYLLABUS', label: '4. Semester, Subjects, and Syllabus' },
  { id: 'TECHNICAL_SKILLS', label: '5. Technical Skills and Proficiency' },
  { id: 'INTERESTS_TOPICS', label: '6. Interests, Learning Topics, and Knowledge Areas' },
  { id: 'CAREER_GOALS', label: '7. Career Goals and Target Roles' },
  { id: 'LEARNING_GOALS', label: '8. Learning Goals and Personal Development' },
  { id: 'AI_PREFERENCES', label: '9. Learning Preferences and AI Personalization' },
  { id: 'STUDY_SCHEDULE', label: '10. Study Schedule and Availability' },
  { id: 'COURSE_MATERIALS', label: '11. Courses, Study Materials, and Document Preferences' },
  { id: 'PROJECT_PORTFOLIO', label: '12. Project Portfolio and Practical Experience' },
  { id: 'APPLICATIONS_LINKS', label: '13. Career Applications and External Profile Links' },
  { id: 'RESEARCH_COMMUNITY', label: '14. Research, Knowledge Base, and Community Interests' },
  { id: 'FINAL_REVIEW', label: '15. Review, Privacy, Notifications, and Completion' },
];

const STEP_ALIAS_MAP: Record<string, OnboardingStepId> = {
  ACADEMIC_SEMESTER: 'EDUCATION_BACKGROUND',
  SKILLS_CAREER: 'TECHNICAL_SKILLS',
  PREFERENCES_SCHEDULE: 'AI_PREFERENCES',
  REVIEW_COMPLETE: 'FINAL_REVIEW',
  BASIC_PROFILE: 'ACCOUNT_IDENTITY',
  EDUCATION: 'EDUCATION_BACKGROUND',
  SKILLS_ASSESSMENT: 'TECHNICAL_SKILLS',
  LEARNING_PREFERENCES: 'AI_PREFERENCES',
  STUDY_CONSTRAINTS: 'STUDY_SCHEDULE',
  PROJECTS_PORTFOLIO: 'PROJECT_PORTFOLIO',
  ACADEMIC_HISTORY: 'EDUCATION_BACKGROUND',
};

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export class OnboardingService {
  // === ONBOARDING STATUS ===

  public static async getOnboardingStatus(studentId: string): Promise<OnboardingStatus> {
    let status = onboardingStatuses.get(studentId);
    if (!status) {
      const now = new Date().toISOString();
      status = {
        student_id: studentId,
        is_complete: false,
        current_step: 'ACCOUNT_IDENTITY',
        steps: ONBOARDING_STEPS.map((s) => ({
          step_id: s.id,
          label: s.label,
          completed: false,
          skipped: false,
          updated_at: null,
        })),
        started_at: now,
        completed_at: null,
        last_saved_at: now,
      };
      onboardingStatuses.set(studentId, status);
    }
    return status;
  }

  public static async updateOnboardingStep(
    studentId: string,
    stepId: OnboardingStepId,
    completed: boolean,
    skipped: boolean = false
  ): Promise<OnboardingStatus> {
    const status = await this.getOnboardingStatus(studentId);
    const now = new Date().toISOString();

    const targetId = STEP_ALIAS_MAP[stepId] || stepId;
    const step = status.steps.find((s) => s.step_id === stepId || s.step_id === targetId);
    if (step) {
      step.completed = completed;
      step.skipped = skipped;
      step.updated_at = now;
    }

    // Auto-advance current step
    const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === (step ? step.step_id : targetId));
    if (completed && currentIndex >= 0 && currentIndex < ONBOARDING_STEPS.length - 1) {
      status.current_step = ONBOARDING_STEPS[currentIndex + 1].id;
    }

    status.last_saved_at = now;
    onboardingStatuses.set(studentId, status);
    return status;
  }

  public static async completeOnboarding(studentId: string): Promise<OnboardingStatus> {
    const status = await this.getOnboardingStatus(studentId);
    const now = new Date().toISOString();

    // Mark all steps as at least reviewed
    status.is_complete = true;
    status.completed_at = now;
    status.current_step = 'FINAL_REVIEW';
    status.last_saved_at = now;

    // Mark all steps as completed
    for (const step of status.steps) {
      if (!step.completed) {
        step.completed = true;
        step.updated_at = now;
      }
    }

    onboardingStatuses.set(studentId, status);

    // Update authoritative student record in DB
    try {
      const student = await db.getStudentById(studentId);
      const edu = educationProfiles.get(studentId);
      if (student) {
        await db.updateStudent(studentId, {
          onboarding_completed: true,
          branch: edu?.branch || student.branch,
          semester: edu?.current_semester || student.semester,
        } as any);
      }
    } catch (err) {
      logger.warn(`Failed to update student onboarding status: ${err}`);
    }

    // Initialize notification preferences
    try {
      await db.updateNotificationPreferences(studentId, {
        study_reminders: true,
        revision_reminders: true,
        goal_deadlines: true,
        exam_reminders: true,
        in_app: true,
      } as any);
    } catch (err) {
      logger.warn(`Failed to initialize notification preferences: ${err}`);
    }

    // Initialize initial learning goals grounded in student's academic and career targets
    try {
      const existingGoals = await db.getStudentGoals(studentId);
      if (existingGoals.length === 0) {
        const car = careerGoals.get(studentId);
        const sem = semesterSyllabusData.get(studentId);

        if (car?.target_job_role) {
          await GoalService.createGoal(studentId, {
            title: `Prepare for ${car.target_job_role} Role`,
            description: `Complete foundational skills and practical projects targeted for ${car.target_job_role}.`,
            category: 'CAREER',
            priority: 'HIGH',
            target_value: 100,
            current_value: 0,
            progress_percentage: 0,
            unit: '%',
            milestones: [
              { id: 'm_car_1', title: 'Complete core technical roadmap', completed: false, is_completed: false },
              { id: 'm_car_2', title: 'Build and showcase 2 practical projects', completed: false, is_completed: false },
              { id: 'm_car_3', title: 'Complete mock technical interview session', completed: false, is_completed: false },
            ],
          });
        }

        if (sem?.subjects?.length) {
          const firstSubject = sem.subjects[0];
          await GoalService.createGoal(studentId, {
            title: `Master ${firstSubject.name}`,
            description: `Cover all units, complete lab experiments, and achieve 85%+ on slip tests.`,
            category: 'COURSES',
            priority: 'HIGH',
            target_value: 100,
            current_value: 0,
            progress_percentage: 0,
            unit: '%',
            milestones: [
              { id: 'm_acad_1', title: 'Review Unit 1 & 2 Syllabus Notes', completed: false, is_completed: false },
              { id: 'm_acad_2', title: 'Attempt AI Subject Checkpoint Quiz', completed: false, is_completed: false },
              { id: 'm_acad_3', title: 'Revise with Spaced Flashcards', completed: false, is_completed: false },
            ],
          });
        }
      }
    } catch (err) {
      logger.warn(`Failed to initialize onboarding learning goals: ${err}`);
    }

    // Auto-synthesize dedicated AI companion persona
    try {
      await this.getOrGenerateAIPersona(studentId);
    } catch (err) {
      logger.warn(`Failed to synthesize AI companion persona during completion: ${err}`);
    }

    // Publish events
    try {
      const eventBus = EventBus.getInstance();
      await eventBus.publish('ONBOARDING_COMPLETED', { studentId, completedAt: now }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
      await eventBus.publish('STUDENT_PROFILE_UPDATED', { studentId, action: 'ONBOARDING_COMPLETED' }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
    } catch (err) {
      logger.warn(`Failed to publish onboarding complete event: ${err}`);
    }

    return status;
  }

  // === EDUCATION PROFILE ===

  public static async getEducationProfile(studentId: string): Promise<EducationProfile | null> {
    return educationProfiles.get(studentId) || null;
  }

  public static async saveEducationProfile(studentId: string, data: Partial<EducationProfile>): Promise<EducationProfile> {
    const now = new Date().toISOString();
    const existing = educationProfiles.get(studentId);

    const profile: EducationProfile = {
      student_id: studentId,
      degree: data.degree || existing?.degree || 'B.Tech',
      branch: data.branch || existing?.branch || '',
      specialization: data.specialization ?? existing?.specialization,
      institution: data.institution || existing?.institution || '',
      university: data.university ?? existing?.university,
      current_year: data.current_year || existing?.current_year || 1,
      current_semester: data.current_semester || existing?.current_semester || 1,
      admission_year: data.admission_year ?? existing?.admission_year,
      expected_graduation_year: data.expected_graduation_year || existing?.expected_graduation_year || 2028,
      study_mode: data.study_mode || existing?.study_mode || 'FULL_TIME',
      education_status: data.education_status ?? existing?.education_status,
      previous_qualification: data.previous_qualification ?? existing?.previous_qualification,
      current_cgpa: data.current_cgpa ?? existing?.current_cgpa,
      cgpa_scale: data.cgpa_scale ?? existing?.cgpa_scale,
      academic_interests: data.academic_interests ?? existing?.academic_interests,
      current_subjects: data.current_subjects || existing?.current_subjects || [],
      previous_subjects: data.previous_subjects ?? existing?.previous_subjects,
      previous_marks: data.previous_marks ?? existing?.previous_marks,
      achievements: data.achievements ?? existing?.achievements,
      certifications: data.certifications ?? existing?.certifications,
      completed_courses: data.completed_courses ?? existing?.completed_courses,
      current_challenges: data.current_challenges ?? existing?.current_challenges,
      // Pre-B.Tech Heritage & Entrance Performance:
      tenth_board: data.tenth_board ?? existing?.tenth_board,
      tenth_percentage: data.tenth_percentage ?? existing?.tenth_percentage,
      twelfth_or_diploma: data.twelfth_or_diploma ?? existing?.twelfth_or_diploma,
      twelfth_stream: data.twelfth_stream ?? existing?.twelfth_stream,
      twelfth_percentage: data.twelfth_percentage ?? existing?.twelfth_percentage,
      entrance_exam_name: data.entrance_exam_name ?? existing?.entrance_exam_name,
      entrance_exam_rank: data.entrance_exam_rank ?? existing?.entrance_exam_rank,
      // Socio-Economic Context:
      first_generation_engineer: data.first_generation_engineer ?? existing?.first_generation_engineer,
      family_context_note: data.family_context_note ?? existing?.family_context_note,
      financial_urgency: data.financial_urgency ?? existing?.financial_urgency,
      education_loan_active: data.education_loan_active ?? existing?.education_loan_active,
      updated_at: now,
    };

    educationProfiles.set(studentId, profile);

    // Auto-generate semester syllabus if not yet initialized
    if (!semesterSyllabusData.has(studentId)) {
      this.generateDefaultSyllabus(studentId, profile.branch, profile.current_semester);
    }

    // Sync basic fields to main student record
    try {
      const student = await db.getStudentById(studentId);
      if (student) {
        await db.updateStudentProfile(studentId, {
          branch: profile.branch,
          semester: profile.current_semester,
          graduation_year: profile.expected_graduation_year,
        });
      }
    } catch (err) {
      logger.warn(`Failed to sync education profile to student record: ${err}`);
    }

    await this.updateOnboardingStep(studentId, 'EDUCATION', true);
    try {
      const eventBus = EventBus.getInstance();
      await eventBus.publish('EDUCATION_PROFILE_UPDATED', { studentId, degree: profile.degree, branch: profile.branch }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
    } catch {}

    return profile;
  }

  public static getEducationProfileSync(studentId: string): EducationProfile | null {
    return educationProfiles.get(studentId) || null;
  }

  // === SEMESTER & SYLLABUS ===

  public static generateDefaultSyllabus(studentId: string, branch: string, semester: number): SemesterSyllabusData {
    const b = (branch || '').toLowerCase();
    const sem = semester || 1;
    let subjectsData: { name: string; code: string; credits: number; units: { title: string; topics: string[] }[] }[] = [];

    if (b.includes('ai') || b.includes('machine learning') || b.includes('ml')) {
      if (sem <= 3) {
        subjectsData = [
          { name: 'Python for Problem Solving & Data Structures', code: 'AI201', credits: 4, units: [
            { title: 'Data Structures in Python', topics: ['Lists, Tuples, Dictionaries', 'Stacks & Queues', 'Hash Maps'] },
            { title: 'Object-Oriented Programming', topics: ['Classes, Inheritance, Polymorphism', 'Dunder Methods'] },
            { title: 'NumPy & Vectorization', topics: ['Array Slicing', 'Broadcasting', 'Linear Algebra Operations'] },
            { title: 'Pandas & Data Manipulation', topics: ['DataFrames', 'Groupby', 'Missing Value Imputation'] },
          ]},
          { name: 'Engineering Mathematics & Linear Algebra', code: 'AI202', credits: 4, units: [
            { title: 'Vector Spaces & Subspaces', topics: ['Basis', 'Dimension', 'Null Space', 'Rank'] },
            { title: 'Matrix Factorizations', topics: ['LU Decomposition', 'QR Decomposition', 'Singular Value Decomposition (SVD)'] },
            { title: 'Differential Calculus & Optimization', topics: ['Partial Derivatives', 'Gradients', 'Hessian Matrix'] },
            { title: 'Probability Distributions', topics: ['Gaussian', 'Bernoulli', 'Poisson', 'Bayes Theorem'] },
          ]},
          { name: 'Digital Logic & Computer Systems', code: 'AI203', credits: 3, units: [
            { title: 'Boolean Algebra & Logic Gates', topics: ['K-Maps', 'Combinational Circuits', 'Multiplexers'] },
            { title: 'Sequential Circuits & Memory', topics: ['Flip-Flops', 'Registers', 'Finite State Machines'] },
          ]},
        ];
      } else {
        subjectsData = [
          { name: 'Machine Learning Foundations', code: `AI${sem}01`, credits: 4, units: [
            { title: 'Supervised Learning', topics: ['Linear Regression', 'Logistic Regression', 'Support Vector Machines (SVM)'] },
            { title: 'Decision Trees & Ensembles', topics: ['Random Forests', 'Gradient Boosting (XGBoost)', 'AdaBoost'] },
            { title: 'Unsupervised Learning', topics: ['K-Means Clustering', 'Hierarchical Clustering', 'PCA Dimensionality Reduction'] },
            { title: 'Model Evaluation & Bias-Variance', topics: ['Cross-Validation', 'ROC-AUC Curves', 'L1/L2 Regularization'] },
          ]},
          { name: 'Deep Learning & Neural Networks', code: `AI${sem}02`, credits: 4, units: [
            { title: 'Feedforward Architectures', topics: ['Perceptrons', 'Backpropagation', 'Activation Functions', 'Loss Surfaces'] },
            { title: 'Convolutional Neural Networks', topics: ['Conv2D Layers', 'ResNet Residual Blocks', 'Batch Normalization'] },
            { title: 'Sequence Models & Attention', topics: ['LSTM', 'GRU', 'Sequence-to-Sequence', 'Self-Attention Mechanism'] },
            { title: 'Transformer Architectures & LLMs', topics: ['Multi-Head Attention', 'Positional Encoding', 'Transformer Encoders & Decoders'] },
          ]},
          { name: 'Natural Language Processing', code: `AI${sem}03`, credits: 3, units: [
            { title: 'Text Representation & Tokenization', topics: ['Byte Pair Encoding (BPE)', 'Word2Vec', 'TF-IDF', 'Sentence Embeddings'] },
            { title: 'Sequence Modeling & NER', topics: ['Named Entity Recognition', 'POS Tagging', 'Transformers for NLP'] },
            { title: 'Generative AI & RAG Systems', topics: ['Vector Databases', 'Prompt Engineering', 'Retrieval-Augmented Generation'] },
          ]},
          { name: 'Computer Vision & Visual Perception', code: `AI${sem}04`, credits: 3, units: [
            { title: 'Image Processing & Filters', topics: ['Spatial Filtering', 'Edge Detection (Canny)', 'Fourier Transforms'] },
            { title: 'Object Detection & Segmentation', topics: ['YOLO Architectures', 'Faster R-CNN', 'U-Net Semantic Segmentation'] },
          ]},
        ];
      }
    } else if (b.includes('data science') || b.includes('analytics')) {
      subjectsData = [
        { name: 'Data Structures & Algorithms', code: `DS${sem}01`, credits: 4, units: [
          { title: 'Linear & Non-Linear Structures', topics: ['Linked Lists', 'Binary Trees', 'Hash Tables', 'Heaps'] },
          { title: 'Algorithm Design', topics: ['Divide and Conquer', 'Greedy Algorithms', 'Dynamic Programming'] },
        ]},
        { name: 'Relational & NoSQL Database Systems', code: `DS${sem}02`, credits: 4, units: [
          { title: 'Advanced SQL & Query Tuning', topics: ['Window Functions', 'Query Execution Plans', 'B+ Tree Indexing'] },
          { title: 'Distributed NoSQL Databases', topics: ['MongoDB Document Store', 'Cassandra Wide-Column', 'Redis Key-Value'] },
        ]},
        { name: 'Statistical Machine Learning', code: `DS${sem}03`, credits: 4, units: [
          { title: 'Supervised Models', topics: ['Regression Analysis', 'Decision Trees', 'Ensemble Learning'] },
          { title: 'Dimensionality & Clustering', topics: ['PCA', 't-SNE', 'K-Means Clustering', 'Anomaly Detection'] },
        ]},
        { name: 'Data Warehousing & Cloud Pipelines', code: `DS${sem}04`, credits: 3, units: [
          { title: 'Data Warehouse Architecture', topics: ['Star Schema', 'Snowflake Schema', 'SCD Types', 'OLAP Cubes'] },
          { title: 'Data Orchestration', topics: ['Apache Spark', 'Kafka Streaming', 'Airflow Pipelines'] },
        ]},
      ];
    } else if (b.includes('electronics') || b.includes('ece') || b.includes('communication')) {
      subjectsData = [
        { name: 'Signals & Systems', code: `EC${sem}01`, credits: 4, units: [
          { title: 'Continuous & Discrete Signals', topics: ['Signal Operations', 'LTI Systems', 'Convolution Integral'] },
          { title: 'Frequency Domain Transforms', topics: ['Fourier Series', 'Fourier Transform', 'Laplace Transform', 'Z-Transform'] },
        ]},
        { name: 'Digital Signal Processing', code: `EC${sem}02`, credits: 4, units: [
          { title: 'Discrete Fourier Transform', topics: ['DFT Properties', 'FFT Radix-2 Algorithms', 'Spectral Analysis'] },
          { title: 'Digital Filter Design', topics: ['FIR Filter Design', 'IIR Butterworth & Chebyshev Filters'] },
        ]},
        { name: 'Microprocessors & Microcontrollers', code: `EC${sem}03`, credits: 4, units: [
          { title: 'Microprocessor Architecture', topics: ['8086 Instruction Set', 'Assembly Programming', 'Memory Interfacing'] },
          { title: 'ARM Microcontrollers & Peripherals', topics: ['ARM Cortex', 'Timers, ADC, UART, SPI', 'Interrupt Handling'] },
        ]},
        { name: 'Analog & Digital Communications', code: `EC${sem}04`, credits: 3, units: [
          { title: 'Modulation & Demodulation', topics: ['AM, FM Modulation', 'PCM, DPCM, Delta Modulation'] },
          { title: 'Digital Bandpass Systems', topics: ['BPSK, QPSK, QAM', 'Bit Error Rate Analysis', 'Matched Filters'] },
        ]},
      ];
    } else {
      // Default CSE / IT / General Software Engineering
      if (sem <= 3) {
        subjectsData = [
          { name: 'Data Structures & Algorithms', code: `CS${sem}01`, credits: 4, units: [
            { title: 'Linear Data Structures', topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues'] },
            { title: 'Trees & Hierarchical Structures', topics: ['Binary Search Trees', 'Heaps', 'AVL Trees'] },
            { title: 'Graph Algorithms', topics: ['BFS & DFS', 'Dijkstra Shortest Path', 'Topological Sort'] },
            { title: 'Dynamic Programming', topics: ['0/1 Knapsack', 'Longest Common Subsequence', 'Matrix Chain Multiplication'] },
          ]},
          { name: 'Object Oriented Programming with Java', code: `CS${sem}02`, credits: 4, units: [
            { title: 'OOP Principles', topics: ['Classes & Objects', 'Encapsulation', 'Inheritance', 'Polymorphism'] },
            { title: 'Advanced Java Constructs', topics: ['Interfaces & Abstract Classes', 'Exception Handling', 'Multithreading', 'Generics'] },
          ]},
          { name: 'Computer Organization & Architecture', code: `CS${sem}03`, credits: 3, units: [
            { title: 'Processor Design', topics: ['ALU', 'Instruction Sets', 'Addressing Modes', 'Pipelining & Hazards'] },
            { title: 'Memory Hierarchy', topics: ['Cache Mapping Techniques', 'Virtual Memory & Paging', 'Bus Systems'] },
          ]},
          { name: 'Discrete Mathematics', code: `CS${sem}04`, credits: 3, units: [
            { title: 'Logic & Proofs', topics: ['Propositional Logic', 'Predicate Calculus', 'Induction'] },
            { title: 'Relations & Graph Theory', topics: ['Equivalence Relations', 'Euler Paths', 'Trees & Colorings'] },
          ]},
        ];
      } else {
        subjectsData = [
          { name: 'Database Management Systems', code: `CS${sem}01`, credits: 4, units: [
            { title: 'Database Architecture & ER Modeling', topics: ['DBMS Architecture', 'ER Diagrams', 'Relational Algebra'] },
            { title: 'Relational Model & Advanced SQL', topics: ['Complex Joins', 'Nested Subqueries', 'Views', 'Triggers & Procedures'] },
            { title: 'Schema Refinement & Normalization', topics: ['Functional Dependencies', '1NF, 2NF, 3NF, BCNF', 'Lossless Joins'] },
            { title: 'Transaction Management & Concurrency', topics: ['ACID Properties', 'Two-Phase Locking (2PL)', 'Deadlock Handling', 'Crash Recovery'] },
          ]},
          { name: 'Operating Systems', code: `CS${sem}02`, credits: 4, units: [
            { title: 'OS Architecture & System Calls', topics: ['Kernel Structures', 'Process Control Block (PCB)', 'Dual-Mode Operations'] },
            { title: 'Process Synchronization & IPC', topics: ['Critical Section Problem', 'Semaphores', 'Classical IPC Problems', 'Mutexes'] },
            { title: 'CPU Scheduling & Deadlocks', topics: ['Round Robin, Priority, Multilevel Feedback', 'Banker Algorithm'] },
            { title: 'Memory Management & File Systems', topics: ['Paging & Segmentation', 'Virtual Memory Page Replacement (LRU)', 'Inode File Systems'] },
          ]},
          { name: 'Computer Networks', code: `CS${sem}03`, credits: 3, units: [
            { title: 'Network Layering & Architecture', topics: ['OSI 7-Layer Model', 'TCP/IP Protocol Suite', 'Transmission Media'] },
            { title: 'Data Link Layer & MAC', topics: ['Framing', 'Error Detection (CRC)', 'Flow Control', 'Ethernet CSMA/CD'] },
            { title: 'Network Layer & Routing', topics: ['IPv4 & IPv6 Addressing', 'Subnetting & CIDR', 'Routing Protocols (OSPF, BGP)'] },
            { title: 'Transport & Application Layers', topics: ['TCP 3-Way Handshake', 'UDP', 'Congestion Control', 'DNS, HTTP/2, TLS Security'] },
          ]},
          { name: 'Design and Analysis of Algorithms', code: `CS${sem}04`, credits: 4, units: [
            { title: 'Asymptotic Analysis & Recurrences', topics: ['Big O, Omega, Theta', 'Master Theorem', 'Divide & Conquer'] },
            { title: 'Advanced Dynamic Programming', topics: ['Optimal Substructure', 'Longest Common Subsequence', 'Subset Sum'] },
            { title: 'Graph Flow & Matching', topics: ['Ford-Fulkerson Max Flow', 'Bipartite Matching', 'String Algorithms'] },
            { title: 'NP-Completeness & Complexity', topics: ['P vs NP', 'NP-Complete Reductions', 'Approximation Algorithms'] },
          ]},
        ];
      }
    }

    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatDate = (daysAhead: number) => {
      const d = new Date(now.getTime() + daysAhead * 24 * 3600 * 1000);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const subjects: AcademicSubject[] = subjectsData.map((s, idx) => ({
      id: `subj_${studentId}_${idx + 1}`,
      name: s.name,
      code: s.code,
      credits: s.credits,
      subject_type: 'CORE',
      syllabus_units: s.units.map((u, ui) => ({
        unit_number: ui + 1,
        title: u.title,
        topics: u.topics,
      })),
    }));

    const academic_dates: AcademicDate[] = [
      {
        id: `date_slip_${studentId}`,
        label: `Slip Test: ${subjects[0]?.name || 'Core Foundations'} (estimated)`,
        date: formatDate(14),
        type: 'SLIP_TEST',
        subject_id: subjects[0]?.id,
        notes: 'Covers Unit 1 & Unit 2 core fundamentals. Estimated date from a typical semester calendar: replace it with your college\'s actual date.',
        is_estimate: true,
      },
      {
        id: `date_internal_${studentId}`,
        label: `Mid-Semester Internal Exam (estimated)`,
        date: formatDate(35),
        type: 'INTERNAL_EXAM',
        subject_id: subjects[0]?.id,
        notes: 'Midterm assessment across all enrolled subjects. Estimated date from a typical semester calendar: replace it with your college\'s actual date.',
        is_estimate: true,
      },
      {
        id: `date_endsem_${studentId}`,
        label: `End-Semester Final Examinations (estimated)`,
        date: formatDate(85),
        type: 'END_SEMESTER',
        subject_id: subjects[0]?.id,
        notes: 'Comprehensive university degree exams. Estimated date from a typical semester calendar: replace it with your college\'s actual date.',
        is_estimate: true,
      },
    ];

    const syllabus: SemesterSyllabusData = {
      student_id: studentId,
      academic_year: `${now.getFullYear()}-${now.getFullYear() + 1}`,
      semester_number: sem,
      subjects,
      academic_dates,
      semester_start_date: formatDate(-30),
      semester_end_date: formatDate(90),
      is_template: true,
      updated_at: now.toISOString(),
    };

    semesterSyllabusData.set(studentId, syllabus);
    return syllabus;
  }

  public static async getSemesterSyllabus(studentId: string): Promise<SemesterSyllabusData | null> {
    return this.getSemesterSyllabusSync(studentId);
  }

  public static getSemesterSyllabusSync(studentId: string): SemesterSyllabusData | null {
    let s = semesterSyllabusData.get(studentId);
    if (!s) {
      const edu = educationProfiles.get(studentId);
      if (edu) {
        s = this.generateDefaultSyllabus(studentId, edu.branch, edu.current_semester);
      }
    }
    return s || null;
  }

  public static async saveSemesterSyllabus(studentId: string, data: Partial<SemesterSyllabusData>): Promise<SemesterSyllabusData> {
    const now = new Date().toISOString();
    const existing = semesterSyllabusData.get(studentId);

    const syllabus: SemesterSyllabusData = {
      student_id: studentId,
      academic_year: data.academic_year || existing?.academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semester_number: data.semester_number || existing?.semester_number || 1,
      subjects: data.subjects || existing?.subjects || [],
      academic_dates: data.academic_dates || existing?.academic_dates || [],
      semester_start_date: data.semester_start_date ?? existing?.semester_start_date,
      semester_end_date: data.semester_end_date ?? existing?.semester_end_date,
      syllabus_reference: data.syllabus_reference ?? existing?.syllabus_reference,
      academic_priorities: data.academic_priorities ?? existing?.academic_priorities,
      study_materials_notes: data.study_materials_notes ?? existing?.study_materials_notes,
      is_template: false,
      updated_at: now,
    };

    // Auto-generate IDs for subjects and dates without them
    syllabus.subjects = syllabus.subjects.map((s, i) => ({
      ...s,
      id: s.id || generateId(`subj_${i}`),
    }));
    syllabus.academic_dates = syllabus.academic_dates.map((d, i) => ({
      ...d,
      id: d.id || generateId(`adate_${i}`),
    }));

    semesterSyllabusData.set(studentId, syllabus);
    await this.updateOnboardingStep(studentId, 'SEMESTER_SYLLABUS', true);

    try {
      const eventBus = EventBus.getInstance();
      await eventBus.publish('SYLLABUS_UPDATED', { studentId, subjectsCount: syllabus.subjects.length }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
      await eventBus.publish('SEMESTER_UPDATED', { studentId, semesterNumber: syllabus.semester_number }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
    } catch {}

    return syllabus;
  }

  // === LEARNING PREFERENCES ===

  public static async getLearningPreferences(studentId: string): Promise<LearningPreferences | null> {
    return learningPreferences.get(studentId) || null;
  }

  public static getLearningPreferencesSync(studentId: string): LearningPreferences | null {
    return learningPreferences.get(studentId) || null;
  }

  public static async saveLearningPreferences(studentId: string, data: Partial<LearningPreferences>): Promise<LearningPreferences> {
    const now = new Date().toISOString();
    const existing = learningPreferences.get(studentId);

    const prefs: LearningPreferences = {
      student_id: studentId,
      favorite_subjects: data.favorite_subjects || existing?.favorite_subjects || [],
      topics_of_interest: data.topics_of_interest || existing?.topics_of_interest || [],
      difficult_topics: data.difficult_topics || existing?.difficult_topics || [],
      preferred_programming_languages: data.preferred_programming_languages || existing?.preferred_programming_languages || [],
      learning_style: data.learning_style || existing?.learning_style || 'MIXED',
      explanation_depth: data.explanation_depth || existing?.explanation_depth || 'STANDARD',
      preferred_explanation_language: data.preferred_explanation_language || existing?.preferred_explanation_language || 'English',
      video_preference: data.video_preference ?? existing?.video_preference ?? true,
      text_preference: data.text_preference ?? existing?.text_preference ?? true,
      practical_coding_preference: data.practical_coding_preference ?? existing?.practical_coding_preference ?? true,
      visual_preference: data.visual_preference ?? existing?.visual_preference ?? true,
      weekday_study_hours: data.weekday_study_hours ?? existing?.weekday_study_hours ?? 3,
      weekend_study_hours: data.weekend_study_hours ?? existing?.weekend_study_hours ?? 5,
      preferred_study_time: data.preferred_study_time || existing?.preferred_study_time || 'EVENING',
      revision_frequency: data.revision_frequency || existing?.revision_frequency || 'WEEKLY',
      additional_languages: data.additional_languages ?? existing?.additional_languages,
      preferred_content_format: data.preferred_content_format ?? existing?.preferred_content_format,
      difficulty_level: data.difficulty_level ?? existing?.difficulty_level,
      step_by_step_preference: data.step_by_step_preference ?? existing?.step_by_step_preference,
      theory_practice_balance: data.theory_practice_balance ?? existing?.theory_practice_balance,
      ai_response_length: data.ai_response_length ?? existing?.ai_response_length,
      note_format_preference: data.note_format_preference ?? existing?.note_format_preference,
      flashcard_format_preference: data.flashcard_format_preference ?? existing?.flashcard_format_preference,
      quiz_difficulty_preference: data.quiz_difficulty_preference ?? existing?.quiz_difficulty_preference,
      practice_frequency_preference: data.practice_frequency_preference ?? existing?.practice_frequency_preference,
      document_summary_length: data.document_summary_length ?? existing?.document_summary_length,
      citation_style_preference: data.citation_style_preference ?? existing?.citation_style_preference,
      resource_links: data.resource_links ?? existing?.resource_links,
      learning_pace: data.learning_pace ?? existing?.learning_pace,
      updated_at: now,
    };

    learningPreferences.set(studentId, prefs);
    await this.updateOnboardingStep(studentId, 'LEARNING_PREFERENCES', true);
    return prefs;
  }

  // === SKILLS ASSESSMENT ===

  public static async getSkillsAssessment(studentId: string): Promise<StudentSkillsAssessment | null> {
    return skillsAssessments.get(studentId) || null;
  }

  public static getSkillsAssessmentSync(studentId: string): StudentSkillsAssessment | null {
    return skillsAssessments.get(studentId) || null;
  }

  public static async saveSkillsAssessment(studentId: string, data: Partial<StudentSkillsAssessment>): Promise<StudentSkillsAssessment> {
    const now = new Date().toISOString();
    const existing = skillsAssessments.get(studentId);

    const assessment: StudentSkillsAssessment = {
      student_id: studentId,
      skills: data.skills || existing?.skills || [],
      additional_skills: data.additional_skills || existing?.additional_skills || [],
      certifications: data.certifications ?? existing?.certifications,
      practical_experience: data.practical_experience ?? existing?.practical_experience,
      evidence_urls: data.evidence_urls ?? existing?.evidence_urls,
      skills_to_improve: data.skills_to_improve ?? existing?.skills_to_improve,
      updated_at: now,
    };

    skillsAssessments.set(studentId, assessment);
    await this.updateOnboardingStep(studentId, 'SKILLS_ASSESSMENT', true);

    try {
      const eventBus = EventBus.getInstance();
      await eventBus.publish('STUDENT_SKILL_UPDATED', { studentId, skillCount: assessment.skills.length }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
    } catch {}

    return assessment;
  }

  // === ACADEMIC HISTORY ===

  public static async getAcademicHistory(studentId: string): Promise<AcademicHistory | null> {
    return academicHistories.get(studentId) || null;
  }

  public static getAcademicHistorySync(studentId: string): AcademicHistory | null {
    return academicHistories.get(studentId) || null;
  }

  public static async saveAcademicHistory(studentId: string, data: Partial<AcademicHistory>): Promise<AcademicHistory> {
    const now = new Date().toISOString();
    const existing = academicHistories.get(studentId);

    const history: AcademicHistory = {
      student_id: studentId,
      semester_results: data.semester_results || existing?.semester_results || [],
      subject_marks: data.subject_marks || existing?.subject_marks || [],
      completed_courses_platform: data.completed_courses_platform || existing?.completed_courses_platform || [],
      completed_lessons_count: data.completed_lessons_count ?? existing?.completed_lessons_count ?? 0,
      quiz_history_count: data.quiz_history_count ?? existing?.quiz_history_count ?? 0,
      coding_practice_count: data.coding_practice_count ?? existing?.coding_practice_count ?? 0,
      dsa_progress_count: data.dsa_progress_count ?? existing?.dsa_progress_count ?? 0,
      sql_practice_count: data.sql_practice_count ?? existing?.sql_practice_count ?? 0,
      lab_experiments: data.lab_experiments || existing?.lab_experiments || [],
      projects_completed: data.projects_completed || existing?.projects_completed || [],
      certifications_earned: data.certifications_earned || existing?.certifications_earned || [],
      awards: data.awards || existing?.awards || [],
      topics_needing_improvement: data.topics_needing_improvement || existing?.topics_needing_improvement || [],
      previous_goals: data.previous_goals || existing?.previous_goals || [],
      updated_at: now,
    };

    academicHistories.set(studentId, history);
    await this.updateOnboardingStep(studentId, 'ACADEMIC_HISTORY', true);
    return history;
  }

  // === CAREER GOALS ===

  public static async getCareerGoals(studentId: string): Promise<CareerGoals | null> {
    return careerGoals.get(studentId) || null;
  }

  public static getCareerGoalsSync(studentId: string): CareerGoals | null {
    return careerGoals.get(studentId) || null;
  }

  public static async saveCareerGoals(studentId: string, data: Partial<CareerGoals>): Promise<CareerGoals> {
    const now = new Date().toISOString();
    const existing = careerGoals.get(studentId);

    const goals: CareerGoals = {
      student_id: studentId,
      career_directions: data.career_directions || existing?.career_directions || [],
      target_job_role: data.target_job_role ?? existing?.target_job_role,
      preferred_industry: data.preferred_industry ?? existing?.preferred_industry,
      target_companies: data.target_companies ?? existing?.target_companies,
      internship_goals: data.internship_goals ?? existing?.internship_goals,
      placement_timeline: data.placement_timeline ?? existing?.placement_timeline,
      work_mode_preference: data.work_mode_preference ?? existing?.work_mode_preference,
      employment_type_preference: data.employment_type_preference ?? existing?.employment_type_preference,
      preferred_location: data.preferred_location ?? existing?.preferred_location,
      placement_priorities: data.placement_priorities ?? existing?.placement_priorities,
      placement_readiness_self_rating: data.placement_readiness_self_rating ?? existing?.placement_readiness_self_rating,
      desired_technical_skills: data.desired_technical_skills || existing?.desired_technical_skills || [],
      higher_study_plans: data.higher_study_plans ?? existing?.higher_study_plans,
      competitive_exam_goals: data.competitive_exam_goals ?? existing?.competitive_exam_goals,
      entrepreneurship_interest: data.entrepreneurship_interest ?? existing?.entrepreneurship_interest,
      long_term_goal: data.long_term_goal ?? existing?.long_term_goal,
      career_concerns: data.career_concerns ?? existing?.career_concerns,
      preferred_project_areas: data.preferred_project_areas ?? existing?.preferred_project_areas,
      resume_status: data.resume_status ?? existing?.resume_status,
      github_url: data.github_url ?? existing?.github_url,
      linkedin_url: data.linkedin_url ?? existing?.linkedin_url,
      leetcode_url: data.leetcode_url ?? existing?.leetcode_url,
      hackerrank_url: data.hackerrank_url ?? existing?.hackerrank_url,
      codechef_url: data.codechef_url ?? existing?.codechef_url,
      kaggle_url: data.kaggle_url ?? existing?.kaggle_url,
      portfolio_urls: data.portfolio_urls ?? existing?.portfolio_urls,
      research_topics: data.research_topics ?? existing?.research_topics,
      research_keywords: data.research_keywords ?? existing?.research_keywords,
      scholarly_sources: data.scholarly_sources ?? existing?.scholarly_sources,
      community_interests: data.community_interests ?? existing?.community_interests,
      notification_preferences: data.notification_preferences ?? existing?.notification_preferences,
      primary_career_track: data.primary_career_track ?? existing?.primary_career_track,
      target_exam_goals: data.target_exam_goals ?? existing?.target_exam_goals,
      favorite_subjects: data.favorite_subjects ?? existing?.favorite_subjects,
      challenging_subjects: data.challenging_subjects ?? existing?.challenging_subjects,
      achievements_and_rewards: data.achievements_and_rewards ?? existing?.achievements_and_rewards,
      updated_at: now,
    };

    careerGoals.set(studentId, goals);
    await this.updateOnboardingStep(studentId, 'CAREER_GOALS', true);

    try {
      const eventBus = EventBus.getInstance();
      await eventBus.publish('CAREER_PROFILE_UPDATED', {
        studentId,
        careerDirections: goals.career_directions,
        targetJobRole: goals.target_job_role,
      }, {
        student_id: studentId,
        source: 'OnboardingService',
      });
    } catch {}

    return goals;
  }

  // === PORTFOLIO PROJECTS ===

  public static async getPortfolioProjects(studentId: string): Promise<PortfolioProject[]> {
    return portfolioProjects.get(studentId) || [];
  }

  public static getPortfolioProjectsSync(studentId: string): PortfolioProject[] {
    return portfolioProjects.get(studentId) || [];
  }

  public static async addPortfolioProject(
    studentId: string,
    data: Omit<PortfolioProject, 'id' | 'student_id' | 'created_at' | 'updated_at' | 'skills_demonstrated'> & {
      skills_demonstrated?: string[];
    }
  ): Promise<PortfolioProject> {
    const now = new Date().toISOString();
    const project: PortfolioProject = {
      id: generateId('proj'),
      student_id: studentId,
      ...data,
      technologies: data.technologies || [],
      skills_demonstrated: data.skills_demonstrated || [],
      created_at: now,
      updated_at: now,
    };

    const existing = portfolioProjects.get(studentId) || [];
    existing.push(project);
    portfolioProjects.set(studentId, existing);
    await this.updateOnboardingStep(studentId, 'PROJECTS_PORTFOLIO', true);
    return project;
  }

  public static async updatePortfolioProject(studentId: string, projectId: string, data: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const existing = portfolioProjects.get(studentId) || [];
    const idx = existing.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new NotFoundError('Project not found');
    if (existing[idx].student_id !== studentId) throw new ValidationError('Not authorized');

    existing[idx] = {
      ...existing[idx],
      ...data,
      id: projectId,
      student_id: studentId,
      updated_at: new Date().toISOString(),
    };

    portfolioProjects.set(studentId, existing);
    return existing[idx];
  }

  public static async deletePortfolioProject(studentId: string, projectId: string): Promise<void> {
    const existing = portfolioProjects.get(studentId) || [];
    const filtered = existing.filter((p) => p.id !== projectId || p.student_id !== studentId);
    portfolioProjects.set(studentId, filtered);
  }

  // === STUDY CONSTRAINTS ===

  public static async getStudyConstraints(studentId: string): Promise<StudyConstraints | null> {
    return studyConstraints.get(studentId) || null;
  }

  public static getStudyConstraintsSync(studentId: string): StudyConstraints | null {
    return studyConstraints.get(studentId) || null;
  }

  public static async saveStudyConstraints(studentId: string, data: Partial<StudyConstraints>): Promise<StudyConstraints> {
    const now = new Date().toISOString();
    const existing = studyConstraints.get(studentId);

    const constraints: StudyConstraints = {
      student_id: studentId,
      daily_study_hours: data.daily_study_hours ?? existing?.daily_study_hours ?? 3,
      weekly_study_hours: data.weekly_study_hours ?? existing?.weekly_study_hours ?? 20,
      upcoming_commitments: data.upcoming_commitments ?? existing?.upcoming_commitments,
      preferred_session_duration: data.preferred_session_duration ?? existing?.preferred_session_duration ?? 45,
      device_limitations: data.device_limitations ?? existing?.device_limitations,
      internet_limitations: data.internet_limitations ?? existing?.internet_limitations,
      budget_preference: data.budget_preference || existing?.budget_preference || 'FREE_ONLY',
      preferred_free_resources: data.preferred_free_resources || existing?.preferred_free_resources || [],
      scheduling_constraints: data.scheduling_constraints ?? existing?.scheduling_constraints,
      available_days: data.available_days ?? existing?.available_days,
      preferred_start_time: data.preferred_start_time ?? existing?.preferred_start_time,
      preferred_end_time: data.preferred_end_time ?? existing?.preferred_end_time,
      break_preference: data.break_preference ?? existing?.break_preference,
      exam_period_hours: data.exam_period_hours ?? existing?.exam_period_hours,
      study_reminders_enabled: data.study_reminders_enabled ?? existing?.study_reminders_enabled,
      deadline_reminders_enabled: data.deadline_reminders_enabled ?? existing?.deadline_reminders_enabled,
      updated_at: now,
    };

    studyConstraints.set(studentId, constraints);
    await this.updateOnboardingStep(studentId, 'STUDY_CONSTRAINTS', true);
    return constraints;
  }

  // === STUDENT MEMORY ===

  public static async getStudentMemories(studentId: string, limit: number = 50): Promise<StudentMemoryEntry[]> {
    const memories = studentMemories.get(studentId) || [];
    return memories.slice(-limit);
  }

  public static async addStudentMemory(
    studentId: string,
    entryOrType: any,
    key?: string,
    content?: string,
    source?: any,
    confidence?: number
  ): Promise<StudentMemoryEntry> {
    const now = new Date().toISOString();
    let memoryData: any;
    if (typeof entryOrType === 'string') {
      memoryData = {
        memory_type: entryOrType,
        key: key || '',
        value: content || '',
        context: content,
        content: content,
        source: source || 'PLATFORM_DERIVED',
        confidence: confidence ?? 0.9,
      };
    } else {
      memoryData = {
        ...entryOrType,
        key: entryOrType.key,
        value: entryOrType.value || entryOrType.content || '',
      };
    }

    const memory: StudentMemoryEntry = {
      id: generateId('mem'),
      student_id: studentId,
      ...memoryData,
      created_at: now,
      updated_at: now,
    };

    const existing = studentMemories.get(studentId) || [];
    existing.push(memory);
    studentMemories.set(studentId, existing);
    return memory;
  }

  public static async deleteStudentMemory(studentId: string, memoryId: string): Promise<void> {
    const existing = studentMemories.get(studentId) || [];
    const filtered = existing.filter((m) => m.id !== memoryId);
    studentMemories.set(studentId, filtered);
  }

  public static async clearStudentMemories(studentId: string): Promise<void> {
    studentMemories.set(studentId, []);
  }

  // === PROFILE COMPLETION ===

  public static async getProfileCompletion(studentId: string): Promise<ProfileCompletion> {
    const onboarding = await this.getOnboardingStatus(studentId);
    const education = await this.getEducationProfile(studentId);
    const semester = await this.getSemesterSyllabus(studentId);
    // The auto-generated branch template is not something the student filled in, so it must not
    // count towards profile completion.
    const semesterFilled = semester && !semester.is_template ? semester : null;
    const prefs = await this.getLearningPreferences(studentId);
    const skills = await this.getSkillsAssessment(studentId);
    const history = await this.getAcademicHistory(studentId);
    const career = await this.getCareerGoals(studentId);
    const projects = await this.getPortfolioProjects(studentId);
    const constraints = await this.getStudyConstraints(studentId);

    let profile: any;
    try { profile = await db.getStudentProfile(studentId); } catch { profile = null; }

    const sections: ProfileSectionStatus[] = [
      {
        section: 'BASIC_PROFILE',
        label: 'Basic Profile',
        completed: Boolean(profile?.name && profile?.email),
        completion_percentage: profile ? (profile.name ? 50 : 0) + (profile.bio ? 25 : 0) + (profile.avatar_url ? 25 : 0) : 0,
        required_fields_filled: profile ? (profile.name ? 1 : 0) + 1 : 0, // email always from auth
        total_required_fields: 2,
        optional_fields_filled: (profile?.bio ? 1 : 0) + (profile?.avatar_url ? 1 : 0),
        total_optional_fields: 5,
        last_updated: profile?.updated_at || null,
      },
      {
        section: 'EDUCATION',
        label: 'Educational Background',
        completed: Boolean(education?.institution && education?.branch),
        completion_percentage: education ? Math.min(100,
          (education.degree ? 15 : 0) +
          (education.branch ? 15 : 0) +
          (education.institution ? 20 : 0) +
          (education.current_year ? 15 : 0) +
          (education.current_semester ? 15 : 0) +
          (education.expected_graduation_year ? 10 : 0) +
          (education.current_subjects?.length ? 10 : 0)
        ) : 0,
        required_fields_filled: education ? [education.degree, education.branch, education.institution, education.current_semester].filter(Boolean).length : 0,
        total_required_fields: 4,
        optional_fields_filled: education ? [education.specialization, education.admission_year, education.achievements?.length, education.certifications?.length].filter(Boolean).length : 0,
        total_optional_fields: 8,
        last_updated: education?.updated_at || null,
      },
      {
        section: 'SEMESTER_SYLLABUS',
        label: 'Semester & Syllabus',
        completed: Boolean(semesterFilled?.subjects?.length),
        completion_percentage: semesterFilled ? Math.min(100,
          (semesterFilled.academic_year ? 15 : 0) +
          (semesterFilled.semester_number ? 15 : 0) +
          (semesterFilled.subjects?.length ? Math.min(40, semesterFilled.subjects.length * 10) : 0) +
          (semesterFilled.academic_dates?.length ? Math.min(30, semesterFilled.academic_dates.length * 5) : 0)
        ) : 0,
        required_fields_filled: semesterFilled ? [semesterFilled.semester_number, semesterFilled.subjects?.length].filter(Boolean).length : 0,
        total_required_fields: 2,
        optional_fields_filled: semesterFilled ? [semesterFilled.semester_start_date, semesterFilled.semester_end_date, semesterFilled.academic_dates?.length].filter(Boolean).length : 0,
        total_optional_fields: 5,
        last_updated: semesterFilled?.updated_at || null,
      },
      {
        section: 'LEARNING_PREFERENCES',
        label: 'Learning Preferences',
        completed: Boolean(prefs?.learning_style),
        completion_percentage: prefs ? Math.min(100,
          (prefs.learning_style ? 20 : 0) +
          (prefs.explanation_depth ? 15 : 0) +
          (prefs.favorite_subjects?.length ? 15 : 0) +
          (prefs.preferred_programming_languages?.length ? 15 : 0) +
          (prefs.weekday_study_hours ? 10 : 0) +
          (prefs.preferred_study_time ? 15 : 0) +
          (prefs.revision_frequency ? 10 : 0)
        ) : 0,
        required_fields_filled: prefs ? [prefs.learning_style, prefs.explanation_depth].filter(Boolean).length : 0,
        total_required_fields: 2,
        optional_fields_filled: prefs ? [prefs.favorite_subjects?.length, prefs.topics_of_interest?.length, prefs.difficult_topics?.length].filter(Boolean).length : 0,
        total_optional_fields: 8,
        last_updated: prefs?.updated_at || null,
      },
      {
        section: 'SKILLS_ASSESSMENT',
        label: 'Skills Self-Assessment',
        completed: Boolean(skills?.skills?.length),
        completion_percentage: skills ? Math.min(100, (skills.skills?.length || 0) * 5) : 0,
        required_fields_filled: skills?.skills?.length ? 1 : 0,
        total_required_fields: 1,
        optional_fields_filled: skills?.additional_skills?.length ? 1 : 0,
        total_optional_fields: 1,
        last_updated: skills?.updated_at || null,
      },
      {
        section: 'ACADEMIC_HISTORY',
        label: 'Academic History',
        completed: Boolean(history),
        completion_percentage: history ? Math.min(100,
          (history.semester_results?.length ? 30 : 0) +
          (history.certifications_earned?.length ? 20 : 0) +
          (history.projects_completed?.length ? 20 : 0) +
          (history.awards?.length ? 15 : 0) +
          (history.topics_needing_improvement?.length ? 15 : 0)
        ) : 0,
        required_fields_filled: 0,
        total_required_fields: 0,
        optional_fields_filled: history ? Object.values(history).filter((v) => v && (Array.isArray(v) ? v.length > 0 : true)).length - 2 : 0,
        total_optional_fields: 12,
        last_updated: history?.updated_at || null,
      },
      {
        section: 'CAREER_GOALS',
        label: 'Career & Future Goals',
        completed: Boolean(career?.career_directions?.length),
        completion_percentage: career ? Math.min(100,
          (career.career_directions?.length ? 30 : 0) +
          (career.target_job_role ? 20 : 0) +
          (career.desired_technical_skills?.length ? 20 : 0) +
          (career.github_url ? 10 : 0) +
          (career.linkedin_url ? 10 : 0) +
          (career.resume_status ? 10 : 0)
        ) : 0,
        required_fields_filled: career?.career_directions?.length ? 1 : 0,
        total_required_fields: 1,
        optional_fields_filled: career ? [career.target_job_role, career.preferred_industry, career.github_url, career.linkedin_url].filter(Boolean).length : 0,
        total_optional_fields: 10,
        last_updated: career?.updated_at || null,
      },
      {
        section: 'PROJECTS_PORTFOLIO',
        label: 'Projects & Portfolio',
        completed: projects.length > 0,
        completion_percentage: Math.min(100, projects.length * 25),
        required_fields_filled: 0,
        total_required_fields: 0,
        optional_fields_filled: projects.length,
        total_optional_fields: 4,
        last_updated: projects.length ? projects[projects.length - 1].updated_at : null,
      },
      {
        section: 'STUDY_CONSTRAINTS',
        label: 'Study Constraints',
        completed: Boolean(constraints),
        completion_percentage: constraints ? Math.min(100,
          (constraints.daily_study_hours ? 25 : 0) +
          (constraints.weekly_study_hours ? 25 : 0) +
          (constraints.preferred_session_duration ? 25 : 0) +
          (constraints.budget_preference ? 25 : 0)
        ) : 0,
        required_fields_filled: 0,
        total_required_fields: 0,
        optional_fields_filled: constraints ? [constraints.daily_study_hours, constraints.weekly_study_hours, constraints.preferred_session_duration].filter(Boolean).length : 0,
        total_optional_fields: 6,
        last_updated: constraints?.updated_at || null,
      },
    ];

    const totalWeight = sections.length;
    const completedCount = sections.filter((s) => s.completed).length;
    const requiredSections = sections.filter((s) => ['BASIC_PROFILE', 'EDUCATION'].includes(s.section));
    const requiredComplete = requiredSections.filter((s) => s.completed).length;
    const optionalSections = sections.filter((s) => !['BASIC_PROFILE', 'EDUCATION'].includes(s.section));
    const optionalComplete = optionalSections.filter((s) => s.completed).length;

    return {
      student_id: studentId,
      overall_percentage: Math.round((completedCount / totalWeight) * 100),
      sections,
      is_onboarding_complete: onboarding.is_complete,
      required_percentage: requiredSections.length ? Math.round((requiredComplete / requiredSections.length) * 100) : 0,
      optional_percentage: optionalSections.length ? Math.round((optionalComplete / optionalSections.length) * 100) : 0,
    };
  }

  // === STUDENT INTELLIGENCE CONTEXT ===

  public static async buildIntelligenceContext(studentId: string): Promise<StudentIntelligenceContext> {
    let profile: any;
    try { profile = await db.getStudentProfile(studentId); } catch { profile = null; }

    const student = await db.getStudentById(studentId);

    const basicProfile: BasicProfileData = {
      full_name: profile?.name || student?.name || '',
      display_name: profile?.username,
      avatar_url: profile?.avatar_url || student?.avatar_url,
      email: profile?.email || student?.email || '',
      preferred_language: 'English',
      timezone: 'Asia/Kolkata',
    };

    const [education, semester, prefs, skills, history, career, projects, constraints, completion, onboarding, memories] = await Promise.all([
      this.getEducationProfile(studentId),
      this.getSemesterSyllabus(studentId),
      this.getLearningPreferences(studentId),
      this.getSkillsAssessment(studentId),
      this.getAcademicHistory(studentId),
      this.getCareerGoals(studentId),
      this.getPortfolioProjects(studentId),
      this.getStudyConstraints(studentId),
      this.getProfileCompletion(studentId),
      this.getOnboardingStatus(studentId),
      this.getStudentMemories(studentId, 20),
    ]);

    return {
      student_id: studentId,
      basic_profile: basicProfile,
      education,
      semester_syllabus: semester,
      preferences: prefs,
      skills,
      academic_history: history,
      career_goals: career,
      projects,
      study_constraints: constraints,
      profile_completion: completion,
      recent_memories: memories,
      onboarding_status: onboarding,
    };
  }

  // === RECOMMENDATIONS ===

  public static async getRecommendations(studentId: string): Promise<StudentRecommendation[]> {
    return studentRecommendations.get(studentId) || [];
  }

  public static async generateRecommendations(studentId: string): Promise<StudentRecommendation[]> {
    const ctx = await this.buildIntelligenceContext(studentId);
    const recommendations: StudentRecommendation[] = [];
    const now = new Date().toISOString();

    // Profile completion recommendations
    if (!ctx.onboarding_status.is_complete) {
      recommendations.push({
        id: generateId('rec'),
        student_id: studentId,
        title: 'Complete Your Profile Setup',
        description: 'Complete onboarding to get personalized recommendations and study plans.',
        target_page: '/onboarding',
        priority: 'HIGH',
        evidence: [`Profile is ${ctx.profile_completion.overall_percentage}% complete`],
        reason: 'A complete profile helps us personalize your learning experience.',
        confidence: 1.0,
        estimated_time_minutes: 15,
        status: 'ACTIVE',
        category: 'GENERAL',
        created_at: now,
        updated_at: now,
      });
    }

    // Skills gaps based on career goals
    if (ctx.career_goals && ctx.skills) {
      const desiredSkills = ctx.career_goals.desired_technical_skills || [];
      const currentSkills = ctx.skills.skills.filter((s) => s.self_reported_level !== 'NOT_SURE' && s.self_reported_level !== 'BEGINNER').map((s) => s.skill_name.toLowerCase());
      const gaps = desiredSkills.filter((ds) => !currentSkills.includes(ds.toLowerCase()));

      if (gaps.length > 0) {
        recommendations.push({
          id: generateId('rec'),
          student_id: studentId,
          title: `Build Skills: ${gaps.slice(0, 2).join(', ')}`,
          description: `Your career goals mention ${gaps.length} skills that you haven't assessed at intermediate level or above.`,
          target_page: '/skills',
          priority: 'MEDIUM',
          evidence: [`Career goal: ${ctx.career_goals.target_job_role || ctx.career_goals.career_directions[0]}`, `Gap skills: ${gaps.slice(0, 3).join(', ')}`],
          reason: 'Strengthening these skills aligns with your career aspirations.',
          confidence: 0.8,
          estimated_time_minutes: 30,
          status: 'ACTIVE',
          category: 'SKILL',
          created_at: now,
          updated_at: now,
        });
      }
    }

    // Semester-based recommendations
    if (ctx.semester_syllabus?.academic_dates?.length) {
      const upcoming = ctx.semester_syllabus.academic_dates
        .filter((d) => new Date(d.date) > new Date() && new Date(d.date) < new Date(Date.now() + 14 * 24 * 3600000))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (upcoming.length > 0) {
        const next = upcoming[0];
        recommendations.push({
          id: generateId('rec'),
          student_id: studentId,
          title: `Prepare for ${next.label}`,
          description: `${next.label} is scheduled for ${new Date(next.date).toLocaleDateString()}. Start preparing now.`,
          target_page: '/exam-preparation',
          priority: 'HIGH',
          evidence: [`Upcoming: ${next.label} on ${next.date}`, `Type: ${next.type}`],
          reason: 'Early preparation improves exam performance.',
          confidence: 0.95,
          estimated_time_minutes: 60,
          status: 'ACTIVE',
          category: 'ACADEMIC',
          created_at: now,
          updated_at: now,
        });
      }
    }

    // Study time recommendations
    if (ctx.preferences) {
      recommendations.push({
        id: generateId('rec'),
        student_id: studentId,
        title: 'Start Today\'s Study Session',
        description: `Based on your preferences, ${ctx.preferences.preferred_study_time?.toLowerCase() || 'evening'} is your best study time. Aim for ${ctx.preferences.weekday_study_hours || 3} hours today.`,
        target_page: '/study-planner',
        priority: 'MEDIUM',
        evidence: [`Preferred time: ${ctx.preferences.preferred_study_time}`, `Daily target: ${ctx.preferences.weekday_study_hours}h`],
        reason: 'Consistent study habits are key to academic success.',
        confidence: 0.7,
        status: 'ACTIVE',
        category: 'ACADEMIC',
        created_at: now,
        updated_at: now,
      });
    }

    studentRecommendations.set(studentId, recommendations);
    return recommendations;
  }

  public static async dismissRecommendation(studentId: string, recommendationId: string): Promise<void> {
    const existing = studentRecommendations.get(studentId) || [];
    const rec = existing.find((r) => r.id === recommendationId);
    if (rec) {
      rec.status = 'DISMISSED';
      rec.updated_at = new Date().toISOString();
    }
  }

  // === STUDENT AI COMPANION PERSONA ENGINE ===

  public static async getOrGenerateAIPersona(studentId: string): Promise<StudentAIPersona> {
    const existing = studentAIPersonas.get(studentId);
    if (existing) {
      return existing;
    }
    return this.synthesizeAIPersona(studentId);
  }

  public static getAIPersonaSync(studentId: string): StudentAIPersona | null {
    return studentAIPersonas.get(studentId) || null;
  }

  public static async synthesizeAIPersona(
    studentId: string,
    customOptions?: Partial<StudentAIPersona>
  ): Promise<StudentAIPersona> {
    const [edu, career, prefs, student] = await Promise.all([
      this.getEducationProfile(studentId),
      this.getCareerGoals(studentId),
      this.getLearningPreferences(studentId),
      db.getStudentById(studentId).catch(() => null),
    ]);

    const studentName = student?.name || 'Engineer';
    const branch = edu?.branch || student?.branch || 'Computer Science & Engineering';
    const sem = edu?.current_semester || student?.semester || 1;
    const isFirstGen = edu?.first_generation_engineer ?? false;
    const urgency = edu?.financial_urgency || 'PREFER_JOB_SOON';
    const challenging = career?.challenging_subjects || edu?.current_challenges || [];
    const favorites = career?.favorite_subjects || [];
    const careerTrack = career?.primary_career_track || 'CAMPUS_PLACEMENT';
    const pace = prefs?.learning_pace || 'STEADY_BALANCED';
    const lang = prefs?.preferred_explanation_language || 'English';

    // Determine tailored pedagogical tone
    let tone: StudentAIPersona['pedagogical_tone'] = 'PRACTICAL_INDUSTRY_FIRST';
    if (isFirstGen || pace === 'FOUNDATIONAL_STEP_BY_STEP') {
      tone = 'PATIENT_FOUNDATIONAL';
    } else if (careerTrack === 'HIGHER_STUDIES_GATE' || careerTrack === 'GOVERNMENT_EXAMS') {
      tone = 'EXAM_ORIENTED_RIGOROUS';
    } else if (pace === 'FAST_PACED') {
      tone = 'SOCRATIC_ENCOURAGING';
    }

    const directives: string[] = [
      `Serve as dedicated personalized AI mentor for ${studentName}, pursuing ${edu?.degree || 'B.Tech'} in ${branch} (Semester ${sem}).`,
      `Pedagogical tone: ${tone}. Adapt explanations to a ${pace.toLowerCase().replace(/_/g, ' ')} rhythm.`,
      `Deliver concepts primarily in ${lang}, weaving in intuitive analogies and everyday engineering analogies.`,
    ];

    if (challenging.length > 0) {
      directives.push(`Proactively reinforce foundational intuitions for challenging subjects: ${challenging.join(', ')}.`);
    }

    if (favorites.length > 0) {
      directives.push(`Leverage student's natural strengths in ${favorites.join(', ')} to bridge more complex abstract topics.`);
    }

    if (urgency === 'IMMEDIATE_JOB_CRITICAL' || careerTrack === 'CAMPUS_PLACEMENT') {
      directives.push(
        `High financial urgency: Focus relentlessly on placement-grade coding, system design, high-frequency interview patterns, and resume-ready capstone milestones.`
      );
    } else if (careerTrack === 'HIGHER_STUDIES_GATE') {
      directives.push(
        `GATE Track: Emphasize theoretical depth, mathematical rigor, recurrence relations, and previous years' question patterns.`
      );
    } else if (careerTrack === 'STARTUP_FOUNDER') {
      directives.push(
        `Startup Track: Encourage architectural autonomy, full-stack MVP velocity, and production deployment best practices.`
      );
    }

    if (isFirstGen) {
      directives.push(
        `First-generation engineer: Provide compassionate, confidence-building mentorship, demystifying corporate expectations and tech career roadmaps.`
      );
    }

    const knowledgeGraphSummary = [
      `Degree: ${edu?.degree || 'B.Tech'} in ${branch} (Sem ${sem}, Year ${edu?.current_year || 1})`,
      edu?.tenth_percentage ? `10th: ${edu.tenth_percentage}% (${edu.tenth_board || 'State'})` : null,
      edu?.twelfth_percentage ? `12th/Dip: ${edu.twelfth_percentage}% (${edu.twelfth_stream || 'MPC'})` : null,
      edu?.entrance_exam_rank ? `Entrance: ${edu.entrance_exam_name || 'EAMCET/JEE'} Rank #${edu.entrance_exam_rank}` : null,
      `Career Vector: ${careerTrack.replace(/_/g, ' ')} | Role: ${career?.target_job_role || 'Software Engineer'}`,
      challenging.length ? `Remedial Intervention: ${challenging.join(', ')}` : null,
      `Pace: ${pace} | Urgency: ${urgency}`,
    ].filter(Boolean).join(' • ');

    const systemPromptBlueprint = `You are Arya, the dedicated per-student academic and career AI companion trained specifically for ${studentName}.
Student Profile:
- Branch: ${branch}, Semester: ${sem}
- Academic Heritage: ${edu?.twelfth_stream || 'PCM'} background, Entrance: ${edu?.entrance_exam_name || 'Rank'} ${edu?.entrance_exam_rank || ''}
- Core Ambition: ${careerTrack} -> Target Role: ${career?.target_job_role || 'Software Engineer'}
- Socio-Economic & Family Context: ${isFirstGen ? 'First-generation engineer in family' : 'Standard engineering context'}, Financial urgency: ${urgency}
- Challenging Subjects (Extra Attention Needed): ${challenging.join(', ') || 'None specified'}
- Pedagogical Directives:
${directives.map((d) => `  * ${d}`).join('\n')}

Always adhere to these directives across all tutor queries, code reviews, quizzes, and placement simulations.`;

    const persona: StudentAIPersona = {
      student_id: studentId,
      agent_companion_name: customOptions?.agent_companion_name || 'Arya',
      agent_avatar_url:
        customOptions?.agent_avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      pedagogical_tone: customOptions?.pedagogical_tone || tone,
      primary_focus_directives: customOptions?.primary_focus_directives || directives,
      system_prompt_blueprint: customOptions?.system_prompt_blueprint || systemPromptBlueprint,
      knowledge_graph_summary: customOptions?.knowledge_graph_summary || knowledgeGraphSummary,
      last_trained_at: new Date().toISOString(),
    };

    studentAIPersonas.set(studentId, persona);
    return persona;
  }

  public static async saveAIPersona(
    studentId: string,
    updates: Partial<StudentAIPersona>
  ): Promise<StudentAIPersona> {
    const current = await this.getOrGenerateAIPersona(studentId);
    const updated: StudentAIPersona = {
      ...current,
      ...updates,
      student_id: studentId,
      last_trained_at: new Date().toISOString(),
    };
    studentAIPersonas.set(studentId, updated);
    return updated;
  }
}
