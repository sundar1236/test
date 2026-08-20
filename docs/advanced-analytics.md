# Advanced Analytics Engine Architecture

The Advanced Analytics Engine (`src/services/analyticsEngine.ts`) transforms historical test attempt records into deterministic, explainable performance metrics.

## Key Calculation Formulas

1. **Section Accuracy (%):**
   $$\text{Accuracy} = \left(\frac{\text{Correct Answers}}{\text{Attempted Questions}}\right) \times 100$$

2. **Negative Marking Score Calculation:**
   $$\text{Score} = (\text{Correct Answers} \times 1.0) - (\text{Incorrect Answers} \times 0.25)$$

3. **Weighted Recent Topic Accuracy:**
   Weighted across the last 3 test occurrences for a given topic:
   $$\text{Recent Accuracy} = \frac{\sum_{i=1}^{N \le 3} \text{Accuracy}_i}{N}$$

4. **Time Management Pacing:**
   $$\text{Avg Solving Time} = \frac{\text{Total Time Spent (seconds)}}{\text{Attempted Questions}}$$
