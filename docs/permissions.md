# Permissions & Role-Based Access Control (RBAC) Specification

---

## Role Hierarchy

1. **`guest`**: Unauthenticated public visitor. Access restricted to Landing Page and Design System Docs.
2. **`student`**: Registered candidate. Access to Student Dashboard, Question Bank, Topic Tests, Mock Test Simulator, Performance Analytics, Bookmarks, and Profile.
3. **`question_reviewer`**: Content auditor. Access to Review Queue, Validation Queue, and Draft/Review Question auditing.
4. **`admin`**: Content administrator. Full access to Question Bank Management, Publishing Queue, Exam & Topic Metadata, and Audit Logs.
5. **`super_admin`**: System administrator. Unrestricted system access and role management.

---

## Access Matrix

| Feature / Route | Guest | Student | Reviewer | Admin / Super Admin |
| :--- | :--- | :--- | :--- | :--- |
| Public Landing (`/`) | Allowed | Allowed | Allowed | Allowed |
| Exam Simulator (`/mock-test/:id`) | Redirect | Allowed | Allowed | Allowed |
| Student Performance (`/performance`) | Blocked | Allowed | Allowed | Allowed |
| Admin Dashboard (`/admin/dashboard`) | Blocked | Blocked | Allowed | Allowed |
| Question Management (`/admin/questions`) | Blocked | Blocked | Audit Drafts | Full Access |
| Validation Queue (`/admin/validation`) | Blocked | Blocked | Review & Comment | Approve & Publish |
| Metadata Config (`/admin/categories`) | Blocked | Blocked | View | Manage Exams/Topics |
| Audit Logs (`/admin/analytics`) | Blocked | Blocked | Blocked | Search & View |
