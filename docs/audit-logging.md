# Audit Logging Specification

---

## Overview

The platform logs every critical administrative operation to `admin_audit_logs` in PostgreSQL for compliance, accountability, and operational tracking.

---

## Logged Events

* `QUESTION_CREATED`: New question added in Draft / Pending status.
* `QUESTION_UPDATED`: Modifications made to question text, options, or explanation.
* `QUESTION_REVIEWED`: Reviewer audit notes and change requests.
* `QUESTION_PUBLISHED`: Question approved and released to live mock tests.
* `QUESTION_ARCHIVED`: Question rejected or deprecated.
* `EXAM_CREATED`: New banking exam series added.
* `TOPIC_CREATED`: New subject topic or sub-topic created.

---

## Audit Record Schema

```json
{
  "id": "log-uuid",
  "admin_id": "profile-uuid",
  "action": "QUESTION_PUBLISHED",
  "target_entity": "questions",
  "target_id": "question-uuid",
  "details": {
    "exam": "SBI Clerk",
    "topic": "Profit & Loss",
    "status": "published"
  },
  "created_at": "2024-05-18T10:00:00Z"
}
```
