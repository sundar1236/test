# Admin Dashboard Documentation

**Platform:** Bank Clerk Mock Test Platform
**Target Roles:** Admin, Super Admin, Question Reviewer

---

## Overview

The Operational Admin Dashboard provides full visibility into the Bank Clerk Mock Test Platform's content pipeline without unnecessary noise.

---

## Features & Modules

### 1. Question Bank Operational Breakdown
Real-time metrics tracking the question lifecycle:
* **Total Bank Records**: Count of all questions across all exam series.
* **Drafts**: Questions currently being created or edited.
* **Under Review**: Questions submitted for content audit and AI verification.
* **Validated**: Questions passed by reviewers, waiting for final publish release.
* **Published**: Active live questions available in student mock test series.
* **Archived**: Deprecated or rejected question formulations.

### 2. Operational Modules
* **Question Bank Management (`/admin/questions`)**: Search, multi-filter (Exam, Section, Topic, Difficulty, Status), paginated table view, edit forms, and bulk CSV import simulation.
* **Review & AI Validation Queue (`/admin/validation`)**: Side-by-side answer comparison between source text and AI suggestions with confidence scores and reviewer comment notes.
* **Exam, Section & Topic Metadata (`/admin/categories`)**: Manage target exam codes (`SBI_CLERK`, `IBPS_CLERK`, `RBI_ASSIST`, `RRB_CLERK`), subject sections (`QUANT`, `REASONING`, `ENGLISH`, `GA`), and hierarchical parent-child topics.
* **System Operations Log (`/admin/analytics`)**: Searchable audit trails recording administrative operations, question approvals, and metadata updates.
