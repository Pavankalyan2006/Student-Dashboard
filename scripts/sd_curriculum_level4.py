# scripts/sd_curriculum_level4.py
# Level 4: Advanced Architecture (15 Lessons: topics 45 to 59)

def get_level4_lessons():
    return [
        {
            "id": "sd_l4_45",
            "level": 4,
            "level_name": "Advanced Architecture",
            "order_index": 45,
            "slug": "microservices",
            "title": "Microservices Architecture Fundamentals",
            "summary": "Autonomous services, single responsibility, database-per-service pattern, domain-driven design, and independent deployability.",
            "estimated_minutes": 20,
            "content_markdown": """# Microservices Architecture Fundamentals

**Microservices Architecture** arranges an application as a collection of loosely coupled, fine-grained, independently deployable services organized around business capabilities.

### Core Commandments of True Microservices
1. **Single Responsibility**: Each service models a bounded domain context (e.g. `BillingService`, `UserService`, `InventoryService`).
2. **Database-per-Service**: Every microservice MUST own its private database! No other service is permitted to query another service's database directly. Communication happens strictly through public APIs or events.
3. **Independent Deployability**: A team can deploy a change to `InventoryService` to production without coordinating or deploying any other service.
4. **Decentralized Governance**: Different services can use different languages (polyglot) or database engines suited to their specific workload (e.g., Go for API, Python for ML, Cassandra for time-series).""",
            "key_decisions": ["Enforcing strict database-per-service isolation vs sharing databases"],
            "advantages": ["Enables hundreds of developers to ship code in parallel without blocking each other", "Targeted horizontal scaling of hot microservices"],
            "disadvantages": ["Massive operational overhead: distributed tracing, network latency, distributed data consistency"],
            "common_mistakes": ["Building a 'Distributed Monolith': separate microservices that all share the same monolithic SQL database"],
            "practical_examples": ["Uber running thousands of microservices communicating over gRPC"],
            "related_topics": ["monolith-vs-microservices", "api-gateways", "saga-patterns"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Monolith vs Microservices: The Pragmatic Choice

One of the most consequential decisions in software engineering is choosing between a **Monolithic Architecture** and a **Microservices Architecture**.

### The Monolith First Principle (Martin Fowler)
Almost all successful software systems (Shopify, Basecamp, GitHub, StackOverflow) started as **Monoliths**.
- **Monolith Pros**: Single codebase, instant in-memory function calls ($0$ network latency), simple ACID transactions, frictionless local debugging, single CI/CD pipeline.
- **Monolith Cons**: Deployment bottlenecks as team grows past 100 engineers; high blast radius (a memory leak in reporting crashes the entire app); cannot scale hot modules independently.

### The Strangler Fig Migration Pattern
Never attempt a 'Big Bang' total rewrite from monolith to microservices!
Use the **Strangler Fig pattern**:
1. Place an API Gateway in front of the monolith.
2. Build a new microservice for a single bounded domain (e.g. `NotificationService`).
3. Route `/notifications/*` traffic through the gateway to the new microservice.
4. Incrementally strangle the monolith piece by piece over months/years until the old monolith is retired.""",
            "key_decisions": ["Evaluating team size and organizational boundaries (Conway's Law) before migrating to microservices"],
            "advantages": ["Prevents premature microservice operational complexity for early-stage startups"],
            "disadvantages": ["Monoliths can devolve into 'Big Balls of Mud' if modular boundaries are not enforced by linting and packages"],
            "common_mistakes": ["A 5-person startup adopting 30 microservices with Kubernetes, spending 80% of time debugging Helm charts instead of building features"],
            "practical_examples": ["Shopify scaling their monolithic Ruby on Rails codebase to serve millions of storefronts through a modular monolith architecture"],
            "related_topics": ["microservices", "what-is-system-design"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Event Sourcing Pattern

Traditional CRUD applications store the **current state** of an entity in a database table: when a user changes their address, the row is overwritten with `UPDATE users SET address = '...'`. The old address is permanently erased!

In **Event Sourcing**, you do NOT store current state. You store an **immutable, append-only sequence of domain events**:
- Event 1: `AccountCreated(id=1, balance=$0)`
- Event 2: `MoneyDeposited(id=1, amount=$100)`
- Event 3: `MoneyWithdrawn(id=1, amount=$30)`

To compute current state: **Replay all events from the beginning of time**: $0 + 100 - 30 = \\mathbf{\\$70}$.

### Snapshots for Performance
Replaying 500,000 events to compute a customer balance is slow.
The system periodically saves a **Snapshot** (e.g. at Event 10,000, Balance was $5,000). To compute current balance, load the snapshot and only replay events since the snapshot!

### Superpowers of Event Sourcing
- **100% Complete Audit Trail**: In banking, accounting, and healthcare, knowing *how* and *when* an entity arrived at its state is legally required.
- **Time Travel**: You can reconstruct the exact state of the entire system as it existed on any date in the past!""",
            "key_decisions": ["Pairing Event Sourcing with CQRS to provide fast read queries"],
            "advantages": ["Zero data loss; append-only writes are blazing fast and free of database write-locks"],
            "disadvantages": ["Schema migrations on immutable historical events are challenging; requires event versioning adapters"],
            "common_mistakes": ["Using Event Sourcing for simple CRUD apps with no audit requirements, adding immense mental overhead"],
            "practical_examples": ["Git version control (commits are an event log); financial banking ledgers"],
            "related_topics": ["cqrs", "event-driven-architecture"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# CQRS (Command Query Responsibility Segregation)

In traditional architectures, the same database model and schema is used to both write data (`INSERT/UPDATE`) and read data (`SELECT`).
**CQRS** separates data modification operations (Commands) from data retrieval operations (Queries) into completely distinct models.

### How CQRS Works
1. **Command Side (Write)**:
   - Optimized strictly for high-throughput write validation and business invariants.
   - Example: Normal 3rd-normal-form relational SQL DB or Append-Only Event Store.
   - Never handles complex search queries or dashboard aggregations.
2. **Query Side (Read)**:
   - Subscribes to events emitted by the Command Side and builds **Denormalized Materialized Views**.
   - Example: Elasticsearch index for full-text search, Redis for point lookups, or an analytical read replica.
   - Queries require **zero JOINs**; data is pre-assembled for the UI!

### Why Asymmetric Scaling Matters
In most web platforms (e.g. Amazon, Twitter), **reads outnumber writes by 100:1 or 1,000:1**. CQRS allows you to run 2 small write instances and 50 auto-scaled read instances optimized independently!""",
            "key_decisions": ["Accepting Eventual Consistency between the Command Side write and the Query Side projection update"],
            "advantages": ["Blazing fast reads with zero multi-table SQL joins", "Independent scaling of write and read infrastructure"],
            "disadvantages": ["Code duplication across two models; latency gap before query views catch up to commands"],
            "common_mistakes": ["Applying CQRS everywhere across simple applications that have a 1:1 read/write ratio"],
            "practical_examples": ["E-commerce product search: Writes go to PostgreSQL master, async pipeline streams updates to Elasticsearch cluster for instant faceted search"],
            "related_topics": ["event-sourcing", "event-driven-architecture"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Saga Patterns: Choreography vs Orchestration

When a business transaction spans multiple microservices (e.g. `OrderService` -> `PaymentService` -> `InventoryService` -> `ShippingService`), traditional 2PC distributed transactions block threads and fail under scale.

A **Saga** is a sequence of local transactions where each service updates its local database and publishes an event that triggers the next step.
If a step fails (e.g., Credit Card Declined), the Saga executes **Compensating Transactions** backwards to undo previous steps (e.g., Un-reserve inventory, Cancel order)!

### 1. Choreography-Based Saga (Decentralized)
- Each service listens to events and decides when to act next.
- *Flow*: `OrderService` emits `OrderCreated` -> `PaymentService` listens and emits `PaymentSucceeded` -> `InventoryService` listens and reserves stock.
- *Advantage*: No single orchestrator bottleneck; pure event-driven loose coupling.
- *Disadvantage*: Can become a chaotic 'spaghetti web' of events that is difficult to trace and visualize.

### 2. Orchestration-Based Saga (Central Controller)
- A dedicated **Saga Orchestrator** (e.g. Temporal, AWS Step Functions) manages the workflow state machine.
- It sends commands to services: 'Execute Step 1'. When Step 1 replies success, it commands 'Execute Step 2'.
- If Step 3 fails, the Orchestrator commands Compensating Transactions: 'Undo Step 2', 'Undo Step 1'.
- *Advantage*: Centralized visibility, explicit error handling, and easy monitoring.
- *Disadvantage*: Orchestrator can become an operational bottleneck.""",
            "key_decisions": ["Choosing Choreography for small 2-3 service flows vs Orchestration for complex multi-step enterprise workflows"],
            "advantages": ["Maintains business consistency across distributed microservices without blocking 2PC locks"],
            "disadvantages": ["Requires writing complex compensating undo logic for every single service operation"],
            "common_mistakes": ["Assuming compensating transactions restore original state identically (e.g. sending an email cannot be 'un-sent', you must send an apology email)"],
            "practical_examples": ["Booking a vacation package: Reserving Flight, Hotel, and Car Rental in a Saga with automated rollback if the flight is unavailable"],
            "related_topics": ["distributed-transactions", "microservices", "event-driven-architecture"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Stream Processing: Kafka Streams & Apache Flink

Traditional data processing relies on **Batch Processing** (nightly ETL scripts processing static snapshots of yesterday's data).
**Stream Processing** operates on **unbounded, continuous real-time data streams** as events occur.

### Core Concepts
1. **Event Time vs Processing Time**:
   - *Event Time*: When the event physically occurred on the user's mobile device.
   - *Processing Time*: When the event reached your server's CPU.
   - *Watermarks*: Deal with out-of-order events arriving late due to mobile network lag.
2. **Time Windows**:
   - **Tumbling Window**: Fixed, non-overlapping windows (e.g. Count clicks every 5 minutes: 00:00-00:05, 00:05-00:10).
   - **Sliding Window**: Overlapping windows (e.g. Average temperature over past 10 minutes, recalculated every 1 minute).
   - **Session Window**: Groups events by user inactivity gaps (e.g. User visits site, clicks around, stops for 30 minutes).

### Apache Kafka Streams vs Apache Flink
- **Kafka Streams**: Lightweight Java client library; perfect for standard event filtering, enrichment, and microservice stream transformations.
- **Apache Flink**: Heavyweight distributed cluster compute engine; excels at complex stateful stream processing, low-latency aggregations, and exactly-once event state recovery.""",
            "key_decisions": ["Handling late-arriving out-of-order events using Watermark heuristics"],
            "advantages": ["Instant real-time insights (fraud detection, dynamic pricing) in sub-second latency"],
            "disadvantages": ["Maintaining distributed state across stream nodes requires complex state checkpointing (RocksDB)"],
            "common_mistakes": ["Using processing time instead of event time, skewing metrics when mobile devices batch offline data"],
            "practical_examples": ["Uber real-time surge pricing engine recalculating ride multipliers continuously based on active demand streams"],
            "related_topics": ["event-driven-architecture", "data-pipelines"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Distributed In-Memory Caching (Redis Cluster)

When a single Redis node runs out of memory (RAM is limited to e.g. 128GB or 256GB) or single-threaded network throughput saturates at ~100,000 QPS, you must deploy a **Distributed Cache Cluster**.

### Redis Cluster Architecture & Hash Slots
Redis Cluster partitions data across master nodes without needing a central coordinator using **Hash Slots**:
- The cluster defines exactly **16,384 Hash Slots** ($0$ to $16383$).
- Every key is assigned to a slot using CRC16:
  $$\\text{Slot} = \\text{CRC16}(\\text{key}) \\pmod{16384}$$
- In a 3-master cluster:
  - Master 1 owns slots $0 - 5460$.
  - Master 2 owns slots $5461 - 10922$.
  - Master 3 owns slots $10923 - 16383$.

### Smart Clients & Redirection
Clients cache the slot-to-node routing table. If a client queries the wrong node, the node responds with a `MOVED 5461 10.0.0.2:6379` redirect, allowing the client to update its route map and query the correct master directly.""",
            "key_decisions": ["Using Hash Tags `{user:123}:profile` and `{user:123}:orders` to force related keys into the exact same hash slot for multi-key operations"],
            "advantages": ["Linear scaling of memory into terabytes of RAM and millions of operations per second"],
            "disadvantages": ["Multi-key operations (`MGET`, transactions) fail unless keys share the same hash tag"],
            "common_mistakes": ["Running heavy Lua scripts or unbounded `KEYS *` commands on a production Redis cluster, blocking the single-threaded event loop"],
            "practical_examples": ["Twitter caching billions of user timeline tweet ID lists in Redis Cluster"],
            "related_topics": ["caching", "sharding-strategies"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Multi-Region Active-Active Architecture

For global applications serving hundreds of millions of users across continents, running in a single data center introduces prohibitive physical network latency ($\approx 150-200ms$ cross-ocean round-trips). **Multi-Region Active-Active** deploys independent, fully operational infrastructure in multiple continents simultaneously.

### The 3 Major Multi-Region Patterns
1. **Read-Local, Write-Global (Easiest)**:
   - Primary database lives in Region 1 (e.g. US).
   - Replicas live in Europe and Asia.
   - Users in Asia read locally with sub-10ms latency.
   - *Downside*: Writes from Asia must cross the ocean to US primary.
2. **Geo-Partitioned Active-Active (Optimal)**:
   - European users' data lives in European DB cluster; US users' data lives in US cluster.
   - Writes and reads stay 100% local.
   - Complies natively with data residency regulations (GDPR).
3. **Full Multi-Region Multi-Master (Hardest)**:
   - Any region accepts writes for any user.
   - Asynchronous replication synchronizes clusters globally.
   - Requires CRDTs or strict conflict-resolution protocols.""",
            "key_decisions": ["Deploying CockroachDB or Google Cloud Spanner with TrueTime atomic clocks for global distributed consistency"],
            "advantages": ["Sub-20ms latency worldwide; catastrophic failure of an entire continent's cloud region has zero impact on other regions"],
            "disadvantages": ["Massive cloud cross-region data transfer egress billing costs"],
            "common_mistakes": ["Failing to account for GDPR legal requirements that mandate European citizen data must never leave EU borders"],
            "practical_examples": ["Google Cloud Spanner using TrueTime atomic hardware clocks to provide globally distributed linearizable SQL transactions"],
            "related_topics": ["disaster-recovery", "database-replication"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Disaster Recovery: RTO & RPO

**Disaster Recovery (DR)** is a set of policies, tools, and procedures to enable the recovery or continuation of vital technology infrastructure following a natural or human-induced disaster (datacenter fire, ransomware, fiber cut).

### The Two Golden Metrics
1. **RPO (Recovery Point Objective)**:
   - The maximum acceptable amount of data loss measured in time.
   - *Question*: How much data are you willing to lose when a crash occurs?
   - If backups run once every 24 hours, your **RPO is 24 hours** (all data since midnight is gone).
   - If you use synchronous multi-AZ replication, your **RPO is 0 seconds**.
2. **RTO (Recovery Time Objective)**:
   - The maximum acceptable downtime duration to restore service.
   - *Question*: How long can the business afford to be offline?
   - If it takes 4 hours to download backups and rebuild servers, your **RTO is 4 hours**.

### The 4 Disaster Recovery Strategies
| Strategy | RTO | RPO | Cost | Description |
|---|---|---|---|---|
| **Backup & Restore** | Hours/Days | 24 Hours | $\\$$ | Store backups in S3; restore from scratch on disaster. |
| **Pilot Light** | 10-30 Mins | Minutes | $\\$\\$$ | Core data replicated continuously to minimal standby DB; app servers spun up via terraform on disaster. |
| **Warm Standby** | < 5 Mins | Seconds | $\\$\\$\\$$ | Scaled-down version of full environment always running in secondary region. |
| **Multi-Site Active-Active** | Real-time (0s) | 0s | $\\$\\$\\$\\$$ | Full traffic served across multiple regions simultaneously. |""",
            "key_decisions": ["Aligning DR strategy with business cost: Five 9s active-active costs 10x more than Pilot Light"],
            "advantages": ["Protects enterprise survival against catastrophic datacenter losses"],
            "disadvantages": ["Frequent disaster recovery drill testing is required to prove backups actually restore"],
            "common_mistakes": ["Taking nightly database backups but never testing restoring them, only to discover backups are corrupted during a real disaster"],
            "practical_examples": ["AWS Pilot Light architecture: Small RDS read replica in secondary region promoted to primary during regional outage"],
            "related_topics": ["multi-region-architecture", "fault-tolerance"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Resilience Patterns & Chaos Engineering

A system is resilient if it can withstand and recover rapidly from disruptive events. **Chaos Engineering** is the discipline of experimenting on a software system in production to build confidence in its capability to withstand turbulent conditions.

### Principles of Chaos Engineering (Netflix)
1. **Hypothesize**: Formulate a hypothesis about steady-state behavior (e.g. 'Killing 25% of backend containers will cause zero dropped user requests').
2. **Inject Chaos**: Introduce realistic real-world disruptions (kill instances, inject 500ms network packet latency, sever database replica connection).
3. **Measure**: Verify if steady-state metrics (orders/sec, error rate) remained stable.
4. **Fix Vulnerabilities**: Automate self-healing where weaknesses were discovered.

### Key Resilience Patterns
- **Bulkhead Pattern**: Partition resources (thread pools, connection pools) into isolated compartments so one sinking compartment doesn't drag down the whole ship.
- **Load Shedding**: When a server reaches 95% CPU, proactively drop low-priority background requests (`HTTP 503`) to protect critical core checkout paths from crashing.""",
            "key_decisions": ["Running chaos experiments in production during business hours when engineering teams are available to respond"],
            "advantages": ["Discovers insidious hidden failure modes before they cause customer-facing outages"],
            "disadvantages": ["Requires high organizational maturity and robust automated rollback systems"],
            "common_mistakes": ["Running chaos tests without automated safety switches (abort buttons)"],
            "practical_examples": ["Netflix Chaos Monkey randomly terminating production EC2 instances to verify auto-scaling self-healing"],
            "related_topics": ["circuit-breakers", "fault-tolerance"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Security Architecture & Threat Modeling (STRIDE)

Security is an essential non-functional requirement that must be designed into an architecture from inception, not bolted on as an afterthought.

### The STRIDE Threat Model (Microsoft)
| Threat | Violation | Mitigation |
|---|---|---|
| **Spoofing** | Authenticity | Mutual TLS (mTLS), JWT signatures, Multi-Factor Auth (MFA). |
| **Tampering** | Integrity | Cryptographic hashes, digital signatures, HMAC, TLS encryption. |
| **Repudiation** | Non-repudiation | Append-only tamper-evident audit logs, digital signatures. |
| **Information Disclosure** | Confidentiality | Encryption at rest (AES-256), encryption in transit (TLS 1.3), data masking. |
| **Denial of Service** | Availability | Rate limiting, token bucket algorithms, Cloudflare DDoS shielding. |
| **Elevation of Privilege** | Authorization | Role-Based Access Control (RBAC), Principle of Least Privilege. |

### Defense in Depth
Never rely on a single defensive perimeter. Enforce security at the network edge (WAF), API gateway (JWT auth), service communication (mTLS), application logic (RBAC checks), and database tier (encrypted columns).""",
            "key_decisions": ["Adopting centralized cloud secrets managers (HashiCorp Vault, AWS Secrets Manager) with automated rotation"],
            "advantages": ["Prevents catastrophic data breaches, regulatory fines (GDPR/HIPAA), and brand destruction"],
            "disadvantages": ["Rigorous encryption and token verification introduces small compute overhead"],
            "common_mistakes": ["Hardcoding database passwords or API private keys inside Git source code repositories"],
            "practical_examples": ["Using AWS KMS to generate and automatically rotate envelope encryption keys for S3 customer records"],
            "related_topics": ["zero-trust-principles", "api-gateways"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Zero-Trust Architecture & Mutual TLS (mTLS)

Traditional network security followed the **Castle-and-Moat** model: trust everything inside the internal corporate intranet, and distrust everything outside.
*The Fatal Flaw*: Once an attacker penetrates the perimeter firewall, they have free, unhindered access to move laterally across all internal databases and servers!

### Zero-Trust Axiom: Never Trust, Always Verify
Zero-Trust assumes the internal network is already compromised. Every single request—even between two internal microservices sitting on the same physical rack—must be **authenticated**, **authorized**, and **encrypted**.

### Mutual TLS (mTLS) in Action
- In standard TLS, only the server proves its identity with a certificate.
- In **mTLS (Mutual TLS)**, **both the client and the server present cryptographic X.509 certificates** to each other during the TLS handshake.
- *Result*: Service A verifies it is talking to authentic Service B, Service B verifies it is talking to authentic Service A, and the entire payload is cryptographically encrypted in transit!
- Typically automated transparently using **Service Mesh Sidecars** (Istio, Linkerd).""",
            "key_decisions": ["Deploying a Service Mesh (Istio Envoy sidecars) to automate certificate issuance and rotation"],
            "advantages": ["Completely eliminates lateral movement by attackers who breach the perimeter"],
            "disadvantages": ["Service mesh sidecars add 1-3ms latency overhead per hop and require substantial memory"],
            "common_mistakes": ["Allowing internal microservices to communicate over plain unencrypted HTTP because 'they are inside the private VPC'"],
            "practical_examples": ["Google BeyondCorp and Istio service mesh enforcing mTLS across all Kubernetes pods"],
            "related_topics": ["security-architecture", "microservices"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Large-Scale Data Pipelines: Lambda vs Kappa

Modern enterprises ingest terabytes to petabytes of event telemetry every day. Designing data pipelines to process, enrich, and aggregate this data requires choosing an architectural pipeline paradigm.

### 1. The Lambda Architecture (Nathan Marz)
Balances low-latency real-time views with comprehensive historical accuracy using dual layers:
- **Speed Layer (Stream)**: Processes recent streaming data in real-time (Apache Flink/Storm) to provide instant low-latency views (compromises accuracy for speed).
- **Batch Layer (Cold)**: Stores raw immutable master data (HDFS/S3). Nightly batch jobs (Apache Spark) compute comprehensive, highly accurate aggregated views.
- **Serving Layer**: Merges queries across both speed and batch views.
- *Major Flaw*: Developers must write and maintain identical business logic in two separate codebases (e.g. Java Flink for streaming, and Scala Spark for batch)!

### 2. The Kappa Architecture (Jay Kreps)
Eliminates dual codebases by processing **everything as a continuous stream**:
- All data is ingested into an append-only, distributed streaming log (Apache Kafka) with long retention.
- A single stream processing engine (Apache Flink) processes all real-time events.
- To recompute historical data after a bug fix: Simply spin up a new consumer instance and **replay the Kafka stream from offset 0**!""",
            "key_decisions": ["Adopting Kappa architecture to eliminate duplicate code maintenance across batch and stream engines"],
            "advantages": ["Processes billions of events daily into data lakes (Snowflake, BigQuery, Delta Lake)"],
            "disadvantages": ["Maintaining historical streaming logs requires massive distributed disk storage"],
            "common_mistakes": ["Building a complex Lambda architecture when a simple hourly batch pipeline would have satisfied all reporting needs"],
            "practical_examples": ["Uber and LinkedIn processing trillions of user events daily using Kappa architectures on Apache Kafka"],
            "related_topics": ["stream-processing", "event-driven-architecture"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Real-Time Systems: WebSockets, SSE & WebRTC

Traditional web architecture relies on short-lived request-response polling. When building chat apps, stock tickers, or collaborative whiteboards, continuous HTTP polling (`GET /messages` every 1s) wastes bandwidth and server CPU.

### Real-Time Communication Protocols
1. **WebSockets (`ws://`, `wss://`)**:
   - Upgrades an HTTP connection to a persistent, full-duplex, bidirectional TCP socket.
   - Tiny frame overhead (2-10 bytes instead of 800-byte HTTP headers).
   - Server can push data to client at any millisecond; client can send data to server on the same open socket.
   - *Best for*: Chat apps, multiplayer gaming, financial trading terminals.
2. **Server-Sent Events (SSE)**:
   - Unidirectional persistent HTTP streaming connection from server to client.
   - Built over standard HTTP/2; automatically handles reconnection and firewall traversal.
   - *Best for*: Stock price tickers, news feeds, LLM AI token streaming (ChatGPT).
3. **WebRTC**:
   - Peer-to-peer UDP encrypted connection between two browsers (signaling handled via WebSocket).
   - *Best for*: Ultra-low latency audio/video calling (Zoom, Google Meet).

### Scaling WebSockets Horizontally
Because WebSocket connections are stateful, long-lived TCP connections tied to a specific physical server, **User A on Server 1 cannot talk to User B on Server 2 directly**.
*Solution*: Use an **in-memory Pub/Sub message broker (Redis Pub/Sub)**. When Server 1 receives a message, it publishes to Redis; Server 2 receives the event from Redis and pushes it down its local WebSocket connection to User B!""",
            "key_decisions": ["Choosing Server-Sent Events (SSE) for unidirectional streaming vs WebSockets for bidirectional duplex interaction"],
            "advantages": ["Sub-20ms instant delivery of real-time events without polling latency"],
            "disadvantages": ["Long-lived connections consume server file descriptors and memory; load balancing requires Least Connections"],
            "common_mistakes": ["Using short-polling for chat apps, creating millions of empty `GET` requests that swamp the database"],
            "practical_examples": ["ChatGPT streaming LLM completion tokens over Server-Sent Events (SSE); Slack using WebSockets for real-time messaging"],
            "related_topics": ["message-queues", "load-balancers"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Multi-Tenant Architecture & Data Isolation

In B2B Software-as-a-Service (SaaS), **Multi-Tenancy** is the architecture where a single instance of a software application serves multiple distinct customer organizations (tenants).

### The 3 Tenant Isolation Models
1. **Silo Model (Database-per-Tenant)**:
   - Every tenant has its own isolated, physically separate database.
   - *Pros*: Maximum security, regulatory compliance (healthcare, banking), zero noisy neighbors.
   - *Cons*: Expensive infrastructure costs; running schema migrations across 1,000 separate databases is an operational nightmare.
2. **Pool Model (Shared Database, Shared Schema)**:
   - All tenants share the same database tables. Every table includes a `tenant_id` column.
   - *Pros*: Lowest infrastructure cost, simplest operational maintenance and deployment.
   - *Cons*: High risk of accidental data leakage if a developer omits `WHERE tenant_id = ?`; vulnerable to **Noisy Neighbor syndrome** (one huge customer saturates the database CPU for all other customers).
3. **Bridge Model (Hybrid)**:
   - Small tenants share pooled tables; enterprise VIP tenants get dedicated silo databases.

### Row-Level Security (PostgreSQL RLS)
To prevent accidental data leakage in the Pool Model, PostgreSQL provides **Row-Level Security (RLS)**:
- The database engine automatically injects `tenant_id = current_setting('app.current_tenant_id')` into every query at the kernel level, making cross-tenant data leaks mathematically impossible!""",
            "key_decisions": ["Adopting PostgreSQL Row-Level Security (RLS) to safely pool tenants while guaranteeing cryptographically enforced isolation"],
            "advantages": ["Dramatically reduces infrastructure hosting costs per SaaS customer", "Centralizes software updates"],
            "disadvantages": ["Requires strict per-tenant rate limiting to prevent Noisy Neighbor starvation"],
            "common_mistakes": ["Relying solely on application-level `WHERE tenant_id = ?` filters without database-enforced Row-Level Security"],
            "practical_examples": ["Salesforce and Slack hosting thousands of enterprise tenants on multi-tenant pooled database clusters with RLS"],
            "related_topics": ["security-architecture", "database-partitioning"],
            "knowledge_check": [{
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
            }]
        }
    ]

print("Level 4 lessons loaded: 15")
