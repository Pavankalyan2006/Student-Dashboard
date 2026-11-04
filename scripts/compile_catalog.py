import sys
import json
import os

sys.path.append(os.path.join(os.path.dirname(__file__)))

import sd_curriculum_data
import sd_curriculum_level2
import sd_curriculum_level3
import sd_curriculum_level4
import sd_curriculum_level5
import sd_challenges_part1
import sd_challenges_part2

l1 = sd_curriculum_data.get_level1_lessons()
l2 = sd_curriculum_level2.get_level2_lessons()
l3 = sd_curriculum_level3.get_level3_lessons()
l4 = sd_curriculum_level4.get_level4_lessons()
l5 = sd_curriculum_level5.get_level5_lessons()

all_lessons = l1 + l2 + l3 + l4 + l5
c1 = sd_challenges_part1.get_challenges_part1()
c2 = sd_challenges_part2.get_challenges_part2()
all_challenges = c1 + c2

print(f"Total Lessons: {len(all_lessons)} (L1: {len(l1)}, L2: {len(l2)}, L3: {len(l3)}, L4: {len(l4)}, L5: {len(l5)})")
print(f"Total Challenges: {len(all_challenges)} (Part 1: {len(c1)}, Part 2: {len(c2)})")

assert len(all_lessons) == 69, f"Expected 69 lessons, got {len(all_lessons)}"
assert len(all_challenges) == 25, f"Expected 25 challenges, got {len(all_challenges)}"

