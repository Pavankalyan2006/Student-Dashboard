// server/db/mockInterviewCatalog.ts
// Structured, comprehensive question catalog and rubrics for AI Mock Interviews

import {
  MockInterviewCategory,
  MockInterviewQuestionCatalogItem,
  RubricDimension,
} from '../models/mockInterviewTypes';

export interface CategoryMetadata {
  id: MockInterviewCategory;
  title: string;
  shortDesc: string;
  badge: string;
  iconName: string;
  defaultQuestions: number;
  defaultDuration: number;
  rubricTemplate: RubricDimension[];
}

export interface TargetRoleMetadata {
  id: string;
  title: string;
  department: string;
  keySkills: string[];
  suggestedCategories: MockInterviewCategory[];
}

export const RUBRIC_TEMPLATES: Record<string, RubricDimension[]> = {
  TECHNICAL: [
    { dimension: 'Technical Correctness', weight: 35, description: 'Accuracy of engineering fundamentals, theorems, protocols, and definitions' },
    { dimension: 'Problem Solving & Structure', weight: 25, description: 'Systematic approach, logical decomposition, and reasoning flow' },
    { dimension: 'Communication & Terminology', weight: 20, description: 'Clarity of explanation and precise usage of technical terminology' },
    { dimension: 'Edge Cases & Completeness', weight: 10, description: 'Awareness of operational boundary conditions and fault scenarios' },
    { dimension: 'System Trade-offs', weight: 10, description: 'Understanding memory, latency, throughput, and consistency trade-offs' },
  ],
  CODING: [
    { dimension: 'Algorithmic Correctness', weight: 40, description: 'Correct algorithm logic, passing test cases, and edge-case resilience' },
    { dimension: 'Complexity Analysis', weight: 20, description: 'Accurate Big-O time and space complexity derivation and reasoning' },
    { dimension: 'Code Quality & Modularity', weight: 20, description: 'Clean naming, readability, idiomatic idioms, and maintainable structure' },
    { dimension: 'Optimization Potential', weight: 20, description: 'Identifying bottlenecks and explaining alternative data structures' },
  ],
  SQL: [
    { dimension: 'Query Correctness', weight: 40, description: 'Syntactic validity, accurate joins, aggregations, and expected dataset return' },
    { dimension: 'Schema & Normalization Awareness', weight: 20, description: 'Understanding relational integrity, keys, and relational constraints' },
    { dimension: 'Indexing & Query Performance', weight: 20, description: 'Awareness of index utilization, table scans, and execution plans' },
    { dimension: 'SQL Standards & Clarity', weight: 20, description: 'Readable aliases, explicit column listings, and clean CTE formatting' },
  ],
  SYSTEM_DESIGN: [
    { dimension: 'Architecture & Scalability', weight: 35, description: 'Decoupled services, horizontal scaling, caching, and load balancing' },
    { dimension: 'Requirement Decomposition', weight: 20, description: 'Clarifying functional vs non-functional requirements and back-of-envelope math' },
    { dimension: 'Data Modeling & Storage', weight: 20, description: 'Appropriate choice of relational vs NoSQL, partitioning, and replication' },
    { dimension: 'Fault Tolerance & Trade-offs', weight: 25, description: 'SPoF elimination, circuit breaking, CAP theorem compromises, and latency' },
  ],
  BEHAVIORAL: [
    { dimension: 'STAR Structure & Completeness', weight: 35, description: 'Clear narrative breakdown into Situation, Task, Action, and Result' },
    { dimension: 'Relevance & Concrete Impact', weight: 25, description: 'Quantifiable achievements, tangible outcomes, and direct relevance' },
    { dimension: 'Communication & Professionalism', weight: 25, description: 'Articulate tone, active ownership, and mature interpersonal dynamic' },
    { dimension: 'Self-Reflection & Growth', weight: 15, description: 'Constructive takeaways from past mistakes, feedback, or hurdles' },
  ],
  RESUME: [
    { dimension: 'Technical Depth on Projects', weight: 35, description: 'Granular mastery of tech stack, architectural layers, and data flow' },
    { dimension: 'Personal Contribution & Ownership', weight: 30, description: 'Distinguishing individual deliverable from general group collaboration' },
    { dimension: 'Decision Rationale & Alternatives', weight: 20, description: 'Defending architectural and framework choices over alternatives' },
    { dimension: 'Engineering Challenges & Solutions', weight: 15, description: 'Deep dive into resolved bottlenecks and production-like issues' },
  ],
};

