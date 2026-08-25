# Duplicate Detection Engine

## Overview
The Duplicate Detection Engine prevents redundant question entries during bulk ingestion. It utilizes a two-tier algorithm combining exact text hashing with near-duplicate word overlap analysis.

---

## Detection Algorithm Stages

```text
Incoming Question Text
        │
        ▼
[ 1. Normalization ] -> Lowercase, strip HTML tags, remove special punctuation, collapse whitespace.
        │
        ▼
[ 2. Hash Calculation ] -> Generate text hash (`h_{hash}_{length}`).
        │
        ▼
[ 3. Exact Hash Lookup ] -> Check against existing `question_hash` column. (100% Match)
        │
        ▼ (If no exact hash match)
[ 4. Jaccard Word Similarity ] -> Compute token overlap ratio.
        ├── Score >= 92%  -> "Near Duplicate"
        ├── Score 85-91% -> "Potential Duplicate"
        └── Score < 85%  -> "Unique Question"
```

---

## Resolution Strategies

When duplicates are detected during dry-run inspection or in the Duplicate Review Queue, administrators can choose from 4 resolution strategies:

1. **Skip (Default)**: Do not import the incoming question. Maintain repository clean.
2. **Merge**: Preserve the existing question formulation but append new metadata (e.g. adding exam source tag or year).
3. **Import Anyway**: Ingest the question as a separate record (useful when similar statements test different option choices).
4. **Replace Existing**: Overwrite the existing question with the new formulation and updated options.
