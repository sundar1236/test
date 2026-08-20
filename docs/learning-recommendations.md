# Learning Recommendation Engine

Recommendations are generated deterministically based on user performance rules:

1. **Weak Topic Recommendation:** Triggered when topic accuracy is $< 60\%$ with sample size $\ge 5$.
2. **Low Accuracy Section Drill:** Triggered when a section accuracy is $< 65\%$.
3. **Incorrect Question Reattempt:** Triggered when unattempted incorrect questions exist in attempt history.