export const MOCK_INTERVIEW_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'HR',
    title: 'HR & Cultural Fit',
    shortDesc: 'Foundational introduction, career alignment, ethical decisions, and work ethic.',
    badge: 'HR',
    iconName: 'UserCheck',
    defaultQuestions: 4,
    defaultDuration: 20,
    rubricTemplate: RUBRIC_TEMPLATES.BEHAVIORAL,
  },
  {
    id: 'BEHAVIORAL',
    title: 'Behavioral (STAR Method)',
    shortDesc: 'Structured Situation-Task-Action-Result responses for leadership, teamwork, and failure.',
    badge: 'STAR',
    iconName: 'Sparkles',
    defaultQuestions: 4,
    defaultDuration: 25,
    rubricTemplate: RUBRIC_TEMPLATES.BEHAVIORAL,
  },
  {
    id: 'TECHNICAL',
    title: 'Technical CS Fundamentals',
    shortDesc: 'Deep dive into Operating Systems, DBMS, Computer Networks, and Object-Oriented Design.',
    badge: 'Core CS',
    iconName: 'Cpu',
    defaultQuestions: 5,
    defaultDuration: 30,
    rubricTemplate: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'CODING',
    title: 'Coding Interview',
    shortDesc: 'Live coding problem solving with isolated compilation, execution, and test cases.',
    badge: 'Live Code',
    iconName: 'Code2',
    defaultQuestions: 3,
    defaultDuration: 45,
    rubricTemplate: RUBRIC_TEMPLATES.CODING,
  },
  {
    id: 'DSA',
    title: 'Data Structures & Algorithms',
    shortDesc: 'Algorithmic complexity, trees, graphs, dynamic programming, and optimization.',
    badge: 'Algorithms',
    iconName: 'Binary',
    defaultQuestions: 3,
    defaultDuration: 45,
    rubricTemplate: RUBRIC_TEMPLATES.CODING,
  },
  {
    id: 'SQL',
    title: 'SQL & Database Interview',
    shortDesc: 'Write live SQL queries executed against an isolated relational database sandbox.',
    badge: 'Database',
    iconName: 'Database',
    defaultQuestions: 4,
    defaultDuration: 30,
    rubricTemplate: RUBRIC_TEMPLATES.SQL,
  },
  {
    id: 'SYSTEM_DESIGN',
    title: 'System Design Interview',
    shortDesc: 'Architect large-scale distributed systems, APIs, database schemas, and load balancers.',
    badge: 'Distributed',
    iconName: 'Layers',
    defaultQuestions: 3,
    defaultDuration: 45,
    rubricTemplate: RUBRIC_TEMPLATES.SYSTEM_DESIGN,
  },
  {
    id: 'AI_ML',
    title: 'AI & Machine Learning',
    shortDesc: 'Supervised/unsupervised models, transformers, deep learning, and ML system design.',
    badge: 'AI / ML',
    iconName: 'Brain',
    defaultQuestions: 4,
    defaultDuration: 30,
    rubricTemplate: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'RESUME',
    title: 'Resume-Based Interview',
    shortDesc: 'Questions grounded strictly in your built projects, technologies, and achievements.',
    badge: 'Grounded',
    iconName: 'FileUser',
    defaultQuestions: 4,
    defaultDuration: 30,
    rubricTemplate: RUBRIC_TEMPLATES.RESUME,
  },
  {
    id: 'INTERNSHIP',
    title: 'Internship Candidate Round',
    shortDesc: 'Targeted screening for college undergraduates seeking pre-placement offers & internships.',
    badge: 'Internship',
    iconName: 'GraduationCap',
    defaultQuestions: 4,
    defaultDuration: 25,
    rubricTemplate: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'GRADUATE_JOB',
    title: 'Graduate / Entry-Level Job',
    shortDesc: 'Comprehensive recruitment simulation for fresh engineering graduates.',
    badge: 'Fresher',
    iconName: 'Briefcase',
    defaultQuestions: 5,
    defaultDuration: 35,
    rubricTemplate: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'CUSTOM',
    title: 'Custom Interview Track',
    shortDesc: 'Tailor your own questions, company target, custom role, and focus areas.',
    badge: 'Custom',
    iconName: 'Sliders',
    defaultQuestions: 4,
    defaultDuration: 30,
    rubricTemplate: RUBRIC_TEMPLATES.TECHNICAL,
  },
];

