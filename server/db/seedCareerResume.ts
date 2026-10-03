/**
 * Phase 12 - Seed Data for Skills Bank, Career Roles & Initial Resume
 */

import {
  Skill,
  CareerRole,
  Resume,
  ResumeProfile,
  ResumeEducation,
  ResumeSkill,
  ResumeProject,
  ResumeExperience,
  ResumeCertification,
  ResumeAchievement,
  StudentSkill,
  SkillEvidence,
} from '../models/careerResumeTypes';

export const SEED_SKILLS: Skill[] = [
  // Programming
  { id: 'sk_py', name: 'Python', category: 'PROGRAMMING', description: 'General-purpose programming language for backend, data, and ML.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_ts', name: 'TypeScript', category: 'PROGRAMMING', description: 'Typed superset of JavaScript for large-scale web applications.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_js', name: 'JavaScript', category: 'PROGRAMMING', description: 'Core browser programming language and dynamic scripting.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_java', name: 'Java', category: 'PROGRAMMING', description: 'Object-oriented programming language for enterprise systems.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_cpp', name: 'C++', category: 'PROGRAMMING', description: 'High-performance systems programming and competitive programming.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_go', name: 'Go', category: 'PROGRAMMING', description: 'Concurrent systems language for microservices and cloud tooling.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },

  // Web
  { id: 'sk_react', name: 'React', category: 'WEB', description: 'Declarative component-based UI library.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_nodejs', name: 'Node.js', category: 'WEB', description: 'Event-driven asynchronous JavaScript runtime for backend services.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_express', name: 'Express', category: 'WEB', description: 'Fast, unopinionated, minimalist web framework for Node.js.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_fastapi', name: 'FastAPI', category: 'WEB', description: 'High-performance Python web framework for building APIs.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_tailwind', name: 'Tailwind CSS', category: 'WEB', description: 'Utility-first CSS framework for rapid UI development.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },

  // Database
  { id: 'sk_sql', name: 'SQL', category: 'DATABASE', description: 'Standard declarative query language for relational databases.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_postgres', name: 'PostgreSQL', category: 'DATABASE', description: 'Advanced open-source relational database with JSON & extension support.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_mongodb', name: 'MongoDB', category: 'DATABASE', description: 'Document-oriented NoSQL database for flexible JSON schemas.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_redis', name: 'Redis', category: 'DATABASE', description: 'In-memory data structure store used as a database, cache, and message broker.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },

  // AI & ML
  { id: 'sk_pytorch', name: 'PyTorch', category: 'AI_ML', description: 'Deep learning framework for tensor computation and neural networks.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_scikit', name: 'Scikit-Learn', category: 'AI_ML', description: 'Machine learning library in Python for classification and regression.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_rag', name: 'RAG Architecture', category: 'AI_ML', description: 'Retrieval-Augmented Generation using embeddings and vector search.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_nlp', name: 'NLP & Transformers', category: 'AI_ML', description: 'Natural Language Processing and transformer attention mechanisms.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },

  // Software Engineering & Fundamentals
  { id: 'sk_dsa', name: 'Data Structures & Algorithms', category: 'SOFTWARE_ENGINEERING', description: 'Arrays, trees, graphs, sorting, searching, and complexity analysis.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_sysdesign', name: 'System Design', category: 'SOFTWARE_ENGINEERING', description: 'Scalable distributed systems, caching, load balancing, and sharding.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_oop', name: 'OOP Principles', category: 'SOFTWARE_ENGINEERING', description: 'Encapsulation, inheritance, polymorphism, and abstraction.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },

  // Cloud & DevOps
  { id: 'sk_docker', name: 'Docker', category: 'DEVOPS', description: 'Containerization platform for isolated application environments.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_git', name: 'Git & Version Control', category: 'DEVOPS', description: 'Distributed version control and collaborative branching workflows.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_aws', name: 'Cloud Computing (AWS/GCP)', category: 'CLOUD', description: 'Cloud infrastructure, compute instances, blob storage, and serverless functions.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_cicd', name: 'CI/CD Pipelines', category: 'DEVOPS', description: 'Automated testing, linting, building, and deployment workflows.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },

  // Communication & Aptitude
  { id: 'sk_techwriting', name: 'Technical Writing', category: 'COMMUNICATION', description: 'Clear documentation, architectural decision records, and API specs.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'sk_quant', name: 'Quantitative Aptitude', category: 'APTITUDE', description: 'Percentages, ratios, time-speed-distance, and algebraic problem solving.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
];

export const SEED_CAREER_ROLES: CareerRole[] = [
  {
    id: 'role_sde',
    name: 'Software Development Engineer (SDE)',
    slug: 'software-development-engineer',
    description: 'Generalist engineering role focusing on algorithmic problem solving, clean code, data structures, and core CS fundamentals.',
    industry: 'Technology / Enterprise Software',
    skills: ['Data Structures & Algorithms', 'System Architecture', 'OOP Principles', 'DBMS & SQL', 'Operating Systems'],
    technical_topics: ['Arrays, Trees, Dynamic Programming', 'Database Normalization', 'Concurrency & Threads', 'REST APIs'],
    recommended_courses: ['crs_01j8k9m3q1', 'crs_01j8k9m3q2'], // DSA, OS
    recommended_projects: ['prj_seed_01', 'prj_seed_02'],
    recommended_tools: ['Git', 'VS Code', 'GDB / Debugger', 'Docker'],
    interview_topics: ['Time and Space Complexity Analysis', 'Graph Traversals (BFS/DFS)', 'Dynamic Programming Subproblems', 'Multithreading and Synchronization'],
    coding_topics: ['Binary Search', 'Sliding Window', 'Two Pointers', 'Tree Traversals', 'Graph Shortest Path'],
    typical_learning_path: [
      'Master language syntax and OOP paradigms (Java/C++/Python)',
      'Learn core linear and non-linear data structures',
      'Solve 100+ algorithmic challenge problems',
      'Understand Operating System processes, memory management, and threads',
      'Build end-to-end multi-tier applications'
    ],
    source_metadata: {
      source_name: 'Industry Engineering Curriculum Standards 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_backend',
    name: 'Backend Developer',
    slug: 'backend-developer',
    description: 'Server-side engineering role focused on high-throughput microservices, API architecture, relational and NoSQL storage, and caching.',
    industry: 'Cloud & SaaS Platforms',
    skills: ['Node.js / Python / Java / Go', 'PostgreSQL / MongoDB', 'Redis & Message Queues', 'REST & GraphQL', 'Docker & CI/CD'],
    technical_topics: ['ACID & Transactions', 'Index Optimization', 'Connection Pooling', 'JWT & OAuth2 Security', 'Microservice Patterns'],
    recommended_courses: ['crs_01j8k9m3q1', 'crs_01j8k9m3q3'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Postman', 'Docker', 'PostgreSQL', 'Redis', 'GitHub Actions'],
    interview_topics: ['REST vs GraphQL tradeoffs', 'SQL indexing (B-Tree vs Hash)', 'Distributed locking with Redis', 'Database isolation levels'],
    coding_topics: ['Rate Limiting Algorithms', 'LRU Cache implementation', 'Trie for autocomplete', 'String parsing & serialization'],
    typical_learning_path: [
      'Backend runtime fundamentals (Node.js/Python FastAPI)',
      'Relational database design, migrations, and ACID queries',
      'Authentication, authorization, and API security (JWT, CORS, hashing)',
      'Caching layers and asynchronous background queues',
      'Containerization and deployment architecture'
    ],
    source_metadata: {
      source_name: 'Modern Web Architecture Working Group',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_frontend',
    name: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Client-side specialist engineering responsive web applications, state management, web performance, and accessible design systems.',
    industry: 'Consumer Tech & Digital Products',
    skills: ['React / TypeScript', 'CSS & Tailwind', 'State Management (Zustand / Redux)', 'Browser Internals & DOM', 'Web Performance'],
    technical_topics: ['Virtual DOM Reconciliation', 'Bundle Splitting & Lazy Loading', 'Accessibility (ARIA)', 'CSS Grid & Flexbox'],
    recommended_courses: ['crs_01j8k9m3q1'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Chrome DevTools', 'Vite', 'Figma', 'React Developer Tools'],
    interview_topics: ['React Component Lifecycle & Hooks', 'Browser Critical Rendering Path', 'Optimizing Core Web Vitals', 'Accessible Form Controls'],
    coding_topics: ['Debounce and Throttle utilities', 'DOM manipulation without frameworks', 'Deep object cloning', 'Virtual list implementation'],
    typical_learning_path: [
      'Modern semantic HTML5, CSS3 layout engines, and responsive media queries',
      'TypeScript typing and modern ES6+ paradigms',
      'React component composition, state management, and custom hooks',
      'Client-side routing, optimistic caching, and data synchronization',
      'Web performance profiling and WCAG accessibility standards'
    ],
    source_metadata: {
      source_name: 'Frontend Engineering Standards 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_fullstack',
    name: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'End-to-end web engineer bridging modern frontend components, high-performance APIs, relational databases, and cloud deployments.',
    industry: 'Software & Startups',
    skills: ['TypeScript / React', 'Node.js / Express / Next.js', 'PostgreSQL / Prisma', 'REST / GraphQL APIs', 'Docker / CI/CD'],
    technical_topics: ['Full-stack Authentication & JWT', 'Server-Side Rendering (SSR)', 'Database Migrations & Concurrency', 'State Management'],
    recommended_courses: ['crs_01j8k9m3q1', 'crs_01j8k9m3q3'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['VS Code', 'Docker', 'Postman', 'Vite', 'PostgreSQL'],
    interview_topics: ['End-to-end request flow', 'State synchronization between client and server', 'Authentication flow with refresh tokens', 'Monorepo vs polyrepo design'],
    coding_topics: ['API route handlers', 'Pagination logic', 'Search and filter pipelines', 'Form validation schema parsing'],
    typical_learning_path: [
      'Build solid frontend UI with React and TypeScript',
      'Implement robust backend endpoints with Node.js or Python',
      'Model relational databases and implement migrations',
      'Connect frontend and backend with secure JWT authentication',
      'Deploy full-stack applications with Docker and CI/CD pipelines'
    ],
    source_metadata: {
      source_name: 'Full Stack Development Guide 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_aiml',
    name: 'AI / Machine Learning Engineer',
    slug: 'ai-ml-engineer',
    description: 'Focuses on training, fine-tuning, and deploying machine learning pipelines, LLM systems, RAG architectures, and evaluation metrics.',
    industry: 'Artificial Intelligence & Data',
    skills: ['Python & PyTorch', 'Data Preprocessing & Feature Engineering', 'Vector Databases & Embeddings', 'LLM Fine-tuning & RAG', 'Model Serving'],
    technical_topics: ['Loss Functions & Optimization', 'Transformer Attention Mechanism', 'Vector Search (Cosine, ANN)', 'Precision, Recall, ROC-AUC'],
    recommended_courses: ['crs_01j8k9m3q2'],
    recommended_projects: ['prj_seed_02'],
    recommended_tools: ['PyTorch', 'Jupyter Lab', 'Hugging Face', 'Milvus / ChromaDB', 'FastAPI'],
    interview_topics: ['Self-attention mechanism in Transformers', 'Bias vs Variance tradeoff', 'RAG chunking and hybrid search strategies', 'Quantization (8-bit, 4-bit)'],
    coding_topics: ['Matrix multiplication optimization', 'Cosine similarity calculation', 'Custom dataset DataLoader implementation', 'Cross-entropy loss calculation'],
    typical_learning_path: [
      'Linear algebra, multivariable calculus, and probability foundations',
      'Classical machine learning algorithms and evaluation metrics',
      'Deep neural networks, backpropagation, and PyTorch tensors',
      'Transformer architectures, embeddings, and vector indices',
      'Retrieval-Augmented Generation (RAG) and model deployment pipelines'
    ],
    source_metadata: {
      source_name: 'AI Engineering Roadmap 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_data_analyst',
    name: 'Data Analyst',
    slug: 'data-analyst',
    description: 'Extracts actionable business insights through complex SQL transformations, exploratory data analysis, and dashboard visualization.',
    industry: 'Business Intelligence & Analytics',
    skills: ['Advanced SQL', 'Python (Pandas, NumPy)', 'PowerBI / Tableau', 'Statistical Hypothesis Testing', 'Data Warehousing'],
    technical_topics: ['Window Functions & CTEs', 'Dimensional Modeling (Star/Snowflake)', 'ETL Pipeline Sanitation', 'A/B Testing Metrics'],
    recommended_courses: ['crs_01j8k9m3q2'],
    recommended_projects: ['prj_seed_02'],
    recommended_tools: ['SQL IDE', 'Jupyter', 'Tableau / PowerBI', 'Excel / Sheets'],
    interview_topics: ['SQL Window functions (RANK vs DENSE_RANK)', 'Cohort analysis methodology', 'Null hypothesis testing and p-values', 'Data anomalies and outliers'],
    coding_topics: ['SQL complex aggregations', 'Pandas DataFrame grouping and pivoting', 'Data cleaning transforms', 'Percentile calculation'],
    typical_learning_path: [
      'Master relational querying and complex SQL window functions',
      'Exploratory data analysis using Python Pandas and Matplotlib',
      'Statistical reasoning, correlation vs causation, and hypothesis tests',
      'Dashboard storytelling and KPI design',
      'Data modeling and data warehouse schemas'
    ],
    source_metadata: {
      source_name: 'Data Analytics Profession Benchmark 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_data_scientist',
    name: 'Data Scientist',
    slug: 'data-scientist',
    description: 'Builds predictive mathematical models, feature representations, and experimentation frameworks on large datasets.',
    industry: 'Predictive Modeling & Research',
    skills: ['Probability & Statistics', 'Scikit-Learn & XGBoost', 'SQL & BigQuery', 'Feature Engineering', 'Model Validation'],
    technical_topics: ['Cross-Validation Strategies', 'Regularization (L1/L2)', 'Clustering & Dimensionality Reduction (PCA)', 'ROC & Precision-Recall'],
    recommended_courses: ['crs_01j8k9m3q2'],
    recommended_projects: ['prj_seed_02'],
    recommended_tools: ['Python', 'Scikit-learn', 'XGBoost', 'Jupyter', 'Pandas'],
    interview_topics: ['L1 vs L2 regularization geometric meaning', 'Handling imbalanced datasets (SMOTE vs focal loss)', 'ROC-AUC curve interpretation', 'Feature selection techniques'],
    coding_topics: ['Gradient descent optimization from scratch', 'K-Means clustering algorithm', 'Stratified K-fold cross-validation', 'Confusion matrix calculation'],
    typical_learning_path: [
      'Rigorous probability distributions, Bayes theorem, and statistical tests',
      'Regression, classification, decision trees, and ensemble boosting',
      'Feature engineering and dimensionality reduction (PCA, t-SNE)',
      'Model validation and avoidance of data leakage',
      'End-to-end model inference and API packaging'
    ],
    source_metadata: {
      source_name: 'Data Science Practice Guide 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_cloud',
    name: 'Cloud Engineer',
    slug: 'cloud-engineer',
    description: 'Architects and maintains secure, scalable, and resilient multi-region cloud infrastructure and automated infrastructure-as-code.',
    industry: 'Cloud Infrastructure & Managed Services',
    skills: ['AWS / GCP Architecture', 'Terraform / IaC', 'Networking & VPCs', 'IAM & Cloud Security', 'Cost Optimization'],
    technical_topics: ['VPC Peering & Subnets', 'CIDR & Routing Tables', 'Load Balancing & Auto Scaling', 'CloudWatch & Monitoring'],
    recommended_courses: ['crs_01j8k9m3q3'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Terraform', 'AWS CLI', 'Docker', 'Kubernetes'],
    interview_topics: ['Designing a high-availability multi-AZ system', 'IAM least-privilege policies', 'Cost optimization strategies for cloud compute', 'Disaster recovery strategies (RPO and RTO)'],
    coding_topics: ['Terraform HCL module design', 'CloudWatch alarm scripting', 'Docker container multi-stage builds', 'Subnet IP range calculation'],
    typical_learning_path: [
      'Networking fundamentals (TCP/IP, DNS, CIDR, subnets)',
      'Core cloud primitives (VMs, object storage, serverless)',
      'Infrastructure as Code with Terraform',
      'Identity and Access Management (IAM) security policies',
      'Site Reliability, metrics, and automated alerts'
    ],
    source_metadata: {
      source_name: 'Cloud Architecture Consortium 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_devops',
    name: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Bridges software development and systems operations through continuous delivery automation, observability, and container orchestration.',
    industry: 'Infrastructure & Site Reliability',
    skills: ['Kubernetes & Docker', 'GitHub Actions / GitLab CI', 'Linux Administration', 'Prometheus & Grafana', 'Bash / Python Scripting'],
    technical_topics: ['Pod Scheduling & Ingress', 'Rolling Updates & Canary Deploys', 'Systemd & Linux Kernels', 'Service Meshes'],
    recommended_courses: ['crs_01j8k9m3q3'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Kubernetes', 'Helm', 'Docker', 'Grafana', 'Prometheus'],
    interview_topics: ['Kubernetes pod lifecycle and restart policies', 'Canary vs Blue-Green deployment strategies', 'Troubleshooting high CPU/Memory on Linux servers', 'Secret management in CI/CD'],
    coding_topics: ['Bash automation scripts', 'Kubernetes deployment YAML manifests', 'CI/CD pipeline workflow definitions', 'Log parsing with regular expressions'],
    typical_learning_path: [
      'Deep Linux systems administration and shell scripting',
      'Containerization with Docker multi-stage builds',
      'Container orchestration using Kubernetes and Helm charts',
      'Building robust CI/CD pipelines with GitHub Actions',
      'Observability with metrics, centralized logs, and tracing'
    ],
    source_metadata: {
      source_name: 'DevOps Institute Guidelines 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_security',
    name: 'Cyber Security Analyst',
    slug: 'cyber-security-analyst',
    description: 'Protects enterprise digital assets through vulnerability assessment, threat modeling, security posture audits, and incident response.',
    industry: 'Information Security & Compliance',
    skills: ['Network Security & Wireshark', 'OWASP Top 10', 'Penetration Testing Basics', 'Cryptography & PKI', 'SIEM & Log Analysis'],
    technical_topics: ['SQL Injection & XSS Mitigations', 'TLS Handshake & Certificates', 'Zero Trust Architecture', 'Firewall Rules & IDS/IPS'],
    recommended_courses: ['crs_01j8k9m3q3'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Wireshark', 'Nmap', 'Burp Suite', 'Splunk'],
    interview_topics: ['How SQL injection occurs and how parameterized queries prevent it', 'Diffie-Hellman key exchange mechanics', 'CSRF tokens and SameSite cookie policies', 'Incident triage procedure for compromised credentials'],
    coding_topics: ['Password hashing with bcrypt and salt', 'Input sanitization regex', 'Port scanner script in Python', 'JWT signature verification'],
    typical_learning_path: [
      'OSI and TCP/IP networking models and packet inspection',
      'Web application vulnerabilities (OWASP Top 10)',
      'Cryptography foundations (symmetric, asymmetric, hashing)',
      'Security Information and Event Management (SIEM)',
      'Defensive hardening and patch compliance'
    ],
    source_metadata: {
      source_name: 'Cyber Security Workforce Framework 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_qa',
    name: 'QA / Test Automation Engineer',
    slug: 'qa-engineer',
    description: 'Ensures application stability and regression prevention through automated test suites, end-to-end testing, and load testing.',
    industry: 'Software Quality & Reliability',
    skills: ['Selenium / Playwright / Cypress', 'Unit Testing (Jest/PyTest)', 'API Testing (Postman/RestAssured)', 'Load Testing (JMeter/k6)', 'Test Planning'],
    technical_topics: ['Page Object Model', 'Boundary Value Analysis', 'Equivalence Partitioning', 'Flaky Test Remediation'],
    recommended_courses: ['crs_01j8k9m3q1'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Playwright', 'Postman', 'k6', 'Jest', 'Git'],
    interview_topics: ['Designing test cases for an e-commerce checkout flow', 'Page Object Model advantages and maintenance', 'Load testing metrics (p95, p99 latency vs error rate)', 'Continuous testing in CI pipelines'],
    coding_topics: ['Playwright end-to-end script', 'Unit test with mocking and spies', 'Parameterized test assertions', 'API regression test script'],
    typical_learning_path: [
      'Software testing fundamentals and test case design techniques',
      'Automated API testing and assertions',
      'End-to-end browser automation with Playwright or Cypress',
      'Performance and stress testing with k6',
      'Test integration into automated CI pipelines'
    ],
    source_metadata: {
      source_name: 'Software Quality Assurance Board 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_mobile',
    name: 'Mobile App Developer',
    slug: 'mobile-developer',
    description: 'Develops native and cross-platform mobile experiences focusing on touch interfaces, offline storage, and hardware sensors.',
    industry: 'Mobile & Consumer Software',
    skills: ['React Native / Flutter / Swift / Kotlin', 'Mobile UI & Gestures', 'Offline Storage (SQLite)', 'Push Notifications', 'App Store Deployment'],
    technical_topics: ['Mobile Lifecycle Events', 'Memory Constraints & Battery Efficiency', 'Deep Linking & Navigation', 'Permissions Architecture'],
    recommended_courses: ['crs_01j8k9m3q1'],
    recommended_projects: ['prj_seed_01'],
    recommended_tools: ['Android Studio', 'Xcode', 'React Native CLI', 'Postman'],
    interview_topics: ['React Native Bridge vs New Architecture (JSI)', 'Mobile offline-first data sync patterns', 'App launch time optimization', 'Push notification delivery pipeline'],
    coding_topics: ['Infinite scroll with pagination on mobile', 'Local SQLite database wrapper', 'Custom touch gesture handler', 'Image caching utility'],
    typical_learning_path: [
      'Mobile operating system architectures (iOS and Android)',
      'Cross-platform framework mastery (React Native or Flutter)',
      'Local persistence and offline-first cache strategies',
      'Native device capability integrations (camera, GPS, notifications)',
      'App store publishing, certificates, and release builds'
    ],
    source_metadata: {
      source_name: 'Mobile Development Guild 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'role_ai',
    name: 'Applied AI Engineer',
    slug: 'applied-ai-engineer',
    description: 'Builds production software systems powered by foundational generative AI models, agentic workflows, evaluation harnesses, and vector search.',
    industry: 'Generative AI & Enterprise Automation',
    skills: ['LLM APIs & Prompt Engineering', 'RAG & Vector Databases', 'AI Agent Frameworks', 'Evaluation & Guardrails', 'Full-stack Integration'],
    technical_topics: ['Function Calling & Tool Execution', 'Embedding Models & Semantic Search', 'Context Window Management', 'Prompt Injection Defense'],
    recommended_courses: ['crs_01j8k9m3q2'],
    recommended_projects: ['prj_seed_01', 'prj_seed_02'],
    recommended_tools: ['LangChain / LlamaIndex', 'ChromaDB', 'FastAPI', 'OpenAI / Gemini SDK'],
    interview_topics: ['Designing reliable AI tool calling with validation', 'RAG retrieval evaluation metrics (faithfulness, recall)', 'Mitigating hallucination through grounding', 'Context chunking and token budget strategies'],
    coding_topics: ['Tool dispatcher with schema validation', 'Cosine distance vector retriever', 'Prompt templating with variables', 'Streaming SSE response handler'],
    typical_learning_path: [
      'Foundational LLM capabilities and prompt engineering patterns',
      'Embeddings, chunking strategies, and vector indexing',
      'Autonomous agent design, tool registries, and state management',
      'Safety guardrails, prompt injection defenses, and factual evaluation',
      'Production deployment, latency streaming, and caching'
    ],
    source_metadata: {
      source_name: 'Applied AI Engineering Standard 2026',
      last_reviewed: '2026-02-15',
      disclaimer: 'Curriculum requirements represent typical industry expectations and do not guarantee hiring outcomes.'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

// Initial Demo Resume for Student std_01j8k9x2p4 (Alex Chen)
export const SEED_RESUME: Resume = {
  id: 'res_seed_01',
  student_id: 'std_01j8k9x2p4',
  title: 'Alex Chen — Software Engineer Resume',
  template: 'TECHNICAL',
  target_role: 'Full Stack & Backend Developer',
  target_industry: 'Software Engineering',
  summary: 'Motivated B.Tech Computer Science student with hands-on experience developing full-stack web applications, relational databases, and AI-assisted workflows. Demonstrated track record building responsive React frontends, robust Node.js and FastAPI services, and practical database architectures.',
  status: 'ACTIVE',
  section_order: ['profile', 'summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements'],
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-02T10:00:00Z',
};

export const SEED_RESUME_PROFILE: ResumeProfile = {
  id: 'prof_seed_01',
  resume_id: 'res_seed_01',
  full_name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  website: 'https://alexchen.dev',
  linkedin_url: 'https://linkedin.com/in/alexchen-tech',
  github_url: 'https://github.com/alexchen-dev',
  portfolio_url: 'https://alexchen.dev/portfolio',
  headline: 'B.Tech Computer Science Student | Aspiring Software Engineer',
};

export const SEED_RESUME_EDUCATION: ResumeEducation[] = [
  {
    id: 'edu_seed_01',
    resume_id: 'res_seed_01',
    institution: 'National Institute of Technology',
    degree: 'Bachelor of Technology (B.Tech)',
    field_of_study: 'Computer Science and Engineering',
    start_date: '2023-08',
    end_date: '2027-05',
    grade: '8.8 / 10 CGPA',
    description: 'Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, Software Engineering.',
    order_index: 0,
  },
];

export const SEED_RESUME_SKILLS: ResumeSkill[] = [
  { id: 'rsk_1', resume_id: 'res_seed_01', skill: 'TypeScript', category: 'PROGRAMMING', proficiency: 'ADVANCED', source: 'PROJECT', order_index: 0 },
  { id: 'rsk_2', resume_id: 'res_seed_01', skill: 'Python', category: 'PROGRAMMING', proficiency: 'ADVANCED', source: 'COURSE', order_index: 1 },
  { id: 'rsk_3', resume_id: 'res_seed_01', skill: 'React', category: 'FRAMEWORK', proficiency: 'ADVANCED', source: 'PROJECT', order_index: 2 },
  { id: 'rsk_4', resume_id: 'res_seed_01', skill: 'Node.js', category: 'FRAMEWORK', proficiency: 'INTERMEDIATE', source: 'PROJECT', order_index: 3 },
  { id: 'rsk_5', resume_id: 'res_seed_01', skill: 'PostgreSQL', category: 'DATABASE', proficiency: 'INTERMEDIATE', source: 'COURSE', order_index: 4 },
  { id: 'rsk_6', resume_id: 'res_seed_01', skill: 'Docker', category: 'DEVOPS', proficiency: 'INTERMEDIATE', source: 'STUDENT_ENTERED', order_index: 5 },
  { id: 'rsk_7', resume_id: 'res_seed_01', skill: 'Data Structures & Algorithms', category: 'OTHER', proficiency: 'ADVANCED', source: 'COURSE', order_index: 6 },
  { id: 'rsk_8', resume_id: 'res_seed_01', skill: 'Git', category: 'TOOLS', proficiency: 'ADVANCED', source: 'STUDENT_ENTERED', order_index: 7 },
];

export const SEED_RESUME_PROJECTS: ResumeProject[] = [
  {
    id: 'rprj_1',
    resume_id: 'res_seed_01',
    project_id: 'prj_seed_01',
    title: 'B.Tech Student AI Learning Platform',
    description_override: 'Engineered an end-to-end educational platform featuring interactive code execution, adaptive quiz assessments, and grounded document retrieval.',
    highlighted_features: [
      'Developed responsive user interfaces using React, TypeScript, and Tailwind CSS with sub-100ms client state transitions.',
      'Designed RESTful API endpoints and vector search indexes for course documents and educational notes.',
      'Integrated an automated code runner supporting multiple languages with isolated execution bounds.'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    order_index: 0,
  },
  {
    id: 'rprj_2',
    resume_id: 'res_seed_01',
    project_id: 'prj_seed_02',
    title: 'Clinical Prognosis Classifier & Data Pipeline',
    description_override: 'Constructed a machine learning classification pipeline for patient risk stratification using structured health records.',
    highlighted_features: [
      'Trained and evaluated Scikit-learn and XGBoost classification models achieving balanced sensitivity and specificity.',
      'Constructed exploratory data analysis pipelines handling missing clinical features and categorical encodings.'
    ],
    technologies: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'FastAPI'],
    order_index: 1,
  },
];

export const SEED_RESUME_EXPERIENCE: ResumeExperience[] = [
  {
    id: 'rexp_1',
    resume_id: 'res_seed_01',
    organization: 'Open Source Community',
    role: 'Software Contributor',
    location: 'Remote',
    start_date: '2025-06',
    end_date: 'Present',
    description: 'Contributed feature improvements and bug fixes to developer documentation and utility libraries.',
    achievements: [
      'Authored comprehensive unit test suites expanding code coverage across utility functions.',
      'Documented setup guidelines reducing onboarding friction for new student contributors.'
    ],
    order_index: 0,
  },
];

export const SEED_RESUME_CERTIFICATIONS: ResumeCertification[] = [
  {
    id: 'rcert_1',
    resume_id: 'res_seed_01',
    name: 'CS50: Introduction to Computer Science',
    issuer: 'Harvard University / edX',
    issue_date: '2024-12',
    credential_id: 'edx-cs50-cert-2024',
    credential_url: 'https://credentials.edx.org/cs50-alex-chen',
    description: 'Foundations of computer science, C, Python, algorithms, data structures, and web development.',
    order_index: 0,
  },
];

export const SEED_RESUME_ACHIEVEMENTS: ResumeAchievement[] = [
  {
    id: 'rach_1',
    resume_id: 'res_seed_01',
    title: 'University Hackathon Finalist',
    description: 'Selected as top-5 finalist out of 80 collegiate teams for building an accessible student learning tool.',
    date: '2025-10',
    source: 'HACKATHON',
    order_index: 0,
  },
];

// Initial Student Skills with Evidence for Alex Chen (std_01j8k9x2p4)
export const SEED_STUDENT_SKILLS: StudentSkill[] = [
  {
    id: 'ssk_1',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_py',
    skill_name: 'Python',
    category: 'PROGRAMMING',
    source: 'COURSE',
    evidence_count: 3,
    proficiency: 'ADVANCED',
    confidence: 'STRONG_EVIDENCE',
    last_updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'ssk_2',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_ts',
    skill_name: 'TypeScript',
    category: 'PROGRAMMING',
    source: 'PROJECT',
    evidence_count: 2,
    proficiency: 'ADVANCED',
    confidence: 'STRONG_EVIDENCE',
    last_updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'ssk_3',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_react',
    skill_name: 'React',
    category: 'WEB',
    source: 'PROJECT',
    evidence_count: 2,
    proficiency: 'ADVANCED',
    confidence: 'STRONG_EVIDENCE',
    last_updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'ssk_4',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_sql',
    skill_name: 'SQL',
    category: 'DATABASE',
    source: 'COURSE',
    evidence_count: 2,
    proficiency: 'INTERMEDIATE',
    confidence: 'DEVELOPING_EVIDENCE',
    last_updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'ssk_5',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_dsa',
    skill_name: 'Data Structures & Algorithms',
    category: 'SOFTWARE_ENGINEERING',
    source: 'DSA',
    evidence_count: 4,
    proficiency: 'ADVANCED',
    confidence: 'VERIFIED',
    last_updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'ssk_6',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_docker',
    skill_name: 'Docker',
    category: 'DEVOPS',
    source: 'STUDENT_DECLARED',
    evidence_count: 1,
    proficiency: 'INTERMEDIATE',
    confidence: 'LIMITED_EVIDENCE',
    last_updated_at: '2026-03-01T00:00:00Z',
  },
];

export const SEED_SKILL_EVIDENCE: SkillEvidence[] = [
  {
    id: 'ev_1',
    student_skill_id: 'ssk_1',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_py',
    source_type: 'COURSE',
    source_id: 'crs_01j8k9m3q2',
    description: 'Enrolled and completed practical exercises in Python Programming & ML Foundations.',
    score: 92,
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'ev_2',
    student_skill_id: 'ssk_1',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_py',
    source_type: 'PROJECT',
    source_id: 'prj_seed_02',
    description: 'Implemented clinical prediction models using Scikit-learn and Pandas in Project Builder.',
    created_at: '2026-02-20T00:00:00Z',
  },
  {
    id: 'ev_3',
    student_skill_id: 'ssk_2',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_ts',
    source_type: 'PROJECT',
    source_id: 'prj_seed_01',
    description: 'Developed complete type-safe full-stack learning platform workspace.',
    created_at: '2026-02-22T00:00:00Z',
  },
  {
    id: 'ev_4',
    student_skill_id: 'ssk_5',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_dsa',
    source_type: 'DSA',
    source_id: 'dsa_topic_trees',
    description: 'Mastered Binary Trees, Tree Traversals, and AVL rotations in DSA Lab with visual step debugging.',
    score: 100,
    created_at: '2026-02-25T00:00:00Z',
  },
  {
    id: 'ev_5',
    student_skill_id: 'ssk_5',
    student_id: 'std_01j8k9x2p4',
    skill_id: 'sk_dsa',
    source_type: 'CODING',
    source_id: 'prob_seed_01',
    description: 'Successfully passed all hidden test cases for Two Sum problem in Coding Lab sandbox.',
    score: 100,
    created_at: '2026-02-26T00:00:00Z',
  },
];
