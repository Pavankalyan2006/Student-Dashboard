# scripts/sd_curriculum_level5.py
# Level 5: Interview Preparation (10 Lessons: topics 60 to 69)

def get_level5_lessons():
    return [
        {
            "id": "sd_l5_60",
            "level": 5,
            "level_name": "Interview Preparation",
            "order_index": 60,
            "slug": "interview-step-1-clarifying-requirements",
            "title": "Step 1: Clarifying Requirements & Scoping",
            "summary": "Asking the right questions, defining 3-4 core features, establishing non-goals, and securing alignment in the first 5 minutes.",
            "estimated_minutes": 15,
            "content_markdown": """# Step 1: Clarifying Requirements & Scoping (Minutes 0 - 5)

System design interview prompts are **intentionally ambiguous** (e.g. *'Design Twitter'*, *'Design YouTube'*). The interviewer is testing whether you jump blindly into implementation or proactively ask clarifying questions like a senior staff engineer.

### The 4-Question Clarification Framework
1. **Target Audience & Devices**: Who are the primary users? (Mobile apps, web browsers, IoT devices, or internal enterprise services?)
2. **Core Capabilities**: What are the top 3-4 absolute must-have features for the MVP?
   - *Example (Twitter)*: Post a tweet, view home timeline, view user profile timeline, follow a user.
3. **Non-Goals (Crucial!)**: What are we explicitly **NOT** building today?
   - *Example*: Direct messaging, live video streaming, and ad networks are out of scope for the next 40 minutes.
4. **Scale & Geography**: Is this service localized to one city or distributed globally across millions of daily active users?""",
            "key_decisions": ["Writing down functional requirements and non-goals visibly on the whiteboard/workspace"],
            "advantages": ["Prevents wasting 30 minutes designing features the interviewer does not care about", "Demonstrates executive maturity and leadership"],
            "disadvantages": ["Spending more than 6-7 minutes on requirements eats into architecture design time"],
            "common_mistakes": ["Immediately drawing a Load Balancer and Database in minute 1 without asking a single question"],
            "practical_examples": ["Interviewer asks to 'Design Netflix' -> Candidate clarifies: 'Are we focusing on the video upload/transcoding pipeline, or the consumer video streaming and playback recommendation flow?'"],
            "related_topics": ["functional-requirements", "non-functional-requirements"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 2: Scale Estimation & Resource Math (Minutes 5 - 10)

Back-of-the-envelope calculations are not an academic math quiz; they dictate your **storage engine, caching tier, and partitioning strategy**.

### The Rapid Mental Math Template
Suppose an interviewer specifies: **100 Million Daily Active Users (DAU)**.

1. **Traffic (RPS)**:
   - Assume each user performs 10 actions/day $\\implies 1 \\text{ Billion daily requests}$.
   - Average RPS: $1,000,000,000 / 100,000 \\approx \\mathbf{10,000\\text{ RPS}}$.
   - Peak Factor (2x): $\\mathbf{20,000\\text{ Peak RPS}}$.
2. **Storage (5-Year Horizon)**:
   - If write payload is 500 bytes:
   - Daily storage: $10\\text{M writes} \\times 500\\text{ bytes} = 5\\text{ GB/day}$.
   - 5-Year Storage: $5\\text{ GB} \\times 365 \\times 5 \\approx \\mathbf{9.1\\text{ TB}}$.
   - *Verdict*: 9.1 TB easily fits on a single modern high-capacity database with replication! Sharding is not mandatory for storage, though it may be needed for write IOPS.
3. **RAM Caching (80/20 Rule)**:
   - 20% of daily reads generate 80% of traffic.
   - Cache memory required: $20\\% \\text{ of daily active data} = 0.2 \\times 5\\text{ GB} = \\mathbf{1\\text{ GB RAM}}$ (Trivial for a single Redis node!).""",
            "key_decisions": ["Rounding 86,400 to 100,000 to keep mental math rapid and error-free", "Stating assumptions clearly out loud to the interviewer"],
            "advantages": ["Immediately proves whether standard databases suffice or if sharding is required"],
            "disadvantages": ["Getting bogged down in decimal places wastes precious interview minutes"],
            "common_mistakes": ["Panicking over exact calculations; interviewers look for reasonable orders of magnitude, not 6 decimal places of precision"],
            "practical_examples": ["Quickly demonstrating that 2,000 writes/sec requires database partitioning because a single MySQL instance can bottleneck around 1,000 concurrent writes/sec"],
            "related_topics": ["capacity-planning", "latency-and-throughput"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 3: API Design & Endpoint Contracts (Minutes 10 - 15)

Defining clean API contracts proves that your architecture directly satisfies the functional requirements defined in Step 1.

### API Contract Best Practices
1. **Use Standard HTTP Verbs**:
   - `POST /api/v1/tweets` (Create tweet)
   - `GET /api/v1/tweets/{id}` (Get tweet)
   - `GET /api/v1/users/{id}/timeline?limit=20&cursor=eyJ...` (Paginated timeline)
   - `DELETE /api/v1/tweets/{id}` (Delete tweet)
2. **Always Use Cursor-Based Pagination**:
   - Never use `offset/limit` for high-velocity feeds; as new tweets arrive, offset shifts and causes duplicate items. Use an opaque cursor or timestamp.
3. **Include Idempotency**:
   - For financial or critical creation endpoints, include `Idempotency-Key` headers.""",
            "key_decisions": ["Choosing between RESTful JSON APIs vs gRPC Protocol Buffers for internal microservice communication"],
            "advantages": ["Establishes concrete data exchange boundaries between client and backend tiers"],
            "disadvantages": ["Over-specifying minor query parameters wastes time; focus on the primary 3-4 endpoints"],
            "common_mistakes": ["Using verbs in REST paths like `POST /get_all_tweets_by_user` instead of `GET /users/{id}/tweets`"],
            "practical_examples": ["Defining Twitter Home Timeline API: `GET /api/v1/feed?cursor=17928374&limit=25`"],
            "related_topics": ["client-server-architecture", "api-gateways"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 4: Data Modeling & Schema Selection (Minutes 15 - 20)

Data modeling determines how your application persists, queries, and mutates state. Choosing the right database paradigm (SQL vs NoSQL) is a critical interview inflection point.

### The Decision Matrix: SQL vs NoSQL
- **Choose SQL (PostgreSQL, MySQL)** when:
  - You need complex relational queries with multi-table JOINs.
  - You require strict ACID transactions (Banking, Payments, E-commerce checkouts).
  - Data structure is well-defined and unlikely to change wildly.
- **Choose NoSQL (Cassandra, DynamoDB, MongoDB)** when:
  - You need massive horizontal write throughput (100,000+ writes/sec).
  - Data model is flat, hierarchical, or append-only time-series (Chat logs, IoT metrics).
  - You can query exclusively by a primary partition key without relational joins.

### Define 3-4 Core Entities Clearly
- `users`: `user_id (PK)`, `email`, `created_at`
- `tweets`: `tweet_id (PK)`, `author_id (FK)`, `content`, `created_at`
- `follows`: `follower_id`, `followee_id`, `(composite PK)`""",
            "key_decisions": ["Deciding whether to store follower relationships in a relational composite key table vs a graph database"],
            "advantages": ["Reveals disk storage patterns, index needs, and relationship cardinalities"],
            "disadvantages": ["Designing every single edge-case table wastes time; stick to core entities"],
            "common_mistakes": ["Proposing a NoSQL key-value store and then explaining how you will execute complex multi-table relational joins on it"],
            "practical_examples": ["Designing WhatsApp data schema: Using Cassandra wide-column tables with `(conversation_id, message_id)` composite clustering keys"],
            "related_topics": ["sql-databases", "nosql-databases", "database-indexes"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 5: High-Level Architecture Topology (Minutes 20 - 27)

Now you assemble the high-level box-and-line diagram that connects all components into an end-to-end operational system.

### The Canonical 4-Tier Topology
1. **Client Tier**: Web Client, Mobile App, IoT device.
2. **Edge & Ingress Tier**:
   - **DNS / CDN**: Resolves hostnames and caches static assets close to edge.
   - **Load Balancer (L4/L7)**: Distributes traffic across gateways.
   - **API Gateway**: Terminates TLS, authenticates tokens, and routes traffic.
3. **Application Tier**:
   - Stateless microservice containers (e.g. `TweetService`, `TimelineService`, `UserService`).
   - Asynchronous Message Queue (`Kafka`, `SQS`) buffering heavy background tasks for Worker pods.
4. **Data & Storage Tier**:
   - **Cache Tier**: In-memory Redis cluster for hot queries.
   - **Primary Storage**: Relational SQL (Postgres) or NoSQL (Cassandra/DynamoDB) with read replicas.
   - **Object Storage**: S3 for images, videos, and static files.

### Walk Through the Request Flow!
Don't just draw the boxes; **walk the interviewer through a concrete request**:
*'When a user posts a photo, the client requests a pre-signed S3 URL from TweetService, uploads image directly to S3, and TweetService commits the record to Postgres and emits an event to Kafka...'*""",
            "key_decisions": ["Clearly labeling protocol arrows (`HTTPS`, `gRPC`, `WebSocket`, `TCP`)", "Splitting read paths from write paths"],
            "advantages": ["Provides the structural skeleton for the rest of the technical deep-dive"],
            "disadvantages": ["Leaving the design at the high-level without diving into bottlenecks will result in a mediocre interview score"],
            "common_mistakes": ["Drawing 50 different microservices before establishing basic client-to-database connectivity"],
            "practical_examples": ["Using the Architecture Designer Canvas in System Design Lab to arrange client, LB, gateway, services, cache, and DB"],
            "related_topics": ["basic-architecture-diagrams", "load-balancers", "caching"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 6: Detailed Component Deep-Dive (Minutes 27 - 35)

This is where candidates earn senior and staff-level evaluation scores. The interviewer will ask you to zoom into the most challenging algorithmic and architectural sub-problem of the system.

### Classic Deep-Dive Scenarios
1. **News Feed (Twitter/Facebook)**:
   - *Fan-out-on-Write (Push)*: When Alice tweets, write her tweet ID into the Redis timeline cache of all her followers.
     - *Advantage*: Home timeline read is $O(1)$ instant lookup!
     - *Fatal Flaw*: When Elon Musk (150M followers) tweets, the server must write to 150 million caches (**Celebrity Hot-Spot write storm**)!
   - *Fan-out-on-Read (Pull)*: When a user opens their app, query the latest tweets of everyone they follow and merge-sort.
     - *Advantage*: Writes are $O(1)$ fast.
     - *Downside*: Reads are $O(N)$ slow and heavy on the database.
   - *The Hybrid Winner*: Push for normal users (< 5,000 followers); Pull for celebrities!
2. **Distributed Unique ID Generation (Snowflake)**:
   - Can we use auto-incrementing SQL IDs? No, multiple database shards will generate collision IDs.
   - Use **Twitter Snowflake (64-bit ID)**:
     - 1 bit unused | 41 bits timestamp (69 years) | 10 bits machine ID | 12 bits sequence number (4,096 IDs per ms per machine).
     - *Advantage*: Globally unique, $k$-sorted chronologically, and requires zero network coordination!""",
            "key_decisions": ["Presenting both naive and optimal solutions to demonstrate deep trade-off awareness"],
            "advantages": ["Separates junior engineers who only memorize boxes from senior architects who understand distributed algorithms"],
            "disadvantages": ["Getting lost in minor details if the interviewer wanted to explore a different component"],
            "common_mistakes": ["Giving a hand-waving answer like 'We will just use AI to solve the feed' instead of concrete data structures"],
            "practical_examples": ["Explaining Twitter's Hybrid Fan-Out model and Snowflake ID generator during a News Feed interview"],
            "related_topics": ["caching", "database-partitioning"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 7: Bottleneck Identification & Single Points of Failure (Minutes 35 - 38)

A critical indicator of an exceptional engineer is **proactive self-critique**. Do not wait for the interviewer to find your bugs—hunt them down and point them out first!

### The Proactive Audit Checklist
1. **Single Points of Failure (SPOF)**:
   - *Audit*: Is there any single component (Load Balancer, Master Database, API Gateway) that, if it crashes, halts the entire platform?
   - *Fix*: Add redundant standby replicas with automated failover.
2. **Hot Spots & Partition Skew**:
   - *Audit*: If 10 million users all access the exact same viral URL or product simultaneously, does that specific shard or cache key crash?
   - *Fix*: Local in-memory L1 cache on application servers or replicated read keys.
3. **Database Write Bottlenecks**:
   - *Audit*: Can a single primary database sustain the peak write throughput?
   - *Fix*: Sharding or asynchronous queue buffering.
4. **Unbounded Memory Growth**:
   - *Audit*: Does any cache or table grow indefinitely without an eviction TTL or archival policy?""",
            "key_decisions": ["Acknowledging weaknesses candidly and proposing concrete mitigation strategies"],
            "advantages": ["Prevents the interviewer from thinking you were oblivious to your design's limitations", "Proves battle-tested production experience"],
            "disadvantages": ["Dwelling on trivial bugs instead of high-impact structural bottlenecks"],
            "common_mistakes": ["Defensively arguing that your design has zero flaws (every architecture involves compromises)"],
            "practical_examples": ["Noticing that your design has a single Redis instance and immediately stating: 'I should upgrade this to a Redis Sentinel or Redis Cluster with read replicas to prevent a single point of failure'"],
            "related_topics": ["fault-tolerance", "availability"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 8: Scalability & Reliability Hardening (Minutes 38 - 41)

Now you harden the high-level architecture with enterprise-grade distributed patterns to ensure it survives real-world chaos.

### The Hardening Playbook
1. **Edge Protection**: Place Cloudflare CDN and WAF in front of DNS to shield against volumetric DDoS attacks.
2. **Ingress Protection**: Configure Token Bucket rate limiting on the API Gateway per client IP and user account.
3. **Service Resilience**: Wrap all inter-service HTTP/gRPC calls in **Circuit Breakers** with fallback responses and exponential backoff retries with jitter.
4. **Data Hardening**:
   - Deploy multi-AZ database read replicas.
   - Configure Write-Ahead Log continuous archiving to S3 for Point-In-Time-Recovery (PITR).
   - Use Redis Cluster across 3 availability zones with automated replica failover.""",
            "key_decisions": ["Hardening only the critical bottlenecks rather than adding unnecessary bloat to every single service"],
            "advantages": ["Transforms a theoretical academic diagram into an enterprise-ready production blueprint"],
            "disadvantages": ["Over-complicating diagrams with too many auxiliary tools"],
            "common_mistakes": ["Claiming 'we will add more servers' without addressing database connection pool exhaustion or lock contention"],
            "practical_examples": ["Adding connection pooling (PgBouncer) between 200 stateless Node.js containers and a PostgreSQL primary"],
            "related_topics": ["circuit-breakers", "rate-limiting", "fault-tolerance"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 9: Trade-Off Analysis & Defense (Minutes 41 - 43)

A system design interview is fundamentally an assessment of your judgment. The interviewer will frequently challenge your decisions (*'Why Cassandra instead of PostgreSQL?'*, *'Why Redis instead of Memcached?'*).

### The STAR Defense Formula
1. **Acknowledge the Alternative**: Never dismiss the other tool as 'bad' (e.g., *'PostgreSQL is an outstanding, mature relational database...'*).
2. **State the Specific Constraint**: Highlight the specific requirement that pushed you away (*'...however, our scale estimation requires 200,000 writes/sec of append-only telemetry data...'*).
3. **Articulate the Trade-Off**: Explain what you gained and what you sacrificed (*'...while Cassandra sacrifices relational JOINs and ACID multi-row transactions, it gives us linear horizontal write scalability across commodity nodes via consistent hashing'*).

### Classic Trade-Off Dichotomies
- **Consistency vs Availability** (CAP / PACELC)
- **Latency vs Throughput** (Batching vs Streaming)
- **Storage Cost vs Compute Overhead** (Denormalization vs Normalization)
- **Operational Simplicity vs Tailored Performance** (Monolith vs Microservices)""",
            "key_decisions": ["Defending technical choices calmly using mathematical and operational justification rather than dogmatic bias"],
            "advantages": ["Convinces the hiring committee that you make sound, cost-effective engineering investments"],
            "disadvantages": ["Getting combative with the interviewer; treat challenges as collaborative pair-architecture discussions"],
            "common_mistakes": ["Saying 'I used Cassandra because it is faster than SQL' without explaining *why* it is faster for append-only workloads"],
            "practical_examples": ["Defending 301 Permanent Redirect (saves backend load) vs 302 Temporary Redirect (allows accurate click analytics) in TinyURL"],
            "related_topics": ["what-is-system-design", "cap-theorem"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Step 10: Final Executive Summary & Presentation (Minutes 43 - 45)

Close the interview with confidence using a structured 2-minute executive summary. Do not let the time expire awkwardly; take the initiative to summarize your architecture.

### The 5-Point Closing Script
1. **Recap Requirements**: *'To summarize, we designed a high-throughput, fault-tolerant platform satisfying our core requirements: [Feature 1, Feature 2, Feature 3].'*
2. **Highlight Scale Handling**: *'We sized our infrastructure for 10,000 RPS average and 20,000 Peak RPS, using an API Gateway and stateless application tier auto-scaling behind an L7 load balancer.'*
3. **Data & Storage Tier**: *'We chose PostgreSQL with read replicas for ACID billing data, and Redis Cache-Aside to absorb 90% of read traffic, keeping p99 read latency under 15ms.'*
4. **Resilience & Fault Tolerance**: *'We eliminated all Single Points of Failure by deploying multi-AZ redundancy, circuit breakers, and rate limiters.'*
5. **Future Evolution**: *'If we scale to 10x traffic in the future, our next step would be horizontal database sharding using consistent hashing on user_id.'*""",
            "key_decisions": ["Crisp, professional communication that leaves the interviewer with an outstanding final impression"],
            "advantages": ["Synthesizes 45 minutes of intense discussion into a clean, cohesive architectural package", "Guarantees all checklist evaluation criteria are explicitly stated"],
            "disadvantages": ["Rambling on about minor details instead of highlighting core structural victories"],
            "common_mistakes": ["Saying 'Uhh, that's basically it' and sitting in silence"],
            "practical_examples": ["Delivering the 2-minute wrap-up during mock interviews on the B.Tech Student AI Learning Platform"],
            "related_topics": ["what-is-system-design", "interview-step-1-clarifying-requirements"],
            "knowledge_check": [{
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
            }]
        }
    ]

print("Level 5 lessons loaded: 10")