export const TARGET_ROLES_METADATA: TargetRoleMetadata[] = [
  {
    id: 'SDE',
    title: 'Software Development Engineer',
    department: 'Engineering',
    keySkills: ['Data Structures', 'Algorithms', 'System Design', 'Java / Python / C++', 'Databases'],
    suggestedCategories: ['CODING', 'DSA', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL'],
  },
  {
    id: 'JAVA_DEV',
    title: 'Java Backend Developer',
    department: 'Backend Engineering',
    keySkills: ['Java Core', 'Spring Boot', 'Hibernate', 'PostgreSQL', 'Microservices', 'REST APIs'],
    suggestedCategories: ['TECHNICAL', 'CODING', 'SQL', 'SYSTEM_DESIGN'],
  },
  {
    id: 'PYTHON_DEV',
    title: 'Python Developer',
    department: 'Software Engineering',
    keySkills: ['Python', 'FastAPI / Django', 'AsyncIO', 'PostgreSQL', 'Docker', 'Testing'],
    suggestedCategories: ['TECHNICAL', 'CODING', 'SQL', 'AI_ML'],
  },
  {
    id: 'FRONTEND_DEV',
    title: 'Frontend Developer',
    department: 'Web Engineering',
    keySkills: ['React', 'TypeScript', 'Next.js', 'CSS / Tailwind', 'Browser Performance', 'State Management'],
    suggestedCategories: ['TECHNICAL', 'CODING', 'SYSTEM_DESIGN', 'RESUME'],
  },
  {
    id: 'BACKEND_DEV',
    title: 'Backend Engineer',
    department: 'Platform Engineering',
    keySkills: ['Node.js / Go / Java', 'Distributed Systems', 'Redis', 'PostgreSQL', 'Kafka', 'Docker'],
    suggestedCategories: ['TECHNICAL', 'CODING', 'SQL', 'SYSTEM_DESIGN'],
  },
  {
    id: 'FULLSTACK_DEV',
    title: 'Full-Stack Developer',
    department: 'Product Engineering',
    keySkills: ['React', 'Node.js', 'TypeScript', 'SQL', 'REST / GraphQL', 'Cloud Deployments'],
    suggestedCategories: ['TECHNICAL', 'CODING', 'SQL', 'RESUME'],
  },
  {
    id: 'DATA_ANALYST',
    title: 'Data Analyst',
    department: 'Analytics',
    keySkills: ['Advanced SQL', 'Python (Pandas, NumPy)', 'Data Visualization', 'Business Intelligence', 'Statistics'],
    suggestedCategories: ['SQL', 'TECHNICAL', 'BEHAVIORAL'],
  },
  {
    id: 'DATA_SCIENTIST',
    title: 'Data Scientist',
    department: 'Data & AI',
    keySkills: ['Probability & Statistics', 'Machine Learning', 'Python', 'Scikit-Learn', 'Feature Engineering'],
    suggestedCategories: ['AI_ML', 'SQL', 'CODING', 'TECHNICAL'],
  },
  {
    id: 'ML_ENGINEER',
    title: 'Machine Learning Engineer',
    department: 'AI Systems',
    keySkills: ['PyTorch / TensorFlow', 'MLOps', 'Model Serving', 'Transformers', 'Model Optimization', 'Python'],
    suggestedCategories: ['AI_ML', 'SYSTEM_DESIGN', 'CODING', 'TECHNICAL'],
  },
  {
    id: 'AI_ENGINEER',
    title: 'AI / GenAI Engineer',
    department: 'Applied AI',
    keySkills: ['LLM Orchestration', 'RAG Systems', 'Vector Databases', 'Prompt Engineering', 'LangChain / LlamaIndex'],
    suggestedCategories: ['AI_ML', 'SYSTEM_DESIGN', 'TECHNICAL', 'RESUME'],
  },
  {
    id: 'QA_ENGINEER',
    title: 'QA / Test Automation Engineer',
    department: 'Quality Assurance',
    keySkills: ['Selenium / Playwright', 'Test Pyramids', 'API Testing', 'CI/CD Pipelines', 'Python / Java'],
    suggestedCategories: ['TECHNICAL', 'CODING', 'BEHAVIORAL'],
  },
  {
    id: 'CLOUD_ENGINEER',
    title: 'Cloud & DevOps Engineer',
    department: 'Infrastructure',
    keySkills: ['AWS / GCP / Azure', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux Internals', 'Networking'],
    suggestedCategories: ['TECHNICAL', 'SYSTEM_DESIGN', 'RESUME'],
  },
];

export const MOCK_INTERVIEW_QUESTION_CATALOG: MockInterviewQuestionCatalogItem[] = [
  // ==========================================
  // 1. TECHNICAL CS FUNDAMENTALS
  // ==========================================
  {
    id: 'cat_q_tech_01',
    category: 'TECHNICAL',
    topic: 'DBMS Transactions',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'BACKEND_DEV', 'FULLSTACK_DEV', 'JAVA_DEV'],
    question: 'Explain the four ACID properties in relational database systems, and detail how transaction isolation levels mitigate dirty reads, non-repeatable reads, and phantom reads.',
    context: 'A payment gateway executes simultaneous account debits and credits. Concurrency anomalies lead to severe financial inconsistencies.',
    question_type: 'CONCEPTUAL',
    expected_concepts: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Serializable'],
    hints: [
      'Relate Atomicity to undo logs / Write-Ahead Logging.',
      'Contrast Read Committed with Repeatable Read and Serializable levels.',
      'Explain how snapshot isolation or MVCC prevents lock contention.',
    ],
    reference_answer: 'ACID ensures reliable transaction processing: Atomicity (all-or-nothing completion via WAL/undo logs), Consistency (adherence to declared database constraints), Isolation (concurrent execution yields state equivalent to serial execution), and Durability (committed changes persist despite hardware failure). Four ANSI SQL isolation levels govern read anomalies: Read Uncommitted permits dirty reads; Read Committed prevents dirty reads using short-term read locks or MVCC snapshots; Repeatable Read prevents non-repeatable reads by retaining row snapshots throughout transaction lifetime; and Serializable prevents phantom reads using predicate locks, range locks, or SSI.',
    follow_up_patterns: [
      'How does Multi-Version Concurrency Control (MVCC) eliminate read-write blocking in modern databases like PostgreSQL?',
      'What are write skew anomalies, and why can Repeatable Read fail to prevent them?',
    ],
    rubric: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'cat_q_tech_02',
    category: 'TECHNICAL',
    topic: 'Operating Systems Deadlocks',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'BACKEND_DEV', 'CLOUD_ENGINEER', 'JAVA_DEV'],
    question: 'State the four Coffman conditions necessary for a system deadlock to occur. How can an operating system prevent or recover from deadlocks?',
    context: 'Two threads contend for mutex lock A and mutex lock B in opposite acquisition sequences.',
    question_type: 'CONCEPTUAL',
    expected_concepts: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Resource Allocation Graph', 'Banker Algorithm', 'Lock Ordering'],
    hints: [
      'Name all 4 conditions clearly: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
      'Discuss how strict global lock hierarchy breaks circular wait.',
    ],
    reference_answer: 'The four Coffman conditions are: (1) Mutual Exclusion (at least one unshareable resource), (2) Hold and Wait (process holds resource while requesting others), (3) No Preemption (resources cannot be forcibly reclaimed), and (4) Circular Wait (closed loop of processes waiting on predecessor). Prevention requires invalidating at least one condition: enforcing global resource hierarchy eliminates Circular Wait; requiring upfront all-at-once allocation eliminates Hold and Wait; and timeout-based preemption breaks No Preemption. Avoidance uses Dijkstra\'s Banker\'s Algorithm to ensure only safe transitions.',
    follow_up_patterns: [
      'How does a resource allocation graph cycle indicate deadlock with single vs multiple resource instances?',
      'Describe the difference between deadlock detection with kill-recovery vs proactive deadlock avoidance.',
    ],
    rubric: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'cat_q_tech_03',
    category: 'TECHNICAL',
    topic: 'Computer Networks (TCP/IP)',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'BACKEND_DEV', 'FULLSTACK_DEV', 'CLOUD_ENGINEER'],
    question: 'Walk through the TCP 3-way handshake and 4-way connection teardown. Why does the initiating client remain in the TIME_WAIT state for 2 MSL?',
    context: 'A microservice under high traffic experiences thousands of sockets trapped in TIME_WAIT, causing port exhaustion.',
    question_type: 'CONCEPTUAL',
    expected_concepts: ['SYN', 'SYN-ACK', 'ACK', 'Sequence Numbers', 'FIN', 'TIME_WAIT', '2 MSL', 'Delayed Segment Absorption', 'Socket Exhaustion'],
    hints: [
      'Explain SYN -> SYN-ACK -> ACK exchange with sequence and acknowledgment numbers.',
      'Recall what MSL stands for (Maximum Segment Lifetime, typically 2 minutes).',
    ],
    reference_answer: 'TCP handshake establishes full-duplex byte streams: Client sends SYN with random Initial Sequence Number (ISN_c); Server responds with SYN-ACK acknowledging ISN_c+1 with its own ISN_s; Client confirms with ACK (ISN_s+1). Teardown uses 4 steps: Initiator sends FIN; Receiver responds with ACK (half-close); Receiver finishes pending writes then sends FIN; Initiator acknowledges with final ACK. The initiator enters TIME_WAIT for 2 MSL (Maximum Segment Lifetime) to: (1) Ensure the final ACK is received (retransmitting if lost), and (2) Allow stale, wandering packets from the old connection to dissipate before port reuse.',
    follow_up_patterns: [
      'What sysctl parameters (such as tcp_tw_reuse or SO_REUSEADDR) mitigate port exhaustion in high-throughput proxies?',
      'How does TCP Slow Start and Congestion Avoidance adjust the congestion window cwnd?',
    ],
    rubric: RUBRIC_TEMPLATES.TECHNICAL,
  },
  {
    id: 'cat_q_tech_04',
    category: 'TECHNICAL',
    topic: 'Object-Oriented Design',
    difficulty: 'BEGINNER',
    target_roles: ['SDE', 'JAVA_DEV', 'FRONTEND_DEV', 'FULLSTACK_DEV'],
    question: 'Explain the principle of "Favor Composition over Inheritance" in Object-Oriented Design. What is the Fragile Base Class problem?',
    context: 'Refactoring a monolithic user entity where permissions, roles, and notification preferences were initially structured through deep multi-level class inheritance.',
    question_type: 'CONCEPTUAL',
    expected_concepts: ['Composition', 'Inheritance', 'HAS-A vs IS-A', 'Fragile Base Class', 'Coupling', 'Encapsulation', 'Strategy Pattern'],
    hints: [
      'Contrast IS-A relationships with HAS-A relationships.',
      'Explain what happens to subclasses when a protected method in the parent class changes.',
    ],
    reference_answer: 'Inheritance represents an "IS-A" relationship creating tight compile-time coupling between subclass and superclass. Composition represents a "HAS-A" relationship, assembling flexible behaviors via interface delegates at runtime. The Fragile Base Class problem occurs when innocent modifications to superclass internal implementations unexpectedly break the behavior or invariants of derived subclasses without compiler warnings. Composition preserves encapsulation, supports dynamic runtime behavior swapping (e.g., Strategy Pattern), and avoids combinatorial class explosion.',
    follow_up_patterns: [
      'Can you give a practical example where inheritance is still the superior choice over composition?',
      'How does the Liskov Substitution Principle (LSP) guide safe subtyping?',
    ],
    rubric: RUBRIC_TEMPLATES.TECHNICAL,
  },

  // ==========================================
  // 2. CODING & ALGORITHMIC ROUND
  // ==========================================
  {
    id: 'cat_q_code_01',
    category: 'CODING',
    topic: 'Arrays & Two Pointers',
    difficulty: 'BEGINNER',
    target_roles: ['SDE', 'PYTHON_DEV', 'JAVA_DEV', 'FULLSTACK_DEV'],
    question: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice. What is your time and space complexity?',
    context: 'Sample: nums = [2, 7, 11, 15], target = 9 -> Output: [0, 1]',
    question_type: 'CODING',
    expected_concepts: ['Hash Map Lookup', 'O(N) Time Complexity', 'O(N) Space Complexity', 'One-pass Complement Search'],
    hints: [
      'A brute force nested loop takes O(N^2). Can you remember complements in a dictionary / hash map in O(N)?',
      'Store each number index in a hash map as you iterate through the list.',
    ],
    starter_language: 'python',
    starter_code: `def two_sum(nums, target):
    # Implement optimal O(N) solution using a hash map
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test execution
print(two_sum([2, 7, 11, 15], 9))
`,
    sample_inputs: 'nums = [2, 7, 11, 15], target = 9',
    reference_answer: 'Optimal approach uses a single-pass hash map storing `seen[num] = index`. For each element, calculate `complement = target - num`. If present in map, return `[seen[complement], current_index]`. Time complexity is O(N) since dictionary lookup is O(1) on average. Space complexity is O(N) to store up to N elements.',
    follow_up_patterns: [
      'If the input array was guaranteed to be sorted in ascending order, how would you solve it in O(1) auxiliary space?',
      'How would you handle duplicate numbers if all unique pairs summing to target had to be returned?',
    ],
    rubric: RUBRIC_TEMPLATES.CODING,
  },
  {
    id: 'cat_q_code_02',
    category: 'CODING',
    topic: 'Linked Lists & Cache Design',
    difficulty: 'ADVANCED',
    target_roles: ['SDE', 'BACKEND_DEV', 'JAVA_DEV', 'PYTHON_DEV'],
    question: 'Design an LRU (Least Recently Used) Cache supporting get(key) and put(key, value) in O(1) average time complexity. Walk me through the required data structures and how eviction is handled when capacity is exceeded.',
    context: 'A fast in-memory caching tier must evict the least recently accessed item when capacity reaches limit.',
    question_type: 'CODING',
    expected_concepts: ['Doubly Linked List', 'Hash Map', 'O(1) Get', 'O(1) Put', 'Dummy Head and Tail', 'Eviction Policy'],
    hints: [
      'A hash map alone cannot maintain temporal access order in O(1).',
      'Combine a hash map with a doubly linked list. The map points keys to list nodes.',
      'Using dummy head and dummy tail nodes eliminates boundary edge cases when inserting or deleting.',
    ],
    starter_language: 'python',
    starter_code: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_front(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add_to_front(node)
        self.cache[key] = node
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]

lru = LRUCache(2)
lru.put(1, 1)
lru.put(2, 2)
print("get(1):", lru.get(1))
lru.put(3, 3) # evicts key 2
print("get(2):", lru.get(2))
`,
    sample_inputs: 'capacity = 2, put(1,1), put(2,2), get(1), put(3,3), get(2)',
    reference_answer: 'An LRU Cache combines a Hash Map and a Doubly Linked List. The hash map maps keys to doubly linked list nodes for O(1) lookup. The doubly linked list maintains temporal order, where the most recently accessed node is placed right after head, and the least recently used node rests before tail. Both get() and put() run in O(1) time complexity. Space complexity is O(capacity).',
    follow_up_patterns: [
      'How would you make this LRU Cache thread-safe in a multi-threaded web server?',
      'How does an LFU (Least Frequently Used) cache differ in complexity and implementation?',
    ],
    rubric: RUBRIC_TEMPLATES.CODING,
  },

  // ==========================================
  // 3. SQL & DATABASE INTERVIEWS
  // ==========================================
  {
    id: 'cat_q_sql_01',
    category: 'SQL',
    topic: 'Window Functions & Grouping',
    difficulty: 'INTERMEDIATE',
    target_roles: ['DATA_ANALYST', 'BACKEND_DEV', 'FULLSTACK_DEV', 'DATA_SCIENTIST'],
    question: 'Write a SQL query against the `departments` table in `university_db` to find all departments whose budget is greater than the average budget across all academic departments. Order the results by budget in descending order.',
    context: 'Database Schema: departments (dept_id VARCHAR, dept_name VARCHAR, building VARCHAR, budget DECIMAL)',
    question_type: 'SQL',
    sql_schema_table: 'departments',
    expected_concepts: ['Subquery', 'AVG() Aggregation', 'WHERE Clause Filter', 'ORDER BY DESC', 'Relational Filtering'],
    hints: [
      'Use a subquery in the WHERE clause: WHERE budget > (SELECT AVG(budget) FROM departments).',
      'Do not hardcode numbers.',
    ],
    starter_language: 'sql',
    starter_code: `SELECT dept_id, dept_name, budget
FROM departments
WHERE budget > (SELECT AVG(budget) FROM departments)
ORDER BY budget DESC;
`,
    reference_answer: `SELECT dept_id, dept_name, building, budget
FROM departments
WHERE budget > (SELECT AVG(budget) FROM departments)
ORDER BY budget DESC;`,
    follow_up_patterns: [
      'How would you rewrite this query using a Common Table Expression (WITH clause) or Window Function AVG() OVER()?',
      'If the departments table had 10 million rows, how would you optimize this query?',
    ],
    rubric: RUBRIC_TEMPLATES.SQL,
  },
  {
    id: 'cat_q_sql_02',
    category: 'SQL',
    topic: 'Relational Joins & Foreign Keys',
    difficulty: 'INTERMEDIATE',
    target_roles: ['BACKEND_DEV', 'DATA_ANALYST', 'FULLSTACK_DEV'],
    question: 'Explain the mechanical differences between an INNER JOIN, LEFT OUTER JOIN, and FULL OUTER JOIN. What occurs when joining on a non-indexed column versus an indexed primary/foreign key?',
    context: 'Querying order records against customers with missing customer foreign key references.',
    question_type: 'SQL',
    expected_concepts: ['Inner Join', 'Left Join Null Padding', 'Full Outer Join', 'Hash Join', 'Nested Loop Join', 'Index Scan vs Seq Scan'],
    hints: [
      'Explain what happens to unmatched rows on the left vs right side.',
      'Discuss database join algorithms: Nested Loop Join, Hash Join, Merge Join.',
    ],
    reference_answer: 'INNER JOIN returns only matching tuples where the join predicate evaluates to true. LEFT OUTER JOIN retains all tuples from the left relation, padding columns from the right relation with NULL when no predicate match exists. FULL OUTER JOIN retains all tuples from both relations with NULL padding. When joining on an indexed column, the database optimizer can perform index seeks or Merge Joins with O(N log M) complexity; without an index, the engine falls back to expensive Hash Joins or O(N*M) nested sequential scans.',
    follow_up_patterns: [
      'Why is a LEFT JOIN with a WHERE right_table.id IS NULL idiom useful for anti-join detection?',
      'Explain why joining on a function-wrapped column like DATE(created_at) disables standard B-Tree index scans.',
    ],
    rubric: RUBRIC_TEMPLATES.SQL,
  },

  // ==========================================
  // 4. SYSTEM DESIGN INTERVIEWS
  // ==========================================
  {
    id: 'cat_q_sys_01',
    category: 'SYSTEM_DESIGN',
    topic: 'URL Shortener (TinyURL)',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'BACKEND_DEV', 'FULLSTACK_DEV', 'CLOUD_ENGINEER'],
    question: 'Design a scalable URL shortening service (like TinyURL or Bitly). Address requirements, capacity estimation, API contracts, unique hash/Base62 generation, database schema, and caching architecture.',
    context: 'Traffic: 100M new URLs created per month, 10:1 read-to-write ratio, 5-year data retention.',
    question_type: 'SYSTEM_DESIGN',
    expected_concepts: ['Base62 Encoding', 'Distributed ID Generator', 'Redis Caching', 'Read-to-Write Ratio', '301 vs 302 Redirect', 'Database Sharding'],
    hints: [
      'Calculate Storage: 100M * 12 * 5 = 6 Billion URLs. Base62 with 7 characters gives 62^7 = 3.5 Trillion unique IDs.',
      'Discuss why 301 Moved Permanently reduces server load through browser caching, while 302 Found allows accurate click analytics.',
      'Use Redis as an LRU cache in front of a NoSQL/RDBMS to serve the 80/20 read traffic hot spots.',
    ],
    reference_answer: 'System Design Blueprint: (1) Requirements: High availability, low read latency (<20ms), 6B URLs over 5 years. (2) Capacity: 100M writes/month = ~40 writes/sec, 400 reads/sec. Storage: 6B * 500 bytes = 3TB total storage. (3) ID Generation: Use a 64-bit distributed snowflake ID generator converted to Base62 (7 characters = 3.5T keys). (4) Database Schema: url_mapping (id BIGINT PK, short_code VARCHAR(7) UNIQUE, long_url TEXT, created_at, user_id). (5) Architecture: Load Balancer -> App Servers -> Redis Cache (caching 20% hot URLs) -> Read Replicas / Cassandra or PostgreSQL partition by hash(short_code). (6) Redirection: HTTP 302 for tracking analytics or 301 for browser caching.',
    follow_up_patterns: [
      'What happens if two users submit the exact same long URL? Should they get the same short code?',
      'How would you handle URL expiration and automated cleanup without impacting active read latency?',
    ],
    rubric: RUBRIC_TEMPLATES.SYSTEM_DESIGN,
  },
  {
    id: 'cat_q_sys_02',
    category: 'SYSTEM_DESIGN',
    topic: 'Rate Limiter',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'BACKEND_DEV', 'CLOUD_ENGINEER'],
    question: 'Design an API Rate Limiter to protect downstream microservices from denial-of-service and brute force attacks. Compare Token Bucket, Leaky Bucket, and Sliding Window algorithms.',
    context: 'System requirement: Allow maximum 100 requests per minute per IP or API key across a distributed cluster.',
    question_type: 'SYSTEM_DESIGN',
    expected_concepts: ['Token Bucket', 'Leaky Bucket', 'Sliding Window Log', 'Sliding Window Counter', 'Redis INCR / EXPIRE', 'HTTP 429 Too Many Requests', 'Race Conditions'],
    hints: [
      'Explain how Token Bucket permits bursts up to capacity, while Leaky Bucket smooths traffic to a fixed rate.',
      'Show how Redis atomic commands or Lua scripts prevent race conditions during concurrent requests.',
    ],
    reference_answer: 'Architectural Blueprint: (1) Placement: API Gateway middleware before reaching application workers. (2) Algorithm Comparison: Token Bucket (tokens added at fixed rate; accommodates bursts; memory efficient), Leaky Bucket (FIFO queue outputting at constant rate; smooths bursts), Sliding Window Counter (hybrid memory-efficient window tracking avoiding window-boundary traffic spikes). (3) Implementation: Redis sorted sets or Redis Hash with Lua scripts executing atomic increments and TTL expiration. (4) Response Headers: Return HTTP 429 Too Many Requests with headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After`.',
    follow_up_patterns: [
      'How do you avoid the classic race condition in Redis when multiple concurrent requests read and write token counts simultaneously?',
      'How would you rate limit across multiple global geographical regions without introducing cross-region WAN latency on every API call?',
    ],
    rubric: RUBRIC_TEMPLATES.SYSTEM_DESIGN,
  },

  // ==========================================
  // 5. HR & BEHAVIORAL INTERVIEWS (STAR)
  // ==========================================
  {
    id: 'cat_q_hr_01',
    category: 'HR',
    topic: 'Self Introduction & Fit',
    difficulty: 'BEGINNER',
    target_roles: ['SDE', 'FULLSTACK_DEV', 'DATA_ANALYST', 'QA_ENGINEER'],
    question: 'Tell me about yourself, your academic engineering background, and why you are interested in this specific software engineering role.',
    context: 'Opening greeting and initial rapport building in standard campus placement drive.',
    question_type: 'BEHAVIORAL',
    expected_concepts: ['Educational Background', 'Core Engineering Passion', 'Key Technical Projects', 'Relevant Skills', 'Career Goals', 'Why This Role'],
    hints: [
      'Keep it structured: Past (degree/specialization), Present (recent projects/internships), Future (why this role matches your ambitions).',
      'Aim for a concise 90 to 120-second delivery.',
    ],
    reference_answer: 'Effective structure: "I am a final-year B.Tech Computer Science student with a strong foundation in data structures, algorithms, and full-stack systems engineering. During my coursework, I focused on backend architecture and distributed databases, building projects like an automated learning platform with real-time code execution and an ATS resume parser. I enjoy solving algorithmic problems on platforms like LeetCode and collaborating in team agile sprints. I am excited about this role because your engineering team solves high-scale throughput challenges where I can contribute my backend skills while learning production-grade reliability."',
    follow_up_patterns: [
      'Where do you envision yourself professionally in 3 to 5 years?',
      'What is one technical area outside your syllabus that you recently explored independently?',
    ],
    rubric: RUBRIC_TEMPLATES.BEHAVIORAL,
  },
  {
    id: 'cat_q_hr_02',
    category: 'BEHAVIORAL',
    topic: 'Conflict Resolution (STAR)',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'FULLSTACK_DEV', 'BACKEND_DEV', 'DATA_SCIENTIST'],
    question: 'Describe a situation where you had a strong technical disagreement with a team member during a project. How did you resolve it using the STAR (Situation, Task, Action, Result) method?',
    context: 'Evaluating emotional intelligence, active listening, objectivity, and consensus building.',
    question_type: 'STAR',
    expected_concepts: ['Situation', 'Task', 'Action', 'Result', 'Active Listening', 'Data-Driven Decision', 'Consensus', 'Professionalism'],
    hints: [
      'Situation: Set the scene (e.g. capstone project, hackathon).',
      'Task: The technical dilemma (e.g. SQL vs MongoDB, monolithic vs microservice).',
      'Action: How you listened, benchmarked data, or conducted a spike.',
      'Result: The positive outcome, team cohesion, and project success.',
    ],
    reference_answer: 'STAR Response Structure: Situation: During our semester capstone project, our 4-person team had to choose between a relational PostgreSQL database and a NoSQL MongoDB document store. Task: As backend lead, I had to ensure our database choice satisfied ACID transactional requirements for student grades without alienating a teammate who favored MongoDB for rapid prototyping. Action: Rather than arguing subjectively, I organized a 1-day proof-of-concept spike. We defined 3 objective criteria: schema flexibility, foreign-key relational integrity, and multi-table join performance. We benchmarked sample queries together. Result: The data demonstrated that relational foreign keys eliminated duplicate enrollment validation by 100%. My teammate agreed based on concrete benchmarks, and we delivered the project on time with an A grade.',
    follow_up_patterns: [
      'What would you have done if your teammate still insisted on their approach despite the data?',
      'Tell me about a time when you realized your own technical recommendation was wrong.',
    ],
    rubric: RUBRIC_TEMPLATES.BEHAVIORAL,
  },
  {
    id: 'cat_q_hr_03',
    category: 'BEHAVIORAL',
    topic: 'Handling Failure & Deadlines (STAR)',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'FRONTEND_DEV', 'BACKEND_DEV', 'QA_ENGINEER'],
    question: 'Tell me about a time you encountered a severe bug, missed a project deadline, or faced failure. What steps did you take to manage the situation and what did you learn?',
    context: 'Evaluating accountability, resilience, root cause analysis, and post-mortem mindset.',
    question_type: 'STAR',
    expected_concepts: ['Situation', 'Task', 'Action', 'Result', 'Accountability', 'Root Cause Analysis', 'Post-Mortem', 'Mitigation', 'Communication'],
    hints: [
      'Do not claim you have never failed. Focus on genuine hurdles and constructive mitigation.',
      'Highlight proactive communication with stakeholders before catastrophe hit.',
    ],
    reference_answer: 'STAR Framework: Situation: 48 hours before submitting our multi-tenant web application, our payment verification webhook began throwing sporadic 500 errors under mock concurrency tests. Task: I was responsible for diagnosing the failure and ensuring our team met the university project submission deadline without compromising security. Action: I immediately conducted a root cause analysis using structured logs and discovered a database connection pool starvation bug where connections weren\'t released in the error handler block. I proactively notified our professor about the risk, isolated the connection leak with a try-finally block, expanded our pool configuration, and wrote automated stress tests. Result: We verified zero errors over 1,000 simulated transactions and submitted 4 hours ahead of deadline, receiving top evaluation for our transparent incident post-mortem.',
    follow_up_patterns: [
      'How did that experience change how you write production error handling code today?',
      'How do you manage stress and prioritize tasks when multiple deadlines collide?',
    ],
    rubric: RUBRIC_TEMPLATES.BEHAVIORAL,
  },

  // ==========================================
  // 6. RESUME-BASED INTERVIEWS
  // ==========================================
  {
    id: 'cat_q_res_01',
    category: 'RESUME',
    topic: 'Project Architecture & Decisions',
    difficulty: 'INTERMEDIATE',
    target_roles: ['SDE', 'FULLSTACK_DEV', 'BACKEND_DEV'],
    question: 'Walk me through the architecture of your primary featured project. What motivated your choice of technology stack, and what was the single biggest engineering tradeoff you made?',
    context: 'Probing candidate depth on their own claims and built artifacts.',
    question_type: 'RESUME',
    expected_concepts: ['Architecture Layers', 'Client-Server / Microservice', 'Database Choice', 'State Management', 'Latency vs Complexity Tradeoff', 'Own Contribution'],
    hints: [
      'Explain the data flow from client UI down to database persistence.',
      'Explain what you personally designed and coded versus pre-built templates.',
    ],
    reference_answer: 'A strong candidate response explains: (1) The problem statement and targeted user persona. (2) Layered architecture: Presentation layer (React/Next.js), Application API layer (Express/FastAPI/Spring), and Persistence layer (PostgreSQL/Redis). (3) Explicit tradeoff: e.g. "We chose server-side caching with Redis over client-side IndexedDB to ensure consistency across multiple browser sessions, accepting the minor server memory cost." (4) Granular personal ownership: "I personally engineered the token-bucket rate limiter and optimized our SQL join execution."',
    follow_up_patterns: [
      'If you had 3 more months and a budget to refactor this project for 100,000 active users, what would you rewrite first?',
      'How did you test your project against edge cases, network disconnects, and malformed inputs?',
    ],
    rubric: RUBRIC_TEMPLATES.RESUME,
  },

  // ==========================================
  // 7. AI & MACHINE LEARNING INTERVIEWS
  // ==========================================
  {
    id: 'cat_q_aiml_01',
    category: 'AI_ML',
    topic: 'ML Foundations (Bias-Variance)',
    difficulty: 'INTERMEDIATE',
    target_roles: ['DATA_SCIENTIST', 'ML_ENGINEER', 'AI_ENGINEER'],
    question: 'Explain the Bias-Variance tradeoff in Machine Learning. How do regularization techniques like L1 (Lasso) and L2 (Ridge) prevent overfitting?',
    context: 'A model performs with 99% accuracy on training data but drops to 68% accuracy on unseen validation data.',
    question_type: 'CONCEPTUAL',
    expected_concepts: ['Bias', 'Variance', 'Overfitting', 'Underfitting', 'L1 Lasso Sparsity', 'L2 Ridge Shrinkage', 'Generalization Error', 'Hyperparameter Lambda'],
    hints: [
      'High Bias = Underfitting (model too simple). High Variance = Overfitting (model memorizes noise).',
      'Explain the geometric difference: L1 has diamond contour yielding sparse weights (feature selection); L2 has circular contour shrinking weights toward zero.',
    ],
    reference_answer: 'The Bias-Variance tradeoff decomposes expected generalization error into three components: Bias error (erroneous assumptions causing underfitting), Variance error (sensitivity to small fluctuations in training data causing overfitting), and Irreducible error (noise). As model complexity increases, bias decreases while variance increases. Regularization penalizes large weight magnitudes in the loss function: L1 (Lasso) adds the L1-norm lambda*sum(|w|), driving irrelevant weights strictly to zero for sparse feature selection; L2 (Ridge) adds lambda*sum(w^2), shrinking weights smoothly toward zero without zeroing them, preventing any single feature from dominating predictions.',
    follow_up_patterns: [
      'Why does cross-validation (e.g. 5-fold CV) provide a more dependable estimate of model variance than a single train-test split?',
      'How does the Attention mechanism in Transformers overcome the vanishing gradient problem inherent in traditional RNNs and LSTMs?',
    ],
    rubric: RUBRIC_TEMPLATES.TECHNICAL,
  },
];
