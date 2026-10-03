# Backup, Disaster Recovery & High-Availability Architecture

This document defines the operational recovery guidelines for the **B.Tech Student AI Learning Platform**.

---

## 1. High-Availability & Disaster Recovery Objectives

- **Recovery Point Objective (RPO):** Maximum 1 hour data delta for transactional databases; 24 hours for aggregated metrics.
- **Recovery Time Objective (RTO):** Full system availability restored within 30 minutes of disaster declaration.

---

## 2. Component Backup Strategies

### 2.1 PostgreSQL Database
- **Frequency:** Automated daily snapshots at 02:00 UTC + Write-Ahead Logging (WAL) archiving every 15 minutes.
- **Tools:** `pg_dump` with custom compressed archive format (`-Fc`).
- **Command:**
  ```bash
  pg_dump -h localhost -U btech_user -d btech_db -Fc -f "/backups/postgres/btech_db_$(date +%Y%m%d_%H%M%S).dump"
  ```
- **Retention Schedule:**
  - Hourly WAL archives: 7 days
  - Daily dumps: 30 days
  - Weekly snapshots: 12 weeks
  - Monthly archives: 12 months

### 2.2 Object Storage & Document Vault
- **Directory:** `/app/data/vault` (or S3/GCS bucket).
- **Mechanism:** Asynchronous cross-region replication or encrypted rsync to offsite cold storage.
- **Command:**
  ```bash
  aws s3 sync /app/data/vault s3://btech-platform-cold-vault/vault/ --sse AES256 --delete
  ```

### 2.3 Vector Database & Embeddings
- Vector representations are deterministically rebuildable from source documents, research papers, and code snippets stored in PostgreSQL and the document vault.
- Incremental snapshot of HNSW vector index saved daily.

### 2.4 Redis Cache & Queues
- **Persistence:** RDB snapshots enabled every 900 seconds.
- **Rebuildability:** Redis state is strictly ephemeral and self-healing. System functions gracefully on cache cold boot.

---

## 3. Disaster Recovery Sequence

In the event of complete infrastructure loss, execute restoration in the exact strict order below:

```
[1. PostgreSQL DB]
        ↓ (Restore schema, users, audit logs, learning progress)
[2. Object Storage]
        ↓ (Restore PDF files, raw code, generated certificates)
[3. Vector DB]
        ↓ (Verify embeddings or execute background re-indexing job)
[4. Redis Cache]
        ↓ (Initialize clean cache & job queue)
[5. Platform API & Workers]
        ↓ (Start Express/FastAPI app, verify /health/ready probe)
[6. Validation & Healthchecks]
```

### Detailed Restore Procedure

#### Step 1: Database Restoration
```bash
# 1. Terminate active database connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'btech_db';"

# 2. Re-create empty target database
dropdb -U postgres btech_db
createdb -U postgres -O btech_user btech_db

# 3. Restore from verified dump
pg_restore -h localhost -U btech_user -d btech_db -v "/backups/postgres/btech_db_latest.dump"
```

#### Step 2: Storage Vault Restoration
```bash
# Restore files with proper node ownership
mkdir -p /app/data/vault
tar -xzvf /backups/vault/vault_latest.tar.gz -C /app/data/vault
chown -R node:node /app/data/vault
```

#### Step 3: Application Health Verification
```bash
# Verify process liveness
curl -i http://localhost:3000/health/live

# Verify database dependency readiness
curl -i http://localhost:3000/health/ready
```

---

## 4. Periodic Backup Verification & Drills
- Restore drill performed on staging on the 1st of every calendar month.
- Automatic checksum verification on all generated backup archives (`sha256sum`).