# Standard component palette definition for 5 categories
component_palette = [
    # Application
    {"category": "APPLICATION", "type": "WEB_CLIENT", "name": "Web Client", "default_tech": "React / Next.js SPA", "description": "Desktop web browser client application", "icon": "Globe"},
    {"category": "APPLICATION", "type": "MOBILE_CLIENT", "name": "Mobile Client", "default_tech": "iOS / Android / Flutter", "description": "Mobile native application running on smartphones", "icon": "Smartphone"},
    {"category": "APPLICATION", "type": "WEB_SERVER", "name": "Web Server", "default_tech": "Nginx / OpenResty", "description": "Static content delivery, SSL termination, and reverse proxying", "icon": "Server"},
    {"category": "APPLICATION", "type": "APP_SERVER", "name": "Application Server", "default_tech": "Node.js / Express / Spring", "description": "Executes core business logic and processes student transactions", "icon": "Cpu"},
    {"category": "APPLICATION", "type": "BACKEND_SERVICE", "name": "Backend Microservice", "default_tech": "Go / Python FastAPI", "description": "Domain-bounded microservice implementing specific business capabilities", "icon": "Layers"},
    {"category": "APPLICATION", "type": "API_GATEWAY", "name": "API Gateway", "default_tech": "Kong / AWS API Gateway / Envoy", "description": "Unified routing, auth verification, SSL termination, and rate limiting", "icon": "ShieldCheck"},
    {"category": "APPLICATION", "type": "REVERSE_PROXY", "name": "Reverse Proxy", "default_tech": "HAProxy / Traefik", "description": "Directs client traffic to internal upstream servers", "icon": "GitFork"},
    {"category": "APPLICATION", "type": "LOAD_BALANCER", "name": "Load Balancer", "default_tech": "AWS ALB / Nginx L4/L7", "description": "Distributes concurrent incoming traffic across backend service instances", "icon": "Shuffle"},
    {"category": "APPLICATION", "type": "AUTH_SERVICE", "name": "Auth & Identity Service", "default_tech": "OAuth 2.0 / JWT / Keycloak", "description": "Issues tokens, authenticates sessions, and enforces RBAC policies", "icon": "Lock"},

    # Storage
    {"category": "STORAGE", "type": "SQL_DATABASE", "name": "SQL Database", "default_tech": "PostgreSQL 16 / MySQL 8.0", "description": "ACID-compliant relational database for structured schemas and transactional consistency", "icon": "Database"},
    {"category": "STORAGE", "type": "NOSQL_DATABASE", "name": "NoSQL Database", "default_tech": "MongoDB / Cassandra / DynamoDB", "description": "High-throughput schemaless document or key-value store for horizontal scale", "icon": "Table"},
    {"category": "STORAGE", "type": "CACHE", "name": "In-Memory Cache", "default_tech": "Redis Cluster / Memcached", "description": "Sub-millisecond latency distributed memory store for reads and sessions", "icon": "Zap"},
    {"category": "STORAGE", "type": "OBJECT_STORAGE", "name": "Object Storage", "default_tech": "AWS S3 / MinIO / GCS", "description": "Highly durable block/blob storage for media, files, and backups", "icon": "Archive"},
    {"category": "STORAGE", "type": "SEARCH_INDEX", "name": "Search Engine Index", "default_tech": "Elasticsearch / OpenSearch", "description": "Inverted index for full-text search, filtering, and scoring", "icon": "Search"},
    {"category": "STORAGE", "type": "DATA_WAREHOUSE", "name": "Data Warehouse", "default_tech": "Snowflake / Google BigQuery", "description": "Columnar analytical store for OLAP queries, business intelligence, and reporting", "icon": "BarChart3"},
    {"category": "STORAGE", "type": "VECTOR_DATABASE", "name": "Vector Database", "default_tech": "Pinecone / Milvus / pgvector", "description": "High-dimensional vector embedding storage for AI semantic similarity search", "icon": "Sparkles"},

    # Communication
    {"category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "name": "Message Queue", "default_tech": "RabbitMQ / AWS SQS", "description": "Asynchronous point-to-point task queue for decoupling workloads", "icon": "ListOrdered"},
    {"category": "COMMUNICATION", "type": "EVENT_BUS", "name": "Event Bus", "default_tech": "Apache EventMesh / AWS EventBridge", "description": "Publish-subscribe event fabric for enterprise domain events", "icon": "Radio"},
    {"category": "COMMUNICATION", "type": "STREAMING_PLATFORM", "name": "Streaming Platform", "default_tech": "Apache Kafka / AWS Kinesis", "description": "Distributed partitioned commit log for high-throughput real-time events", "icon": "Activity"},
    {"category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "name": "WebSocket Service", "default_tech": "Socket.io / ws gateway", "description": "Persistent bidirectional full-duplex TCP channels for real-time live updates", "icon": "Wifi"},
    {"category": "COMMUNICATION", "type": "NOTIFICATION_SERVICE", "name": "Notification Service", "default_tech": "Firebase FCM / Twilio / SendGrid", "description": "Omnichannel push notifications, SMS alerts, and transactional email dispatch", "icon": "Bell"},
    {"category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "name": "Background Worker", "default_tech": "Celery / BullMQ / Temporal", "description": "Async worker process consuming jobs from queues for offline processing", "icon": "Clock"},

    # Infrastructure
    {"category": "INFRASTRUCTURE", "type": "CDN", "name": "Content Delivery Network", "default_tech": "Cloudflare / AWS CloudFront", "description": "Edge network caching static assets close to end-users globally", "icon": "Cloud"},
    {"category": "INFRASTRUCTURE", "type": "DNS", "name": "Domain Name System", "default_tech": "AWS Route53 / Cloudflare DNS", "description": "Global latency-based, geo-routing DNS resolution", "icon": "Globe"},
    {"category": "INFRASTRUCTURE", "type": "CONTAINER", "name": "Application Container", "default_tech": "Docker OCI Image", "description": "Isolated microservice application packaging and execution unit", "icon": "Box"},
    {"category": "INFRASTRUCTURE", "type": "CONTAINER_ORCHESTRATION", "name": "Container Orchestrator", "default_tech": "Kubernetes (K8s) / EKS", "description": "Automated deployment, autoscaling, and management of containerized apps", "icon": "Grid"},
    {"category": "INFRASTRUCTURE", "type": "MONITORING_SERVICE", "name": "Monitoring & Metrics", "default_tech": "Prometheus + Grafana", "description": "Time-series telemetry collection, metrics dashboards, and SLO alerting", "icon": "LineChart"},
    {"category": "INFRASTRUCTURE", "type": "LOGGING_SERVICE", "name": "Centralized Logging", "default_tech": "ELK Stack / Loki", "description": "Distributed log ingestion, indexing, querying, and auditing", "icon": "FileText"},
    {"category": "INFRASTRUCTURE", "type": "SECRETS_MANAGER", "name": "Secrets Manager", "default_tech": "HashiCorp Vault / AWS Secrets Manager", "description": "Encrypted credentials, API keys, and certificate storage", "icon": "Key"},
    {"category": "INFRASTRUCTURE", "type": "FIREWALL", "name": "Web App Firewall (WAF)", "default_tech": "Cloudflare WAF / AWS WAF", "description": "DDoS protection, OWASP Top 10 mitigation, and IP rate limiting", "icon": "ShieldAlert"},
    {"category": "INFRASTRUCTURE", "type": "RATE_LIMITER", "name": "Rate Limiter", "default_tech": "Redis Token Bucket Rate Limiter", "description": "Protects internal APIs from noisy neighbors and burst abuse", "icon": "Gauge"},

    # Distributed Systems
    {"category": "DISTRIBUTED", "type": "PRIMARY_DB", "name": "Primary Database Node", "default_tech": "Postgres Primary / Leader", "description": "Handles all write mutations and syncs WAL replication stream", "icon": "Database"},
    {"category": "DISTRIBUTED", "type": "READ_REPLICA", "name": "Read Replica Node", "default_tech": "Postgres Read Replica / Follower", "description": "Read-only clone absorbing heavy read queries with async replication", "icon": "Copy"},
    {"category": "DISTRIBUTED", "type": "SHARD", "name": "Database Shard", "default_tech": "Citus / Vitess Shard Partition", "description": "Horizontally partitioned database slice indexed by hash or range shard key", "icon": "Split"},
    {"category": "DISTRIBUTED", "type": "LEADER", "name": "Consensus Leader", "default_tech": "Raft / Paxos Leader Node", "description": "Coordinates state machine replication and distributed consensus log", "icon": "Crown"},
    {"category": "DISTRIBUTED", "type": "FOLLOWER", "name": "Consensus Follower", "default_tech": "Raft Follower / Replica", "description": "Replicates state machine commands from elected consensus leader", "icon": "Users"},
    {"category": "DISTRIBUTED", "type": "REGIONAL_DEPLOYMENT", "name": "Regional Deployment", "default_tech": "Multi-Region VPC (us-east, eu-west)", "description": "Full stack clone deployed in geographically separated cloud region for low latency", "icon": "MapPin"},
    {"category": "DISTRIBUTED", "type": "FAILOVER_COMPONENT", "name": "Failover Controller", "default_tech": "Corosync / Keepalived / AWS Route53 Failover", "description": "Automated health check heartbeat monitor promoting standby nodes on outage", "icon": "RefreshCw"}
]

# Write out server/db/systemDesignCatalog.ts
target_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "server", "db", "systemDesignCatalog.ts"))

ts_code = f"""// server/db/systemDesignCatalog.ts
// Comprehensive System Design Curriculum Catalog (69 Lessons across 5 Levels),
// 25 Canonical System Design Challenges, Component Palette, and Architecture Seed Data.

import type {{
  SystemDesignLesson,
  SystemDesignChallenge,
  SystemDesignLevelInfo,
  ComponentCategory,
  ComponentType
}} from '../models/systemDesignTypes';

export interface PaletteComponentDef {{
  category: ComponentCategory;
  type: ComponentType;
  name: string;
  default_tech: string;
  description: string;
  icon: string;
}}

export const STANDARD_COMPONENT_PALETTE: PaletteComponentDef[] = {json.dumps(component_palette, indent=2)};

export const SYSTEM_DESIGN_ROADMAP_LEVELS: Omit<SystemDesignLevelInfo, 'lessons'>[] = [
  {{
    level: 1,
    name: 'Foundations',
    tagline: 'Requirements, Scale Fundamentals & Core Constraints',
    description: 'Master functional vs non-functional requirements, latency, throughput, availability math, and back-of-the-envelope estimation.',
    total_lessons: {len(l1)},
    completed_lessons: 0
  }},
  {{
    level: 2,
    name: 'Core Components',
    tagline: 'Building Blocks of Modern Web-Scale Systems',
    description: 'Deep dive into load balancers, caching strategies, SQL vs NoSQL, database replication, message queues, and API gateways.',
    total_lessons: {len(l2)},
    completed_lessons: 0
  }},
  {{
    level: 3,
    name: 'Distributed Systems',
    tagline: 'Consensus, Partitioning & Resiliency at Scale',
    description: 'Demystify CAP theorem, eventual consistency, distributed transactions, 2PC/Saga, sharding keys, rate limiting, and circuit breakers.',
    total_lessons: {len(l3)},
    completed_lessons: 0
  }},
  {{
    level: 4,
    name: 'Advanced Architecture',
    tagline: 'Enterprise Paradigms & Multi-Region Resiliency',
    description: 'Architect microservices, event sourcing, CQRS, stream processing with Kafka, multi-region failover, zero-trust security, and real-time systems.',
    total_lessons: {len(l4)},
    completed_lessons: 0
  }},
  {{
    level: 5,
    name: 'Interview Preparation',
    tagline: '10-Step Structured FAANG & Tech Lead Framework',
    description: 'Ace technical system design interviews using the proven 10-step methodology from requirements clarification to trade-off analysis.',
    total_lessons: {len(l5)},
    completed_lessons: 0
  }}
];

export const SYSTEM_DESIGN_LESSONS: SystemDesignLesson[] = {json.dumps(all_lessons, indent=2)};

export const SYSTEM_DESIGN_CHALLENGES: SystemDesignChallenge[] = {json.dumps(all_challenges, indent=2)};

export function getLessonById(lessonId: string): SystemDesignLesson | undefined {{
  return SYSTEM_DESIGN_LESSONS.find(l => l.id === lessonId || l.slug === lessonId);
}}

export function getChallengeById(challengeId: string): SystemDesignChallenge | undefined {{
  return SYSTEM_DESIGN_CHALLENGES.find(c => c.id === challengeId || c.slug === challengeId);
}}

// Backward compatibility helper for existing learningModulesService and tests
export function getSystemDesignProblems(): any[] {{
  return SYSTEM_DESIGN_CHALLENGES.map(c => ({{
    id: c.id,
    title: c.title,
    difficulty: c.difficulty,
    category: c.category,
    description: c.description,
    requirements: {{
      functional: c.functional_requirements,
      nonFunctional: c.non_functional_requirements
    }},
    starterComponents: c.starter_components || [],
    expectedDeliverables: c.expected_deliverables,
    evaluationRubric: c.evaluation_rubric,
    scaleEstimation: c.scale_estimation_benchmarks
  }}));
}}
"""

with open(target_file, "w", encoding="utf-8") as f:
    f.write(ts_code)

print(f"Successfully generated {target_file} ({len(ts_code)} bytes)")
