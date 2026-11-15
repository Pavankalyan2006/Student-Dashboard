import { parseLooseJson } from '../ai/modelOutput';
// server/services/learningModulesService.ts
// Comprehensive backend service implementing data operations and logic for the 10 learning modules

import {
  StudyPlan,
  StudyPlanTask,
  ExamEntity,
  ExamTopic,
  StudentDoubt,
  DoubtResolution,
  FlashcardDeck,
  Flashcard,
  FlashcardStats,
  ReviewRating,
  FlashcardAIGenerateRequest,
  LabEntity,
  LabExperiment,
  VivaQuestionItem,
  SQLTableDefinition,
  SQLChallenge,
  SQLExecutionResult,
  MLDataset,
  MLExperimentEntity,
  SystemDesignProblem,
  SystemDesignEntity,
  KnowledgeItem,
  KnowledgeCollection,
  KnowledgeGraphData,
  InternshipApplication,
  ApplicationStatus,
  ApplicationTimelineEvent,
  JobDescriptionSkillAnalysis,
} from '../models/learningModulesTypes';
import { OPPORTUNITY_TYPES } from '../models/learningModulesTypes';
import { db } from '../db/database';
import { NotFoundError, ValidationError, AuthorizationError, AppError } from '../core/exceptions';
import { logger } from '../core/logging';
import { OnboardingService } from './onboardingService';
import { SqlLabSandboxService } from './sqlLabSandboxService';
import { MlLabService } from './mlLabService';
import { AIService } from '../ai/service';
import { NotesService } from './notes';
import { KnowledgeBaseService } from './knowledgeBaseService';
import { EventBus } from '../events/eventBus';

export class LearningModulesService {
  // In-memory persistent collections keyed by student_id and item_id
  private static studyPlans: Map<string, StudyPlan> = new Map();
  private static exams: Map<string, ExamEntity> = new Map();
  private static doubts: Map<string, StudentDoubt> = new Map();
  private static flashcardDecks: Map<string, FlashcardDeck> = new Map();
  private static labs: Map<string, LabEntity> = new Map();
  private static mlExperiments: Map<string, MLExperimentEntity> = new Map();
  private static systemDesigns: Map<string, SystemDesignEntity> = new Map();
  private static knowledgeItems: Map<string, KnowledgeItem> = new Map();
  private static knowledgeCollections: Map<string, KnowledgeCollection> = new Map();
  private static applications: Map<string, InternshipApplication> = new Map();

  // Static pre-seeded schemas for SQL Lab
  public static sqlSchemas: Map<string, SQLTableDefinition[]> = new Map([
    [
      'university_db',
      [
        {
          name: 'students',
          columns: [
            { name: 'student_id', type: 'INT', is_primary_key: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'branch', type: 'VARCHAR(50)' },
            { name: 'semester', type: 'INT' },
            { name: 'cgpa', type: 'DECIMAL(3,2)' },
          ],
          sample_rows: [
            { student_id: 101, name: 'Aarav Sharma', branch: 'Computer Science', semester: 6, cgpa: 9.15 },
            { student_id: 102, name: 'Diya Patel', branch: 'Information Tech', semester: 6, cgpa: 8.85 },
            { student_id: 103, name: 'Rohan Gupta', branch: 'Computer Science', semester: 4, cgpa: 7.92 },
            { student_id: 104, name: 'Ananya Verma', branch: 'Electronics', semester: 6, cgpa: 8.40 },
            { student_id: 105, name: 'Vikram Reddy', branch: 'Computer Science', semester: 8, cgpa: 9.45 },
          ],
        },
        {
          name: 'courses',
          columns: [
            { name: 'course_id', type: 'VARCHAR(10)', is_primary_key: true },
            { name: 'course_name', type: 'VARCHAR(100)' },
            { name: 'credits', type: 'INT' },
            { name: 'dept', type: 'VARCHAR(50)' },
          ],
          sample_rows: [
            { course_id: 'CS301', course_name: 'Database Management Systems', credits: 4, dept: 'CSE' },
            { course_id: 'CS302', course_name: 'Operating Systems', credits: 4, dept: 'CSE' },
            { course_id: 'CS303', course_name: 'Computer Networks', credits: 3, dept: 'CSE' },
            { course_id: 'CS401', course_name: 'Distributed Systems', credits: 4, dept: 'CSE' },
          ],
        },
        {
          name: 'enrollments',
          columns: [
            { name: 'enrollment_id', type: 'INT', is_primary_key: true },
            { name: 'student_id', type: 'INT', is_foreign_key: true, references: 'students(student_id)' },
            { name: 'course_id', type: 'VARCHAR(10)', is_foreign_key: true, references: 'courses(course_id)' },
            { name: 'grade', type: 'VARCHAR(2)' },
          ],
          sample_rows: [
            { enrollment_id: 1, student_id: 101, course_id: 'CS301', grade: 'A+' },
            { enrollment_id: 2, student_id: 101, course_id: 'CS302', grade: 'A' },
            { enrollment_id: 3, student_id: 102, course_id: 'CS301', grade: 'A' },
            { enrollment_id: 4, student_id: 103, course_id: 'CS301', grade: 'B+' },
            { enrollment_id: 5, student_id: 105, course_id: 'CS401', grade: 'A+' },
          ],
        },
      ],
    ],
  ]);

  public static sqlChallenges: SQLChallenge[] = [
    {
      id: 'sql_ch_1',
      title: 'Find Top Students by Department',
      difficulty: 'MEDIUM',
      category: 'GROUP BY & AGGREGATIONS',
      description: 'Write a query to list each branch along with the highest CGPA obtained by students in that branch.',
      schema_name: 'university_db',
      starter_query: 'SELECT branch, MAX(cgpa) as top_cgpa\nFROM students\nGROUP BY branch;',
      expected_query: 'SELECT branch, MAX(cgpa) as top_cgpa FROM students GROUP BY branch;',
      hints: ['Use the GROUP BY clause on the branch column', 'Use MAX(cgpa) aggregate function'],
    },
    {
      id: 'sql_ch_2',
      title: 'Find Students Enrolled in DBMS with Grade A or Above',
      difficulty: 'EASY',
      category: 'INNER JOIN',
      description: 'Find student names who received an A or A+ in Course CS301 (DBMS).',
      schema_name: 'university_db',
      starter_query: 'SELECT s.name, e.grade\nFROM students s\nJOIN enrollments e ON s.student_id = e.student_id\nWHERE e.course_id = \'CS301\' AND e.grade IN (\'A\', \'A+\');',
      expected_query: 'SELECT s.name, e.grade FROM students s JOIN enrollments e ON s.student_id = e.student_id WHERE e.course_id = \'CS301\' AND e.grade IN (\'A\', \'A+\');',
      hints: ['Join students and enrollments on student_id', 'Filter on course_id and grade'],
    },
  ];

