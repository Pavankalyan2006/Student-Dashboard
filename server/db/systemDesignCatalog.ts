// server/db/systemDesignCatalog.ts
// Comprehensive System Design Curriculum Catalog (69 Lessons across 5 Levels),
// 25 Canonical System Design Challenges, Component Palette, and Architecture Seed Data.

import type {
  SystemDesignLesson,
  SystemDesignChallenge,
  SystemDesignLevelInfo,
  ComponentCategory,
  ComponentType
} from '../models/systemDesignTypes';

export interface PaletteComponentDef {
  category: ComponentCategory;
  type: ComponentType;
  name: string;
  default_tech: string;
  description: string;
  icon: string;
}

export const STANDARD_COMPONENT_PALETTE: PaletteComponentDef[] = [
  {
    "category": "APPLICATION",
    "type": "WEB_CLIENT",
    "name": "Web Client",
    "default_tech": "React / Next.js SPA",
    "description": "Desktop web browser client application",
    "icon": "Globe"
  },
  {
    "category": "APPLICATION",
    "type": "MOBILE_CLIENT",
    "name": "Mobile Client",
    "default_tech": "iOS / Android / Flutter",
    "description": "Mobile native application running on smartphones",
    "icon": "Smartphone"
  },
  {
    "category": "APPLICATION",
    "type": "WEB_SERVER",
    "name": "Web Server",
    "default_tech": "Nginx / OpenResty",
    "description": "Static content delivery, SSL termination, and reverse proxying",
    "icon": "Server"
  },
  {
    "category": "APPLICATION",
    "type": "APP_SERVER",
    "name": "Application Server",
    "default_tech": "Node.js / Express / Spring",
    "description": "Executes core business logic and processes student transactions",
    "icon": "Cpu"
  },
  {
    "category": "APPLICATION",
    "type": "BACKEND_SERVICE",
    "name": "Backend Microservice",
    "default_tech": "Go / Python FastAPI",
    "description": "Domain-bounded microservice implementing specific business capabilities",
    "icon": "Layers"
  },
  {
    "category": "APPLICATION",
    "type": "API_GATEWAY",
    "name": "API Gateway",
    "default_tech": "Kong / AWS API Gateway / Envoy",
    "description": "Unified routing, auth verification, SSL termination, and rate limiting",
    "icon": "ShieldCheck"
  },
  {
    "category": "APPLICATION",
    "type": "REVERSE_PROXY",
    "name": "Reverse Proxy",
    "default_tech": "HAProxy / Traefik",
    "description": "Directs client traffic to internal upstream servers",
    "icon": "GitFork"
  },
  {
    "category": "APPLICATION",
    "type": "LOAD_BALANCER",
    "name": "Load Balancer",
    "default_tech": "AWS ALB / Nginx L4/L7",
    "description": "Distributes concurrent incoming traffic across backend service instances",
    "icon": "Shuffle"
  },
  {
    "category": "APPLICATION",
    "type": "AUTH_SERVICE",
    "name": "Auth & Identity Service",
    "default_tech": "OAuth 2.0 / JWT / Keycloak",
    "description": "Issues tokens, authenticates sessions, and enforces RBAC policies",
    "icon": "Lock"
  },
  {
    "category": "STORAGE",
    "type": "SQL_DATABASE",
    "name": "SQL Database",
    "default_tech": "PostgreSQL 16 / MySQL 8.0",
    "description": "ACID-compliant relational database for structured schemas and transactional consistency",
    "icon": "Database"
  },
  {
    "category": "STORAGE",
    "type": "NOSQL_DATABASE",
    "name": "NoSQL Database",
    "default_tech": "MongoDB / Cassandra / DynamoDB",
    "description": "High-throughput schemaless document or key-value store for horizontal scale",
    "icon": "Table"
  },
  {
    "category": "STORAGE",
    "type": "CACHE",
    "name": "In-Memory Cache",
    "default_tech": "Redis Cluster / Memcached",
    "description": "Sub-millisecond latency distributed memory store for reads and sessions",
    "icon": "Zap"
  },
  {
    "category": "STORAGE",
    "type": "OBJECT_STORAGE",
    "name": "Object Storage",
    "default_tech": "AWS S3 / MinIO / GCS",
    "description": "Highly durable block/blob storage for media, files, and backups",
    "icon": "Archive"
  },
  {
    "category": "STORAGE",
    "type": "SEARCH_INDEX",
    "name": "Search Engine Index",
    "default_tech": "Elasticsearch / OpenSearch",
    "description": "Inverted index for full-text search, filtering, and scoring",
    "icon": "Search"
  },
  {
    "category": "STORAGE",
    "type": "DATA_WAREHOUSE",
    "name": "Data Warehouse",
    "default_tech": "Snowflake / Google BigQuery",
    "description": "Columnar analytical store for OLAP queries, business intelligence, and reporting",
    "icon": "BarChart3"
  },
  {
    "category": "STORAGE",
    "type": "VECTOR_DATABASE",
    "name": "Vector Database",
    "default_tech": "Pinecone / Milvus / pgvector",
    "description": "High-dimensional vector embedding storage for AI semantic similarity search",
    "icon": "Sparkles"
  },
  {
    "category": "COMMUNICATION",
    "type": "MESSAGE_QUEUE",
    "name": "Message Queue",
    "default_tech": "RabbitMQ / AWS SQS",
    "description": "Asynchronous point-to-point task queue for decoupling workloads",
    "icon": "ListOrdered"
  },
  {
    "category": "COMMUNICATION",
    "type": "EVENT_BUS",
    "name": "Event Bus",
    "default_tech": "Apache EventMesh / AWS EventBridge",
    "description": "Publish-subscribe event fabric for enterprise domain events",
    "icon": "Radio"
  },
  {
    "category": "COMMUNICATION",
    "type": "STREAMING_PLATFORM",
    "name": "Streaming Platform",
    "default_tech": "Apache Kafka / AWS Kinesis",
    "description": "Distributed partitioned commit log for high-throughput real-time events",
    "icon": "Activity"
  },
  {
    "category": "COMMUNICATION",
    "type": "WEBSOCKET_SERVICE",
    "name": "WebSocket Service",
    "default_tech": "Socket.io / ws gateway",
    "description": "Persistent bidirectional full-duplex TCP channels for real-time live updates",
    "icon": "Wifi"
  },
  {
    "category": "COMMUNICATION",
    "type": "NOTIFICATION_SERVICE",
    "name": "Notification Service",
    "default_tech": "Firebase FCM / Twilio / SendGrid",
    "description": "Omnichannel push notifications, SMS alerts, and transactional email dispatch",
    "icon": "Bell"
  },
  {
    "category": "COMMUNICATION",
    "type": "BACKGROUND_WORKER",
    "name": "Background Worker",
    "default_tech": "Celery / BullMQ / Temporal",
    "description": "Async worker process consuming jobs from queues for offline processing",
    "icon": "Clock"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "CDN",
    "name": "Content Delivery Network",
    "default_tech": "Cloudflare / AWS CloudFront",
    "description": "Edge network caching static assets close to end-users globally",
    "icon": "Cloud"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "DNS",
    "name": "Domain Name System",
    "default_tech": "AWS Route53 / Cloudflare DNS",
    "description": "Global latency-based, geo-routing DNS resolution",
    "icon": "Globe"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "CONTAINER",
    "name": "Application Container",
    "default_tech": "Docker OCI Image",
    "description": "Isolated microservice application packaging and execution unit",
    "icon": "Box"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "CONTAINER_ORCHESTRATION",
    "name": "Container Orchestrator",
    "default_tech": "Kubernetes (K8s) / EKS",
    "description": "Automated deployment, autoscaling, and management of containerized apps",
    "icon": "Grid"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "MONITORING_SERVICE",
    "name": "Monitoring & Metrics",
    "default_tech": "Prometheus + Grafana",
    "description": "Time-series telemetry collection, metrics dashboards, and SLO alerting",
    "icon": "LineChart"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "LOGGING_SERVICE",
    "name": "Centralized Logging",
    "default_tech": "ELK Stack / Loki",
    "description": "Distributed log ingestion, indexing, querying, and auditing",
    "icon": "FileText"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "SECRETS_MANAGER",
    "name": "Secrets Manager",
    "default_tech": "HashiCorp Vault / AWS Secrets Manager",
    "description": "Encrypted credentials, API keys, and certificate storage",
    "icon": "Key"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "FIREWALL",
    "name": "Web App Firewall (WAF)",
    "default_tech": "Cloudflare WAF / AWS WAF",
    "description": "DDoS protection, OWASP Top 10 mitigation, and IP rate limiting",
    "icon": "ShieldAlert"
  },
  {
    "category": "INFRASTRUCTURE",
    "type": "RATE_LIMITER",
    "name": "Rate Limiter",
    "default_tech": "Redis Token Bucket Rate Limiter",
    "description": "Protects internal APIs from noisy neighbors and burst abuse",
    "icon": "Gauge"
  },
  {
    "category": "DISTRIBUTED",
    "type": "PRIMARY_DB",
    "name": "Primary Database Node",
    "default_tech": "Postgres Primary / Leader",
    "description": "Handles all write mutations and syncs WAL replication stream",
    "icon": "Database"
  },
  {
    "category": "DISTRIBUTED",
    "type": "READ_REPLICA",
    "name": "Read Replica Node",
    "default_tech": "Postgres Read Replica / Follower",
    "description": "Read-only clone absorbing heavy read queries with async replication",
    "icon": "Copy"
  },
  {
    "category": "DISTRIBUTED",
    "type": "SHARD",
    "name": "Database Shard",
    "default_tech": "Citus / Vitess Shard Partition",
    "description": "Horizontally partitioned database slice indexed by hash or range shard key",
    "icon": "Split"
  },
  {
    "category": "DISTRIBUTED",
    "type": "LEADER",
    "name": "Consensus Leader",
    "default_tech": "Raft / Paxos Leader Node",
    "description": "Coordinates state machine replication and distributed consensus log",
    "icon": "Crown"
  },
  {
    "category": "DISTRIBUTED",
    "type": "FOLLOWER",
    "name": "Consensus Follower",
    "default_tech": "Raft Follower / Replica",
    "description": "Replicates state machine commands from elected consensus leader",
    "icon": "Users"
  },
  {
    "category": "DISTRIBUTED",
    "type": "REGIONAL_DEPLOYMENT",
    "name": "Regional Deployment",
    "default_tech": "Multi-Region VPC (us-east, eu-west)",
    "description": "Full stack clone deployed in geographically separated cloud region for low latency",
    "icon": "MapPin"
  },
  {
    "category": "DISTRIBUTED",
    "type": "FAILOVER_COMPONENT",
    "name": "Failover Controller",
    "default_tech": "Corosync / Keepalived / AWS Route53 Failover",
    "description": "Automated health check heartbeat monitor promoting standby nodes on outage",
    "icon": "RefreshCw"
  }
];

export const SYSTEM_DESIGN_ROADMAP_LEVELS: Omit<SystemDesignLevelInfo, 'lessons'>[] = [
  {
    level: 1,
    name: 'Foundations',
    tagline: 'Requirements, Scale Fundamentals & Core Constraints',
    description: 'Master functional vs non-functional requirements, latency, throughput, availability math, and back-of-the-envelope estimation.',
    total_lessons: 12,
    completed_lessons: 0
  },
  {
    level: 2,
    name: 'Core Components',
    tagline: 'Building Blocks of Modern Web-Scale Systems',
    description: 'Deep dive into load balancers, caching strategies, SQL vs NoSQL, database replication, message queues, and API gateways.',
    total_lessons: 16,
    completed_lessons: 0
  },
  {
    level: 3,
    name: 'Distributed Systems',
    tagline: 'Consensus, Partitioning & Resiliency at Scale',
    description: 'Demystify CAP theorem, eventual consistency, distributed transactions, 2PC/Saga, sharding keys, rate limiting, and circuit breakers.',
    total_lessons: 16,
    completed_lessons: 0
  },
  {
    level: 4,
    name: 'Advanced Architecture',
    tagline: 'Enterprise Paradigms & Multi-Region Resiliency',
    description: 'Architect microservices, event sourcing, CQRS, stream processing with Kafka, multi-region failover, zero-trust security, and real-time systems.',
    total_lessons: 15,
    completed_lessons: 0
  },
  {
    level: 5,
    name: 'Interview Preparation',
    tagline: '10-Step Structured FAANG & Tech Lead Framework',
    description: 'Ace technical system design interviews using the proven 10-step methodology from requirements clarification to trade-off analysis.',
    total_lessons: 10,
    completed_lessons: 0
  }
];

export const SYSTEM_DESIGN_LESSONS: SystemDesignLesson[] = [
  {
    "id": "sd_l1_01",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 1,
    "slug": "what-is-system-design",
    "title": "What is System Design?",
    "summary": "Core definition, architecture scope, systems thinking, and why system design is the premier skill of senior software engineers.",
    "estimated_minutes": 15,
    "content_markdown": "# What is System Design?\n\n**System Design** is the multidisciplinary engineering process of defining the architecture, components, modules, interfaces, and data for a computing system to satisfy specified operational and business requirements.\n\nWhile basic programming focuses on algorithms and data structures inside a single process, **System Design** focuses on how hundreds or thousands of distributed processes, services, databases, and networks communicate reliably under high concurrent load.\n\n### Key Pillars of System Design\n1. **Scalability**: Can the system handle 10x or 100x traffic growth without collapsing?\n2. **Reliability & Availability**: Does the system stay operational even when servers, hard disks, or network switches fail?\n3. **Efficiency & Latency**: Does the system respond in milliseconds while keeping infrastructure costs sustainable?\n4. **Maintainability**: Can engineering teams evolve, test, and debug the codebase over a 5-to-10 year lifecycle?\n\nIn interview and production settings, system design is **never about finding one dogmatic 'right' answer**. It is about understanding trade-offs, quantifying trade-offs, and choosing the optimal compromises for specific user needs.",
    "key_decisions": [
      "Choosing between simplicity and premature optimization",
      "Balancing read vs write optimization based on workload profile",
      "Selecting between off-the-shelf cloud managed services vs custom in-house software"
    ],
    "advantages": [
      "Provides blueprint before expensive engineering hours are committed",
      "Exposes hidden single points of failure early",
      "Prevents exponential cloud infrastructure costs"
    ],
    "disadvantages": [
      "Over-engineering simple features can drastically slow time-to-market",
      "Theoretical designs can become outdated if real traffic patterns deviate"
    ],
    "common_mistakes": [
      "Jumping straight into drawing boxes without clarifying functional scope",
      "Using complex distributed microservices when a modular monolith suffices",
      "Ignoring operational costs and maintenance overhead"
    ],
    "practical_examples": [
      "Designing Twitter: Distinguishing home timeline read speed from tweet post write speed",
      "Designing Uber: Decoupling driver location tracking from rider billing services"
    ],
    "related_topics": [
      "functional-requirements",
      "non-functional-requirements",
      "scalability"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_01_1",
        "question": "What is the primary objective of system design compared to competitive programming?",
        "options": [
          "Optimizing CPU instruction cycles inside a single function",
          "Coordinating distributed components, networks, and data stores to satisfy real-world scale and reliability constraints",
          "Writing code with zero external dependencies",
          "Memorizing specific cloud vendor pricing tiers"
        ],
        "correct_option_index": 1,
        "explanation": "System design addresses macro architecture: distributing load across network boundaries, data persistence, fault isolation, and operational trade-offs."
      }
    ]
  },
  {
    "id": "sd_l1_02",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 2,
    "slug": "functional-requirements",
    "title": "Functional Requirements",
    "summary": "Defining user-facing actions, business capabilities, API contracts, input-output boundaries, and explicit non-goals.",
    "estimated_minutes": 15,
    "content_markdown": "# Functional Requirements\n\n**Functional Requirements (FRs)** define *what* the system must do from the user and client perspective. They represent business features, API contracts, domain entities, and operational workflows.\n\n### How to Define Functional Requirements\n1. **Core User Actions**: What can a user actively perform? (e.g., Shorten URL, View News Feed, Book Ride).\n2. **System Behaviors**: What happens automatically? (e.g., Send push notification, Expire inactive links, Deduplicate payments).\n3. **Boundary & Non-Goals**: Explicitly listing features that are **out of scope** prevents scope creep and focuses interview time on critical challenges.\n\n### Concrete Example: URL Shortener (TinyURL)\n- **FR 1**: User submits a long URL and receives a shortened URL (e.g., `https://tiny.cc/aB3x9`).\n- **FR 2**: Accessing the short URL redirects the user to the original destination with sub-20ms latency.\n- **FR 3**: Users can optionally specify custom aliases (e.g., `tiny.cc/my-portfolio`).\n- **Non-Goal**: We will not build an ad-network or web page scraper in the initial release.",
    "key_decisions": [
      "Deciding between MVP essential features vs secondary polish features",
      "Defining strict API input validation and error contracts"
    ],
    "advantages": [
      "Aligns engineering teams with product and business stakeholders",
      "Provides deterministic criteria for integration testing"
    ],
    "disadvantages": [
      "Overly rigid functional specs can hinder agile discovery"
    ],
    "common_mistakes": [
      "Mixing functional features with non-functional constraints (e.g., saying 'Speed' is a functional requirement)",
      "Failing to agree on non-goals, leading to unfinished designs"
    ],
    "practical_examples": [
      "E-commerce checkout: Adding to cart, applying coupon, charging credit card, updating warehouse inventory"
    ],
    "related_topics": [
      "non-functional-requirements",
      "what-is-system-design"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_02_1",
        "question": "Which of the following is a pure Functional Requirement?",
        "options": [
          "The system must handle 50,000 requests per second at p99 latency < 20ms",
          "The user can upload an image and generate a shareable preview link",
          "The service must maintain 99.99% monthly availability",
          "All data in transit must be encrypted with TLS 1.3"
        ],
        "correct_option_index": 1,
        "explanation": "Uploading an image and generating a link describes a user-facing capability (what the system does), whereas RPS, availability, and encryption are non-functional constraints (how well it does it)."
      }
    ]
  },
  {
    "id": "sd_l1_03",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 3,
    "slug": "non-functional-requirements",
    "title": "Non-Functional Requirements (NFRs)",
    "summary": "SLAs, SLOs, SLIs, availability nines, latency percentiles (p50/p90/p99), durability, and security postures.",
    "estimated_minutes": 20,
    "content_markdown": "# Non-Functional Requirements (NFRs)\n\n**Non-Functional Requirements (NFRs)** define *how well* the system performs its functions. They govern quality attributes, operational constraints, and engineering standards.\n\n### The 'ilities' of System Design\n- **Availability**: Percentage of time the system is operational and serving valid responses (e.g., 99.99% = max 52.6 minutes downtime per year).\n- **Latency**: Time elapsed between client request transmission and response consumption, measured in percentiles (**p50**, **p95**, **p99**).\n- **Throughput**: Number of operations processed per unit time (Requests Per Second - **RPS**, Queries Per Second - **QPS**).\n- **Consistency vs Availability**: Choosing between ACID strict correctness vs BASE high availability under network partitions.\n- **Durability**: Probability that committed data will never be permanently lost (e.g., AWS S3 promises 99.999999999% durability).\n\n### Service Level Terminology\n- **SLI (Service Level Indicator)**: The actual metric measured (e.g., Current p99 latency is 42ms).\n- **SLO (Service Level Objective)**: The internal target team strives for (e.g., p99 latency < 50ms over 30 days).\n- **SLA (Service Level Agreement)**: The contractual promise to customers with financial penalties if breached (e.g., 99.9% uptime credit).",
    "key_decisions": [
      "Optimizing for p99 tail latency vs average response time",
      "Deciding between strong consistency vs eventual consistency",
      "Establishing backup frequency and Disaster Recovery RTO/RPO"
    ],
    "advantages": [
      "Quantifies engineering success with objective operational metrics",
      "Prevents system crashes under sudden spike traffic"
    ],
    "disadvantages": [
      "Every additional nine of availability (99.9% -> 99.99% -> 99.999%) exponentially increases infrastructure cost"
    ],
    "common_mistakes": [
      "Focusing only on average latency (averages hide tail latency suffering for 1% of top paying users)",
      "Stating 'the system must never go down' without acknowledging realistic physical hardware failure rates"
    ],
    "practical_examples": [
      "Financial trading platform: Strict consistency and < 5ms latency are paramount",
      "YouTube video views counter: Eventual consistency is completely acceptable to maximize availability"
    ],
    "related_topics": [
      "availability",
      "latency-and-throughput",
      "functional-requirements"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_03_1",
        "question": "Why do distributed systems engineers track p99 (99th percentile) latency rather than average latency?",
        "options": [
          "Average latency is mathematically harder to calculate",
          "Average latency obscures tail latency; in large systems, a user request touches dozens of backends, meaning most users experience the slowest tail calls",
          "p99 latency only measures network packets, not server execution",
          "Cloud providers only bill based on the 99th percentile"
        ],
        "correct_option_index": 1,
        "explanation": "Average latency hides outliers. When an e-commerce page makes 100 internal service calls to assemble a page, if even one is in the 99th percentile, the user experiences the slow tail."
      }
    ]
  },
  {
    "id": "sd_l1_04",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 4,
    "slug": "scalability",
    "title": "Scalability: Vertical vs Horizontal",
    "summary": "Scaling up vs scaling out, statefulness bottlenecks, auto-scaling groups, elasticity, and Amdahl's Law.",
    "estimated_minutes": 20,
    "content_markdown": "# Scalability: Vertical vs Horizontal\n\n**Scalability** is the capability of a system to handle a growing amount of work by adding hardware resources.\n\n### 1. Vertical Scaling (Scale Up)\nAdding more CPU cores, RAM, or faster NVMe storage to a single physical machine or virtual instance.\n- **Pros**: Zero architectural complexity; code remains single-process or multi-threaded; no network partition risks; transactions remain local ACID.\n- **Cons**: Hard physical ceiling (the largest AWS EC2 instance has finite CPUs); exorbitant cost curve; single point of failure (if that box crashes, everything dies).\n\n### 2. Horizontal Scaling (Scale Out)\nAdding more commodity server instances running in parallel behind a load balancer.\n- **Pros**: Virtually limitless ceiling; high availability (if node 3 fails, nodes 1, 2, and 4 continue serving traffic); cost-effective commodity compute.\n- **Cons**: Requires stateless application servers; demands distributed caches, network serialization, and distributed database sharding.\n\n### The Golden Rule of Horizontal Scaling\nTo scale horizontally, **application servers must be stateless**. Store user sessions in a shared fast store (like Redis) or JWT tokens rather than in local server memory.",
    "key_decisions": [
      "When to start horizontal scaling vs exhausting vertical scaling headroom",
      "Decoupling session state to enable seamless auto-scaling"
    ],
    "advantages": [
      "Resilience against individual instance termination",
      "Elasticity: Scale in during off-peak night hours to cut costs"
    ],
    "disadvantages": [
      "Introduces distributed data consistency and networking challenges"
    ],
    "common_mistakes": [
      "Saving user session files to the local web server filesystem, breaking round-robin load balancing",
      "Assuming database writes scale linearly just by adding read replicas"
    ],
    "practical_examples": [
      "Kubernetes Horizontal Pod Autoscaler (HPA) adding replicas when CPU utilization crosses 70%"
    ],
    "related_topics": [
      "load-balancers",
      "application-servers",
      "capacity-planning"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_04_1",
        "question": "What is the critical prerequisite for an application tier to scale horizontally without dropped requests?",
        "options": [
          "The application must be written in C or Rust",
          "The application servers must be stateless, delegating state to external caches or databases",
          "Every server must have its own dedicated public IP address",
          "The database must run on the exact same physical rack"
        ],
        "correct_option_index": 1,
        "explanation": "Stateless servers allow any request from any client to be routed to any instance interchangeably without losing session continuity."
      }
    ]
  },
  {
    "id": "sd_l1_05",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 5,
    "slug": "availability",
    "title": "Availability & The Nines of Uptime",
    "summary": "Calculating uptime, MTBF, MTTR, calculating compound availability in serial vs parallel systems.",
    "estimated_minutes": 20,
    "content_markdown": "# Availability & The Nines of Uptime\n\n**Availability** is the percentage of time that a system remains fully functional and accessible to clients over a given observation period.\n\n$$\\text{Availability} = \\frac{\\text{Uptime}}{\\text{Uptime} + \\text{Downtime}} = \\frac{\\text{MTBF}}{\\text{MTBF} + \\text{MTTR}}$$\n\n- **MTBF (Mean Time Between Failures)**: Average operating time before a hardware/software failure occurs.\n- **MTTR (Mean Time To Repair)**: Average time required to detect, mitigate, and recover from a failure.\n\n### The 'Nines' Availability Table\n| Availability | Downtime per Year | Downtime per Month | Downtime per Day | Typical System |\n|---|---|---|---|---|\n| **99% (Two Nines)** | 3.65 days | 7.31 hours | 14.4 minutes | Internal dev tools |\n| **99.9% (Three Nines)** | 8.77 hours | 43.8 minutes | 1.44 minutes | Standard SaaS apps |\n| **99.99% (Four Nines)** | 52.6 minutes | 4.38 minutes | 8.64 seconds | Cloud infrastructure, e-commerce |\n| **99.999% (Five Nines)** | 5.26 minutes | 26.3 seconds | 0.86 seconds | Telecommunications, financial exchanges |\n\n### Compound Availability Math\n- **Components in Series** (both must work):\n  $$A_{\\text{total}} = A_1 \\times A_2$$\n  *Example*: App Server (99.9%) $\\times$ Database (99.9%) = **99.8%** (Overall availability drops!).\n- **Components in Parallel** (redundant active/standby):\n  $$A_{\\text{total}} = 1 - (1 - A_1) \\times (1 - A_2)$$\n  *Example*: Two load balancers with 99.9% each: $1 - (0.001 \\times 0.001) = 1 - 0.000001 = $ **99.9999%**!",
    "key_decisions": [
      "Adding parallel redundant nodes to eliminate serial bottleneck points",
      "Automating failover with health probes to minimize MTTR"
    ],
    "advantages": [
      "Protects business revenue and contractual SLA compliance",
      "Provides mathematical rigor to justify redundancy costs"
    ],
    "disadvantages": [
      "High availability requires automated monitoring, fencing, and consensus mechanisms"
    ],
    "common_mistakes": [
      "Simply multiplying availability numbers when components have hidden shared dependencies (e.g., both running in the same AWS Availability Zone)",
      "Manual failovers that take 30 minutes, instantly blowing the 4.38 minute monthly budget for four nines"
    ],
    "practical_examples": [
      "Deploying multi-AZ AWS RDS with automated failover: when primary fails, replica promotes in < 60 seconds"
    ],
    "related_topics": [
      "fault-tolerance",
      "reliability",
      "scalability"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_05_1",
        "question": "If Service A (99% availability) depends on Service B (99% availability) in series, what is the combined availability?",
        "options": [
          "99.0%",
          "98.01%",
          "99.9%",
          "100%"
        ],
        "correct_option_index": 1,
        "explanation": "In series, both components must be healthy: 0.99 * 0.99 = 0.9801 (98.01%). Series dependencies always degrade overall availability."
      }
    ]
  },
  {
    "id": "sd_l1_06",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 6,
    "slug": "reliability",
    "title": "Reliability & Failure Domains",
    "summary": "Hardware crashes, software bugs, network partitions, blast radius containment, and data durability.",
    "estimated_minutes": 15,
    "content_markdown": "# Reliability & Failure Domains\n\n**Reliability** is the probability that a system will perform its intended function under specified conditions without error over a specified period.\n\nWhile **availability** measures whether the system answers requests (even with errors), **reliability** measures whether it produces **correct** results without dropping or corrupting data.\n\n### Blast Radius Reduction\nA fundamental principle of modern architecture is **minimizing blast radius**:\n- If the recommender engine crashes, the checkout flow must still allow users to buy items.\n- If region `us-east-1` suffers an outage, traffic should automatically route to `us-west-2`.\n- Use **cell-based architecture** to isolate customer cohorts into autonomous mini-clusters.",
    "key_decisions": [
      "Decoupling critical business paths from non-essential enhancement services",
      "Using bulkheads and circuit breakers to prevent cascading outages"
    ],
    "advantages": [
      "A localized failure does not bring down the entire global platform",
      "Builds user trust and brand integrity"
    ],
    "disadvantages": [
      "Requires defensive programming and fallback UI states"
    ],
    "common_mistakes": [
      "Allowing a failure in an analytics reporting endpoint to block primary user logins"
    ],
    "practical_examples": [
      "Netflix: If personalized recommendations fail, the UI degrades gracefully by showing a static Top 10 list"
    ],
    "related_topics": [
      "fault-tolerance",
      "availability",
      "non-functional-requirements"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_06_1",
        "question": "What is the primary concept behind 'blast radius reduction'?",
        "options": [
          "Increasing server power to absorb crashes",
          "Partitioning systems so that a failure in one component or region does not cascade to the rest of the application",
          "Deleting logs after a crash to save disk space",
          "Running all services in a single monolithic process"
        ],
        "correct_option_index": 1,
        "explanation": "Blast radius reduction limits the damage of any single component failure to a small, isolated subset of users or features."
      }
    ]
  },
  {
    "id": "sd_l1_07",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 7,
    "slug": "latency-and-throughput",
    "title": "Latency vs Throughput",
    "summary": "Little's Law, network serialization, memory vs disk access speed benchmarks, and pipelining.",
    "estimated_minutes": 20,
    "content_markdown": "# Latency vs Throughput\n\nUnderstanding the distinction and relationship between latency and throughput is fundamental to distributed systems performance.\n\n- **Latency**: The duration of time it takes for a single unit of data to travel from origin to destination (measured in milliseconds or microseconds).\n- **Throughput**: The quantity of work or data processed per unit of time (measured in Requests Per Second, QPS, or Megabytes/sec).\n\n### Little's Law\nIn any stable queueing system, the average number of concurrent requests in the system ($L$) equals the arrival throughput ($\\lambda$) multiplied by the average latency ($W$):\n\n$$L = \\lambda \\times W$$\n\n*Example*: If your API receives 1,000 requests/sec ($\\lambda = 1000$) and each request takes 200ms ($W = 0.2s$), your servers must maintain **200 concurrent active connections** ($L = 200$). If latency spikes to 2 seconds due to a slow DB query, concurrency explodes to **2,000 connections**, exhausting worker thread pools!\n\n### Latency Numbers Every Programmer Should Know (Peter Norvig)\n- **L1 CPU Cache reference**: 0.5 ns\n- **L2 CPU Cache reference**: 7 ns\n- **Main Memory (RAM) reference**: 100 ns\n- **Read 1 MB sequentially from RAM**: 250,000 ns (0.25 ms)\n- **Read 1 MB sequentially from NVMe SSD**: 1,000,000 ns (1 ms)\n- **Read 1 MB sequentially from HDD**: 20,000,000 ns (20 ms)\n- **Packet round trip (same data center)**: 500,000 ns (0.5 ms)\n- **Packet round trip (CA to Netherlands)**: 150,000,000 ns (150 ms)\n\n*Lesson*: Reading from RAM is $\\approx$ 10,000 times faster than reading from spinning disk! This is why in-memory caching is transformational.",
    "key_decisions": [
      "Using asynchronous I/O and non-blocking event loops for high-concurrency workloads",
      "Trading batching latency for superior overall throughput in streaming pipelines"
    ],
    "advantages": [
      "Allows accurate prediction of thread pool sizing and connection exhaustion",
      "Informs correct caching and data locality decisions"
    ],
    "disadvantages": [
      "Aggressive batching improves throughput but penalizes individual request latency"
    ],
    "common_mistakes": [
      "Assuming faster CPU cores will fix a database disk I/O bottleneck",
      "Neglecting network round-trips when making dozens of sequential RPC calls inside a single loop (N+1 query problem)"
    ],
    "practical_examples": [
      "Kafka: Batches multiple records together to achieve millions of writes/sec with sequential disk I/O"
    ],
    "related_topics": [
      "capacity-planning",
      "caching",
      "performance-optimization"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_07_1",
        "question": "According to Little's Law (L = \u03bb * W), what happens to server concurrency if request latency doubles while incoming traffic rate remains constant?",
        "options": [
          "Server concurrency halves",
          "Server concurrency doubles, requiring twice as many active worker connections",
          "Server concurrency remains identical",
          "Throughput drops to zero"
        ],
        "correct_option_index": 1,
        "explanation": "If latency (W) doubles and arrival rate (\u03bb) stays constant, active concurrent in-flight requests (L) double."
      }
    ]
  },
  {
    "id": "sd_l1_08",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 8,
    "slug": "fault-tolerance",
    "title": "Fault Tolerance & Redundancy",
    "summary": "Single Points of Failure (SPOFs), N+1 redundancy, 2N redundancy, active-passive vs active-active failover.",
    "estimated_minutes": 15,
    "content_markdown": "# Fault Tolerance & Redundancy\n\nA system is **fault-tolerant** if it continues operating properly in the event of the failure of one or more of its components.\n\n### Eliminating Single Points of Failure (SPOF)\nA **Single Point of Failure (SPOF)** is any component whose breakdown causes the entire system to stop functioning.\n\n### Redundancy Strategies\n1. **Active-Passive (Standby)**:\n   - Primary node handles 100% of traffic; secondary standby node mirrors state via replication.\n   - On primary failure, a heartbeat mechanism triggers failover to promote the standby.\n   - *Limitation*: Idle hardware costs money during normal operation.\n2. **Active-Active**:\n   - Multiple instances actively serve concurrent traffic.\n   - If one node crashes, the load balancer redistributes its share among remaining healthy nodes.\n   - *Advantage*: 100% resource utilization and instant zero-downtime tolerance.",
    "key_decisions": [
      "Choosing Active-Active vs Active-Passive based on data synchronization complexity",
      "Implementing reliable heartbeats without false-positive failover oscillations (flapping)"
    ],
    "advantages": [
      "Continuous system availability during hardware crashes and maintenance rollouts"
    ],
    "disadvantages": [
      "Active-active across distributed databases requires multi-master conflict resolution"
    ],
    "common_mistakes": [
      "Having 10 redundant web servers but only a single master database without replicas (the DB is a fatal SPOF)",
      "Forgetting to test disaster recovery failovers regularly"
    ],
    "practical_examples": [
      "AWS Multi-AZ deployment: Primary DB in us-east-1a replicates synchronously to standby in us-east-1b"
    ],
    "related_topics": [
      "availability",
      "reliability",
      "load-balancers"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_08_1",
        "question": "What is the defining characteristic of an Active-Active deployment model?",
        "options": [
          "One node serves traffic while another is completely shut off",
          "All deployed nodes simultaneously process incoming client traffic, sharing the active load",
          "Data is only written to disk once per week",
          "Servers only accept requests during business hours"
        ],
        "correct_option_index": 1,
        "explanation": "In Active-Active, all nodes actively process traffic, maximizing hardware utilization and providing seamless failover if one node drops."
      }
    ]
  },
  {
    "id": "sd_l1_09",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 9,
    "slug": "performance-optimization",
    "title": "Performance Optimization",
    "summary": "Profiling, identifying bottlenecks, CPU bound vs I/O bound workloads, database connection pooling, and payload compression.",
    "estimated_minutes": 15,
    "content_markdown": "# Performance Optimization\n\nPerformance optimization is the disciplined practice of identifying and eliminating resource bottlenecks to maximize speed and minimize resource utilization.\n\n### The Profiling Rule\n**Never optimize without measurement.** 90% of execution time is typically consumed by 10% of code. Use profilers, APM tools (Datadog, OpenTelemetry), and slow query logs.\n\n### Key Optimization Levers\n1. **Caching**: Store computed or queried results in memory (Redis, Memcached).\n2. **Connection Pooling**: Reusing established TCP connections to databases rather than handshaking every query.\n3. **Compression**: Gzip/Brotli HTTP compression shrinks JSON payloads by 70-80%.\n4. **Pagination**: Never return unbounded lists (`SELECT * FROM orders`); always use cursor-based or limit-offset pagination.",
    "key_decisions": [
      "Determining whether a service is CPU-bound (e.g. image encoding) or I/O-bound (e.g. waiting on DB)",
      "Using binary protocols (Protobuf, gRPC) over verbose JSON for internal service communication"
    ],
    "advantages": [
      "Drastically reduces server count and cloud infrastructure bills",
      "Improves user experience and SEO search rankings"
    ],
    "disadvantages": [
      "Premature optimization can lead to unreadable, brittle code"
    ],
    "common_mistakes": [
      "Optimizing Python string concatenation when the database query takes 800ms",
      "Failing to use database connection pools, causing database socket exhaustion"
    ],
    "practical_examples": [
      "Using HikariCP in Java or pgpool in Node.js to keep 20 warmed database connections active"
    ],
    "related_topics": [
      "latency-and-throughput",
      "caching",
      "database-indexes"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_09_1",
        "question": "Why is database connection pooling essential for high-throughput web applications?",
        "options": [
          "It encrypts all database passwords automatically",
          "Opening and closing TCP connections and TLS handshakes for every query is expensive; pooling reuses pre-warmed open connections",
          "It eliminates the need for SQL queries",
          "It allows relational databases to function as graph databases"
        ],
        "correct_option_index": 1,
        "explanation": "TCP handshakes, authentication, and process fork overhead make creating new connections slow; connection pools eliminate this per-request cost."
      }
    ]
  },
  {
    "id": "sd_l1_10",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 10,
    "slug": "maintainability",
    "title": "Maintainability & Operability",
    "summary": "Clean abstractions, configuration management, feature flags, semantic versioning, and CI/CD pipelines.",
    "estimated_minutes": 15,
    "content_markdown": "# Maintainability & Operability\n\nSoftware systems spend 80% or more of their lifespan in **maintenance mode**. Maintainability is the ease with which software can be modified to correct defects, improve performance, or adapt to a changing environment.\n\n### Core Principles\n1. **Operability**: Make it easy for operations teams to keep the system running smoothly (good health checks, metrics, self-healing).\n2. **Simplicity**: Reduce accidental complexity. Code should be readable and predictable.\n3. **Evolvability**: Enable software to change easily when requirements evolve through loose coupling and well-defined API contracts.\n4. **Feature Flags**: Decouple code deployment from feature release, enabling zero-downtime dark launches and instant rollbacks.",
    "key_decisions": [
      "Using feature flag toggles (LaunchDarkly) for phased rollouts",
      "Enforcing backward-compatible schema migrations (Expand-Contract pattern)"
    ],
    "advantages": [
      "Enables high team deployment velocity (deploying multiple times per day safely)",
      "Lowers mean time to detect and resolve software regressions"
    ],
    "disadvantages": [
      "Requires investment in automated testing and continuous integration tooling"
    ],
    "common_mistakes": [
      "Hardcoding environment configuration inside compiled application code",
      "Breaking backward compatibility in API responses, crashing mobile clients that haven't updated yet"
    ],
    "practical_examples": [
      "Expand-Contract database migration: Add new column as nullable, backfill data, update code to write to both, then deprecate old column"
    ],
    "related_topics": [
      "what-is-system-design",
      "microservices"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_10_1",
        "question": "How does the 'Expand-Contract' database migration pattern achieve zero-downtime updates?",
        "options": [
          "By taking the database offline at midnight",
          "By adding new schema elements alongside old ones, running code that supports both versions, and only removing old elements after all clients have migrated",
          "By dropping all indexes before running ALTER TABLE",
          "By deleting all existing rows and re-importing"
        ],
        "correct_option_index": 1,
        "explanation": "Expand-Contract (Parallel Run) ensures that both the old version of the application and the new version can run concurrently against the database without errors."
      }
    ]
  },
  {
    "id": "sd_l1_11",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 11,
    "slug": "capacity-planning",
    "title": "Capacity Planning & Back-of-the-Envelope Math",
    "summary": "Calculating RPS, storage growth, read-to-write ratios, bandwidth requirements, and powers of two conversions.",
    "estimated_minutes": 25,
    "content_markdown": "# Capacity Planning & Back-of-the-Envelope Math\n\nIn system design interviews and real-world architecture, **Back-of-the-Envelope estimation** helps you quickly determine whether an architecture is computationally and economically viable.\n\n### Key Rules of Thumb & Conversions\n- **Seconds in a Day**: $24 \\times 3600 = 86,400 \\approx 100,000$ (simplifies mental division!).\n- **Powers of 2 / 10**:\n  - $2^{10} \\approx 10^3$ (Thousand = 1 KB)\n  - $2^{20} \\approx 10^6$ (Million = 1 MB)\n  - $2^{30} \\approx 10^9$ (Billion = 1 GB)\n  - $2^{40} \\approx 10^{12}$ (Trillion = 1 TB)\n  - $2^{50} \\approx 10^{15}$ (Petabyte = 1 PB)\n\n### Core Formulas\n\n#### 1. Average Requests Per Second (RPS)\n$$\\text{Average RPS} = \\frac{\\text{Daily Requests}}{86,400}$$\n*Example*: 100 Million daily requests $\\approx 100,000,000 / 100,000 = $ **1,000 RPS**.\n\n#### 2. Peak Requests Per Second\n$$\\text{Peak RPS} = \\text{Average RPS} \\times \\text{Peak Factor (typically 2 to 5)}$$\n*Example*: $1,000 \\times 2 = $ **2,000 Peak RPS**.\n\n#### 3. Storage Growth Per Year\n$$\\text{Annual Storage} = \\text{Writes/Day} \\times \\text{Payload Size} \\times 365$$\n*Example*: 10M tweets/day $\\times$ 500 bytes $\\times 365 = 5 \\text{ GB/day} \\times 365 \\approx$ **1.825 TB/year**.\n\n#### 4. Bandwidth Requirements\n$$\\text{Bandwidth (Bytes/sec)} = \\text{RPS} \\times \\text{Average Request Size}$$\nMultiply by 8 to convert to bits/sec (e.g. Megabits per second).",
    "key_decisions": [
      "Estimating peak-to-average traffic multiplier for flash sales or viral news events",
      "Factoring in replication factor (e.g. 3x replication triples raw storage requirements)"
    ],
    "advantages": [
      "Immediately identifies whether a single SQL database suffices or if sharding is required",
      "Prevents surprise cloud infrastructure cost overruns"
    ],
    "disadvantages": [
      "Estimates are approximations; production telemetry is required for final verification"
    ],
    "common_mistakes": [
      "Forgetting to multiply storage by replication factor and index overhead (typically add 20-30% for indexes)",
      "Confusing Megabits (Mbps - network bandwidth) with Megabytes (MB/s - storage transfer)"
    ],
    "practical_examples": [
      "Estimating photo storage for Instagram: 100M photos/day * 200 KB = 20 TB/day = 7.3 PB/year"
    ],
    "related_topics": [
      "latency-and-throughput",
      "scalability",
      "what-is-system-design"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_11_1",
        "question": "If an API receives 86.4 million requests per day, what is the exact average Requests Per Second (RPS)?",
        "options": [
          "100 RPS",
          "1,000 RPS",
          "8,640 RPS",
          "86,400 RPS"
        ],
        "correct_option_index": 1,
        "explanation": "86,400,000 requests / 86,400 seconds in a day = exactly 1,000 requests per second."
      }
    ]
  },
  {
    "id": "sd_l1_12",
    "level": 1,
    "level_name": "Foundations",
    "order_index": 12,
    "slug": "basic-architecture-diagrams",
    "title": "Architecture Diagrams & The C4 Model",
    "summary": "Visual notation, box-and-line diagrams, C4 hierarchical modeling (Context, Containers, Components, Code), and clean visual communication.",
    "estimated_minutes": 15,
    "content_markdown": "# Architecture Diagrams & The C4 Model\n\nVisual diagrams are the universal language of software architecture. A diagram that lacks clear boundaries, protocol labels, or data flow directions causes confusion among engineering teams.\n\n### The C4 Model (Simon Brown)\nThe C4 model structures diagrams hierarchically at 4 zoom levels:\n1. **System Context**: Shows how the system fits into the world with human users and external systems.\n2. **Container**: Shows high-level technical building blocks (web app, mobile app, API server, database, message queue).\n3. **Component**: Zooms into a specific container to show internal modules (controllers, services, repositories).\n4. **Code**: Class diagrams and entity relationships (rarely used in high-level system design).\n\n### Diagram Best Practices in System Design\n- Always label directional arrows with protocols (`HTTPS`, `gRPC`, `WebSocket`, `Kafka`).\n- Clearly separate tiers: **Client Tier**, **Gateway / Load Balancing Tier**, **Application / Microservices Tier**, **Storage & Caching Tier**.\n- Highlight read paths vs write paths using distinct colors or labels.",
    "key_decisions": [
      "Choosing the right zoom level for your audience (executives vs backend engineers)",
      "Standardizing icon sets and color palettes across the engineering organization"
    ],
    "advantages": [
      "Unambiguous shared mental model for developers, security teams, and architects",
      "Facilitates rapid threat modeling and single-point-of-failure analysis"
    ],
    "disadvantages": [
      "Diagrams can easily fall out of sync with code if not maintained"
    ],
    "common_mistakes": [
      "Drawing arrows with no labels indicating whether the arrow represents request flow or data dependency",
      "Using non-standard custom shapes that obscure component types"
    ],
    "practical_examples": [
      "Using the System Design Lab Canvas to construct a 3-tier architecture with an API gateway, backend service, Redis cache, and PostgreSQL database"
    ],
    "related_topics": [
      "what-is-system-design",
      "client-server-architecture"
    ],
    "knowledge_check": [
      {
        "id": "kc_l1_12_1",
        "question": "What is the primary benefit of the C4 architecture model?",
        "options": [
          "It automatically writes unit test code",
          "It provides a standard hierarchical zoom approach (Context, Container, Component, Code) to communicate systems at appropriate abstraction levels",
          "It replaces the need for databases",
          "It guarantees zero compile errors"
        ],
        "correct_option_index": 1,
        "explanation": "The C4 model provides a structured zoom hierarchy so stakeholders can inspect system context without getting lost in low-level component details."
      }
    ]
  },
  {
    "id": "sd_l2_13",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 13,
    "slug": "client-server-architecture",
    "title": "Client-Server Architecture",
    "summary": "Request-response lifecycles, thick vs thin clients, separation of concerns, and stateless communication protocols.",
    "estimated_minutes": 15,
    "content_markdown": "# Client-Server Architecture\n\nThe **Client-Server model** is the foundational distributed application structure that partitions tasks or workloads between the providers of a resource or service (servers) and service requesters (clients).\n\n### Core Characteristics\n1. **Separation of Concerns**: Clients focus on UI rendering and user interactions; servers focus on security, business rules, data integrity, and persistence.\n2. **Stateless Request-Response**: In HTTP/REST architectures, each request from client to server must contain all necessary authentication and context data.\n3. **Thick Client vs Thin Client**:\n   - *Thin Client*: Server renders HTML (Server-Side Rendering / SSR); client is just a display browser.\n   - *Thick Client*: Client executes complex SPA code (React, Vue, iOS Native) and communicates via JSON APIs.",
    "key_decisions": [
      "Choosing between SSR vs SPA based on SEO and user interaction needs"
    ],
    "advantages": [
      "Centralized data management",
      "Independent evolution of client and server codebases"
    ],
    "disadvantages": [
      "Server becomes a central point of traffic congestion requiring load balancing"
    ],
    "common_mistakes": [
      "Trusting client-side input validation on the server without re-verifying"
    ],
    "practical_examples": [
      "Browser requesting REST JSON API from a Node.js Express backend"
    ],
    "related_topics": [
      "application-servers",
      "load-balancers"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_13_1",
        "question": "Why must the server always re-validate input even if the client app validated it?",
        "options": [
          "Because clients can be tampered with or bypassed via direct curl/Postman requests",
          "Because client validation runs slower than server validation",
          "To satisfy HTML5 compliance standards",
          "It is optional and purely for logging"
        ],
        "correct_option_index": 0,
        "explanation": "Never trust the client. Any malicious actor can bypass the UI and send arbitrary HTTP requests directly to your API endpoints."
      }
    ]
  },
  {
    "id": "sd_l2_14",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 14,
    "slug": "application-servers",
    "title": "Application Servers & Statelessness",
    "summary": "Stateless service design, externalizing session state, thread pools, and asynchronous event loops.",
    "estimated_minutes": 15,
    "content_markdown": "# Application Servers & Statelessness\n\nAn **Application Server** hosts and executes the core business logic, orchestrates data queries, and coordinates with external services.\n\n### Statelessness: The Key to Horizontal Scaling\nIn a **stateless architecture**, the server retains no client session state between requests. Any request from any user can be routed to any server instance with identical results.\n- **Stateful (Bad)**: User logs into Server A; Server A keeps session in its local RAM. If next request goes to Server B, the user is suddenly logged out!\n- **Stateless (Good)**: User logs in; session is stored in a shared distributed **Redis cluster**, or an encrypted **JWT token** is given to the client. Any server can validate the request instantly.",
    "key_decisions": [
      "JWT client-side token storage vs Server-side Redis session storage"
    ],
    "advantages": [
      "Instant zero-downtime auto-scaling: servers can be killed or spun up on demand"
    ],
    "disadvantages": [
      "Requires network hop to shared session store for every authenticated request"
    ],
    "common_mistakes": [
      "Storing uploaded files in local server directory `/tmp` instead of S3"
    ],
    "practical_examples": [
      "Stateless Go microservice containers running inside a Kubernetes cluster"
    ],
    "related_topics": [
      "scalability",
      "load-balancers",
      "caching"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_14_1",
        "question": "What is the primary benefit of designing application servers to be completely stateless?",
        "options": [
          "They consume zero CPU memory",
          "Any server instance can handle any incoming request, enabling seamless horizontal auto-scaling and failover",
          "They eliminate the need for a database",
          "They automatically compile into WebAssembly"
        ],
        "correct_option_index": 1,
        "explanation": "Statelessness decouples the request from physical machine identity, allowing load balancers to distribute traffic freely."
      }
    ]
  },
  {
    "id": "sd_l2_15",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 15,
    "slug": "reverse-proxies",
    "title": "Reverse Proxies (Nginx, Envoy)",
    "summary": "Forward vs reverse proxy, TLS termination, request buffering, compression, and security shielding.",
    "estimated_minutes": 15,
    "content_markdown": "# Reverse Proxies (Nginx, Envoy)\n\nA **Reverse Proxy** sits between clients and web servers, intercepting incoming client requests and directing them to the appropriate backend server.\n\n### Forward Proxy vs Reverse Proxy\n- **Forward Proxy**: Sits in front of **clients** to protect client identities and bypass firewalls (e.g., corporate VPN).\n- **Reverse Proxy**: Sits in front of **servers** to protect backend infrastructure and optimize traffic delivery.\n\n### Key Capabilities\n1. **SSL/TLS Termination**: Decrypts incoming HTTPS traffic once at the edge, relieving internal application servers of heavy cryptographic CPU cycles.\n2. **Request Buffering**: Absorbs slow client connections before forwarding fast, complete requests to application worker threads.\n3. **Static Content Serving**: Directly serves images, CSS, and JS from cache without touching Python/Java backends.\n4. **Security Masking**: Prevents external clients from directly accessing internal IP addresses or server topologies.",
    "key_decisions": [
      "Choosing Nginx (mature, event-driven) vs Envoy (dynamic service mesh proxy)"
    ],
    "advantages": [
      "Centralized SSL certificate management",
      "Protection against direct DDoS attacks on application servers"
    ],
    "disadvantages": [
      "Adds an extra network hop and configuration layer"
    ],
    "common_mistakes": [
      "Terminating SSL at the proxy but failing to encrypt internal transit for strict compliance environments"
    ],
    "practical_examples": [
      "Nginx reverse proxy forwarding `/api/*` to Node.js backend and serving `/static/*` directly from disk"
    ],
    "related_topics": [
      "load-balancers",
      "api-gateways"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_15_1",
        "question": "What is 'SSL/TLS Termination' at the reverse proxy tier?",
        "options": [
          "Terminating user connections that lack valid passwords",
          "Decrypting HTTPS traffic at the reverse proxy so backend servers receive fast internal unencrypted HTTP requests",
          "Canceling SSL certificates when servers expire",
          "Permanently disabling HTTPS across the application"
        ],
        "correct_option_index": 1,
        "explanation": "Offloading TLS decryption at the reverse proxy frees backend application servers from CPU-intensive cryptographic operations."
      }
    ]
  },
  {
    "id": "sd_l2_16",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 16,
    "slug": "load-balancers",
    "title": "Load Balancers: L4 vs L7 & Algorithms",
    "summary": "Layer 4 transport vs Layer 7 application routing, balancing algorithms (Round Robin, Least Connections, Consistent Hashing), and health checks.",
    "estimated_minutes": 20,
    "content_markdown": "# Load Balancers: L4 vs L7 & Algorithms\n\nA **Load Balancer (LB)** distributes network traffic across multiple backend servers to ensure no single server becomes overwhelmed.\n\n### Layer 4 vs Layer 7 Load Balancing\n- **Layer 4 (Transport Layer)**:\n  - Operates on IP address and TCP/UDP port without inspecting application payload.\n  - Extremely fast and lightweight (millions of packets/sec via Linux kernel eBPF / LVS).\n  - Cannot inspect HTTP headers, cookies, or URL paths.\n- **Layer 7 (Application Layer)**:\n  - Parses full HTTP/HTTPS headers, cookies, and URI paths.\n  - Enables intelligent content-based routing: route `/video/*` to Video microservice, and `/auth/*` to Auth service.\n  - Enables sticky sessions and header-based rate limiting.\n\n### Load Balancing Algorithms\n1. **Round Robin**: Routes requests sequentially (Server 1 -> 2 -> 3 -> 1). Best for stateless, homogeneous servers.\n2. **Weighted Round Robin**: Routes proportionally based on server capacity (e.g. 8-core server gets 2x requests of 4-core server).\n3. **Least Connections**: Sends requests to server with fewest active connections. Best for long-lived connections (WebSockets).\n4. **IP Hash**: Hashes client IP to guarantee the same client hits the same server (session affinity).\n5. **Consistent Hashing**: Minimizes key remapping when servers join or leave the pool.",
    "key_decisions": [
      "Deploying L4 (AWS NLB) for raw packet speed vs L7 (AWS ALB) for path-based routing",
      "Configuring health check intervals and failure thresholds"
    ],
    "advantages": [
      "Prevents overloading individual servers",
      "Enables zero-downtime rolling deployments"
    ],
    "disadvantages": [
      "The load balancer itself must be redundant (Active-Standby with floating virtual IP or DNS round-robin) to avoid being a SPOF"
    ],
    "common_mistakes": [
      "Setting health check thresholds too aggressively, causing cascading thrashing when servers have brief latency spikes"
    ],
    "practical_examples": [
      "AWS Application Load Balancer routing `/api/v1/checkout` to the Payments pod fleet"
    ],
    "related_topics": [
      "reverse-proxies",
      "scalability",
      "fault-tolerance"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_16_1",
        "question": "When should an architect choose a Layer 7 (L7) load balancer over Layer 4 (L4)?",
        "options": [
          "When routing decisions require inspecting HTTP request paths, headers, or cookies",
          "When the application only uses raw UDP gaming packets",
          "When CPU usage on the load balancer must be mathematically zero",
          "When encryption is illegal"
        ],
        "correct_option_index": 0,
        "explanation": "L7 load balancers inspect application payload, enabling path-based microservice routing, cookie inspection, and header manipulation."
      }
    ]
  },
  {
    "id": "sd_l2_17",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 17,
    "slug": "horizontal-and-vertical-scaling",
    "title": "Horizontal and Vertical Scaling Patterns",
    "summary": "Auto-scaling groups, target tracking policies, cooldown periods, and graceful termination handling.",
    "estimated_minutes": 15,
    "content_markdown": "# Horizontal and Vertical Scaling Patterns\n\nScaling dynamically adjusts compute capacity to match fluctuating workload demands in real-time.\n\n### Auto-Scaling Metrics & Policies\n1. **CPU Utilization**: Scale out when average CPU > 70% across fleet.\n2. **Request Queue Depth**: Scale out when pending jobs in queue cross threshold.\n3. **Request Count Per Target**: Scale out when RPS per container exceeds calibrated capacity.\n\n### Cooldown Periods & Flapping Prevention\nAuto-scaling requires a **cooldown period** (e.g. 300 seconds) after scaling out to allow newly launched instances to initialize and absorb load before triggering another scale event. This prevents **thrashing/flapping** (rapid oscillating scaling in and out).",
    "key_decisions": [
      "Using predictive scaling for scheduled spikes vs reactive metrics for sudden surges"
    ],
    "advantages": [
      "Optimizes cost by paying only for active capacity needed at any hour"
    ],
    "disadvantages": [
      "Cold start delays (JVM or container boot times) can cause dropped traffic if spikes happen faster than boot time"
    ],
    "common_mistakes": [
      "Neglecting graceful shutdown (SIGTERM handling), killing in-flight customer transactions when an instance scales in"
    ],
    "practical_examples": [
      "AWS EC2 Auto Scaling Groups with scale-in protection during active batch jobs"
    ],
    "related_topics": [
      "scalability",
      "load-balancers"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_17_1",
        "question": "What is the purpose of an auto-scaling 'cooldown period'?",
        "options": [
          "To cool down physical server fans",
          "To allow newly spawned instances time to initialize and stabilize traffic before another scaling action is evaluated",
          "To force developers to stop committing code",
          "To shut down servers during the night"
        ],
        "correct_option_index": 1,
        "explanation": "A cooldown period prevents rapid, unstable over-provisioning (thrashing) by waiting for new instances to start serving load."
      }
    ]
  },
  {
    "id": "sd_l2_18",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 18,
    "slug": "caching",
    "title": "Caching Strategies & Eviction Policies",
    "summary": "Cache-Aside, Write-Through, Write-Behind, Refresh-Ahead, LRU/LFU eviction, and Cache Stampede mitigation.",
    "estimated_minutes": 25,
    "content_markdown": "# Caching Strategies & Eviction Policies\n\n**Caching** stores expensive query results or computations in fast memory (RAM) so subsequent requests can be served in sub-millisecond times.\n\n### The 4 Major Caching Patterns\n1. **Cache-Aside (Lazy Loading)**:\n   - Application queries cache first.\n   - If **Cache Hit**, return data.\n   - If **Cache Miss**, query database, write result into cache with TTL, and return.\n   - *Advantage*: Only requested data is cached. Resilience if cache node dies.\n2. **Write-Through**:\n   - Application writes data to cache and database synchronously in a single transaction.\n   - *Advantage*: Cache is always fresh and consistent with DB.\n   - *Disadvantage*: Higher write latency.\n3. **Write-Behind (Write-Back)**:\n   - Application writes directly to cache; cache asynchronously batches writes to database after a delay.\n   - *Advantage*: Incredible write throughput.\n   - *Disadvantage*: Data loss risk if cache crashes before flushing to DB.\n4. **Refresh-Ahead**:\n   - Cache automatically reloads frequently accessed keys before their TTL expires.\n\n### Eviction Policies\nWhen cache memory fills up, old keys must be evicted:\n- **LRU (Least Recently Used)**: Discards items not accessed for the longest time (most common).\n- **LFU (Least Frequently Used)**: Discards items with the lowest access count.\n- **FIFO (First In, First Out)**: Evicts oldest items regardless of access frequency.\n\n### The Cache Stampede (Thundering Herd)\nWhen a hot cache key expires, thousands of concurrent requests miss the cache and hammer the database simultaneously, causing database collapse!\n*Mitigation*: Use **probabilistic early expiration (XFetch)**, mutual exclusion locks (single-flight), or pre-warmed background refresh.",
    "key_decisions": [
      "Setting appropriate Time-To-Live (TTL) values based on data volatility",
      "Choosing Cache-Aside vs Write-Through"
    ],
    "advantages": [
      "Reduces database load by 80-95%",
      "Cuts p99 read latency from 50ms to < 2ms"
    ],
    "disadvantages": [
      "Cache invalidation is notoriously difficult; risk of serving stale data"
    ],
    "common_mistakes": [
      "Caching without a TTL, leading to unbounded memory growth (OOM crash)",
      "Not protecting against Cache Stampede on viral keys"
    ],
    "practical_examples": [
      "Redis cluster storing user profile JSON with a 1-hour TTL"
    ],
    "related_topics": [
      "latency-and-throughput",
      "sql-databases",
      "nosql-databases"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_18_1",
        "question": "What happens during a 'Cache Stampede' (Thundering Herd) event?",
        "options": [
          "The cache runs out of network bandwidth",
          "A popular cache key expires, causing massive concurrent requests to hit the backend database simultaneously, potentially crashing it",
          "Data is accidentally deleted by an admin",
          "The database cache becomes corrupted"
        ],
        "correct_option_index": 1,
        "explanation": "When a hot key expires under heavy traffic, thousands of worker threads simultaneously miss the cache and hit the database to recompute it."
      }
    ]
  },
  {
    "id": "sd_l2_19",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 19,
    "slug": "cdn",
    "title": "Content Delivery Networks (CDN) & Edge Caching",
    "summary": "Points of Presence (PoPs), Anycast routing, static asset caching, dynamic edge compute (Cloudflare Workers), and cache invalidation.",
    "estimated_minutes": 15,
    "content_markdown": "# Content Delivery Networks (CDN) & Edge Caching\n\nA **Content Delivery Network (CDN)** is a geographically distributed network of proxy servers (Points of Presence - **PoPs**) that cache content close to end users.\n\n### How CDNs Drastically Cut Latency\nIf a user in Tokyo requests a 5MB image from a server in Virginia, speed of light in fiber dictates a minimum 150ms round-trip latency.\nA CDN caches the image in a Tokyo edge server, reducing latency to **< 5ms**!\n\n### Anycast DNS Routing\nClients query a single universal IP address. Border Gateway Protocol (BGP) Anycast automatically routes packets to the physically nearest CDN PoP.",
    "key_decisions": [
      "Caching static media vs executing dynamic edge compute (SSR at the edge)",
      "Configuring `Cache-Control: public, max-age=31536000, immutable` with asset content hashing"
    ],
    "advantages": [
      "Offloads 90%+ of static asset traffic from origin servers",
      "Built-in edge DDoS mitigation (Cloudflare, Fastly, AWS CloudFront)"
    ],
    "disadvantages": [
      "Global cache invalidation can take several minutes to propagate"
    ],
    "common_mistakes": [
      "Using generic filenames like `logo.png` instead of hashed names like `logo.a8f9b2.png`, leading to stale browser caches"
    ],
    "practical_examples": [
      "Serving Netflix video chunks and Spotify audio clips from local ISP edge CDN caches"
    ],
    "related_topics": [
      "caching",
      "latency-and-throughput"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_19_1",
        "question": "Why should static web assets use content-hashed filenames (e.g., `bundle.8a3f.js`) with CDNs?",
        "options": [
          "To hide code from competitors",
          "To enable aggressive immutable caching for 1 year while guaranteeing immediate cache updates upon new deployments",
          "To compress files on disk",
          "Because CDNs reject plain English filenames"
        ],
        "correct_option_index": 1,
        "explanation": "Content hashing allows `max-age=31536000, immutable`. When code changes, the filename changes, completely bypassing the need for slow manual cache invalidation."
      }
    ]
  },
  {
    "id": "sd_l2_20",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 20,
    "slug": "sql-databases",
    "title": "SQL Databases & ACID Guarantees",
    "summary": "Relational schemas, foreign keys, normalization, ACID transaction properties, and transaction isolation levels.",
    "estimated_minutes": 20,
    "content_markdown": "# SQL Databases & ACID Guarantees\n\nRelational **SQL Databases** (PostgreSQL, MySQL) store data in structured tables with strict schemas, relationships, and mathematical relational algebra.\n\n### The ACID Guarantee\n- **Atomicity**: An entire transaction succeeds, or it all rolls back completely (All or Nothing).\n- **Consistency**: Data transitions strictly from one valid state to another, satisfying all schema constraints, checks, and foreign keys.\n- **Isolation**: Concurrent transactions execute without interfering with one another.\n- **Durability**: Once a transaction commits, its modifications are permanently recorded to non-volatile storage (via Write-Ahead Log - **WAL**), surviving power outages.\n\n### SQL Transaction Isolation Levels\n1. **Read Uncommitted**: Suffers dirty reads.\n2. **Read Committed**: Default in Postgres. Prevents dirty reads.\n3. **Repeatable Read**: Default in MySQL InnoDB. Prevents non-repeatable reads via MVCC.\n4. **Serializable**: Highest isolation; prevents phantom reads via strict lock graph or optimistic serializable MVCC.",
    "key_decisions": [
      "Choosing PostgreSQL (extensible, JSONB, advanced indexing) vs MySQL (fast point queries)",
      "Selecting transaction isolation level to balance concurrency vs consistency"
    ],
    "advantages": [
      "Structured schema enforcement",
      "Powerful declarative relational JOINs and aggregations",
      "Guaranteed financial consistency"
    ],
    "disadvantages": [
      "Vertical scaling limit; horizontal sharding across multi-node SQL is complex"
    ],
    "common_mistakes": [
      "Using SQL for high-velocity IoT time-series writes without partitioning",
      "Writing complex 10-table joins in high-traffic OLTP web request paths"
    ],
    "practical_examples": [
      "Banking ledger and e-commerce order management systems requiring strict ACID invariants"
    ],
    "related_topics": [
      "nosql-databases",
      "database-indexes",
      "database-replication"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_20_1",
        "question": "How does a relational database ensure 'Durability' in ACID during sudden power loss?",
        "options": [
          "By running on solar power",
          "By writing committed changes to an append-only Write-Ahead Log (WAL) on disk before acknowledging the client",
          "By storing data solely in RAM",
          "By asking the client to resend data"
        ],
        "correct_option_index": 1,
        "explanation": "A Write-Ahead Log (WAL) ensures that transactions are committed to disk sequentially before page tables in memory are flushed, allowing crash recovery."
      }
    ]
  },
  {
    "id": "sd_l2_21",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 21,
    "slug": "nosql-databases",
    "title": "NoSQL Databases (Document, Key-Value, Columnar, Graph)",
    "summary": "Non-relational paradigms, BASE semantics, MongoDB, Cassandra, DynamoDB, Redis, and Neo4j comparison.",
    "estimated_minutes": 25,
    "content_markdown": "# NoSQL Databases (Document, Key-Value, Columnar, Graph)\n\n**NoSQL (Not Only SQL)** databases are engineered to solve specific distributed scale, latency, and flexible schema challenges where traditional single-node relational databases struggle.\n\n### The 4 Major NoSQL Families\n1. **Key-Value Stores (Redis, DynamoDB, Memcached)**:\n   - Data stored as simple key -> value blobs.\n   - Ultra-fast $O(1)$ point lookups by primary partition key.\n   - Ideal for session state, shopping carts, and caching.\n2. **Document Stores (MongoDB, Couchbase)**:\n   - Data stored as semi-structured hierarchical JSON/BSON documents.\n   - Flexible schemas allow rapid iteration without complex ALTER TABLE migrations.\n   - Ideal for product catalogs, content management, and user profiles.\n3. **Wide-Column Stores (Apache Cassandra, ScyllaDB, HBase)**:\n   - Distributed tabular stores optimized for sequential append-only disk writes.\n   - Shards rows across clusters using consistent hashing partition keys.\n   - Ideal for high-throughput time-series logs, chat history, and sensor telemetry.\n4. **Graph Databases (Neo4j, Amazon Neptune)**:\n   - Nodes (entities) and Edges (relationships) are first-class citizens.\n   - Index-free adjacency enables millisecond deep relational traversals without expensive multi-table SQL joins.\n   - Ideal for social networks, fraud detection rings, and recommendation engines.",
    "key_decisions": [
      "Choosing between SQL strict schema vs NoSQL horizontal partitionability",
      "Modeling data around query patterns rather than relational normalization"
    ],
    "advantages": [
      "Natural horizontal partitioning across hundreds of commodity nodes",
      "Flexible schema evolution"
    ],
    "disadvantages": [
      "Lack of multi-table JOINs; requires application-side denormalization",
      "Eventual consistency trade-offs (BASE instead of ACID)"
    ],
    "common_mistakes": [
      "Using a Document store like Mongo and then trying to simulate relational foreign key joins in application code",
      "Picking NoSQL simply because it is 'trendy' without checking query access patterns"
    ],
    "practical_examples": [
      "Discord migrated billions of chat messages from MongoDB to Cassandra/ScyllaDB to handle append-only chat logs"
    ],
    "related_topics": [
      "sql-databases",
      "database-partitioning",
      "caching"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_21_1",
        "question": "Which NoSQL database family is best suited for social networks with complex multi-hop friend-of-a-friend relationships?",
        "options": [
          "Key-Value Store (Redis)",
          "Document Store (MongoDB)",
          "Graph Database (Neo4j)",
          "Wide-Column Store (Cassandra)"
        ],
        "correct_option_index": 2,
        "explanation": "Graph databases utilize index-free adjacency, allowing constant-time edge traversals across relationship hops without expensive joins."
      }
    ]
  },
  {
    "id": "sd_l2_22",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 22,
    "slug": "database-indexes",
    "title": "Database Indexes: B-Trees, Hash & Inverted",
    "summary": "Index data structures, B+ Trees, composite index column ordering, write amplification trade-offs, and EXPLAIN query plans.",
    "estimated_minutes": 20,
    "content_markdown": "# Database Indexes: B-Trees, Hash & Inverted\n\nA **Database Index** is a specialized auxiliary data structure that improves the speed of data retrieval operations on a database table at the cost of additional write overhead and storage space.\n\n### 1. B+ Tree Index (Default in Relational DBs)\n- Self-balancing n-ary tree where all data rows/pointers reside strictly in leaf nodes.\n- Leaf nodes are linked in a sequential doubly linked list.\n- **Complexity**: $O(\\log N)$ for lookups, insertions, and deletions.\n- **Superpower**: Highly efficient **range queries** (`WHERE age BETWEEN 20 AND 30`) and sorting (`ORDER BY created_at`).\n\n### 2. Hash Index\n- Maps key directly to disk location via hash function.\n- **Complexity**: $O(1)$ average point lookup.\n- **Limitation**: Completely useless for range queries (`WHERE age > 25`) or sorting.\n\n### 3. Inverted Index (Search Engines: Elasticsearch, Lucene)\n- Maps every distinct word to a sorted posting list of Document IDs containing that word.\n- The fundamental building block of full-text search and search autocomplete engines.\n\n### The Index Write Tax (Write Amplification)\nEvery additional index on a table accelerates read queries, but **slows down every `INSERT`, `UPDATE`, and `DELETE`**, because the database must update the table AND rebalance all associated B-Trees.",
    "key_decisions": [
      "Indexing high-cardinality columns vs low-cardinality columns",
      "Ordering columns in composite indexes following the Leftmost Prefix Rule"
    ],
    "advantages": [
      "Transforms full table scans ($O(N)$) into logarithmic lookups ($O(\\log N)$)"
    ],
    "disadvantages": [
      "Increases disk storage and slows down write throughput"
    ],
    "common_mistakes": [
      "Adding 15 indexes on a high-write financial ledger table, destroying write throughput",
      "Creating a composite index `(A, B)` and expecting it to optimize queries filtering only on `B`"
    ],
    "practical_examples": [
      "Using `EXPLAIN ANALYZE` in PostgreSQL to verify that a query uses an Index Scan instead of a Sequential Scan"
    ],
    "related_topics": [
      "sql-databases",
      "performance-optimization"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_22_1",
        "question": "Why are B+ Trees favored over standard Binary Search Trees or Hash Indexes in relational database engines?",
        "options": [
          "B+ Trees use less RAM than plain arrays",
          "B+ Trees have high fan-out (low depth), minimizing expensive disk seeks, and linked leaves make range scans extremely fast",
          "B+ Trees only work on text data",
          "B+ Trees eliminate the need for primary keys"
        ],
        "correct_option_index": 1,
        "explanation": "High branching factors mean B+ Trees have depth 3-4 for millions of records, requiring very few disk I/O seeks, and linked leaves optimize range scans."
      }
    ]
  },
  {
    "id": "sd_l2_23",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 23,
    "slug": "database-replication",
    "title": "Database Replication: Leader-Follower & Multi-Leader",
    "summary": "Primary-replica topology, synchronous vs asynchronous replication, read scaling, replication lag, and split-brain resolution.",
    "estimated_minutes": 20,
    "content_markdown": "# Database Replication: Leader-Follower & Multi-Leader\n\n**Replication** is the practice of sharing and synchronizing data across multiple database instances to enhance fault tolerance, disaster recovery, and read throughput.\n\n### 1. Single-Leader (Leader-Follower / Master-Slave)\n- **All writes** are sent exclusively to the **Leader (Primary)**.\n- The leader writes to its local storage and streams its Write-Ahead Log (WAL) to one or more **Followers (Read Replicas)**.\n- **Reads** can be distributed across any of the read replicas.\n- *Advantage*: Simple concurrency model; no write conflict resolution required.\n- *Challenge*: **Replication Lag** (asynchronous replicas lag milliseconds to seconds behind the master, leading to stale reads).\n\n### 2. Multi-Leader (Multi-Master)\n- Multiple database nodes accept concurrent writes (typically across different geographical regions).\n- Nodes replicate writes asynchronously to each other.\n- *Challenge*: **Write Conflicts** (User in US updates row while user in Europe updates same row). Requires conflict resolution strategies (Last-Write-Wins, CRDTs).",
    "key_decisions": [
      "Using synchronous replication (zero data loss, higher write latency) vs asynchronous replication (fast writes, potential failover data loss)",
      "Handling 'Read-Your-Own-Writes' consistency by routing immediate post-update reads to the primary"
    ],
    "advantages": [
      "Scales read traffic across multiple replicas",
      "Provides instant failover target if primary crashes"
    ],
    "disadvantages": [
      "Replication lag causes users to see stale data immediately after updating their profile"
    ],
    "common_mistakes": [
      "Assuming read replicas solve database write bottlenecks (all replicas must re-execute all writes!)"
    ],
    "practical_examples": [
      "AWS Aurora Postgres: 1 writer node with up to 15 auto-scaling read replicas sharing a distributed storage tier"
    ],
    "related_topics": [
      "database-partitioning",
      "consistency-models",
      "fault-tolerance"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_23_1",
        "question": "What is 'Replication Lag' in an asynchronous leader-follower database cluster?",
        "options": [
          "The time it takes to boot up a new server",
          "The time delay between a write committing on the leader and that change being applied to a read replica",
          "The network delay between client and load balancer",
          "The time required to run an index rebuild"
        ],
        "correct_option_index": 1,
        "explanation": "Because replication is asynchronous, replicas take milliseconds or seconds to process the leader's WAL, meaning queries to replicas may return slightly stale data."
      }
    ]
  },
  {
    "id": "sd_l2_24",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 24,
    "slug": "database-partitioning",
    "title": "Database Partitioning & Sharding",
    "summary": "Horizontal vs vertical partitioning, sharding keys, range-based vs hash-based sharding, hot spot management, and cross-shard queries.",
    "estimated_minutes": 25,
    "content_markdown": "# Database Partitioning & Sharding\n\nWhen a database grows beyond the CPU, memory, or disk storage limits of the largest physical machine, it must be **partitioned**.\n\n### Partitioning Types\n1. **Vertical Partitioning**: Splitting a wide table into smaller tables by columns (e.g. putting frequently accessed `users (id, email)` on one DB and large `user_profiles (bio, avatar_blob)` on another).\n2. **Horizontal Partitioning (Sharding)**: Splitting a table by rows across multiple independent physical database instances (shards).\n\n### Sharding Key Strategies\n- **Range-Based Sharding**: Partition by alphabetical or numerical range (e.g., Shard 1: User IDs 1-1M; Shard 2: 1M-2M).\n  - *Risk*: Severe write hot-spotting on the latest range for auto-incrementing IDs.\n- **Hash-Based Sharding**: Hash the Sharding Key modulo number of shards (`hash(user_id) % N`).\n  - *Advantage*: Uniformly scatters writes across all shards.\n- **Directory-Based Sharding**: A lookup service maintains a mapping of which entity ID lives on which shard.\n\n### The Nightmares of Sharding\n- **Cross-Shard JOINs**: Performing relational JOINs across tables living on separate physical servers is notoriously slow and complex.\n- **Re-sharding**: Changing from 4 shards to 8 shards requires migrating terabytes of data across the network.",
    "key_decisions": [
      "Selecting a Sharding Key with high cardinality and even traffic distribution (e.g., `user_id` or `tenant_id`)",
      "Adopting Consistent Hashing to minimize data migration during cluster expansion"
    ],
    "advantages": [
      "Enables unbounded write scaling and petabyte storage capacities"
    ],
    "disadvantages": [
      "Destroys ACID cross-shard transactions and makes relational joins virtually impossible"
    ],
    "common_mistakes": [
      "Sharding too early when vertical scaling and read replicas would have sufficed for 5 more years",
      "Picking a low-cardinality sharding key (like `country`), causing massive hot spots on large nations"
    ],
    "practical_examples": [
      "Instagram sharding their PostgreSQL databases by `user_id` with custom 64-bit ID generation"
    ],
    "related_topics": [
      "sql-databases",
      "nosql-databases",
      "sharding-strategies"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_24_1",
        "question": "What is a major architectural downside of sharding a relational database horizontally?",
        "options": [
          "You can no longer store strings",
          "Cross-shard JOINs and multi-shard transactions become slow, complex, and lose native atomic ACID guarantees",
          "Database backups are no longer permitted",
          "CPU usage drops to zero"
        ],
        "correct_option_index": 1,
        "explanation": "When data is split across different physical servers, relational JOINs require network scatter-gather queries, destroying performance and ACID simplicity."
      }
    ]
  },
  {
    "id": "sd_l2_25",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 25,
    "slug": "message-queues",
    "title": "Message Queues: Asynchronous Decoupling",
    "summary": "Point-to-point queues, publish-subscribe, backpressure absorption, at-least-once delivery, and dead-letter queues (RabbitMQ, SQS).",
    "estimated_minutes": 20,
    "content_markdown": "# Message Queues: Asynchronous Decoupling\n\nA **Message Queue** is an asynchronous communication buffer that decouples producer processes from consumer processes.\n\n### Why Message Queues are Indispensable\n1. **Asynchronous Processing**: An HTTP client submitting a video shouldn't wait 10 minutes while it transcodes. The API accepts the file, pushes an event to a queue, and returns `202 Accepted` in 15ms.\n2. **Backpressure & Spike Absorption**: If 50,000 orders arrive during Black Friday, synchronous databases crash. A message queue buffers the surge safely while worker fleets consume at a steady, sustainable rate.\n3. **Fault Isolation**: If the email delivery service goes down, the checkout service does not fail; email messages simply wait safely in the queue until the worker recovers.\n\n### Core Delivery Semantics\n- **At-most-once**: Messages may be lost, but never duplicated (Fire and forget).\n- **At-least-once**: Messages are guaranteed never to be lost, but may occasionally be re-delivered on network retries (**Consumers must be idempotent!**).\n- **Dead-Letter Queue (DLQ)**: Poison pill messages that fail processing after $N$ retry attempts are diverted to a DLQ for manual engineer inspection.",
    "key_decisions": [
      "Choosing point-to-point queue (RabbitMQ/SQS) vs append-only streaming log (Kafka)",
      "Configuring Dead-Letter Queue thresholds and retry backoffs"
    ],
    "advantages": [
      "Decouples microservices",
      "Smooths out peak traffic bursts without crashing backends"
    ],
    "disadvantages": [
      "Introduces asynchronous eventual consistency (clients cannot read results immediately)"
    ],
    "common_mistakes": [
      "Assuming message queues guarantee strictly FIFO order globally without throughput trade-offs",
      "Building non-idempotent consumers that double-charge credit cards when messages are re-delivered"
    ],
    "practical_examples": [
      "AWS SQS buffering image resizing jobs for an asynchronous worker fleet"
    ],
    "related_topics": [
      "background-workers",
      "event-driven-architecture",
      "idempotency"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_25_1",
        "question": "Why MUST consumers in an 'at-least-once' message queue system be idempotent?",
        "options": [
          "To ensure messages are encrypted",
          "Because network failures or timeouts during acknowledgement can cause messages to be delivered more than once",
          "To prevent queues from running out of disk space",
          "Because message queues do not support JSON"
        ],
        "correct_option_index": 1,
        "explanation": "If a consumer processes a message but the network drops the ACK packet, the queue will re-deliver the message. Idempotence ensures duplicate processing produces the same result."
      }
    ]
  },
  {
    "id": "sd_l2_26",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 26,
    "slug": "background-workers",
    "title": "Background Workers & Task Queues",
    "summary": "Asynchronous job executors, worker auto-scaling, long-running batch jobs, cron schedulers, and Celery/Sidekiq patterns.",
    "estimated_minutes": 15,
    "content_markdown": "# Background Workers & Task Queues\n\n**Background Workers** are autonomous backend processes dedicated to executing asynchronous, CPU-intensive, or delayed tasks off the main web request thread.\n\n### Common Worker Use Cases\n- Sending transactional emails, SMS alerts, and push notifications.\n- Video transcoding, image resizing, and OCR text extraction.\n- Generating heavy PDF invoices and accounting tax reports.\n- Nightly data aggregation, machine learning batch feature engineering, and database vacuuming.\n\n### Worker Fleet Scaling\nWorkers scale independently from web API servers:\n- Web servers scale based on incoming HTTP request volume.\n- Workers scale based on **Queue Depth (number of waiting messages)** and message processing latency.",
    "key_decisions": [
      "Separating interactive priority queues from low-priority bulk background queues",
      "Setting strict task timeouts to prevent zombie workers from hanging indefinitely"
    ],
    "advantages": [
      "Guarantees web API response times remain snappy (< 50ms) regardless of heavy background processing"
    ],
    "disadvantages": [
      "Requires monitoring queue lag to avoid silent job processing backlogs"
    ],
    "common_mistakes": [
      "Running long-running tasks inside the HTTP request handler, causing client browser gateway timeouts (504 Gateway Timeout)"
    ],
    "practical_examples": [
      "Celery workers in Python consuming tasks from Redis to process uploaded PDF documents asynchronously"
    ],
    "related_topics": [
      "message-queues",
      "application-servers"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_26_1",
        "question": "What is the primary operational metric used to auto-scale background worker fleets?",
        "options": [
          "HTTP Status 200 count",
          "Queue Depth (number of pending messages in the queue)",
          "Client screen resolution",
          "RAM on developer laptops"
        ],
        "correct_option_index": 1,
        "explanation": "Queue depth directly reveals backlog pressure. When messages accumulate faster than workers can process, the auto-scaler spawns more worker pods."
      }
    ]
  },
  {
    "id": "sd_l2_27",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 27,
    "slug": "object-storage",
    "title": "Object Storage (S3, GCS, Blob Storage)",
    "summary": "Key-value immutable binary blobs, metadata headers, storage tiers (Hot, Cold, Glacier), multipart uploads, and pre-signed URLs.",
    "estimated_minutes": 15,
    "content_markdown": "# Object Storage (S3, GCS, Blob Storage)\n\n**Object Storage** (Amazon S3, Google Cloud Storage, Azure Blob Storage) is a specialized flat storage architecture designed for massive, virtually infinite unstructured binary data (videos, images, backups, data lake files).\n\n### Object Storage vs Block Storage vs File Storage\n- **Block Storage (EBS, NVMe)**: Hard disks attached directly to a single operating system. Fastest, supports raw random read/write byte offsets, but cannot be shared across multiple servers.\n- **File Storage (NFS, EFS)**: Hierarchical folder structure accessible simultaneously by multiple servers via POSIX network protocols.\n- **Object Storage (S3)**: Flat namespace accessed via HTTP REST APIs (`GET /bucket/photo.jpg`). Highly scalable, 11 nines of durability (99.999999999%), but objects are immutable (to change one byte, you must re-upload the entire object).\n\n### Pre-Signed URLs: Offloading Uploads\nInstead of proxying a 2GB video upload through your web application servers (exhausting server RAM and bandwidth), the server generates a cryptographically signed **Pre-Signed S3 Upload URL**. The client browser uploads the file directly to S3!",
    "key_decisions": [
      "Lifecycle rules transitioning old objects to Cold Archive / Glacier to cut costs by 90%",
      "Using Multipart Uploads for large files > 100MB to enable parallel chunk uploads and pause/resume"
    ],
    "advantages": [
      "Limitless scale at lowest cost per gigabyte",
      "Built-in replication across 3 physical data centers"
    ],
    "disadvantages": [
      "Higher latency per request (10-30ms) than local NVMe disk",
      "Immutable objects cannot be modified in-place"
    ],
    "common_mistakes": [
      "Storing binary images directly inside relational database tables as SQL `BLOB` columns",
      "Making S3 buckets publicly readable by accident, leaking private customer documents"
    ],
    "practical_examples": [
      "Instagram storing billions of user photos in S3 buckets fronted by CloudFront CDN"
    ],
    "related_topics": [
      "cdn",
      "capacity-planning"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_27_1",
        "question": "What is the primary architectural advantage of using 'Pre-Signed URLs' for user file uploads?",
        "options": [
          "It automatically converts images to PNG",
          "Clients upload large binary files directly to Object Storage, bypassing application servers and saving server bandwidth and memory",
          "It makes files impossible to delete",
          "It eliminates the need for internet access"
        ],
        "correct_option_index": 1,
        "explanation": "Pre-Signed URLs allow secure direct-to-S3 uploads, keeping heavy binary file I/O completely off application server memory."
      }
    ]
  },
  {
    "id": "sd_l2_28",
    "level": 2,
    "level_name": "Core Components",
    "order_index": 28,
    "slug": "api-gateways",
    "title": "API Gateways: The Front Door",
    "summary": "Centralized authentication, rate limiting, request routing, protocol translation (REST to gRPC), SSL termination, and Kong/APISIX architectures.",
    "estimated_minutes": 20,
    "content_markdown": "# API Gateways: The Front Door\n\nAn **API Gateway** serves as the single point of entry for all external client traffic into a microservices or distributed backend architecture.\n\n### Core Cross-Cutting Responsibilities\n1. **Request Routing**: Directs client requests to appropriate internal microservices based on URL path, host header, or method.\n2. **Authentication & Authorization**: Validates OAuth2, JWT, or API keys at the boundary so downstream microservices receive pre-authenticated requests.\n3. **Rate Limiting & Throttling**: Enforces quotas per user/IP to prevent denial of service.\n4. **Protocol Translation**: Translates external public JSON REST requests into internal high-performance binary gRPC calls.\n5. **Circuit Breaking & Fallbacks**: Returns cached or default responses when internal microservices suffer outages.\n6. **Telemetry & Distributed Tracing**: Injects correlation IDs (`X-Correlation-ID`) into request headers for end-to-end distributed tracing across microservices.",
    "key_decisions": [
      "Deploying managed cloud gateways (AWS API Gateway) vs high-performance open-source proxies (Kong, Apache APISIX, Envoy)"
    ],
    "advantages": [
      "Prevents duplicating authentication and rate limiting logic across 50 separate microservices",
      "Shields internal microservice network topology from public exposure"
    ],
    "disadvantages": [
      "Becomes a single point of failure and potential latency bottleneck if not horizontally scaled"
    ],
    "common_mistakes": [
      "Putting heavy business logic or domain transformations into the API Gateway (the Gateway should remain thin and routing-focused)"
    ],
    "practical_examples": [
      "Kong API Gateway verifying client JWT tokens and forwarding requests to user, product, and payment microservices"
    ],
    "related_topics": [
      "reverse-proxies",
      "microservices",
      "rate-limiting"
    ],
    "knowledge_check": [
      {
        "id": "kc_l2_28_1",
        "question": "Why is it an anti-pattern to place heavy business logic inside an API Gateway?",
        "options": [
          "Gateways cannot run code",
          "It couples independent domain logic into a centralized bottleneck, turning the gateway into a fragile, slow distributed monolith",
          "Gateways only support HTTP GET requests",
          "Cloud vendors do not permit code in gateways"
        ],
        "correct_option_index": 1,
        "explanation": "API Gateways should focus strictly on cross-cutting concerns (routing, auth, rate limiting). Embedding business logic turns it into a slow, high-coupling bottleneck."
      }
    ]
  },
  {
    "id": "sd_l3_29",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 29,
    "slug": "distributed-system-fundamentals",
    "title": "Distributed System Fundamentals & Network Fallacies",
    "summary": "The 8 Fallacies of Distributed Computing, partial failures, network partitions, and independent clock skew.",
    "estimated_minutes": 20,
    "content_markdown": "# Distributed System Fundamentals & Network Fallacies\n\nA **Distributed System** is a collection of autonomous computing entities that communicate over a network to coordinate actions and achieve a shared objective.\n\n### The 8 Fallacies of Distributed Computing (L. Peter Deutsch)\nAll junior engineers falsely assume:\n1. **The network is reliable**: Networks drop packets, cables get severed, and switches crash.\n2. **Latency is zero**: Moving bytes over fiber optics takes finite milliseconds.\n3. **Bandwidth is infinite**: Network interfaces saturate under sudden load.\n4. **The network is secure**: Man-in-the-middle attacks and unencrypted packets are vulnerable.\n5. **Topology does not change**: Cloud routers and instances constantly re-route and migrate.\n6. **There is one administrator**: Different teams manage different firewalls and subnets.\n7. **Transport cost is zero**: Serialization and deserialization consume significant CPU.\n8. **The network is homogeneous**: Mixed versions of hardware, OS, and protocols coexist.\n\n### Partial Failures & The Asynchronous Network\nIn a single machine, if code crashes, the whole process dies cleanly.\nIn a distributed system, **Node A can send a message to Node B, and receive no reply**. Node A has no way of knowing:\n- Did the network drop the request?\n- Did Node B crash before processing?\n- Did Node B successfully process the request, but the network dropped the response?\nThis fundamental ambiguity requires **idempotency**, **timeouts**, and **retries**.",
    "key_decisions": [
      "Designing for inevitable network partitions and partial failure states from day one"
    ],
    "advantages": [
      "Enables horizontal scaling, global geographical presence, and hardware fault tolerance"
    ],
    "disadvantages": [
      "Drastically increases debugging complexity; traditional step-through debuggers cannot inspect distributed state"
    ],
    "common_mistakes": [
      "Assuming a missing HTTP response means the request was never executed on the backend server"
    ],
    "practical_examples": [
      "Handling network timeouts during payment authorization without double-charging the customer"
    ],
    "related_topics": [
      "cap-theorem",
      "idempotency",
      "circuit-breakers"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_29_1",
        "question": "If a client sends an HTTP request to create an order and the connection times out with no response, what must the client assume?",
        "options": [
          "The order was definitely created",
          "The order was definitely NOT created",
          "The outcome is unknown: the server may have committed the order, failed midway, or never received the packet; an idempotent retry is required",
          "The database has crashed"
        ],
        "correct_option_index": 2,
        "explanation": "In an asynchronous network, a timeout is an unknown state: the request could have succeeded right before the network dropped the return ACK."
      }
    ]
  },
  {
    "id": "sd_l3_30",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 30,
    "slug": "consistency-models",
    "title": "Consistency Models: Strong to Eventual",
    "summary": "Linearizability, Sequential Consistency, Causal Consistency, Read-Your-Writes, and Eventual Consistency spectrum.",
    "estimated_minutes": 25,
    "content_markdown": "# Consistency Models: Strong to Eventual\n\nIn distributed data stores, a **consistency model** defines the contract between the programmer and the system regarding the visibility and ordering of concurrent read and write operations.\n\n### The Spectrum of Consistency\n1. **Strong Consistency (Linearizability)**:\n   - Once a write is acknowledged as complete, all subsequent reads across all nodes globally are guaranteed to return that updated value or newer.\n   - Operations appear to take effect atomically at a single point in time on a single global timeline.\n   - *Cost*: High write latency; requires waiting on synchronous network quorums.\n2. **Causal Consistency**:\n   - Operations that are causally related must be seen by every node in the same order. Operations that are concurrent may be seen in different order.\n3. **Read-Your-Own-Writes Consistency**:\n   - A guarantee that if user $U$ updates data, any subsequent read by user $U$ will always reflect their update (even if other users temporarily see older data).\n   - Achieved by routing reads for modified entities to the leader node for a brief window.\n4. **Eventual Consistency**:\n   - If no new updates are made, all replicas will eventually converge to identical values.\n   - Replicas answer reads immediately without coordinating with the leader.\n   - *Superpower*: Lowest possible latency and highest availability.\n   - *Downside*: Temporary stale reads.",
    "key_decisions": [
      "Choosing Strong Consistency for financial balances vs Eventual Consistency for social media feeds"
    ],
    "advantages": [
      "Eventual consistency unlocks sub-10ms global read latency across multi-region datacenters"
    ],
    "disadvantages": [
      "Strong consistency causes requests to fail or stall if network partitions isolate replicas"
    ],
    "common_mistakes": [
      "Using eventual consistency for inventory counts, leading to overselling scarce concert tickets"
    ],
    "practical_examples": [
      "Amazon DynamoDB offering an explicit choice: `ConsistentRead=false` (cheaper, eventual) vs `ConsistentRead=true` (strong)"
    ],
    "related_topics": [
      "cap-theorem",
      "eventual-consistency",
      "database-replication"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_30_1",
        "question": "What is the primary user experience problem solved by 'Read-Your-Own-Writes' consistency?",
        "options": [
          "It makes the database 100% immune to hard drive failures",
          "It prevents a user from editing their profile, refreshing the page, and seeing their old data due to replication lag",
          "It encrypts user writes on disk",
          "It eliminates the need for primary keys"
        ],
        "correct_option_index": 1,
        "explanation": "Without Read-Your-Own-Writes, a user's browser may read from an asynchronous replica that hasn't caught up, making it look like their edit disappeared."
      }
    ]
  },
  {
    "id": "sd_l3_31",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 31,
    "slug": "cap-theorem",
    "title": "CAP Theorem & PACELC Trade-Offs",
    "summary": "Consistency, Availability, Partition Tolerance trade-offs, and the PACELC extension for normal latency trade-offs.",
    "estimated_minutes": 25,
    "content_markdown": "# CAP Theorem & PACELC Trade-Offs\n\nFormulated by Eric Brewer and proven by Gilbert and Lynch, the **CAP Theorem** states that any distributed data store can simultaneously provide at most two of the following three guarantees:\n\n1. **Consistency (C)**: Every read receives the most recent write or an error (Linearizability).\n2. **Availability (A)**: Every non-failing node returns a non-error response for every request (though it may not be the newest write).\n3. **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.\n\n### The Realistic Reality: P is Non-Negotiable!\nIn real physical networks, **network partitions (P) are an unavoidable physical reality**. Routers fail, fiber cables get severed, and cloud subnets lose connectivity.\nTherefore, the choice is **never 'CA'**. When a partition occurs, an architect MUST choose:\n- **CP (Consistency over Availability)**: Reject or block writes on partitioned nodes to prevent split-brain inconsistencies (e.g. Google Spanner, CockroachDB, Zookeeper).\n- **AP (Availability over Consistency)**: Allow nodes on both sides of the partition to accept writes and reads, accepting that data will diverge and must be merged later (e.g. Apache Cassandra, Couchbase).\n\n### Beyond CAP: The PACELC Theorem (Daniel Abadi)\nCAP only describes system behavior **during a rare network partition**. PACELC describes normal operations too:\n- **If there is a Partition (P)**, trade off **Availability (A)** vs **Consistency (C)**.\n- **Else (E)**, trade off **Latency (L)** vs **Consistency (C)**.\n*Example*: MongoDB is **PC/EC** (prefers consistency always). DynamoDB/Cassandra is **PA/EL** (prefers availability during partitions, and lowest latency during normal operations).",
    "key_decisions": [
      "Classifying subsystems into CP (Billing, Inventory) vs AP (Timeline, Comments, Analytics)"
    ],
    "advantages": [
      "Provides a rigorous theoretical framework for evaluating distributed database architectures"
    ],
    "disadvantages": [
      "Engineers often misinterpret CAP as a simplistic 'pick any two' menu; P is mandatory in distributed systems"
    ],
    "common_mistakes": [
      "Claiming a distributed system is 'CA' across multiple physical data centers (physically impossible under network cuts)"
    ],
    "practical_examples": [
      "ATM networks choosing AP: if the central bank connection is cut, the ATM dispenses cash up to a $200 emergency offline limit"
    ],
    "related_topics": [
      "consistency-models",
      "eventual-consistency",
      "distributed-transactions"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_31_1",
        "question": "Why is 'CA' (Consistency + Availability without Partition Tolerance) an illusion in distributed cloud systems?",
        "options": [
          "Because cloud providers prohibit CA systems",
          "Because physical networks will inevitably experience packet loss and partitions; when this happens, you must either sacrifice consistency or availability",
          "Because CA systems require quantum computing",
          "Because CA only applies to single-core CPUs"
        ],
        "correct_option_index": 1,
        "explanation": "Network partitions are unavoidable physical events in distributed systems. When nodes cannot communicate, you must choose to either reject requests (CP) or serve stale/divergent data (AP)."
      }
    ]
  },
  {
    "id": "sd_l3_32",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 32,
    "slug": "eventual-consistency",
    "title": "Eventual Consistency & Conflict Resolution",
    "summary": "Multi-master divergence, Last-Write-Wins (LWW) clock risks, Vector Clocks, and Conflict-Free Replicated Data Types (CRDTs).",
    "estimated_minutes": 20,
    "content_markdown": "# Eventual Consistency & Conflict Resolution\n\nIn an eventually consistent, multi-master, or decentralized system, multiple nodes can accept concurrent modifications to the same entity. When nodes synchronize, **conflicts are inevitable**.\n\n### Conflict Resolution Strategies\n1. **Last-Write-Wins (LWW)**:\n   - Uses the timestamp of the write; whichever has the higher physical clock timestamp overwrites earlier writes.\n   - *Fatal Flaw*: Physical clocks across servers drift (NTP clock skew); a server whose clock is 200ms fast can silently destroy valid user updates!\n2. **Vector Clocks / Version Vectors**:\n   - Each node maintains an internal logical clock counter. Updates capture a vector of counters (e.g. `[NodeA: 2, NodeB: 1]`).\n   - Enables the system to mathematically detect whether an update is an **ancestor** (clean overwrite) or a **concurrent branch** (conflict needing resolution).\n3. **CRDTs (Conflict-Free Replicated Data Types)**:\n   - Mathematical data structures (counters, sets, registers, text trees) designed so that any two replicas can merge in any order without coordination, **guaranteeing mathematical convergence without conflicts**!\n   - Powers real-time collaborative editors (Figma, Google Docs) and shopping carts (Amazon Dynamo).",
    "key_decisions": [
      "Choosing between automated CRDT convergence vs explicit application-level merge rules"
    ],
    "advantages": [
      "Zero lock contention across global nodes; seamless offline-first mobile synchronization"
    ],
    "disadvantages": [
      "Complex data structures and metadata storage overhead (tombstones for deleted items)"
    ],
    "common_mistakes": [
      "Relying on server wall-clock timestamps for Last-Write-Wins in financial systems"
    ],
    "practical_examples": [
      "Apple Notes and Figma using CRDTs to synchronize edits made by offline mobile clients"
    ],
    "related_topics": [
      "consistency-models",
      "cap-theorem"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_32_1",
        "question": "What is the primary danger of using 'Last-Write-Wins' (LWW) based on physical server timestamps for conflict resolution?",
        "options": [
          "It consumes excessive memory",
          "Clock skew across physical servers can cause newer legitimate writes to be silently overwritten and permanently deleted by an older write with a faster drifted clock",
          "It only works on numbers, not strings",
          "It requires manual user confirmation for every click"
        ],
        "correct_option_index": 1,
        "explanation": "Because physical computer clocks drift continuously, relying on timestamps means a node with a fast clock will continuously overwrite newer updates from correctly synchronized nodes."
      }
    ]
  },
  {
    "id": "sd_l3_33",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 33,
    "slug": "replication-strategies",
    "title": "Replication Strategies: Sync, Async & Semi-Sync",
    "summary": "Synchronous vs asynchronous vs semi-synchronous replication, quorum reads and writes (R + W > N), and split-brain fencing.",
    "estimated_minutes": 20,
    "content_markdown": "# Replication Strategies: Sync, Async & Semi-Sync\n\nHow database replicas synchronize data dictates the fundamental trade-off between write latency and durability risk.\n\n### Replication Protocols\n1. **Asynchronous Replication**:\n   - Primary commits transaction to disk, acknowledges client immediately, and pushes WAL updates to replicas in the background.\n   - *Pros*: Lowest write latency; replica slowness never blocks the writer.\n   - *Cons*: If primary dies before replica receives log, committed data is lost (RPO > 0).\n2. **Synchronous Replication**:\n   - Primary waits until ALL replicas confirm data has been written to their logs before acknowledging client.\n   - *Pros*: Zero data loss guarantee (RPO = 0).\n   - *Cons*: Write latency equals the slowest replica's round trip. If one replica hangs, the entire database freezes!\n3. **Semi-Synchronous Replication**:\n   - Primary waits for at least ONE replica to confirm receipt before committing.\n   - Balances safety and throughput.\n\n### Quorum Consensus Formula\nIn leaderless systems (Cassandra, DynamoDB) with $N$ replicas:\n- $W$ = Number of replicas that must confirm a write.\n- $R$ = Number of replicas that must be queried for a read.\n$$\\mathbf{R + W > N} \\implies \\text{Strong Consistency (Overlap guaranteed!)}$$\n*Example*: $N=3, W=2, R=2 \\implies R+W = 4 > 3$. A read is mathematically guaranteed to touch at least one replica holding the latest write!",
    "key_decisions": [
      "Choosing Quorum ($W=2, R=2$) for consistency vs ($W=1, R=1$) for extreme speed"
    ],
    "advantages": [
      "Tunable consistency allows matching exact business risk tolerances"
    ],
    "disadvantages": [
      "Synchronous replication makes write availability fragile to network blips"
    ],
    "common_mistakes": [
      "Setting $R=1, W=1$ on a cluster and expecting strong consistency"
    ],
    "practical_examples": [
      "MySQL Semi-Synchronous Replication ensuring at least one standby replica has the transaction log before client returns"
    ],
    "related_topics": [
      "database-replication",
      "consistency-models"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_33_1",
        "question": "In a cluster with N=5 replicas, which configuration guarantees strong consistency according to the Quorum formula (R + W > N)?",
        "options": [
          "W = 1, R = 1",
          "W = 2, R = 2",
          "W = 3, R = 3",
          "W = 1, R = 3"
        ],
        "correct_option_index": 2,
        "explanation": "With N=5, W=3 and R=3 yields R + W = 6 > 5. The read set and write set are mathematically guaranteed to overlap by at least one node."
      }
    ]
  },
  {
    "id": "sd_l3_34",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 34,
    "slug": "sharding-strategies",
    "title": "Consistent Hashing & Ring Partitions",
    "summary": "Hash ring topology, virtual nodes (vnodes), resolving hot spots, and minimizing key remapping during cluster resize.",
    "estimated_minutes": 25,
    "content_markdown": "# Consistent Hashing & Ring Partitions\n\nWhen scaling distributed caches (Memcached, Redis) or databases (Cassandra, DynamoDB), traditional modulo hashing (`hash(key) % N`) has a catastrophic flaw: **if you add or remove a single server node, almost 100% of keys remap to new servers**, causing a total cache blowout!\n\n### Consistent Hashing to the Rescue\nConsistent Hashing maps both **Server Nodes** and **Data Keys** onto a shared circular integer range (e.g., $0$ to $2^{32} - 1$, called the **Hash Ring**).\n\n### How It Works\n1. Hash server IP addresses onto positions on the ring.\n2. Hash incoming keys to positions on the ring.\n3. To find where a key lives: **Walk clockwise along the ring until you encounter the first server node**.\n4. **Node Addition/Removal**: When a new server joins, it only takes a fraction of keys from its immediate clockwise neighbor. **Only $K/N$ keys need to move** (where $K$ is total keys, $N$ is server count)!\n\n### Virtual Nodes (VNodes)\nTo prevent non-uniform distribution (hot spots where one physical server owns a huge slice of the ring), each physical server is assigned **100-256 Virtual Nodes** scattered across the ring. This balances load evenly across hardware.",
    "key_decisions": [
      "Configuring the number of virtual nodes per physical host based on memory capacity"
    ],
    "advantages": [
      "Scales cluster horizontally with minimal data re-sharding",
      "Gracefully handles node crashes without widespread data loss"
    ],
    "disadvantages": [
      "Requires maintaining and distributing a routing topology map across clients"
    ],
    "common_mistakes": [
      "Using simple modulo hashing on distributed caches, leading to 99% cache misses upon adding a server"
    ],
    "practical_examples": [
      "Discord and AWS DynamoDB using consistent hashing rings to partition real-time websocket connections and partition keys"
    ],
    "related_topics": [
      "database-partitioning",
      "caching"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_34_1",
        "question": "What is the primary advantage of Consistent Hashing over traditional modulo hashing (key % N) when a new server node is added?",
        "options": [
          "It makes cryptographic encryption obsolete",
          "Only approximately K/N keys need to be remapped to the new server, rather than remapping almost all keys across the cluster",
          "It eliminates the need for RAM",
          "It guarantees zero network latency"
        ],
        "correct_option_index": 1,
        "explanation": "Consistent hashing localizes key movement to immediate ring neighbors, preventing a global re-sharding catastrophe when cluster capacity expands."
      }
    ]
  },
  {
    "id": "sd_l3_35",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 35,
    "slug": "distributed-transactions",
    "title": "Distributed Transactions & Two-Phase Commit (2PC)",
    "summary": "Atomic cross-database commits, Prepare phase, Commit phase, coordinator single point of failure, and 3PC / Saga alternatives.",
    "estimated_minutes": 20,
    "content_markdown": "# Distributed Transactions & Two-Phase Commit (2PC)\n\nA **Distributed Transaction** is an atomic set of operations that updates data across two or more independent, networked databases.\n\n### The Two-Phase Commit (2PC) Protocol\nCoordinates multiple database participants through a central **Coordinator**:\n\n1. **Phase 1: Prepare Phase**\n   - Coordinator sends a `PREPARE` request to all participating nodes.\n   - Each participant executes the transaction locally up to the commit point, locks the affected rows, writes changes to their local transaction log, and replies `VOTE_COMMIT` or `VOTE_ABORT`.\n2. **Phase 2: Commit Phase**\n   - If **ALL** participants voted `VOTE_COMMIT`, Coordinator writes commit record to its log and sends `GLOBAL_COMMIT` to all nodes.\n   - If **ANY** participant voted `VOTE_ABORT` (or timed out), Coordinator broadcasts `GLOBAL_ROLLBACK`.\n   - Participants commit or rollback, release their locks, and acknowledge.\n\n### The Fatal Flaws of 2PC\n- **Blocking Protocol**: While waiting for Phase 2, all database rows remain locked. If the Coordinator crashes mid-commit, participants hang indefinitely, holding database locks and freezing system throughput!\n- **High Latency**: Requires multiple sequential network round-trips with forced disk syncs.\n- *Modern Solution*: Modern microservices avoid 2PC in favor of **Saga Patterns with Compensating Transactions**.",
    "key_decisions": [
      "Avoiding distributed 2PC in high-throughput microservices in favor of asynchronous Sagas"
    ],
    "advantages": [
      "Guarantees strict atomic consistency across multiple distinct storage engines"
    ],
    "disadvantages": [
      "Severe latency penalties and vulnerability to coordinator failure deadlocks"
    ],
    "common_mistakes": [
      "Using 2PC across public internet microservices with high network jitter"
    ],
    "practical_examples": [
      "X/Open XA distributed transactions across an Oracle DB and an IBM MQ queue"
    ],
    "related_topics": [
      "saga-patterns",
      "distributed-system-fundamentals"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_35_1",
        "question": "Why is Two-Phase Commit (2PC) rarely used in modern high-throughput web-scale microservices?",
        "options": [
          "It is illegal under GDPR",
          "It is a blocking protocol that holds distributed database locks across network round-trips, creating severe latency bottlenecks and deadlock risks if the coordinator fails",
          "It only works with MySQL",
          "It can only commit 1 row per day"
        ],
        "correct_option_index": 1,
        "explanation": "2PC holds locks on all participants until the coordinator confirms. If network delays or coordinator failures occur, locked tables can bring down the entire system."
      }
    ]
  },
  {
    "id": "sd_l3_36",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 36,
    "slug": "idempotency",
    "title": "Idempotency & Deduplication Keys",
    "summary": "Idempotency keys, unique database constraints, Stripe payment idempotency pattern, and distributed deduplication.",
    "estimated_minutes": 20,
    "content_markdown": "# Idempotency & Deduplication Keys\n\nAn operation is **idempotent** if performing it once produces the exact same result as performing it multiple times consecutively:\n\n$$f(f(x)) = f(x)$$\n\n### In HTTP Protocols:\n- `GET`, `PUT`, `DELETE` are inherently idempotent by specification.\n- `POST` is **NOT idempotent** (calling `POST /orders` 5 times creates 5 separate orders and charges the credit card 5 times!).\n\n### The Idempotency Key Pattern (The Stripe Standard)\n1. Client generates a unique cryptographically secure UUID (`Idempotency-Key: idemp_8a3f910b`) before making a payment call.\n2. Server receives request, opens a database transaction, and attempts to insert the key into an `idempotency_keys` table with a `UNIQUE` constraint.\n3. **If key does not exist**: Execute payment, save the response body in the table, commit, and return `200 OK`.\n4. **If key already exists**: Immediately return the previously saved response body without executing the payment again!\n5. If client network drops and client retries 3 times, the customer is guaranteed to be billed **exactly once**.",
    "key_decisions": [
      "Setting appropriate expiration TTL on idempotency keys (e.g. 24 hours in Redis/SQL)"
    ],
    "advantages": [
      "Prevents catastrophic double-billing, duplicate order creation, and race-condition data corruption"
    ],
    "disadvantages": [
      "Requires maintaining a deduplication storage tier"
    ],
    "common_mistakes": [
      "Using client-provided entity IDs that collision-hash or using timestamps as idempotency keys"
    ],
    "practical_examples": [
      "Stripe API requiring `Idempotency-Key` headers on all charge and refund endpoints"
    ],
    "related_topics": [
      "message-queues",
      "retry-policies",
      "distributed-transactions"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_36_1",
        "question": "How does an API server use an Idempotency Key to prevent duplicate credit card charges on network retries?",
        "options": [
          "By blocking all retries permanently",
          "By recording the unique idempotency key with a UNIQUE constraint; if a retry arrives with an existing key, the server returns the cached prior response without charging again",
          "By dividing the charge amount by the number of attempts",
          "By converting credit card numbers to Base64"
        ],
        "correct_option_index": 1,
        "explanation": "The idempotency key acts as a unique transaction token. Subsequent calls with the same key return the stored result of the first execution, preventing duplicate actions."
      }
    ]
  },
  {
    "id": "sd_l3_37",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 37,
    "slug": "retry-policies",
    "title": "Retry Policies: Exponential Backoff & Jitter",
    "summary": "Transient network recovery, exponential backoff math, Full Jitter vs Equal Jitter, and avoiding retry storms.",
    "estimated_minutes": 15,
    "content_markdown": "# Retry Policies: Exponential Backoff & Jitter\n\nWhen a distributed call fails due to a transient issue (brief network timeout, momentary database lock, CPU spike), the client should retry. However, **naive retries can destroy your infrastructure**.\n\n### The Danger: The Retry Storm (Self-Inflicted DDoS)\nIf a database has a 2-second hiccup and 10,000 clients immediately retry every 500ms, the database is hit with a tsunami of 20,000 requests just as it tries to recover, keeping it down forever!\n\n### 1. Exponential Backoff\nInstead of retrying immediately, double the wait duration on each attempt:\n\n$$t_{\\text{wait}} = \\text{base\\_delay} \\times 2^{\\text{attempt}}$$\n*(e.g., 100ms, 200ms, 400ms, 800ms, 1600ms, up to a max ceiling).*\n\n### 2. Full Jitter (The AWS Standard)\nEven with exponential backoff, all clients that failed at the same moment will retry at the exact same synchronized intervals (creating periodic spikes).\n**Jitter** introduces pseudo-random variation to break synchronization:\n\n$$t_{\\text{sleep}} = \\text{random}(0, \\min(\\text{max\\_delay}, \\text{base\\_delay} \\times 2^{\\text{attempt}}))$$\n\nAdding jitter spreads retry traffic into a smooth, manageable background distribution.",
    "key_decisions": [
      "Setting maximum retry ceilings (e.g. max 3 retries) before declaring failure to avoid thread exhaustion"
    ],
    "advantages": [
      "Enables automatic self-healing from transient network blips without human intervention"
    ],
    "disadvantages": [
      "Retrying non-transient errors (like HTTP 400 Bad Request or 401 Unauthorized) wastes server resources"
    ],
    "common_mistakes": [
      "Retrying on non-idempotent operations without an idempotency key",
      "Omitting jitter, causing waves of synchronized retry storms"
    ],
    "practical_examples": [
      "AWS SDK implementing Full Jitter exponential backoff on all DynamoDB and S3 client requests"
    ],
    "related_topics": [
      "circuit-breakers",
      "idempotency",
      "rate-limiting"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_37_1",
        "question": "Why is 'Jitter' (randomization) added to exponential backoff retry algorithms?",
        "options": [
          "To scramble passwords for security",
          "To desynchronize retrying clients, preventing them from hitting the recovering backend in waves of synchronized traffic spikes",
          "To make the network faster",
          "To prevent servers from sleeping"
        ],
        "correct_option_index": 1,
        "explanation": "Jitter spreads out retries randomly across a time window, breaking the lock-step synchronization that causes retry storms."
      }
    ]
  },
  {
    "id": "sd_l3_38",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 38,
    "slug": "circuit-breakers",
    "title": "Circuit Breakers (Closed, Open, Half-Open)",
    "summary": "Cascading failure prevention, failure thresholds, recovery probes, and Netflix Hystrix / Resilience4j patterns.",
    "estimated_minutes": 20,
    "content_markdown": "# Circuit Breakers (Closed, Open, Half-Open)\n\nIn distributed architectures, when a downstream service becomes unresponsive, upstream services calling it will block worker threads waiting for timeouts. Soon, upstream thread pools are depleted, causing a **cascading collapse of the entire microservice ecosystem**.\n\nA **Circuit Breaker** acts like an electrical fuse, monitoring calls and cutting off traffic to a failing service to allow it to recover.\n\n### The 3 Circuit Breaker States\n1. **Closed (Normal Operation)**:\n   - Requests pass through to the downstream service.\n   - The breaker measures success and failure rates.\n   - If failure rate exceeds threshold (e.g. 50% errors over 10 seconds), the breaker **TRIPS to OPEN**.\n2. **Open (Failing Fast)**:\n   - All incoming requests fail immediately **without making network calls**.\n   - The caller receives an instant fallback response (cached data or degraded UI).\n   - Downstream service gets zero traffic, allowing it to reboot and recover.\n   - A sleep timer starts (e.g. 30 seconds).\n3. **Half-Open (Testing Recovery)**:\n   - After the sleep timer expires, the breaker transitions to Half-Open.\n   - It permits a small canary sample of requests through.\n   - If the canary requests succeed, the breaker resets to **CLOSED**.\n   - If canary requests fail, it immediately trips back to **OPEN** for another sleep cycle.",
    "key_decisions": [
      "Defining fallback degraded responses (e.g. return cached profile instead of failing login)",
      "Setting failure rate thresholds and sliding time windows"
    ],
    "advantages": [
      "Halts cascading failures across service boundaries",
      "Provides instantaneous fail-fast response times to end users"
    ],
    "disadvantages": [
      "Requires monitoring and tuning state thresholds per service"
    ],
    "common_mistakes": [
      "Setting the failure threshold too sensitive, tripping on brief isolated network blips"
    ],
    "practical_examples": [
      "Resilience4j in Java wrapping calls from OrderService to PaymentService"
    ],
    "related_topics": [
      "retry-policies",
      "fault-tolerance",
      "observability"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_38_1",
        "question": "What does a Circuit Breaker do when it is in the 'OPEN' state?",
        "options": [
          "It opens extra network ports to increase bandwidth",
          "It immediately fails calls or executes fallback logic without sending any network requests to the downstream service",
          "It restarts the server operating system",
          "It deletes all cached database records"
        ],
        "correct_option_index": 1,
        "explanation": "When OPEN, the breaker fails fast locally to protect the downstream service from traffic and prevent upstream thread pool starvation."
      }
    ]
  },
  {
    "id": "sd_l3_39",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 39,
    "slug": "rate-limiting",
    "title": "Rate Limiting Algorithms",
    "summary": "Token Bucket, Leaky Bucket, Fixed Window Counter, Sliding Window Log, and Sliding Window Counter in Redis.",
    "estimated_minutes": 25,
    "content_markdown": "# Rate Limiting Algorithms\n\nA **Rate Limiter** controls the rate of traffic sent or received by a network or service, defending APIs against denial-of-service attacks, brute-force bots, and resource exhaustion.\n\n### The 5 Major Algorithms\n\n#### 1. Token Bucket (Most Popular)\n- A bucket holds a maximum capacity of $B$ tokens.\n- Tokens are added at a constant refill rate $r$ tokens/sec.\n- Each request consumes 1 token. If tokens are available, request passes. If bucket is empty, request is rejected (`429 Too Many Requests`).\n- *Advantage*: Supports bursts of traffic up to bucket capacity while keeping average rate bounded. Used by AWS and Stripe.\n\n#### 2. Leaky Bucket\n- Requests enter a FIFO queue (bucket) of capacity $B$ and leak out (are processed) at a constant, smooth rate.\n- If queue is full, new requests overflow and drop.\n- *Advantage*: Smooths out traffic into a perfectly steady output rate.\n\n#### 3. Fixed Window Counter\n- Divides time into fixed intervals (e.g. 1-minute windows) with a counter.\n- *Fatal Flaw*: Boundary burst problem! If limit is 100 req/min, a user can send 100 requests at 00:59 and another 100 requests at 01:00, pushing **200 requests in 2 seconds**!\n\n#### 4. Sliding Window Log\n- Stores timestamps of every request in a Redis Sorted Set (`ZSET`).\n- When a request arrives, remove all timestamps older than `now - window`.\n- Count remaining entries in set.\n- *Advantage*: Mathematically exact rate limiting with zero boundary burst flaws.\n- *Disadvantage*: High memory consumption storing timestamps for every single request.\n\n#### 5. Sliding Window Counter (Best Hybrid)\n- Approximates current window rate using weighted interpolation of previous window counter and current window counter:\n  $$\\text{Requests} = \\text{Current Count} + \\text{Previous Count} \\times (1 - \\text{Elapsed Fraction})$$\n- *Advantage*: Tiny memory footprint (2 counters) and smooth boundary protection.",
    "key_decisions": [
      "Choosing rate limit key granularity: by IP address, by User ID, or by API Key",
      "Implementing distributed rate limiting via Redis Lua scripts to prevent race conditions"
    ],
    "advantages": [
      "Prevents resource starvation and abusive scraping",
      "Enables tiered API monetization (Free vs Pro quotas)"
    ],
    "disadvantages": [
      "Adds millisecond lookup overhead to every incoming API request"
    ],
    "common_mistakes": [
      "Using a non-atomic Redis `GET` and `SET` without Lua scripts, leading to race-condition counter bypasses"
    ],
    "practical_examples": [
      "GitHub API limiting unauthenticated requests to 60/hr and authenticated requests to 5,000/hr using Token Bucket"
    ],
    "related_topics": [
      "api-gateways",
      "caching"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_39_1",
        "question": "What is the primary flaw of the 'Fixed Window Counter' rate limiting algorithm?",
        "options": [
          "It requires excessive CPU",
          "Traffic can burst up to 2x the limit at the boundary edges of adjacent windows (e.g., end of minute 1 and start of minute 2)",
          "It cannot count numbers higher than 100",
          "It only works on Windows operating systems"
        ],
        "correct_option_index": 1,
        "explanation": "Fixed Window counters allow up to twice the permitted quota across the boundary seam between two consecutive windows."
      }
    ]
  },
  {
    "id": "sd_l3_40",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 40,
    "slug": "service-discovery",
    "title": "Service Discovery & Health Checking",
    "summary": "Client-side vs server-side discovery, service registries (Consul, Eureka, Kubernetes DNS), and active vs passive health probes.",
    "estimated_minutes": 15,
    "content_markdown": "# Service Discovery & Health Checking\n\nIn dynamic cloud and containerized environments (Docker, Kubernetes), microservice instances spin up, crash, autoscale, and change IP addresses constantly. **Service Discovery** is the automated mechanism that allows services to find and communicate with each other without hardcoding IP addresses.\n\n### 1. Client-Side Discovery (e.g. Netflix Eureka)\n- Client queries the **Service Registry** directly to get a list of healthy IP addresses for `OrderService`.\n- Client runs its own load balancing algorithm (Round Robin) and connects directly to the chosen instance.\n- *Advantage*: Direct client-to-service connection without intermediate network proxy hop.\n- *Disadvantage*: Every programming language requires its own discovery SDK.\n\n### 2. Server-Side Discovery (e.g. Kubernetes ClusterIP & CoreDNS, AWS ALB)\n- Client makes request to a stable DNS name (`http://order-service`).\n- Request hits a router/proxy (like Kube-Proxy or an internal Load Balancer).\n- The router queries the registry and forwards the request to a healthy backend pod.\n- *Advantage*: Client code is completely agnostic of discovery logic; works with standard HTTP.\n\n### Health Checking Probes\n- **Liveness Probe**: Is the container process alive? If it fails, restart the container.\n- **Readiness Probe**: Is the container warmed up and ready to serve traffic (database connections connected, cache warmed)? If it fails, stop routing traffic to it, but don't restart it!",
    "key_decisions": [
      "Deploying Kubernetes native DNS discovery vs dedicated Consul service mesh"
    ],
    "advantages": [
      "Enables dynamic elasticity: services autoscale from 5 to 500 nodes without manual IP configuration"
    ],
    "disadvantages": [
      "The Service Registry itself is critical infrastructure that must be run as a resilient quorum cluster"
    ],
    "common_mistakes": [
      "Using a liveness probe that checks deep database dependencies; if the DB has a brief hiccup, Kubernetes restarts all 50 healthy app pods simultaneously!"
    ],
    "practical_examples": [
      "Kubernetes CoreDNS resolving `payments.default.svc.cluster.local` to active pod IPs"
    ],
    "related_topics": [
      "load-balancers",
      "microservices"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_40_1",
        "question": "What is the critical difference between a Kubernetes 'Liveness Probe' and a 'Readiness Probe'?",
        "options": [
          "Liveness checks RAM, Readiness checks CPU",
          "A failed Liveness probe restarts the container; a failed Readiness probe temporarily stops routing traffic to the container without restarting it",
          "Liveness is for databases only, Readiness is for web apps",
          "There is no difference"
        ],
        "correct_option_index": 1,
        "explanation": "Liveness determines if the process is deadlocked and needs a restart; Readiness determines if it's currently able to accept traffic (e.g., during warm-up)."
      }
    ]
  },
  {
    "id": "sd_l3_41",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 41,
    "slug": "leader-election",
    "title": "Leader Election & Split-Brain Prevention",
    "summary": "Primary coordination, consensus leases, fencing tokens, quorum math (N/2 + 1), and Zookeeper / etcd patterns.",
    "estimated_minutes": 20,
    "content_markdown": "# Leader Election & Split-Brain Prevention\n\nMany distributed systems designate a single node as **Leader** to coordinate writes, manage job scheduling, or assign shard ownership. **Leader Election** is the algorithmic process of dynamically picking one node as leader and electing a replacement if the leader dies.\n\n### The Nightmare: Split-Brain Syndrome\nIf a network partition isolates Node 1 from Nodes 2 and 3:\n- Nodes 2 and 3 think Node 1 died and elect Node 2 as new Leader.\n- Node 1 still thinks it is the Leader!\n- Both Node 1 and Node 2 accept conflicting writes, causing **irreversible data corruption**!\n\n### How to Prevent Split-Brain\n1. **Majority Quorum Rule**:\n   - A cluster must contain an **odd number of nodes** (3, 5, or 7).\n   - A leader can only be elected and can only commit writes if it communicates with a strict majority:\n     $$\\text{Quorum} = \\lfloor N / 2 \\rfloor + 1$$\n   - In a 3-node cluster, Quorum is $1 + 1 = 2$. If partitioned into [Node 1] and [Nodes 2, 3], only the partition with 2 nodes can operate! The isolated Node 1 abdicates.\n2. **Fencing Tokens**:\n   - Every time a new leader is elected, it receives a monotonically increasing number (**Fencing Token**, e.g. 34 -> 35).\n   - Storage servers reject any write carrying an older fencing token than the highest seen.",
    "key_decisions": [
      "Using existing consensus stores (etcd, Zookeeper) rather than attempting to write custom leader election code"
    ],
    "advantages": [
      "Guarantees deterministic coordination and prevents duplicate master writes"
    ],
    "disadvantages": [
      "Requires maintaining an odd number of consensus nodes"
    ],
    "common_mistakes": [
      "Running a 2-node cluster and expecting automatic failover without split-brain (2 nodes have no majority when split!)"
    ],
    "practical_examples": [
      "Kafka using KRaft / Raft metadata quorum to elect partition leaders"
    ],
    "related_topics": [
      "consensus-concepts",
      "fault-tolerance"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_41_1",
        "question": "Why do distributed consensus systems (like Raft, etcd, Zookeeper) recommend using an odd number of nodes (3, 5, 7)?",
        "options": [
          "Odd numbers compute hashes faster",
          "To guarantee that any network partition can have at most one majority sub-cluster, mathematically preventing split-brain",
          "Hardware manufacturers only discount servers in odd quantities",
          "Even numbers cause memory leaks in Linux"
        ],
        "correct_option_index": 1,
        "explanation": "An odd number of nodes ensures that any network partition divides into one majority and one minority. Only the majority can reach quorum, preventing dual leaders."
      }
    ]
  },
  {
    "id": "sd_l3_42",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 42,
    "slug": "consensus-concepts",
    "title": "Consensus Algorithms: Raft & Paxos",
    "summary": "State Machine Replication, Leader Election, Log Replication, Safety invariants, and Raft term numbers.",
    "estimated_minutes": 25,
    "content_markdown": "# Consensus Algorithms: Raft & Paxos\n\n**Distributed Consensus** is the fundamental algorithmic problem of getting multiple autonomous processes to agree on a single data value, transaction log, or state machine command across an unreliable network.\n\n### Paxos vs Raft\n- **Paxos (Leslie Lamport)**: The pioneering consensus algorithm. Mathematically elegant, but notoriously difficult to understand and implement correctly in production.\n- **Raft (Ongaro & Ousterhout)**: Engineered specifically for **understandability**. Decomposes consensus into 3 independent sub-problems:\n  1. **Leader Election**\n  2. **Log Replication**\n  3. **Safety Invariants**\n\n### Raft in Action:\n- Time is divided into **Terms** (arbitrary numbered periods).\n- Nodes exist in one of three states: **Follower**, **Candidate**, or **Leader**.\n- Followers expect regular heartbeat RPCs from the Leader. If a heartbeat times out, a follower increments its term and transitions to Candidate.\n- It votes for itself and broadcasts `RequestVote` RPCs. If it receives votes from a majority of nodes, it becomes Leader.\n- Clients send commands only to the Leader. The Leader appends command to its log and sends `AppendEntries` RPCs to followers. Once a majority write to disk, the command is **Committed**.",
    "key_decisions": [
      "Deploying etcd (Raft) for Kubernetes cluster state storage"
    ],
    "advantages": [
      "Guarantees 100% linearizable consistency across hardware crashes as long as a majority survive"
    ],
    "disadvantages": [
      "Throughput is limited by the speed of the single leader and majority network round-trips"
    ],
    "common_mistakes": [
      "Attempting to roll your own custom consensus algorithm instead of using vetted implementations (Raft, Paxos)"
    ],
    "practical_examples": [
      "etcd in Kubernetes, Consul in HashiCorp, CockroachDB ranges using Raft"
    ],
    "related_topics": [
      "leader-election",
      "consistency-models"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_42_1",
        "question": "In the Raft consensus algorithm, when is a log entry considered 'Committed'?",
        "options": [
          "When the client sends the HTTP request",
          "When the Leader has replicated the log entry to a strict majority of nodes in the cluster",
          "When all nodes including offline ones acknowledge",
          "After 24 hours have elapsed"
        ],
        "correct_option_index": 1,
        "explanation": "Once a majority of nodes have appended the entry to their local disk logs, the entry is safely committed and will never be overwritten."
      }
    ]
  },
  {
    "id": "sd_l3_43",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 43,
    "slug": "event-driven-architecture",
    "title": "Event-Driven Architecture & Pub/Sub",
    "summary": "Producers, consumers, message brokers, topics, fan-out, consumer groups, and event notifications vs event-carried state transfer.",
    "estimated_minutes": 20,
    "content_markdown": "# Event-Driven Architecture & Pub/Sub\n\nIn **Event-Driven Architecture (EDA)**, software components communicate by emitting and reacting to **Events**\u2014significant changes in state (e.g. `OrderPlaced`, `UserRegistered`, `PaymentAuthorized`).\n\n### Publish-Subscribe (Pub/Sub) vs Point-to-Point\n- **Point-to-Point**: Message goes to exactly one consumer (e.g. Task queue).\n- **Pub/Sub**: Publisher broadcasts event to a **Topic**. Multiple independent subscriber services receive their own copy of the event (**Fan-out**).\n\n### Event Styles\n1. **Event Notification**: Thin event containing only IDs (`{\"event\": \"ORDER_PLACED\", \"order_id\": 921}`).\n   - *Downside*: Consumers must make synchronous HTTP calls back to OrderService to fetch details.\n2. **Event-Carried State Transfer**: Rich event containing all necessary domain data (`{\"event\": \"ORDER_PLACED\", \"order_id\": 921, \"amount\": 99.00, \"user_id\": 42, \"items\": [...]}`).\n   - *Superpower*: Consumers update their own local read models without ever calling OrderService!",
    "key_decisions": [
      "Choosing Event-Carried State Transfer to decouple services vs Event Notification to minimize payload size"
    ],
    "advantages": [
      "Extreme loose coupling: new microservices can listen to existing events without altering producer code",
      "High scalability via asynchronous processing"
    ],
    "disadvantages": [
      "Event ordering and schema evolution across dozens of distributed consumers requires governance (Schema Registry)"
    ],
    "common_mistakes": [
      "Treating events as remote procedure calls (RPC) with tight expectations of immediate responses"
    ],
    "practical_examples": [
      "Apache Kafka streaming order events to Inventory, Notification, Analytics, and Billing services simultaneously"
    ],
    "related_topics": [
      "message-queues",
      "microservices"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_43_1",
        "question": "What is the primary architectural advantage of 'Event-Carried State Transfer'?",
        "options": [
          "It makes events smaller in size",
          "Consumers have all the data they need inside the event payload, eliminating the need to query the producer service via synchronous REST APIs",
          "It automatically creates SQL tables",
          "It guarantees zero CPU usage"
        ],
        "correct_option_index": 1,
        "explanation": "Carrying complete state inside the event decouples consumers completely, preventing cascading read dependencies on the producer."
      }
    ]
  },
  {
    "id": "sd_l3_44",
    "level": 3,
    "level_name": "Distributed Systems",
    "order_index": 44,
    "slug": "observability",
    "title": "Observability: Traces, Metrics & Logs",
    "summary": "The Three Pillars of Observability, OpenTelemetry, W3C TraceContext, log aggregation, and Prometheus metrics counters.",
    "estimated_minutes": 20,
    "content_markdown": "# Observability: Traces, Metrics & Logs\n\n**Observability** is the measure of how well the internal states of a system can be inferred from knowledge of its external outputs (telemetry).\n\n### The Three Pillars of Observability\n1. **Metrics (Aggregatable Numbers)**:\n   - Counters, Gauges, Histograms (e.g. CPU %, RPS, Error Rate, p99 Latency).\n   - High query speed and low storage overhead.\n   - *Best for*: Alerting and real-time dashboard visualization (Prometheus, Grafana).\n2. **Logs (Timestamped Events)**:\n   - Structured JSON records emitted by code detailing events and errors.\n   - *Best for*: Root-cause debugging of specific crashes (Elasticsearch, Fluentd, Kibana - ELK, Loki).\n3. **Distributed Tracing (Request Journeys)**:\n   - Tracks a single user request across 20 different microservices, databases, and message queues.\n   - Uses a **Trace ID** and **Span IDs** passed in HTTP headers (`traceparent` header - W3C TraceContext).\n   - *Best for*: Pinpointing exact latency bottlenecks in microservice call chains (Jaeger, OpenTelemetry).",
    "key_decisions": [
      "Adopting vendor-neutral OpenTelemetry (OTel) instrumentation across all languages",
      "Implementing trace sampling (e.g. record 5% of traces) to avoid terabytes of tracing telemetry costs"
    ],
    "advantages": [
      "Reduces Mean Time to Detection (MTTD) and Mean Time to Resolution (MTTR) from hours to minutes"
    ],
    "disadvantages": [
      "Telemetry generation and transmission consumes CPU, network bandwidth, and storage"
    ],
    "common_mistakes": [
      "Emitting unstructured plain text logs that cannot be parsed by log search tools",
      "Logging sensitive PII (passwords, credit card numbers, auth tokens)"
    ],
    "practical_examples": [
      "Using Jaeger to see that 95% of a 600ms page load was spent waiting on an unindexed PostgreSQL query"
    ],
    "related_topics": [
      "microservices",
      "latency-and-throughput"
    ],
    "knowledge_check": [
      {
        "id": "kc_l3_44_1",
        "question": "What is the primary role of a 'Trace ID' in distributed tracing?",
        "options": [
          "To identify user passwords",
          "To uniquely identify a single end-to-end request across every microservice, database, and queue it touches, enabling correlated timeline inspection",
          "To compress log files",
          "To generate CSS styles"
        ],
        "correct_option_index": 1,
        "explanation": "A Trace ID is propagated across network boundaries, allowing monitoring tools to stitch together spans from multiple microservices into one unified waterfall trace."
      }
    ]
  },
  {
    "id": "sd_l4_45",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 45,
    "slug": "microservices",
    "title": "Microservices Architecture Fundamentals",
    "summary": "Autonomous services, single responsibility, database-per-service pattern, domain-driven design, and independent deployability.",
    "estimated_minutes": 20,
    "content_markdown": "# Microservices Architecture Fundamentals\n\n**Microservices Architecture** arranges an application as a collection of loosely coupled, fine-grained, independently deployable services organized around business capabilities.\n\n### Core Commandments of True Microservices\n1. **Single Responsibility**: Each service models a bounded domain context (e.g. `BillingService`, `UserService`, `InventoryService`).\n2. **Database-per-Service**: Every microservice MUST own its private database! No other service is permitted to query another service's database directly. Communication happens strictly through public APIs or events.\n3. **Independent Deployability**: A team can deploy a change to `InventoryService` to production without coordinating or deploying any other service.\n4. **Decentralized Governance**: Different services can use different languages (polyglot) or database engines suited to their specific workload (e.g., Go for API, Python for ML, Cassandra for time-series).",
    "key_decisions": [
      "Enforcing strict database-per-service isolation vs sharing databases"
    ],
    "advantages": [
      "Enables hundreds of developers to ship code in parallel without blocking each other",
      "Targeted horizontal scaling of hot microservices"
    ],
    "disadvantages": [
      "Massive operational overhead: distributed tracing, network latency, distributed data consistency"
    ],
    "common_mistakes": [
      "Building a 'Distributed Monolith': separate microservices that all share the same monolithic SQL database"
    ],
    "practical_examples": [
      "Uber running thousands of microservices communicating over gRPC"
    ],
    "related_topics": [
      "monolith-vs-microservices",
      "api-gateways",
      "saga-patterns"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_45_1",
        "question": "Why is the 'Database-per-Service' pattern considered mandatory for microservices?",
        "options": [
          "To spend more money on database licenses",
          "To prevent tight data coupling; if services share a database, one team's schema change breaks other services, destroying independent deployability",
          "Because databases can only hold one table",
          "It is optional and discouraged"
        ],
        "correct_option_index": 1,
        "explanation": "Shared databases create implicit tight coupling. Database-per-service forces services to communicate via APIs, preserving autonomous deployments."
      }
    ]
  },
  {
    "id": "sd_l4_46",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 46,
    "slug": "monolith-vs-microservices",
    "title": "Monolith vs Microservices: The Pragmatic Choice",
    "summary": "When to choose a Modular Monolith, Conway's Law, operational tax, and the Strangler Fig migration pattern.",
    "estimated_minutes": 20,
    "content_markdown": "# Monolith vs Microservices: The Pragmatic Choice\n\nOne of the most consequential decisions in software engineering is choosing between a **Monolithic Architecture** and a **Microservices Architecture**.\n\n### The Monolith First Principle (Martin Fowler)\nAlmost all successful software systems (Shopify, Basecamp, GitHub, StackOverflow) started as **Monoliths**.\n- **Monolith Pros**: Single codebase, instant in-memory function calls ($0$ network latency), simple ACID transactions, frictionless local debugging, single CI/CD pipeline.\n- **Monolith Cons**: Deployment bottlenecks as team grows past 100 engineers; high blast radius (a memory leak in reporting crashes the entire app); cannot scale hot modules independently.\n\n### The Strangler Fig Migration Pattern\nNever attempt a 'Big Bang' total rewrite from monolith to microservices!\nUse the **Strangler Fig pattern**:\n1. Place an API Gateway in front of the monolith.\n2. Build a new microservice for a single bounded domain (e.g. `NotificationService`).\n3. Route `/notifications/*` traffic through the gateway to the new microservice.\n4. Incrementally strangle the monolith piece by piece over months/years until the old monolith is retired.",
    "key_decisions": [
      "Evaluating team size and organizational boundaries (Conway's Law) before migrating to microservices"
    ],
    "advantages": [
      "Prevents premature microservice operational complexity for early-stage startups"
    ],
    "disadvantages": [
      "Monoliths can devolve into 'Big Balls of Mud' if modular boundaries are not enforced by linting and packages"
    ],
    "common_mistakes": [
      "A 5-person startup adopting 30 microservices with Kubernetes, spending 80% of time debugging Helm charts instead of building features"
    ],
    "practical_examples": [
      "Shopify scaling their monolithic Ruby on Rails codebase to serve millions of storefronts through a modular monolith architecture"
    ],
    "related_topics": [
      "microservices",
      "what-is-system-design"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_46_1",
        "question": "What is the core strategy of the 'Strangler Fig' pattern when migrating away from a monolithic application?",
        "options": [
          "Shutting down the entire system and rebuilding from scratch over 2 years",
          "Incrementally replacing specific features with microservices behind an API gateway until the monolith is gradually phased out with zero downtime",
          "Deleting old code without testing",
          "Renaming functions in the monolith"
        ],
        "correct_option_index": 1,
        "explanation": "The Strangler Fig pattern avoids risky big-bang rewrites by peeling off features one by one behind a routing proxy."
      }
    ]
  },
  {
    "id": "sd_l4_47",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 47,
    "slug": "event-sourcing",
    "title": "Event Sourcing Pattern",
    "summary": "State as a sequence of immutable events, append-only event store, temporal queries, snapshots, and auditability.",
    "estimated_minutes": 25,
    "content_markdown": "# Event Sourcing Pattern\n\nTraditional CRUD applications store the **current state** of an entity in a database table: when a user changes their address, the row is overwritten with `UPDATE users SET address = '...'`. The old address is permanently erased!\n\nIn **Event Sourcing**, you do NOT store current state. You store an **immutable, append-only sequence of domain events**:\n- Event 1: `AccountCreated(id=1, balance=$0)`\n- Event 2: `MoneyDeposited(id=1, amount=$100)`\n- Event 3: `MoneyWithdrawn(id=1, amount=$30)`\n\nTo compute current state: **Replay all events from the beginning of time**: $0 + 100 - 30 = \\mathbf{\\$70}$.\n\n### Snapshots for Performance\nReplaying 500,000 events to compute a customer balance is slow.\nThe system periodically saves a **Snapshot** (e.g. at Event 10,000, Balance was $5,000). To compute current balance, load the snapshot and only replay events since the snapshot!\n\n### Superpowers of Event Sourcing\n- **100% Complete Audit Trail**: In banking, accounting, and healthcare, knowing *how* and *when* an entity arrived at its state is legally required.\n- **Time Travel**: You can reconstruct the exact state of the entire system as it existed on any date in the past!",
    "key_decisions": [
      "Pairing Event Sourcing with CQRS to provide fast read queries"
    ],
    "advantages": [
      "Zero data loss; append-only writes are blazing fast and free of database write-locks"
    ],
    "disadvantages": [
      "Schema migrations on immutable historical events are challenging; requires event versioning adapters"
    ],
    "common_mistakes": [
      "Using Event Sourcing for simple CRUD apps with no audit requirements, adding immense mental overhead"
    ],
    "practical_examples": [
      "Git version control (commits are an event log); financial banking ledgers"
    ],
    "related_topics": [
      "cqrs",
      "event-driven-architecture"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_47_1",
        "question": "What is stored in the database in an Event Sourced system?",
        "options": [
          "Only the current updated state of the entity",
          "An append-only log of immutable historical domain events describing every change that ever occurred",
          "Temporary files in /tmp",
          "Compiled C++ binaries"
        ],
        "correct_option_index": 1,
        "explanation": "Event Sourcing persists the immutable history of events rather than overwriting current state, enabling complete auditability and time travel."
      }
    ]
  },
  {
    "id": "sd_l4_48",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 48,
    "slug": "cqrs",
    "title": "CQRS (Command Query Responsibility Segregation)",
    "summary": "Splitting Write Command models from Read Query models, materialized views, asymmetric scaling, and eventual consistency.",
    "estimated_minutes": 25,
    "content_markdown": "# CQRS (Command Query Responsibility Segregation)\n\nIn traditional architectures, the same database model and schema is used to both write data (`INSERT/UPDATE`) and read data (`SELECT`).\n**CQRS** separates data modification operations (Commands) from data retrieval operations (Queries) into completely distinct models.\n\n### How CQRS Works\n1. **Command Side (Write)**:\n   - Optimized strictly for high-throughput write validation and business invariants.\n   - Example: Normal 3rd-normal-form relational SQL DB or Append-Only Event Store.\n   - Never handles complex search queries or dashboard aggregations.\n2. **Query Side (Read)**:\n   - Subscribes to events emitted by the Command Side and builds **Denormalized Materialized Views**.\n   - Example: Elasticsearch index for full-text search, Redis for point lookups, or an analytical read replica.\n   - Queries require **zero JOINs**; data is pre-assembled for the UI!\n\n### Why Asymmetric Scaling Matters\nIn most web platforms (e.g. Amazon, Twitter), **reads outnumber writes by 100:1 or 1,000:1**. CQRS allows you to run 2 small write instances and 50 auto-scaled read instances optimized independently!",
    "key_decisions": [
      "Accepting Eventual Consistency between the Command Side write and the Query Side projection update"
    ],
    "advantages": [
      "Blazing fast reads with zero multi-table SQL joins",
      "Independent scaling of write and read infrastructure"
    ],
    "disadvantages": [
      "Code duplication across two models; latency gap before query views catch up to commands"
    ],
    "common_mistakes": [
      "Applying CQRS everywhere across simple applications that have a 1:1 read/write ratio"
    ],
    "practical_examples": [
      "E-commerce product search: Writes go to PostgreSQL master, async pipeline streams updates to Elasticsearch cluster for instant faceted search"
    ],
    "related_topics": [
      "event-sourcing",
      "event-driven-architecture"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_48_1",
        "question": "What is the primary benefit of Command Query Responsibility Segregation (CQRS)?",
        "options": [
          "It eliminates the need for software testing",
          "It allows write models and read models to be optimized, stored, and scaled completely independently to match asymmetric read/write traffic",
          "It encrypts all network packets",
          "It forces all code to run on a single thread"
        ],
        "correct_option_index": 1,
        "explanation": "Separating writes from reads allows reads to be pre-joined into denormalized caches/search engines, perfectly matching 100:1 read-heavy ratios."
      }
    ]
  },
  {
    "id": "sd_l4_49",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 49,
    "slug": "saga-patterns",
    "title": "Saga Patterns: Choreography vs Orchestration",
    "summary": "Distributed transactions across microservices, compensating transactions, Choreography (event-driven) vs Orchestration (central controller).",
    "estimated_minutes": 25,
    "content_markdown": "# Saga Patterns: Choreography vs Orchestration\n\nWhen a business transaction spans multiple microservices (e.g. `OrderService` -> `PaymentService` -> `InventoryService` -> `ShippingService`), traditional 2PC distributed transactions block threads and fail under scale.\n\nA **Saga** is a sequence of local transactions where each service updates its local database and publishes an event that triggers the next step.\nIf a step fails (e.g., Credit Card Declined), the Saga executes **Compensating Transactions** backwards to undo previous steps (e.g., Un-reserve inventory, Cancel order)!\n\n### 1. Choreography-Based Saga (Decentralized)\n- Each service listens to events and decides when to act next.\n- *Flow*: `OrderService` emits `OrderCreated` -> `PaymentService` listens and emits `PaymentSucceeded` -> `InventoryService` listens and reserves stock.\n- *Advantage*: No single orchestrator bottleneck; pure event-driven loose coupling.\n- *Disadvantage*: Can become a chaotic 'spaghetti web' of events that is difficult to trace and visualize.\n\n### 2. Orchestration-Based Saga (Central Controller)\n- A dedicated **Saga Orchestrator** (e.g. Temporal, AWS Step Functions) manages the workflow state machine.\n- It sends commands to services: 'Execute Step 1'. When Step 1 replies success, it commands 'Execute Step 2'.\n- If Step 3 fails, the Orchestrator commands Compensating Transactions: 'Undo Step 2', 'Undo Step 1'.\n- *Advantage*: Centralized visibility, explicit error handling, and easy monitoring.\n- *Disadvantage*: Orchestrator can become an operational bottleneck.",
    "key_decisions": [
      "Choosing Choreography for small 2-3 service flows vs Orchestration for complex multi-step enterprise workflows"
    ],
    "advantages": [
      "Maintains business consistency across distributed microservices without blocking 2PC locks"
    ],
    "disadvantages": [
      "Requires writing complex compensating undo logic for every single service operation"
    ],
    "common_mistakes": [
      "Assuming compensating transactions restore original state identically (e.g. sending an email cannot be 'un-sent', you must send an apology email)"
    ],
    "practical_examples": [
      "Booking a vacation package: Reserving Flight, Hotel, and Car Rental in a Saga with automated rollback if the flight is unavailable"
    ],
    "related_topics": [
      "distributed-transactions",
      "microservices",
      "event-driven-architecture"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_49_1",
        "question": "What is a 'Compensating Transaction' in a Saga pattern?",
        "options": [
          "Paying overtime to software developers",
          "An explicit undo operation executed to reverse the business effects of a previous step when a subsequent step in the saga fails",
          "A transaction that compresses disk files",
          "A transaction that converts USD to Euros"
        ],
        "correct_option_index": 1,
        "explanation": "Because distributed sagas cannot perform atomic rollbacks, when step 3 fails, compensating actions (like un-reserving inventory) are triggered to cancel steps 1 and 2."
      }
    ]
  },
  {
    "id": "sd_l4_50",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 50,
    "slug": "stream-processing",
    "title": "Stream Processing: Kafka Streams & Apache Flink",
    "summary": "Bounded vs unbounded data, event time vs processing time, tumbling/sliding/session windows, and exactly-once processing.",
    "estimated_minutes": 25,
    "content_markdown": "# Stream Processing: Kafka Streams & Apache Flink\n\nTraditional data processing relies on **Batch Processing** (nightly ETL scripts processing static snapshots of yesterday's data).\n**Stream Processing** operates on **unbounded, continuous real-time data streams** as events occur.\n\n### Core Concepts\n1. **Event Time vs Processing Time**:\n   - *Event Time*: When the event physically occurred on the user's mobile device.\n   - *Processing Time*: When the event reached your server's CPU.\n   - *Watermarks*: Deal with out-of-order events arriving late due to mobile network lag.\n2. **Time Windows**:\n   - **Tumbling Window**: Fixed, non-overlapping windows (e.g. Count clicks every 5 minutes: 00:00-00:05, 00:05-00:10).\n   - **Sliding Window**: Overlapping windows (e.g. Average temperature over past 10 minutes, recalculated every 1 minute).\n   - **Session Window**: Groups events by user inactivity gaps (e.g. User visits site, clicks around, stops for 30 minutes).\n\n### Apache Kafka Streams vs Apache Flink\n- **Kafka Streams**: Lightweight Java client library; perfect for standard event filtering, enrichment, and microservice stream transformations.\n- **Apache Flink**: Heavyweight distributed cluster compute engine; excels at complex stateful stream processing, low-latency aggregations, and exactly-once event state recovery.",
    "key_decisions": [
      "Handling late-arriving out-of-order events using Watermark heuristics"
    ],
    "advantages": [
      "Instant real-time insights (fraud detection, dynamic pricing) in sub-second latency"
    ],
    "disadvantages": [
      "Maintaining distributed state across stream nodes requires complex state checkpointing (RocksDB)"
    ],
    "common_mistakes": [
      "Using processing time instead of event time, skewing metrics when mobile devices batch offline data"
    ],
    "practical_examples": [
      "Uber real-time surge pricing engine recalculating ride multipliers continuously based on active demand streams"
    ],
    "related_topics": [
      "event-driven-architecture",
      "data-pipelines"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_50_1",
        "question": "Why is 'Event Time' preferred over 'Processing Time' in financial fraud detection and analytics streams?",
        "options": [
          "Event time uses shorter string lengths",
          "Event time reflects the true physical moment the transaction occurred on the client device, unaffected by network transmission delays or processing queue backlogs",
          "Processing time requires GPS hardware",
          "Event time runs in UTC"
        ],
        "correct_option_index": 1,
        "explanation": "Processing time is vulnerable to network jitter and queue backpressure, distorting historical chronological accuracy."
      }
    ]
  },
  {
    "id": "sd_l4_51",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 51,
    "slug": "distributed-caching",
    "title": "Distributed In-Memory Caching (Redis Cluster)",
    "summary": "Redis Cluster architecture, 16384 hash slots, master-replica failover, gossip protocol, and cache replication.",
    "estimated_minutes": 20,
    "content_markdown": "# Distributed In-Memory Caching (Redis Cluster)\n\nWhen a single Redis node runs out of memory (RAM is limited to e.g. 128GB or 256GB) or single-threaded network throughput saturates at ~100,000 QPS, you must deploy a **Distributed Cache Cluster**.\n\n### Redis Cluster Architecture & Hash Slots\nRedis Cluster partitions data across master nodes without needing a central coordinator using **Hash Slots**:\n- The cluster defines exactly **16,384 Hash Slots** ($0$ to $16383$).\n- Every key is assigned to a slot using CRC16:\n  $$\\text{Slot} = \\text{CRC16}(\\text{key}) \\pmod{16384}$$\n- In a 3-master cluster:\n  - Master 1 owns slots $0 - 5460$.\n  - Master 2 owns slots $5461 - 10922$.\n  - Master 3 owns slots $10923 - 16383$.\n\n### Smart Clients & Redirection\nClients cache the slot-to-node routing table. If a client queries the wrong node, the node responds with a `MOVED 5461 10.0.0.2:6379` redirect, allowing the client to update its route map and query the correct master directly.",
    "key_decisions": [
      "Using Hash Tags `{user:123}:profile` and `{user:123}:orders` to force related keys into the exact same hash slot for multi-key operations"
    ],
    "advantages": [
      "Linear scaling of memory into terabytes of RAM and millions of operations per second"
    ],
    "disadvantages": [
      "Multi-key operations (`MGET`, transactions) fail unless keys share the same hash tag"
    ],
    "common_mistakes": [
      "Running heavy Lua scripts or unbounded `KEYS *` commands on a production Redis cluster, blocking the single-threaded event loop"
    ],
    "practical_examples": [
      "Twitter caching billions of user timeline tweet ID lists in Redis Cluster"
    ],
    "related_topics": [
      "caching",
      "sharding-strategies"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_51_1",
        "question": "How does Redis Cluster partition keys across multiple master nodes?",
        "options": [
          "By random assignment",
          "By mapping keys to 16,384 hash slots using CRC16(key) % 16384, with each master node owning a subset of the slots",
          "By storing all keys on every node simultaneously",
          "By sorting keys alphabetically"
        ],
        "correct_option_index": 1,
        "explanation": "Redis Cluster divides the key space into 16,384 hash slots distributed across master nodes, enabling transparent horizontal sharding."
      }
    ]
  },
  {
    "id": "sd_l4_52",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 52,
    "slug": "multi-region-architecture",
    "title": "Multi-Region Active-Active Architecture",
    "summary": "Cross-continent latency, DNS Geo-routing, multi-region database replication, conflict resolution, and data sovereignty.",
    "estimated_minutes": 25,
    "content_markdown": "# Multi-Region Active-Active Architecture\n\nFor global applications serving hundreds of millions of users across continents, running in a single data center introduces prohibitive physical network latency ($\u0007pprox 150-200ms$ cross-ocean round-trips). **Multi-Region Active-Active** deploys independent, fully operational infrastructure in multiple continents simultaneously.\n\n### The 3 Major Multi-Region Patterns\n1. **Read-Local, Write-Global (Easiest)**:\n   - Primary database lives in Region 1 (e.g. US).\n   - Replicas live in Europe and Asia.\n   - Users in Asia read locally with sub-10ms latency.\n   - *Downside*: Writes from Asia must cross the ocean to US primary.\n2. **Geo-Partitioned Active-Active (Optimal)**:\n   - European users' data lives in European DB cluster; US users' data lives in US cluster.\n   - Writes and reads stay 100% local.\n   - Complies natively with data residency regulations (GDPR).\n3. **Full Multi-Region Multi-Master (Hardest)**:\n   - Any region accepts writes for any user.\n   - Asynchronous replication synchronizes clusters globally.\n   - Requires CRDTs or strict conflict-resolution protocols.",
    "key_decisions": [
      "Deploying CockroachDB or Google Cloud Spanner with TrueTime atomic clocks for global distributed consistency"
    ],
    "advantages": [
      "Sub-20ms latency worldwide; catastrophic failure of an entire continent's cloud region has zero impact on other regions"
    ],
    "disadvantages": [
      "Massive cloud cross-region data transfer egress billing costs"
    ],
    "common_mistakes": [
      "Failing to account for GDPR legal requirements that mandate European citizen data must never leave EU borders"
    ],
    "practical_examples": [
      "Google Cloud Spanner using TrueTime atomic hardware clocks to provide globally distributed linearizable SQL transactions"
    ],
    "related_topics": [
      "disaster-recovery",
      "database-replication"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_52_1",
        "question": "What is the primary benefit of a Geo-Partitioned Multi-Region architecture?",
        "options": [
          "It allows computers to run without electricity",
          "Users read and write to local regional clusters near them for minimal latency, while strictly complying with local data sovereignty laws (like GDPR)",
          "It eliminates the need for software code",
          "It guarantees that all users speak the same language"
        ],
        "correct_option_index": 1,
        "explanation": "Geo-partitioning keeps data physically within the user's geographic region, slashing network round-trips and complying with privacy regulations."
      }
    ]
  },
  {
    "id": "sd_l4_53",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 53,
    "slug": "disaster-recovery",
    "title": "Disaster Recovery: RTO & RPO",
    "summary": "Recovery Time Objective (RTO), Recovery Point Objective (RPO), backup strategies, Backup and Restore vs Pilot Light vs Warm Standby.",
    "estimated_minutes": 20,
    "content_markdown": "# Disaster Recovery: RTO & RPO\n\n**Disaster Recovery (DR)** is a set of policies, tools, and procedures to enable the recovery or continuation of vital technology infrastructure following a natural or human-induced disaster (datacenter fire, ransomware, fiber cut).\n\n### The Two Golden Metrics\n1. **RPO (Recovery Point Objective)**:\n   - The maximum acceptable amount of data loss measured in time.\n   - *Question*: How much data are you willing to lose when a crash occurs?\n   - If backups run once every 24 hours, your **RPO is 24 hours** (all data since midnight is gone).\n   - If you use synchronous multi-AZ replication, your **RPO is 0 seconds**.\n2. **RTO (Recovery Time Objective)**:\n   - The maximum acceptable downtime duration to restore service.\n   - *Question*: How long can the business afford to be offline?\n   - If it takes 4 hours to download backups and rebuild servers, your **RTO is 4 hours**.\n\n### The 4 Disaster Recovery Strategies\n| Strategy | RTO | RPO | Cost | Description |\n|---|---|---|---|---|\n| **Backup & Restore** | Hours/Days | 24 Hours | $\\$$ | Store backups in S3; restore from scratch on disaster. |\n| **Pilot Light** | 10-30 Mins | Minutes | $\\$\\$$ | Core data replicated continuously to minimal standby DB; app servers spun up via terraform on disaster. |\n| **Warm Standby** | < 5 Mins | Seconds | $\\$\\$\\$$ | Scaled-down version of full environment always running in secondary region. |\n| **Multi-Site Active-Active** | Real-time (0s) | 0s | $\\$\\$\\$\\$$ | Full traffic served across multiple regions simultaneously. |",
    "key_decisions": [
      "Aligning DR strategy with business cost: Five 9s active-active costs 10x more than Pilot Light"
    ],
    "advantages": [
      "Protects enterprise survival against catastrophic datacenter losses"
    ],
    "disadvantages": [
      "Frequent disaster recovery drill testing is required to prove backups actually restore"
    ],
    "common_mistakes": [
      "Taking nightly database backups but never testing restoring them, only to discover backups are corrupted during a real disaster"
    ],
    "practical_examples": [
      "AWS Pilot Light architecture: Small RDS read replica in secondary region promoted to primary during regional outage"
    ],
    "related_topics": [
      "multi-region-architecture",
      "fault-tolerance"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_53_1",
        "question": "If a company requires an RPO (Recovery Point Objective) of near-zero, what database architecture must they implement?",
        "options": [
          "Nightly tape backups exported once a week",
          "Continuous synchronous or near-real-time streaming replication to a secondary region/availability zone",
          "Storing passwords in plaintext",
          "Running database vacuums twice per day"
        ],
        "correct_option_index": 1,
        "explanation": "An RPO near zero means almost no committed data can be lost, requiring continuous real-time replication of every transaction log."
      }
    ]
  },
  {
    "id": "sd_l4_54",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 54,
    "slug": "resilience-patterns",
    "title": "Resilience Patterns & Chaos Engineering",
    "summary": "Chaos Monkey, simulated latency injection, graceful degradation, bulkheads, and load shedding.",
    "estimated_minutes": 20,
    "content_markdown": "# Resilience Patterns & Chaos Engineering\n\nA system is resilient if it can withstand and recover rapidly from disruptive events. **Chaos Engineering** is the discipline of experimenting on a software system in production to build confidence in its capability to withstand turbulent conditions.\n\n### Principles of Chaos Engineering (Netflix)\n1. **Hypothesize**: Formulate a hypothesis about steady-state behavior (e.g. 'Killing 25% of backend containers will cause zero dropped user requests').\n2. **Inject Chaos**: Introduce realistic real-world disruptions (kill instances, inject 500ms network packet latency, sever database replica connection).\n3. **Measure**: Verify if steady-state metrics (orders/sec, error rate) remained stable.\n4. **Fix Vulnerabilities**: Automate self-healing where weaknesses were discovered.\n\n### Key Resilience Patterns\n- **Bulkhead Pattern**: Partition resources (thread pools, connection pools) into isolated compartments so one sinking compartment doesn't drag down the whole ship.\n- **Load Shedding**: When a server reaches 95% CPU, proactively drop low-priority background requests (`HTTP 503`) to protect critical core checkout paths from crashing.",
    "key_decisions": [
      "Running chaos experiments in production during business hours when engineering teams are available to respond"
    ],
    "advantages": [
      "Discovers insidious hidden failure modes before they cause customer-facing outages"
    ],
    "disadvantages": [
      "Requires high organizational maturity and robust automated rollback systems"
    ],
    "common_mistakes": [
      "Running chaos tests without automated safety switches (abort buttons)"
    ],
    "practical_examples": [
      "Netflix Chaos Monkey randomly terminating production EC2 instances to verify auto-scaling self-healing"
    ],
    "related_topics": [
      "circuit-breakers",
      "fault-tolerance"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_54_1",
        "question": "What is the primary architectural concept behind the 'Bulkhead Pattern'?",
        "options": [
          "Painting servers gray",
          "Isolating resources (like dedicated thread pools or process pools) per service so a failure or slowdown in one does not consume all resources and crash the entire host",
          "Merging all microservices into one file",
          "Disabling all firewall rules"
        ],
        "correct_option_index": 1,
        "explanation": "Like watertight bulkheads on a ship, partitioning thread pools ensures that a slow downstream dependency only exhausts its dedicated pool, leaving other services healthy."
      }
    ]
  },
  {
    "id": "sd_l4_55",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 55,
    "slug": "security-architecture",
    "title": "Security Architecture & Threat Modeling (STRIDE)",
    "summary": "STRIDE threat model, defense in depth, encryption at rest and in transit, secrets management, and least privilege.",
    "estimated_minutes": 20,
    "content_markdown": "# Security Architecture & Threat Modeling (STRIDE)\n\nSecurity is an essential non-functional requirement that must be designed into an architecture from inception, not bolted on as an afterthought.\n\n### The STRIDE Threat Model (Microsoft)\n| Threat | Violation | Mitigation |\n|---|---|---|\n| **Spoofing** | Authenticity | Mutual TLS (mTLS), JWT signatures, Multi-Factor Auth (MFA). |\n| **Tampering** | Integrity | Cryptographic hashes, digital signatures, HMAC, TLS encryption. |\n| **Repudiation** | Non-repudiation | Append-only tamper-evident audit logs, digital signatures. |\n| **Information Disclosure** | Confidentiality | Encryption at rest (AES-256), encryption in transit (TLS 1.3), data masking. |\n| **Denial of Service** | Availability | Rate limiting, token bucket algorithms, Cloudflare DDoS shielding. |\n| **Elevation of Privilege** | Authorization | Role-Based Access Control (RBAC), Principle of Least Privilege. |\n\n### Defense in Depth\nNever rely on a single defensive perimeter. Enforce security at the network edge (WAF), API gateway (JWT auth), service communication (mTLS), application logic (RBAC checks), and database tier (encrypted columns).",
    "key_decisions": [
      "Adopting centralized cloud secrets managers (HashiCorp Vault, AWS Secrets Manager) with automated rotation"
    ],
    "advantages": [
      "Prevents catastrophic data breaches, regulatory fines (GDPR/HIPAA), and brand destruction"
    ],
    "disadvantages": [
      "Rigorous encryption and token verification introduces small compute overhead"
    ],
    "common_mistakes": [
      "Hardcoding database passwords or API private keys inside Git source code repositories"
    ],
    "practical_examples": [
      "Using AWS KMS to generate and automatically rotate envelope encryption keys for S3 customer records"
    ],
    "related_topics": [
      "zero-trust-principles",
      "api-gateways"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_55_1",
        "question": "In the STRIDE threat model, which security threat describes an attacker modifying database rows in transit?",
        "options": [
          "Spoofing",
          "Tampering",
          "Repudiation",
          "Elevation of Privilege"
        ],
        "correct_option_index": 1,
        "explanation": "Tampering violates data integrity by altering data in transit or storage without authorization. It is mitigated by TLS and cryptographic checksums."
      }
    ]
  },
  {
    "id": "sd_l4_56",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 56,
    "slug": "zero-trust-principles",
    "title": "Zero-Trust Architecture & Mutual TLS (mTLS)",
    "summary": "Never Trust, Always Verify, identity-based perimeters, mutual TLS certificate exchange, and service mesh sidecars (Istio).",
    "estimated_minutes": 20,
    "content_markdown": "# Zero-Trust Architecture & Mutual TLS (mTLS)\n\nTraditional network security followed the **Castle-and-Moat** model: trust everything inside the internal corporate intranet, and distrust everything outside.\n*The Fatal Flaw*: Once an attacker penetrates the perimeter firewall, they have free, unhindered access to move laterally across all internal databases and servers!\n\n### Zero-Trust Axiom: Never Trust, Always Verify\nZero-Trust assumes the internal network is already compromised. Every single request\u2014even between two internal microservices sitting on the same physical rack\u2014must be **authenticated**, **authorized**, and **encrypted**.\n\n### Mutual TLS (mTLS) in Action\n- In standard TLS, only the server proves its identity with a certificate.\n- In **mTLS (Mutual TLS)**, **both the client and the server present cryptographic X.509 certificates** to each other during the TLS handshake.\n- *Result*: Service A verifies it is talking to authentic Service B, Service B verifies it is talking to authentic Service A, and the entire payload is cryptographically encrypted in transit!\n- Typically automated transparently using **Service Mesh Sidecars** (Istio, Linkerd).",
    "key_decisions": [
      "Deploying a Service Mesh (Istio Envoy sidecars) to automate certificate issuance and rotation"
    ],
    "advantages": [
      "Completely eliminates lateral movement by attackers who breach the perimeter"
    ],
    "disadvantages": [
      "Service mesh sidecars add 1-3ms latency overhead per hop and require substantial memory"
    ],
    "common_mistakes": [
      "Allowing internal microservices to communicate over plain unencrypted HTTP because 'they are inside the private VPC'"
    ],
    "practical_examples": [
      "Google BeyondCorp and Istio service mesh enforcing mTLS across all Kubernetes pods"
    ],
    "related_topics": [
      "security-architecture",
      "microservices"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_56_1",
        "question": "What is the defining mechanism of Mutual TLS (mTLS) compared to standard one-way TLS?",
        "options": [
          "mTLS runs twice as fast",
          "Both the client and the server cryptographically verify each other's digital certificates, establishing bilateral identity and encrypted communication",
          "mTLS does not require certificates",
          "mTLS only works on wireless networks"
        ],
        "correct_option_index": 1,
        "explanation": "In mTLS, both parties authenticate each other via certificates, ensuring no unauthenticated or rogue pod can communicate inside the cluster."
      }
    ]
  },
  {
    "id": "sd_l4_57",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 57,
    "slug": "data-pipelines",
    "title": "Large-Scale Data Pipelines: Lambda vs Kappa",
    "summary": "Batch processing (Hadoop/Spark), stream processing (Flink), Lambda architecture dual-layer vs Kappa single-stream architecture.",
    "estimated_minutes": 20,
    "content_markdown": "# Large-Scale Data Pipelines: Lambda vs Kappa\n\nModern enterprises ingest terabytes to petabytes of event telemetry every day. Designing data pipelines to process, enrich, and aggregate this data requires choosing an architectural pipeline paradigm.\n\n### 1. The Lambda Architecture (Nathan Marz)\nBalances low-latency real-time views with comprehensive historical accuracy using dual layers:\n- **Speed Layer (Stream)**: Processes recent streaming data in real-time (Apache Flink/Storm) to provide instant low-latency views (compromises accuracy for speed).\n- **Batch Layer (Cold)**: Stores raw immutable master data (HDFS/S3). Nightly batch jobs (Apache Spark) compute comprehensive, highly accurate aggregated views.\n- **Serving Layer**: Merges queries across both speed and batch views.\n- *Major Flaw*: Developers must write and maintain identical business logic in two separate codebases (e.g. Java Flink for streaming, and Scala Spark for batch)!\n\n### 2. The Kappa Architecture (Jay Kreps)\nEliminates dual codebases by processing **everything as a continuous stream**:\n- All data is ingested into an append-only, distributed streaming log (Apache Kafka) with long retention.\n- A single stream processing engine (Apache Flink) processes all real-time events.\n- To recompute historical data after a bug fix: Simply spin up a new consumer instance and **replay the Kafka stream from offset 0**!",
    "key_decisions": [
      "Adopting Kappa architecture to eliminate duplicate code maintenance across batch and stream engines"
    ],
    "advantages": [
      "Processes billions of events daily into data lakes (Snowflake, BigQuery, Delta Lake)"
    ],
    "disadvantages": [
      "Maintaining historical streaming logs requires massive distributed disk storage"
    ],
    "common_mistakes": [
      "Building a complex Lambda architecture when a simple hourly batch pipeline would have satisfied all reporting needs"
    ],
    "practical_examples": [
      "Uber and LinkedIn processing trillions of user events daily using Kappa architectures on Apache Kafka"
    ],
    "related_topics": [
      "stream-processing",
      "event-driven-architecture"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_57_1",
        "question": "What is the primary architectural simplification of the Kappa Architecture over the Lambda Architecture?",
        "options": [
          "It replaces all code with Python",
          "It eliminates the separate batch processing layer, using a single stream processing engine and replaying historical logs when re-computation is needed",
          "It requires no data storage",
          "It only runs on weekends"
        ],
        "correct_option_index": 1,
        "explanation": "Kappa avoids maintaining dual codebases for batch and streaming by treating all data as a continuous stream that can be replayed from offset 0."
      }
    ]
  },
  {
    "id": "sd_l4_58",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 58,
    "slug": "real-time-systems",
    "title": "Real-Time Systems: WebSockets, SSE & WebRTC",
    "summary": "Full-duplex persistent connections, Server-Sent Events (SSE), WebRTC peer-to-peer data channels, connection heartbeats, and horizontal socket routing.",
    "estimated_minutes": 20,
    "content_markdown": "# Real-Time Systems: WebSockets, SSE & WebRTC\n\nTraditional web architecture relies on short-lived request-response polling. When building chat apps, stock tickers, or collaborative whiteboards, continuous HTTP polling (`GET /messages` every 1s) wastes bandwidth and server CPU.\n\n### Real-Time Communication Protocols\n1. **WebSockets (`ws://`, `wss://`)**:\n   - Upgrades an HTTP connection to a persistent, full-duplex, bidirectional TCP socket.\n   - Tiny frame overhead (2-10 bytes instead of 800-byte HTTP headers).\n   - Server can push data to client at any millisecond; client can send data to server on the same open socket.\n   - *Best for*: Chat apps, multiplayer gaming, financial trading terminals.\n2. **Server-Sent Events (SSE)**:\n   - Unidirectional persistent HTTP streaming connection from server to client.\n   - Built over standard HTTP/2; automatically handles reconnection and firewall traversal.\n   - *Best for*: Stock price tickers, news feeds, LLM AI token streaming (ChatGPT).\n3. **WebRTC**:\n   - Peer-to-peer UDP encrypted connection between two browsers (signaling handled via WebSocket).\n   - *Best for*: Ultra-low latency audio/video calling (Zoom, Google Meet).\n\n### Scaling WebSockets Horizontally\nBecause WebSocket connections are stateful, long-lived TCP connections tied to a specific physical server, **User A on Server 1 cannot talk to User B on Server 2 directly**.\n*Solution*: Use an **in-memory Pub/Sub message broker (Redis Pub/Sub)**. When Server 1 receives a message, it publishes to Redis; Server 2 receives the event from Redis and pushes it down its local WebSocket connection to User B!",
    "key_decisions": [
      "Choosing Server-Sent Events (SSE) for unidirectional streaming vs WebSockets for bidirectional duplex interaction"
    ],
    "advantages": [
      "Sub-20ms instant delivery of real-time events without polling latency"
    ],
    "disadvantages": [
      "Long-lived connections consume server file descriptors and memory; load balancing requires Least Connections"
    ],
    "common_mistakes": [
      "Using short-polling for chat apps, creating millions of empty `GET` requests that swamp the database"
    ],
    "practical_examples": [
      "ChatGPT streaming LLM completion tokens over Server-Sent Events (SSE); Slack using WebSockets for real-time messaging"
    ],
    "related_topics": [
      "message-queues",
      "load-balancers"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_58_1",
        "question": "How do distributed architectures route a real-time message between two users connected to different physical WebSocket server instances?",
        "options": [
          "By asking the users to refresh their browsers",
          "By using a shared backplane message broker (like Redis Pub/Sub) that broadcasts the message to the specific server hosting the recipient's socket",
          "By rebooting the load balancer",
          "By writing the message to tape backup"
        ],
        "correct_option_index": 1,
        "explanation": "A shared Pub/Sub message bus (like Redis or Kafka) bridges stateful WebSocket servers, forwarding messages to whichever server holds the destination socket."
      }
    ]
  },
  {
    "id": "sd_l4_59",
    "level": 4,
    "level_name": "Advanced Architecture",
    "order_index": 59,
    "slug": "multi-tenant-systems",
    "title": "Multi-Tenant Architecture & Data Isolation",
    "summary": "SaaS architectures, Tenant isolation models (Pool vs Silo vs Bridge), noisy neighbor mitigation, and row-level security (RLS).",
    "estimated_minutes": 20,
    "content_markdown": "# Multi-Tenant Architecture & Data Isolation\n\nIn B2B Software-as-a-Service (SaaS), **Multi-Tenancy** is the architecture where a single instance of a software application serves multiple distinct customer organizations (tenants).\n\n### The 3 Tenant Isolation Models\n1. **Silo Model (Database-per-Tenant)**:\n   - Every tenant has its own isolated, physically separate database.\n   - *Pros*: Maximum security, regulatory compliance (healthcare, banking), zero noisy neighbors.\n   - *Cons*: Expensive infrastructure costs; running schema migrations across 1,000 separate databases is an operational nightmare.\n2. **Pool Model (Shared Database, Shared Schema)**:\n   - All tenants share the same database tables. Every table includes a `tenant_id` column.\n   - *Pros*: Lowest infrastructure cost, simplest operational maintenance and deployment.\n   - *Cons*: High risk of accidental data leakage if a developer omits `WHERE tenant_id = ?`; vulnerable to **Noisy Neighbor syndrome** (one huge customer saturates the database CPU for all other customers).\n3. **Bridge Model (Hybrid)**:\n   - Small tenants share pooled tables; enterprise VIP tenants get dedicated silo databases.\n\n### Row-Level Security (PostgreSQL RLS)\nTo prevent accidental data leakage in the Pool Model, PostgreSQL provides **Row-Level Security (RLS)**:\n- The database engine automatically injects `tenant_id = current_setting('app.current_tenant_id')` into every query at the kernel level, making cross-tenant data leaks mathematically impossible!",
    "key_decisions": [
      "Adopting PostgreSQL Row-Level Security (RLS) to safely pool tenants while guaranteeing cryptographically enforced isolation"
    ],
    "advantages": [
      "Dramatically reduces infrastructure hosting costs per SaaS customer",
      "Centralizes software updates"
    ],
    "disadvantages": [
      "Requires strict per-tenant rate limiting to prevent Noisy Neighbor starvation"
    ],
    "common_mistakes": [
      "Relying solely on application-level `WHERE tenant_id = ?` filters without database-enforced Row-Level Security"
    ],
    "practical_examples": [
      "Salesforce and Slack hosting thousands of enterprise tenants on multi-tenant pooled database clusters with RLS"
    ],
    "related_topics": [
      "security-architecture",
      "database-partitioning"
    ],
    "knowledge_check": [
      {
        "id": "kc_l4_59_1",
        "question": "What is the 'Noisy Neighbor' problem in multi-tenant SaaS architectures?",
        "options": [
          "Servers making loud physical noises in the datacenter",
          "One high-volume tenant consuming disproportionate CPU, memory, or database I/O, causing latency degradation for other tenants sharing the same infrastructure",
          "Neighbors complaining about Wi-Fi",
          "Duplicate records in a database"
        ],
        "correct_option_index": 1,
        "explanation": "In shared pooled architectures, a sudden traffic spike from a single tenant can monopolize shared resources, degrading performance for all other tenants."
      }
    ]
  },
  {
    "id": "sd_l5_60",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 60,
    "slug": "interview-step-1-clarifying-requirements",
    "title": "Step 1: Clarifying Requirements & Scoping",
    "summary": "Asking the right questions, defining 3-4 core features, establishing non-goals, and securing alignment in the first 5 minutes.",
    "estimated_minutes": 15,
    "content_markdown": "# Step 1: Clarifying Requirements & Scoping (Minutes 0 - 5)\n\nSystem design interview prompts are **intentionally ambiguous** (e.g. *'Design Twitter'*, *'Design YouTube'*). The interviewer is testing whether you jump blindly into implementation or proactively ask clarifying questions like a senior staff engineer.\n\n### The 4-Question Clarification Framework\n1. **Target Audience & Devices**: Who are the primary users? (Mobile apps, web browsers, IoT devices, or internal enterprise services?)\n2. **Core Capabilities**: What are the top 3-4 absolute must-have features for the MVP?\n   - *Example (Twitter)*: Post a tweet, view home timeline, view user profile timeline, follow a user.\n3. **Non-Goals (Crucial!)**: What are we explicitly **NOT** building today?\n   - *Example*: Direct messaging, live video streaming, and ad networks are out of scope for the next 40 minutes.\n4. **Scale & Geography**: Is this service localized to one city or distributed globally across millions of daily active users?",
    "key_decisions": [
      "Writing down functional requirements and non-goals visibly on the whiteboard/workspace"
    ],
    "advantages": [
      "Prevents wasting 30 minutes designing features the interviewer does not care about",
      "Demonstrates executive maturity and leadership"
    ],
    "disadvantages": [
      "Spending more than 6-7 minutes on requirements eats into architecture design time"
    ],
    "common_mistakes": [
      "Immediately drawing a Load Balancer and Database in minute 1 without asking a single question"
    ],
    "practical_examples": [
      "Interviewer asks to 'Design Netflix' -> Candidate clarifies: 'Are we focusing on the video upload/transcoding pipeline, or the consumer video streaming and playback recommendation flow?'"
    ],
    "related_topics": [
      "functional-requirements",
      "non-functional-requirements"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_60_1",
        "question": "What is the single most important action in the first 5 minutes of a System Design interview?",
        "options": [
          "Writing Python code for binary search",
          "Asking targeted clarifying questions to define 3-4 core functional requirements, explicit non-goals, and operational scale before drawing any architecture",
          "Memorizing cloud pricing",
          "Refusing to talk until the interviewer speaks"
        ],
        "correct_option_index": 1,
        "explanation": "Clarifying requirements and establishing non-goals ensures you and the interviewer are aligned on scope before investing time in architecture."
      }
    ]
  },
  {
    "id": "sd_l5_61",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 61,
    "slug": "interview-step-2-scale-estimation",
    "title": "Step 2: Scale Estimation & Resource Math",
    "summary": "Fast mental math, converting DAU to RPS, calculating storage growth over 5 years, memory caching needs, and network bandwidth.",
    "estimated_minutes": 20,
    "content_markdown": "# Step 2: Scale Estimation & Resource Math (Minutes 5 - 10)\n\nBack-of-the-envelope calculations are not an academic math quiz; they dictate your **storage engine, caching tier, and partitioning strategy**.\n\n### The Rapid Mental Math Template\nSuppose an interviewer specifies: **100 Million Daily Active Users (DAU)**.\n\n1. **Traffic (RPS)**:\n   - Assume each user performs 10 actions/day $\\implies 1 \\text{ Billion daily requests}$.\n   - Average RPS: $1,000,000,000 / 100,000 \\approx \\mathbf{10,000\\text{ RPS}}$.\n   - Peak Factor (2x): $\\mathbf{20,000\\text{ Peak RPS}}$.\n2. **Storage (5-Year Horizon)**:\n   - If write payload is 500 bytes:\n   - Daily storage: $10\\text{M writes} \\times 500\\text{ bytes} = 5\\text{ GB/day}$.\n   - 5-Year Storage: $5\\text{ GB} \\times 365 \\times 5 \\approx \\mathbf{9.1\\text{ TB}}$.\n   - *Verdict*: 9.1 TB easily fits on a single modern high-capacity database with replication! Sharding is not mandatory for storage, though it may be needed for write IOPS.\n3. **RAM Caching (80/20 Rule)**:\n   - 20% of daily reads generate 80% of traffic.\n   - Cache memory required: $20\\% \\text{ of daily active data} = 0.2 \\times 5\\text{ GB} = \\mathbf{1\\text{ GB RAM}}$ (Trivial for a single Redis node!).",
    "key_decisions": [
      "Rounding 86,400 to 100,000 to keep mental math rapid and error-free",
      "Stating assumptions clearly out loud to the interviewer"
    ],
    "advantages": [
      "Immediately proves whether standard databases suffice or if sharding is required"
    ],
    "disadvantages": [
      "Getting bogged down in decimal places wastes precious interview minutes"
    ],
    "common_mistakes": [
      "Panicking over exact calculations; interviewers look for reasonable orders of magnitude, not 6 decimal places of precision"
    ],
    "practical_examples": [
      "Quickly demonstrating that 2,000 writes/sec requires database partitioning because a single MySQL instance can bottleneck around 1,000 concurrent writes/sec"
    ],
    "related_topics": [
      "capacity-planning",
      "latency-and-throughput"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_61_1",
        "question": "If your scale estimation reveals your service receives 50 writes/second and stores 50 GB per year, should you propose a massive Cassandra sharded cluster?",
        "options": [
          "Yes, because Cassandra is modern",
          "No; 50 writes/sec and 50 GB/year easily fits on a single small PostgreSQL instance; proposing a complex sharded cluster is wasteful over-engineering",
          "Yes, because SQL is deprecated",
          "Cassandra cannot store 50 GB"
        ],
        "correct_option_index": 1,
        "explanation": "Calculations prevent over-engineering. A single relational database can comfortably handle thousands of writes/sec and terabytes of data."
      }
    ]
  },
  {
    "id": "sd_l5_62",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 62,
    "slug": "interview-step-3-api-design",
    "title": "Step 3: API Design & Endpoint Contracts",
    "summary": "Defining clean REST/gRPC contracts, request/response JSON schemas, pagination tokens, and error semantics.",
    "estimated_minutes": 15,
    "content_markdown": "# Step 3: API Design & Endpoint Contracts (Minutes 10 - 15)\n\nDefining clean API contracts proves that your architecture directly satisfies the functional requirements defined in Step 1.\n\n### API Contract Best Practices\n1. **Use Standard HTTP Verbs**:\n   - `POST /api/v1/tweets` (Create tweet)\n   - `GET /api/v1/tweets/{id}` (Get tweet)\n   - `GET /api/v1/users/{id}/timeline?limit=20&cursor=eyJ...` (Paginated timeline)\n   - `DELETE /api/v1/tweets/{id}` (Delete tweet)\n2. **Always Use Cursor-Based Pagination**:\n   - Never use `offset/limit` for high-velocity feeds; as new tweets arrive, offset shifts and causes duplicate items. Use an opaque cursor or timestamp.\n3. **Include Idempotency**:\n   - For financial or critical creation endpoints, include `Idempotency-Key` headers.",
    "key_decisions": [
      "Choosing between RESTful JSON APIs vs gRPC Protocol Buffers for internal microservice communication"
    ],
    "advantages": [
      "Establishes concrete data exchange boundaries between client and backend tiers"
    ],
    "disadvantages": [
      "Over-specifying minor query parameters wastes time; focus on the primary 3-4 endpoints"
    ],
    "common_mistakes": [
      "Using verbs in REST paths like `POST /get_all_tweets_by_user` instead of `GET /users/{id}/tweets`"
    ],
    "practical_examples": [
      "Defining Twitter Home Timeline API: `GET /api/v1/feed?cursor=17928374&limit=25`"
    ],
    "related_topics": [
      "client-server-architecture",
      "api-gateways"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_62_1",
        "question": "Why is 'Cursor-Based Pagination' superior to 'Offset-Based Pagination' for fast-moving social feeds?",
        "options": [
          "Cursor pagination uses less HTML",
          "Offset pagination skips or duplicates items when new records are inserted while a user is scrolling; cursor pagination anchors to an immutable record ID or timestamp",
          "Cursor pagination only works in dark mode",
          "Offset pagination is not supported by databases"
        ],
        "correct_option_index": 1,
        "explanation": "When new items are inserted at the top of a feed, `OFFSET 20` shifts down, causing the user to see the same post twice on page 2. Cursors anchor to specific item keys."
      }
    ]
  },
  {
    "id": "sd_l5_63",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 63,
    "slug": "interview-step-4-data-modeling",
    "title": "Step 4: Data Modeling & Schema Selection",
    "summary": "Relational vs non-relational choice, defining entities, primary keys, indexing strategies, and normalization trade-offs.",
    "estimated_minutes": 15,
    "content_markdown": "# Step 4: Data Modeling & Schema Selection (Minutes 15 - 20)\n\nData modeling determines how your application persists, queries, and mutates state. Choosing the right database paradigm (SQL vs NoSQL) is a critical interview inflection point.\n\n### The Decision Matrix: SQL vs NoSQL\n- **Choose SQL (PostgreSQL, MySQL)** when:\n  - You need complex relational queries with multi-table JOINs.\n  - You require strict ACID transactions (Banking, Payments, E-commerce checkouts).\n  - Data structure is well-defined and unlikely to change wildly.\n- **Choose NoSQL (Cassandra, DynamoDB, MongoDB)** when:\n  - You need massive horizontal write throughput (100,000+ writes/sec).\n  - Data model is flat, hierarchical, or append-only time-series (Chat logs, IoT metrics).\n  - You can query exclusively by a primary partition key without relational joins.\n\n### Define 3-4 Core Entities Clearly\n- `users`: `user_id (PK)`, `email`, `created_at`\n- `tweets`: `tweet_id (PK)`, `author_id (FK)`, `content`, `created_at`\n- `follows`: `follower_id`, `followee_id`, `(composite PK)`",
    "key_decisions": [
      "Deciding whether to store follower relationships in a relational composite key table vs a graph database"
    ],
    "advantages": [
      "Reveals disk storage patterns, index needs, and relationship cardinalities"
    ],
    "disadvantages": [
      "Designing every single edge-case table wastes time; stick to core entities"
    ],
    "common_mistakes": [
      "Proposing a NoSQL key-value store and then explaining how you will execute complex multi-table relational joins on it"
    ],
    "practical_examples": [
      "Designing WhatsApp data schema: Using Cassandra wide-column tables with `(conversation_id, message_id)` composite clustering keys"
    ],
    "related_topics": [
      "sql-databases",
      "nosql-databases",
      "database-indexes"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_63_1",
        "question": "What is the primary indicator that an architect should choose a NoSQL Wide-Column Store (like Cassandra) over a Relational SQL DB?",
        "options": [
          "The system requires complex 5-table relational joins with foreign key cascades",
          "The workload requires massive append-only write throughput (hundreds of thousands of writes/sec) with predictable point and range queries on a partition key",
          "The budget is zero dollars",
          "The application runs on a smartwatch"
        ],
        "correct_option_index": 1,
        "explanation": "Wide-column stores excel at linear append-only write scalability by partitioning data across nodes using consistent hashing."
      }
    ]
  },
  {
    "id": "sd_l5_64",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 64,
    "slug": "interview-step-5-high-level-design",
    "title": "Step 5: High-Level Architecture Topology",
    "summary": "Drawing the 10,000-foot view: Client, DNS/CDN, Load Balancer, API Gateway, Stateless App Servers, Caching Tier, and Databases.",
    "estimated_minutes": 20,
    "content_markdown": "# Step 5: High-Level Architecture Topology (Minutes 20 - 27)\n\nNow you assemble the high-level box-and-line diagram that connects all components into an end-to-end operational system.\n\n### The Canonical 4-Tier Topology\n1. **Client Tier**: Web Client, Mobile App, IoT device.\n2. **Edge & Ingress Tier**:\n   - **DNS / CDN**: Resolves hostnames and caches static assets close to edge.\n   - **Load Balancer (L4/L7)**: Distributes traffic across gateways.\n   - **API Gateway**: Terminates TLS, authenticates tokens, and routes traffic.\n3. **Application Tier**:\n   - Stateless microservice containers (e.g. `TweetService`, `TimelineService`, `UserService`).\n   - Asynchronous Message Queue (`Kafka`, `SQS`) buffering heavy background tasks for Worker pods.\n4. **Data & Storage Tier**:\n   - **Cache Tier**: In-memory Redis cluster for hot queries.\n   - **Primary Storage**: Relational SQL (Postgres) or NoSQL (Cassandra/DynamoDB) with read replicas.\n   - **Object Storage**: S3 for images, videos, and static files.\n\n### Walk Through the Request Flow!\nDon't just draw the boxes; **walk the interviewer through a concrete request**:\n*'When a user posts a photo, the client requests a pre-signed S3 URL from TweetService, uploads image directly to S3, and TweetService commits the record to Postgres and emits an event to Kafka...'*",
    "key_decisions": [
      "Clearly labeling protocol arrows (`HTTPS`, `gRPC`, `WebSocket`, `TCP`)",
      "Splitting read paths from write paths"
    ],
    "advantages": [
      "Provides the structural skeleton for the rest of the technical deep-dive"
    ],
    "disadvantages": [
      "Leaving the design at the high-level without diving into bottlenecks will result in a mediocre interview score"
    ],
    "common_mistakes": [
      "Drawing 50 different microservices before establishing basic client-to-database connectivity"
    ],
    "practical_examples": [
      "Using the Architecture Designer Canvas in System Design Lab to arrange client, LB, gateway, services, cache, and DB"
    ],
    "related_topics": [
      "basic-architecture-diagrams",
      "load-balancers",
      "caching"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_64_1",
        "question": "What should a candidate do immediately after drawing the high-level architecture boxes?",
        "options": [
          "Declare the interview complete",
          "Trace an end-to-end user request step-by-step through the components to validate the data flow and operational correctness",
          "Erase everything and redraw it in a different color",
          "Ask for a salary increase"
        ],
        "correct_option_index": 1,
        "explanation": "Walking through a concrete user request demonstrates that your components connect logically and satisfy the functional requirements."
      }
    ]
  },
  {
    "id": "sd_l5_65",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 65,
    "slug": "interview-step-6-detailed-deep-dive",
    "title": "Step 6: Detailed Component Deep-Dive",
    "summary": "Zooming into 1-2 core technical challenges (e.g. Fan-out on write vs Fan-out on read, Distributed ID generation, Fast Search).",
    "estimated_minutes": 25,
    "content_markdown": "# Step 6: Detailed Component Deep-Dive (Minutes 27 - 35)\n\nThis is where candidates earn senior and staff-level evaluation scores. The interviewer will ask you to zoom into the most challenging algorithmic and architectural sub-problem of the system.\n\n### Classic Deep-Dive Scenarios\n1. **News Feed (Twitter/Facebook)**:\n   - *Fan-out-on-Write (Push)*: When Alice tweets, write her tweet ID into the Redis timeline cache of all her followers.\n     - *Advantage*: Home timeline read is $O(1)$ instant lookup!\n     - *Fatal Flaw*: When Elon Musk (150M followers) tweets, the server must write to 150 million caches (**Celebrity Hot-Spot write storm**)!\n   - *Fan-out-on-Read (Pull)*: When a user opens their app, query the latest tweets of everyone they follow and merge-sort.\n     - *Advantage*: Writes are $O(1)$ fast.\n     - *Downside*: Reads are $O(N)$ slow and heavy on the database.\n   - *The Hybrid Winner*: Push for normal users (< 5,000 followers); Pull for celebrities!\n2. **Distributed Unique ID Generation (Snowflake)**:\n   - Can we use auto-incrementing SQL IDs? No, multiple database shards will generate collision IDs.\n   - Use **Twitter Snowflake (64-bit ID)**:\n     - 1 bit unused | 41 bits timestamp (69 years) | 10 bits machine ID | 12 bits sequence number (4,096 IDs per ms per machine).\n     - *Advantage*: Globally unique, $k$-sorted chronologically, and requires zero network coordination!",
    "key_decisions": [
      "Presenting both naive and optimal solutions to demonstrate deep trade-off awareness"
    ],
    "advantages": [
      "Separates junior engineers who only memorize boxes from senior architects who understand distributed algorithms"
    ],
    "disadvantages": [
      "Getting lost in minor details if the interviewer wanted to explore a different component"
    ],
    "common_mistakes": [
      "Giving a hand-waving answer like 'We will just use AI to solve the feed' instead of concrete data structures"
    ],
    "practical_examples": [
      "Explaining Twitter's Hybrid Fan-Out model and Snowflake ID generator during a News Feed interview"
    ],
    "related_topics": [
      "caching",
      "database-partitioning"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_65_1",
        "question": "In a social news feed architecture, what is the 'Celebrity Problem' with pure Fan-out-on-Write (push model)?",
        "options": [
          "Celebrities refuse to tweet",
          "When a celebrity with 100M followers posts, the system must write to 100M follower caches simultaneously, causing massive write amplification and queue backlogs",
          "Celebrity accounts consume more disk space per character",
          "Celebrities bypass the API gateway"
        ],
        "correct_option_index": 1,
        "explanation": "Fan-out on write requires copying the tweet ID to every follower's cache. For accounts with tens of millions of followers, this causes massive write spikes."
      }
    ]
  },
  {
    "id": "sd_l5_66",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 66,
    "slug": "interview-step-7-bottleneck-identification",
    "title": "Step 7: Bottleneck Identification & Single Points of Failure",
    "summary": "Proactively auditing your own design for SPOFs, saturated network cards, un-cached read paths, and database write limits.",
    "estimated_minutes": 15,
    "content_markdown": "# Step 7: Bottleneck Identification & Single Points of Failure (Minutes 35 - 38)\n\nA critical indicator of an exceptional engineer is **proactive self-critique**. Do not wait for the interviewer to find your bugs\u2014hunt them down and point them out first!\n\n### The Proactive Audit Checklist\n1. **Single Points of Failure (SPOF)**:\n   - *Audit*: Is there any single component (Load Balancer, Master Database, API Gateway) that, if it crashes, halts the entire platform?\n   - *Fix*: Add redundant standby replicas with automated failover.\n2. **Hot Spots & Partition Skew**:\n   - *Audit*: If 10 million users all access the exact same viral URL or product simultaneously, does that specific shard or cache key crash?\n   - *Fix*: Local in-memory L1 cache on application servers or replicated read keys.\n3. **Database Write Bottlenecks**:\n   - *Audit*: Can a single primary database sustain the peak write throughput?\n   - *Fix*: Sharding or asynchronous queue buffering.\n4. **Unbounded Memory Growth**:\n   - *Audit*: Does any cache or table grow indefinitely without an eviction TTL or archival policy?",
    "key_decisions": [
      "Acknowledging weaknesses candidly and proposing concrete mitigation strategies"
    ],
    "advantages": [
      "Prevents the interviewer from thinking you were oblivious to your design's limitations",
      "Proves battle-tested production experience"
    ],
    "disadvantages": [
      "Dwelling on trivial bugs instead of high-impact structural bottlenecks"
    ],
    "common_mistakes": [
      "Defensively arguing that your design has zero flaws (every architecture involves compromises)"
    ],
    "practical_examples": [
      "Noticing that your design has a single Redis instance and immediately stating: 'I should upgrade this to a Redis Sentinel or Redis Cluster with read replicas to prevent a single point of failure'"
    ],
    "related_topics": [
      "fault-tolerance",
      "availability"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_66_1",
        "question": "Why is it advantageous to proactively point out bottlenecks and SPOFs in your own system design during an interview?",
        "options": [
          "It shows humility and demonstrates that you understand the real-world trade-offs and failure modes of your architecture rather than assuming it is magically perfect",
          "It confuses the interviewer",
          "It gives you an excuse to end the interview early",
          "It allows you to blame the cloud provider"
        ],
        "correct_option_index": 0,
        "explanation": "Senior engineers know that every design has trade-offs. Identifying bottlenecks proactively demonstrates technical maturity and deep systems thinking."
      }
    ]
  },
  {
    "id": "sd_l5_67",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 67,
    "slug": "interview-step-8-scalability-hardening",
    "title": "Step 8: Scalability & Reliability Hardening",
    "summary": "Adding circuit breakers, rate limiters, read replicas, geo-routing CDNs, and database connection pools.",
    "estimated_minutes": 15,
    "content_markdown": "# Step 8: Scalability & Reliability Hardening (Minutes 38 - 41)\n\nNow you harden the high-level architecture with enterprise-grade distributed patterns to ensure it survives real-world chaos.\n\n### The Hardening Playbook\n1. **Edge Protection**: Place Cloudflare CDN and WAF in front of DNS to shield against volumetric DDoS attacks.\n2. **Ingress Protection**: Configure Token Bucket rate limiting on the API Gateway per client IP and user account.\n3. **Service Resilience**: Wrap all inter-service HTTP/gRPC calls in **Circuit Breakers** with fallback responses and exponential backoff retries with jitter.\n4. **Data Hardening**:\n   - Deploy multi-AZ database read replicas.\n   - Configure Write-Ahead Log continuous archiving to S3 for Point-In-Time-Recovery (PITR).\n   - Use Redis Cluster across 3 availability zones with automated replica failover.",
    "key_decisions": [
      "Hardening only the critical bottlenecks rather than adding unnecessary bloat to every single service"
    ],
    "advantages": [
      "Transforms a theoretical academic diagram into an enterprise-ready production blueprint"
    ],
    "disadvantages": [
      "Over-complicating diagrams with too many auxiliary tools"
    ],
    "common_mistakes": [
      "Claiming 'we will add more servers' without addressing database connection pool exhaustion or lock contention"
    ],
    "practical_examples": [
      "Adding connection pooling (PgBouncer) between 200 stateless Node.js containers and a PostgreSQL primary"
    ],
    "related_topics": [
      "circuit-breakers",
      "rate-limiting",
      "fault-tolerance"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_67_1",
        "question": "What happens when 500 auto-scaled application containers connect directly to a single PostgreSQL primary without connection pooling?",
        "options": [
          "PostgreSQL runs faster",
          "Each container opens dozens of connections, exhausting PostgreSQL max_connections, causing server memory exhaustion and connection rejection errors (500 Internal Server Error)",
          "The database automatically upgrades its CPU",
          "Nothing happens"
        ],
        "correct_option_index": 1,
        "explanation": "Relational databases allocate memory per open connection. Without a connection pooler like PgBouncer, auto-scaling fleets crash the database."
      }
    ]
  },
  {
    "id": "sd_l5_68",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 68,
    "slug": "interview-step-9-trade-offs-defense",
    "title": "Step 9: Trade-Off Analysis & Defense",
    "summary": "Articulating why you chose Technology A over B, defending against interviewer pushback, and explaining cost vs performance.",
    "estimated_minutes": 15,
    "content_markdown": "# Step 9: Trade-Off Analysis & Defense (Minutes 41 - 43)\n\nA system design interview is fundamentally an assessment of your judgment. The interviewer will frequently challenge your decisions (*'Why Cassandra instead of PostgreSQL?'*, *'Why Redis instead of Memcached?'*).\n\n### The STAR Defense Formula\n1. **Acknowledge the Alternative**: Never dismiss the other tool as 'bad' (e.g., *'PostgreSQL is an outstanding, mature relational database...'*).\n2. **State the Specific Constraint**: Highlight the specific requirement that pushed you away (*'...however, our scale estimation requires 200,000 writes/sec of append-only telemetry data...'*).\n3. **Articulate the Trade-Off**: Explain what you gained and what you sacrificed (*'...while Cassandra sacrifices relational JOINs and ACID multi-row transactions, it gives us linear horizontal write scalability across commodity nodes via consistent hashing'*).\n\n### Classic Trade-Off Dichotomies\n- **Consistency vs Availability** (CAP / PACELC)\n- **Latency vs Throughput** (Batching vs Streaming)\n- **Storage Cost vs Compute Overhead** (Denormalization vs Normalization)\n- **Operational Simplicity vs Tailored Performance** (Monolith vs Microservices)",
    "key_decisions": [
      "Defending technical choices calmly using mathematical and operational justification rather than dogmatic bias"
    ],
    "advantages": [
      "Convinces the hiring committee that you make sound, cost-effective engineering investments"
    ],
    "disadvantages": [
      "Getting combative with the interviewer; treat challenges as collaborative pair-architecture discussions"
    ],
    "common_mistakes": [
      "Saying 'I used Cassandra because it is faster than SQL' without explaining *why* it is faster for append-only workloads"
    ],
    "practical_examples": [
      "Defending 301 Permanent Redirect (saves backend load) vs 302 Temporary Redirect (allows accurate click analytics) in TinyURL"
    ],
    "related_topics": [
      "what-is-system-design",
      "cap-theorem"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_68_1",
        "question": "When an interviewer challenges your choice of database, what is the best approach?",
        "options": [
          "Immediately abandon your design and apologize",
          "Argue aggressively that the interviewer is wrong",
          "Acknowledge the alternative's strengths, explain the specific workload constraints (e.g. read/write ratio, scale, data model), and articulate the trade-offs that justified your decision",
          "Change the topic to algorithms"
        ],
        "correct_option_index": 2,
        "explanation": "Senior engineers defend choices by evaluating operational trade-offs against specific workload constraints in a collaborative manner."
      }
    ]
  },
  {
    "id": "sd_l5_69",
    "level": 5,
    "level_name": "Interview Preparation",
    "order_index": 69,
    "slug": "interview-step-10-summary",
    "title": "Step 10: Final Executive Summary & Presentation",
    "summary": "The 2-minute elevator wrap-up, recapping functional coverage, scalability metrics, resilience postures, and future roadmap.",
    "estimated_minutes": 10,
    "content_markdown": "# Step 10: Final Executive Summary & Presentation (Minutes 43 - 45)\n\nClose the interview with confidence using a structured 2-minute executive summary. Do not let the time expire awkwardly; take the initiative to summarize your architecture.\n\n### The 5-Point Closing Script\n1. **Recap Requirements**: *'To summarize, we designed a high-throughput, fault-tolerant platform satisfying our core requirements: [Feature 1, Feature 2, Feature 3].'*\n2. **Highlight Scale Handling**: *'We sized our infrastructure for 10,000 RPS average and 20,000 Peak RPS, using an API Gateway and stateless application tier auto-scaling behind an L7 load balancer.'*\n3. **Data & Storage Tier**: *'We chose PostgreSQL with read replicas for ACID billing data, and Redis Cache-Aside to absorb 90% of read traffic, keeping p99 read latency under 15ms.'*\n4. **Resilience & Fault Tolerance**: *'We eliminated all Single Points of Failure by deploying multi-AZ redundancy, circuit breakers, and rate limiters.'*\n5. **Future Evolution**: *'If we scale to 10x traffic in the future, our next step would be horizontal database sharding using consistent hashing on user_id.'*",
    "key_decisions": [
      "Crisp, professional communication that leaves the interviewer with an outstanding final impression"
    ],
    "advantages": [
      "Synthesizes 45 minutes of intense discussion into a clean, cohesive architectural package",
      "Guarantees all checklist evaluation criteria are explicitly stated"
    ],
    "disadvantages": [
      "Rambling on about minor details instead of highlighting core structural victories"
    ],
    "common_mistakes": [
      "Saying 'Uhh, that's basically it' and sitting in silence"
    ],
    "practical_examples": [
      "Delivering the 2-minute wrap-up during mock interviews on the B.Tech Student AI Learning Platform"
    ],
    "related_topics": [
      "what-is-system-design",
      "interview-step-1-clarifying-requirements"
    ],
    "knowledge_check": [
      {
        "id": "kc_l5_69_1",
        "question": "What is the primary objective of the final 2-minute executive summary in a System Design interview?",
        "options": [
          "To erase the whiteboard before the next candidate arrives",
          "To concisely tie together functional requirements, scale benchmarks, storage decisions, resilience patterns, and future scaling milestones into a polished closing narrative",
          "To ask for a referral",
          "To apologize for any mistakes"
        ],
        "correct_option_index": 1,
        "explanation": "The closing summary reinforces your architectural leadership and ensures the interviewer has all your core design triumphs clearly noted in their scorecard."
      }
    ]
  }
];

export const SYSTEM_DESIGN_CHALLENGES: SystemDesignChallenge[] = [
  {
    "id": "sd_chal_01",
    "number": 1,
    "title": "Design a High-Throughput URL Shortener (TinyURL)",
    "slug": "url-shortener",
    "category": "Web Services & Key Generation",
    "difficulty": "BEGINNER",
    "target_users": "Global internet users, social media platforms, marketing campaign managers",
    "description": "Design a high-scale URL shortening service like TinyURL or Bitly that takes long URLs and aliases them into compact 7-character Base62 keys with ultra-fast HTTP 301/302 redirects.",
    "functional_requirements": [
      "Given a long URL, generate a unique 7-character short URL (e.g. tiny.cc/aB3x9z1)",
      "Redirect users accessing the short URL to original destination with sub-15ms latency",
      "Allow custom user-specified aliases if available",
      "Support optional expiration TTL (e.g. link expires in 30 days)"
    ],
    "non_functional_requirements": [
      "Ultra-high availability (99.999% uptime for redirects)",
      "Sub-15ms p99 read latency on redirects",
      "Strict collision-free unique key generation at scale",
      "Read-heavy traffic: 100:1 read to write ratio"
    ],
    "constraints_and_assumptions": [
      "100 Million new URLs created per month",
      "10 Billion URL redirections per month (~4,000 RPS avg, 8,000 RPS peak)",
      "Default link retention is 5 years"
    ],
    "expected_deliverables": [
      "High-level architecture diagram connecting clients, CDN, API gateway, KGS, cache, and database",
      "Base62 vs MD5 hashing trade-off analysis",
      "HTTP 301 vs 302 redirect trade-off justification",
      "Capacity estimation calculations for storage, cache, and bandwidth"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "50 Million",
      "requests_per_second": "4,000 reads/sec, 40 writes/sec",
      "peak_requests_per_second": "8,000 reads/sec",
      "read_write_ratio": "100:1",
      "storage_per_year": "100M * 12 * 500 bytes = ~600 GB/year (~3 TB over 5 years)",
      "bandwidth": "8,000 * 500 bytes = 4 MB/s (32 Mbps)"
    },
    "evaluation_rubric": {
      "scalability_weight": 25,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 15,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Hashing (MD5/SHA256) requires collision resolution; consider a dedicated Key Generation Service (KGS) that pre-generates unique Base62 tokens in batches.",
      "In-memory Redis Cache-Aside storing the top 20% most active URLs will absorb 80-90% of all redirect queries, shielding the database.",
      "HTTP 301 Permanent Redirect allows browser caching (saving backend compute) but blinds you to click analytics; HTTP 302 Temporary Redirect enables precise tracking at slight server cost."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Browser/Mobile"
      },
      {
        "name": "Cloudflare CDN",
        "category": "INFRASTRUCTURE",
        "type": "CDN",
        "tech": "Cloudflare Edge"
      },
      {
        "name": "Nginx Load Balancer",
        "category": "APPLICATION",
        "type": "LOAD_BALANCER",
        "tech": "Nginx L7"
      },
      {
        "name": "Shortener API Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go/Gin"
      },
      {
        "name": "Redis Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "SQL Database",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      }
    ],
    "reference_solution": {
      "overview": "Stateless Go microservice fronted by Cloudflare CDN edge caching and Nginx L7 load balancer. A Redis cluster caches hot URL keys (TTL 7 days). A pre-generating Key Generation Service (KGS) distributes token ranges via Zookeeper to guarantee zero hash collisions. Persistent mappings live in PostgreSQL/Cassandra with read replicas.",
      "components": [
        {
          "id": "c1",
          "name": "Web & Mobile Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React/iOS",
          "description": "Requests link creation and follows redirects",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Edge CDN",
          "category": "INFRASTRUCTURE",
          "type": "CDN",
          "tech_choice": "Cloudflare",
          "description": "Caches popular redirect responses at the edge",
          "position": {
            "x": 220,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Load Balancer",
          "category": "APPLICATION",
          "type": "LOAD_BALANCER",
          "tech_choice": "AWS ALB",
          "description": "Distributes traffic across stateless API containers",
          "position": {
            "x": 390,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Shortener Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go / Gin",
          "description": "Handles encode, decode, and redirection logic",
          "position": {
            "x": 580,
            "y": 200
          }
        },
        {
          "id": "c5",
          "name": "Key Generation Service (KGS)",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go + Zookeeper",
          "description": "Pre-generates Base62 tokens in memory",
          "position": {
            "x": 580,
            "y": 50
          }
        },
        {
          "id": "c6",
          "name": "Redis URL Cache",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "In-memory LRU cache of hot URL mappings",
          "position": {
            "x": 780,
            "y": 120
          }
        },
        {
          "id": "c7",
          "name": "Primary Database",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Persistent store mapping short_key to long_url",
          "position": {
            "x": 780,
            "y": 280
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Client sends redirect query",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "Cache miss forwards to origin",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "HTTP/REST",
          "description": "Load balances requests",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "gRPC",
          "description": "Fetches pre-allocated token batch",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c4",
          "to": "c6",
          "protocol": "Redis/RESP",
          "description": "Checks memory cache for short key",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c4",
          "to": "c7",
          "protocol": "SQL",
          "description": "Reads/writes URL records",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "HTTP 301 (Browser caches, zero origin load, no analytics) vs 302 (Exact click tracking, minor server load)",
        "Pre-generated Token Range Service (Zero collisions, requires consensus coordinator) vs MD5 Hash Truncation (Requires DB duplicate check and re-hash)"
      ],
      "bottlenecks_and_mitigations": [
        "KGS single point of failure: Run KGS with active-standby replica and lease consensus in Zookeeper/etcd",
        "Database write capacity: Shard DB by short_key hash once scale exceeds 5,000 writes/sec"
      ]
    }
  },
  {
    "id": "sd_chal_02",
    "number": 2,
    "title": "Design an API Rate Limiter",
    "slug": "rate-limiter",
    "category": "Security & Traffic Management",
    "difficulty": "BEGINNER",
    "target_users": "Public APIs, SaaS platforms, payment gateways, microservice clusters",
    "description": "Design an enterprise-grade distributed API Rate Limiter that enforces request quotas, mitigates denial-of-service attacks, and protects backend microservices from resource exhaustion.",
    "functional_requirements": [
      "Enforce rate limits by client IP address, authenticated User ID, or API Key",
      "Return HTTP 429 Too Many Requests with headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` when quota is exceeded",
      "Support tiered quotas (e.g. Free Tier: 60 req/min; Enterprise: 10,000 req/min)",
      "Support configurable rule definitions dynamically without deploying server code"
    ],
    "non_functional_requirements": [
      "Ultra-low latency (< 2ms evaluation overhead per request)",
      "High fault tolerance (if rate limiter cluster fails, fail-open to avoid taking down all customer traffic)",
      "Accurate distributed counting across hundreds of application server pods"
    ],
    "constraints_and_assumptions": [
      "100,000 Requests Per Second across all endpoints",
      "50 Million unique API client keys tracked simultaneously"
    ],
    "expected_deliverables": [
      "Architecture diagram showing API Gateway, Redis cluster, and Rule Engine",
      "Comparison of Token Bucket vs Sliding Window Counter algorithms",
      "Redis Lua script design to guarantee atomic thread-safe token consumption"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "20 Million API Clients",
      "requests_per_second": "100,000 RPS",
      "peak_requests_per_second": "250,000 RPS",
      "read_write_ratio": "1:1 (every request increments counter)",
      "storage_per_year": "50M keys * 64 bytes = ~3.2 GB RAM in Redis (fits comfortably in memory)",
      "bandwidth": "100,000 * 200 bytes = 20 MB/s internal network overhead"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 15,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Do not use separate Redis GET and SET commands; concurrent requests create a race condition that allows users to exceed quotas. Use an atomic Redis Lua script.",
      "The Sliding Window Counter algorithm provides the optimal balance: memory-efficient (2 counters) and completely eliminates the 2x boundary spike flaw of Fixed Windows.",
      "Always implement a Fail-Open policy: if Redis is unreachable, log an alert and let the request pass rather than blocking 100% of revenue-generating customer traffic."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "HTTP Client"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Kong/Envoy"
      },
      {
        "name": "Rate Limiter Filter",
        "category": "INFRASTRUCTURE",
        "type": "RATE_LIMITER",
        "tech": "Envoy Wasm Filter"
      },
      {
        "name": "Redis Cluster",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis in-memory"
      },
      {
        "name": "Rule DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "Postgres Config DB"
      }
    ],
    "reference_solution": {
      "overview": "Envoy API Gateway intercepts incoming requests and evaluates a Token Bucket / Sliding Window Counter in a distributed Redis Cluster using atomic Lua scripts. If quota remains, request forwards to backend microservices; if exhausted, gateway returns 429 with Retry-After header.",
      "components": [
        {
          "id": "c1",
          "name": "Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "HTTP Clients",
          "description": "Sends requests with API Key header",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "API Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy Proxy",
          "description": "Gateway intercepting all traffic",
          "position": {
            "x": 250,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Rate Limiter Daemon",
          "category": "INFRASTRUCTURE",
          "type": "RATE_LIMITER",
          "tech_choice": "Go gRPC Service",
          "description": "Evaluates rate limit policies",
          "position": {
            "x": 450,
            "y": 100
          }
        },
        {
          "id": "c4",
          "name": "Redis Memory Cluster",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "Stores sliding window counters atomically via Lua",
          "position": {
            "x": 650,
            "y": 100
          }
        },
        {
          "id": "c5",
          "name": "Backend Microservices",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Kubernetes Pods",
          "description": "Protected backend services",
          "position": {
            "x": 450,
            "y": 280
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Client API call",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "CheckRateLimit(key, quota)",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Atomic Lua EVALSHA",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c2",
          "to": "c5",
          "protocol": "HTTP/REST",
          "description": "Forwards request if rate check passes",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Fail-Open (protects user experience during cache outage, risks backend overload) vs Fail-Closed (protects backend, drops valid user traffic)",
        "Token Bucket (supports bursts) vs Leaky Bucket (smooths traffic to constant rate)"
      ],
      "bottlenecks_and_mitigations": [
        "Redis network serialization bottleneck at 250K RPS: Use local in-process L1 cache (batch token sync) so 80% of checks never touch Redis"
      ]
    }
  },
  {
    "id": "sd_chal_03",
    "number": 3,
    "title": "Design a Distributed Push Notification Service",
    "slug": "notification-service",
    "category": "Messaging & Mobile",
    "difficulty": "BEGINNER",
    "target_users": "Mobile apps, SaaS platforms, marketing systems, security 2FA alerts",
    "description": "Design a centralized push notification platform that ingests millions of notification events from multiple services and delivers them reliably to iOS (APNS), Android (FCM), SMS (Twilio), and Email (SendGrid).",
    "functional_requirements": [
      "Send notifications across multiple channels: Mobile Push (APNS/FCM), SMS, and Email",
      "Support user notification preferences (e.g. Opt-out of marketing, enable security SMS)",
      "Deduplicate repeated alerts and support rate limits per user (max 5 push notifications/hr)",
      "Track delivery analytics (Sent, Delivered, Clicked, Bounced)"
    ],
    "non_functional_requirements": [
      "High availability (no dropped transactional alerts)",
      "Real-time delivery (< 1 second for 2FA OTP codes)",
      "Support huge spikes (e.g. breaking news push to 50M users in < 5 minutes)"
    ],
    "constraints_and_assumptions": [
      "100 Million notifications sent daily",
      "Peak traffic: 50,000 notifications per second during breaking news events"
    ],
    "expected_deliverables": [
      "End-to-end architecture diagram showing Ingestion API, Priority Queues, Workers, and Third-Party Gateways",
      "Database schema for User Preferences and Device Tokens",
      "Dead-Letter Queue (DLQ) and retry mechanism for third-party gateway failures"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "50 Million",
      "requests_per_second": "1,200 avg RPS",
      "peak_requests_per_second": "50,000 peak RPS",
      "read_write_ratio": "1:1",
      "storage_per_year": "100M * 365 * 500 bytes = ~18 TB/year",
      "bandwidth": "50,000 * 500 bytes = 25 MB/s peak"
    },
    "evaluation_rubric": {
      "scalability_weight": 25,
      "reliability_weight": 30,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Separate high-priority queues (2FA codes, payment receipts) from bulk marketing queues so marketing campaigns never delay critical login tokens.",
      "Store user device tokens and notification opt-out settings in a fast cache (Redis) to avoid hitting PostgreSQL on every push.",
      "External gateways (APNS/FCM/Twilio) have their own strict rate limits and intermittent timeouts; use worker pools with exponential backoff and DLQs."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "iOS / Android"
      },
      {
        "name": "Notification API",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Node.js / Express"
      },
      {
        "name": "Kafka Message Bus",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "Apache Kafka"
      },
      {
        "name": "Notification Workers",
        "category": "COMMUNICATION",
        "type": "BACKGROUND_WORKER",
        "tech": "Go Worker Fleet"
      },
      {
        "name": "Device Token DB",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "DynamoDB"
      }
    ],
    "reference_solution": {
      "overview": "Stateless Ingestion API validates payload, checks user opt-out in Redis, and pushes notifications into partitioned Kafka topics separated by priority (high-priority 2FA vs bulk marketing). Worker pools consume messages, format templates, and dispatch to Apple APNS, Google FCM, and Twilio with circuit breakers and DLQs.",
      "components": [
        {
          "id": "c1",
          "name": "Internal Services",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Order / Auth Services",
          "description": "Triggers notification requests",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Notification Ingestion API",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go API",
          "description": "Validates request and checks user preferences",
          "position": {
            "x": 250,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "User Preferences & Tokens",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "DynamoDB / Redis",
          "description": "Stores user channels and APNS/FCM device tokens",
          "position": {
            "x": 250,
            "y": 60
          }
        },
        {
          "id": "c4",
          "name": "Kafka Event Bus",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "Apache Kafka",
          "description": "Buffers notifications into priority and bulk topics",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c5",
          "name": "Delivery Workers",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Go Workers",
          "description": "Consumes events and dispatches to gateways",
          "position": {
            "x": 680,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Third-Party Gateways",
          "category": "INFRASTRUCTURE",
          "type": "NOTIFICATION_SERVICE",
          "tech_choice": "APNS / FCM / Twilio",
          "description": "Delivers pushes and SMS to devices",
          "position": {
            "x": 880,
            "y": 200
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "gRPC",
          "description": "SendNotification(user_id, msg)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "TCP",
          "description": "Query device tokens and opt-out",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "Kafka",
          "description": "Enqueue notification event",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "Kafka",
          "description": "Workers poll partitions",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c5",
          "to": "c6",
          "protocol": "HTTPS",
          "description": "Dispatch to Apple/Google/Twilio",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Separate Priority Topics (guarantees sub-second 2FA delivery during massive marketing campaigns) vs Single Unified Queue (lower infrastructure cost)",
        "At-Least-Once Delivery with consumer deduplication vs At-Most-Once (drops messages)"
      ],
      "bottlenecks_and_mitigations": [
        "Third-party provider rate limits: Implement token bucket throttling per gateway so workers never trigger 429 from Apple/Google"
      ]
    }
  },
  {
    "id": "sd_chal_04",
    "number": 4,
    "title": "Design a Distributed Object Storage Service (S3)",
    "slug": "file-storage-service",
    "category": "Storage & Infrastructure",
    "difficulty": "ADVANCED",
    "target_users": "Cloud developers, enterprise backup systems, media streaming platforms",
    "description": "Design a massively scalable, distributed object storage service like Amazon S3 or Google Cloud Storage that stores petabytes of unstructured binary files with 11 nines of durability (99.999999999%).",
    "functional_requirements": [
      "Create bucket, upload object (`PUT /bucket/object`), download object (`GET /bucket/object`), and delete object",
      "Support files from 1 Byte to 5 Terabytes via Multipart Upload",
      "Object versioning and metadata tagging",
      "Listing objects with prefix filtering (`GET /bucket?prefix=photos/2026/`)"
    ],
    "non_functional_requirements": [
      "11 nines of data durability (99.999999999%)",
      "99.99% availability",
      "Strong consistency for all reads after write (Read-after-write consistency)",
      "High throughput for large concurrent uploads and downloads"
    ],
    "constraints_and_assumptions": [
      "100 Petabytes of total storage across 10 Billion objects",
      "Average object size: 10 Megabytes"
    ],
    "expected_deliverables": [
      "Clear architectural separation between Metadata Tier and Data/Block Storage Tier",
      "Erasure Coding (8+4 Reed-Solomon) vs 3x Replication durability and storage cost analysis",
      "Multipart Upload commit and assembly lifecycle"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "100,000 Enterprise Customers",
      "requests_per_second": "50,000 reads/sec, 5,000 writes/sec",
      "peak_requests_per_second": "100,000 RPS",
      "read_write_ratio": "10:1",
      "storage_per_year": "100 Petabytes active raw storage",
      "bandwidth": "50,000 * 10 MB = massive distributed network requires high-speed fiber backplanes"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 35,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 5,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Decouple Metadata (bucket, object name, size, chunks, permissions) from actual Data Chunks. Metadata lives in a fast distributed key-value store (ScyllaDB/CockroachDB); binary chunks live on commodity hard disk storage nodes.",
      "Do not use 3x replication for petabytes of data\u2014it triples storage hardware cost (300% overhead). Use Erasure Coding (e.g. 8 data chunks + 4 parity chunks = only 50% overhead with superior durability!).",
      "Large files should be split into 5MB chunks client-side for parallel multipart upload with resume capabilities."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "AWS SDK"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Nginx L7"
      },
      {
        "name": "Metadata Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Metadata Server"
      },
      {
        "name": "Metadata DB",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "CockroachDB / Spanner"
      },
      {
        "name": "Storage Node Cluster",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "Commodity Disk Nodes"
      }
    ],
    "reference_solution": {
      "overview": "Two-tier architecture: 1) Metadata Tier manages buckets, access control, and chunk indices in a strongly consistent distributed database. 2) Data Node Cluster stores raw binary chunks across commodity disks encoded with Reed-Solomon Erasure Coding (8+4), supervised by a Master Coordinator that continuously audits disk health and triggers automated healing.",
      "components": [
        {
          "id": "c1",
          "name": "Clients / SDKs",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "S3 REST SDK",
          "description": "Issues PUT and GET object requests",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "API Gateway Tier",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy / Nginx",
          "description": "Authenticates IAM credentials and routes",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Metadata Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Maps object keys to chunk IDs and locations",
          "position": {
            "x": 450,
            "y": 100
          }
        },
        {
          "id": "c4",
          "name": "Metadata DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "CockroachDB (Raft)",
          "description": "Strongly consistent metadata index",
          "position": {
            "x": 680,
            "y": 100
          }
        },
        {
          "id": "c5",
          "name": "Data Storage Nodes",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "HDD Storage Nodes",
          "description": "Persists erasure-coded binary chunks",
          "position": {
            "x": 450,
            "y": 280
          }
        },
        {
          "id": "c6",
          "name": "Storage Master Coordinator",
          "category": "DISTRIBUTED",
          "type": "LEADER",
          "tech_choice": "Raft Leader",
          "description": "Monitors heartbeats and repairs bad disks",
          "position": {
            "x": 680,
            "y": 280
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "PUT/GET /bucket/file",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "Resolve object metadata",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "SQL",
          "description": "Look up chunk locations",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c2",
          "to": "c5",
          "protocol": "TCP",
          "description": "Stream binary chunks directly to/from disk",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c6",
          "to": "c5",
          "protocol": "TCP",
          "description": "Audit chunk health and re-encode parity",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Erasure Coding (50% storage overhead, requires CPU to decode parity) vs 3x Replication (200% storage overhead, instant reads)",
        "Strong Consistency on write (waits for quorum chunk flush) vs Eventual Consistency"
      ],
      "bottlenecks_and_mitigations": [
        "Disk failure at scale: Background coordinator audits checksums continuously; when a disk fails, it reconstructs missing chunks onto spare nodes"
      ]
    }
  },
  {
    "id": "sd_chal_05",
    "number": 5,
    "title": "Design a Cloud File-Sharing Platform (Google Drive / Dropbox)",
    "slug": "cloud-file-sharing",
    "category": "Storage & Synchronization",
    "difficulty": "INTERMEDIATE",
    "target_users": "Desktop users, mobile workers, cross-device document sync",
    "description": "Design a distributed file synchronization and sharing platform like Google Drive or Dropbox that syncs files across multiple user devices with delta block syncing and conflict resolution.",
    "functional_requirements": [
      "File upload, download, and automatic multi-device synchronization",
      "Delta Syncing: Only upload modified byte chunks (not the whole 50MB file)",
      "File revision history and rollback (view previous versions)",
      "Share file/folder with other users with read or write permissions"
    ],
    "non_functional_requirements": [
      "High durability (zero lost file edits)",
      "Efficient bandwidth usage on mobile/desktop clients",
      "Fast real-time sync notification across devices (< 500ms)"
    ],
    "constraints_and_assumptions": [
      "50 Million Daily Active Users",
      "Average user edits 2 files per day; average file size: 5 Megabytes"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Desktop Sync Client, Block Server, Metadata Server, and S3 Storage",
      "Chunking algorithm (Content-Defined Chunking / Rabin Fingerprinting)",
      "Synchronization and conflict resolution protocol when two devices edit offline"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "50 Million",
      "requests_per_second": "2,000 edits/sec",
      "peak_requests_per_second": "5,000 edits/sec",
      "read_write_ratio": "1:1",
      "storage_per_year": "50M * 2 files * 5MB * 365 = ~180 Petabytes (reduced to 30 PB via deduplication!)",
      "bandwidth": "Delta sync reduces bandwidth consumption by 85%"
    },
    "evaluation_rubric": {
      "scalability_weight": 25,
      "reliability_weight": 30,
      "data_consistency_weight": 20,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Split files into 4MB chunks and hash them (SHA-256). If a user edits 1 sentence in a 100-page document, only 1 chunk changes; only that single 4MB chunk is transmitted!",
      "Global Deduplication: If 50,000 users upload the exact same tax PDF, store the binary chunk in S3 once and reference its SHA-256 hash in metadata.",
      "Use a WebSocket or Server-Sent Events Notification Service to instantly notify client device B when device A commits an edit."
    ],
    "starter_components": [
      {
        "name": "Desktop Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Desktop Sync App"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Nginx"
      },
      {
        "name": "Block Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Rust Block Server"
      },
      {
        "name": "Metadata DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL"
      },
      {
        "name": "S3 Storage",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "Amazon S3"
      }
    ],
    "reference_solution": {
      "overview": "Desktop client splits files into 4MB chunks using rolling hash (Rabin fingerprinting). Hashes are queried against Metadata Service; only new/unseen chunks are uploaded to S3. A Sync Service publishes change events to an internal Redis Pub/Sub topic, which notifies connected user devices via long-lived WebSockets to trigger delta downloads.",
      "components": [
        {
          "id": "c1",
          "name": "Sync Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Desktop / Mobile Client",
          "description": "Computes chunk hashes and delta diffs",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Block Server",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go / Rust",
          "description": "Receives and assembles binary chunks",
          "position": {
            "x": 280,
            "y": 100
          }
        },
        {
          "id": "c3",
          "name": "Metadata Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Spring",
          "description": "Manages file trees, versions, and permissions",
          "position": {
            "x": 280,
            "y": 280
          }
        },
        {
          "id": "c4",
          "name": "S3 Object Store",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "AWS S3",
          "description": "Stores deduplicated 4MB binary chunks",
          "position": {
            "x": 500,
            "y": 100
          }
        },
        {
          "id": "c5",
          "name": "Metadata SQL DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Stores chunk manifests, files, and users",
          "position": {
            "x": 500,
            "y": 280
          }
        },
        {
          "id": "c6",
          "name": "Notification Service",
          "category": "COMMUNICATION",
          "type": "WEBSOCKET_SERVICE",
          "tech_choice": "Go WebSocket Fleet",
          "description": "Pushes real-time sync alerts to devices",
          "position": {
            "x": 500,
            "y": 420
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Upload new delta chunks",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c1",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "Commit file manifest metadata",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "TCP",
          "description": "Persist chunk blobs to S3",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Save file revision tree",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c3",
          "to": "c6",
          "protocol": "TCP",
          "description": "Notify other devices of new revision",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c6",
          "to": "c1",
          "protocol": "WebSocket",
          "description": "Push sync notification to client",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Client-Side Chunking (saves client bandwidth, requires thick desktop client) vs Server-Side Chunking (heavy server bandwidth)",
        "Conflict Resolution: Branch file into 'Conflicted Copy' on concurrent offline edits vs automated merge"
      ],
      "bottlenecks_and_mitigations": [
        "Metadata table growth: Partition chunk_manifest table by user_id to prevent giant B-Tree degradation"
      ]
    }
  },
  {
    "id": "sd_chal_06",
    "number": 6,
    "title": "Design a Real-Time Scalable Chat System (WhatsApp)",
    "slug": "chat-app",
    "category": "Real-Time & Messaging",
    "difficulty": "INTERMEDIATE",
    "target_users": "Mobile messaging users, peer-to-peer 1-on-1 conversations",
    "description": "Design an end-to-end encrypted, low-latency mobile chat application like WhatsApp that supports 1-on-1 real-time messaging, delivery/read receipts, user presence (online/offline), and offline push notifications.",
    "functional_requirements": [
      "Real-time 1-on-1 messaging with sub-50ms delivery latency between online users",
      "Delivery receipts: Sent (single check), Delivered (double check), Read (blue double check)",
      "User online/last seen presence status",
      "Offline message buffering: deliver messages immediately when receiver reconnects"
    ],
    "non_functional_requirements": [
      "Sub-50ms message latency",
      "Zero message loss (durability guarantee)",
      "Support 100 Million concurrent WebSocket connections",
      "End-to-end encryption"
    ],
    "constraints_and_assumptions": [
      "500 Million Daily Active Users",
      "10 Billion messages sent per day (~120,000 msgs/sec avg, 300,000 peak)"
    ],
    "expected_deliverables": [
      "High-level architecture showing WebSocket Gateways, Session Registry, Message Bus, and Storage",
      "Database design for chat history and message states",
      "User presence heartbeat and disconnect architecture"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "500 Million",
      "requests_per_second": "120,000 msgs/sec",
      "peak_requests_per_second": "300,000 msgs/sec",
      "read_write_ratio": "1:1",
      "storage_per_year": "10B * 365 * 200 bytes = ~730 TB/year",
      "bandwidth": "120,000 * 200 bytes = 24 MB/s (192 Mbps)"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 30,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "HTTP request-response is unsuitable; maintain persistent bidirectional WebSocket or TCP connections to a fleet of connection gateway servers.",
      "Use a distributed Session Registry (Redis Cluster) mapping `user_id -> gateway_server_ip` so Server A knows exactly which server holds the recipient's active socket.",
      "Do not store chat logs in SQL; use an append-only distributed wide-column store like Apache Cassandra with `PRIMARY KEY (conversation_id, message_id)`."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "React Native / Swift"
      },
      {
        "name": "WebSocket Gateway",
        "category": "COMMUNICATION",
        "type": "WEBSOCKET_SERVICE",
        "tech": "Go epoll server"
      },
      {
        "name": "Session Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "Kafka Bus",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "Apache Kafka"
      },
      {
        "name": "Chat DB",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "Apache Cassandra"
      }
    ],
    "reference_solution": {
      "overview": "Mobile clients establish TLS WebSockets to an auto-scaled WebSocket Gateway fleet. A Redis Session Registry tracks active user socket locations. When User A messages User B, Gateway queries Redis: if B is online, it forwards message directly through B's gateway. If B is offline, message is saved to Cassandra and a push notification is queued to Apple/Google.",
      "components": [
        {
          "id": "c1",
          "name": "Mobile Clients",
          "category": "APPLICATION",
          "type": "MOBILE_CLIENT",
          "tech_choice": "iOS / Android",
          "description": "Maintains persistent socket connection",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "WebSocket Gateway Fleet",
          "category": "COMMUNICATION",
          "type": "WEBSOCKET_SERVICE",
          "tech_choice": "Go epoll sockets",
          "description": "Maintains 100M open TCP socket connections",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Session & Presence Registry",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "Maps user_id -> socket_server_id",
          "position": {
            "x": 260,
            "y": 50
          }
        },
        {
          "id": "c4",
          "name": "Chat Message Bus",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "Apache Kafka",
          "description": "Decouples message dispatch and persistence",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c5",
          "name": "Chat History Storage",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "Apache Cassandra",
          "description": "Wide-column store partitioned by conversation_id",
          "position": {
            "x": 700,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Push Notification Service",
          "category": "COMMUNICATION",
          "type": "NOTIFICATION_SERVICE",
          "tech_choice": "FCM / APNS",
          "description": "Alerts offline users of incoming messages",
          "position": {
            "x": 700,
            "y": 350
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "WebSocket",
          "description": "Duplex socket messaging",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "Redis/RESP",
          "description": "Lookup recipient server location",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "Kafka",
          "description": "Publish message event",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "TCP",
          "description": "Asynchronously persist chat record",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c4",
          "to": "c6",
          "protocol": "HTTP/REST",
          "description": "Trigger push if recipient is offline",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Persistent WebSockets (sub-50ms latency, high server memory per connection) vs Long-Polling (firewall friendly, high header overhead)",
        "Cassandra wide-column store (fast sequential append writes, no joins) vs RDBMS"
      ],
      "bottlenecks_and_mitigations": [
        "Gateway node crash: Client reconnects with exponential backoff; Redis session expires via 30s heartbeat TTL"
      ]
    }
  },
  {
    "id": "sd_chal_07",
    "number": 7,
    "title": "Design a Group Messaging System (Discord)",
    "slug": "group-messaging",
    "category": "Real-Time & Fan-Out",
    "difficulty": "ADVANCED",
    "target_users": "Gaming communities, Discord guilds, Slack channels with 10,000+ users",
    "description": "Design a massive group chat and guild messaging architecture like Discord that supports millions of concurrent communities, text channels, message fan-out to 100,000 members, and channel unread badges.",
    "functional_requirements": [
      "Users can join guilds/servers and participate in multiple text channels",
      "Send and receive messages in real time in channels with up to 100,000 members",
      "Read state & unread badge counters per channel per user",
      "Role-based permissions (Admins, Moderators, Members)"
    ],
    "non_functional_requirements": [
      "Sub-100ms message delivery to all active channel members",
      "Handle massive fan-out write amplification without melting servers",
      "High availability across global regions"
    ],
    "constraints_and_assumptions": [
      "150 Million Monthly Active Users",
      "Top guilds have 500,000 total members, with 50,000 simultaneously online"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Gateway Guild Session Managers and Message Fan-Out",
      "Fan-Out on Write vs Fan-Out on Read trade-off for 100K-member groups",
      "ScyllaDB / Cassandra sharding schema for channels"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "30 Million",
      "requests_per_second": "50,000 msgs/sec",
      "peak_requests_per_second": "150,000 msgs/sec",
      "read_write_ratio": "100:1 (1 message sent, 100-10,000 users read)",
      "storage_per_year": "500 Terabytes per year",
      "bandwidth": "High egress bandwidth during guild-wide announcements"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Never fan-out to individual user inboxes in large groups! Instead of copying a message 50,000 times, store the message ONCE in the channel table. Online clients subscribe to the channel topic.",
      "Discord uses Elixir / Erlang BEAM processes (or Go actor models): each Guild runs as an in-memory process managing connected member socket routers.",
      "For unread badges, don't store 50,000 read receipts; track the `last_read_message_id` per user. If `channel.last_message_id > user.last_read_message_id`, mark unread!"
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Discord Desktop/Web"
      },
      {
        "name": "Gateway",
        "category": "COMMUNICATION",
        "type": "WEBSOCKET_SERVICE",
        "tech": "Elixir / Go"
      },
      {
        "name": "Guild Router",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Actor Service"
      },
      {
        "name": "Channel DB",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "ScyllaDB"
      },
      {
        "name": "Redis Pub/Sub",
        "category": "COMMUNICATION",
        "type": "EVENT_BUS",
        "tech": "Redis"
      }
    ],
    "reference_solution": {
      "overview": "Guild Actor Service architecture where each guild has an in-memory stateful actor routing messages to connected client WebSockets. Messages are persisted once to ScyllaDB with partition key `channel_id`. Unread state is computed by comparing `last_message_id` with `user_read_pointer`.",
      "components": [
        {
          "id": "c1",
          "name": "Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React / Electron",
          "description": "Connected via persistent WebSockets",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Gateway Nodes",
          "category": "COMMUNICATION",
          "type": "WEBSOCKET_SERVICE",
          "tech_choice": "Go / Elixir",
          "description": "Manages user socket connections",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Guild Routing Actors",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Erlang / Go Actors",
          "description": "Maintains guild member presence and fan-out",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "ScyllaDB Message Store",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "ScyllaDB",
          "description": "Stores channel message history partitioned by channel_id",
          "position": {
            "x": 700,
            "y": 200
          }
        },
        {
          "id": "c5",
          "name": "User Read State DB",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "Cassandra / DynamoDB",
          "description": "Stores user last_read_message_id per channel",
          "position": {
            "x": 700,
            "y": 350
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "WebSocket",
          "description": "Real-time socket communication",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "Route message to Guild Actor",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "TCP",
          "description": "Persist message to channel table",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c2",
          "protocol": "TCP",
          "description": "Fan-out to online member gateway sockets",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c2",
          "to": "c5",
          "protocol": "TCP",
          "description": "Update user read pointer on scroll",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Single Channel Message Persistence (zero write amplification) vs Fan-out to user inboxes (infeasible for 100K members)",
        "Read Pointer Comparison (1 row per user-channel) vs Individual Message Read Receipts"
      ],
      "bottlenecks_and_mitigations": [
        "Massive announcement in 500K guild: Throttle typing events and suppress user status presence fan-out for guilds over 10,000 members"
      ]
    }
  },
  {
    "id": "sd_chal_08",
    "number": 8,
    "title": "Design a Social Media News Feed (Twitter / Facebook)",
    "slug": "social-news-feed",
    "category": "Feeds & Aggregations",
    "difficulty": "ADVANCED",
    "target_users": "Social network users, content creators, brand accounts",
    "description": "Design a high-throughput social media timeline and news feed architecture like Twitter/X or Instagram that generates personalized home timelines composed of posts from accounts a user follows, with sub-100ms load times.",
    "functional_requirements": [
      "Post a tweet/post containing text, images, or video",
      "Follow and unfollow other users",
      "View personalized Home Feed composed of recent posts from followed accounts",
      "View User Profile timeline (posts created by a specific user)"
    ],
    "non_functional_requirements": [
      "Sub-100ms home feed rendering latency",
      "High availability (reads outnumber writes 100:1)",
      "Support celebrity accounts with tens of millions of followers without lag"
    ],
    "constraints_and_assumptions": [
      "300 Million Daily Active Users",
      "500 Million tweets posted per day (~6,000 writes/sec avg, 15,000 peak)",
      "Average user follows 200 accounts"
    ],
    "expected_deliverables": [
      "Comprehensive architecture showing Feed Generation Service, Timeline Caches, and Media Tier",
      "In-depth analysis of Fan-Out on Write (Push) vs Fan-Out on Read (Pull) vs Hybrid Model",
      "Redis Timeline Cache data structure design (Sorted Sets)"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "300 Million",
      "requests_per_second": "6,000 writes/sec, 600,000 timeline reads/sec",
      "peak_requests_per_second": "1.2 Million timeline reads/sec peak",
      "read_write_ratio": "100:1",
      "storage_per_year": "500M * 365 * 300 bytes = ~55 TB text/year + media in S3",
      "bandwidth": "600,000 * 5 KB = 3 GB/s peak network egress"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Fan-Out on Write: When a user posts, immediately append the tweet_id to the Redis Timeline (Sorted Set) of all followers. This makes reading the feed instant ($O(1)$)!",
      "The Celebrity Exception: For accounts with > 100,000 followers, do NOT push to followers' caches (it would cause a 100M write surge). Instead, merge the celebrity's tweets dynamically when the follower reads their timeline (Hybrid Fan-Out).",
      "Store home timelines in Redis Sorted Sets (`ZSET`) where score is the 64-bit Snowflake timestamp, allowing simple `ZREVRANGEBYSCORE` pagination."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "iOS / Web"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Envoy"
      },
      {
        "name": "Tweet Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Tweet Service"
      },
      {
        "name": "Timeline Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Java Timeline Service"
      },
      {
        "name": "Redis Feed Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "Tweet DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "Postgres / Cassandra"
      }
    ],
    "reference_solution": {
      "overview": "Hybrid Fan-Out Architecture. Tweets are written to PostgreSQL/Cassandra and published to Kafka. A Fan-Out Worker pool updates Redis Sorted Set timeline caches for regular users. For celebrity posts, timeline updates are skipped; Timeline Service pulls and merges celebrity posts on-the-fly during client feed requests.",
      "components": [
        {
          "id": "c1",
          "name": "Clients",
          "category": "APPLICATION",
          "type": "MOBILE_CLIENT",
          "tech_choice": "React / Native",
          "description": "Views feeds and submits tweets",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Load Balancer & Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy L7",
          "description": "Authenticates and routes traffic",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Tweet Write Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Persists tweets with Snowflake IDs",
          "position": {
            "x": 450,
            "y": 100
          }
        },
        {
          "id": "c4",
          "name": "Timeline Read Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Spring",
          "description": "Fetches and merges timeline feeds",
          "position": {
            "x": 450,
            "y": 280
          }
        },
        {
          "id": "c5",
          "name": "Fan-Out Workers",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Go Workers",
          "description": "Pushes tweet IDs into follower Redis caches",
          "position": {
            "x": 680,
            "y": 100
          }
        },
        {
          "id": "c6",
          "name": "Redis Timeline Cache",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster (ZSET)",
          "description": "Caches top 800 tweet IDs per active user",
          "position": {
            "x": 680,
            "y": 280
          }
        },
        {
          "id": "c7",
          "name": "Tweet Database",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "Cassandra / Postgres",
          "description": "Persistent tweet content store",
          "position": {
            "x": 900,
            "y": 180
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Client requests",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "POST /tweets",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "gRPC",
          "description": "GET /timeline",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "Kafka",
          "description": "TweetCreated event",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c5",
          "to": "c6",
          "protocol": "Redis/RESP",
          "description": "ZADD follower_timeline tweet_id",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c4",
          "to": "c6",
          "protocol": "Redis/RESP",
          "description": "ZREVRANGEBYSCORE timeline",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e7",
          "from": "c4",
          "to": "c7",
          "protocol": "TCP",
          "description": "Hydrate tweet text/metadata by IDs",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Hybrid Push/Pull (optimal p99 read latency, manages celebrity writes) vs Pure Push (celebrity write storm) vs Pure Pull (slow read queries)",
        "Caching only Tweet IDs in Redis (small RAM footprint) vs Caching full tweet JSON (high memory cost)"
      ],
      "bottlenecks_and_mitigations": [
        "Inactive users wasting Redis RAM: Only pre-compute timelines for users who logged in within the past 14 days"
      ]
    }
  },
  {
    "id": "sd_chal_09",
    "number": 9,
    "title": "Design a Video Streaming Platform (Netflix)",
    "slug": "video-streaming",
    "category": "Media & Streaming",
    "difficulty": "ADVANCED",
    "target_users": "Global streaming subscribers, smart TVs, mobile tablets, web browsers",
    "description": "Design a high-bandwidth video playback streaming architecture like Netflix that serves gigabits of video chunks with adaptive bitrate streaming (HLS/DASH) across worldwide edge CDNs.",
    "functional_requirements": [
      "Stream video content smoothly with adaptive bitrate adjustment (1080p, 4K, 720p based on user network speed)",
      "Resume playback from exact timestamp across multiple user devices",
      "Search and browse movie catalog with personalized recommendations",
      "Support subtitles and multi-language audio tracks"
    ],
    "non_functional_requirements": [
      "Zero video buffering or stuttering during playback",
      "Sub-200ms initial video start playback delay",
      "Global delivery with 99.99% availability"
    ],
    "constraints_and_assumptions": [
      "200 Million Global Subscribers",
      "50 Million concurrent video streams during peak evening hours",
      "Average stream bitrate: 5 Megabits per second (Mbps)"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Edge CDN (Open Connect), Playback Service, and User State DB",
      "HLS / MPEG-DASH Adaptive Bitrate Streaming chunking protocol explanation",
      "Storage and global CDN caching topology for hot vs long-tail movies"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "100 Million",
      "requests_per_second": "50 Million concurrent streams",
      "peak_requests_per_second": "50M streams * 5 Mbps = 250 Terabits per second (Tbps) total network egress!",
      "read_write_ratio": "1000:1 read heavy",
      "storage_per_year": "10,000 titles * 4 codecs * 5 resolutions = ~10 Petabytes",
      "bandwidth": "250 Terabits/sec peak across global CDN edge appliances"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 10,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Never stream video files directly from cloud application servers! Videos are chopped into 2-6 second chunks (`.ts` or `.m4s`) and cached at ISP edge appliances (e.g. Netflix Open Connect appliances placed inside local internet providers).",
      "Adaptive Bitrate Streaming (HLS): The client video player requests a `.m3u8` manifest file listing available bitrates and measures its own download speed, dynamically stepping down to 720p if network drops or stepping up to 4K.",
      "Store user playback progress ('resume timestamp') in a fast in-memory key-value store (Cassandra/Redis) written periodically every 10 seconds."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Smart TV / Web Player"
      },
      {
        "name": "CDN Appliance",
        "category": "INFRASTRUCTURE",
        "type": "CDN",
        "tech": "Netflix Open Connect / CDN"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Zuul / Envoy"
      },
      {
        "name": "Playback Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Java Playback API"
      },
      {
        "name": "User Playback DB",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "Cassandra"
      }
    ],
    "reference_solution": {
      "overview": "Hybrid Cloud/Edge Architecture. Control plane (auth, search, user state, recommendations) runs in AWS cloud microservices backed by Cassandra and Redis. Data plane (video chunk delivery) runs entirely on custom Open Connect CDN appliances installed directly inside global ISP data centers.",
      "components": [
        {
          "id": "c1",
          "name": "Streaming Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Smart TVs / Apps",
          "description": "Plays HLS adaptive bitrate chunks",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "ISP Edge CDN (Open Connect)",
          "category": "INFRASTRUCTURE",
          "type": "CDN",
          "tech_choice": "Custom FreeBSD CDN",
          "description": "Serves 95% of video chunk bits locally",
          "position": {
            "x": 260,
            "y": 100
          }
        },
        {
          "id": "c3",
          "name": "API Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Zuul / Envoy",
          "description": "Authenticates users and routes requests",
          "position": {
            "x": 260,
            "y": 280
          }
        },
        {
          "id": "c4",
          "name": "Playback Steering Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Spring",
          "description": "Returns signed manifest and nearest CDN URL",
          "position": {
            "x": 480,
            "y": 280
          }
        },
        {
          "id": "c5",
          "name": "User State DB",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "Apache Cassandra",
          "description": "Stores resume timestamps and user profiles",
          "position": {
            "x": 700,
            "y": 280
          }
        },
        {
          "id": "c6",
          "name": "S3 Master Video Storage",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "AWS S3",
          "description": "Master origin storing all encoded chunks",
          "position": {
            "x": 480,
            "y": 100
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "GET /playback/manifest/{movie_id}",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c3",
          "to": "c4",
          "protocol": "gRPC",
          "description": "Resolve playback request",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c4",
          "to": "c5",
          "protocol": "TCP",
          "description": "Read last watched timestamp",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c1",
          "protocol": "HTTPS",
          "description": "Return HLS manifest with CDN URLs",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Stream 2-second video chunks (.ts)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c2",
          "to": "c6",
          "protocol": "HTTPS",
          "description": "Fetch cache miss from S3 origin",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "HLS 2-second chunks (fast adaptation to network changes, higher manifest request volume) vs 6-second chunks (better video compression, slower adaptation)",
        "ISP Edge Appliance Placement (massive capital investment, cuts transit bandwidth costs by 90%) vs Third-Party CDN (simpler, higher bandwidth cost)"
      ],
      "bottlenecks_and_mitigations": [
        "Long-tail content cache misses: Popular movies are pre-pushed to CDN caches during off-peak hours (nightly pre-seeding)"
      ]
    }
  },
  {
    "id": "sd_chal_10",
    "number": 10,
    "title": "Design a Video Sharing & Upload Platform (YouTube)",
    "slug": "video-sharing-platform",
    "category": "Media & Transcoding",
    "difficulty": "ADVANCED",
    "target_users": "Video creators, content platforms, viral media sharing",
    "description": "Design an asynchronous video upload and distributed transcoding pipeline like YouTube that ingests gigabytes of raw video files, slices them into parallel chunks, encodes them into multiple resolutions, and publishes them globally.",
    "functional_requirements": [
      "Upload video files up to 20 Gigabytes with pause and resume support",
      "Distributed transcoding into multiple resolutions (1080p, 720p, 480p, 360p) and codecs (H.264, VP9, AV1)",
      "Generate video thumbnails automatically at key intervals",
      "Video metadata management (Title, tags, channel, view counter)"
    ],
    "non_functional_requirements": [
      "High upload reliability over unreliable mobile networks",
      "Fast transcoding pipeline (a 10-minute video should be ready in < 3 minutes)",
      "Scalable to 500 hours of video uploaded every single minute"
    ],
    "constraints_and_assumptions": [
      "500 Hours of video uploaded every minute",
      "Average raw video bitrate: 1 Gigabyte per 10 minutes",
      "1 Billion daily video views"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Pre-signed S3 Uploads, Chunking Service, Transcoding Worker Cluster, and Queue",
      "Parallel chunk transcoding workflow using DAG job orchestrator",
      "Approximate view counter architecture handling viral video surges"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "100 Million",
      "requests_per_second": "500 hrs/min = ~500 GB/min incoming upload bandwidth (8.3 GB/s)",
      "peak_requests_per_second": "20 GB/s peak upload bandwidth",
      "read_write_ratio": "100:1 read heavy",
      "storage_per_year": "500 hrs/min * 60 * 24 * 365 = ~100 Petabytes of encoded video per year",
      "bandwidth": "Massive ingress and egress"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 10,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Do not proxy raw video uploads through your application servers! Give the client a Pre-Signed S3 URL to upload directly to an S3 Raw Ingestion bucket using multipart chunking.",
      "To transcode a 1-hour video quickly, do not process it sequentially on a single server! Slice the video into 30-second segments, distribute segments across 120 parallel worker containers in a DAG (Directed Acyclic Graph), and assemble the manifest.",
      "Viral View Counters: A single database row cannot sustain 50,000 increments/sec. Buffer view counts in Redis memory counters or Kafka, and flush batched counts to SQL every 10 seconds."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Creator Studio"
      },
      {
        "name": "Upload Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Upload API"
      },
      {
        "name": "Raw Video S3",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "S3 Ingestion Bucket"
      },
      {
        "name": "Transcode Queue",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "Kafka"
      },
      {
        "name": "Transcoder Fleet",
        "category": "COMMUNICATION",
        "type": "BACKGROUND_WORKER",
        "tech": "FFmpeg Worker Fleet"
      },
      {
        "name": "Encoded S3",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "S3 Output Bucket"
      }
    ],
    "reference_solution": {
      "overview": "Creator uploads video directly to S3 Raw Bucket via Pre-Signed Multipart URL. An S3 Event triggers a Video Orchestrator that splits video into chunks and enqueues tasks in Kafka. A fleet of auto-scaled FFmpeg worker pods transcode chunks in parallel into multiple formats, saving encoded chunks into S3 and notifying the database when compilation completes.",
      "components": [
        {
          "id": "c1",
          "name": "Creator Client",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Web / Mobile App",
          "description": "Uploads raw video chunks via multipart",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Upload API",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Generates pre-signed upload URLs and records metadata",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "S3 Raw Bucket",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "AWS S3 Raw",
          "description": "Landing bucket for raw un-transcoded video",
          "position": {
            "x": 260,
            "y": 60
          }
        },
        {
          "id": "c4",
          "name": "Job Orchestrator",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Temporal / DAG Engine",
          "description": "Slices video into parallel segment tasks",
          "position": {
            "x": 480,
            "y": 140
          }
        },
        {
          "id": "c5",
          "name": "Transcoding Workers",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "FFmpeg GPU Spot Fleet",
          "description": "Encodes segments into H.264/VP9/AV1",
          "position": {
            "x": 700,
            "y": 140
          }
        },
        {
          "id": "c6",
          "name": "S3 Encoded Video",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "AWS S3 Public",
          "description": "Stores final streaming chunks and HLS manifests",
          "position": {
            "x": 900,
            "y": 140
          }
        },
        {
          "id": "c7",
          "name": "Video Metadata DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Stores video title, status, and analytics",
          "position": {
            "x": 480,
            "y": 300
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Request pre-signed upload URL",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c1",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "Direct binary multipart upload",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Event",
          "description": "S3:ObjectCreated trigger",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "Kafka",
          "description": "Distribute segment transcoding jobs",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c5",
          "to": "c6",
          "protocol": "TCP",
          "description": "Write encoded chunks (.ts)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c4",
          "to": "c7",
          "protocol": "SQL",
          "description": "Mark video status = READY",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Parallel Segment Transcoding (faster turnaround, requires complex manifest stitching) vs Single-Host Transcoding (slow, simple)",
        "GPU Spot Instances (cuts encoding cost by 70%, handles preemption via retries) vs On-Demand CPU"
      ],
      "bottlenecks_and_mitigations": [
        "Viral video view counter lock contention: Use distributed in-memory counter aggregators in Redis, flushing delta sums every 15s"
      ]
    }
  },
  {
    "id": "sd_chal_11",
    "number": 11,
    "title": "Design a Real-Time Ride-Booking Service (Uber)",
    "slug": "ride-booking",
    "category": "Geospatial & Real-Time",
    "difficulty": "ADVANCED",
    "target_users": "Riders, drivers, dispatch algorithms, surge pricing engines",
    "description": "Design a real-time geospatial ride-hailing and dispatch system like Uber or Lyft that tracks driver GPS coordinates continuously, matches riders with nearby drivers, and computes dynamic surge pricing.",
    "functional_requirements": [
      "Drivers stream GPS locations every 4 seconds",
      "Riders can see nearby active drivers on a live map in real time",
      "Riders request a ride; system matches the optimal driver in < 3 seconds",
      "Trip lifecycle management (Accepted, Arrived, In Progress, Completed, Billed)"
    ],
    "non_functional_requirements": [
      "Ultra-low latency driver matching (< 3 seconds)",
      "High availability (no dropped trip states)",
      "Consistent location tracking with high GPS ingestion throughput"
    ],
    "constraints_and_assumptions": [
      "1 Million active drivers sending GPS coordinates every 4 seconds = 250,000 GPS writes/sec",
      "20 Million completed trips per day"
    ],
    "expected_deliverables": [
      "Geospatial indexing architecture (Uber H3 Hexagonal Hierarchical Spatial Index vs Google S2 / QuadTrees)",
      "High-throughput GPS Ingestion pipeline with Redis Geospatial / Kafka",
      "Driver matching state machine and lock concurrency handling"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "25 Million Riders, 1 Million Drivers",
      "requests_per_second": "250,000 GPS location updates/sec",
      "peak_requests_per_second": "500,000 GPS updates/sec",
      "read_write_ratio": "1:1 on locations",
      "storage_per_year": "Only latest driver location is hot; historical trips stored in Cassandra/Hudi",
      "bandwidth": "250,000 * 50 bytes = 12.5 MB/s incoming GPS stream"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 20,
      "security_weight": 5,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Do not store real-time driver coordinates in a relational database with SQL `UPDATE`! 250,000 writes/sec will destroy a relational DB. Store active driver locations in an in-memory geospatial index (Redis GEO or Uber H3 cells).",
      "Use Uber H3 (Hexagonal Hierarchical Spatial Index): The world is divided into hexagons. To find nearby drivers, query the rider's hexagon cell and immediate 1st and 2nd ring neighbor cells ($k$-ring).",
      "Driver Matching Concurrency: When 5 riders request rides simultaneously in the same area, lock the driver dispatch using a short Redis distributed lock (`SETNX` with 10s TTL) so multiple riders are never dispatched to the same driver."
    ],
    "starter_components": [
      {
        "name": "Driver App",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "Driver App"
      },
      {
        "name": "Rider App",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "Rider App"
      },
      {
        "name": "GPS Ingestion Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go GPS Service"
      },
      {
        "name": "Geospatial Index",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis GEO / H3"
      },
      {
        "name": "Dispatch Engine",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Matching Service"
      },
      {
        "name": "Trips DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      }
    ],
    "reference_solution": {
      "overview": "Drivers stream GPS pings to Go Location Ingestion pods that update in-memory Uber H3 hexagonal cells in Redis. Riders request rides via API Gateway; Dispatch Engine queries H3 neighbor cells for available drivers, scores drivers by ETA, and acquires a distributed lock on the selected driver before sending the dispatch offer.",
      "components": [
        {
          "id": "c1",
          "name": "Driver Apps",
          "category": "APPLICATION",
          "type": "MOBILE_CLIENT",
          "tech_choice": "iOS / Android",
          "description": "Streams GPS coordinates every 4s",
          "position": {
            "x": 50,
            "y": 100
          }
        },
        {
          "id": "c2",
          "name": "Rider Apps",
          "category": "APPLICATION",
          "type": "MOBILE_CLIENT",
          "tech_choice": "iOS / Android",
          "description": "Requests rides and views live map",
          "position": {
            "x": 50,
            "y": 300
          }
        },
        {
          "id": "c3",
          "name": "Location Ingestion Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Ingests 250K GPS pings/sec",
          "position": {
            "x": 260,
            "y": 100
          }
        },
        {
          "id": "c4",
          "name": "Redis Geospatial H3",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "Stores live driver positions indexed by H3 hex cell",
          "position": {
            "x": 480,
            "y": 100
          }
        },
        {
          "id": "c5",
          "name": "Dispatch Matching Engine",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Go",
          "description": "Matches riders with nearest available drivers",
          "position": {
            "x": 480,
            "y": 300
          }
        },
        {
          "id": "c6",
          "name": "Trip Lifecycle DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Stores ACID trip records, payments, and ratings",
          "position": {
            "x": 720,
            "y": 300
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c3",
          "protocol": "WebSocket",
          "description": "Continuous GPS telemetry stream",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "GEOADD / H3 index update",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c5",
          "protocol": "HTTPS",
          "description": "RequestRide(pickup_lat_lng, dest)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c5",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Query nearby available drivers in H3 cell",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c5",
          "to": "c6",
          "protocol": "SQL",
          "description": "Create Trip record in ACID state",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Uber H3 Hexagons (equal distance to all 6 neighbors, ideal for radius search) vs Google S2 (squares, distorted at boundaries)",
        "In-memory Redis Location (sub-millisecond lookups, volatile) vs Disk persistence (unnecessary for transient GPS pings)"
      ],
      "bottlenecks_and_mitigations": [
        "Driver double-booking race condition: Dispatch Engine uses Redis distributed lock with lease token on driver_id before offering ride"
      ]
    }
  },
  {
    "id": "sd_chal_12",
    "number": 12,
    "title": "Design a Real-Time Food Delivery Platform (DoorDash)",
    "slug": "food-delivery",
    "category": "E-Commerce & Geospatial",
    "difficulty": "INTERMEDIATE",
    "target_users": "Customers, restaurants, delivery drivers, dispatch coordinators",
    "description": "Design a 3-sided marketplace platform like DoorDash or Swiggy coordinating customers ordering food, restaurants managing live kitchen prep, and delivery couriers fulfilling orders with real-time ETA tracking.",
    "functional_requirements": [
      "Browse restaurant menus with live item availability",
      "Order placement, payment authorization, and live kitchen order acceptance",
      "Dynamic courier dispatch based on restaurant preparation time estimates",
      "Real-time delivery courier GPS tracking and dynamic ETA calculations"
    ],
    "non_functional_requirements": [
      "High consistency on order checkout and restaurant menu inventory",
      "Low latency real-time tracking updates (< 1 second)",
      "Resilience during extreme peak lunch and dinner traffic surges"
    ],
    "constraints_and_assumptions": [
      "10 Million Daily Active Users",
      "2 Million completed food orders per day",
      "Peak lunch traffic surge: 5x average order volume"
    ],
    "expected_deliverables": [
      "3-sided marketplace architecture integrating Customer, Merchant, and Courier services",
      "Order state machine and Saga compensation workflow",
      "Predictive ETA estimation service combining kitchen prep and driving route"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "10 Million",
      "requests_per_second": "5,000 browse RPS, 200 orders/sec avg, 1,000 orders/sec peak",
      "peak_requests_per_second": "25,000 browse RPS",
      "read_write_ratio": "25:1 read heavy",
      "storage_per_year": "2M orders * 365 * 2 KB = ~1.5 TB/year",
      "bandwidth": "Moderate"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 30,
      "data_consistency_weight": 20,
      "security_weight": 10,
      "observability_weight": 5,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Model the order lifecycle as a strict state machine: `CREATED` -> `PAID` -> `ACCEPTED_BY_KITCHEN` -> `COURIER_ASSIGNED` -> `PICKED_UP` -> `DELIVERED`.",
      "Do not dispatch the courier immediately when the customer clicks order! If food takes 25 minutes to cook, dispatching the courier instantly wastes 20 minutes of driver idle time outside the restaurant. Delay dispatch until prep time matches courier ETA.",
      "Restaurant menu caches should use Cache-Aside in Redis with instant invalidation when items sell out."
    ],
    "starter_components": [
      {
        "name": "Customer App",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "Customer App"
      },
      {
        "name": "Merchant Portal",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Kitchen Tablet"
      },
      {
        "name": "Courier App",
        "category": "APPLICATION",
        "type": "MOBILE_CLIENT",
        "tech": "Courier App"
      },
      {
        "name": "Order Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Java Order Service"
      },
      {
        "name": "Dispatch Engine",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Dispatch Engine"
      },
      {
        "name": "Order DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      }
    ],
    "reference_solution": {
      "overview": "Event-driven 3-sided marketplace. Order Service orchestrates payment and inserts into PostgreSQL. An event is emitted to Kafka: Merchant Tablet receives order via WebSocket and acknowledges prep time. An ETA and Dispatch Engine schedules courier dispatch to arrive precisely as kitchen finishes packaging.",
      "components": [
        {
          "id": "c1",
          "name": "Customer / Merchant / Courier",
          "category": "APPLICATION",
          "type": "MOBILE_CLIENT",
          "tech_choice": "React Native / Apps",
          "description": "3-sided participant clients",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "API Gateway Tier",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy Gateway",
          "description": "Routes and authenticates all 3 client types",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Order Management Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Spring",
          "description": "Coordinates order state machine and checkout",
          "position": {
            "x": 480,
            "y": 120
          }
        },
        {
          "id": "c4",
          "name": "Courier Dispatch Engine",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Dispatch Service",
          "description": "Matches courier based on prep completion ETA",
          "position": {
            "x": 480,
            "y": 280
          }
        },
        {
          "id": "c5",
          "name": "Order & Ledger DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "ACID store for financial orders and line items",
          "position": {
            "x": 700,
            "y": 120
          }
        },
        {
          "id": "c6",
          "name": "Live Event Hub",
          "category": "COMMUNICATION",
          "type": "WEBSOCKET_SERVICE",
          "tech_choice": "WebSocket Cluster",
          "description": "Streams live order status and driver GPS to customer",
          "position": {
            "x": 700,
            "y": 280
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Customer places order",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "ProcessOrder()",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Insert order record (ACID)",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c4",
          "protocol": "Kafka",
          "description": "OrderReadyForCourier event",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c4",
          "to": "c6",
          "protocol": "WebSocket",
          "description": "Dispatch courier & stream tracking",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c6",
          "to": "c1",
          "protocol": "WebSocket",
          "description": "Push live driver map location to customer",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Delayed Courier Dispatch (minimizes driver idle time, requires accurate prep time ML model) vs Immediate Dispatch",
        "ACID Relational Storage for orders vs NoSQL (relational guarantees required for payments and refunds)"
      ],
      "bottlenecks_and_mitigations": [
        "Flash dinner rush at 7 PM: Autoscale order pods proactively using predictive scaling 30 minutes before expected peaks"
      ]
    }
  },
  {
    "id": "sd_chal_13",
    "number": 13,
    "title": "Design an Online Marketplace Product Catalog (Amazon)",
    "slug": "online-marketplace",
    "category": "E-Commerce & Search",
    "difficulty": "INTERMEDIATE",
    "target_users": "Online shoppers, marketplace sellers, product indexing pipelines",
    "description": "Design an e-commerce product catalog and search service like Amazon hosting hundreds of millions of products with dynamic attribute facets, category hierarchies, seller offers, and instant search.",
    "functional_requirements": [
      "Browse products by category taxonomy (Electronics -> Laptops -> Gaming)",
      "Full-text search with faceted filters (Brand, Price, Customer Rating, Prime)",
      "Seller product management (Add, update stock, pricing)",
      "Buy Box algorithm selecting optimal seller offer for a product"
    ],
    "non_functional_requirements": [
      "Sub-50ms search and catalog page load times",
      "High availability (99.999% for product pages)",
      "Eventual consistency for catalog updates (updates reflect in search within 5 seconds)"
    ],
    "constraints_and_assumptions": [
      "500 Million distinct Products in the catalog",
      "100 Million daily searches and product page views"
    ],
    "expected_deliverables": [
      "CQRS architecture separating Seller Product Ingestion from Search & Read views",
      "Elasticsearch / OpenSearch cluster design with inverted index and custom analyzers",
      "Schema design for flexible, polymorphic product attributes (shoes have sizes, TVs have screen resolutions)"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "50 Million",
      "requests_per_second": "25,000 search/browse RPS",
      "peak_requests_per_second": "75,000 RPS",
      "read_write_ratio": "100:1 read heavy",
      "storage_per_year": "500M products * 5 KB = ~2.5 TB text + search indices",
      "bandwidth": "Substantial"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Never store dynamic e-commerce product attributes in strict relational SQL columns (you can't add 5,000 columns for every product variation). Use PostgreSQL JSONB or Document stores (MongoDB) for flexible attributes.",
      "Separate the Catalog Database from the Search Engine (CQRS): Product updates go to MongoDB/PostgreSQL, and an asynchronous pipeline streams changes to Elasticsearch for instant faceted queries.",
      "Cache popular product page JSON in Redis or CDN with a 5-minute TTL to shield search clusters from repeated viral queries."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Web / Mobile"
      },
      {
        "name": "Search Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Nginx"
      },
      {
        "name": "Catalog Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Java Spring Boot"
      },
      {
        "name": "Elasticsearch",
        "category": "STORAGE",
        "type": "SEARCH_INDEX",
        "tech": "OpenSearch Cluster"
      },
      {
        "name": "Product DB",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "Document Store / JSONB"
      },
      {
        "name": "Redis Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      }
    ],
    "reference_solution": {
      "overview": "CQRS Pattern. Primary catalog writes go to PostgreSQL with JSONB attributes. Debezium Change Data Capture (CDC) streams database WAL updates to Kafka. An ingestion worker updates Elasticsearch/OpenSearch indices. Client searches query OpenSearch directly with sub-30ms faceted filters.",
      "components": [
        {
          "id": "c1",
          "name": "Shopper Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React / Next.js",
          "description": "Searches and views products",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "API Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy",
          "description": "Authenticates and routes traffic",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Search Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Executes faceted queries against OpenSearch",
          "position": {
            "x": 480,
            "y": 120
          }
        },
        {
          "id": "c4",
          "name": "Catalog Management Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Spring",
          "description": "Handles seller updates and Buy Box scoring",
          "position": {
            "x": 480,
            "y": 280
          }
        },
        {
          "id": "c5",
          "name": "Elasticsearch / OpenSearch",
          "category": "STORAGE",
          "type": "SEARCH_INDEX",
          "tech_choice": "OpenSearch Cluster",
          "description": "Inverted index for full-text search and filters",
          "position": {
            "x": 700,
            "y": 120
          }
        },
        {
          "id": "c6",
          "name": "Product Master DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL (JSONB)",
          "description": "Canonical store for products, sellers, and prices",
          "position": {
            "x": 700,
            "y": 280
          }
        },
        {
          "id": "c7",
          "name": "Kafka CDC Pipeline",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "Debezium + Kafka",
          "description": "Streams DB WAL changes to search index",
          "position": {
            "x": 700,
            "y": 420
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Search and browse requests",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "SearchProducts(query, filters)",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "gRPC",
          "description": "UpdateProduct(seller_id, item)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "HTTP/REST",
          "description": "Execute inverted index search",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c4",
          "to": "c6",
          "protocol": "SQL",
          "description": "Persist canonical product document",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c6",
          "to": "c7",
          "protocol": "Replication_Log",
          "description": "Debezium captures WAL updates",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e7",
          "from": "c7",
          "to": "c5",
          "protocol": "HTTP/REST",
          "description": "Asynchronously update search index",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "CQRS with CDC (decoupled, ultra-fast search, 2-5 second index lag) vs Synchronous DB + Search dual-write (risk of index desync on network failure)",
        "JSONB Document attributes (flexible schema evolution) vs Strict relational tables"
      ],
      "bottlenecks_and_mitigations": [
        "Elasticsearch cluster CPU exhaustion during Black Friday: Cache top 10,000 search result pages in Redis with 60-second TTL"
      ]
    }
  },
  {
    "id": "sd_chal_14",
    "number": 14,
    "title": "Design an E-Commerce Checkout & Flash Sale System",
    "slug": "ecommerce-checkout",
    "category": "E-Commerce & High Concurrency",
    "difficulty": "ADVANCED",
    "target_users": "Global shoppers, flash sales (iPhone launches, Black Friday)",
    "description": "Design an e-commerce checkout and inventory reservation system that handles high-concurrency flash sales with atomic stock deduction, zero overselling, and automated cart expiration.",
    "functional_requirements": [
      "Reserve inventory when customer initiates checkout with a 10-minute hold lock",
      "Process payment securely and confirm order upon payment success",
      "Automatically release reserved inventory back to pool if payment is not completed within 10 minutes",
      "Zero overselling guarantee: under no circumstances may 100 items be sold to 101 customers"
    ],
    "non_functional_requirements": [
      "Strict consistency on inventory balances",
      "High concurrency: handle 50,000 users attempting to buy 1,000 limited items in the first 2 seconds of a sale",
      "Idempotent checkout and payment calls"
    ],
    "constraints_and_assumptions": [
      "Flash sale item stock: 10,000 units",
      "Peak traffic: 100,000 requests per second at the strike of 12:00 PM"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Queue, Redis Inventory Decoupling, Order Service, and Payment Gateway",
      "Inventory reservation strategy: Database Row Locks (`SELECT FOR UPDATE`) vs Redis Atomic Lua Scripts",
      "Delayed message queue pattern for releasing expired 10-minute inventory holds"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "20 Million",
      "requests_per_second": "100,000 RPS burst during flash sale",
      "peak_requests_per_second": "100,000 RPS",
      "read_write_ratio": "50:1",
      "storage_per_year": "50 Terabytes",
      "bandwidth": "High"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 30,
      "data_consistency_weight": 25,
      "security_weight": 5,
      "observability_weight": 5,
      "cost_awareness_weight": 0
    },
    "hints": [
      "Do NOT use standard SQL `SELECT * FROM inventory WHERE item_id = 1 FOR UPDATE` under 100,000 concurrent requests; the database row lock queue will cause thread exhaustion and connection pool crash.",
      "Pre-warm inventory counts in Redis. Use an atomic Redis Lua script with `DECRBY`: if result >= 0, reservation succeeds in sub-millisecond memory; if negative, immediately reject with 'Sold Out'!",
      "To release expired holds after 10 minutes, use a RabbitMQ/AWS SQS Dead Letter Queue with Delayed Message TTL (or Redis Sorted Set with expiration timestamp)."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Shopper Client"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Envoy"
      },
      {
        "name": "Order Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Order API"
      },
      {
        "name": "Redis Inventory",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Lua Cluster"
      },
      {
        "name": "Order DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      },
      {
        "name": "Delay Queue",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "RabbitMQ Delayed"
      }
    ],
    "reference_solution": {
      "overview": "Multi-tier inventory reservation. Redis Cluster evaluates an atomic Lua script that decrements in-memory stock. Successful reservations emit a delayed message into RabbitMQ (10-minute TTL) and persist a pending order in PostgreSQL. Payment completion commits the order; if payment fails or times out, the delayed worker increments stock back in Redis.",
      "components": [
        {
          "id": "c1",
          "name": "Shopper Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Web / Mobile",
          "description": "Submits checkout order",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "API Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy",
          "description": "Enforces rate limiting and token auth",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Checkout Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Checkout API",
          "description": "Coordinates stock hold and checkout",
          "position": {
            "x": 450,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Redis Inventory Lua",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "Atomic in-memory stock decrement (DECRBY)",
          "position": {
            "x": 450,
            "y": 60
          }
        },
        {
          "id": "c5",
          "name": "Order Ledger DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Canonical store for orders and payment status",
          "position": {
            "x": 680,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Delayed Expiration Queue",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "RabbitMQ Delayed Exchange",
          "description": "Holds 10-minute expiration timer messages",
          "position": {
            "x": 680,
            "y": 60
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "POST /checkout",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "InitiateCheckout()",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Atomic Lua stock decrement",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Insert Order(status=PENDING)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c3",
          "to": "c6",
          "protocol": "AMQP",
          "description": "Schedule 10-minute expiration check",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Redis In-Memory Atomic Reservation (100K RPS throughput, risk of cache/DB sync complexity) vs Direct SQL Row Locking (crashes at scale)",
        "10-Minute Cart Hold (great UX for buyer, temporarily reduces available stock for others)"
      ],
      "bottlenecks_and_mitigations": [
        "Flash sale start surge: Implement virtual waiting room (queueing tokens) in front of API Gateway to admit users at calibrated capacity"
      ]
    }
  },
  {
    "id": "sd_chal_15",
    "number": 15,
    "title": "Design a Distributed Payment Processing Gateway (Stripe)",
    "slug": "payment-processing",
    "category": "Fintech & Payments",
    "difficulty": "ADVANCED",
    "target_users": "E-commerce merchants, global banks, payment card networks (Visa/Mastercard)",
    "description": "Design a fault-tolerant, double-entry bookkeeping payment processing gateway like Stripe that authorizes card charges, coordinates with acquiring banks, and guarantees zero double-charging via idempotency.",
    "functional_requirements": [
      "Charge credit cards via payment networks with sub-3 second turnaround",
      "Idempotent API: Guaranteed zero double-charges on client retries or network drops",
      "Double-entry bookkeeping ledger ensuring total assets equal liabilities + equity ($0$ balance invariant)",
      "Support asynchronous webhooks notifying merchants of payment settlement"
    ],
    "non_functional_requirements": [
      "100% strict consistency for ledger transactions (ACID / linearizability)",
      "Zero data loss (Durability 99.999999999%)",
      "PCI-DSS compliance: sensitive credit card PANs never touch internal application logs"
    ],
    "constraints_and_assumptions": [
      "50 Million transactions processed per day (~600 TPS avg, 3,000 TPS peak)",
      "Bank networks experience high latency (1-3 seconds) and intermittent 5xx timeouts"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Token Vault, Idempotency Layer, Ledger Service, and Bank Gateway",
      "Double-Entry General Ledger schema design",
      "Idempotency state machine handling in-flight bank requests"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "1 Million Merchants",
      "requests_per_second": "600 TPS",
      "peak_requests_per_second": "3,000 TPS",
      "read_write_ratio": "2:1",
      "storage_per_year": "50M * 365 * 1 KB = ~18 TB immutable financial records per year",
      "bandwidth": "Moderate"
    },
    "evaluation_rubric": {
      "scalability_weight": 20,
      "reliability_weight": 35,
      "data_consistency_weight": 35,
      "security_weight": 10,
      "observability_weight": 0,
      "cost_awareness_weight": 0
    },
    "hints": [
      "Use the Idempotency Key Pattern: Insert client key with a UNIQUE constraint in SQL. If key already exists, return the cached result without contacting the banking network again.",
      "Double-Entry Bookkeeping: Every financial event must record at least two ledger entries (one Debit, one Credit) whose sums are mathematically equal. Never use a single 'balance' column with `UPDATE account SET balance = balance + 10`!",
      "Separate Card Tokenization into a locked-down PCI-compliant vault. The rest of your microservices only ever handle non-sensitive tokens like `tok_18f9b2`."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Merchant API Client"
      },
      {
        "name": "Payment API",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Payment API"
      },
      {
        "name": "Token Vault",
        "category": "STORAGE",
        "type": "SECRETS_MANAGER",
        "tech": "PCI Card Vault"
      },
      {
        "name": "Ledger Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Ledger Service"
      },
      {
        "name": "Ledger DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "CockroachDB / Postgres"
      },
      {
        "name": "Bank Gateway",
        "category": "INFRASTRUCTURE",
        "type": "EXTERNAL_API",
        "tech": "Visa/Mastercard"
      }
    ],
    "reference_solution": {
      "overview": "Payment Gateway accepts charge request with `Idempotency-Key`. Card PAN is exchanged for a token in a PCI vault. The payment state machine inserts a pending record in an ACID ledger DB. Bank gateway is invoked over mutual TLS. Upon authorization, double-entry ledger entries (debit customer, credit merchant) are atomically committed.",
      "components": [
        {
          "id": "c1",
          "name": "Merchant Apps",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "SDK / Web",
          "description": "Sends charge requests with Idempotency-Key",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Payment Gateway API",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Validates request and enforces idempotency",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "PCI Card Vault",
          "category": "INFRASTRUCTURE",
          "type": "SECRETS_MANAGER",
          "tech_choice": "Hardware HSM Vault",
          "description": "Tokenizes raw credit card numbers",
          "position": {
            "x": 260,
            "y": 60
          }
        },
        {
          "id": "c4",
          "name": "Ledger Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Java / Spring",
          "description": "Enforces double-entry bookkeeping rules",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c5",
          "name": "Ledger Database",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "CockroachDB / PostgreSQL",
          "description": "ACID immutable double-entry journal entries",
          "position": {
            "x": 700,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Acquiring Bank Network",
          "category": "INFRASTRUCTURE",
          "type": "EXTERNAL_API",
          "tech_choice": "Visa / Mastercard",
          "description": "External payment card network",
          "position": {
            "x": 480,
            "y": 350
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "POST /charges with Idempotency-Key",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "Exchange card token",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c6",
          "protocol": "HTTPS",
          "description": "Authorize charge with acquiring bank",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c2",
          "to": "c4",
          "protocol": "gRPC",
          "description": "RecordLedgerEntries()",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c4",
          "to": "c5",
          "protocol": "SQL",
          "description": "Atomic ACID commit (Debit = Credit)",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Double-Entry Bookkeeping (immutable, full financial auditability, requires 2+ rows per transaction) vs Single-Column Balance (fragile, impossible to audit)",
        "Synchronous Bank Call (immediate confirmation, higher latency) vs Asynchronous Settlement"
      ],
      "bottlenecks_and_mitigations": [
        "Bank network timeout: Mark payment as PENDING and enqueue automated reconciliation worker to query bank settlement status"
      ]
    }
  },
  {
    "id": "sd_chal_16",
    "number": 16,
    "title": "Design a High-Demand Ticket Booking Platform (Ticketmaster)",
    "slug": "ticket-booking",
    "category": "E-Commerce & High Concurrency",
    "difficulty": "ADVANCED",
    "target_users": "Concertgoers, sports fans, stadium ticketing operators",
    "description": "Design an online stadium seat reservation platform like Ticketmaster or BookMyShow that handles extreme seat contention when 500,000 fans compete for 50,000 concert tickets simultaneously.",
    "functional_requirements": [
      "Interactive visual seat selection on stadium map",
      "Lock selected seats for 8 minutes during checkout",
      "Prevent double-booking of any seat under high concurrency",
      "Search upcoming events by artist, city, and date"
    ],
    "non_functional_requirements": [
      "Strict consistency: a physical seat can be sold to exactly one buyer",
      "High burst availability during public on-sale ticket releases",
      "Sub-50ms seat map rendering latency"
    ],
    "constraints_and_assumptions": [
      "50,000 seats per stadium concert",
      "500,000 fans queuing at 10:00 AM ticket drop"
    ],
    "expected_deliverables": [
      "Architecture diagram featuring Virtual Queue Room, Seat State Cache, and Booking Service",
      "Seat locking concurrency model (Redis Distributed Locks vs DB Row Locks)",
      "Automatic lock release on 8-minute checkout timer expiration"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "10 Million",
      "requests_per_second": "50,000 RPS burst during on-sale",
      "peak_requests_per_second": "100,000 RPS",
      "read_write_ratio": "20:1",
      "storage_per_year": "10 Terabytes",
      "bandwidth": "High"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 30,
      "data_consistency_weight": 25,
      "security_weight": 5,
      "observability_weight": 5,
      "cost_awareness_weight": 0
    },
    "hints": [
      "Deploy a Virtual Waiting Room (like Cloudflare Waiting Room): Admitting 500,000 fans to the seat map simultaneously will crash the database. Buffer fans in a virtual queue and admit them in batches matching system throughput.",
      "Represent seat states in a Redis BitMap or Hash: `AVAILABLE`, `LOCKED`, `SOLD`. Locking a seat uses `SET seat:123:lock user_456 NX EX 480` (atomic 8-minute lease).",
      "If user abandons cart, the Redis key expires automatically in 480 seconds, restoring the seat to AVAILABLE without batch sweep jobs."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "React App"
      },
      {
        "name": "Waiting Room",
        "category": "INFRASTRUCTURE",
        "type": "RATE_LIMITER",
        "tech": "Cloudflare Queue"
      },
      {
        "name": "Seat Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Seat Service"
      },
      {
        "name": "Seat State Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "Booking DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      }
    ],
    "reference_solution": {
      "overview": "Virtual Waiting Room buffers ticket surges and grants cryptographically signed admission tokens. Admitted clients query stadium seat availability from Redis. Selecting a seat executes an atomic Redis SETNX with an 8-minute TTL lock. Order service commits payment in PostgreSQL and transitions seat to permanently SOLD.",
      "components": [
        {
          "id": "c1",
          "name": "Fans / Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React Web / Mobile",
          "description": "Selects seats on venue map",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Virtual Waiting Room",
          "category": "INFRASTRUCTURE",
          "type": "RATE_LIMITER",
          "tech_choice": "Cloudflare Waiting Room",
          "description": "Queues fans and throttles ingress",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Seat Reservation API",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Handles atomic seat holds",
          "position": {
            "x": 450,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Redis Seat Lock Cache",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "Atomic SETNX seat locks with 8-min TTL",
          "position": {
            "x": 450,
            "y": 60
          }
        },
        {
          "id": "c5",
          "name": "Ticketing DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "ACID store for ticket barcodes and payments",
          "position": {
            "x": 680,
            "y": 200
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Join ticket on-sale queue",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "Admitted fans request seat map",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Atomic seat lock (SETNX EX 480)",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Commit payment and mark SOLD",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Virtual Queue Throttling (protects database stability, transparent fair user wait) vs Free-for-All (crashes servers)",
        "Redis TTL Lease Locks (auto-cleans expired holds, low overhead) vs SQL DB Locks"
      ],
      "bottlenecks_and_mitigations": [
        "Scalper bot automated scraping: Integrate reCAPTCHA v3 and device fingerprinting at the waiting room boundary"
      ]
    }
  },
  {
    "id": "sd_chal_17",
    "number": 17,
    "title": "Design an Online Examination & Proctoring Platform",
    "slug": "online-examination",
    "category": "Education & High Stakes",
    "difficulty": "INTERMEDIATE",
    "target_users": "University students, certification examiners, AI proctors",
    "description": "Design an online examination platform like HackerRank or Mercer Mettl that delivers synchronized exam questions, autosaves student responses every 5 seconds, and processes AI webcam video proctoring feeds.",
    "functional_requirements": [
      "Synchronized exam start and strict countdown timer across all examinees",
      "Continuous answer autosave every 5 seconds with zero data loss",
      "Real-time webcam snapshot and audio telemetry streaming for AI proctoring",
      "Instant automated grading for objective questions and code test runners"
    ],
    "non_functional_requirements": [
      "100% answer durability (student answers must never be lost during browser crash)",
      "Fault tolerance: examinee can reconnect and resume immediately with remaining time intact",
      "High concurrency: handle 100,000 students starting an exam at the exact same second"
    ],
    "constraints_and_assumptions": [
      "100,000 concurrent students per university exam session",
      "Answer autosave every 5 seconds = 20,000 writes/sec"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Client Autosave, Redis Draft Store, and DB Write-Behind Pipeline",
      "State machine for Exam Session lifecycle",
      "Proctoring media ingestion and AI analysis pipeline"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "500,000 Students",
      "requests_per_second": "20,000 autosave writes/sec",
      "peak_requests_per_second": "50,000 RPS",
      "read_write_ratio": "1:10 write heavy on answer drafts",
      "storage_per_year": "5 Terabytes",
      "bandwidth": "Webcam snapshots: 100K students * 50 KB / 30s = ~166 MB/s"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 35,
      "data_consistency_weight": 20,
      "security_weight": 10,
      "observability_weight": 5,
      "cost_awareness_weight": 0
    },
    "hints": [
      "Do NOT execute direct SQL `UPDATE` queries for 20,000 autosaves every 5 seconds. Write drafts directly to in-memory Redis hashes (`HSET exam:42:student:101 question_3 'option_b'`) and flush asynchronously to PostgreSQL via Kafka Write-Behind.",
      "Server-Authoritative Timer: The countdown timer must live on the server, not in JavaScript (client clock can be tampered with).",
      "Store webcam snapshots in S3; trigger an asynchronous AI analysis worker via SQS to flag multiple faces or absent examinees without blocking test submissions."
    ],
    "starter_components": [
      {
        "name": "Student Browser",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "React Exam Client"
      },
      {
        "name": "Autosave Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Nginx"
      },
      {
        "name": "Exam API",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Exam Service"
      },
      {
        "name": "Redis Draft Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "Exam DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      },
      {
        "name": "Proctoring S3",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "AWS S3"
      }
    ],
    "reference_solution": {
      "overview": "Student client maintains local IndexedDB backup and autosaves answers every 5s to Go API. Answers are written to Redis Draft Store with a Write-Behind Kafka pipeline batch-committing to PostgreSQL. Webcam snapshots upload to S3; an async ML worker audits proctoring frames.",
      "components": [
        {
          "id": "c1",
          "name": "Examinee Client",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React + IndexedDB",
          "description": "Autosaves answers and streams snapshots",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Exam Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy",
          "description": "Authenticates student sessions",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Autosave Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go API",
          "description": "Ingests answer drafts at 20K writes/sec",
          "position": {
            "x": 450,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Redis Draft Store",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "High-throughput in-memory answer drafts",
          "position": {
            "x": 450,
            "y": 60
          }
        },
        {
          "id": "c5",
          "name": "Exam Canonical DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Committed exam submissions and grades",
          "position": {
            "x": 680,
            "y": 200
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "POST /exam/autosave every 5s",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "StreamAnswerDraft()",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "HSET student_draft",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Final exam submission commit",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Redis Draft Write-Behind (absorbs 20K writes/sec, guarantees zero SQL locks) vs Direct SQL",
        "Periodic Webcam Snapshots (1 snapshot every 30s, low bandwidth) vs Continuous WebRTC Video Stream (massive bandwidth cost)"
      ],
      "bottlenecks_and_mitigations": [
        "Internet disconnection at exam finish: Client caches submission in browser IndexedDB; retry with exponential backoff guarantees submission when connection restores"
      ]
    }
  },
  {
    "id": "sd_chal_18",
    "number": 18,
    "title": "Design a Scalable Learning Management System (Canvas / Coursera)",
    "slug": "learning-management-system",
    "category": "Education & Content",
    "difficulty": "BEGINNER",
    "target_users": "University professors, college students, academic administrators",
    "description": "Design an enterprise university Learning Management System (LMS) like Canvas or Coursera that supports course syllabus enrollment, lecture video streaming, assignment submissions, grading, and discussion forums.",
    "functional_requirements": [
      "Course creation, syllabus outline, and lecture module management",
      "Student enrollment and prerequisite verification",
      "Assignment submission (PDF/code uploads) and rubric grading",
      "Discussion board with nested forum replies and notifications"
    ],
    "non_functional_requirements": [
      "High availability during start-of-semester course registration",
      "Role-Based Access Control (Admin, Instructor, TA, Student)",
      "Sub-100ms course page load times"
    ],
    "constraints_and_assumptions": [
      "500,000 University Students across 50 Campuses",
      "Peak registration traffic: 10,000 concurrent course enrollments/sec"
    ],
    "expected_deliverables": [
      "Modular architecture separating Course Content, Enrollment Service, and Grading Service",
      "Relational schema for Courses, Modules, Assignments, and Submissions",
      "Course registration lock concurrency model"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "500,000",
      "requests_per_second": "2,000 RPS avg, 15,000 RPS peak during enrollment",
      "peak_requests_per_second": "15,000 RPS during enrollment",
      "read_write_ratio": "10:1 read heavy",
      "storage_per_year": "Assignment uploads in S3: 50 TB/year",
      "bandwidth": "Moderate"
    },
    "evaluation_rubric": {
      "scalability_weight": 25,
      "reliability_weight": 25,
      "data_consistency_weight": 25,
      "security_weight": 15,
      "observability_weight": 5,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Course registration has finite seat limits: use database transactions with `FOR UPDATE` or Redis atomic counters to prevent over-enrolling a 30-student lab class.",
      "Assignment files should upload directly to S3 using Pre-Signed URLs; store the S3 URL and hash in PostgreSQL.",
      "Cache static course syllabus and lecture reading pages in Redis with Cache-Aside to handle traffic spikes during midterm exams."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "React LMS Portal"
      },
      {
        "name": "LMS API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Nginx"
      },
      {
        "name": "Course Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Node.js / Express"
      },
      {
        "name": "Enrollment Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Service"
      },
      {
        "name": "LMS SQL DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      },
      {
        "name": "Assignments S3",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "AWS S3"
      }
    ],
    "reference_solution": {
      "overview": "Microservice-oriented LMS. Course Service serves cached course materials from Redis. Enrollment Service manages seat reservations via PostgreSQL transactions. Assignment uploads stream directly to S3 via pre-signed URLs with metadata committed to relational database.",
      "components": [
        {
          "id": "c1",
          "name": "Student & Faculty Web",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React SPA",
          "description": "Accesses courses and submits assignments",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "LMS Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy",
          "description": "Authenticates SSO / OAuth2 tokens and RBAC",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Course Content Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Node.js Service",
          "description": "Delivers syllabi, modules, and discussions",
          "position": {
            "x": 450,
            "y": 100
          }
        },
        {
          "id": "c4",
          "name": "Enrollment Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Manages course registration and seat caps",
          "position": {
            "x": 450,
            "y": 280
          }
        },
        {
          "id": "c5",
          "name": "LMS PostgreSQL DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Relational schema for courses, users, and grades",
          "position": {
            "x": 680,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Assignments S3",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "AWS S3",
          "description": "Stores homework PDFs and submitted code zips",
          "position": {
            "x": 680,
            "y": 350
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Client interaction",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTP/REST",
          "description": "Browse course content",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "gRPC",
          "description": "RegisterCourse(student_id, course_id)",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Query course structure",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c4",
          "to": "c5",
          "protocol": "SQL",
          "description": "Atomic seat check and enrollment commit",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c1",
          "to": "c6",
          "protocol": "HTTPS",
          "description": "Direct pre-signed upload of homework PDF",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Relational SQL for Enrollments (strict foreign keys, ACID seat limits) vs NoSQL",
        "Direct S3 Uploads (saves backend memory) vs Proxying uploads"
      ],
      "bottlenecks_and_mitigations": [
        "Registration morning stampede: Cache course catalog in Redis and enforce optimistic locking on seat count column"
      ]
    }
  },
  {
    "id": "sd_chal_19",
    "number": 19,
    "title": "Design a Real-Time Search Autocomplete Service (Typeahead)",
    "slug": "search-autocomplete",
    "category": "Search & Data Structures",
    "difficulty": "ADVANCED",
    "target_users": "Search engine users, e-commerce shoppers, browser address bars",
    "description": "Design an ultra-low latency real-time search typeahead suggestion service like Google Search Autocomplete that returns the top 5 most relevant queries matching a user's prefix within 15 milliseconds as they type.",
    "functional_requirements": [
      "Return top 5 query suggestions matching user prefix as they type each character",
      "Rank suggestions based on historical query search frequency and recency",
      "Real-time update pipeline incorporating newly trending viral searches within 15 minutes",
      "Filter out offensive terms and adult content"
    ],
    "non_functional_requirements": [
      "Ultra-low latency (< 15ms p99 response time)",
      "High availability (99.999% uptime)",
      "Scalable to 100,000 query requests per second"
    ],
    "constraints_and_assumptions": [
      "100 Million daily active searchers",
      "Average query: 4 words, 20 characters (generates ~10 keystrokes = 1 Billion typeahead requests/day)"
    ],
    "expected_deliverables": [
      "In-memory Trie (Prefix Tree) data structure design with pre-computed Top-K nodes",
      "Offline analytics aggregation pipeline updating frequency weights",
      "Trie sharding strategy across multiple memory nodes"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "100 Million",
      "requests_per_second": "100,000 typeahead requests/sec",
      "peak_requests_per_second": "250,000 RPS",
      "read_write_ratio": "1000:1 read heavy",
      "storage_per_year": "100 Million unique phrases * 30 bytes * Trie pointers = ~20-30 GB RAM (fits in memory!)",
      "bandwidth": "100,000 * 200 bytes = 20 MB/s"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 10,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Traversing a pure Trie and running a depth-first search (DFS) to find the top 5 highest-frequency leaves on every keystroke is too slow ($O(V+E)$). Instead, **pre-compute and store the Top-5 suggestions directly inside each Trie node**! Lookup becomes $O(L)$ where $L$ is prefix length!",
      "Client-Side Debouncing: Don't send an HTTP request on every single key press; wait 50-100ms after the user stops typing to cut traffic by 40%.",
      "Do not update the in-memory Trie synchronously for every search query! Log search events to Kafka, run a background MapReduce/Spark job to aggregate hourly frequency counts, and rebuild/swap the Trie in memory."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Search Bar"
      },
      {
        "name": "Typeahead Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Envoy"
      },
      {
        "name": "Autocomplete Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "C++ / Go Trie Service"
      },
      {
        "name": "Trie In-Memory Cluster",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Pre-computed Trie Nodes"
      },
      {
        "name": "Log Bus",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "Kafka"
      },
      {
        "name": "Aggregation Job",
        "category": "COMMUNICATION",
        "type": "BACKGROUND_WORKER",
        "tech": "Spark / Flink"
      }
    ],
    "reference_solution": {
      "overview": "Read Path: Client sends debounced prefix to Go/C++ Typeahead Server. Server looks up prefix in an in-memory Trie where every node contains a pre-sorted list of top 5 completions, returning in < 5ms. Write Path: Search clicks log to Kafka; an Apache Spark batch job recalculates frequency weights hourly and hot-swaps the Trie in RAM.",
      "components": [
        {
          "id": "c1",
          "name": "Search Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Web / Mobile Search Bar",
          "description": "Sends debounced prefix (e.g. 'sys')",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Edge CDN / Proxy",
          "category": "INFRASTRUCTURE",
          "type": "CDN",
          "tech_choice": "Cloudflare Edge",
          "description": "Caches top 1-letter and 2-letter prefix responses",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Typeahead Engine",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go / C++ Trie Daemon",
          "description": "Traverses in-memory prefix Trie in < 2ms",
          "position": {
            "x": 460,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "In-Memory Trie Store",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "RAM (Top-5 Precomputed)",
          "description": "Trie holding 100M phrases with top 5 keys per node",
          "position": {
            "x": 460,
            "y": 50
          }
        },
        {
          "id": "c5",
          "name": "Search Logs Bus",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "Apache Kafka",
          "description": "Streams completed search queries",
          "position": {
            "x": 680,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Analytics Aggregator",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Apache Spark",
          "description": "Aggregates phrase frequencies weekly",
          "position": {
            "x": 880,
            "y": 200
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "GET /complete?q=sys",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTP/REST",
          "description": "Cache miss routed to engine",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "TCP",
          "description": "Lookup node('sys') -> top_5 array",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c1",
          "to": "c5",
          "protocol": "HTTPS",
          "description": "Log finalized search submission",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c5",
          "to": "c6",
          "protocol": "Kafka",
          "description": "Stream events to aggregator",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c6",
          "to": "c4",
          "protocol": "TCP",
          "description": "Weekly atomic swap of Trie snapshot",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Pre-computing Top-5 inside each Trie node (instant $O(L)$ read latency, higher memory) vs Dynamic DFS traversal (minimal memory, slow $O(V+E)$ latency)",
        "Offline Hourly Batch Aggregation vs Real-time Trie mutations (real-time mutations cause write-lock contention in memory)"
      ],
      "bottlenecks_and_mitigations": [
        "Trie exceeds RAM of single machine: Shard Trie by first 2 letters (Server A owns 'a'-'c', Server B owns 'd'-'f') with consistent hashing"
      ]
    }
  },
  {
    "id": "sd_chal_20",
    "number": 20,
    "title": "Design a Distributed Web Crawler (Googlebot)",
    "slug": "web-crawler",
    "category": "Data Pipelines & Crawling",
    "difficulty": "ADVANCED",
    "target_users": "Search engine indexing bots, web archivers, research spiders",
    "description": "Design a high-throughput, polite distributed web crawler like Googlebot that fetches billions of web pages across the internet, parses links, avoids crawl loops, and respects robots.txt.",
    "functional_requirements": [
      "Crawl billions of web pages starting from a seed list of URLs",
      "Extract links from HTML and enqueue newly discovered URLs to crawl queue",
      "Politeness: Do not overwhelm any single target web host with concurrent requests",
      "Duplicate detection: Avoid re-crawling the exact same URL or duplicate content"
    ],
    "non_functional_requirements": [
      "Scalable to 1 Billion pages crawled per month (~400 pages/sec avg, 1,000 peak)",
      "Robustness against trap loops (infinite URLs like `calendar?day=...`)",
      "Strict adherence to `robots.txt` exclusion standards"
    ],
    "constraints_and_assumptions": [
      "1 Billion web pages crawled per month",
      "Average web page size: 100 Kilobytes HTML"
    ],
    "expected_deliverables": [
      "Architecture diagram featuring Frontier Queue (Polite & Priority Queues), Fetcher Nodes, DNS Cache, and Duplicate Eliminator",
      "Bloom Filter / Fingerprint algorithm for duplicate URL detection",
      "Politeness Queue design (Host-based queues with delay timers)"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "Automated Spider Fleet",
      "requests_per_second": "400 pages fetched/sec",
      "peak_requests_per_second": "1,000 pages/sec",
      "read_write_ratio": "1:1 fetch to store",
      "storage_per_year": "1B * 100 KB * 12 = ~1.2 Petabytes raw compressed HTML per year in Bigtable/S3",
      "bandwidth": "1,000 * 100 KB = 100 MB/s (800 Mbps) network bandwidth"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "URL Frontier Politeness: Never use a single FIFO queue! Group URLs by host (`domain.com`). Each host has its own queue with a rate limiter that enforces a minimum delay (e.g. 500ms) between requests to the same host.",
      "Duplicate URL Filtering: Storing 1 Billion string URLs in memory is too large. Use a **Bloom Filter** or store 64-bit SHA-256 hashes in an in-memory hash set to check if a URL has already been visited.",
      "DNS Lookup Bottleneck: Resolving DNS over standard internet DNS servers for 1,000 pages/sec will bottleneck. Maintain an in-memory DNS cache mapping domains to IP addresses."
    ],
    "starter_components": [
      {
        "name": "URL Frontier",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "Kafka / Custom Queue"
      },
      {
        "name": "Fetcher Workers",
        "category": "APPLICATION",
        "type": "BACKGROUND_WORKER",
        "tech": "Go Fetcher Fleet"
      },
      {
        "name": "DNS Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis DNS Cache"
      },
      {
        "name": "HTML Parser",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Parser Service"
      },
      {
        "name": "Duplicate Filter",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Bloom Filter"
      },
      {
        "name": "Document Store",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "HDFS / S3 / Bigtable"
      }
    ],
    "reference_solution": {
      "overview": "URL Frontier prioritizes URLs and dispatches them to Host-specific Politeness Queues. Asynchronous Go Fetcher workers resolve domains via a fast local DNS cache, fetch HTML, check robots.txt, and write raw pages to S3/Bigtable. HTML Parsers extract new links, filter duplicates via a Bloom Filter, and enqueue new URLs back to the Frontier.",
      "components": [
        {
          "id": "c1",
          "name": "URL Frontier Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Frontier Manager",
          "description": "Prioritizes and routes URLs to host queues",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Politeness Host Queues",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "Redis Host Queues",
          "description": "Enforces 500ms gap per domain",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Fetcher Worker Fleet",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Go Workers",
          "description": "Downloads HTML via HTTP/HTTPS",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Local DNS Cache",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "In-Memory DNS Cache",
          "description": "Caches IP address lookups locally",
          "position": {
            "x": 480,
            "y": 60
          }
        },
        {
          "id": "c5",
          "name": "Raw HTML Storage",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "S3 / Bigtable",
          "description": "Stores compressed crawled web pages",
          "position": {
            "x": 700,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Link Extractor & Bloom Filter",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Parser + Bloom Filter",
          "description": "Extracts links and deduplicates",
          "position": {
            "x": 480,
            "y": 350
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "TCP",
          "description": "Push URLs into domain queues",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "TCP",
          "description": "Fetchers pop polite URLs",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "TCP",
          "description": "Resolve domain to IP",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "HTTPS",
          "description": "Store raw compressed web page",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c3",
          "to": "c6",
          "protocol": "TCP",
          "description": "Send HTML to link extractor",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e6",
          "from": "c6",
          "to": "c1",
          "protocol": "TCP",
          "description": "Enqueue newly discovered unique URLs",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Bloom Filter (tiny memory footprint, small false-positive rate dropping a tiny fraction of new URLs) vs Full SQL Index (perfect accuracy, huge disk cost)",
        "Politeness Delay (prevents IP bans from web hosts, slows down overall crawl throughput)"
      ],
      "bottlenecks_and_mitigations": [
        "Spider Traps (infinite dynamic URLs): Impose maximum URL depth limits (max 10 directory hops) and limit pages per domain"
      ]
    }
  },
  {
    "id": "sd_chal_21",
    "number": 21,
    "title": "Design a Distributed Log Aggregation & Search Platform (ELK)",
    "slug": "logging-monitoring",
    "category": "Observability & Big Data",
    "difficulty": "ADVANCED",
    "target_users": "DevOps engineers, Site Reliability Engineers (SRE), security auditors",
    "description": "Design an enterprise-scale log analytics and aggregation pipeline like Elasticsearch / Fluentd / Kibana (ELK) or Grafana Loki that ingests gigabytes of streaming log lines per second, indexes them, and supports real-time text search.",
    "functional_requirements": [
      "Ingest structured JSON and unstructured plain-text log lines from thousands of server pods",
      "Full-text search across logs by timestamp, service name, log level (ERROR, INFO), and keywords",
      "Real-time alerting on error rate threshold spikes",
      "Automated log retention and archival (hot index for 7 days, cold S3 archive for 90 days)"
    ],
    "non_functional_requirements": [
      "Near-real-time search availability (logs searchable within 5 seconds of emission)",
      "Zero loss of critical error logs during peak traffic surges",
      "Scalable to 100 Terabytes of raw logs generated daily"
    ],
    "constraints_and_assumptions": [
      "10,000 Microservice instances emitting logs",
      "Average log volume: 100,000 log lines per second (~100 MB/s continuous ingestion)"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Log Shipper (Fluentd), Buffer Queue (Kafka), Log Indexer, and Search Cluster",
      "Elasticsearch Inverted Index vs Grafana Loki Label Indexing trade-off analysis",
      "Time-based index rotation and lifecycle management (`logs-2026-10-18`)"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "10,000 SREs and Developers",
      "requests_per_second": "100,000 log lines/sec",
      "peak_requests_per_second": "300,000 log lines/sec",
      "read_write_ratio": "1:100 write heavy",
      "storage_per_year": "100 TB/day * 365 = ~36.5 Petabytes raw (compressed to ~7 PB)",
      "bandwidth": "100 MB/s continuous network ingress"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 30,
      "data_consistency_weight": 10,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 5
    },
    "hints": [
      "Never let server pods send logs directly to Elasticsearch! If Elasticsearch slows down during indexing, your application servers will block on logging and crash. Always buffer logs into Apache Kafka.",
      "Index Lifecycle Management (ILM): Create daily time-partitioned indices (e.g. `logs-2026-10-18`). After 7 days, convert to read-only; after 30 days, export to compressed Parquet files in S3 and drop the index.",
      "Grafana Loki Approach: Instead of full-text indexing every single word (which makes indices larger than the raw logs!), only index metadata labels (`service=payment, level=error`) and compress raw text chunks."
    ],
    "starter_components": [
      {
        "name": "Log Shipper",
        "category": "INFRASTRUCTURE",
        "type": "LOGGING_SERVICE",
        "tech": "Fluentbit / Vector"
      },
      {
        "name": "Kafka Buffer",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "Apache Kafka"
      },
      {
        "name": "Log Indexer",
        "category": "APPLICATION",
        "type": "BACKGROUND_WORKER",
        "tech": "Logstash / Vector"
      },
      {
        "name": "Elasticsearch",
        "category": "STORAGE",
        "type": "SEARCH_INDEX",
        "tech": "Elasticsearch Cluster"
      },
      {
        "name": "Cold Storage",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "S3 Cold Archive"
      },
      {
        "name": "Kibana Dashboard",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Kibana / Grafana"
      }
    ],
    "reference_solution": {
      "overview": "Fluentbit daemonsets on Kubernetes nodes tail container logs and push to Apache Kafka. Logstash/Vector workers consume Kafka partitions in batches, enrich metadata, and bulk-insert into Elasticsearch daily index shards. Kibana queries Elasticsearch for real-time search, while an Index Lifecycle Manager migrates week-old shards to S3.",
      "components": [
        {
          "id": "c1",
          "name": "App Pods & Fluentbit",
          "category": "INFRASTRUCTURE",
          "type": "LOGGING_SERVICE",
          "tech_choice": "Fluentbit DaemonSet",
          "description": "Collects stdout logs from containers",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Kafka Log Buffer",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "Apache Kafka",
          "description": "Buffers 100K logs/sec and absorbs spikes",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Logstash Processing Fleet",
          "category": "APPLICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Logstash / Vector",
          "description": "Parses JSON and filters sensitive PII",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Elasticsearch Cluster",
          "category": "STORAGE",
          "type": "SEARCH_INDEX",
          "tech_choice": "OpenSearch / ES",
          "description": "Hot index with inverted text search",
          "position": {
            "x": 700,
            "y": 120
          }
        },
        {
          "id": "c5",
          "name": "Cold S3 Log Archive",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "AWS S3 Glacier",
          "description": "Cost-effective 90-day cold compliance archive",
          "position": {
            "x": 700,
            "y": 280
          }
        },
        {
          "id": "c6",
          "name": "Kibana UI",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Kibana / Grafana",
          "description": "SRE search dashboard and alerts",
          "position": {
            "x": 900,
            "y": 120
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "TCP",
          "description": "Stream logs to Kafka topics",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "Kafka",
          "description": "Pull log batches for transformation",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "HTTP/REST",
          "description": "Bulk index insert (`_bulk`)",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "TCP",
          "description": "ILM rolls old shards to S3",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c6",
          "to": "c4",
          "protocol": "HTTP/REST",
          "description": "Execute search query across indices",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Elasticsearch Full Inverted Index (blazing fast text search, index consumes 120% raw log size) vs Grafana Loki (only index labels, raw text compressed in S3, much cheaper)",
        "Bulk Indexing (batches 5,000 logs, 5-second latency) vs Single-message inserts (destroys ES write throughput)"
      ],
      "bottlenecks_and_mitigations": [
        "Elasticsearch node disk saturation: Automatically drop debug-level logs in production and enforce strict 7-day retention deletion"
      ]
    }
  },
  {
    "id": "sd_chal_22",
    "number": 22,
    "title": "Design a Distributed Job Scheduler (Airflow / Quartz)",
    "slug": "distributed-job-scheduler",
    "category": "Workflow & Orchestration",
    "difficulty": "ADVANCED",
    "target_users": "Data engineering teams, batch billing systems, automated cron workflows",
    "description": "Design a resilient distributed cron and workflow task scheduler like Apache Airflow or Quartz that executes millions of scheduled tasks across worker nodes with DAG dependencies, retries, and high availability.",
    "functional_requirements": [
      "Schedule one-time tasks and recurring cron jobs (e.g. `0 0 * * *`)",
      "Support Directed Acyclic Graph (DAG) task dependencies: Task C executes only after Task A and Task B complete",
      "Execute tasks across an auto-scaling distributed worker cluster",
      "Track task execution states (`QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`) with automatic retries and dead-lettering"
    ],
    "non_functional_requirements": [
      "High availability: scheduler master failover with zero missed jobs",
      "Sub-second dispatch accuracy for scheduled jobs",
      "Scalable to 10 Million scheduled tasks executing daily"
    ],
    "constraints_and_assumptions": [
      "10 Million jobs executed daily (~120 jobs/sec avg, 2,000 peak at midnight)",
      "Job execution durations range from 1 second to 4 hours"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Scheduler Master, Distributed Lock Coordinator, Task Queue, and Worker Fleet",
      "Leader election and lease renewal mechanism for the Scheduler Master",
      "Task state machine and DAG resolution engine"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "Enterprise Background Workloads",
      "requests_per_second": "120 jobs/sec avg",
      "peak_requests_per_second": "2,000 jobs/sec (midnight batch spike)",
      "read_write_ratio": "1:1",
      "storage_per_year": "Job run history: 10M * 365 * 1 KB = ~3.6 TB/year in PostgreSQL",
      "bandwidth": "Low"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 35,
      "data_consistency_weight": 20,
      "security_weight": 5,
      "observability_weight": 10,
      "cost_awareness_weight": 0
    },
    "hints": [
      "Avoid single-scheduler bottlenecks: Run an Active-Passive Scheduler pair with leader election in etcd/Zookeeper, or run multiple Active Schedulers that claim tasks using a distributed database lock (`SELECT * FROM tasks WHERE status = 'SCHEDULED' AND run_at <= NOW() FOR UPDATE SKIP LOCKED`).",
      "Decouple Scheduling from Execution: The scheduler should never run the job code directly; it simply enqueues job payloads into RabbitMQ/Kafka. Worker pods consume and execute tasks in isolated sandboxes.",
      "Use a Redis Sorted Set (`ZSET`) where score is the Unix timestamp `run_at`. Schedulers poll `ZRANGEBYSCORE tasks -inf now LIMIT 100` to find ready jobs in $O(\\log N)$ time."
    ],
    "starter_components": [
      {
        "name": "Scheduler Master",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Scheduler"
      },
      {
        "name": "Consensus Coordinator",
        "category": "DISTRIBUTED",
        "type": "LEADER",
        "tech": "etcd / Zookeeper"
      },
      {
        "name": "Task Queue",
        "category": "COMMUNICATION",
        "type": "MESSAGE_QUEUE",
        "tech": "RabbitMQ / SQS"
      },
      {
        "name": "Worker Cluster",
        "category": "COMMUNICATION",
        "type": "BACKGROUND_WORKER",
        "tech": "Worker Containers"
      },
      {
        "name": "Job Metadata DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      }
    ],
    "reference_solution": {
      "overview": "Active-Passive Scheduler architecture coordinated via etcd leader election. Ready tasks are identified via a Redis Sorted Set indexed by execution timestamp. The Leader enqueues runnable DAG nodes into RabbitMQ. Auto-scaled worker containers consume messages, execute code, and write task status updates to PostgreSQL.",
      "components": [
        {
          "id": "c1",
          "name": "Scheduler Primary",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Scheduler Daemon",
          "description": "Dispatches ready tasks and evaluates DAGs",
          "position": {
            "x": 240,
            "y": 140
          }
        },
        {
          "id": "c2",
          "name": "Scheduler Standby",
          "category": "DISTRIBUTED",
          "type": "FOLLOWER",
          "tech_choice": "Go Scheduler Standby",
          "description": "Standby scheduler ready to assume leadership",
          "position": {
            "x": 240,
            "y": 280
          }
        },
        {
          "id": "c3",
          "name": "etcd Consensus",
          "category": "DISTRIBUTED",
          "type": "LEADER",
          "tech_choice": "etcd Cluster",
          "description": "Maintains 10-second leadership lease",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Task Priority Queue",
          "category": "COMMUNICATION",
          "type": "MESSAGE_QUEUE",
          "tech_choice": "RabbitMQ / SQS",
          "description": "Buffers ready-to-run job payloads",
          "position": {
            "x": 480,
            "y": 140
          }
        },
        {
          "id": "c5",
          "name": "Worker Execution Fleet",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Docker Worker Fleet",
          "description": "Executes job payloads in sandboxed processes",
          "position": {
            "x": 700,
            "y": 140
          }
        },
        {
          "id": "c6",
          "name": "Job Metadata DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Canonical store for DAGs, runs, and logs",
          "position": {
            "x": 700,
            "y": 280
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c3",
          "protocol": "TCP",
          "description": "Renew leader lease every 3s",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "TCP",
          "description": "Watch leader key for failover",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c1",
          "to": "c4",
          "protocol": "AMQP",
          "description": "Enqueue runnable tasks",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "AMQP",
          "description": "Workers pull task messages",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c5",
          "to": "c6",
          "protocol": "SQL",
          "description": "Update task status = SUCCESS/FAILED",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Active-Passive with etcd (simple, zero race conditions) vs Multi-Active with SQL SKIP LOCKED (higher throughput, lock contention at scale)",
        "Decoupled Message Queue (smooths execution, worker autonomy) vs Direct RPC invocation"
      ],
      "bottlenecks_and_mitigations": [
        "Long-running tasks blocking queues: Enforce maximum execution timeouts and separate short jobs (< 1 min) from heavy batch jobs into distinct worker pools"
      ]
    }
  },
  {
    "id": "sd_chal_23",
    "number": 23,
    "title": "Design a Social News Aggregation Platform (Reddit / Hacker News)",
    "slug": "news-aggregation",
    "category": "Social & Ranking",
    "difficulty": "INTERMEDIATE",
    "target_users": "Discussion communities, link submissions, karma voting, comment trees",
    "description": "Design a community news aggregation and voting discussion platform like Reddit or Hacker News supporting user link submissions, real-time upvoting/downvoting with hot ranking algorithms, and deep nested comment trees.",
    "functional_requirements": [
      "Submit links and text posts into specific sub-communities (subreddits)",
      "Upvote and downvote posts and comments",
      "Hot ranking algorithm sorting posts based on vote score and post age",
      "Infinite nested hierarchical comment threads"
    ],
    "non_functional_requirements": [
      "Sub-50ms post feed read latency",
      "High availability (100:1 read-to-vote ratio)",
      "Prevent duplicate voting via idempotent vote tracking"
    ],
    "constraints_and_assumptions": [
      "50 Million Daily Active Users",
      "10 Million posts and 100 Million votes cast per day"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating Feed Caching, Vote Ingestion Queue, and Comment Tree Storage",
      "Hacker News / Reddit Hot Ranking algorithm formula",
      "Database design for nested comments (Adjacency List vs Materialized Path vs Nested Sets)"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "50 Million",
      "requests_per_second": "50,000 browse RPS, 1,200 votes/sec",
      "peak_requests_per_second": "100,000 browse RPS",
      "read_write_ratio": "50:1 read heavy",
      "storage_per_year": "10M posts * 365 * 1 KB = ~3.6 TB/year",
      "bandwidth": "High"
    },
    "evaluation_rubric": {
      "scalability_weight": 30,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 10,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Hacker News Hot Ranking: $\\text{Score} = (U - D - 1) / (T + 2)^G$, where $U$ is upvotes, $D$ is downvotes, $T$ is hours since submission, and $G=1.8$ gravity. Pre-calculate scores periodically in a background worker rather than calculating on every user read request!",
      "Nested Comments Modeling: Storing an `Adjacency List` (`parent_id`) requires recursive SQL queries. Use `Materialized Path` (e.g. `path = '0001.0004.0002'`), allowing single-query retrieval of entire comment subtrees with `WHERE path LIKE '0001.0004%' ORDER BY path`!",
      "Vote Ingestion: Buffer user upvotes in an in-memory Redis Sorted Set or Kafka queue to prevent database write-lock contention on viral posts."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "React / Next.js"
      },
      {
        "name": "API Gateway",
        "category": "APPLICATION",
        "type": "API_GATEWAY",
        "tech": "Nginx"
      },
      {
        "name": "Community Service",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Go Community API"
      },
      {
        "name": "Hot Feed Cache",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "Reddit SQL DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      }
    ],
    "reference_solution": {
      "overview": "Reads query pre-computed hot feeds directly from Redis Sorted Sets. When a user upvotes, the vote is recorded in a PostgreSQL user_votes table and published to Kafka. A Ranking Worker recalculates the Hacker News gravity score and updates the post's score in the Redis hot list. Nested comments are stored using Materialized Path in PostgreSQL for rapid subtree retrieval.",
      "components": [
        {
          "id": "c1",
          "name": "Community Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React Web / Mobile",
          "description": "Browses hot feeds and casts votes",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "API Gateway",
          "category": "APPLICATION",
          "type": "API_GATEWAY",
          "tech_choice": "Envoy",
          "description": "Authenticates user JWT tokens",
          "position": {
            "x": 240,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Post & Vote Service",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Go Service",
          "description": "Handles submissions and votes",
          "position": {
            "x": 460,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Redis Hot Ranking Cache",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster (ZSET)",
          "description": "Stores pre-sorted subreddit post lists",
          "position": {
            "x": 460,
            "y": 60
          }
        },
        {
          "id": "c5",
          "name": "Reddit PostgreSQL DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Stores posts and materialized path comments",
          "position": {
            "x": 680,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Ranking Calculation Worker",
          "category": "COMMUNICATION",
          "type": "BACKGROUND_WORKER",
          "tech_choice": "Go Ranking Worker",
          "description": "Recalculates gravity scores every 60s",
          "position": {
            "x": 680,
            "y": 60
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "HTTPS",
          "description": "Browse hot feed or submit vote",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTP/REST",
          "description": "Route request",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Read top 25 hot posts from ZSET",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Insert vote and fetch comment tree",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c6",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Update ZSET scores based on age decay",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Materialized Path for Comments (fast single-query subtree reads, slightly complex comment relocation) vs Adjacency List (slow recursive joins)",
        "Pre-computed Hot Ranking in Redis (instant reads, 60s score freshness delay) vs On-the-fly SQL computation (destroys DB under traffic)"
      ],
      "bottlenecks_and_mitigations": [
        "Viral post voting lock contention: Buffer votes in Redis counters and batch-commit to PostgreSQL every 10 seconds"
      ]
    }
  },
  {
    "id": "sd_chal_24",
    "number": 24,
    "title": "Design a Real-Time Collaborative Document Editor (Google Docs)",
    "slug": "real-time-collaborative-editor",
    "category": "Real-Time & Distributed Algorithms",
    "difficulty": "ADVANCED",
    "target_users": "Enterprise knowledge workers, document co-authors, real-time whiteboards",
    "description": "Design a concurrent real-time collaborative document editing system like Google Docs or Figma that allows multiple users to edit the same rich-text document simultaneously with conflict-free convergence and live cursor presence.",
    "functional_requirements": [
      "Multiple users can edit the same document concurrently with sub-50ms latency",
      "Conflict-free convergence: all users see the exact same document state eventually",
      "Live user cursor presence and active collaborator avatar indicators",
      "Document revision history, snapshot restore, and offline editing sync"
    ],
    "non_functional_requirements": [
      "High responsiveness (zero noticeable typing lag)",
      "Zero data loss during network disconnects",
      "High availability for document access"
    ],
    "constraints_and_assumptions": [
      "10 Million Daily Active Collaborators",
      "Up to 50 concurrent editors on a single hot document"
    ],
    "expected_deliverables": [
      "Architecture diagram illustrating WebSocket Gateway, Document Editing Server, and Storage",
      "Operational Transformation (OT) vs Conflict-Free Replicated Data Types (CRDTs) deep comparison",
      "Document snapshotting and change-log compaction architecture"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "10 Million",
      "requests_per_second": "50,000 keystroke operations/sec",
      "peak_requests_per_second": "150,000 ops/sec",
      "read_write_ratio": "1:1 continuous bidirectional mutations",
      "storage_per_year": "Document snapshots and operation logs: 50 TB/year",
      "bandwidth": "Substantial real-time WebSocket traffic"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 30,
      "data_consistency_weight": 25,
      "security_weight": 5,
      "observability_weight": 5,
      "cost_awareness_weight": 0
    },
    "hints": [
      "Operational Transformation (OT) vs CRDTs: OT requires a centralized server to order operations (Google Docs). CRDTs (Yjs, Automerge) are peer-to-peer conflict-free data structures that converge mathematically without a central arbiter (Figma).",
      "Session Affinity: To minimize cross-server network latency, route all concurrent editors of `document_123` to the exact same Document Server node using Consistent Hashing on `document_id`.",
      "Compaction: Storing every single individual keystroke forever will bloat storage. Take periodic document snapshots (every 100 operations) and compact old operational logs."
    ],
    "starter_components": [
      {
        "name": "Client",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "React Editor Client"
      },
      {
        "name": "Collab Gateway",
        "category": "COMMUNICATION",
        "type": "WEBSOCKET_SERVICE",
        "tech": "Go WebSocket Gateway"
      },
      {
        "name": "Document Server",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Node.js / Rust OT Server"
      },
      {
        "name": "Redis Session Registry",
        "category": "STORAGE",
        "type": "CACHE",
        "tech": "Redis Cluster"
      },
      {
        "name": "Doc Snapshot DB",
        "category": "STORAGE",
        "type": "SQL_DATABASE",
        "tech": "PostgreSQL Multi-AZ"
      },
      {
        "name": "S3 Doc Archive",
        "category": "STORAGE",
        "type": "OBJECT_STORAGE",
        "tech": "AWS S3"
      }
    ],
    "reference_solution": {
      "overview": "Consistent Hashing routes all active collaborators of a document to the same Document Server node via WebSockets. The Document Server executes Operational Transformation (OT) or hosts a shared Yjs CRDT model in RAM. Operations are acknowledged to clients in < 20ms and appended to a Redis WAL. Periodically, document state is snapshotted to PostgreSQL and archived to S3.",
      "components": [
        {
          "id": "c1",
          "name": "Co-Author Clients",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "React + Monaco / ProseMirror",
          "description": "Emits keystroke operations over WebSockets",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "WebSocket Routing Tier",
          "category": "COMMUNICATION",
          "type": "WEBSOCKET_SERVICE",
          "tech_choice": "Go WebSocket Gateway",
          "description": "Routes connections by document_id hash",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "Document Session Server",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Rust / Node.js OT Engine",
          "description": "Manages in-memory document state and OT sequencing",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c4",
          "name": "Redis Operation WAL",
          "category": "STORAGE",
          "type": "CACHE",
          "tech_choice": "Redis Cluster",
          "description": "Append-only log of recent operations",
          "position": {
            "x": 480,
            "y": 60
          }
        },
        {
          "id": "c5",
          "name": "Document Snapshot DB",
          "category": "STORAGE",
          "type": "SQL_DATABASE",
          "tech_choice": "PostgreSQL Multi-AZ",
          "description": "Periodic snapshots and user permissions",
          "position": {
            "x": 700,
            "y": 200
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c1",
          "to": "c2",
          "protocol": "WebSocket",
          "description": "Duplex operation stream",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c3",
          "protocol": "gRPC",
          "description": "Route to document session host",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c3",
          "to": "c4",
          "protocol": "Redis/RESP",
          "description": "Append operation to log",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c3",
          "to": "c2",
          "protocol": "gRPC",
          "description": "Broadcast transformed operation to collaborators",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c3",
          "to": "c5",
          "protocol": "SQL",
          "description": "Save snapshot every 100 ops",
          "direction": "UNIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Operational Transformation (requires central server, smaller payload) vs CRDTs (peer-to-peer capable, metadata overhead on text characters)",
        "Session Affinity per document (zero cross-host coordination, requires re-routing on host crash) vs Stateless routing"
      ],
      "bottlenecks_and_mitigations": [
        "Host crash during active editing: Standby node reloads latest snapshot from PostgreSQL, replays operations from Redis WAL, and reconnects clients in < 2s"
      ]
    }
  },
  {
    "id": "sd_chal_25",
    "number": 25,
    "title": "Design a Distributed Metrics Collection Platform (Prometheus)",
    "slug": "metrics-collection",
    "category": "Observability & Time-Series",
    "difficulty": "ADVANCED",
    "target_users": "Infrastructure engineers, Kubernetes clusters, telemetry monitoring systems",
    "description": "Design a high-throughput time-series metrics collection, storage, and querying platform like Prometheus, VictoriaMetrics, or Datadog that ingests millions of metric data points per second with Gorilla delta-of-delta compression.",
    "functional_requirements": [
      "Ingest time-series metric data points `(metric_name, labels, timestamp, float64_value)`",
      "Support PromQL-style aggregation queries (e.g. `rate(http_requests[5m])`)",
      "Real-time alerting rules evaluating threshold conditions every 15 seconds",
      "Data downsampling: raw 10s data for 14 days, downsampled 5m data for 1 year"
    ],
    "non_functional_requirements": [
      "Ultra-high write throughput (> 1 Million metric data points per second)",
      "High compression ratio (> 10x compression on disk)",
      "Sub-500ms dashboard query latency"
    ],
    "constraints_and_assumptions": [
      "10,000 Monitored Servers emitting 100 metrics each every 10 seconds",
      "Total ingestion rate: 1,000,000 metric samples per second"
    ],
    "expected_deliverables": [
      "Architecture diagram featuring Pull (Scrape) vs Push metrics ingestion, Time-Series Database (TSDB), and Alertmanager",
      "Gorilla Time-Series Compression algorithm (Double-delta timestamp compression & XOR float compression)",
      "Downsampling and retention pipeline"
    ],
    "scale_estimation_benchmarks": {
      "daily_active_users": "SRE and Platform Teams",
      "requests_per_second": "1,000,000 metric samples/sec",
      "peak_requests_per_second": "2,500,000 samples/sec",
      "read_write_ratio": "1:1000 write heavy",
      "storage_per_year": "1M samples/s * 1.5 bytes (Gorilla compressed) * 86,400 * 365 = ~47 Terabytes/year (massive 10x savings over raw 16-byte records!)",
      "bandwidth": "16 MB/s continuous ingress"
    },
    "evaluation_rubric": {
      "scalability_weight": 35,
      "reliability_weight": 25,
      "data_consistency_weight": 15,
      "security_weight": 5,
      "observability_weight": 10,
      "cost_awareness_weight": 10
    },
    "hints": [
      "Use the **Gorilla Compression Algorithm** (Facebook): Timestamps occur at regular intervals; store the *delta-of-deltas* (compresses 8-byte timestamps down to 1-2 bits!). Float values change slightly; store the XOR diff of adjacent IEEE 754 floats (compresses 8-byte floats down to 1.37 bytes average!).",
      "Pull vs Push: Prometheus uses **Pull (Scraping)** over HTTP `/metrics` to discover endpoints dynamically via Kubernetes Service Discovery and prevent lagging workers from swamping the monitoring server.",
      "Downsampling: After 14 days, run background rollup jobs that aggregate raw 10-second data into 5-minute averages, min, and max, slashing historical storage by 95%."
    ],
    "starter_components": [
      {
        "name": "Target Pods",
        "category": "INFRASTRUCTURE",
        "type": "CONTAINER",
        "tech": "App Metrics (/metrics)"
      },
      {
        "name": "Prometheus Scraper",
        "category": "APPLICATION",
        "type": "BACKEND_SERVICE",
        "tech": "Prometheus Server"
      },
      {
        "name": "Service Discovery",
        "category": "INFRASTRUCTURE",
        "type": "DNS",
        "tech": "Kube Service Discovery"
      },
      {
        "name": "TSDB Storage",
        "category": "STORAGE",
        "type": "NOSQL_DATABASE",
        "tech": "VictoriaMetrics / Thanos"
      },
      {
        "name": "Alertmanager",
        "category": "APPLICATION",
        "type": "NOTIFICATION_SERVICE",
        "tech": "Alertmanager"
      },
      {
        "name": "Grafana Dashboard",
        "category": "APPLICATION",
        "type": "WEB_CLIENT",
        "tech": "Grafana Dashboard"
      }
    ],
    "reference_solution": {
      "overview": "Prometheus server discovers target pods via Kubernetes Service Discovery and scrapes HTTP `/metrics` endpoints every 15s. Metrics are compressed in-memory using Facebook Gorilla delta-of-delta encoding and flushed to 2-hour TSDB blocks on disk. Thanos / Cortex provides long-term S3 object storage downsampling, and Grafana executes PromQL dashboard queries.",
      "components": [
        {
          "id": "c1",
          "name": "App Container Pods",
          "category": "INFRASTRUCTURE",
          "type": "CONTAINER",
          "tech_choice": "K8s App Pods",
          "description": "Exposes /metrics endpoint",
          "position": {
            "x": 50,
            "y": 200
          }
        },
        {
          "id": "c2",
          "name": "Prometheus Scraper Engine",
          "category": "APPLICATION",
          "type": "BACKEND_SERVICE",
          "tech_choice": "Prometheus Server",
          "description": "Scrapes targets and evaluates alert rules",
          "position": {
            "x": 260,
            "y": 200
          }
        },
        {
          "id": "c3",
          "name": "K8s Service Discovery",
          "category": "INFRASTRUCTURE",
          "type": "DNS",
          "tech_choice": "Kubernetes API",
          "description": "Discovers active pod IP targets",
          "position": {
            "x": 260,
            "y": 50
          }
        },
        {
          "id": "c4",
          "name": "Gorilla TSDB Engine",
          "category": "STORAGE",
          "type": "NOSQL_DATABASE",
          "tech_choice": "TSDB (Gorilla XOR)",
          "description": "In-memory head block and 2h disk blocks",
          "position": {
            "x": 480,
            "y": 200
          }
        },
        {
          "id": "c5",
          "name": "Long-Term S3 Archive",
          "category": "STORAGE",
          "type": "OBJECT_STORAGE",
          "tech_choice": "Thanos / AWS S3",
          "description": "Stores downsampled 5m/1h historical blocks",
          "position": {
            "x": 700,
            "y": 200
          }
        },
        {
          "id": "c6",
          "name": "Grafana Dashboard",
          "category": "APPLICATION",
          "type": "WEB_CLIENT",
          "tech_choice": "Grafana",
          "description": "Visualizes real-time PromQL graphs",
          "position": {
            "x": 480,
            "y": 350
          }
        }
      ],
      "connections": [
        {
          "id": "e1",
          "from": "c2",
          "to": "c3",
          "protocol": "HTTPS",
          "description": "Query active scrape targets",
          "direction": "BIDIRECTIONAL"
        },
        {
          "id": "e2",
          "from": "c2",
          "to": "c1",
          "protocol": "HTTP/REST",
          "description": "Scrape GET /metrics every 15s",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e3",
          "from": "c2",
          "to": "c4",
          "protocol": "TCP",
          "description": "Append samples with Gorilla encoding",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e4",
          "from": "c4",
          "to": "c5",
          "protocol": "HTTPS",
          "description": "Compact and ship 2h blocks to S3",
          "direction": "UNIDIRECTIONAL"
        },
        {
          "id": "e5",
          "from": "c6",
          "to": "c2",
          "protocol": "HTTP/REST",
          "description": "Execute PromQL instant and range queries",
          "direction": "BIDIRECTIONAL"
        }
      ],
      "key_tradeoffs": [
        "Pull Architecture (server controls rate, built-in health monitoring) vs Push Architecture (simple client, risk of DDOSing server)",
        "Gorilla Compression (1.37 bytes/sample, requires sequential time order) vs Uncompressed"
      ],
      "bottlenecks_and_mitigations": [
        "High-cardinality metric explosion (e.g. putting user_id in metric labels): Enforce strict linting rules stripping high-cardinality labels before ingestion"
      ]
    }
  }
];

export function getLessonById(lessonId: string): SystemDesignLesson | undefined {
  return SYSTEM_DESIGN_LESSONS.find(l => l.id === lessonId || l.slug === lessonId);
}

export function getChallengeById(challengeId: string): SystemDesignChallenge | undefined {
  return SYSTEM_DESIGN_CHALLENGES.find(c => c.id === challengeId || c.slug === challengeId);
}

// Backward compatibility helper for existing learningModulesService and tests
export function getSystemDesignProblems(): any[] {
  return SYSTEM_DESIGN_CHALLENGES.map(c => ({
    id: c.id,
    title: c.title,
    difficulty: c.difficulty,
    category: c.category,
    description: c.description,
    requirements: {
      functional: c.functional_requirements,
      nonFunctional: c.non_functional_requirements
    },
    starterComponents: c.starter_components || [],
    expectedDeliverables: c.expected_deliverables,
    evaluationRubric: c.evaluation_rubric,
    scaleEstimation: c.scale_estimation_benchmarks
  }));
}
