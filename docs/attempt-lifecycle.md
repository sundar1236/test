# Test Attempt Lifecycle

An attempt moves through strict state transitions to maintain test integrity and score reproducibility:

```text
[ Not Started ]
      │
      ▼
 ( startAttempt )
      │
      ├─► Generates/binds fixed question set
      ├─► Calculates absolute endTime = startTime + duration
      ├─► Initializes answersMap with 'not_visited'
      ▼
 [ IN_PROGRESS ]
      │
      ├─► Option selection -> updateAnswer (local cache + DB upsert)
      ├─► Browser reload -> restores in_progress attempt from local/DB
      │
      ▼
 ( submitAttempt / Timer Timeout )
      │
      ├─► Double-submit guard check
      ├─► Calculates rawScore, negative marking (-0.25), and accuracy
      ├─► Locks attempt state to 'completed'
      ▼
  [ COMPLETED ] -> Opens Scorecard & Unlocks Solution Key
```
