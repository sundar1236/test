# Performance Calculation Rules

Rules and mathematical formulas governing performance analytics and weak area identification.

## Rules & Thresholds

```ts
PERFORMANCE_THRESHOLDS = {
  WEAK_ACCURACY: 50.0,             // Accuracy < 50% = 'Weak'
  NEEDS_IMPROVEMENT_ACCURACY: 70.0,// 50% <= Accuracy < 70% = 'Needs Improvement'
  GOOD_ACCURACY: 85.0,              // 70% <= Accuracy < 85% = 'Good', >= 85% = 'High'
  MIN_QUESTIONS_THRESHOLD: 3,       // Minimum 3 questions attempted in topic before labeling weak
};
```

## Formulas
- **Accuracy (%):** `(Total Correct / Total Attempted) * 100`
- **Net Score:** `(Correct * 1.0) - (Incorrect * 0.25)`
- **Percentile Estimate:** `Math.min(99.9, 85 + (Net Score / Max Score) * 14)`
