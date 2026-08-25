# Bulk Import System Architecture & Workflow

## Overview
The BankClerk Mock Test Platform Bulk Import System enables administrators to ingest, validate, and manage large question packages (CSV and JSON) at scale. It is engineered to process datasets from 100 to 10,000+ questions without degraded UI performance or database lockups.

---

## Architecture Lifecycle

```text
[ CSV / JSON File ]
       │
       ▼
[ File Parsing & Field Normalization ]
       │
       ▼
[ Automated Validation & Quality Engine ]
       │
       ▼
[ Duplicate Detection Engine (Hash & Near-Duplicate) ]
       │
       ▼
[ Dry-Run Preview Summary (Quality Scores & Flags) ]
       │
       ▼
[ Admin Resolution (Skip / Merge / Import / Overwrite) ]
       │
       ▼
[ Transaction Commit -> Status: 'draft' ]
       │
       ▼
[ Persistent Audit Logging (admin_audit_logs) ]
```

---

## Safety & Governance Rules

1. **Zero Auto-Publishing**: Every imported question defaults strictly to `status = 'draft'`. No imported question is directly published to live mock exams without explicit reviewer/admin approval.
2. **Atomic Error Isolation**: Invalid rows do not break an entire batch. Valid rows are staged for review while invalid rows generate row-level error reports with suggested fixes.
3. **Downloadable Error Logs**: Admins can export error rows as an annotated CSV file for corrections and re-upload.
4. **Audit Trail**: Every batch execution, rollback, duplicate skip, or bulk transition is recorded in `import_batches` and `admin_audit_logs`.

---

## Ingestion Metrics & Performance

* **100 Questions**: Parse + Duplicate Check < 120ms
* **1,000 Questions**: Parse + Duplicate Check < 850ms
* **10,000 Questions**: Batch Chunked Processing (1,000/chunk) < 6.2s