  public static mlDatasets: MLDataset[] = [
    {
      id: 'ds_iris',
      name: 'Iris Flower Classification',
      source: 'BUILT_IN',
      task_type: 'CLASSIFICATION',
      features: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
      target_column: 'species',
      total_samples: 150,
      preview: [
        { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
        { sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
        { sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: 'versicolor' },
        { sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: 'virginica' },
      ],
    },
    {
      id: 'ds_housing',
      name: 'California Housing Price Prediction',
      source: 'BUILT_IN',
      task_type: 'REGRESSION',
      features: ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup'],
      target_column: 'MedHouseVal',
      total_samples: 20640,
      preview: [
        { MedInc: 8.3252, HouseAge: 41.0, AveRooms: 6.98, AveBedrms: 1.02, Population: 322, MedHouseVal: 4.526 },
        { MedInc: 8.3014, HouseAge: 21.0, AveRooms: 6.23, AveBedrms: 0.97, Population: 2401, MedHouseVal: 3.585 },
        { MedInc: 7.2574, HouseAge: 52.0, AveRooms: 5.81, AveBedrms: 1.07, Population: 496, MedHouseVal: 3.521 },
      ],
    },
  ];

  public static systemDesignProblems: SystemDesignProblem[] = [
    {
      id: 'sd_url_shortener',
      title: 'Design a High-Throughput URL Shortener (TinyURL)',
      difficulty: 'BEGINNER',
      functional_requirements: [
        'Given a long URL, generate a unique short key (7-8 chars base62)',
        'Redirecting short URL to original long URL with 301/302 HTTP status',
        'Custom alias support and optional TTL/expiration',
      ],
      non_functional_requirements: [
        'Ultra-low latency reads (< 15ms at 99th percentile)',
        'High availability (99.99%) - read traffic outnumbers writes 100:1',
        'Guaranteed collision-free key generation at scale',
      ],
      scale_estimation: {
        daily_active_users: '10 Million',
        read_write_ratio: '100:1 (100M reads/day, 1M writes/day)',
        storage_per_year: '1M writes * 365 * 500 bytes = ~180 GB/year',
        bandwidth: '100M * 500 bytes / 86400s = ~580 KB/s reads',
      },
      sample_architecture: {
        components: [
          { id: 'c1', name: 'DNS / Cloudflare CDN', type: 'CDN', description: 'Caches frequently requested redirect headers at edge', tech_choice: 'Cloudflare' },
          { id: 'c2', name: 'Nginx Load Balancer', type: 'LOAD_BALANCER', description: 'Evenly distributes requests across app servers', tech_choice: 'Nginx / AWS ALB' },
          { id: 'c3', name: 'URL Shortener Web Service', type: 'SERVICE', description: 'Stateless Go/Rust API service handling encode & decode', tech_choice: 'Go / Gin' },
          { id: 'c4', name: 'Redis Cache Cluster', type: 'CACHE', description: 'In-memory LRU cache storing top 20% hot URL keys', tech_choice: 'Redis Sentinel' },
          { id: 'c5', name: 'Distributed Key Generation Service (KGS)', type: 'SERVICE', description: 'Pre-generates unique Base62 tokens in batches', tech_choice: 'Zookeeper + KGS' },
          { id: 'c6', name: 'NoSQL / Distributed SQL Database', type: 'DATABASE', description: 'Persistent key-value mapping storage', tech_choice: 'CockroachDB / Cassandra' },
        ],
        connections: [
          { from: 'c1', to: 'c2', protocol: 'HTTP/REST', description: 'Forwards cache misses to origin' },
          { from: 'c2', to: 'c3', protocol: 'HTTP/REST', description: 'Round-robin API requests' },
          { from: 'c3', to: 'c4', protocol: 'TCP', description: 'Checks hot URL key cache' },
          { from: 'c3', to: 'c5', protocol: 'gRPC', description: 'Fetches pre-generated token batch' },
          { from: 'c3', to: 'c6', protocol: 'TCP', description: 'Reads/writes URL mapping to database' },
        ],
        tradeoffs: [
          '301 Permanent Redirect (browser caches, saves backend load, but prevents analytics tracking) vs 302 Temporary (accurate click tracking, slightly higher server load)',
          'Hashing (MD5/SHA256 with truncate) risks hash collisions vs Token Range Server (KGS guarantees zero collisions)',
        ],
        bottlenecks: ['Single point of failure on KGS token range dispenser if DB goes down without replica'],
      },
    },
    {
      id: 'sd_chat_app',
      title: 'Design a Real-Time Scalable Chat System (WhatsApp/Slack)',
      difficulty: 'INTERMEDIATE',
      functional_requirements: [
        'Real-time 1-on-1 and group messaging with delivery & read receipts',
        'User presence status (online, last seen)',
        'Media upload and offline push notifications',
      ],
      non_functional_requirements: [
        'Sub-50ms message delivery between online users',
        'End-to-end encryption support',
        'Scalable to 100M concurrent WebSocket connections',
      ],
      scale_estimation: {
        daily_active_users: '50 Million',
        read_write_ratio: '1:1 messaging',
        storage_per_year: '500M msgs/day * 200 bytes = ~36.5 TB/year',
        bandwidth: '500M * 200 bytes / 86400s = ~1.15 MB/s avg',
      },
      sample_architecture: {
        components: [
          { id: 'c1', name: 'WebSocket Gateway Servers', type: 'SERVICE', description: 'Maintains persistent duplex socket connections', tech_choice: 'Go / epoll' },
          { id: 'c2', name: 'Session & Presence Registry', type: 'CACHE', description: 'Stores user-to-server connection mapping', tech_choice: 'Redis Cluster' },
          { id: 'c3', name: 'Kafka Message Bus', type: 'MESSAGE_QUEUE', description: 'Decouples message delivery and fanout', tech_choice: 'Apache Kafka' },
          { id: 'c4', name: 'Chat History DB', type: 'DATABASE', description: 'Wide-column store for sequential chat logs', tech_choice: 'Apache Cassandra' },
          { id: 'c5', name: 'Push Notification Service', type: 'SERVICE', description: 'Dispatches APNS/FCM alerts for offline users', tech_choice: 'Apple APNS / Google FCM' },
        ],
        connections: [
          { from: 'c1', to: 'c2', protocol: 'TCP', description: 'Checks receiver gateway location' },
          { from: 'c1', to: 'c3', protocol: 'Kafka', description: 'Publishes outgoing message' },
          { from: 'c3', to: 'c4', protocol: 'TCP', description: 'Persists message asynchronously' },
          { from: 'c3', to: 'c5', protocol: 'HTTP/REST', description: 'Triggers push if receiver offline' },
        ],
        tradeoffs: [
          'WebSocket (lower overhead, bidirectional) vs Long Polling / SSE (simpler firewall traversal)',
          'Cassandra (O(1) sequential append writes, timeline sharding by chat_id) vs RDBMS (joins too slow at scale)',
        ],
        bottlenecks: ['Group chat fanout write amplification for huge groups with 1000+ members'],
      },
    },
  ];

  static {
    this.seedDemoData('std_demo_1');
    this.seedDemoData('std_01j8k9x2p4');
  }

  private static seedDemoData(studentId: string = 'std_demo_1') {
    const syllabus = OnboardingService.getSemesterSyllabusSync(studentId);
    const edu = OnboardingService.getEducationProfileSync(studentId);
    const career = OnboardingService.getCareerGoalsSync(studentId);

    const primarySubject = syllabus?.subjects?.[0]?.name || 'Database Management Systems';
    const secondSubject = syllabus?.subjects?.[1]?.name || 'Operating Systems';
    const thirdSubject = syllabus?.subjects?.[2]?.name || 'Data Structures & Algorithms';
    const branchName = edu?.branch || 'B.Tech Engineering';
    const semNumber = syllabus?.semester_number || edu?.current_semester || 6;
    const isDemo = studentId === 'std_demo_1' || studentId === 'std_01j8k9x2p4';

    // A real student gets a starter plan only when they have saved a syllabus to build it from;
    // otherwise the subjects above would be placeholders, so they start with no plan.
    if (!isDemo && !(syllabus?.subjects?.length)) {
      return;
    }

    // 1. Study Plan
    const planId = 'plan_sem6_primary_' + studentId;
    const studyPlan: StudyPlan = {
      id: planId,
      student_id: studentId,
      title: `${branchName} Semester ${semNumber} Academic & Preparation Schedule`,
      type: 'SEMESTER',
      description: `Targeted daily and weekly preparation covering ${primarySubject}, ${secondSubject}, ${thirdSubject}, and placement practice.`,
      target_date: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      total_hours_target: 120,
      // A starter plan generated from the student's own subjects; nothing is marked done for them.
      completed_hours: isDemo ? 38 : 0,
      status: 'ACTIVE',
      tasks: [
        {
          id: 'task_1',
          plan_id: planId,
          student_id: studentId,
          title: `Review ${primarySubject} — Core Theory & Problem Formulations`,
          subject: primarySubject,
          topic: 'Unit 1 Foundations',
          start_time: '09:00 AM',
          duration_minutes: 60,
          priority: 'CRITICAL',
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          notes: `Focus on core principles, definitions, and university paper questions for ${primarySubject}.`,
          // Not model output, so only the demo accounts carry this sample recommendation.
          ai_recommendation: isDemo ? `Recommended: Complete 3 practice problems from Unit 1 for ${primarySubject}.` : undefined,
          created_at: new Date().toISOString(),
        },
        {
          id: 'task_2',
          plan_id: planId,
          student_id: studentId,
          title: `Practice ${secondSubject} — Implementation Drills & Lab Exercises`,
          subject: secondSubject,
          topic: 'Unit 2 Applications',
          start_time: '11:00 AM',
          duration_minutes: 90,
          priority: 'HIGH',
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          notes: `Hands-on practice and algorithm implementation for ${secondSubject}.`,
          ai_recommendation: isDemo ? `Practice standard coding and laboratory patterns for ${secondSubject}.` : undefined,
          created_at: new Date().toISOString(),
        },
        {
          id: 'task_3',
          plan_id: planId,
          student_id: studentId,
          title: `Master ${thirdSubject} — Unit Assessment & Revisions`,
          subject: thirdSubject,
          topic: 'Unit 3 Deep Dive',
          start_time: '03:00 PM',
          duration_minutes: 60,
          priority: 'MEDIUM',
          status: isDemo ? 'COMPLETED' : 'PENDING',
          completed_at: isDemo ? new Date(Date.now() - 3600000).toISOString() : undefined,
          date: new Date().toISOString().split('T')[0],
          notes: isDemo ? `Completed conceptual revision and formula summary for ${thirdSubject}.` : `Conceptual revision and formula summary for ${thirdSubject}.`,
          created_at: new Date().toISOString(),
        },
        {
          id: 'task_4',
          plan_id: planId,
          student_id: studentId,
          title: 'Quantitative Aptitude & Problem Solving Drills',
          subject: 'Placement Preparation',
          topic: 'Aptitude & DSA',
          start_time: '05:30 PM',
          duration_minutes: 45,
          priority: 'MEDIUM',
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Never overwrite a plan the student already has (other list pages call this seeder too).
    if (!this.studyPlans.has(planId)) {
      this.studyPlans.set(planId, studyPlan);
    }

    // Everything below (exam results, doubts, decks, lab work, ML runs, designs, knowledge items and
    // internship applications with offers) is demo content. Only the two demo accounts get it; a real
    // student with an empty list sees an empty list, not invented history.
    if (!isDemo) {
      return;
    }

    // 2. Exams
    const examId = 'exam_midterm_' + studentId;
    const exam: ExamEntity = {
      id: examId,
      student_id: studentId,
      title: `${primarySubject} Mid-Semester Examination`,
      subject: primarySubject,
      category: 'SEMESTER',
      exam_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      difficulty: 'HARD',
      available_prep_hours: 24,
      syllabus: `Comprehensive midterm assessment covering ${primarySubject} Units 1, 2, and 3.`,
      readiness_score: 74,
      topics: [
        {
          id: 'top_rel_alg',
          exam_id: examId,
          name: 'Relational Algebra & Tuple Calculus',
          unit: 'Unit 1',
          weightage_percent: 15,
          confidence: 'STRONG',
          status: 'MASTERED',
          subtopics: ['Select', 'Project', 'Natural Join', 'Division operator'],
        },
        {
          id: 'top_norm',
          exam_id: examId,
          name: 'Functional Dependencies & Normalization',
          unit: 'Unit 2',
          weightage_percent: 30,
          confidence: 'WEAK',
          status: 'IN_PROGRESS',
          revision_due_date: new Date().toISOString().split('T')[0],
          subtopics: ['Closure of attribute set', 'Minimal cover', '3NF synthesis', 'BCNF decomposition'],
        },
        {
          id: 'top_trans',
          exam_id: examId,
          name: 'Transactions & Concurrency Control',
          unit: 'Unit 3',
          weightage_percent: 25,
          confidence: 'DEVELOPING',
          status: 'NOT_STARTED',
          subtopics: ['Conflict serializability', 'Two-Phase Locking (2PL)', 'Deadlock detection'],
        },
        {
          id: 'top_indexing',
          exam_id: examId,
          name: 'Storage & B+ Tree Indexing',
          unit: 'Unit 4',
          weightage_percent: 30,
          confidence: 'DEVELOPING',
          status: 'REVISED',
          subtopics: ['Dense vs Sparse index', 'B+ tree insertion/deletion', 'Cost estimation'],
        },
      ],
      mock_tests_count: 2,
      last_mock_score: 78,
      status: 'UPCOMING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.exams.set(examId, exam);

    // 3. Doubts
    const doubtId = 'doubt_1_' + studentId;
    this.doubts.set(doubtId, {
      id: doubtId,
      student_id: studentId,
      title: 'Why does BCNF not always preserve functional dependencies?',
      question_text: 'When decomposing a relation R(A, B, C) with FDs AB -> C and C -> B into BCNF, why can we lose the dependency AB -> C? Can you explain with a real schema example?',
      topic: 'Database Normalization',
      course_id: 'CS301',
      course_name: 'Database Management Systems',
      status: 'RESOLVED',
      tags: ['dbms', 'bcnf', 'normalization'],
      resolution: {
        direct_answer: 'BCNF requires that for every non-trivial functional dependency X -> Y, X must be a superkey. When a dependency X -> Y has an overlap where Y determines part of X (e.g. C -> B where {A,B} is key), decomposing to satisfy BCNF splits attributes into separate tables, making it impossible to enforce X -> Y without computing a cross-table join.',
        simple_explanation: 'Think of BCNF as having stricter rules than 3NF. 3NF allows X -> Y if Y is a prime attribute (part of a key). BCNF removes this exception. So a relation in 3NF might need to be split into two tables to reach BCNF, but now the original rule requires both tables combined to verify!',
        detailed_explanation: 'Consider R(Street, City, ZipCode) with FDs:\n1. (Street, City) -> ZipCode\n2. ZipCode -> City\n\nCandidate keys are {Street, City} and {Street, ZipCode}.\nIn FD (2), ZipCode is not a superkey, but City is a prime attribute, so R is in 3NF.\nTo force BCNF, we decompose into R1(ZipCode, City) and R2(Street, ZipCode).\nBoth R1 and R2 are in BCNF. However, testing the original FD (Street, City) -> ZipCode now requires an expensive join of R1 and R2. Thus, the dependency is not preserved.',
        example: 'Schema: Booking(PropertyId, Date, GuestId, Price). If PropertyId, Date -> GuestId and GuestId -> Date, decomposing to isolate GuestId loses the ability to check double-booking across separate table rows.',
        common_mistake: 'Assuming every relation has a decomposition that is BOTH in BCNF and dependency-preserving. That is false! 3NF always guarantees dependency preservation; BCNF does not.',
        related_concepts: ['Lossless Join Decomposition', '3NF Synthesis Algorithm', 'Minimal Functional Dependency Cover'],
        suggested_practice: 'Work through the classic Postal Code decomposition problem and compute projection of dependencies.',
        quiz_question: {
          question: 'Which of the following normal forms always guarantees both lossless join and dependency preservation?',
          options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
          correct: 2,
          explanation: '3NF synthesis algorithm guarantees both lossless join and dependency preservation. BCNF cannot always preserve all functional dependencies.',
        },
      },
      created_at: new Date(Date.now() - 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 3600000).toISOString(),
    });

    // 4. Flashcards
    const deckId = 'deck_os_memory_' + studentId;
    const flashcardDeck: FlashcardDeck = {
      id: deckId,
      student_id: studentId,
      title: 'Operating Systems: Virtual Memory & Page Replacement',
      subject: 'Operating Systems',
      description: 'High-yield flashcards for paging, translation lookaside buffer (TLB), inverted page tables, and LRU algorithms.',
      total_cards: 4,
      due_count: 2,
      mastered_count: 1,
      cards: [
        {
          id: 'fc_1',
          deck_id: deckId,
          student_id: studentId,
          front: 'What causes Belady\'s Anomaly in page replacement algorithms?',
          back: 'Belady\'s Anomaly occurs when allocating more page frames results in MORE page faults. It occurs in non-stack algorithms such as FIFO, where the set of pages in memory for n frames is not a subset of pages in memory for n+1 frames.',
          type: 'CONCEPT',
          topic: 'Page Replacement',
          difficulty: 'MEDIUM',
          state: 'REVIEW',
          confidence: 3,
          review_count: 4,
          correct_count: 3,
          incorrect_count: 1,
          next_review: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
        {
          id: 'fc_2',
          deck_id: deckId,
          student_id: studentId,
          front: 'Calculate Effective Memory Access Time (EMAT) formula with TLB.',
          back: 'EMAT = (TLB Hit Ratio * (TLB Access Time + Memory Access Time)) + ((1 - TLB Hit Ratio) * (TLB Access Time + 2 * Memory Access Time))\n\nNote: For multi-level paging with k levels, miss penalty involves (k + 1) memory accesses.',
          type: 'FORMULA',
          topic: 'Virtual Memory',
          difficulty: 'HARD',
          state: 'LEARNING',
          confidence: 2,
          review_count: 2,
          correct_count: 1,
          incorrect_count: 1,
          next_review: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
        {
          id: 'fc_3',
          deck_id: deckId,
          student_id: studentId,
          front: 'Define Thrashing and state how it can be detected.',
          back: 'Thrashing occurs when a computer\'s CPU spends more time swapping pages in and out of disk than executing user instructions (paging overhead exceeds 90%). It is detected when CPU utilization drops while disk paging traffic spikes to near 100%.',
          type: 'DEFINITION',
          topic: 'Thrashing',
          difficulty: 'EASY',
          state: 'MASTERED',
          confidence: 5,
          review_count: 6,
          correct_count: 6,
          incorrect_count: 0,
          next_review: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };
    this.flashcardDecks.set(deckId, flashcardDeck);

    // 5. Labs
    const labId = 'lab_dbms_1_' + studentId;
    const lab: LabEntity = {
      id: labId,
      student_id: studentId,
      title: 'Database Management Systems Laboratory',
      course_code: 'CS311',
      branch: 'Computer Science',
      semester: 6,
      created_at: new Date().toISOString(),
      experiments: [
        {
          id: 'exp_1',
          lab_id: labId,
          title: 'Implementation of DDL, DML and Integrity Constraints in PostgreSQL',
          experiment_number: 1,
          objective: 'Design and create a university database schema with Primary Key, Foreign Key (ON DELETE CASCADE), CHECK, and UNIQUE constraints.',
          theory: 'DDL (Data Definition Language) commands define the database structure (CREATE, ALTER, DROP). Integrity constraints ensure entity integrity, referential integrity, and domain correctness across relational tables.',
          requirements: ['PostgreSQL 15+', 'pgAdmin / Terminal', 'SQL Client'],
          procedure: [
            'Connect to the PostgreSQL database cluster.',
            'Execute CREATE TABLE statements for Departments and Faculty.',
            'Apply foreign key references and CHECK constraints.',
            'Insert valid sample rows to verify domain validation.',
            'Test cascading delete behavior when a department is removed.',
          ],
          implementation_code: `-- DDL Schema Setup\nCREATE TABLE departments (\n  dept_id SERIAL PRIMARY KEY,\n  dept_name VARCHAR(100) NOT NULL UNIQUE,\n  budget NUMERIC(12,2) CHECK (budget >= 0)\n);\n\nCREATE TABLE faculty (\n  faculty_id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(150) UNIQUE,\n  dept_id INT REFERENCES departments(dept_id) ON DELETE CASCADE\n);`,
          expected_output: 'CREATE TABLE\nCREATE TABLE\nINSERT 0 3\nDELETE 1 (Cascaded successfully to faculty records)',
          conclusion: 'Verified that schema constraints maintain data integrity and prevent orphaned child rows.',
          status: 'COMPLETED',
          viva_questions: [
            {
              id: 'vq_1',
              question: 'What is the exact functional difference between DROP, TRUNCATE, and DELETE?',
              expected_concept: 'DELETE is a logged DML operation with WHERE clause support. TRUNCATE is a DDL operation that resets high-water mark and deallocates extent pages (cannot have WHERE, faster). DROP removes the schema table structure from catalog entirely.',
            },
            {
              id: 'vq_2',
              question: 'Can a PRIMARY KEY column contain NULL values in standard SQL?',
              expected_concept: 'No. By relational definition, a Primary Key enforces both UNIQUE and NOT NULL constraints to ensure entity integrity.',
            },
          ],
        },
      ],
    };
    this.labs.set(labId, lab);

    // 6. ML Experiment
    const mlExpId = 'exp_rf_iris_' + studentId;
    this.mlExperiments.set(mlExpId, {
      id: mlExpId,
      student_id: studentId,
      name: 'Random Forest Multi-Class Classification on Iris',
      dataset_name: 'Iris Flower Classification',
      model_type: 'Random Forest',
      hyperparameters: {
        n_estimators: 100,
        max_depth: 4,
        criterion: 'gini',
        random_state: 42,
      },
      train_split: 0.8,
      status: 'COMPLETED',
      metrics: {
        accuracy: 0.9667,
        precision: 0.9680,
        recall: 0.9667,
        f1_score: 0.9665,
        confusion_matrix: [
          [10, 0, 0],
          [0, 9, 1],
          [0, 0, 10],
        ],
      },
      insights: {
        underfitting_or_overfitting: 'Optimal fit with slight boundary uncertainty between versicolor and virginica.',
        feature_importance: [
          { feature: 'petal_length', importance: 0.44 },
          { feature: 'petal_width', importance: 0.42 },
          { feature: 'sepal_length', importance: 0.10 },
          { feature: 'sepal_width', importance: 0.04 },
        ],
        recommendations: [
          'Petal length and petal width contribute 86% of discriminatory variance.',
          'Pruning max_depth to 3 reduces risk of overfitting without loss of test accuracy.',
        ],
      },
      created_at: new Date().toISOString(),
    });

    // 7. System Design
    const sysId = 'sd_active_url_' + studentId;
    this.systemDesigns.set(sysId, {
      id: sysId,
      student_id: studentId,
      problem_id: 'sd_url_shortener',
      title: 'Scalable URL Shortener Architecture (Production Ready)',
      components: [
        { id: 'c1', name: 'Cloudflare Edge CDN', type: 'CDN', description: 'Terminates SSL and caches 301 redirects at edge locations', tech_choice: 'Cloudflare' },
        { id: 'c2', name: 'Nginx API Gateway & Rate Limiter', type: 'LOAD_BALANCER', description: 'Enforces 100 req/min token bucket per IP', tech_choice: 'Nginx + OpenResty' },
        { id: 'c3', name: 'URL Redirect & Shortening Cluster', type: 'SERVICE', description: 'Stateless Go microservice for base62 generation and redirects', tech_choice: 'Go / Gin' },
        { id: 'c4', name: 'Redis Cache (LRU)', type: 'CACHE', description: 'Stores hot URLs with 24h TTL; handles 80% read throughput', tech_choice: 'Redis Cluster' },
        { id: 'c5', name: 'Distributed Token Dispenser (KGS)', type: 'SERVICE', description: 'Allocates pre-computed 100,000 token ranges to each web worker', tech_choice: 'Apache Zookeeper + Go' },
        { id: 'c6', name: 'CockroachDB Multi-Region Storage', type: 'DATABASE', description: 'Stores short_code to original_url mapping with replication factor 3', tech_choice: 'CockroachDB' },
      ],
      connections: [
        { from: 'c1', to: 'c2', protocol: 'HTTP/REST', description: 'Forward cache misses to origin API' },
        { from: 'c2', to: 'c3', protocol: 'HTTP/REST', description: 'Load balance traffic across stateless nodes' },
        { from: 'c3', to: 'c4', protocol: 'TCP', description: 'Check cache on redirect' },
        { from: 'c3', to: 'c5', protocol: 'gRPC', description: 'Acquire new token batch when worker pool exhausted' },
        { from: 'c3', to: 'c6', protocol: 'TCP', description: 'Persist new URL mapping' },
      ],
      notes: 'Key innovation: KGS guarantees zero collisions without database lock contention. Redis handles 80,000 QPS with sub-5ms latency.',
      ai_analysis: {
        score: 92,
        strengths: [
          'Excellent decoupling of token generation via KGS prevents race conditions during concurrent writes.',
          'Layered caching (CDN -> Redis -> Database) provides robust absorption against viral URL surges.',
          'Horizontal scaling of stateless Go redirect workers enables linear scale.',
        ],
        bottlenecks: ['Heavy cache evictions if write volume spikes unexpectedly with long-tail cold URLs.'],
        tradeoffs: ['Base62 7-character keys yield 3.5 Trillion URLs, sufficient for 100 years of operation.'],
        suggested_improvements: [
          'Implement Kafka messaging queue for asynchronous analytics logging (country, device, referrer).',
          'Add circuit breaker between Go workers and CockroachDB to prevent cascading failure during DB failover.',
        ],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 8. Knowledge Items & Collections
    const colId = 'col_cs_core_' + studentId;
    this.knowledgeCollections.set(colId, {
      id: colId,
      student_id: studentId,
      name: 'Computer Science Core Foundations',
      description: 'Unified repository of verified algorithms, operating system concepts, and database theory.',
      item_count: 3,
      icon: 'BookOpen',
      created_at: new Date().toISOString(),
    });

    const kId = 'k_item_1_' + studentId;
    this.knowledgeItems.set(kId, {
      id: kId,
      student_id: studentId,
      title: 'ACID Properties in Relational Databases',
      content: 'Atomicity (All or nothing via WAL undo logs), Consistency (State invariants and integrity constraints), Isolation (Serializability levels from Read Uncommitted to Serializable), Durability (Committed changes survive crashes via redo logs and fsync).',
      type: 'NOTE',
      topic: 'Database Management Systems',
      collection_id: colId,
      collection_name: 'Computer Science Core Foundations',
      tags: ['dbms', 'acid', 'transactions'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 9. Internship applications: none are seeded, not even for the demo accounts. Earlier versions added Google,
    // Microsoft and Amazon applications with invented statuses, interview rounds and readiness scores.
  }

  // ==========================================
  // 1. Study Planner Methods
  // ==========================================
  public static async getStudyPlans(studentId: string): Promise<StudyPlan[]> {
    let plans = Array.from(this.studyPlans.values()).filter((p) => p.student_id === studentId);
    if (plans.length === 0) {
      this.seedDemoData(studentId);
      plans = Array.from(this.studyPlans.values()).filter((p) => p.student_id === studentId);
    }
    return plans;
  }

  public static async getStudyPlanById(studentId: string, planId: string): Promise<StudyPlan> {
    const plan = this.studyPlans.get(planId);
    if (!plan || plan.student_id !== studentId) {
      throw new NotFoundError(`Study plan '${planId}' not found`);
    }
    return plan;
  }

  public static async createStudyPlan(studentId: string, data: Partial<StudyPlan>): Promise<StudyPlan> {
    if (!data.title) throw new ValidationError('Plan title is required');
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const plan: StudyPlan = {
      id: planId,
      student_id: studentId,
      title: data.title,
      type: data.type || 'DAILY',
      description: data.description || '',
      target_date: data.target_date || new Date().toISOString().split('T')[0],
      total_hours_target: data.total_hours_target || 10,
      completed_hours: 0,
      status: 'ACTIVE',
      tasks: (data.tasks || []).map((t, idx) => ({
        ...t,
        id: `task_${Date.now()}_${idx}`,
        plan_id: planId,
        student_id: studentId,
        priority: t.priority || 'MEDIUM',
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.studyPlans.set(planId, plan);
    return plan;
  }

  public static async updateTaskStatus(
    studentId: string,
    planId: string,
    taskId: string,
    status: 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED' | 'IN_PROGRESS' | 'PENDING'
  ): Promise<StudyPlanTask> {
    const allowed = ['COMPLETED', 'SKIPPED', 'RESCHEDULED', 'IN_PROGRESS', 'PENDING'];
    if (!allowed.includes(status)) {
      throw new ValidationError(`Status must be one of ${allowed.join(', ')}`);
    }
    const plan = await this.getStudyPlanById(studentId, planId);
    const task = plan.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundError(`Task '${taskId}' not found`);
    const wasCompleted = task.status === 'COMPLETED';
    task.status = status;
    // Count a task's hours once, and take them back if it is un-completed.
    const hours = (task.duration_minutes || 0) / 60;
    if (status === 'COMPLETED' && !wasCompleted) {
      task.completed_at = new Date().toISOString();
      plan.completed_hours = Math.round((plan.completed_hours + hours) * 10) / 10;
    } else if (status !== 'COMPLETED' && wasCompleted) {
      task.completed_at = undefined;
      plan.completed_hours = Math.max(0, Math.round((plan.completed_hours - hours) * 10) / 10);
    }
    plan.updated_at = new Date().toISOString();
    this.studyPlans.set(plan.id, plan);
    return task;
  }

  /** Adds a task the student wrote to one of their own plans. */
  public static async addStudyPlanTask(
    studentId: string,
    planId: string,
    data: { title?: string; subject?: string; topic?: string; date?: string; start_time?: string; duration_minutes?: number; priority?: string; notes?: string }
  ): Promise<StudyPlanTask> {
    const plan = await this.getStudyPlanById(studentId, planId);
    const title = String(data.title || '').trim();
    if (!title) throw new ValidationError('Task title is required');
    const date = String(data.date || new Date().toISOString().split('T')[0]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      throw new ValidationError('Task date must be a valid date (YYYY-MM-DD)');
    }
    const duration = Number(data.duration_minutes ?? 60);
    if (!Number.isInteger(duration) || duration < 5 || duration > 600) {
      throw new ValidationError('Duration must be a whole number of minutes between 5 and 600');
    }
    const priority = String(data.priority || 'MEDIUM').toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      throw new ValidationError('Priority must be LOW, MEDIUM, HIGH or CRITICAL');
    }
    const task: StudyPlanTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      plan_id: plan.id,
      student_id: studentId,
      title,
      subject: String(data.subject || '').trim(),
      topic: String(data.topic || '').trim(),
      start_time: data.start_time,
      duration_minutes: duration,
      priority: priority as StudyPlanTask['priority'],
      status: 'PENDING',
      date,
      notes: data.notes,
      created_at: new Date().toISOString(),
    } as StudyPlanTask;
    plan.tasks.push(task);
    plan.updated_at = new Date().toISOString();
    this.studyPlans.set(plan.id, plan);
    return task;
  }

  public static async getTodayTasks(studentId: string): Promise<StudyPlanTask[]> {
    const plans = await this.getStudyPlans(studentId);
    const today = new Date().toISOString().split('T')[0];
    const tasks: StudyPlanTask[] = [];
    for (const p of plans) {
      for (const t of p.tasks) {
        // Today's tasks plus overdue ones still pending; future tasks wait for their day.
        if (t.date === today || (t.status === 'PENDING' && (!t.date || t.date < today))) {
          tasks.push(t);
        }
      }
    }
    return tasks;
  }

  // ==========================================
  // 2. Exam Preparation Methods
  // ==========================================
  public static async getExams(studentId: string): Promise<ExamEntity[]> {
    return Array.from(this.exams.values()).filter((e) => e.student_id === studentId);
  }

  public static async getExamById(studentId: string, examId: string): Promise<ExamEntity> {
    const exam = this.exams.get(examId);
    if (!exam || exam.student_id !== studentId) {
      throw new NotFoundError(`Exam '${examId}' not found`);
    }
    return exam;
  }

  /** Readiness from the student's own topic confidence, weighted by topic weightage (0-100). */
  public static computeReadiness(topics: ExamTopic[]): number {
    if (!topics.length) return 0;
    const value = { STRONG: 1, DEVELOPING: 0.5, WEAK: 0 } as Record<string, number>;
    const totalW = topics.reduce((a, t) => a + (t.weightage_percent || 0), 0) || topics.length;
    const got = topics.reduce((a, t) => a + (value[t.confidence] ?? 0) * (totalW === topics.length ? 1 : t.weightage_percent || 0), 0);
    return Math.round((got / totalW) * 100);
  }

  public static async createExam(studentId: string, data: Partial<ExamEntity>): Promise<ExamEntity> {
    if (!data.title || !data.subject) throw new ValidationError('Exam title and subject are required');
    // The exam date and syllabus come from the student; nothing is assumed for them.
    const examDate = String(data.exam_date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate) || isNaN(new Date(examDate).getTime())) {
      throw new ValidationError('Enter the exam date (YYYY-MM-DD).');
    }
    const syllabusTopics = (data.syllabus || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
    if (!syllabusTopics.length) throw new ValidationError('List the syllabus topics, separated by commas.');
    const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const generatedTopics: ExamTopic[] = syllabusTopics.map((topicName, idx) => ({
      id: `top_${Date.now()}_${idx}`,
      exam_id: examId,
      name: topicName,
      unit: `Topic ${idx + 1}`,
      // No official weightage was entered, so topics are weighted equally.
      weightage_percent: Math.round(100 / syllabusTopics.length),
      // Every topic starts as not yet confident; the student updates confidence as they revise.
      confidence: 'WEAK',
      status: 'NOT_STARTED',
      subtopics: [],
    }));

    const exam: ExamEntity = {
      id: examId,
      student_id: studentId,
      title: data.title,
      subject: data.subject,
      category: data.category || 'SEMESTER',
      exam_date: examDate,
      difficulty: data.difficulty || 'MEDIUM',
      available_prep_hours: Math.max(1, Math.min(500, Number(data.available_prep_hours) || 20)),
      syllabus: data.syllabus || '',
      readiness_score: 0,
      topics: generatedTopics,
      mock_tests_count: 0,
      status: 'UPCOMING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.exams.set(examId, exam);
    return exam;
  }

  public static async updateExamTopic(
    studentId: string,
    examId: string,
    topicId: string,
    updates: { confidence?: string; status?: string }
  ): Promise<ExamEntity> {
    const exam = await this.getExamById(studentId, examId);
    const topic = exam.topics.find((t) => t.id === topicId);
    if (!topic) throw new NotFoundError(`Topic '${topicId}' not found`);
    if (updates.confidence !== undefined) {
      if (!['WEAK', 'DEVELOPING', 'STRONG'].includes(updates.confidence)) throw new ValidationError('confidence must be WEAK, DEVELOPING or STRONG');
      topic.confidence = updates.confidence as any;
    }
    if (updates.status !== undefined) {
      if (!['NOT_STARTED', 'IN_PROGRESS', 'REVISED', 'MASTERED'].includes(updates.status)) throw new ValidationError('Unknown topic status');
      topic.status = updates.status as any;
    }
    exam.readiness_score = this.computeReadiness(exam.topics);
    exam.updated_at = new Date().toISOString();
    this.exams.set(exam.id, exam);
    return exam;
  }

  public static async deleteExam(studentId: string, examId: string): Promise<{ success: boolean }> {
    await this.getExamById(studentId, examId);
    this.exams.delete(examId);
    return { success: true };
  }

  // ==========================================
  // 3. AI Doubt Solver Methods
  // ==========================================
  public static async getDoubts(studentId: string): Promise<StudentDoubt[]> {
    let items = Array.from(this.doubts.values()).filter((d) => d.student_id === studentId);
    if (items.length === 0) {
      this.seedDemoData(studentId);
      items = Array.from(this.doubts.values()).filter((d) => d.student_id === studentId);
    }
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getDoubtById(studentId: string, doubtId: string): Promise<StudentDoubt> {
    const doubt = this.doubts.get(doubtId);
    if (!doubt || doubt.student_id !== studentId) {
      throw new NotFoundError(`Doubt '${doubtId}' not found`);
    }
    return doubt;
  }

  /** Asks the model for a structured resolution; returns null when there is no usable model output. */
  private static async resolveDoubtWithAI(data: Partial<StudentDoubt>): Promise<DoubtResolution | null> {
    const prompt = `A B.Tech student asks a doubt${data.topic ? ` about ${data.topic}` : ''}.
TITLE: ${data.title}
QUESTION: ${String(data.question_text).slice(0, 3000)}
${data.code_snippet ? `CODE:\n${String(data.code_snippet).slice(0, 3000)}` : ''}

Answer the doubt accurately. Return valid JSON only:
{"direct_answer": "...", "simple_explanation": "...", "detailed_explanation": "...", "example": "...", "common_mistake": "...", "related_concepts": ["..."], "suggested_practice": "...", "quiz_question": {"question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..."}}`;
    let res;
    try {
      res = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.3);
    } catch {
      return null;
    }
    if (!res || AIService.isUnavailableResult(res)) return null;
    try {
      const m = res.text.match(/\{[\s\S]*\}/);
      const parsed = m ? parseLooseJson(m[0]) : null;
      if (!parsed || typeof parsed.direct_answer !== 'string' || !parsed.direct_answer.trim()) return null;
      const q = parsed.quiz_question;
      const quizOk = q && Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length;
      return {
        direct_answer: parsed.direct_answer,
        simple_explanation: String(parsed.simple_explanation || ''),
        detailed_explanation: String(parsed.detailed_explanation || ''),
        example: String(parsed.example || ''),
        common_mistake: String(parsed.common_mistake || ''),
        related_concepts: Array.isArray(parsed.related_concepts) ? parsed.related_concepts.map(String) : [],
        suggested_practice: String(parsed.suggested_practice || ''),
        quiz_question: quizOk ? { question: String(q.question), options: q.options.map(String), correct: q.correct, explanation: String(q.explanation || '') } : undefined,
      };
    } catch {
      return null;
    }
  }

  public static async createDoubt(studentId: string, data: Partial<StudentDoubt>): Promise<StudentDoubt> {
    if (!data.title || !data.question_text) {
      throw new ValidationError('Doubt title and question text are required');
    }
    const doubtId = `doubt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // The resolution comes from the model. Without one, the doubt is saved as OPEN with no
    // resolution, so the student keeps the question in history and nothing invented is shown.
    const resolution = await this.resolveDoubtWithAI(data);
    const doubt: StudentDoubt = {
      id: doubtId,
      student_id: studentId,
      title: data.title,
      question_text: data.question_text,
      code_snippet: data.code_snippet,
      topic: data.topic || 'General Computer Science',
      course_id: data.course_id,
      course_name: data.course_name,
      status: resolution ? 'RESOLVED' : 'OPEN',
      resolution: resolution || undefined,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      resolved_at: resolution ? new Date().toISOString() : undefined,
    };

    this.doubts.set(doubtId, doubt);
    return doubt;
  }

  // ==========================================
  // 4. Flashcards + Spaced Revision Methods
  // ==========================================

  public static async getFlashcardDecks(
    studentId: string,
    options?: { search?: string; subject?: string; course_id?: string; status?: string; sortBy?: string }
  ): Promise<FlashcardDeck[]> {
    const decks = await db.getFlashcardDecks(studentId, options);
    decks.forEach((d) => this.flashcardDecks.set(d.id, d));
    return decks;
  }

  public static async getFlashcardDeckById(studentId: string, deckId: string): Promise<FlashcardDeck> {
    const deck = await db.getFlashcardDeckById(deckId, studentId);
    if (!deck) {
      const memoryDeck = this.flashcardDecks.get(deckId);
      if (memoryDeck && memoryDeck.student_id === studentId) {
        return memoryDeck;
      }
      throw new NotFoundError(`Flashcard deck '${deckId}' not found`);
    }
    return deck;
  }

  public static async createFlashcardDeck(
    studentId: string,
    data: Omit<Partial<FlashcardDeck>, 'cards'> & {
      cards?: Array<Pick<Flashcard, 'front' | 'back'> & Partial<Flashcard>>;
      /** Legacy alias for subject. */
      subject_name?: string;
    }
  ): Promise<FlashcardDeck> {
    const subject = (data.subject || data.subject_name || '').trim();
    if (!data.title?.trim() || !subject) {
      throw new ValidationError('Title and subject are required');
    }

    const today = new Date().toISOString().split('T')[0];
    const deckId = `deck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const cards: Flashcard[] = (data.cards || []).map((c, idx) => ({
      id: `fc_${deckId}_${idx + 1}`,
      deck_id: deckId,
      student_id: studentId,
      front: String(c.front || '').trim(),
      back: String(c.back || '').trim(),
      type: c.type || 'CONCEPT',
      topic: c.topic || subject || 'General',
      difficulty: c.difficulty || 'MEDIUM',
      explanation: c.explanation || '',
      example: c.example || '',
      tags: c.tags || data.tags || [],
      source_type: data.source_type || 'MANUAL',
      source_id: data.source_id,
      source_title: data.source_title,
      state: 'NEW',
      confidence: 1,
      review_count: 0,
      correct_count: 0,
      incorrect_count: 0,
      interval_days: 1,
      ease_factor: 2.5,
      repetition_count: 0,
      is_bookmarked: Boolean(c.is_bookmarked),
      next_review: today,
      created_at: new Date().toISOString(),
    }));

    const deck: FlashcardDeck = {
      id: deckId,
      student_id: studentId,
      title: data.title.trim(),
      subject: subject,
      description: data.description?.trim() || '',
      total_cards: cards.length,
      due_count: cards.length,
      mastered_count: 0,
      cards,
      course_id: data.course_id,
      course_code: data.course_code,
      tags: data.tags || [],
      source_type: data.source_type || 'MANUAL',
      source_id: data.source_id,
      source_title: data.source_title,
      is_archived: false,
      is_bookmarked: Boolean(data.is_bookmarked),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await db.saveFlashcardDeck(deck);
    this.flashcardDecks.set(deckId, saved);
    logger.info(`Flashcard deck created: '${deck.title}' (${deck.id}) for student ${studentId}`);
    return saved;
  }

  public static async updateFlashcardDeck(
    studentId: string,
    deckId: string,
    updates: Partial<FlashcardDeck>
  ): Promise<FlashcardDeck> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);

    if (updates.title !== undefined) {
      if (!updates.title.trim()) throw new ValidationError('Title cannot be empty');
      deck.title = updates.title.trim();
    }
    if (updates.subject !== undefined) {
      if (!updates.subject.trim()) throw new ValidationError('Subject cannot be empty');
      deck.subject = updates.subject.trim();
    }
    if (updates.description !== undefined) {
      deck.description = updates.description.trim();
    }
    if (updates.course_id !== undefined) deck.course_id = updates.course_id;
    if (updates.course_code !== undefined) deck.course_code = updates.course_code;
    if (updates.tags !== undefined) deck.tags = updates.tags;
    if (updates.is_archived !== undefined) deck.is_archived = updates.is_archived;
    if (updates.is_bookmarked !== undefined) deck.is_bookmarked = updates.is_bookmarked;

    const saved = await db.saveFlashcardDeck(deck);
    this.flashcardDecks.set(deckId, saved);
    return saved;
  }

  public static async duplicateFlashcardDeck(studentId: string, deckId: string): Promise<FlashcardDeck> {
    const dup = await db.duplicateFlashcardDeck(deckId, studentId);
    if (!dup) throw new NotFoundError(`Flashcard deck '${deckId}' not found`);
    this.flashcardDecks.set(dup.id, dup);
    return dup;
  }

  public static async archiveFlashcardDeck(
    studentId: string,
    deckId: string,
    isArchived: boolean = true
  ): Promise<FlashcardDeck> {
    return this.updateFlashcardDeck(studentId, deckId, { is_archived: isArchived });
  }

  public static async bookmarkFlashcardDeck(
    studentId: string,
    deckId: string,
    isBookmarked: boolean = true
  ): Promise<FlashcardDeck> {
    return this.updateFlashcardDeck(studentId, deckId, { is_bookmarked: isBookmarked });
  }

  public static async toggleDeckArchive(studentId: string, deckId: string): Promise<FlashcardDeck> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    return this.archiveFlashcardDeck(studentId, deckId, !deck.is_archived);
  }

  public static async toggleDeckBookmark(studentId: string, deckId: string): Promise<FlashcardDeck> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    return this.bookmarkFlashcardDeck(studentId, deckId, !deck.is_bookmarked);
  }

  public static async deleteFlashcardDeck(studentId: string, deckId: string): Promise<boolean> {
    await this.getFlashcardDeckById(studentId, deckId);
    const deleted = await db.deleteFlashcardDeck(deckId, studentId);
    this.flashcardDecks.delete(deckId);
    return deleted;
  }

  public static async addCardToDeck(
    studentId: string,
    deckId: string,
    cardData: Partial<Flashcard>
  ): Promise<Flashcard> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    if (!cardData.front?.trim() || !cardData.back?.trim()) {
      throw new ValidationError('Card front and back are required');
    }

    const today = new Date().toISOString().split('T')[0];
    const newCard: Flashcard = {
      id: `fc_${deckId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deck_id: deckId,
      student_id: studentId,
      front: cardData.front.trim(),
      back: cardData.back.trim(),
      type: cardData.type || 'CONCEPT',
      topic: cardData.topic?.trim() || deck.subject,
      difficulty: cardData.difficulty || 'MEDIUM',
      explanation: cardData.explanation || '',
      example: cardData.example || '',
      tags: cardData.tags || deck.tags || [],
      source_type: deck.source_type,
      source_id: deck.source_id,
      source_title: deck.source_title,
      state: 'NEW',
      confidence: 1,
      review_count: 0,
      correct_count: 0,
      incorrect_count: 0,
      interval_days: 1,
      ease_factor: 2.5,
      repetition_count: 0,
      is_bookmarked: Boolean(cardData.is_bookmarked),
      next_review: today,
      created_at: new Date().toISOString(),
    };

    deck.cards.push(newCard);
    await db.saveFlashcardDeck(deck);
    this.flashcardDecks.set(deckId, deck);
    return newCard;
  }

  public static async updateCard(
    studentId: string,
    deckId: string,
    cardId: string,
    updates: Partial<Flashcard>,
    resetSchedule: boolean = false
  ): Promise<Flashcard> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) throw new NotFoundError(`Card '${cardId}' not found in deck`);

    if (updates.front !== undefined) {
      if (!updates.front.trim()) throw new ValidationError('Card front cannot be empty');
      card.front = updates.front.trim();
    }
    if (updates.back !== undefined) {
      if (!updates.back.trim()) throw new ValidationError('Card back cannot be empty');
      card.back = updates.back.trim();
    }
    if (updates.type !== undefined) card.type = updates.type;
    if (updates.topic !== undefined) card.topic = updates.topic.trim();
    if (updates.difficulty !== undefined) card.difficulty = updates.difficulty;
    if (updates.explanation !== undefined) card.explanation = updates.explanation;
    if (updates.example !== undefined) card.example = updates.example;
    if (updates.tags !== undefined) card.tags = updates.tags;
    if (updates.is_bookmarked !== undefined) card.is_bookmarked = updates.is_bookmarked;

    if (resetSchedule) {
      const today = new Date().toISOString().split('T')[0];
      card.state = 'NEW';
      card.confidence = 1;
      card.review_count = 0;
      card.correct_count = 0;
      card.incorrect_count = 0;
      card.interval_days = 1;
      card.ease_factor = 2.5;
      card.repetition_count = 0;
      card.next_review = today;
    }

    await db.saveFlashcardDeck(deck);
    this.flashcardDecks.set(deckId, deck);
    return card;
  }

  public static async deleteCard(studentId: string, deckId: string, cardId: string): Promise<boolean> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    const initialLen = deck.cards.length;
    deck.cards = deck.cards.filter((c) => c.id !== cardId);
    if (deck.cards.length === initialLen) {
      throw new NotFoundError(`Card '${cardId}' not found in deck`);
    }

    await db.saveFlashcardDeck(deck);
    this.flashcardDecks.set(deckId, deck);
    return true;
  }

  public static async updateCardInDeck(
    studentId: string,
    deckId: string,
    cardId: string,
    updates: Partial<Flashcard>,
    resetSchedule: boolean = false
  ): Promise<Flashcard> {
    return this.updateCard(studentId, deckId, cardId, updates, resetSchedule);
  }

  public static async deleteCardFromDeck(studentId: string, deckId: string, cardId: string): Promise<boolean> {
    return this.deleteCard(studentId, deckId, cardId);
  }

  public static async bookmarkCard(
    studentId: string,
    deckId: string,
    cardId: string,
    isBookmarked: boolean = true
  ): Promise<Flashcard> {
    return this.updateCard(studentId, deckId, cardId, { is_bookmarked: isBookmarked });
  }

  public static async reviewFlashcard(
    studentId: string,
    deckId: string,
    cardId: string,
    ratingOrConfidence: ReviewRating | number
  ): Promise<Flashcard> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) throw new NotFoundError(`Card '${cardId}' not found in deck`);

    // Standardize rating to numeric grade (0 to 5)
    let grade = 4;
    let confidence = 4;
    let ratingString = 'GOOD';

    if (typeof ratingOrConfidence === 'string' && /^\d+$/.test(ratingOrConfidence.trim())) {
      ratingOrConfidence = Number(ratingOrConfidence);
    }
    if (typeof ratingOrConfidence === 'string') {
      if (!['AGAIN', 'HARD', 'GOOD', 'EASY'].includes(ratingOrConfidence.toUpperCase())) {
        throw new ValidationError('Rating must be AGAIN, HARD, GOOD or EASY');
      }
    } else if (!Number.isInteger(ratingOrConfidence) || ratingOrConfidence < 0 || ratingOrConfidence > 5) {
      throw new ValidationError('Rating must be AGAIN, HARD, GOOD, EASY or a whole number from 0 to 5');
    }

    if (typeof ratingOrConfidence === 'string') {
      const upper = ratingOrConfidence.toUpperCase();
      ratingString = upper;
      if (upper === 'AGAIN') {
        grade = 1;
        confidence = 1;
      } else if (upper === 'HARD') {
        grade = 3;
        confidence = 2;
      } else if (upper === 'GOOD') {
        grade = 4;
        confidence = 3;
      } else if (upper === 'EASY') {
        grade = 5;
        confidence = 4;
      }
    } else {
      const num = Number(ratingOrConfidence);
      if (num <= 1) {
        grade = 1;
        confidence = 1;
        ratingString = 'AGAIN';
      } else if (num === 2) {
        grade = 3;
        confidence = 2;
        ratingString = 'HARD';
      } else if (num === 3) {
        grade = 4;
        confidence = 3;
        ratingString = 'GOOD';
      } else if (num === 4) {
        grade = 5;
        confidence = 4;
        ratingString = 'EASY';
      } else {
        grade = 5;
        confidence = 5;
        ratingString = 'EASY';
      }
    }

    card.confidence = confidence;
    card.review_count = (card.review_count || 0) + 1;
    card.last_reviewed = new Date().toISOString();
    card.ease_factor = card.ease_factor || 2.5;
    card.repetition_count = card.repetition_count || 0;

    // SuperMemo-2 (SM-2) Spaced Repetition Scheduling Algorithm
    if (grade < 3) {
      // Forgotten: restart learning sequence
      card.incorrect_count = (card.incorrect_count || 0) + 1;
      card.repetition_count = 0;
      card.interval_days = 1;
      card.state = 'LEARNING';
      card.ease_factor = Math.max(1.3, Number((card.ease_factor - 0.20).toFixed(2)));
    } else {
      // Recalled correctly: scale interval according to current repetition
      card.correct_count = (card.correct_count || 0) + 1;
      if (card.repetition_count === 0) {
        card.interval_days = 1;
      } else if (card.repetition_count === 1) {
        card.interval_days = grade === 5 ? 7 : (grade === 3 ? 3 : 6);
      } else {
        const bonus = grade === 5 ? 1.3 : (grade === 3 ? 0.85 : 1.0);
        card.interval_days = Math.max(1, Math.round((card.interval_days || 1) * card.ease_factor * bonus));
      }

      card.repetition_count += 1;

      // Mastery condition: 3+ correct recalls with at least 6 days interval
      if (card.repetition_count >= 3 && card.interval_days >= 6) {
        card.state = 'MASTERED';
      } else {
        card.state = 'REVIEW';
      }

      // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      card.ease_factor = Math.max(1.3, Number((card.ease_factor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))).toFixed(2)));
    }

    // Calculate next due date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (card.interval_days || 1));
    card.next_review = nextDate.toISOString().split('T')[0];
    card.next_review_at = card.next_review;
    card.last_reviewed_at = new Date().toISOString();

    deck.last_reviewed_at = new Date().toISOString();

    // Persist deck and review record
    await db.saveFlashcardDeck(deck);
    await db.recordFlashcardReview({
      student_id: studentId,
      deck_id: deckId,
      card_id: cardId,
      rating: ratingString,
      confidence,
    });
    this.flashcardDecks.set(deckId, deck);

    // Publish event for Unified Progress & Learning Activity tracking
    try {
      await EventBus.getInstance().publish(
        'FLASHCARD_REVIEWED',
        {
          deck_id: deckId,
          card_id: cardId,
          deck_title: deck.title,
          rating: ratingString,
          confidence,
          interval_days: card.interval_days,
          is_mastered: card.state === 'MASTERED',
        },
        {
          student_id: studentId,
          resource_type: 'flashcard',
          resource_id: cardId,
        }
      );
    } catch {
      // Non-fatal event publishing
    }

    return card;
  }

  public static async getDueFlashcards(
    studentId: string,
    options?: { deck_id?: string; course_id?: string; limit?: number }
  ): Promise<Flashcard[]> {
    return await db.getDueFlashcards(studentId, options);
  }

  public static async getFlashcardStats(studentId: string): Promise<FlashcardStats> {
    return await db.getFlashcardStats(studentId);
  }

  // ==========================================
  // AI Flashcard Generation Methods
  // ==========================================

  public static async generateAIFlashcards(
    studentId: string,
    req: FlashcardAIGenerateRequest
  ): Promise<{
    title: string;
    subject: string;
    cards: Array<{
      front: string;
      back: string;
      type: Flashcard['type'];
      topic: string;
      difficulty: Flashcard['difficulty'];
      explanation?: string;
      example?: string;
    }>;
    is_fallback: boolean;
  }> {
    if (!req.topic?.trim()) {
      throw new ValidationError('Topic is required for flashcard generation');
    }

    const count = Math.min(Math.max(req.count || 6, 2), 15);
    const difficulty = req.difficulty || 'INTERMEDIATE';
    const style = req.style || 'MIXED';
    const subject = req.subject || 'Engineering Concepts';

    const systemPrompt = `You are the specialized FlashcardAgent for B.Tech engineering students.
Your job is to generate focused, high-yield active recall question-and-answer flashcards.
CRITICAL FORMAT RULES:
1. Front must be a clear, testable question, formula prompt, or concept check.
2. Back must be a concise, direct, accurate answer (2-4 sentences max).
3. Include clear conceptual or mathematical explanations.
4. Output valid JSON only with NO markdown fences or preamble.`;

    const userPrompt = `Generate exactly ${count} active recall flashcards for B.Tech curriculum:
TOPIC: ${req.topic}
SUBJECT: ${subject}
DIFFICULTY: ${difficulty}
CARD STYLE: ${style}
${req.context_text ? `CONTEXT/SOURCE TEXT:\n"""\n${req.context_text.slice(0, 3000)}\n"""` : ''}

Output JSON format:
{
  "title": "${req.topic} Flashcards",
  "subject": "${subject}",
  "cards": [
    {
      "front": "Concise testable prompt or question",
      "back": "Accurate, direct explanation or definition",
      "type": "CONCEPT", // DEFINITION, CONCEPT, FORMULA, COMPARISON, QA
      "topic": "${req.topic}",
      "difficulty": "MEDIUM", // EASY, MEDIUM, HARD
      "explanation": "Brief elaboration or invariant",
      "example": "Practical real-world or code example if relevant"
    }
  ]
}`;

    // Cards come from the model only. Without real output nothing is returned for saving,
    // rather than generic template cards that mention the topic name.
    const aiResult = await AIService.generate(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      'revision_notes_prompt',
      0.3
    );
    if (AIService.isUnavailableResult(aiResult)) {
      throw new AppError('Flashcard generation needs the AI provider, which is not available right now. Nothing was generated.', 503, 'AI_UNAVAILABLE');
    }

    let parsed: any = null;
    try {
      const raw = aiResult.text.trim();
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      parsed = parseLooseJson(jsonStart !== -1 && jsonEnd !== -1 ? raw.slice(jsonStart, jsonEnd + 1) : raw);
    } catch {
      parsed = null;
    }
    const cards = (Array.isArray(parsed?.cards) ? parsed.cards : [])
      .filter((c: any) => typeof c?.front === 'string' && c.front.trim() && typeof c?.back === 'string' && c.back.trim())
      .map((c: any) => ({
        front: c.front,
        back: c.back,
        type: c.type || 'CONCEPT',
        topic: c.topic || req.topic,
        difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(c.difficulty) ? c.difficulty : 'MEDIUM',
        explanation: c.explanation || '',
        example: c.example || '',
      }));
    if (cards.length === 0) {
      logger.warn(`AI flashcard generation returned no usable cards for topic '${req.topic}'`);
      throw new AppError('The AI provider returned no usable flashcards. Please try again.', 502, 'AI_BAD_RESPONSE');
    }
    return {
      title: parsed.title || `${req.topic} Flashcards`,
      subject: parsed.subject || subject,
      cards,
      is_fallback: false,
    };
  }

  public static async generateFromNote(
    studentId: string,
    noteId: string
  ): Promise<{
    title: string;
    subject: string;
    source_id: string;
    source_title: string;
    cards: Array<{
      front: string;
      back: string;
      type: Flashcard['type'];
      topic: string;
      difficulty: Flashcard['difficulty'];
    }>;
  }> {
    const note = await db.getNoteById(noteId, studentId);
    if (!note) {
      throw new NotFoundError(`Note '${noteId}' not found or unauthorized`);
    }

    const generated = await NotesService.generateFlashcards(studentId, noteId);
    return {
      title: `Flashcards: ${note.title}`,
      subject: note.tags?.[0] || 'Academic Notes',
      source_id: note.id,
      source_title: note.title,
      cards: generated.map((g) => ({
        front: g.question,
        back: g.answer,
        type: 'CONCEPT',
        topic: g.concept || note.title,
        difficulty: (g.difficulty?.toUpperCase() as any) || 'MEDIUM',
      })),
    };
  }

  public static async generateFromDocument(
    studentId: string,
    documentId: string,
    targetCount: number = 6
  ): Promise<{
    title: string;
    subject: string;
    source_id: string;
    source_title: string;
    cards: Array<{
      front: string;
      back: string;
      type: Flashcard['type'];
      topic: string;
      difficulty: Flashcard['difficulty'];
    }>;
  }> {
    const doc = await db.getDocumentById(documentId, studentId);
    if (!doc) {
      throw new NotFoundError(`Document '${documentId}' not found or unauthorized`);
    }

    const material = await KnowledgeBaseService.generateStudyMaterial(studentId, {
      document_id: documentId,
      type: 'FLASHCARDS',
      target_count: targetCount,
    });

    const rawCards = material.content?.flashcards || [];
    return {
      title: material.title || `Flashcards: ${doc.title}`,
      subject: doc.category || 'Study Material',
      source_id: doc.id,
      source_title: doc.title,
      cards: rawCards.map((c) => ({
        front: c.question,
        back: c.answer,
        type: 'CONCEPT',
        topic: c.topic || doc.title,
        difficulty: (c.difficulty?.toUpperCase() as any) || 'MEDIUM',
      })),
    };
  }

  public static async generateFromCourse(
    studentId: string,
    courseId: string,
    chapterId?: string,
    targetCount: number = 6
  ): Promise<{
    title: string;
    subject: string;
    source_id: string;
    source_title: string;
    cards: Array<{
      front: string;
      back: string;
      type: Flashcard['type'];
      topic: string;
      difficulty: Flashcard['difficulty'];
    }>;
  }> {
    const course = await db.getCourseById(courseId, studentId);
    if (!course) {
      throw new NotFoundError(`Course '${courseId}' not found or unauthorized`);
    }

    let targetTopic = course.title;
    if (chapterId) {
      const chapter = course.chapters.find((c) => c.id === chapterId);
      if (chapter) {
        targetTopic = `${course.title}: ${chapter.title}`;
      }
    }

    const aiRes = await this.generateAIFlashcards(studentId, {
      topic: targetTopic,
      subject: course.branch || course.category || course.title,
      count: targetCount,
      difficulty: 'INTERMEDIATE',
    });

    return {
      title: `Flashcards: ${targetTopic}`,
      subject: course.branch || course.title,
      source_id: course.id,
      source_title: `${course.title} (${course.code})`,
      cards: aiRes.cards,
    };
  }

  public static async scheduleReviewTask(
    studentId: string,
    deckId: string,
    scheduledDate?: string,
    durationMinutes: number = 20
  ): Promise<StudyPlanTask> {
    const deck = await this.getFlashcardDeckById(studentId, deckId);
    if (scheduledDate !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || Number.isNaN(Date.parse(scheduledDate)))) {
      throw new ValidationError('Scheduled date must be a valid date (YYYY-MM-DD)');
    }
    const plans = await this.getStudyPlans(studentId);
    let plan = plans[0];
    if (!plan) {
      plan = await this.createStudyPlan(studentId, {
        title: `Spaced Revision Plan: ${deck.subject}`,
        type: 'REVISION',
        description: 'Active recall flashcard revision schedule',
        total_hours_target: 10,
      });
    }

    const earliestDue = scheduledDate || deck.cards[0]?.next_review || new Date().toISOString().split('T')[0];
    const taskId = `task_rev_${Date.now()}`;
    const newTask: StudyPlanTask = {
      id: taskId,
      plan_id: plan.id,
      student_id: studentId,
      title: `Flashcard Spaced Review: ${deck.title}`,
      notes: `Active recall review of ${deck.due_count || deck.total_cards} cards scheduled for ${deck.subject}.`,
      subject: deck.subject,
      topic: deck.title,
      date: earliestDue,
      duration_minutes: durationMinutes,
      priority: 'HIGH',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    plan.tasks.push(newTask);
    this.studyPlans.set(plan.id, plan);
    logger.info(`Scheduled flashcard study plan task '${newTask.title}' for student ${studentId}`);
    return newTask;
  }

  // ==========================================
  // 5. Lab Assistant + Viva Methods
  // ==========================================
  // Lab data is owned by LabAssistantService and always scoped to the signed-in student.
  // (These used to fall back to shared demo labs and to a length-based viva "score"; removed in Phase 2.)
  public static async getLabs(studentId: string): Promise<any[]> {
    const { LabAssistantService } = await import('./labAssistantService');
    const labs = await LabAssistantService.getLabs(studentId);
    return labs.map((l: any) => ({ ...l, title: l.title || l.name }));
  }

  public static async getLabById(studentId: string, labId: string): Promise<any> {
    const { LabAssistantService } = await import('./labAssistantService');
    const lab: any = await LabAssistantService.getLabById(studentId, labId);
    return { ...lab, title: lab.title || lab.name };
  }

  public static async evaluateVivaAnswer(
    studentId: string,
    _labId: string,
    experimentId: string,
    questionId: string,
    studentAnswer: string
  ): Promise<any> {
    const { LabAssistantService } = await import('./labAssistantService');
    return LabAssistantService.evaluateVivaAnswer(studentId, experimentId, questionId, studentAnswer);
  }

  // ==========================================
  // 6. SQL / Database Lab Methods
  // ==========================================
  public static async getSqlSchemas(studentId: string = 'std_01j8k9x2p4'): Promise<Record<string, SQLTableDefinition[]>> {
    return SqlLabSandboxService.getSchemas(studentId);
  }

  public static async getSqlChallenges(): Promise<SQLChallenge[]> {
    return this.sqlChallenges;
  }

  public static async executeSandboxedSql(
    studentId: string,
    query: string,
    dbName: string = 'university_db'
  ): Promise<SQLExecutionResult> {
    return SqlLabSandboxService.executeSandboxedSql(studentId, dbName, query);
  }

  // ==========================================
  // 7. AI/ML Lab Methods
  // ==========================================
  public static async getMlDatasets(studentId: string = 'std_01j8k9x2p4'): Promise<MLDataset[]> {
    return MlLabService.getDatasets(studentId);
  }

  public static async getMlExperiments(studentId: string): Promise<MLExperimentEntity[]> {
    return MlLabService.getExperiments(studentId);
  }

  public static async createAndRunMlExperiment(
    studentId: string,
    data: any
  ): Promise<MLExperimentEntity> {
    if (!data.name || (!data.dataset_name && !data.dataset_id)) {
      throw new ValidationError('Experiment name and dataset are required');
    }
    return MlLabService.runExperiment(studentId, {
      name: data.name,
      dataset_id: data.dataset_id || data.dataset_name,
      dataset_name: data.dataset_name || data.name,
      target_column: data.target_column,
      feature_columns: data.feature_columns || [],
      task_type: data.task_type || (data.model_type?.includes('Linear') ? 'REGRESSION' : 'CLASSIFICATION'),
      model_type: data.model_type || 'Random Forest',
      train_split: data.train_split || 0.8,
      hyperparameters: data.hyperparameters || {},
      workspace_id: data.workspace_id,
    });
  }

  // ==========================================
  // 8. System Design Lab Methods
  // ==========================================
  public static async getSystemDesignProblems(): Promise<SystemDesignProblem[]> {
    return this.systemDesignProblems;
  }

  public static async getSystemDesigns(studentId: string): Promise<SystemDesignEntity[]> {
    let designs = Array.from(this.systemDesigns.values()).filter((s) => s.student_id === studentId);
    if (designs.length === 0) {
      this.seedDemoData(studentId);
      designs = Array.from(this.systemDesigns.values()).filter((s) => s.student_id === studentId);
    }
    return designs;
  }

  public static async createSystemDesign(
    studentId: string,
    data: Partial<SystemDesignEntity>
  ): Promise<SystemDesignEntity> {
    if (!data.title) throw new ValidationError('Design title is required');
    const designId = `sd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const design: SystemDesignEntity = {
      id: designId,
      student_id: studentId,
      problem_id: data.problem_id || 'custom',
      title: data.title,
      components: data.components || [
        { id: 'c1', name: 'Web Client', type: 'CLIENT', description: 'Browser / Mobile app', tech_choice: 'React' },
        { id: 'c2', name: 'API Gateway', type: 'API_GATEWAY', description: 'Authentication & routing', tech_choice: 'Kong' },
        { id: 'c3', name: 'Backend Service', type: 'SERVICE', description: 'Core business logic', tech_choice: 'Go' },
        { id: 'c4', name: 'Primary Database', type: 'DATABASE', description: 'Relational storage', tech_choice: 'PostgreSQL' },
      ],
      connections: data.connections || [
        { from: 'c1', to: 'c2', protocol: 'HTTP/REST', description: 'Client requests' },
        { from: 'c2', to: 'c3', protocol: 'gRPC', description: 'Service routing' },
        { from: 'c3', to: 'c4', protocol: 'TCP', description: 'Database queries' },
      ],
      notes: data.notes || '',
      ai_analysis: {
        score: 88,
        strengths: ['Clear separation of concerns between Gateway and Service layers.', 'Strong tech choices for concurrency.'],
        bottlenecks: ['Add a caching layer (Redis) in front of PostgreSQL to handle high read volumes.'],
        tradeoffs: ['Monolithic API Gateway simplifies auth but requires independent scaling.'],
        suggested_improvements: ['Introduce message queue for asynchronous event processing.'],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.systemDesigns.set(designId, design);
    return design;
  }

  // ==========================================
  // 9. Personal Knowledge Base Methods
  // ==========================================
  public static async getKnowledgeCollections(studentId: string): Promise<KnowledgeCollection[]> {
    return Array.from(this.knowledgeCollections.values()).filter((c) => c.student_id === studentId);
  }

  public static async getKnowledgeItems(studentId: string, search?: string): Promise<KnowledgeItem[]> {
    let items = Array.from(this.knowledgeItems.values()).filter((k) => k.student_id === studentId);
    if (search && search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }

  public static async createKnowledgeItem(
    studentId: string,
    data: Partial<KnowledgeItem>
  ): Promise<KnowledgeItem> {
    if (!data.title || !data.content) throw new ValidationError('Title and content are required');
    const itemId = `k_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const item: KnowledgeItem = {
      id: itemId,
      student_id: studentId,
      title: data.title,
      content: data.content,
      type: data.type || 'NOTE',
      topic: data.topic || 'General Learning',
      collection_id: data.collection_id,
      collection_name: data.collection_name,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.knowledgeItems.set(itemId, item);
    return item;
  }

  public static async getKnowledgeGraphData(studentId: string): Promise<KnowledgeGraphData> {
    return {
      nodes: [
        { id: 'course_dbms', label: 'DBMS Course', type: 'COURSE' },
        { id: 'top_norm', label: 'Normalization', type: 'TOPIC' },
        { id: 'note_acid', label: 'ACID Notes', type: 'NOTE' },
        { id: 'flash_os', label: 'OS Flashcards', type: 'FLASHCARD' },
        { id: 'doubt_bcnf', label: 'BCNF Doubt', type: 'DOUBT' },
        { id: 'proj_kv', label: 'Distributed KV Store', type: 'PROJECT' },
      ],
      edges: [
        { from: 'course_dbms', to: 'top_norm', relationship: 'CONTAINS' },
        { from: 'top_norm', to: 'note_acid', relationship: 'REINFORCES' },
        { from: 'top_norm', to: 'doubt_bcnf', relationship: 'SOLVED_BY' },
        { from: 'note_acid', to: 'proj_kv', relationship: 'APPLIES' },
        { from: 'top_norm', to: 'flash_os', relationship: 'EXPLORING' },
      ],
    };
  }

  // ==========================================
  // 10. Internship Tracker Methods
  // ==========================================
  /** Removes the sample applications earlier versions seeded for demo accounts from a restored snapshot. */
  public static retireSeededApplications(): number {
    let removed = 0;
    for (const id of Array.from(this.applications.keys())) {
      if (/^app_(google_swe|microsoft_sde|amazon_sde)_/.test(id)) {
        this.applications.delete(id);
        removed++;
      }
    }
    return removed;
  }

  public static async getApplications(studentId: string): Promise<InternshipApplication[]> {
    return Array.from(this.applications.values())
      .filter((a) => a.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getApplicationById(studentId: string, appId: string): Promise<InternshipApplication> {
    const app = this.applications.get(appId);
    if (!app || app.student_id !== studentId) {
      throw new NotFoundError(`Application '${appId}' not found`);
    }
    return app;
  }

  private static readonly APPLICATION_STATUSES: ApplicationStatus[] = [
    'SAVED', 'INTERESTED', 'PREPARING', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'TECHNICAL_ROUND', 'HR_ROUND', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'CLOSED',
  ];

  private static checkStatus(status: unknown): ApplicationStatus {
    if (!this.APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
      throw new ValidationError(`status must be one of ${this.APPLICATION_STATUSES.join(', ')}`);
    }
    return status as ApplicationStatus;
  }

  /** Validates the fields a student may set on an application. Returns only those fields, trimmed. */
  private static cleanApplicationInput(data: any): Partial<InternshipApplication> & { job_description?: string } {
    const out: any = {};
    const text = (k: string, max: number) => {
      if (data?.[k] === undefined || data[k] === null) return;
      if (typeof data[k] !== 'string') throw new ValidationError(`${k} must be text`);
      const v = data[k].trim();
      if (v.length > max) throw new ValidationError(`${k} must be at most ${max} characters`);
      out[k] = v;
    };
    text('company_name', 200);
    text('role', 200);
    text('location', 200);
    text('salary_range', 100);
    text('contact_person', 200);
    text('resume_version_name', 200);
    text('notes', 5000);
    text('job_description', 20000);
    text('application_url', 2000);
    for (const k of ['application_date', 'deadline', 'interview_date', 'assessment_date']) {
      text(k, 10);
      if (out[k] && !/^\d{4}-\d{2}-\d{2}$/.test(out[k])) throw new ValidationError(`${k} must be a date (YYYY-MM-DD)`);
      if (out[k] === '') out[k] = undefined;
    }
    // Only web links: a javascript: or data: URL would run in the page when the student clicks "Job Link".
    if (out.application_url) {
      let u: URL;
      try { u = new URL(out.application_url); } catch { throw new ValidationError('application_url must be a web address (https://...)'); }
      if (!['http:', 'https:'].includes(u.protocol)) throw new ValidationError('application_url must start with http:// or https://');
    }
    if (data?.status !== undefined) out.status = this.checkStatus(data.status);
    if (data?.opportunity_type !== undefined && data.opportunity_type !== null && data.opportunity_type !== '') {
      if (!(OPPORTUNITY_TYPES as readonly string[]).includes(data.opportunity_type)) {
        throw new ValidationError(`opportunity_type must be one of ${OPPORTUNITY_TYPES.join(', ')}`);
      }
      out.opportunity_type = data.opportunity_type;
    }
    return out;
  }

  /**
   * Compares the skills named in a pasted job description with the skills on the student's profile. Only catalogue
   * skills found in the text are listed; nothing is assumed. Returns undefined when the text names no known skill.
   */
  private static async analyseJobDescription(studentId: string, jd: string): Promise<JobDescriptionSkillAnalysis | undefined> {
    const { skillMatches } = await import('./careerService');
    const catalogue = await db.getSkills();
    const named = catalogue.filter((sk) => skillMatches(sk.name, [jd]));
    if (named.length === 0) return undefined;
    const mine = await db.getStudentSkills(studentId);
    // A self-declaration is recorded as an evidence item; it is not evidence, so it is not counted here.
    const evidence = (await db.getSkillEvidence(studentId)).filter((e) => e.source_type !== 'STUDENT_DECLARED');
    const required_skills = named.map((sk) => {
      const held = mine.find((m) => m.skill_id === sk.id || skillMatches(sk.name, [m.skill_name]));
      const items = held ? evidence.filter((e) => e.skill_id === held.skill_id) : [];
      if (held && items.length > 0) {
        const kinds = Array.from(new Set(items.map((e) => String(e.source_type).toLowerCase().replace(/_/g, ' '))));
        return { name: sk.name, evidence_status: 'EVIDENCE_AVAILABLE' as const, evidence_source: `${items.length} evidence item(s): ${kinds.join(', ')}` };
      }
      if (held) return { name: sk.name, evidence_status: 'DEVELOPING' as const, evidence_source: held.source === 'STUDENT_DECLARED' ? 'Declared on your profile; no evidence recorded yet' : 'On your profile, no evidence recorded yet' };
      return { name: sk.name, evidence_status: 'NOT_YET_ASSESSED' as const, evidence_source: 'Not on your profile' };
    });
    const withEvidence = required_skills.filter((r) => r.evidence_status === 'EVIDENCE_AVAILABLE').length;
    const missing = required_skills.filter((r) => r.evidence_status === 'NOT_YET_ASSESSED').map((r) => r.name);
    const noEvidence = required_skills.filter((r) => r.evidence_status === 'DEVELOPING').map((r) => r.name);
    const recommended_preparation: string[] = [];
    if (missing.length) recommended_preparation.push(`Named in the job description but not on your profile: ${missing.join(', ')}.`);
    if (noEvidence.length) recommended_preparation.push(`On your profile without evidence yet (a project, course or quiz would add some): ${noEvidence.join(', ')}.`);
    return {
      required_skills,
      // Share of the skills named in the job description for which the profile has evidence.
      readiness_percent: Math.round((withEvidence / required_skills.length) * 100),
      recommended_preparation,
    };
  }

  public static async createApplication(
    studentId: string,
    data: Partial<InternshipApplication> & { job_description?: string }
  ): Promise<InternshipApplication> {
    const clean = this.cleanApplicationInput(data);
    if (!clean.company_name || !clean.role) {
      throw new ValidationError('Company name and role are required');
    }
    const status = clean.status || 'APPLIED';
    const today = new Date().toISOString().split('T')[0];
    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const app: InternshipApplication = {
      id: appId,
      student_id: studentId,
      company_name: clean.company_name,
      role: clean.role,
      location: clean.location || '',
      application_date: clean.application_date || today,
      deadline: clean.deadline,
      application_url: clean.application_url,
      status,
      salary_range: clean.salary_range,
      interview_date: clean.interview_date,
      assessment_date: clean.assessment_date,
      contact_person: clean.contact_person,
      resume_version_name: clean.resume_version_name,
      notes: clean.notes || '',
      opportunity_type: clean.opportunity_type,
      job_description: clean.job_description || undefined,
      timeline: [{ id: `ev_${Date.now()}`, title: ['SAVED', 'INTERESTED', 'PREPARING'].includes(status) ? 'Saved to tracker' : 'Application recorded', date: today, status }],
      jd_analysis: clean.job_description ? await this.analyseJobDescription(studentId, clean.job_description) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.applications.set(appId, app);
    return app;
  }

  public static async updateApplicationStatus(
    studentId: string,
    appId: string,
    newStatus: any,
    note?: string
  ): Promise<InternshipApplication> {
    const status = this.checkStatus(newStatus);
    const app = await this.getApplicationById(studentId, appId);
    if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) throw new ValidationError('note must be text up to 1,000 characters');
    app.status = status;
    app.timeline.push({
      id: `ev_${Date.now()}`,
      title: note ? `Status changed to ${status}: ${note}` : `Status changed to ${status}`,
      date: new Date().toISOString().split('T')[0],
      status,
    });
    app.updated_at = new Date().toISOString();
    this.applications.set(app.id, app);
    return app;
  }

  public static async updateApplication(
    studentId: string,
    appId: string,
    patch: Partial<InternshipApplication> & { job_description?: string }
  ): Promise<InternshipApplication> {
    const app = await this.getApplicationById(studentId, appId);
    const clean = this.cleanApplicationInput(patch);
    if (clean.company_name === '' || clean.role === '') throw new ValidationError('Company name and role cannot be empty');
    for (const k of ['company_name', 'role', 'location', 'deadline', 'application_url', 'salary_range', 'notes', 'interview_date', 'assessment_date', 'contact_person', 'resume_version_name', 'application_date', 'opportunity_type'] as const) {
      if (k in clean) (app as any)[k] = (clean as any)[k];
    }
    if ('job_description' in clean) {
      app.job_description = clean.job_description || undefined;
      app.jd_analysis = clean.job_description ? await this.analyseJobDescription(studentId, clean.job_description) : undefined;
    }
    if (clean.status && clean.status !== app.status) {
      app.status = clean.status;
      app.timeline.push({
        id: `ev_${Date.now()}`,
        title: `Status updated to ${clean.status}`,
        date: new Date().toISOString().split('T')[0],
        status: clean.status,
      });
    }
    app.updated_at = new Date().toISOString();
    this.applications.set(app.id, app);
    return app;
  }

  public static async deleteApplication(studentId: string, appId: string): Promise<boolean> {
    const app = await this.getApplicationById(studentId, appId);
    this.applications.delete(app.id);
    return true;
  }

  public static async addTimelineEvent(
    studentId: string,
    appId: string,
    event: { title: string; date?: string; notes?: string; status?: ApplicationStatus }
  ): Promise<InternshipApplication> {
    const app = await this.getApplicationById(studentId, appId);
    const title = typeof event?.title === 'string' ? event.title.trim() : '';
    if (!title || title.length > 200) throw new ValidationError('A milestone title (up to 200 characters) is required');
    if (event.date !== undefined && event.date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(String(event.date))) throw new ValidationError('date must be YYYY-MM-DD');
    if (event.notes !== undefined && (typeof event.notes !== 'string' || event.notes.length > 2000)) throw new ValidationError('notes must be text up to 2,000 characters');
    const status = event.status ? this.checkStatus(event.status) : app.status;
    const newEvent: ApplicationTimelineEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      date: event.date || new Date().toISOString().split('T')[0],
      status,
      notes: event.notes,
    };
    app.timeline.push(newEvent);
    if (status !== app.status) app.status = status;
    app.updated_at = new Date().toISOString();
    this.applications.set(app.id, app);
    return app;
  }

  // AI Tool Compatibility & Extended Methods
  public static async markDoubtResolved(studentId: string, doubtId: string): Promise<StudentDoubt> {
    const doubt = await this.getDoubtById(studentId, doubtId);
    doubt.status = 'RESOLVED';
    doubt.resolved_at = new Date().toISOString();
    this.doubts.set(doubt.id, doubt);
    return doubt;
  }

  public static async getDeckById(studentId: string, deckId: string): Promise<FlashcardDeck> {
    return this.getFlashcardDeckById(studentId, deckId);
  }

  public static async reviewCard(studentId: string, deckId: string, cardId: string, rating: any): Promise<Flashcard> {
    return this.reviewFlashcard(studentId, deckId, cardId, rating);
  }

  public static async getExperimentById(studentId: string, labId: string, experimentId?: string): Promise<any> {
    const lab = await this.getLabById(studentId, labId);
    if (!experimentId) return lab;
    const exp = lab.experiments.find((e: any) => e.id === experimentId);
    return exp || lab;
  }

  public static async executeSqlSandbox(studentId: string, query: string): Promise<SQLExecutionResult> {
    return this.executeSandboxedSql(studentId, query);
  }

  public static async getSqlExecutionHistory(_studentId?: string): Promise<any[]> {
    return [];
  }

  public static async runMlExperiment(studentId: string, data: any): Promise<MLExperimentEntity> {
    return this.createAndRunMlExperiment(studentId, data);
  }

  public static async getMlExperimentById(studentId: string, expId: string): Promise<MLExperimentEntity | undefined> {
    const exps = await this.getMlExperiments(studentId);
    return exps.find((e) => e.id === expId);
  }

  public static async saveSystemDesign(studentId: string, data: any): Promise<SystemDesignEntity> {
    return this.createSystemDesign(studentId, data);
  }

  public static async getSystemDesignById(studentId: string, designId: string): Promise<SystemDesignEntity | undefined> {
    const designs = await this.getSystemDesigns(studentId);
    return designs.find((d) => d.id === designId);
  }

  public static async analyzeSystemDesign(_studentId: string, designOrId: any): Promise<any> {
    return {
      design_id: typeof designOrId === 'string' ? designOrId : designOrId?.id,
      scores: { latency: 85, availability: 90, scalability: 88 },
      bottlenecks: ['Single database write replica', 'No distributed caching layer'],
      recommendations: ['Introduce Redis cluster for read cache', 'Implement multi-region database replicas'],
    };
  }

  public static async searchKnowledge(studentId: string, query?: string): Promise<KnowledgeItem[]> {
    return this.getKnowledgeItems(studentId, query);
  }

  public static async getKnowledgeGraph(studentId: string): Promise<KnowledgeGraphData> {
    return this.getKnowledgeGraphData(studentId);
  }

  public static async analyzeJobDescription(_studentId: string, _jobDescription: string): Promise<any> {
    return {
      required_skills: ['TypeScript', 'Node.js', 'Distributed Systems'],
      recommended_projects: ['High-throughput message queue', 'Scalable cache'],
      fit_score: 85,
    };
  }
}

