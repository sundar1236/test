# Test Generation Architecture

The test generation engine is responsible for assembling balanced, published question sets according to exam specifications.

## Selection Algorithm
1. **Pre-assigned Questions:** Checks `mock_test_questions` mapping table for curated questions.
2. **Distribution Specification:** If no mapping exists, queries published questions by section and topic constraints:
   - SBI/IBPS Clerk Prelims: Quantitative Aptitude (35 Qs), Reasoning Ability (35 Qs), English Language (30 Qs).
   - RRB Clerk Prelims: Quantitative Aptitude (40 Qs), Reasoning Ability (40 Qs).
3. **Filter Guarantee:** `questions.status = 'published'` filter is applied at the database query level.
4. **Security Stripping:** Transforms `Question` models into `SecureExamQuestion` models, omitting `is_correct`, `correctOptionId`, and `explanation`.
