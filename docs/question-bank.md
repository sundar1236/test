# Question Bank Repository & Scalability Guide

## Repository Scope
The Question Bank supports 10,000+ questions across banking exams:
* **SBI Clerk** (Prelims & Mains)
* **IBPS Clerk** (Prelims & Mains)
* **RBI Assistant** (Prelims & Mains)
* **RRB Clerk / Office Assistant** (Prelims & Mains)

---

## High-Performance Database Indexing

The PostgreSQL database includes optimized composite indexes:

```sql
-- Fast filter by Exam, Phase & Section
CREATE INDEX idx_questions_exam_phase_section ON questions(exam_id, phase, section_id);

-- Topic & Difficulty Drilldown
CREATE INDEX idx_questions_topic_difficulty ON questions(topic_id, difficulty);

-- Status & Creation Timestamp for Admin Pagination
CREATE INDEX idx_questions_status_created ON questions(status, created_at DESC);

-- Fast Duplicate Lookup via SHA-256 Text Hash
CREATE INDEX idx_questions_hash ON questions(question_hash);
```

---

## Bulk Actions System

Admins and Reviewers can select single or multiple questions in the repository table to trigger bulk operations:

| Action | Target Lifecycle Status | Audit Log Event |
| :--- | :--- | :--- |
| **Bulk Publish** | `published` | `BULK_STATUS_PUBLISHED` |
| **Bulk Archive** | `archived` | `BULK_STATUS_ARCHIVED` |
| **Bulk Difficulty Assign** | Updates `difficulty` | `BULK_DIFFICULTY_ASSIGN` |
| **Bulk Topic Assign** | Updates `topic_id` | `BULK_TOPIC_ASSIGN` |

---

## Pagination & Search Controls

* **Server/Service Pagination**: Default page size of 10 or 25 records.
* **Instant Sub-string Search**: Matches question formulation statements and topic titles.
* **Multi-Faceted Filters**: Combines Exam, Section, Topic, Difficulty, and Lifecycle Status simultaneously.
