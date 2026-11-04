# scripts/sd_challenges_part2.py
# Challenges 14 through 25 of the 25 Canonical System Design Exercises

def get_challenges_part2():
    return [
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Shopper Client"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Envoy"},
                {"name": "Order Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Order API"},
                {"name": "Redis Inventory", "category": "STORAGE", "type": "CACHE", "tech": "Redis Lua Cluster"},
                {"name": "Order DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"},
                {"name": "Delay Queue", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "RabbitMQ Delayed"}
            ],
            "reference_solution": {
                "overview": "Multi-tier inventory reservation. Redis Cluster evaluates an atomic Lua script that decrements in-memory stock. Successful reservations emit a delayed message into RabbitMQ (10-minute TTL) and persist a pending order in PostgreSQL. Payment completion commits the order; if payment fails or times out, the delayed worker increments stock back in Redis.",
                "components": [
                    {"id": "c1", "name": "Shopper Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Web / Mobile", "description": "Submits checkout order", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy", "description": "Enforces rate limiting and token auth", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Checkout Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Checkout API", "description": "Coordinates stock hold and checkout", "position": {"x": 450, "y": 200}},
                    {"id": "c4", "name": "Redis Inventory Lua", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "Atomic in-memory stock decrement (DECRBY)", "position": {"x": 450, "y": 60}},
                    {"id": "c5", "name": "Order Ledger DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Canonical store for orders and payment status", "position": {"x": 680, "y": 200}},
                    {"id": "c6", "name": "Delayed Expiration Queue", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "RabbitMQ Delayed Exchange", "description": "Holds 10-minute expiration timer messages", "position": {"x": 680, "y": 60}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "POST /checkout", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "InitiateCheckout()", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "Atomic Lua stock decrement", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Insert Order(status=PENDING)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c3", "to": "c6", "protocol": "AMQP", "description": "Schedule 10-minute expiration check", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Merchant API Client"},
                {"name": "Payment API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Payment API"},
                {"name": "Token Vault", "category": "STORAGE", "type": "SECRETS_MANAGER", "tech": "PCI Card Vault"},
                {"name": "Ledger Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Ledger Service"},
                {"name": "Ledger DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "CockroachDB / Postgres"},
                {"name": "Bank Gateway", "category": "INFRASTRUCTURE", "type": "EXTERNAL_API", "tech": "Visa/Mastercard"}
            ],
            "reference_solution": {
                "overview": "Payment Gateway accepts charge request with `Idempotency-Key`. Card PAN is exchanged for a token in a PCI vault. The payment state machine inserts a pending record in an ACID ledger DB. Bank gateway is invoked over mutual TLS. Upon authorization, double-entry ledger entries (debit customer, credit merchant) are atomically committed.",
                "components": [
                    {"id": "c1", "name": "Merchant Apps", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "SDK / Web", "description": "Sends charge requests with Idempotency-Key", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Payment Gateway API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Validates request and enforces idempotency", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "PCI Card Vault", "category": "INFRASTRUCTURE", "type": "SECRETS_MANAGER", "tech_choice": "Hardware HSM Vault", "description": "Tokenizes raw credit card numbers", "position": {"x": 260, "y": 60}},
                    {"id": "c4", "name": "Ledger Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Java / Spring", "description": "Enforces double-entry bookkeeping rules", "position": {"x": 480, "y": 200}},
                    {"id": "c5", "name": "Ledger Database", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "CockroachDB / PostgreSQL", "description": "ACID immutable double-entry journal entries", "position": {"x": 700, "y": 200}},
                    {"id": "c6", "name": "Acquiring Bank Network", "category": "INFRASTRUCTURE", "type": "EXTERNAL_API", "tech_choice": "Visa / Mastercard", "description": "External payment card network", "position": {"x": 480, "y": 350}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "POST /charges with Idempotency-Key", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "HTTPS", "description": "Exchange card token", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c6", "protocol": "HTTPS", "description": "Authorize charge with acquiring bank", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c2", "to": "c4", "protocol": "gRPC", "description": "RecordLedgerEntries()", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c4", "to": "c5", "protocol": "SQL", "description": "Atomic ACID commit (Debit = Credit)", "direction": "BIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "React App"},
                {"name": "Waiting Room", "category": "INFRASTRUCTURE", "type": "RATE_LIMITER", "tech": "Cloudflare Queue"},
                {"name": "Seat Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Seat Service"},
                {"name": "Seat State Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "Booking DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"}
            ],
            "reference_solution": {
                "overview": "Virtual Waiting Room buffers ticket surges and grants cryptographically signed admission tokens. Admitted clients query stadium seat availability from Redis. Selecting a seat executes an atomic Redis SETNX with an 8-minute TTL lock. Order service commits payment in PostgreSQL and transitions seat to permanently SOLD.",
                "components": [
                    {"id": "c1", "name": "Fans / Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React Web / Mobile", "description": "Selects seats on venue map", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Virtual Waiting Room", "category": "INFRASTRUCTURE", "type": "RATE_LIMITER", "tech_choice": "Cloudflare Waiting Room", "description": "Queues fans and throttles ingress", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Seat Reservation API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Handles atomic seat holds", "position": {"x": 450, "y": 200}},
                    {"id": "c4", "name": "Redis Seat Lock Cache", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "Atomic SETNX seat locks with 8-min TTL", "position": {"x": 450, "y": 60}},
                    {"id": "c5", "name": "Ticketing DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "ACID store for ticket barcodes and payments", "position": {"x": 680, "y": 200}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Join ticket on-sale queue", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "HTTPS", "description": "Admitted fans request seat map", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "Atomic seat lock (SETNX EX 480)", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Commit payment and mark SOLD", "direction": "BIDIRECTIONAL"}
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
                {"name": "Student Browser", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "React Exam Client"},
                {"name": "Autosave Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Nginx"},
                {"name": "Exam API", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Exam Service"},
                {"name": "Redis Draft Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "Exam DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"},
                {"name": "Proctoring S3", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "AWS S3"}
            ],
            "reference_solution": {
                "overview": "Student client maintains local IndexedDB backup and autosaves answers every 5s to Go API. Answers are written to Redis Draft Store with a Write-Behind Kafka pipeline batch-committing to PostgreSQL. Webcam snapshots upload to S3; an async ML worker audits proctoring frames.",
                "components": [
                    {"id": "c1", "name": "Examinee Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React + IndexedDB", "description": "Autosaves answers and streams snapshots", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Exam Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy", "description": "Authenticates student sessions", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Autosave Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go API", "description": "Ingests answer drafts at 20K writes/sec", "position": {"x": 450, "y": 200}},
                    {"id": "c4", "name": "Redis Draft Store", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "High-throughput in-memory answer drafts", "position": {"x": 450, "y": 60}},
                    {"id": "c5", "name": "Exam Canonical DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Committed exam submissions and grades", "position": {"x": 680, "y": 200}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "POST /exam/autosave every 5s", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "StreamAnswerDraft()", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "HSET student_draft", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Final exam submission commit", "direction": "BIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "React LMS Portal"},
                {"name": "LMS API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Nginx"},
                {"name": "Course Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Node.js / Express"},
                {"name": "Enrollment Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Service"},
                {"name": "LMS SQL DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"},
                {"name": "Assignments S3", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "AWS S3"}
            ],
            "reference_solution": {
                "overview": "Microservice-oriented LMS. Course Service serves cached course materials from Redis. Enrollment Service manages seat reservations via PostgreSQL transactions. Assignment uploads stream directly to S3 via pre-signed URLs with metadata committed to relational database.",
                "components": [
                    {"id": "c1", "name": "Student & Faculty Web", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React SPA", "description": "Accesses courses and submits assignments", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "LMS Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy", "description": "Authenticates SSO / OAuth2 tokens and RBAC", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Course Content Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Node.js Service", "description": "Delivers syllabi, modules, and discussions", "position": {"x": 450, "y": 100}},
                    {"id": "c4", "name": "Enrollment Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Manages course registration and seat caps", "position": {"x": 450, "y": 280}},
                    {"id": "c5", "name": "LMS PostgreSQL DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Relational schema for courses, users, and grades", "position": {"x": 680, "y": 200}},
                    {"id": "c6", "name": "Assignments S3", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "AWS S3", "description": "Stores homework PDFs and submitted code zips", "position": {"x": 680, "y": 350}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Client interaction", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "HTTP/REST", "description": "Browse course content", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "gRPC", "description": "RegisterCourse(student_id, course_id)", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Query course structure", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c4", "to": "c5", "protocol": "SQL", "description": "Atomic seat check and enrollment commit", "direction": "BIDIRECTIONAL"},
                    {"id": "e6", "from": "c1", "to": "c6", "protocol": "HTTPS", "description": "Direct pre-signed upload of homework PDF", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Search Bar"},
                {"name": "Typeahead Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Envoy"},
                {"name": "Autocomplete Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "C++ / Go Trie Service"},
                {"name": "Trie In-Memory Cluster", "category": "STORAGE", "type": "CACHE", "tech": "Pre-computed Trie Nodes"},
                {"name": "Log Bus", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "Kafka"},
                {"name": "Aggregation Job", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech": "Spark / Flink"}
            ],
            "reference_solution": {
                "overview": "Read Path: Client sends debounced prefix to Go/C++ Typeahead Server. Server looks up prefix in an in-memory Trie where every node contains a pre-sorted list of top 5 completions, returning in < 5ms. Write Path: Search clicks log to Kafka; an Apache Spark batch job recalculates frequency weights hourly and hot-swaps the Trie in RAM.",
                "components": [
                    {"id": "c1", "name": "Search Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Web / Mobile Search Bar", "description": "Sends debounced prefix (e.g. 'sys')", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Edge CDN / Proxy", "category": "INFRASTRUCTURE", "type": "CDN", "tech_choice": "Cloudflare Edge", "description": "Caches top 1-letter and 2-letter prefix responses", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Typeahead Engine", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go / C++ Trie Daemon", "description": "Traverses in-memory prefix Trie in < 2ms", "position": {"x": 460, "y": 200}},
                    {"id": "c4", "name": "In-Memory Trie Store", "category": "STORAGE", "type": "CACHE", "tech_choice": "RAM (Top-5 Precomputed)", "description": "Trie holding 100M phrases with top 5 keys per node", "position": {"x": 460, "y": 50}},
                    {"id": "c5", "name": "Search Logs Bus", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "Apache Kafka", "description": "Streams completed search queries", "position": {"x": 680, "y": 200}},
                    {"id": "c6", "name": "Analytics Aggregator", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Apache Spark", "description": "Aggregates phrase frequencies weekly", "position": {"x": 880, "y": 200}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "GET /complete?q=sys", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "HTTP/REST", "description": "Cache miss routed to engine", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "TCP", "description": "Lookup node('sys') -> top_5 array", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c1", "to": "c5", "protocol": "HTTPS", "description": "Log finalized search submission", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c5", "to": "c6", "protocol": "Kafka", "description": "Stream events to aggregator", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c6", "to": "c4", "protocol": "TCP", "description": "Weekly atomic swap of Trie snapshot", "direction": "UNIDIRECTIONAL"}
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
                {"name": "URL Frontier", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "Kafka / Custom Queue"},
                {"name": "Fetcher Workers", "category": "APPLICATION", "type": "BACKGROUND_WORKER", "tech": "Go Fetcher Fleet"},
                {"name": "DNS Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis DNS Cache"},
                {"name": "HTML Parser", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Parser Service"},
                {"name": "Duplicate Filter", "category": "STORAGE", "type": "CACHE", "tech": "Bloom Filter"},
                {"name": "Document Store", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "HDFS / S3 / Bigtable"}
            ],
            "reference_solution": {
                "overview": "URL Frontier prioritizes URLs and dispatches them to Host-specific Politeness Queues. Asynchronous Go Fetcher workers resolve domains via a fast local DNS cache, fetch HTML, check robots.txt, and write raw pages to S3/Bigtable. HTML Parsers extract new links, filter duplicates via a Bloom Filter, and enqueue new URLs back to the Frontier.",
                "components": [
                    {"id": "c1", "name": "URL Frontier Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Frontier Manager", "description": "Prioritizes and routes URLs to host queues", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Politeness Host Queues", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "Redis Host Queues", "description": "Enforces 500ms gap per domain", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Fetcher Worker Fleet", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Go Workers", "description": "Downloads HTML via HTTP/HTTPS", "position": {"x": 480, "y": 200}},
                    {"id": "c4", "name": "Local DNS Cache", "category": "STORAGE", "type": "CACHE", "tech_choice": "In-Memory DNS Cache", "description": "Caches IP address lookups locally", "position": {"x": 480, "y": 60}},
                    {"id": "c5", "name": "Raw HTML Storage", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "S3 / Bigtable", "description": "Stores compressed crawled web pages", "position": {"x": 700, "y": 200}},
                    {"id": "c6", "name": "Link Extractor & Bloom Filter", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Parser + Bloom Filter", "description": "Extracts links and deduplicates", "position": {"x": 480, "y": 350}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "TCP", "description": "Push URLs into domain queues", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "TCP", "description": "Fetchers pop polite URLs", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "TCP", "description": "Resolve domain to IP", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "HTTPS", "description": "Store raw compressed web page", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c3", "to": "c6", "protocol": "TCP", "description": "Send HTML to link extractor", "direction": "UNIDIRECTIONAL"},
                    {"id": "e6", "from": "c6", "to": "c1", "protocol": "TCP", "description": "Enqueue newly discovered unique URLs", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Log Shipper", "category": "INFRASTRUCTURE", "type": "LOGGING_SERVICE", "tech": "Fluentbit / Vector"},
                {"name": "Kafka Buffer", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "Apache Kafka"},
                {"name": "Log Indexer", "category": "APPLICATION", "type": "BACKGROUND_WORKER", "tech": "Logstash / Vector"},
                {"name": "Elasticsearch", "category": "STORAGE", "type": "SEARCH_INDEX", "tech": "Elasticsearch Cluster"},
                {"name": "Cold Storage", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "S3 Cold Archive"},
                {"name": "Kibana Dashboard", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Kibana / Grafana"}
            ],
            "reference_solution": {
                "overview": "Fluentbit daemonsets on Kubernetes nodes tail container logs and push to Apache Kafka. Logstash/Vector workers consume Kafka partitions in batches, enrich metadata, and bulk-insert into Elasticsearch daily index shards. Kibana queries Elasticsearch for real-time search, while an Index Lifecycle Manager migrates week-old shards to S3.",
                "components": [
                    {"id": "c1", "name": "App Pods & Fluentbit", "category": "INFRASTRUCTURE", "type": "LOGGING_SERVICE", "tech_choice": "Fluentbit DaemonSet", "description": "Collects stdout logs from containers", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Kafka Log Buffer", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "Apache Kafka", "description": "Buffers 100K logs/sec and absorbs spikes", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Logstash Processing Fleet", "category": "APPLICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Logstash / Vector", "description": "Parses JSON and filters sensitive PII", "position": {"x": 480, "y": 200}},
                    {"id": "c4", "name": "Elasticsearch Cluster", "category": "STORAGE", "type": "SEARCH_INDEX", "tech_choice": "OpenSearch / ES", "description": "Hot index with inverted text search", "position": {"x": 700, "y": 120}},
                    {"id": "c5", "name": "Cold S3 Log Archive", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "AWS S3 Glacier", "description": "Cost-effective 90-day cold compliance archive", "position": {"x": 700, "y": 280}},
                    {"id": "c6", "name": "Kibana UI", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Kibana / Grafana", "description": "SRE search dashboard and alerts", "position": {"x": 900, "y": 120}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "TCP", "description": "Stream logs to Kafka topics", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "Kafka", "description": "Pull log batches for transformation", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "HTTP/REST", "description": "Bulk index insert (`_bulk`)", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "TCP", "description": "ILM rolls old shards to S3", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c6", "to": "c4", "protocol": "HTTP/REST", "description": "Execute search query across indices", "direction": "BIDIRECTIONAL"}
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
                {"name": "Scheduler Master", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Scheduler"},
                {"name": "Consensus Coordinator", "category": "DISTRIBUTED", "type": "LEADER", "tech": "etcd / Zookeeper"},
                {"name": "Task Queue", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech": "RabbitMQ / SQS"},
                {"name": "Worker Cluster", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech": "Worker Containers"},
                {"name": "Job Metadata DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"}
            ],
            "reference_solution": {
                "overview": "Active-Passive Scheduler architecture coordinated via etcd leader election. Ready tasks are identified via a Redis Sorted Set indexed by execution timestamp. The Leader enqueues runnable DAG nodes into RabbitMQ. Auto-scaled worker containers consume messages, execute code, and write task status updates to PostgreSQL.",
                "components": [
                    {"id": "c1", "name": "Scheduler Primary", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Scheduler Daemon", "description": "Dispatches ready tasks and evaluates DAGs", "position": {"x": 240, "y": 140}},
                    {"id": "c2", "name": "Scheduler Standby", "category": "DISTRIBUTED", "type": "FOLLOWER", "tech_choice": "Go Scheduler Standby", "description": "Standby scheduler ready to assume leadership", "position": {"x": 240, "y": 280}},
                    {"id": "c3", "name": "etcd Consensus", "category": "DISTRIBUTED", "type": "LEADER", "tech_choice": "etcd Cluster", "description": "Maintains 10-second leadership lease", "position": {"x": 50, "y": 200}},
                    {"id": "c4", "name": "Task Priority Queue", "category": "COMMUNICATION", "type": "MESSAGE_QUEUE", "tech_choice": "RabbitMQ / SQS", "description": "Buffers ready-to-run job payloads", "position": {"x": 480, "y": 140}},
                    {"id": "c5", "name": "Worker Execution Fleet", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Docker Worker Fleet", "description": "Executes job payloads in sandboxed processes", "position": {"x": 700, "y": 140}},
                    {"id": "c6", "name": "Job Metadata DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Canonical store for DAGs, runs, and logs", "position": {"x": 700, "y": 280}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c3", "protocol": "TCP", "description": "Renew leader lease every 3s", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "TCP", "description": "Watch leader key for failover", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c1", "to": "c4", "protocol": "AMQP", "description": "Enqueue runnable tasks", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "AMQP", "description": "Workers pull task messages", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c5", "to": "c6", "protocol": "SQL", "description": "Update task status = SUCCESS/FAILED", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "React / Next.js"},
                {"name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech": "Nginx"},
                {"name": "Community Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Go Community API"},
                {"name": "Hot Feed Cache", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "Reddit SQL DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"}
            ],
            "reference_solution": {
                "overview": "Reads query pre-computed hot feeds directly from Redis Sorted Sets. When a user upvotes, the vote is recorded in a PostgreSQL user_votes table and published to Kafka. A Ranking Worker recalculates the Hacker News gravity score and updates the post's score in the Redis hot list. Nested comments are stored using Materialized Path in PostgreSQL for rapid subtree retrieval.",
                "components": [
                    {"id": "c1", "name": "Community Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React Web / Mobile", "description": "Browses hot feeds and casts votes", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "API Gateway", "category": "APPLICATION", "type": "API_GATEWAY", "tech_choice": "Envoy", "description": "Authenticates user JWT tokens", "position": {"x": 240, "y": 200}},
                    {"id": "c3", "name": "Post & Vote Service", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Go Service", "description": "Handles submissions and votes", "position": {"x": 460, "y": 200}},
                    {"id": "c4", "name": "Redis Hot Ranking Cache", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster (ZSET)", "description": "Stores pre-sorted subreddit post lists", "position": {"x": 460, "y": 60}},
                    {"id": "c5", "name": "Reddit PostgreSQL DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Stores posts and materialized path comments", "position": {"x": 680, "y": 200}},
                    {"id": "c6", "name": "Ranking Calculation Worker", "category": "COMMUNICATION", "type": "BACKGROUND_WORKER", "tech_choice": "Go Ranking Worker", "description": "Recalculates gravity scores every 60s", "position": {"x": 680, "y": 60}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "HTTPS", "description": "Browse hot feed or submit vote", "direction": "UNIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "HTTP/REST", "description": "Route request", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "Read top 25 hot posts from ZSET", "direction": "BIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Insert vote and fetch comment tree", "direction": "BIDIRECTIONAL"},
                    {"id": "e5", "from": "c6", "to": "c4", "protocol": "Redis/RESP", "description": "Update ZSET scores based on age decay", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Client", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "React Editor Client"},
                {"name": "Collab Gateway", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech": "Go WebSocket Gateway"},
                {"name": "Document Server", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Node.js / Rust OT Server"},
                {"name": "Redis Session Registry", "category": "STORAGE", "type": "CACHE", "tech": "Redis Cluster"},
                {"name": "Doc Snapshot DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech": "PostgreSQL Multi-AZ"},
                {"name": "S3 Doc Archive", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech": "AWS S3"}
            ],
            "reference_solution": {
                "overview": "Consistent Hashing routes all active collaborators of a document to the same Document Server node via WebSockets. The Document Server executes Operational Transformation (OT) or hosts a shared Yjs CRDT model in RAM. Operations are acknowledged to clients in < 20ms and appended to a Redis WAL. Periodically, document state is snapshotted to PostgreSQL and archived to S3.",
                "components": [
                    {"id": "c1", "name": "Co-Author Clients", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "React + Monaco / ProseMirror", "description": "Emits keystroke operations over WebSockets", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "WebSocket Routing Tier", "category": "COMMUNICATION", "type": "WEBSOCKET_SERVICE", "tech_choice": "Go WebSocket Gateway", "description": "Routes connections by document_id hash", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "Document Session Server", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Rust / Node.js OT Engine", "description": "Manages in-memory document state and OT sequencing", "position": {"x": 480, "y": 200}},
                    {"id": "c4", "name": "Redis Operation WAL", "category": "STORAGE", "type": "CACHE", "tech_choice": "Redis Cluster", "description": "Append-only log of recent operations", "position": {"x": 480, "y": 60}},
                    {"id": "c5", "name": "Document Snapshot DB", "category": "STORAGE", "type": "SQL_DATABASE", "tech_choice": "PostgreSQL Multi-AZ", "description": "Periodic snapshots and user permissions", "position": {"x": 700, "y": 200}}
                ],
                "connections": [
                    {"id": "e1", "from": "c1", "to": "c2", "protocol": "WebSocket", "description": "Duplex operation stream", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c3", "protocol": "gRPC", "description": "Route to document session host", "direction": "BIDIRECTIONAL"},
                    {"id": "e3", "from": "c3", "to": "c4", "protocol": "Redis/RESP", "description": "Append operation to log", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c3", "to": "c2", "protocol": "gRPC", "description": "Broadcast transformed operation to collaborators", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c3", "to": "c5", "protocol": "SQL", "description": "Save snapshot every 100 ops", "direction": "UNIDIRECTIONAL"}
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
                {"name": "Target Pods", "category": "INFRASTRUCTURE", "type": "CONTAINER", "tech": "App Metrics (/metrics)"},
                {"name": "Prometheus Scraper", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech": "Prometheus Server"},
                {"name": "Service Discovery", "category": "INFRASTRUCTURE", "type": "DNS", "tech": "Kube Service Discovery"},
                {"name": "TSDB Storage", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech": "VictoriaMetrics / Thanos"},
                {"name": "Alertmanager", "category": "APPLICATION", "type": "NOTIFICATION_SERVICE", "tech": "Alertmanager"},
                {"name": "Grafana Dashboard", "category": "APPLICATION", "type": "WEB_CLIENT", "tech": "Grafana Dashboard"}
            ],
            "reference_solution": {
                "overview": "Prometheus server discovers target pods via Kubernetes Service Discovery and scrapes HTTP `/metrics` endpoints every 15s. Metrics are compressed in-memory using Facebook Gorilla delta-of-delta encoding and flushed to 2-hour TSDB blocks on disk. Thanos / Cortex provides long-term S3 object storage downsampling, and Grafana executes PromQL dashboard queries.",
                "components": [
                    {"id": "c1", "name": "App Container Pods", "category": "INFRASTRUCTURE", "type": "CONTAINER", "tech_choice": "K8s App Pods", "description": "Exposes /metrics endpoint", "position": {"x": 50, "y": 200}},
                    {"id": "c2", "name": "Prometheus Scraper Engine", "category": "APPLICATION", "type": "BACKEND_SERVICE", "tech_choice": "Prometheus Server", "description": "Scrapes targets and evaluates alert rules", "position": {"x": 260, "y": 200}},
                    {"id": "c3", "name": "K8s Service Discovery", "category": "INFRASTRUCTURE", "type": "DNS", "tech_choice": "Kubernetes API", "description": "Discovers active pod IP targets", "position": {"x": 260, "y": 50}},
                    {"id": "c4", "name": "Gorilla TSDB Engine", "category": "STORAGE", "type": "NOSQL_DATABASE", "tech_choice": "TSDB (Gorilla XOR)", "description": "In-memory head block and 2h disk blocks", "position": {"x": 480, "y": 200}},
                    {"id": "c5", "name": "Long-Term S3 Archive", "category": "STORAGE", "type": "OBJECT_STORAGE", "tech_choice": "Thanos / AWS S3", "description": "Stores downsampled 5m/1h historical blocks", "position": {"x": 700, "y": 200}},
                    {"id": "c6", "name": "Grafana Dashboard", "category": "APPLICATION", "type": "WEB_CLIENT", "tech_choice": "Grafana", "description": "Visualizes real-time PromQL graphs", "position": {"x": 480, "y": 350}}
                ],
                "connections": [
                    {"id": "e1", "from": "c2", "to": "c3", "protocol": "HTTPS", "description": "Query active scrape targets", "direction": "BIDIRECTIONAL"},
                    {"id": "e2", "from": "c2", "to": "c1", "protocol": "HTTP/REST", "description": "Scrape GET /metrics every 15s", "direction": "UNIDIRECTIONAL"},
                    {"id": "e3", "from": "c2", "to": "c4", "protocol": "TCP", "description": "Append samples with Gorilla encoding", "direction": "UNIDIRECTIONAL"},
                    {"id": "e4", "from": "c4", "to": "c5", "protocol": "HTTPS", "description": "Compact and ship 2h blocks to S3", "direction": "UNIDIRECTIONAL"},
                    {"id": "e5", "from": "c6", "to": "c2", "protocol": "HTTP/REST", "description": "Execute PromQL instant and range queries", "direction": "BIDIRECTIONAL"}
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
    ]

print("Challenges Part 2 loaded: 12")
