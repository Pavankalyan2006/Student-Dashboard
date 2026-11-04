# scripts/sd_curriculum_data.py
# 69 Comprehensive Lessons across 5 Curriculum Levels for System Design Lab

def get_level1_lessons():
    return [
        {
            "id": "sd_l1_01",
            "level": 1,
            "level_name": "Foundations",
            "order_index": 1,
            "slug": "what-is-system-design",
            "title": "What is System Design?",
            "summary": "Core definition, architecture scope, systems thinking, and why system design is the premier skill of senior software engineers.",
            "estimated_minutes": 15,
            "content_markdown": """# What is System Design?

**System Design** is the multidisciplinary engineering process of defining the architecture, components, modules, interfaces, and data for a computing system to satisfy specified operational and business requirements.

While basic programming focuses on algorithms and data structures inside a single process, **System Design** focuses on how hundreds or thousands of distributed processes, services, databases, and networks communicate reliably under high concurrent load.

### Key Pillars of System Design
1. **Scalability**: Can the system handle 10x or 100x traffic growth without collapsing?
2. **Reliability & Availability**: Does the system stay operational even when servers, hard disks, or network switches fail?
3. **Efficiency & Latency**: Does the system respond in milliseconds while keeping infrastructure costs sustainable?
4. **Maintainability**: Can engineering teams evolve, test, and debug the codebase over a 5-to-10 year lifecycle?

In interview and production settings, system design is **never about finding one dogmatic 'right' answer**. It is about understanding trade-offs, quantifying trade-offs, and choosing the optimal compromises for specific user needs.""",
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
            "related_topics": ["functional-requirements", "non-functional-requirements", "scalability"],
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
            "content_markdown": """# Functional Requirements

**Functional Requirements (FRs)** define *what* the system must do from the user and client perspective. They represent business features, API contracts, domain entities, and operational workflows.

### How to Define Functional Requirements
1. **Core User Actions**: What can a user actively perform? (e.g., Shorten URL, View News Feed, Book Ride).
2. **System Behaviors**: What happens automatically? (e.g., Send push notification, Expire inactive links, Deduplicate payments).
3. **Boundary & Non-Goals**: Explicitly listing features that are **out of scope** prevents scope creep and focuses interview time on critical challenges.

### Concrete Example: URL Shortener (TinyURL)
- **FR 1**: User submits a long URL and receives a shortened URL (e.g., `https://tiny.cc/aB3x9`).
- **FR 2**: Accessing the short URL redirects the user to the original destination with sub-20ms latency.
- **FR 3**: Users can optionally specify custom aliases (e.g., `tiny.cc/my-portfolio`).
- **Non-Goal**: We will not build an ad-network or web page scraper in the initial release.""",
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
            "related_topics": ["non-functional-requirements", "what-is-system-design"],
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
            "content_markdown": """# Non-Functional Requirements (NFRs)

**Non-Functional Requirements (NFRs)** define *how well* the system performs its functions. They govern quality attributes, operational constraints, and engineering standards.

### The 'ilities' of System Design
- **Availability**: Percentage of time the system is operational and serving valid responses (e.g., 99.99% = max 52.6 minutes downtime per year).
- **Latency**: Time elapsed between client request transmission and response consumption, measured in percentiles (**p50**, **p95**, **p99**).
- **Throughput**: Number of operations processed per unit time (Requests Per Second - **RPS**, Queries Per Second - **QPS**).
- **Consistency vs Availability**: Choosing between ACID strict correctness vs BASE high availability under network partitions.
- **Durability**: Probability that committed data will never be permanently lost (e.g., AWS S3 promises 99.999999999% durability).

### Service Level Terminology
- **SLI (Service Level Indicator)**: The actual metric measured (e.g., Current p99 latency is 42ms).
- **SLO (Service Level Objective)**: The internal target team strives for (e.g., p99 latency < 50ms over 30 days).
- **SLA (Service Level Agreement)**: The contractual promise to customers with financial penalties if breached (e.g., 99.9% uptime credit).""",
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
            "related_topics": ["availability", "latency-and-throughput", "functional-requirements"],
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
            "content_markdown": """# Scalability: Vertical vs Horizontal

**Scalability** is the capability of a system to handle a growing amount of work by adding hardware resources.

### 1. Vertical Scaling (Scale Up)
Adding more CPU cores, RAM, or faster NVMe storage to a single physical machine or virtual instance.
- **Pros**: Zero architectural complexity; code remains single-process or multi-threaded; no network partition risks; transactions remain local ACID.
- **Cons**: Hard physical ceiling (the largest AWS EC2 instance has finite CPUs); exorbitant cost curve; single point of failure (if that box crashes, everything dies).

### 2. Horizontal Scaling (Scale Out)
Adding more commodity server instances running in parallel behind a load balancer.
- **Pros**: Virtually limitless ceiling; high availability (if node 3 fails, nodes 1, 2, and 4 continue serving traffic); cost-effective commodity compute.
- **Cons**: Requires stateless application servers; demands distributed caches, network serialization, and distributed database sharding.

### The Golden Rule of Horizontal Scaling
To scale horizontally, **application servers must be stateless**. Store user sessions in a shared fast store (like Redis) or JWT tokens rather than in local server memory.""",
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
            "related_topics": ["load-balancers", "application-servers", "capacity-planning"],
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
            "content_markdown": """# Availability & The Nines of Uptime

**Availability** is the percentage of time that a system remains fully functional and accessible to clients over a given observation period.

$$\\text{Availability} = \\frac{\\text{Uptime}}{\\text{Uptime} + \\text{Downtime}} = \\frac{\\text{MTBF}}{\\text{MTBF} + \\text{MTTR}}$$

- **MTBF (Mean Time Between Failures)**: Average operating time before a hardware/software failure occurs.
- **MTTR (Mean Time To Repair)**: Average time required to detect, mitigate, and recover from a failure.

### The 'Nines' Availability Table
| Availability | Downtime per Year | Downtime per Month | Downtime per Day | Typical System |
|---|---|---|---|---|
| **99% (Two Nines)** | 3.65 days | 7.31 hours | 14.4 minutes | Internal dev tools |
| **99.9% (Three Nines)** | 8.77 hours | 43.8 minutes | 1.44 minutes | Standard SaaS apps |
| **99.99% (Four Nines)** | 52.6 minutes | 4.38 minutes | 8.64 seconds | Cloud infrastructure, e-commerce |
| **99.999% (Five Nines)** | 5.26 minutes | 26.3 seconds | 0.86 seconds | Telecommunications, financial exchanges |

### Compound Availability Math
- **Components in Series** (both must work):
  $$A_{\\text{total}} = A_1 \\times A_2$$
  *Example*: App Server (99.9%) $\\times$ Database (99.9%) = **99.8%** (Overall availability drops!).
- **Components in Parallel** (redundant active/standby):
  $$A_{\\text{total}} = 1 - (1 - A_1) \\times (1 - A_2)$$
  *Example*: Two load balancers with 99.9% each: $1 - (0.001 \\times 0.001) = 1 - 0.000001 = $ **99.9999%**!""",
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
            "related_topics": ["fault-tolerance", "reliability", "scalability"],
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
            "content_markdown": """# Reliability & Failure Domains

**Reliability** is the probability that a system will perform its intended function under specified conditions without error over a specified period.

While **availability** measures whether the system answers requests (even with errors), **reliability** measures whether it produces **correct** results without dropping or corrupting data.

### Blast Radius Reduction
A fundamental principle of modern architecture is **minimizing blast radius**:
- If the recommender engine crashes, the checkout flow must still allow users to buy items.
- If region `us-east-1` suffers an outage, traffic should automatically route to `us-west-2`.
- Use **cell-based architecture** to isolate customer cohorts into autonomous mini-clusters.""",
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
            "related_topics": ["fault-tolerance", "availability", "non-functional-requirements"],
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
            "content_markdown": """# Latency vs Throughput

Understanding the distinction and relationship between latency and throughput is fundamental to distributed systems performance.

- **Latency**: The duration of time it takes for a single unit of data to travel from origin to destination (measured in milliseconds or microseconds).
- **Throughput**: The quantity of work or data processed per unit of time (measured in Requests Per Second, QPS, or Megabytes/sec).

### Little's Law
In any stable queueing system, the average number of concurrent requests in the system ($L$) equals the arrival throughput ($\\lambda$) multiplied by the average latency ($W$):

$$L = \\lambda \\times W$$

*Example*: If your API receives 1,000 requests/sec ($\\lambda = 1000$) and each request takes 200ms ($W = 0.2s$), your servers must maintain **200 concurrent active connections** ($L = 200$). If latency spikes to 2 seconds due to a slow DB query, concurrency explodes to **2,000 connections**, exhausting worker thread pools!

### Latency Numbers Every Programmer Should Know (Peter Norvig)
- **L1 CPU Cache reference**: 0.5 ns
- **L2 CPU Cache reference**: 7 ns
- **Main Memory (RAM) reference**: 100 ns
- **Read 1 MB sequentially from RAM**: 250,000 ns (0.25 ms)
- **Read 1 MB sequentially from NVMe SSD**: 1,000,000 ns (1 ms)
- **Read 1 MB sequentially from HDD**: 20,000,000 ns (20 ms)
- **Packet round trip (same data center)**: 500,000 ns (0.5 ms)
- **Packet round trip (CA to Netherlands)**: 150,000,000 ns (150 ms)

*Lesson*: Reading from RAM is $\\approx$ 10,000 times faster than reading from spinning disk! This is why in-memory caching is transformational.""",
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
            "related_topics": ["capacity-planning", "caching", "performance-optimization"],
            "knowledge_check": [
                {
                    "id": "kc_l1_07_1",
                    "question": "According to Little's Law (L = λ * W), what happens to server concurrency if request latency doubles while incoming traffic rate remains constant?",
                    "options": [
                        "Server concurrency halves",
                        "Server concurrency doubles, requiring twice as many active worker connections",
                        "Server concurrency remains identical",
                        "Throughput drops to zero"
                    ],
                    "correct_option_index": 1,
                    "explanation": "If latency (W) doubles and arrival rate (λ) stays constant, active concurrent in-flight requests (L) double."
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
            "content_markdown": """# Fault Tolerance & Redundancy

A system is **fault-tolerant** if it continues operating properly in the event of the failure of one or more of its components.

### Eliminating Single Points of Failure (SPOF)
A **Single Point of Failure (SPOF)** is any component whose breakdown causes the entire system to stop functioning.

### Redundancy Strategies
1. **Active-Passive (Standby)**:
   - Primary node handles 100% of traffic; secondary standby node mirrors state via replication.
   - On primary failure, a heartbeat mechanism triggers failover to promote the standby.
   - *Limitation*: Idle hardware costs money during normal operation.
2. **Active-Active**:
   - Multiple instances actively serve concurrent traffic.
   - If one node crashes, the load balancer redistributes its share among remaining healthy nodes.
   - *Advantage*: 100% resource utilization and instant zero-downtime tolerance.""",
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
            "related_topics": ["availability", "reliability", "load-balancers"],
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
            "content_markdown": """# Performance Optimization

Performance optimization is the disciplined practice of identifying and eliminating resource bottlenecks to maximize speed and minimize resource utilization.

### The Profiling Rule
**Never optimize without measurement.** 90% of execution time is typically consumed by 10% of code. Use profilers, APM tools (Datadog, OpenTelemetry), and slow query logs.

### Key Optimization Levers
1. **Caching**: Store computed or queried results in memory (Redis, Memcached).
2. **Connection Pooling**: Reusing established TCP connections to databases rather than handshaking every query.
3. **Compression**: Gzip/Brotli HTTP compression shrinks JSON payloads by 70-80%.
4. **Pagination**: Never return unbounded lists (`SELECT * FROM orders`); always use cursor-based or limit-offset pagination.""",
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
            "related_topics": ["latency-and-throughput", "caching", "database-indexes"],
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
            "content_markdown": """# Maintainability & Operability

Software systems spend 80% or more of their lifespan in **maintenance mode**. Maintainability is the ease with which software can be modified to correct defects, improve performance, or adapt to a changing environment.

### Core Principles
1. **Operability**: Make it easy for operations teams to keep the system running smoothly (good health checks, metrics, self-healing).
2. **Simplicity**: Reduce accidental complexity. Code should be readable and predictable.
3. **Evolvability**: Enable software to change easily when requirements evolve through loose coupling and well-defined API contracts.
4. **Feature Flags**: Decouple code deployment from feature release, enabling zero-downtime dark launches and instant rollbacks.""",
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
            "related_topics": ["what-is-system-design", "microservices"],
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
            "content_markdown": """# Capacity Planning & Back-of-the-Envelope Math

In system design interviews and real-world architecture, **Back-of-the-Envelope estimation** helps you quickly determine whether an architecture is computationally and economically viable.

### Key Rules of Thumb & Conversions
- **Seconds in a Day**: $24 \\times 3600 = 86,400 \\approx 100,000$ (simplifies mental division!).
- **Powers of 2 / 10**:
  - $2^{10} \\approx 10^3$ (Thousand = 1 KB)
  - $2^{20} \\approx 10^6$ (Million = 1 MB)
  - $2^{30} \\approx 10^9$ (Billion = 1 GB)
  - $2^{40} \\approx 10^{12}$ (Trillion = 1 TB)
  - $2^{50} \\approx 10^{15}$ (Petabyte = 1 PB)

### Core Formulas

#### 1. Average Requests Per Second (RPS)
$$\\text{Average RPS} = \\frac{\\text{Daily Requests}}{86,400}$$
*Example*: 100 Million daily requests $\\approx 100,000,000 / 100,000 = $ **1,000 RPS**.

#### 2. Peak Requests Per Second
$$\\text{Peak RPS} = \\text{Average RPS} \\times \\text{Peak Factor (typically 2 to 5)}$$
*Example*: $1,000 \\times 2 = $ **2,000 Peak RPS**.

#### 3. Storage Growth Per Year
$$\\text{Annual Storage} = \\text{Writes/Day} \\times \\text{Payload Size} \\times 365$$
*Example*: 10M tweets/day $\\times$ 500 bytes $\\times 365 = 5 \\text{ GB/day} \\times 365 \\approx$ **1.825 TB/year**.

#### 4. Bandwidth Requirements
$$\\text{Bandwidth (Bytes/sec)} = \\text{RPS} \\times \\text{Average Request Size}$$
Multiply by 8 to convert to bits/sec (e.g. Megabits per second).""",
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
            "related_topics": ["latency-and-throughput", "scalability", "what-is-system-design"],
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
            "content_markdown": """# Architecture Diagrams & The C4 Model

Visual diagrams are the universal language of software architecture. A diagram that lacks clear boundaries, protocol labels, or data flow directions causes confusion among engineering teams.

### The C4 Model (Simon Brown)
The C4 model structures diagrams hierarchically at 4 zoom levels:
1. **System Context**: Shows how the system fits into the world with human users and external systems.
2. **Container**: Shows high-level technical building blocks (web app, mobile app, API server, database, message queue).
3. **Component**: Zooms into a specific container to show internal modules (controllers, services, repositories).
4. **Code**: Class diagrams and entity relationships (rarely used in high-level system design).

### Diagram Best Practices in System Design
- Always label directional arrows with protocols (`HTTPS`, `gRPC`, `WebSocket`, `Kafka`).
- Clearly separate tiers: **Client Tier**, **Gateway / Load Balancing Tier**, **Application / Microservices Tier**, **Storage & Caching Tier**.
- Highlight read paths vs write paths using distinct colors or labels.""",
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
            "related_topics": ["what-is-system-design", "client-server-architecture"],
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
        }
    ]

print("Level 1 lessons loaded: 12")
