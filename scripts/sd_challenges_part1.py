# scripts/sd_challenges_part1.py
# Challenges 1 through 13 of the 25 Canonical System Design Exercises

def get_challenges_part1():
    return [
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Browser/Mobile"},
                {"name": "Cloudflare CDN", "category": "INFRASTRUCTURE", "type": "CDN", "tech": "Cloudflare Edge"},
                {"name": "Nginx Load Balancer", "category": "APPLICATION", "type": "LOAD_BALANCER", "tech": "Nginx L7"},
                {"name": "Shortener API Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go/Gin"},
                {"name": "Redis Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "SQL Database", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"}
            ],
            "reference_solution": {
                "overview": "Stateless Go microservice fronted by Cloudflare CDN edge caching and Nginx L7 load balancer. A Redis cluster caches hot URL keys (TTL 7 days). A pre-generating Key Generation Service (KGS) distributes token ranges via Zookeeper to guarantee zero hash collisions. Persistent mappings live in PostgreSQL/Cassandra with read replicas.",
                "components": [
                    {"id": "c1", "name": "Web & Mobile Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React/iOS", "description": "Requests link creation and follows redirects", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Edge CDN", "category": "INFRASTRUCTURE", "type": "CDN", "tech_choice": "Cloudflare", "description": "Caches popular redirect responses at the edge", "position": {"x": 220, "y": 200}},
                    {"id": "c3", "name": "Load Balancer", "category": "APPLICATION", "type": "LOAD_BALANCER", "tech_choice": "AWS ALB", "description": "Distributes traffic across stateless API containers", "position": {"x": 390, "y": 200}},
                    {"id": "c4", "name": "Shortener Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go / Gin", "description": "Handles encode, decode, and redirection logic", "position": {"x": 580, "y": 200}},
                    {"id": "c5", "name": "Key Generation Service (KGS)", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go + Zookeeper", "description": "Pre-generates Base62 tokens in memory", "position": {"x": 580, "y": 50}},
                    {"id": "c6", "name": "Redis URL Cache", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "In-memory LRU cache of hot URL mappings", "position": {"x": 780, "y": 120}},
                    {"id": "c7", "name": "Primary Database", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Persistent store mapping short_key to long_url", "position": {"x": 780, "y": 280}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Client sends redirect query", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "HTTPS", "description": "Cache miss forwards to origin", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "HTTP/REST", "description": "Load balances requests", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "gRPC", "description": "Fetches pre-allocated token batch", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c4", "to": "c6", "protocol": "Redis/RESP", "description": "Checks memory cache for short key", "direction": "BIDIRECTIONAL"},
                    {"id": "e6", "from": "c4", "to": "c7", "protocol": "SQL", "description": "Reads/writes URL records", "direction": "BIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "HTTP Client"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Kong/Envoy"},
                {"name": "Rate Limiter Filter", "category": "INFRASTRUCTURE", "type": "RATE_LIMITER", "tech": "Envoy Wasm Filter"},
                {"name": "Redis Cluster", "category": "STORAGE", "type": "CACHE", "tech": "Redis in-memory"},
                {"name": "Rule DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "Postgres Config DB"}
            ],
            "reference_solution": {
                "overview": "Envoy API Gateway intercepts incoming requests and evaluates a Token Bucket / Sliding Window Counter in a distributed Redis Cluster using atomic Lua scripts. If quota remains, request forwards to backend microservices; if exhausted, gateway returns 429 with Retry-After header.",
                "components": [
                    {"id": "c1", "name": "Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "HTTP Clients", "description": "Sends requests with API Key header", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy Proxy", "description": "Gateway intercepting all traffic", "position": {"x": 250, "y": 200}},
                    {"id": "c3", "name": "Rate Limiter Daemon", "category": "INFRASTRUCTURE", "type": "RATE_LIMITER", "tech_choice": "Go gRPC Service", "description": "Evaluates rate limit policies", "position": {"x": 450, "y": 100}},
                    {"id": "c4", "name": "Redis Memory Cluster", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "Stores sliding window counters atomically via Lua", "position": {"x": 650, "y": 100}},
                    {"id": "c5", "name": "Backend Microservices", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Kubernetes Pods", "description": "Protected backend services", "position": {"x": 450, "y": 280}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Client API call", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "CheckRateLimit(key, quota)", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "Atomic Lua EVALSHA", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c2", "to": "c5", "protocol": "HTTP/REST", "description": "Forwards request if rate check passes", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "iOS / Android"},
                {"name": "Notification API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Node.js / Express"},
                {"name": "Kafka Message Bus", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "Apache Kafka"},
                {"name": "Notification Workers", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech": "Go Worker Fleet"},
                {"name": "Device Token DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "DynamoDB"}
            ],
            "reference_solution": {
                "overview": "Stateless Ingestion API validates payload, checks user opt-out in Redis, and pushes notifications into partitioned Kafka topics separated by priority (high-priority 2FA vs bulk marketing). Worker pools consume messages, format templates, and dispatch to Apple APNS, Google FCM, and Twilio with circuit breakers and DLQs.",
                "components": [
                    {"id": "c1", "name": "Internal Services", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Order / Auth Services", "description": "Triggers notification requests", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Notification Ingestion API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go API", "description": "Validates request and checks user preferences", "position": {"x": 250, "y": 200}},
                    {"id": "c3", "name": "User Preferences & Tokens", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "DynamoDB / Redis", "description": "Stores user channels and APNS/FCM device tokens", "position": {"x": 250, "y": 60}},
                    {"id": "c4", "name": "Kafka Event Bus", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "Apache Kafka", "description": "Buffers notifications into priority and bulk topics", "position": {"x": 480, "y": 200}},
                    {"id": "c5", "name": "Delivery Workers", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Go Workers", "description": "Consumes events and dispatches to gateways", "position": {"x": 680, "y": 200}},
                    {"id": "c6", "name": "Third-Party Gateways", "category": "INFRASTRUCTURE", "type": "NOTIFICATION_SERVICE", "tech_choice": "APNS / FCM / Twilio", "description": "Delivers pushes and SMS to devices", "position": {"x": 880, "y": 200}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "gRPC", "description": "SendNotification(user_id, msg)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "TCP", "description": "Query device tokens and opt-out", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "Kafka", "description": "Enqueue notification event", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "Kafka", "description": "Workers poll partitions", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c5", "to": "c6", "protocol": "HTTPS", "description": "Dispatch to Apple/Google/Twilio", "direction": "UNIDIRECTIONAL"}
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
                "Do not use 3x replication for petabytes of data—it triples storage hardware cost (300% overhead). Use Erasure Coding (e.g. 8 data chunks + 4 parity chunks = only 50% overhead with superior durability!).",
                "Large files should be split into 5MB chunks client-side for parallel multipart upload with resume capabilities."
            ],
            "starter_components": [
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "AWS SDK"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Nginx L7"},
                {"name": "Metadata Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Metadata Server"},
                {"name": "Metadata DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "CockroachDB / Spanner"},
                {"name": "Storage Node Cluster", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "Commodity Disk Nodes"}
            ],
            "reference_solution": {
                "overview": "Two-tier architecture: 1) Metadata Tier manages buckets, access control, and chunk indices in a strongly consistent distributed database. 2) Data Node Cluster stores raw binary chunks across commodity disks encoded with Reed-Solomon Erasure Coding (8+4), supervised by a Master Coordinator that continuously audits disk health and triggers automated healing.",
                "components": [
                    {"id": "c1", "name": "Clients / SDKs", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "S3 REST SDK", "description": "Issues PUT and GET object requests", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "API Gateway Tier", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy / Nginx", "description": "Authenticates IAM credentials and routes", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Metadata Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Maps object keys to chunk IDs and locations", "position": {"x": 450, "y": 100}},
                    {"id": "c4", "name": "Metadata DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "CockroachDB (Raft)", "description": "Strongly consistent metadata index", "position": {"x": 680, "y": 100}},
                    {"id": "c5", "name": "Data Storage Nodes", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "HDD Storage Nodes", "description": "Persists erasure-coded binary chunks", "position": {"x": 450, "y": 280}},
                    {"id": "c6", "name": "Storage Master Coordinator", "category": "DISTRIBUTED", "type": "LEADER", "tech_choice": "Raft Leader", "description": "Monitors heartbeats and repairs bad disks", "position": {"x": 680, "y": 280}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "PUT/GET /bucket/file", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "Resolve object metadata", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "SQL", "description": "Look up chunk locations", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c2", "to": "c5", "protocol": "TCP", "description": "Stream binary chunks directly to/from disk", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c6", "to": "c5", "protocol": "TCP", "description": "Audit chunk health and re-encode parity", "direction": "BIDIRECTIONAL"}
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
                {"name": "Desktop Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Desktop Sync App"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Nginx"},
                {"name": "Block Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Rust Block Server"},
                {"name": "Metadata DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL"},
                {"name": "S3 Storage", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "Amazon S3"}
            ],
            "reference_solution": {
                "overview": "Desktop client splits files into 4MB chunks using rolling hash (Rabin fingerprinting). Hashes are queried against Metadata Service; only new/unseen chunks are uploaded to S3. A Sync Service publishes change events to an internal Redis Pub/Sub topic, which notifies connected user devices via long-lived WebSockets to trigger delta downloads.",
                "components": [
                    {"id": "c1", "name": "Sync Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Desktop / Mobile Client", "description": "Computes chunk hashes and delta diffs", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Block Server", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go / Rust", "description": "Receives and assembles binary chunks", "position": {"x": 280, "y": 100}},
                    {"id": "c3", "name": "Metadata Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Spring", "description": "Manages file trees, versions, and permissions", "position": {"x": 280, "y": 280}},
                    {"id": "c4", "name": "S3 Object Store", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "AWS S3", "description": "Stores deduplicated 4MB binary chunks", "position": {"x": 500, "y": 100}},
                    {"id": "c5", "name": "Metadata SQL DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Stores chunk manifests, files, and users", "position": {"x": 500, "y": 280}},
                    {"id": "c6", "name": "Notification Service", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech_choice": "Go WebSocket Fleet", "description": "Pushes real-time sync alerts to devices", "position": {"x": 500, "y": 420}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Upload new delta chunks", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c1", "to": "c3", "protocol": "HTTPS", "description": "Commit file manifest metadata", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "TCP", "description": "Persist chunk blobs to S3", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Save file revision tree", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c3", "to": "c6", "protocol": "TCP", "description": "Notify other devices of new revision", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c6", "to": "c1", "protocol": "WebSocket", "description": "Push sync notification to client", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "React Native / Swift"},
                {"name": "WebSocket Gateway", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech": "Go epoll server"},
                {"name": "Session Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "Kafka Bus", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "Apache Kafka"},
                {"name": "Chat DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "Apache Cassandra"}
            ],
            "reference_solution": {
                "overview": "Mobile clients establish TLS WebSockets to an auto-scaled WebSocket Gateway fleet. A Redis Session Registry tracks active user socket locations. When User A messages User B, Gateway queries Redis: if B is online, it forwards message directly through B's gateway. If B is offline, message is saved to Cassandra and a push notification is queued to Apple/Google.",
                "components": [
                    {"id": "c1", "name": "Mobile Clients", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech_choice": "iOS / Android", "description": "Maintains persistent socket connection", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "WebSocket Gateway Fleet", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech_choice": "Go epoll sockets", "description": "Maintains 100M open TCP socket connections", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Session & Presence Registry", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "Maps user_id -> socket_server_id", "position": {"x": 260, "y": 50}},
                    {"id": "c4", "name": "Chat Message Bus", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "Apache Kafka", "description": "Decouples message dispatch and persistence", "position": {"x": 480, "y": 200}},
                    {"id": "c5", "name": "Chat History Storage", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "Apache Cassandra", "description": "Wide-column store partitioned by conversation_id", "position": {"x": 700, "y": 200}},
                    {"id": "c6", "name": "Push Notification Service", "category": "COMMUNICATION", "type": "NOTIFICATION_SERVICE", "tech_choice": "FCM / APNS", "description": "Alerts offline users of incoming messages", "position": {"x": 700, "y": 350}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "WebSocket", "description": "Duplex socket messaging", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "Redis/RESP", "description": "Lookup recipient server location", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "Kafka", "description": "Publish message event", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "TCP", "description": "Asynchronously persist chat record", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c4", "to": "c6", "protocol": "HTTP/REST", "description": "Trigger push if recipient is offline", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Discord Desktop/Web"},
                {"name": "Gateway", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech": "Elixir / Go"},
                {"name": "Guild Router", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Actor Service"},
                {"name": "Channel DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "ScyllaDB"},
                {"name": "Redis Pub/Sub", "category": "COMMUNICATION", "type": "EVENT_BUS", "tech": "Redis"}
            ],
            "reference_solution": {
                "overview": "Guild Actor Service architecture where each guild has an in-memory stateful actor routing messages to connected client WebSockets. Messages are persisted once to ScyllaDB with partition key `channel_id`. Unread state is computed by comparing `last_message_id` with `user_read_pointer`.",
                "components": [
                    {"id": "c1", "name": "Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React / Electron", "description": "Connected via persistent WebSockets", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Gateway Nodes", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech_choice": "Go / Elixir", "description": "Manages user socket connections", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Guild Routing Actors", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Erlang / Go Actors", "description": "Maintains guild member presence and fan-out", "position": {"x": 480, "y": 200}},
                    {"id": "c4", "name": "ScyllaDB Message Store", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "ScyllaDB", "description": "Stores channel message history partitioned by channel_id", "position": {"x": 700, "y": 200}},
                    {"id": "c5", "name": "User Read State DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "Cassandra / DynamoDB", "description": "Stores user last_read_message_id per channel", "position": {"x": 700, "y": 350}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "WebSocket", "description": "Real-time socket communication", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "Route message to Guild Actor", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "TCP", "description": "Persist message to channel table", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c2", "protocol": "TCP", "description": "Fan-out to online member gateway sockets", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c2", "to": "c5", "protocol": "TCP", "description": "Update user read pointer on scroll", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "iOS / Web"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Envoy"},
                {"name": "Tweet Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Tweet Service"},
                {"name": "Timeline Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Java Timeline Service"},
                {"name": "Redis Feed Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "Tweet DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "Postgres / Cassandra"}
            ],
            "reference_solution": {
                "overview": "Hybrid Fan-Out Architecture. Tweets are written to PostgreSQL/Cassandra and published to Kafka. A Fan-Out Worker pool updates Redis Sorted Set timeline caches for regular users. For celebrity posts, timeline updates are skipped; Timeline Service pulls and merges celebrity posts on-the-fly during client feed requests.",
                "components": [
                    {"id": "c1", "name": "Clients", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech_choice": "React / Native", "description": "Views feeds and submits tweets", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Load Balancer & Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy L7", "description": "Authenticates and routes traffic", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Tweet Write Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Persists tweets with Snowflake IDs", "position": {"x": 450, "y": 100}},
                    {"id": "c4", "name": "Timeline Read Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Spring", "description": "Fetches and merges timeline feeds", "position": {"x": 450, "y": 280}},
                    {"id": "c5", "name": "Fan-Out Workers", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Go Workers", "description": "Pushes tweet IDs into follower Redis caches", "position": {"x": 680, "y": 100}},
                    {"id": "c6", "name": "Redis Timeline Cache", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster (ZSET)", "description": "Caches top 800 tweet IDs per active user", "position": {"x": 680, "y": 280}},
                    {"id": "c7", "name": "Tweet Database", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "Cassandra / Postgres", "description": "Persistent tweet content store", "position": {"x": 900, "y": 180}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Client requests", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "POST /tweets", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "gRPC", "description": "GET /timeline", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "Kafka", "description": "TweetCreated event", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c5", "to": "c6", "protocol": "Redis/RESP", "description": "ZADD follower_timeline tweet_id", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c4", "to": "c6", "protocol": "Redis/RESP", "description": "ZREVRANGEBYSCORE timeline", "direction": "BIDIRECTIONAL"},
                    {"id": "e7", "from": "c4", "to": "c7", "protocol": "TCP", "description": "Hydrate tweet text/metadata by IDs", "direction": "BIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Smart TV / Web Player"},
                {"name": "CDN Appliance", "category": "INFRASTRUCTURE", "type": "CDN", "tech": "Netflix Open Connect / CDN"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Zuul / Envoy"},
                {"name": "Playback Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Java Playback API"},
                {"name": "User Playback DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "Cassandra"}
            ],
            "reference_solution": {
                "overview": "Hybrid Cloud/Edge Architecture. Control plane (auth, search, user state, recommendations) runs in AWS cloud microservices backed by Cassandra and Redis. Data plane (video chunk delivery) runs entirely on custom Open Connect CDN appliances installed directly inside global ISP data centers.",
                "components": [
                    {"id": "c1", "name": "Streaming Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Smart TVs / Apps", "description": "Plays HLS adaptive bitrate chunks", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "ISP Edge CDN (Open Connect)", "category": "INFRASTRUCTURE", "type": "CDN", "tech_choice": "Custom FreeBSD CDN", "description": "Serves 95% of video chunk bits locally", "position": {"x": 260, "y": 100}},
                    {"id": "c3", "name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Zuul / Envoy", "description": "Authenticates users and routes requests", "position": {"x": 260, "y": 280}},
                    {"id": "c4", "name": "Playback Steering Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Spring", "description": "Returns signed manifest and nearest CDN URL", "position": {"x": 480, "y": 280}},
                    {"id": "c5", "name": "User State DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "Apache Cassandra", "description": "Stores resume timestamps and user profiles", "position": {"x": 700, "y": 280}},
                    {"id": "c6", "name": "S3 Master Video Storage", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "AWS S3", "description": "Master origin storing all encoded chunks", "position": {"x": 480, "y": 100}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c3", "protocol": "HTTPS", "description": "GET /playback/manifest/{movie_id}", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c3", "to": "c4", "protocol": "gRPC", "description": "Resolve playback request", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c4", "to": "c5", "protocol": "TCP", "description": "Read last watched timestamp", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c1", "protocol": "HTTPS", "description": "Return HLS manifest with CDN URLs", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Stream 2-second video chunks (.ts)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c2", "to": "c6", "protocol": "HTTPS", "description": "Fetch cache miss from S3 origin", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Creator Studio"},
                {"name": "Upload Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Upload API"},
                {"name": "Raw Video S3", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "S3 Ingestion Bucket"},
                {"name": "Transcode Queue", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "Kafka"},
                {"name": "Transcoder Fleet", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech": "FFmpeg Worker Fleet"},
                {"name": "Encoded S3", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "S3 Output Bucket"}
            ],
            "reference_solution": {
                "overview": "Creator uploads video directly to S3 Raw Bucket via Pre-Signed Multipart URL. An S3 Event triggers a Video Orchestrator that splits video into chunks and enqueues tasks in Kafka. A fleet of auto-scaled FFmpeg worker pods transcode chunks in parallel into multiple formats, saving encoded chunks into S3 and notifying the database when compilation completes.",
                "components": [
                    {"id": "c1", "name": "Creator Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Web / Mobile App", "description": "Uploads raw video chunks via multipart", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Upload API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Generates pre-signed upload URLs and records metadata", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "S3 Raw Bucket", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "AWS S3 Raw", "description": "Landing bucket for raw un-transcoded video", "position": {"x": 260, "y": 60}},
                    {"id": "c4", "name": "Job Orchestrator", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Temporal / DAG Engine", "description": "Slices video into parallel segment tasks", "position": {"x": 480, "y": 140}},
                    {"id": "c5", "name": "Transcoding Workers", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "FFmpeg GPU Spot Fleet", "description": "Encodes segments into H.264/VP9/AV1", "position": {"x": 700, "y": 140}},
                    {"id": "c6", "name": "S3 Encoded Video", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "AWS S3 Public", "description": "Stores final streaming chunks and HLS manifests", "position": {"x": 900, "y": 140}},
                    {"id": "c7", "name": "Video Metadata DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Stores video title, status, and analytics", "position": {"x": 480, "y": 300}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Request pre-signed upload URL", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c1", "to": "c3", "protocol": "HTTPS", "description": "Direct binary multipart upload", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Event", "description": "S3:ObjectCreated trigger", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "Kafka", "description": "Distribute segment transcoding jobs", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c5", "to": "c6", "protocol": "TCP", "description": "Write encoded chunks (.ts)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c4", "to": "c7", "protocol": "SQL", "description": "Mark video status = READY", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Driver App", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "Driver App"},
                {"name": "Rider App", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "Rider App"},
                {"name": "GPS Ingestion Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go GPS Service"},
                {"name": "Geospatial Index", "category": "STORAGE", "type": "CACHE", "tech": "Redis GEO / H3"},
                {"name": "Dispatch Engine", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Matching Service"},
                {"name": "Trips DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"}
            ],
            "reference_solution": {
                "overview": "Drivers stream GPS pings to Go Location Ingestion pods that update in-memory Uber H3 hexagonal cells in Redis. Riders request rides via API Gateway; Dispatch Engine queries H3 neighbor cells for available drivers, scores drivers by ETA, and acquires a distributed lock on the selected driver before sending the dispatch offer.",
                "components": [
                    {"id": "c1", "name": "Driver Apps", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech_choice": "iOS / Android", "description": "Streams GPS coordinates every 4s", "position": {"x": 50, "y": 100}},
                    {"id": "c2", "name": "Rider Apps", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech_choice": "iOS / Android", "description": "Requests rides and views live map", "position": {"x": 50, "y": 300}},
                    {"id": "c3", "name": "Location Ingestion Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Ingests 250K GPS pings/sec", "position": {"x": 260, "y": 100}},
                    {"id": "c4", "name": "Redis Geospatial H3", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "Stores live driver positions indexed by H3 hex cell", "position": {"x": 480, "y": 100}},
                    {"id": "c5", "name": "Dispatch Matching Engine", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Go", "description": "Matches riders with nearest available drivers", "position": {"x": 480, "y": 300}},
                    {"id": "c6", "name": "Trip Lifecycle DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Stores ACID trip records, payments, and ratings", "position": {"x": 720, "y": 300}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c3", "protocol": "WebSocket", "description": "Continuous GPS telemetry stream", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "GEOADD / H3 index update", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c5", "protocol": "HTTPS", "description": "RequestRide(pickup_lat_lng, dest)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c5", "to": "c4", "protocol": "Redis/RESP", "description": "Query nearby available drivers in H3 cell", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c5", "to": "c6", "protocol": "SQL", "description": "Create Trip record in ACID state", "direction": "BIDIRECTIONAL"}
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
                {"name": "Customer App", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "Customer App"},
                {"name": "Merchant Portal", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Kitchen Tablet"},
                {"name": "Courier App", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech": "Courier App"},
                {"name": "Order Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Java Order Service"},
                {"name": "Dispatch Engine", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Dispatch Engine"},
                {"name": "Order DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"}
            ],
            "reference_solution": {
                "overview": "Event-driven 3-sided marketplace. Order Service orchestrates payment and inserts into PostgreSQL. An event is emitted to Kafka: Merchant Tablet receives order via WebSocket and acknowledges prep time. An ETA and Dispatch Engine schedules courier dispatch to arrive precisely as kitchen finishes packaging.",
                "components": [
                    {"id": "c1", "name": "Customer / Merchant / Courier", "category": "APPLICATION", "type": "MOBILE_CLIENT", "tech_choice": "React Native / Apps", "description": "3-sided participant clients", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "API Gateway Tier", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy Gateway", "description": "Routes and authenticates all 3 client types", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Order Management Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Spring", "description": "Coordinates order state machine and checkout", "position": {"x": 480, "y": 120}},
                    {"id": "c4", "name": "Courier Dispatch Engine", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Dispatch Service", "description": "Matches courier based on prep completion ETA", "position": {"x": 480, "y": 280}},
                    {"id": "c5", "name": "Order & Ledger DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "ACID store for financial orders and line items", "position": {"x": 700, "y": 120}},
                    {"id": "c6", "name": "Live Event Hub", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech_choice": "WebSocket Cluster", "description": "Streams live order status and driver GPS to customer", "position": {"x": 700, "y": 280}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Customer places order", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "ProcessOrder()", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Insert order record (ACID)", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c4", "protocol": "Kafka", "description": "OrderReadyForCourier event", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c4", "to": "c6", "protocol": "WebSocket", "description": "Dispatch courier & stream tracking", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c6", "to": "c1", "protocol": "WebSocket", "description": "Push live driver map location to customer", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Web / Mobile"},
                {"name": "Search Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Nginx"},
                {"name": "Catalog Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Java Spring Boot"},
                {"name": "Elasticsearch", "category": "STORAGE", "type": "SEARCH_INDEX", "tech": "OpenSearch Cluster"},
                {"name": "Product DB", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "Document Store / JSONB"},
                {"name": "Redis Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"}
            ],
            "reference_solution": {
                "overview": "CQRS Pattern. Primary catalog writes go to PostgreSQL with JSONB attributes. Debezium Change Data Capture (CDC) streams database WAL updates to Kafka. An ingestion worker updates Elasticsearch/OpenSearch indices. Client searches query OpenSearch directly with sub-30ms faceted filters.",
                "components": [
                    {"id": "c1", "name": "Shopper Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React / Next.js", "description": "Searches and views products", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy", "description": "Authenticates and routes traffic", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Search Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Executes faceted queries against OpenSearch", "position": {"x": 480, "y": 120}},
                    {"id": "c4", "name": "Catalog Management Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Spring", "description": "Handles seller updates and Buy Box scoring", "position": {"x": 480, "y": 280}},
                    {"id": "c5", "name": "Elasticsearch / OpenSearch", "category": "STORAGE", "type": "SEARCH_INDEX", "tech_choice": "OpenSearch Cluster", "description": "Inverted index for full-text search and filters", "position": {"x": 700, "y": 120}},
                    {"id": "c6", "name": "Product Master DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL (JSONB)", "description": "Canonical store for products, sellers, and prices", "position": {"x": 700, "y": 280}},
                    {"id": "c7", "name": "Kafka CDC Pipeline", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "Debezium + Kafka", "description": "Streams DB WAL changes to search index", "position": {"x": 700, "y": 420}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Search and browse requests", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "SearchProducts(query, filters)", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "gRPC", "description": "UpdateProduct(seller_id, item)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "HTTP/REST", "description": "Execute inverted index search", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c4", "to": "c6", "protocol": "SQL", "description": "Persist canonical product document", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c6", "to": "c7", "protocol": "Replication_Log", "description": "Debezium captures WAL updates", "direction": "UNIDIRECTIONAL"},
                    {"id": "e7", "from": "c7", "to": "c5", "protocol": "HTTP/REST", "description": "Asynchronously update search index", "direction": "UNIDIRECTIONAL"}
                ],
                "key_tradeoffs": [
                    "CQRS with CDC (decoupled, ultra-fast search, 2-5 second index lag) vs Synchronous DB + Search dual-write (risk of index desync on network failure)",
                    "JSONB Document attributes (flexible schema evolution) vs Strict relational tables"
                ],
                "bottlenecks_and_mitigations": [
                    "Elasticsearch cluster CPU exhaustion during Black Friday: Cache top 10,000 search result pages in Redis with 60-second TTL"
                ]
            }
        }
    ]

print("Challenges Part 1 loaded: 13")
