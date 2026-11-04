# scripts/sd_curriculum_level3.py
# Level 3: Distributed Systems (16 Lessons: topics 29 to 44)

def get_level3_lessons():
    return [
        {
            "id": "sd_l3_29",
            "level": 3,
            "level_name": "Distributed Systems",
            "order_index": 29,
            "slug": "distributed-system-fundamentals",
            "title": "Distributed System Fundamentals & Network Fallacies",
            "summary": "The 8 Fallacies of Distributed Computing, partial failures, network partitions, and independent clock skew.",
            "estimated_minutes": 20,
            "content_markdown": """# Distributed System Fundamentals & Network Fallacies

A **Distributed System** is a collection of autonomous computing entities that communicate over a network to coordinate actions and achieve a shared objective.

### The 8 Fallacies of Distributed Computing (L. Peter Deutsch)
All junior engineers falsely assume:
1. **The network is reliable**: Networks drop packets, cables get severed, and switches crash.
2. **Latency is zero**: Moving bytes over fiber optics takes finite milliseconds.
3. **Bandwidth is infinite**: Network interfaces saturate under sudden load.
4. **The network is secure**: Man-in-the-middle attacks and unencrypted packets are vulnerable.
5. **Topology does not change**: Cloud routers and instances constantly re-route and migrate.
6. **There is one administrator**: Different teams manage different firewalls and subnets.
7. **Transport cost is zero**: Serialization and deserialization consume significant CPU.
8. **The network is homogeneous**: Mixed versions of hardware, OS, and protocols coexist.

### Partial Failures & The Asynchronous Network
In a single machine, if code crashes, the whole process dies cleanly.
In a distributed system, **Node A can send a message to Node B, and receive no reply**. Node A has no way of knowing:
- Did the network drop the request?
- Did Node B crash before processing?
- Did Node B successfully process the request, but the network dropped the response?
This fundamental ambiguity requires **idempotency**, **timeouts**, and **retries**.""",
            "key_decisions": ["Designing for inevitable network partitions and partial failure states from day one"],
            "advantages": ["Enables horizontal scaling, global geographical presence, and hardware fault tolerance"],
            "disadvantages": ["Drastically increases debugging complexity; traditional step-through debuggers cannot inspect distributed state"],
            "common_mistakes": ["Assuming a missing HTTP response means the request was never executed on the backend server"],
            "practical_examples": ["Handling network timeouts during payment authorization without double-charging the customer"],
            "related_topics": ["cap-theorem", "idempotency", "circuit-breakers"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Consistency Models: Strong to Eventual

In distributed data stores, a **consistency model** defines the contract between the programmer and the system regarding the visibility and ordering of concurrent read and write operations.

### The Spectrum of Consistency
1. **Strong Consistency (Linearizability)**:
   - Once a write is acknowledged as complete, all subsequent reads across all nodes globally are guaranteed to return that updated value or newer.
   - Operations appear to take effect atomically at a single point in time on a single global timeline.
   - *Cost*: High write latency; requires waiting on synchronous network quorums.
2. **Causal Consistency**:
   - Operations that are causally related must be seen by every node in the same order. Operations that are concurrent may be seen in different order.
3. **Read-Your-Own-Writes Consistency**:
   - A guarantee that if user $U$ updates data, any subsequent read by user $U$ will always reflect their update (even if other users temporarily see older data).
   - Achieved by routing reads for modified entities to the leader node for a brief window.
4. **Eventual Consistency**:
   - If no new updates are made, all replicas will eventually converge to identical values.
   - Replicas answer reads immediately without coordinating with the leader.
   - *Superpower*: Lowest possible latency and highest availability.
   - *Downside*: Temporary stale reads.""",
            "key_decisions": ["Choosing Strong Consistency for financial balances vs Eventual Consistency for social media feeds"],
            "advantages": ["Eventual consistency unlocks sub-10ms global read latency across multi-region datacenters"],
            "disadvantages": ["Strong consistency causes requests to fail or stall if network partitions isolate replicas"],
            "common_mistakes": ["Using eventual consistency for inventory counts, leading to overselling scarce concert tickets"],
            "practical_examples": ["Amazon DynamoDB offering an explicit choice: `ConsistentRead=false` (cheaper, eventual) vs `ConsistentRead=true` (strong)"],
            "related_topics": ["cap-theorem", "eventual-consistency", "database-replication"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# CAP Theorem & PACELC Trade-Offs

Formulated by Eric Brewer and proven by Gilbert and Lynch, the **CAP Theorem** states that any distributed data store can simultaneously provide at most two of the following three guarantees:

1. **Consistency (C)**: Every read receives the most recent write or an error (Linearizability).
2. **Availability (A)**: Every non-failing node returns a non-error response for every request (though it may not be the newest write).
3. **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

### The Realistic Reality: P is Non-Negotiable!
In real physical networks, **network partitions (P) are an unavoidable physical reality**. Routers fail, fiber cables get severed, and cloud subnets lose connectivity.
Therefore, the choice is **never 'CA'**. When a partition occurs, an architect MUST choose:
- **CP (Consistency over Availability)**: Reject or block writes on partitioned nodes to prevent split-brain inconsistencies (e.g. Google Spanner, CockroachDB, Zookeeper).
- **AP (Availability over Consistency)**: Allow nodes on both sides of the partition to accept writes and reads, accepting that data will diverge and must be merged later (e.g. Apache Cassandra, Couchbase).

### Beyond CAP: The PACELC Theorem (Daniel Abadi)
CAP only describes system behavior **during a rare network partition**. PACELC describes normal operations too:
- **If there is a Partition (P)**, trade off **Availability (A)** vs **Consistency (C)**.
- **Else (E)**, trade off **Latency (L)** vs **Consistency (C)**.
*Example*: MongoDB is **PC/EC** (prefers consistency always). DynamoDB/Cassandra is **PA/EL** (prefers availability during partitions, and lowest latency during normal operations).""",
            "key_decisions": ["Classifying subsystems into CP (Billing, Inventory) vs AP (Timeline, Comments, Analytics)"],
            "advantages": ["Provides a rigorous theoretical framework for evaluating distributed database architectures"],
            "disadvantages": ["Engineers often misinterpret CAP as a simplistic 'pick any two' menu; P is mandatory in distributed systems"],
            "common_mistakes": ["Claiming a distributed system is 'CA' across multiple physical data centers (physically impossible under network cuts)"],
            "practical_examples": ["ATM networks choosing AP: if the central bank connection is cut, the ATM dispenses cash up to a $200 emergency offline limit"],
            "related_topics": ["consistency-models", "eventual-consistency", "distributed-transactions"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Eventual Consistency & Conflict Resolution

In an eventually consistent, multi-master, or decentralized system, multiple nodes can accept concurrent modifications to the same entity. When nodes synchronize, **conflicts are inevitable**.

### Conflict Resolution Strategies
1. **Last-Write-Wins (LWW)**:
   - Uses the timestamp of the write; whichever has the higher physical clock timestamp overwrites earlier writes.
   - *Fatal Flaw*: Physical clocks across servers drift (NTP clock skew); a server whose clock is 200ms fast can silently destroy valid user updates!
2. **Vector Clocks / Version Vectors**:
   - Each node maintains an internal logical clock counter. Updates capture a vector of counters (e.g. `[NodeA: 2, NodeB: 1]`).
   - Enables the system to mathematically detect whether an update is an **ancestor** (clean overwrite) or a **concurrent branch** (conflict needing resolution).
3. **CRDTs (Conflict-Free Replicated Data Types)**:
   - Mathematical data structures (counters, sets, registers, text trees) designed so that any two replicas can merge in any order without coordination, **guaranteeing mathematical convergence without conflicts**!
   - Powers real-time collaborative editors (Figma, Google Docs) and shopping carts (Amazon Dynamo).""",
            "key_decisions": ["Choosing between automated CRDT convergence vs explicit application-level merge rules"],
            "advantages": ["Zero lock contention across global nodes; seamless offline-first mobile synchronization"],
            "disadvantages": ["Complex data structures and metadata storage overhead (tombstones for deleted items)"],
            "common_mistakes": ["Relying on server wall-clock timestamps for Last-Write-Wins in financial systems"],
            "practical_examples": ["Apple Notes and Figma using CRDTs to synchronize edits made by offline mobile clients"],
            "related_topics": ["consistency-models", "cap-theorem"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Replication Strategies: Sync, Async & Semi-Sync

How database replicas synchronize data dictates the fundamental trade-off between write latency and durability risk.

### Replication Protocols
1. **Asynchronous Replication**:
   - Primary commits transaction to disk, acknowledges client immediately, and pushes WAL updates to replicas in the background.
   - *Pros*: Lowest write latency; replica slowness never blocks the writer.
   - *Cons*: If primary dies before replica receives log, committed data is lost (RPO > 0).
2. **Synchronous Replication**:
   - Primary waits until ALL replicas confirm data has been written to their logs before acknowledging client.
   - *Pros*: Zero data loss guarantee (RPO = 0).
   - *Cons*: Write latency equals the slowest replica's round trip. If one replica hangs, the entire database freezes!
3. **Semi-Synchronous Replication**:
   - Primary waits for at least ONE replica to confirm receipt before committing.
   - Balances safety and throughput.

### Quorum Consensus Formula
In leaderless systems (Cassandra, DynamoDB) with $N$ replicas:
- $W$ = Number of replicas that must confirm a write.
- $R$ = Number of replicas that must be queried for a read.
$$\\mathbf{R + W > N} \\implies \\text{Strong Consistency (Overlap guaranteed!)}$$
*Example*: $N=3, W=2, R=2 \\implies R+W = 4 > 3$. A read is mathematically guaranteed to touch at least one replica holding the latest write!""",
            "key_decisions": ["Choosing Quorum ($W=2, R=2$) for consistency vs ($W=1, R=1$) for extreme speed"],
            "advantages": ["Tunable consistency allows matching exact business risk tolerances"],
            "disadvantages": ["Synchronous replication makes write availability fragile to network blips"],
            "common_mistakes": ["Setting $R=1, W=1$ on a cluster and expecting strong consistency"],
            "practical_examples": ["MySQL Semi-Synchronous Replication ensuring at least one standby replica has the transaction log before client returns"],
            "related_topics": ["database-replication", "consistency-models"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Consistent Hashing & Ring Partitions

When scaling distributed caches (Memcached, Redis) or databases (Cassandra, DynamoDB), traditional modulo hashing (`hash(key) % N`) has a catastrophic flaw: **if you add or remove a single server node, almost 100% of keys remap to new servers**, causing a total cache blowout!

### Consistent Hashing to the Rescue
Consistent Hashing maps both **Server Nodes** and **Data Keys** onto a shared circular integer range (e.g., $0$ to $2^{32} - 1$, called the **Hash Ring**).

### How It Works
1. Hash server IP addresses onto positions on the ring.
2. Hash incoming keys to positions on the ring.
3. To find where a key lives: **Walk clockwise along the ring until you encounter the first server node**.
4. **Node Addition/Removal**: When a new server joins, it only takes a fraction of keys from its immediate clockwise neighbor. **Only $K/N$ keys need to move** (where $K$ is total keys, $N$ is server count)!

### Virtual Nodes (VNodes)
To prevent non-uniform distribution (hot spots where one physical server owns a huge slice of the ring), each physical server is assigned **100-256 Virtual Nodes** scattered across the ring. This balances load evenly across hardware.""",
            "key_decisions": ["Configuring the number of virtual nodes per physical host based on memory capacity"],
            "advantages": ["Scales cluster horizontally with minimal data re-sharding", "Gracefully handles node crashes without widespread data loss"],
            "disadvantages": ["Requires maintaining and distributing a routing topology map across clients"],
            "common_mistakes": ["Using simple modulo hashing on distributed caches, leading to 99% cache misses upon adding a server"],
            "practical_examples": ["Discord and AWS DynamoDB using consistent hashing rings to partition real-time websocket connections and partition keys"],
            "related_topics": ["database-partitioning", "caching"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Distributed Transactions & Two-Phase Commit (2PC)

A **Distributed Transaction** is an atomic set of operations that updates data across two or more independent, networked databases.

### The Two-Phase Commit (2PC) Protocol
Coordinates multiple database participants through a central **Coordinator**:

1. **Phase 1: Prepare Phase**
   - Coordinator sends a `PREPARE` request to all participating nodes.
   - Each participant executes the transaction locally up to the commit point, locks the affected rows, writes changes to their local transaction log, and replies `VOTE_COMMIT` or `VOTE_ABORT`.
2. **Phase 2: Commit Phase**
   - If **ALL** participants voted `VOTE_COMMIT`, Coordinator writes commit record to its log and sends `GLOBAL_COMMIT` to all nodes.
   - If **ANY** participant voted `VOTE_ABORT` (or timed out), Coordinator broadcasts `GLOBAL_ROLLBACK`.
   - Participants commit or rollback, release their locks, and acknowledge.

### The Fatal Flaws of 2PC
- **Blocking Protocol**: While waiting for Phase 2, all database rows remain locked. If the Coordinator crashes mid-commit, participants hang indefinitely, holding database locks and freezing system throughput!
- **High Latency**: Requires multiple sequential network round-trips with forced disk syncs.
- *Modern Solution*: Modern microservices avoid 2PC in favor of **Saga Patterns with Compensating Transactions**.""",
            "key_decisions": ["Avoiding distributed 2PC in high-throughput microservices in favor of asynchronous Sagas"],
            "advantages": ["Guarantees strict atomic consistency across multiple distinct storage engines"],
            "disadvantages": ["Severe latency penalties and vulnerability to coordinator failure deadlocks"],
            "common_mistakes": ["Using 2PC across public internet microservices with high network jitter"],
            "practical_examples": ["X/Open XA distributed transactions across an Oracle DB and an IBM MQ queue"],
            "related_topics": ["saga-patterns", "distributed-system-fundamentals"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Idempotency & Deduplication Keys

An operation is **idempotent** if performing it once produces the exact same result as performing it multiple times consecutively:

$$f(f(x)) = f(x)$$

### In HTTP Protocols:
- `GET`, `PUT`, `DELETE` are inherently idempotent by specification.
- `POST` is **NOT idempotent** (calling `POST /orders` 5 times creates 5 separate orders and charges the credit card 5 times!).

### The Idempotency Key Pattern (The Stripe Standard)
1. Client generates a unique cryptographically secure UUID (`Idempotency-Key: idemp_8a3f910b`) before making a payment call.
2. Server receives request, opens a database transaction, and attempts to insert the key into an `idempotency_keys` table with a `UNIQUE` constraint.
3. **If key does not exist**: Execute payment, save the response body in the table, commit, and return `200 OK`.
4. **If key already exists**: Immediately return the previously saved response body without executing the payment again!
5. If client network drops and client retries 3 times, the customer is guaranteed to be billed **exactly once**.""",
            "key_decisions": ["Setting appropriate expiration TTL on idempotency keys (e.g. 24 hours in Redis/SQL)"],
            "advantages": ["Prevents catastrophic double-billing, duplicate order creation, and race-condition data corruption"],
            "disadvantages": ["Requires maintaining a deduplication storage tier"],
            "common_mistakes": ["Using client-provided entity IDs that collision-hash or using timestamps as idempotency keys"],
            "practical_examples": ["Stripe API requiring `Idempotency-Key` headers on all charge and refund endpoints"],
            "related_topics": ["message-queues", "retry-policies", "distributed-transactions"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Retry Policies: Exponential Backoff & Jitter

When a distributed call fails due to a transient issue (brief network timeout, momentary database lock, CPU spike), the client should retry. However, **naive retries can destroy your infrastructure**.

### The Danger: The Retry Storm (Self-Inflicted DDoS)
If a database has a 2-second hiccup and 10,000 clients immediately retry every 500ms, the database is hit with a tsunami of 20,000 requests just as it tries to recover, keeping it down forever!

### 1. Exponential Backoff
Instead of retrying immediately, double the wait duration on each attempt:

$$t_{\\text{wait}} = \\text{base\\_delay} \\times 2^{\\text{attempt}}$$
*(e.g., 100ms, 200ms, 400ms, 800ms, 1600ms, up to a max ceiling).*

### 2. Full Jitter (The AWS Standard)
Even with exponential backoff, all clients that failed at the same moment will retry at the exact same synchronized intervals (creating periodic spikes).
**Jitter** introduces pseudo-random variation to break synchronization:

$$t_{\\text{sleep}} = \\text{random}(0, \\min(\\text{max\\_delay}, \\text{base\\_delay} \\times 2^{\\text{attempt}}))$$

Adding jitter spreads retry traffic into a smooth, manageable background distribution.""",
            "key_decisions": ["Setting maximum retry ceilings (e.g. max 3 retries) before declaring failure to avoid thread exhaustion"],
            "advantages": ["Enables automatic self-healing from transient network blips without human intervention"],
            "disadvantages": ["Retrying non-transient errors (like HTTP 400 Bad Request or 401 Unauthorized) wastes server resources"],
            "common_mistakes": ["Retrying on non-idempotent operations without an idempotency key", "Omitting jitter, causing waves of synchronized retry storms"],
            "practical_examples": ["AWS SDK implementing Full Jitter exponential backoff on all DynamoDB and S3 client requests"],
            "related_topics": ["circuit-breakers", "idempotency", "rate-limiting"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Circuit Breakers (Closed, Open, Half-Open)

In distributed architectures, when a downstream service becomes unresponsive, upstream services calling it will block worker threads waiting for timeouts. Soon, upstream thread pools are depleted, causing a **cascading collapse of the entire microservice ecosystem**.

A **Circuit Breaker** acts like an electrical fuse, monitoring calls and cutting off traffic to a failing service to allow it to recover.

### The 3 Circuit Breaker States
1. **Closed (Normal Operation)**:
   - Requests pass through to the downstream service.
   - The breaker measures success and failure rates.
   - If failure rate exceeds threshold (e.g. 50% errors over 10 seconds), the breaker **TRIPS to OPEN**.
2. **Open (Failing Fast)**:
   - All incoming requests fail immediately **without making network calls**.
   - The caller receives an instant fallback response (cached data or degraded UI).
   - Downstream service gets zero traffic, allowing it to reboot and recover.
   - A sleep timer starts (e.g. 30 seconds).
3. **Half-Open (Testing Recovery)**:
   - After the sleep timer expires, the breaker transitions to Half-Open.
   - It permits a small canary sample of requests through.
   - If the canary requests succeed, the breaker resets to **CLOSED**.
   - If canary requests fail, it immediately trips back to **OPEN** for another sleep cycle.""",
            "key_decisions": ["Defining fallback degraded responses (e.g. return cached profile instead of failing login)", "Setting failure rate thresholds and sliding time windows"],
            "advantages": ["Halts cascading failures across service boundaries", "Provides instantaneous fail-fast response times to end users"],
            "disadvantages": ["Requires monitoring and tuning state thresholds per service"],
            "common_mistakes": ["Setting the failure threshold too sensitive, tripping on brief isolated network blips"],
            "practical_examples": ["Resilience4j in Java wrapping calls from OrderService to PaymentService"],
            "related_topics": ["retry-policies", "fault-tolerance", "observability"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Rate Limiting Algorithms

A **Rate Limiter** controls the rate of traffic sent or received by a network or service, defending APIs against denial-of-service attacks, brute-force bots, and resource exhaustion.

### The 5 Major Algorithms

#### 1. Token Bucket (Most Popular)
- A bucket holds a maximum capacity of $B$ tokens.
- Tokens are added at a constant refill rate $r$ tokens/sec.
- Each request consumes 1 token. If tokens are available, request passes. If bucket is empty, request is rejected (`429 Too Many Requests`).
- *Advantage*: Supports bursts of traffic up to bucket capacity while keeping average rate bounded. Used by AWS and Stripe.

#### 2. Leaky Bucket
- Requests enter a FIFO queue (bucket) of capacity $B$ and leak out (are processed) at a constant, smooth rate.
- If queue is full, new requests overflow and drop.
- *Advantage*: Smooths out traffic into a perfectly steady output rate.

#### 3. Fixed Window Counter
- Divides time into fixed intervals (e.g. 1-minute windows) with a counter.
- *Fatal Flaw*: Boundary burst problem! If limit is 100 req/min, a user can send 100 requests at 00:59 and another 100 requests at 01:00, pushing **200 requests in 2 seconds**!

#### 4. Sliding Window Log
- Stores timestamps of every request in a Redis Sorted Set (`ZSET`).
- When a request arrives, remove all timestamps older than `now - window`.
- Count remaining entries in set.
- *Advantage*: Mathematically exact rate limiting with zero boundary burst flaws.
- *Disadvantage*: High memory consumption storing timestamps for every single request.

#### 5. Sliding Window Counter (Best Hybrid)
- Approximates current window rate using weighted interpolation of previous window counter and current window counter:
  $$\\text{Requests} = \\text{Current Count} + \\text{Previous Count} \\times (1 - \\text{Elapsed Fraction})$$
- *Advantage*: Tiny memory footprint (2 counters) and smooth boundary protection.""",
            "key_decisions": ["Choosing rate limit key granularity: by IP address, by User ID, or by API Key", "Implementing distributed rate limiting via Redis Lua scripts to prevent race conditions"],
            "advantages": ["Prevents resource starvation and abusive scraping", "Enables tiered API monetization (Free vs Pro quotas)"],
            "disadvantages": ["Adds millisecond lookup overhead to every incoming API request"],
            "common_mistakes": ["Using a non-atomic Redis `GET` and `SET` without Lua scripts, leading to race-condition counter bypasses"],
            "practical_examples": ["GitHub API limiting unauthenticated requests to 60/hr and authenticated requests to 5,000/hr using Token Bucket"],
            "related_topics": ["api-gateways", "caching"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Service Discovery & Health Checking

In dynamic cloud and containerized environments (Docker, Kubernetes), microservice instances spin up, crash, autoscale, and change IP addresses constantly. **Service Discovery** is the automated mechanism that allows services to find and communicate with each other without hardcoding IP addresses.

### 1. Client-Side Discovery (e.g. Netflix Eureka)
- Client queries the **Service Registry** directly to get a list of healthy IP addresses for `OrderService`.
- Client runs its own load balancing algorithm (Round Robin) and connects directly to the chosen instance.
- *Advantage*: Direct client-to-service connection without intermediate network proxy hop.
- *Disadvantage*: Every programming language requires its own discovery SDK.

### 2. Server-Side Discovery (e.g. Kubernetes ClusterIP & CoreDNS, AWS ALB)
- Client makes request to a stable DNS name (`http://order-service`).
- Request hits a router/proxy (like Kube-Proxy or an internal Load Balancer).
- The router queries the registry and forwards the request to a healthy backend pod.
- *Advantage*: Client code is completely agnostic of discovery logic; works with standard HTTP.

### Health Checking Probes
- **Liveness Probe**: Is the container process alive? If it fails, restart the container.
- **Readiness Probe**: Is the container warmed up and ready to serve traffic (database connections connected, cache warmed)? If it fails, stop routing traffic to it, but don't restart it!""",
            "key_decisions": ["Deploying Kubernetes native DNS discovery vs dedicated Consul service mesh"],
            "advantages": ["Enables dynamic elasticity: services autoscale from 5 to 500 nodes without manual IP configuration"],
            "disadvantages": ["The Service Registry itself is critical infrastructure that must be run as a resilient quorum cluster"],
            "common_mistakes": ["Using a liveness probe that checks deep database dependencies; if the DB has a brief hiccup, Kubernetes restarts all 50 healthy app pods simultaneously!"],
            "practical_examples": ["Kubernetes CoreDNS resolving `payments.default.svc.cluster.local` to active pod IPs"],
            "related_topics": ["load-balancers", "microservices"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Leader Election & Split-Brain Prevention

Many distributed systems designate a single node as **Leader** to coordinate writes, manage job scheduling, or assign shard ownership. **Leader Election** is the algorithmic process of dynamically picking one node as leader and electing a replacement if the leader dies.

### The Nightmare: Split-Brain Syndrome
If a network partition isolates Node 1 from Nodes 2 and 3:
- Nodes 2 and 3 think Node 1 died and elect Node 2 as new Leader.
- Node 1 still thinks it is the Leader!
- Both Node 1 and Node 2 accept conflicting writes, causing **irreversible data corruption**!

### How to Prevent Split-Brain
1. **Majority Quorum Rule**:
   - A cluster must contain an **odd number of nodes** (3, 5, or 7).
   - A leader can only be elected and can only commit writes if it communicates with a strict majority:
     $$\\text{Quorum} = \\lfloor N / 2 \\rfloor + 1$$
   - In a 3-node cluster, Quorum is $1 + 1 = 2$. If partitioned into [Node 1] and [Nodes 2, 3], only the partition with 2 nodes can operate! The isolated Node 1 abdicates.
2. **Fencing Tokens**:
   - Every time a new leader is elected, it receives a monotonically increasing number (**Fencing Token**, e.g. 34 -> 35).
   - Storage servers reject any write carrying an older fencing token than the highest seen.""",
            "key_decisions": ["Using existing consensus stores (etcd, Zookeeper) rather than attempting to write custom leader election code"],
            "advantages": ["Guarantees deterministic coordination and prevents duplicate master writes"],
            "disadvantages": ["Requires maintaining an odd number of consensus nodes"],
            "common_mistakes": ["Running a 2-node cluster and expecting automatic failover without split-brain (2 nodes have no majority when split!)"],
            "practical_examples": ["Kafka using KRaft / Raft metadata quorum to elect partition leaders"],
            "related_topics": ["consensus-concepts", "fault-tolerance"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Consensus Algorithms: Raft & Paxos

**Distributed Consensus** is the fundamental algorithmic problem of getting multiple autonomous processes to agree on a single data value, transaction log, or state machine command across an unreliable network.

### Paxos vs Raft
- **Paxos (Leslie Lamport)**: The pioneering consensus algorithm. Mathematically elegant, but notoriously difficult to understand and implement correctly in production.
- **Raft (Ongaro & Ousterhout)**: Engineered specifically for **understandability**. Decomposes consensus into 3 independent sub-problems:
  1. **Leader Election**
  2. **Log Replication**
  3. **Safety Invariants**

### Raft in Action:
- Time is divided into **Terms** (arbitrary numbered periods).
- Nodes exist in one of three states: **Follower**, **Candidate**, or **Leader**.
- Followers expect regular heartbeat RPCs from the Leader. If a heartbeat times out, a follower increments its term and transitions to Candidate.
- It votes for itself and broadcasts `RequestVote` RPCs. If it receives votes from a majority of nodes, it becomes Leader.
- Clients send commands only to the Leader. The Leader appends command to its log and sends `AppendEntries` RPCs to followers. Once a majority write to disk, the command is **Committed**.""",
            "key_decisions": ["Deploying etcd (Raft) for Kubernetes cluster state storage"],
            "advantages": ["Guarantees 100% linearizable consistency across hardware crashes as long as a majority survive"],
            "disadvantages": ["Throughput is limited by the speed of the single leader and majority network round-trips"],
            "common_mistakes": ["Attempting to roll your own custom consensus algorithm instead of using vetted implementations (Raft, Paxos)"],
            "practical_examples": ["etcd in Kubernetes, Consul in HashiCorp, CockroachDB ranges using Raft"],
            "related_topics": ["leader-election", "consistency-models"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Event-Driven Architecture & Pub/Sub

In **Event-Driven Architecture (EDA)**, software components communicate by emitting and reacting to **Events**—significant changes in state (e.g. `OrderPlaced`, `UserRegistered`, `PaymentAuthorized`).

### Publish-Subscribe (Pub/Sub) vs Point-to-Point
- **Point-to-Point**: Message goes to exactly one consumer (e.g. Task queue).
- **Pub/Sub**: Publisher broadcasts event to a **Topic**. Multiple independent subscriber services receive their own copy of the event (**Fan-out**).

### Event Styles
1. **Event Notification**: Thin event containing only IDs (`{"event": "ORDER_PLACED", "order_id": 921}`).
   - *Downside*: Consumers must make synchronous HTTP calls back to OrderService to fetch details.
2. **Event-Carried State Transfer**: Rich event containing all necessary domain data (`{"event": "ORDER_PLACED", "order_id": 921, "amount": 99.00, "user_id": 42, "items": [...]}`).
   - *Superpower*: Consumers update their own local read models without ever calling OrderService!""",
            "key_decisions": ["Choosing Event-Carried State Transfer to decouple services vs Event Notification to minimize payload size"],
            "advantages": ["Extreme loose coupling: new microservices can listen to existing events without altering producer code", "High scalability via asynchronous processing"],
            "disadvantages": ["Event ordering and schema evolution across dozens of distributed consumers requires governance (Schema Registry)"],
            "common_mistakes": ["Treating events as remote procedure calls (RPC) with tight expectations of immediate responses"],
            "practical_examples": ["Apache Kafka streaming order events to Inventory, Notification, Analytics, and Billing services simultaneously"],
            "related_topics": ["message-queues", "microservices"],
            "knowledge_check": [{
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
            }]
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
            "content_markdown": """# Observability: Traces, Metrics & Logs

**Observability** is the measure of how well the internal states of a system can be inferred from knowledge of its external outputs (telemetry).

### The Three Pillars of Observability
1. **Metrics (Aggregatable Numbers)**:
   - Counters, Gauges, Histograms (e.g. CPU %, RPS, Error Rate, p99 Latency).
   - High query speed and low storage overhead.
   - *Best for*: Alerting and real-time dashboard visualization (Prometheus, Grafana).
2. **Logs (Timestamped Events)**:
   - Structured JSON records emitted by code detailing events and errors.
   - *Best for*: Root-cause debugging of specific crashes (Elasticsearch, Fluentd, Kibana - ELK, Loki).
3. **Distributed Tracing (Request Journeys)**:
   - Tracks a single user request across 20 different microservices, databases, and message queues.
   - Uses a **Trace ID** and **Span IDs** passed in HTTP headers (`traceparent` header - W3C TraceContext).
   - *Best for*: Pinpointing exact latency bottlenecks in microservice call chains (Jaeger, OpenTelemetry).""",
            "key_decisions": ["Adopting vendor-neutral OpenTelemetry (OTel) instrumentation across all languages", "Implementing trace sampling (e.g. record 5% of traces) to avoid terabytes of tracing telemetry costs"],
            "advantages": ["Reduces Mean Time to Detection (MTTD) and Mean Time to Resolution (MTTR) from hours to minutes"],
            "disadvantages": ["Telemetry generation and transmission consumes CPU, network bandwidth, and storage"],
            "common_mistakes": ["Emitting unstructured plain text logs that cannot be parsed by log search tools", "Logging sensitive PII (passwords, credit card numbers, auth tokens)"],
            "practical_examples": ["Using Jaeger to see that 95% of a 600ms page load was spent waiting on an unindexed PostgreSQL query"],
            "related_topics": ["microservices", "latency-and-throughput"],
            "knowledge_check": [{
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
            }]
        }
    ]

print("Level 3 lessons loaded: 16")
