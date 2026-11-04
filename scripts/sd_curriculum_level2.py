# scripts/sd_curriculum_level2.py
# Level 2: Core Components (16 Lessons: topics 13 to 28)

def get_level2_lessons():
    return [
        {
            "id": "sd_l2_13",
            "level": 2,
            "level_name": "Core Components",
            "order_index": 13,
            "slug": "client-server-architecture",
            "title": "Client-Server Architecture",
            "summary": "Request-response lifecycles, thick vs thin clients, separation of concerns, and stateless communication protocols.",
            "estimated_minutes": 15,
            "content_markdown": """# Client-Server Architecture

The **Client-Server model** is the foundational distributed application structure that partitions tasks or workloads between the providers of a resource or service (servers) and service requesters (clients).

### Core Characteristics
1. **Separation of Concerns**: Clients focus on UI rendering and user interactions; servers focus on security, business rules, data integrity, and persistence.
2. **Stateless Request-Response**: In HTTP/REST architectures, each request from client to server must contain all necessary authentication and context data.
3. **Thick Client vs Thin Client**:
   - *Thin Client*: Server renders HTML (Server-Side Rendering / SSR); client is just a display browser.
   - *Thick Client*: Client executes complex SPA code (React, Vue, iOS Native) and communicates via JSON APIs.""",
            "key_decisions": ["Choosing between SSR vs SPA based on SEO and user interaction needs"],
            "advantages": ["Centralized data management", "Independent evolution of client and server codebases"],
            "disadvantages": ["Server becomes a central point of traffic congestion requiring load balancing"],
            "common_mistakes": ["Trusting client-side input validation on the server without re-verifying"],
            "practical_examples": ["Browser requesting REST JSON API from a Node.js Express backend"],
            "related_topics": ["application-servers", "load-balancers"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Application Servers & Statelessness

An **Application Server** hosts and executes the core business logic, orchestrates data queries, and coordinates with external services.

### Statelessness: The Key to Horizontal Scaling
In a **stateless architecture**, the server retains no client session state between requests. Any request from any user can be routed to any server instance with identical results.
- **Stateful (Bad)**: User logs into Server A; Server A keeps session in its local RAM. If next request goes to Server B, the user is suddenly logged out!
- **Stateless (Good)**: User logs in; session is stored in a shared distributed **Redis cluster**, or an encrypted **JWT token** is given to the client. Any server can validate the request instantly.""",
            "key_decisions": ["JWT client-side token storage vs Server-side Redis session storage"],
            "advantages": ["Instant zero-downtime auto-scaling: servers can be killed or spun up on demand"],
            "disadvantages": ["Requires network hop to shared session store for every authenticated request"],
            "common_mistakes": ["Storing uploaded files in local server directory `/tmp` instead of S3"],
            "practical_examples": ["Stateless Go microservice containers running inside a Kubernetes cluster"],
            "related_topics": ["scalability", "load-balancers", "caching"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Reverse Proxies (Nginx, Envoy)

A **Reverse Proxy** sits between clients and web servers, intercepting incoming client requests and directing them to the appropriate backend server.

### Forward Proxy vs Reverse Proxy
- **Forward Proxy**: Sits in front of **clients** to protect client identities and bypass firewalls (e.g., corporate VPN).
- **Reverse Proxy**: Sits in front of **servers** to protect backend infrastructure and optimize traffic delivery.

### Key Capabilities
1. **SSL/TLS Termination**: Decrypts incoming HTTPS traffic once at the edge, relieving internal application servers of heavy cryptographic CPU cycles.
2. **Request Buffering**: Absorbs slow client connections before forwarding fast, complete requests to application worker threads.
3. **Static Content Serving**: Directly serves images, CSS, and JS from cache without touching Python/Java backends.
4. **Security Masking**: Prevents external clients from directly accessing internal IP addresses or server topologies.""",
            "key_decisions": ["Choosing Nginx (mature, event-driven) vs Envoy (dynamic service mesh proxy)"],
            "advantages": ["Centralized SSL certificate management", "Protection against direct DDoS attacks on application servers"],
            "disadvantages": ["Adds an extra network hop and configuration layer"],
            "common_mistakes": ["Terminating SSL at the proxy but failing to encrypt internal transit for strict compliance environments"],
            "practical_examples": ["Nginx reverse proxy forwarding `/api/*` to Node.js backend and serving `/static/*` directly from disk"],
            "related_topics": ["load-balancers", "api-gateways"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Load Balancers: L4 vs L7 & Algorithms

A **Load Balancer (LB)** distributes network traffic across multiple backend servers to ensure no single server becomes overwhelmed.

### Layer 4 vs Layer 7 Load Balancing
- **Layer 4 (Transport Layer)**:
  - Operates on IP address and TCP/UDP port without inspecting application payload.
  - Extremely fast and lightweight (millions of packets/sec via Linux kernel eBPF / LVS).
  - Cannot inspect HTTP headers, cookies, or URL paths.
- **Layer 7 (Application Layer)**:
  - Parses full HTTP/HTTPS headers, cookies, and URI paths.
  - Enables intelligent content-based routing: route `/video/*` to Video microservice, and `/auth/*` to Auth service.
  - Enables sticky sessions and header-based rate limiting.

### Load Balancing Algorithms
1. **Round Robin**: Routes requests sequentially (Server 1 -> 2 -> 3 -> 1). Best for stateless, homogeneous servers.
2. **Weighted Round Robin**: Routes proportionally based on server capacity (e.g. 8-core server gets 2x requests of 4-core server).
3. **Least Connections**: Sends requests to server with fewest active connections. Best for long-lived connections (WebSockets).
4. **IP Hash**: Hashes client IP to guarantee the same client hits the same server (session affinity).
5. **Consistent Hashing**: Minimizes key remapping when servers join or leave the pool.""",
            "key_decisions": ["Deploying L4 (AWS NLB) for raw packet speed vs L7 (AWS ALB) for path-based routing", "Configuring health check intervals and failure thresholds"],
            "advantages": ["Prevents overloading individual servers", "Enables zero-downtime rolling deployments"],
            "disadvantages": ["The load balancer itself must be redundant (Active-Standby with floating virtual IP or DNS round-robin) to avoid being a SPOF"],
            "common_mistakes": ["Setting health check thresholds too aggressively, causing cascading thrashing when servers have brief latency spikes"],
            "practical_examples": ["AWS Application Load Balancer routing `/api/v1/checkout` to the Payments pod fleet"],
            "related_topics": ["reverse-proxies", "scalability", "fault-tolerance"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Horizontal and Vertical Scaling Patterns

Scaling dynamically adjusts compute capacity to match fluctuating workload demands in real-time.

### Auto-Scaling Metrics & Policies
1. **CPU Utilization**: Scale out when average CPU > 70% across fleet.
2. **Request Queue Depth**: Scale out when pending jobs in queue cross threshold.
3. **Request Count Per Target**: Scale out when RPS per container exceeds calibrated capacity.

### Cooldown Periods & Flapping Prevention
Auto-scaling requires a **cooldown period** (e.g. 300 seconds) after scaling out to allow newly launched instances to initialize and absorb load before triggering another scale event. This prevents **thrashing/flapping** (rapid oscillating scaling in and out).""",
            "key_decisions": ["Using predictive scaling for scheduled spikes vs reactive metrics for sudden surges"],
            "advantages": ["Optimizes cost by paying only for active capacity needed at any hour"],
            "disadvantages": ["Cold start delays (JVM or container boot times) can cause dropped traffic if spikes happen faster than boot time"],
            "common_mistakes": ["Neglecting graceful shutdown (SIGTERM handling), killing in-flight customer transactions when an instance scales in"],
            "practical_examples": ["AWS EC2 Auto Scaling Groups with scale-in protection during active batch jobs"],
            "related_topics": ["scalability", "load-balancers"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Caching Strategies & Eviction Policies

**Caching** stores expensive query results or computations in fast memory (RAM) so subsequent requests can be served in sub-millisecond times.

### The 4 Major Caching Patterns
1. **Cache-Aside (Lazy Loading)**:
   - Application queries cache first.
   - If **Cache Hit**, return data.
   - If **Cache Miss**, query database, write result into cache with TTL, and return.
   - *Advantage*: Only requested data is cached. Resilience if cache node dies.
2. **Write-Through**:
   - Application writes data to cache and database synchronously in a single transaction.
   - *Advantage*: Cache is always fresh and consistent with DB.
   - *Disadvantage*: Higher write latency.
3. **Write-Behind (Write-Back)**:
   - Application writes directly to cache; cache asynchronously batches writes to database after a delay.
   - *Advantage*: Incredible write throughput.
   - *Disadvantage*: Data loss risk if cache crashes before flushing to DB.
4. **Refresh-Ahead**:
   - Cache automatically reloads frequently accessed keys before their TTL expires.

### Eviction Policies
When cache memory fills up, old keys must be evicted:
- **LRU (Least Recently Used)**: Discards items not accessed for the longest time (most common).
- **LFU (Least Frequently Used)**: Discards items with the lowest access count.
- **FIFO (First In, First Out)**: Evicts oldest items regardless of access frequency.

### The Cache Stampede (Thundering Herd)
When a hot cache key expires, thousands of concurrent requests miss the cache and hammer the database simultaneously, causing database collapse!
*Mitigation*: Use **probabilistic early expiration (XFetch)**, mutual exclusion locks (single-flight), or pre-warmed background refresh.""",
            "key_decisions": ["Setting appropriate Time-To-Live (TTL) values based on data volatility", "Choosing Cache-Aside vs Write-Through"],
            "advantages": ["Reduces database load by 80-95%", "Cuts p99 read latency from 50ms to < 2ms"],
            "disadvantages": ["Cache invalidation is notoriously difficult; risk of serving stale data"],
            "common_mistakes": ["Caching without a TTL, leading to unbounded memory growth (OOM crash)", "Not protecting against Cache Stampede on viral keys"],
            "practical_examples": ["Redis cluster storing user profile JSON with a 1-hour TTL"],
            "related_topics": ["latency-and-throughput", "sql-databases", "nosql-databases"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Content Delivery Networks (CDN) & Edge Caching

A **Content Delivery Network (CDN)** is a geographically distributed network of proxy servers (Points of Presence - **PoPs**) that cache content close to end users.

### How CDNs Drastically Cut Latency
If a user in Tokyo requests a 5MB image from a server in Virginia, speed of light in fiber dictates a minimum 150ms round-trip latency.
A CDN caches the image in a Tokyo edge server, reducing latency to **< 5ms**!

### Anycast DNS Routing
Clients query a single universal IP address. Border Gateway Protocol (BGP) Anycast automatically routes packets to the physically nearest CDN PoP.""",
            "key_decisions": ["Caching static media vs executing dynamic edge compute (SSR at the edge)", "Configuring `Cache-Control: public, max-age=31536000, immutable` with asset content hashing"],
            "advantages": ["Offloads 90%+ of static asset traffic from origin servers", "Built-in edge DDoS mitigation (Cloudflare, Fastly, AWS CloudFront)"],
            "disadvantages": ["Global cache invalidation can take several minutes to propagate"],
            "common_mistakes": ["Using generic filenames like `logo.png` instead of hashed names like `logo.a8f9b2.png`, leading to stale browser caches"],
            "practical_examples": ["Serving Netflix video chunks and Spotify audio clips from local ISP edge CDN caches"],
            "related_topics": ["caching", "latency-and-throughput"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# SQL Databases & ACID Guarantees

Relational **SQL Databases** (PostgreSQL, MySQL) store data in structured tables with strict schemas, relationships, and mathematical relational algebra.

### The ACID Guarantee
- **Atomicity**: An entire transaction succeeds, or it all rolls back completely (All or Nothing).
- **Consistency**: Data transitions strictly from one valid state to another, satisfying all schema constraints, checks, and foreign keys.
- **Isolation**: Concurrent transactions execute without interfering with one another.
- **Durability**: Once a transaction commits, its modifications are permanently recorded to non-volatile storage (via Write-Ahead Log - **WAL**), surviving power outages.

### SQL Transaction Isolation Levels
1. **Read Uncommitted**: Suffers dirty reads.
2. **Read Committed**: Default in Postgres. Prevents dirty reads.
3. **Repeatable Read**: Default in MySQL InnoDB. Prevents non-repeatable reads via MVCC.
4. **Serializable**: Highest isolation; prevents phantom reads via strict lock graph or optimistic serializable MVCC.""",
            "key_decisions": ["Choosing PostgreSQL (extensible, JSONB, advanced indexing) vs MySQL (fast point queries)", "Selecting transaction isolation level to balance concurrency vs consistency"],
            "advantages": ["Structured schema enforcement", "Powerful declarative relational JOINs and aggregations", "Guaranteed financial consistency"],
            "disadvantages": ["Vertical scaling limit; horizontal sharding across multi-node SQL is complex"],
            "common_mistakes": ["Using SQL for high-velocity IoT time-series writes without partitioning", "Writing complex 10-table joins in high-traffic OLTP web request paths"],
            "practical_examples": ["Banking ledger and e-commerce order management systems requiring strict ACID invariants"],
            "related_topics": ["nosql-databases", "database-indexes", "database-replication"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# NoSQL Databases (Document, Key-Value, Columnar, Graph)

**NoSQL (Not Only SQL)** databases are engineered to solve specific distributed scale, latency, and flexible schema challenges where traditional single-node relational databases struggle.

### The 4 Major NoSQL Families
1. **Key-Value Stores (Redis, DynamoDB, Memcached)**:
   - Data stored as simple key -> value blobs.
   - Ultra-fast $O(1)$ point lookups by primary partition key.
   - Ideal for session state, shopping carts, and caching.
2. **Document Stores (MongoDB, Couchbase)**:
   - Data stored as semi-structured hierarchical JSON/BSON documents.
   - Flexible schemas allow rapid iteration without complex ALTER TABLE migrations.
   - Ideal for product catalogs, content management, and user profiles.
3. **Wide-Column Stores (Apache Cassandra, ScyllaDB, HBase)**:
   - Distributed tabular stores optimized for sequential append-only disk writes.
   - Shards rows across clusters using consistent hashing partition keys.
   - Ideal for high-throughput time-series logs, chat history, and sensor telemetry.
4. **Graph Databases (Neo4j, Amazon Neptune)**:
   - Nodes (entities) and Edges (relationships) are first-class citizens.
   - Index-free adjacency enables millisecond deep relational traversals without expensive multi-table SQL joins.
   - Ideal for social networks, fraud detection rings, and recommendation engines.""",
            "key_decisions": ["Choosing between SQL strict schema vs NoSQL horizontal partitionability", "Modeling data around query patterns rather than relational normalization"],
            "advantages": ["Natural horizontal partitioning across hundreds of commodity nodes", "Flexible schema evolution"],
            "disadvantages": ["Lack of multi-table JOINs; requires application-side denormalization", "Eventual consistency trade-offs (BASE instead of ACID)"],
            "common_mistakes": ["Using a Document store like Mongo and then trying to simulate relational foreign key joins in application code", "Picking NoSQL simply because it is 'trendy' without checking query access patterns"],
            "practical_examples": ["Discord migrated billions of chat messages from MongoDB to Cassandra/ScyllaDB to handle append-only chat logs"],
            "related_topics": ["sql-databases", "database-partitioning", "caching"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Database Indexes: B-Trees, Hash & Inverted

A **Database Index** is a specialized auxiliary data structure that improves the speed of data retrieval operations on a database table at the cost of additional write overhead and storage space.

### 1. B+ Tree Index (Default in Relational DBs)
- Self-balancing n-ary tree where all data rows/pointers reside strictly in leaf nodes.
- Leaf nodes are linked in a sequential doubly linked list.
- **Complexity**: $O(\\log N)$ for lookups, insertions, and deletions.
- **Superpower**: Highly efficient **range queries** (`WHERE age BETWEEN 20 AND 30`) and sorting (`ORDER BY created_at`).

### 2. Hash Index
- Maps key directly to disk location via hash function.
- **Complexity**: $O(1)$ average point lookup.
- **Limitation**: Completely useless for range queries (`WHERE age > 25`) or sorting.

### 3. Inverted Index (Search Engines: Elasticsearch, Lucene)
- Maps every distinct word to a sorted posting list of Document IDs containing that word.
- The fundamental building block of full-text search and search autocomplete engines.

### The Index Write Tax (Write Amplification)
Every additional index on a table accelerates read queries, but **slows down every `INSERT`, `UPDATE`, and `DELETE`**, because the database must update the table AND rebalance all associated B-Trees.""",
            "key_decisions": ["Indexing high-cardinality columns vs low-cardinality columns", "Ordering columns in composite indexes following the Leftmost Prefix Rule"],
            "advantages": ["Transforms full table scans ($O(N)$) into logarithmic lookups ($O(\\log N)$)"],
            "disadvantages": ["Increases disk storage and slows down write throughput"],
            "common_mistakes": ["Adding 15 indexes on a high-write financial ledger table, destroying write throughput", "Creating a composite index `(A, B)` and expecting it to optimize queries filtering only on `B`"],
            "practical_examples": ["Using `EXPLAIN ANALYZE` in PostgreSQL to verify that a query uses an Index Scan instead of a Sequential Scan"],
            "related_topics": ["sql-databases", "performance-optimization"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Database Replication: Leader-Follower & Multi-Leader

**Replication** is the practice of sharing and synchronizing data across multiple database instances to enhance fault tolerance, disaster recovery, and read throughput.

### 1. Single-Leader (Leader-Follower / Master-Slave)
- **All writes** are sent exclusively to the **Leader (Primary)**.
- The leader writes to its local storage and streams its Write-Ahead Log (WAL) to one or more **Followers (Read Replicas)**.
- **Reads** can be distributed across any of the read replicas.
- *Advantage*: Simple concurrency model; no write conflict resolution required.
- *Challenge*: **Replication Lag** (asynchronous replicas lag milliseconds to seconds behind the master, leading to stale reads).

### 2. Multi-Leader (Multi-Master)
- Multiple database nodes accept concurrent writes (typically across different geographical regions).
- Nodes replicate writes asynchronously to each other.
- *Challenge*: **Write Conflicts** (User in US updates row while user in Europe updates same row). Requires conflict resolution strategies (Last-Write-Wins, CRDTs).""",
            "key_decisions": ["Using synchronous replication (zero data loss, higher write latency) vs asynchronous replication (fast writes, potential failover data loss)", "Handling 'Read-Your-Own-Writes' consistency by routing immediate post-update reads to the primary"],
            "advantages": ["Scales read traffic across multiple replicas", "Provides instant failover target if primary crashes"],
            "disadvantages": ["Replication lag causes users to see stale data immediately after updating their profile"],
            "common_mistakes": ["Assuming read replicas solve database write bottlenecks (all replicas must re-execute all writes!)"],
            "practical_examples": ["AWS Aurora Postgres: 1 writer node with up to 15 auto-scaling read replicas sharing a distributed storage tier"],
            "related_topics": ["database-partitioning", "consistency-models", "fault-tolerance"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Database Partitioning & Sharding

When a database grows beyond the CPU, memory, or disk storage limits of the largest physical machine, it must be **partitioned**.

### Partitioning Types
1. **Vertical Partitioning**: Splitting a wide table into smaller tables by columns (e.g. putting frequently accessed `users (id, email)` on one DB and large `user_profiles (bio, avatar_blob)` on another).
2. **Horizontal Partitioning (Sharding)**: Splitting a table by rows across multiple independent physical database instances (shards).

### Sharding Key Strategies
- **Range-Based Sharding**: Partition by alphabetical or numerical range (e.g., Shard 1: User IDs 1-1M; Shard 2: 1M-2M).
  - *Risk*: Severe write hot-spotting on the latest range for auto-incrementing IDs.
- **Hash-Based Sharding**: Hash the Sharding Key modulo number of shards (`hash(user_id) % N`).
  - *Advantage*: Uniformly scatters writes across all shards.
- **Directory-Based Sharding**: A lookup service maintains a mapping of which entity ID lives on which shard.

### The Nightmares of Sharding
- **Cross-Shard JOINs**: Performing relational JOINs across tables living on separate physical servers is notoriously slow and complex.
- **Re-sharding**: Changing from 4 shards to 8 shards requires migrating terabytes of data across the network.""",
            "key_decisions": ["Selecting a Sharding Key with high cardinality and even traffic distribution (e.g., `user_id` or `tenant_id`)", "Adopting Consistent Hashing to minimize data migration during cluster expansion"],
            "advantages": ["Enables unbounded write scaling and petabyte storage capacities"],
            "disadvantages": ["Destroys ACID cross-shard transactions and makes relational joins virtually impossible"],
            "common_mistakes": ["Sharding too early when vertical scaling and read replicas would have sufficed for 5 more years", "Picking a low-cardinality sharding key (like `country`), causing massive hot spots on large nations"],
            "practical_examples": ["Instagram sharding their PostgreSQL databases by `user_id` with custom 64-bit ID generation"],
            "related_topics": ["sql-databases", "nosql-databases", "sharding-strategies"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Message Queues: Asynchronous Decoupling

A **Message Queue** is an asynchronous communication buffer that decouples producer processes from consumer processes.

### Why Message Queues are Indispensable
1. **Asynchronous Processing**: An HTTP client submitting a video shouldn't wait 10 minutes while it transcodes. The API accepts the file, pushes an event to a queue, and returns `202 Accepted` in 15ms.
2. **Backpressure & Spike Absorption**: If 50,000 orders arrive during Black Friday, synchronous databases crash. A message queue buffers the surge safely while worker fleets consume at a steady, sustainable rate.
3. **Fault Isolation**: If the email delivery service goes down, the checkout service does not fail; email messages simply wait safely in the queue until the worker recovers.

### Core Delivery Semantics
- **At-most-once**: Messages may be lost, but never duplicated (Fire and forget).
- **At-least-once**: Messages are guaranteed never to be lost, but may occasionally be re-delivered on network retries (**Consumers must be idempotent!**).
- **Dead-Letter Queue (DLQ)**: Poison pill messages that fail processing after $N$ retry attempts are diverted to a DLQ for manual engineer inspection.""",
            "key_decisions": ["Choosing point-to-point queue (RabbitMQ/SQS) vs append-only streaming log (Kafka)", "Configuring Dead-Letter Queue thresholds and retry backoffs"],
            "advantages": ["Decouples microservices", "Smooths out peak traffic bursts without crashing backends"],
            "disadvantages": ["Introduces asynchronous eventual consistency (clients cannot read results immediately)"],
            "common_mistakes": ["Assuming message queues guarantee strictly FIFO order globally without throughput trade-offs", "Building non-idempotent consumers that double-charge credit cards when messages are re-delivered"],
            "practical_examples": ["AWS SQS buffering image resizing jobs for an asynchronous worker fleet"],
            "related_topics": ["background-workers", "event-driven-architecture", "idempotency"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Background Workers & Task Queues

**Background Workers** are autonomous backend processes dedicated to executing asynchronous, CPU-intensive, or delayed tasks off the main web request thread.

### Common Worker Use Cases
- Sending transactional emails, SMS alerts, and push notifications.
- Video transcoding, image resizing, and OCR text extraction.
- Generating heavy PDF invoices and accounting tax reports.
- Nightly data aggregation, machine learning batch feature engineering, and database vacuuming.

### Worker Fleet Scaling
Workers scale independently from web API servers:
- Web servers scale based on incoming HTTP request volume.
- Workers scale based on **Queue Depth (number of waiting messages)** and message processing latency.""",
            "key_decisions": ["Separating interactive priority queues from low-priority bulk background queues", "Setting strict task timeouts to prevent zombie workers from hanging indefinitely"],
            "advantages": ["Guarantees web API response times remain snappy (< 50ms) regardless of heavy background processing"],
            "disadvantages": ["Requires monitoring queue lag to avoid silent job processing backlogs"],
            "common_mistakes": ["Running long-running tasks inside the HTTP request handler, causing client browser gateway timeouts (504 Gateway Timeout)"],
            "practical_examples": ["Celery workers in Python consuming tasks from Redis to process uploaded PDF documents asynchronously"],
            "related_topics": ["message-queues", "application-servers"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Object Storage (S3, GCS, Blob Storage)

**Object Storage** (Amazon S3, Google Cloud Storage, Azure Blob Storage) is a specialized flat storage architecture designed for massive, virtually infinite unstructured binary data (videos, images, backups, data lake files).

### Object Storage vs Block Storage vs File Storage
- **Block Storage (EBS, NVMe)**: Hard disks attached directly to a single operating system. Fastest, supports raw random read/write byte offsets, but cannot be shared across multiple servers.
- **File Storage (NFS, EFS)**: Hierarchical folder structure accessible simultaneously by multiple servers via POSIX network protocols.
- **Object Storage (S3)**: Flat namespace accessed via HTTP REST APIs (`GET /bucket/photo.jpg`). Highly scalable, 11 nines of durability (99.999999999%), but objects are immutable (to change one byte, you must re-upload the entire object).

### Pre-Signed URLs: Offloading Uploads
Instead of proxying a 2GB video upload through your web application servers (exhausting server RAM and bandwidth), the server generates a cryptographically signed **Pre-Signed S3 Upload URL**. The client browser uploads the file directly to S3!""",
            "key_decisions": ["Lifecycle rules transitioning old objects to Cold Archive / Glacier to cut costs by 90%", "Using Multipart Uploads for large files > 100MB to enable parallel chunk uploads and pause/resume"],
            "advantages": ["Limitless scale at lowest cost per gigabyte", "Built-in replication across 3 physical data centers"],
            "disadvantages": ["Higher latency per request (10-30ms) than local NVMe disk", "Immutable objects cannot be modified in-place"],
            "common_mistakes": ["Storing binary images directly inside relational database tables as SQL `BLOB` columns", "Making S3 buckets publicly readable by accident, leaking private customer documents"],
            "practical_examples": ["Instagram storing billions of user photos in S3 buckets fronted by CloudFront CDN"],
            "related_topics": ["cdn", "capacity-planning"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# API Gateways: The Front Door

An **API Gateway** serves as the single point of entry for all external client traffic into a microservices or distributed backend architecture.

### Core Cross-Cutting Responsibilities
1. **Request Routing**: Directs client requests to appropriate internal microservices based on URL path, host header, or method.
2. **Authentication & Authorization**: Validates OAuth2, JWT, or API keys at the boundary so downstream microservices receive pre-authenticated requests.
3. **Rate Limiting & Throttling**: Enforces quotas per user/IP to prevent denial of service.
4. **Protocol Translation**: Translates external public JSON REST requests into internal high-performance binary gRPC calls.
5. **Circuit Breaking & Fallbacks**: Returns cached or default responses when internal microservices suffer outages.
6. **Telemetry & Distributed Tracing**: Injects correlation IDs (`X-Correlation-ID`) into request headers for end-to-end distributed tracing across microservices.""",
            "key_decisions": ["Deploying managed cloud gateways (AWS API Gateway) vs high-performance open-source proxies (Kong, Apache APISIX, Envoy)"],
            "advantages": ["Prevents duplicating authentication and rate limiting logic across 50 separate microservices", "Shields internal microservice network topology from public exposure"],
            "disadvantages": ["Becomes a single point of failure and potential latency bottleneck if not horizontally scaled"],
            "common_mistakes": ["Putting heavy business logic or domain transformations into the API Gateway (the Gateway should remain thin and routing-focused)"],
            "practical_examples": ["Kong API Gateway verifying client JWT tokens and forwarding requests to user, product, and payment microservices"],
            "related_topics": ["reverse-proxies", "microservices", "rate-limiting"],
            "knowledge_check": [{
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
            }]
        }
    ]

print("Level 2 lessons loaded: 16")
