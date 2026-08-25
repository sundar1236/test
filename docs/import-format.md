# Bulk Import Specifications & Schemas

## 1. CSV Format Specification

### Header Columns Required
CSV files must include a header row containing the following exact column names (case-insensitive):

```text
Question Text,Option A,Option B,Option C,Option D,Option E,Correct Answer,Explanation,Exam,Phase,Section,Topic,Difficulty,Source,Year
```

### Sample CSV Template Data
```csv
Question Text,Option A,Option B,Option C,Option D,Option E,Correct Answer,Explanation,Exam,Phase,Section,Topic,Difficulty,Source,Year
"What is 20% of 450?","80","90","100","110","120","B","20% of 450 = 0.20 * 450 = 90.","sbi-clerk","prelims","Quantitative Aptitude","Percentage","easy","SBI Clerk 2023",2023
"Which letter replaces the question mark in series A, C, F, J, O, ?","T","U","V","W","X","U","The position gaps increase by +2, +3, +4, +5, +6. O + 6 = U.","ibps-clerk","prelims","Reasoning Ability","Letter Series","moderate","IBPS Clerk 2023",2023
"Find the grammatically correct sentence.","He don't know the answer","He doesn't knows the answer","He doesn't know the answer","He not know the answer","He isn't knowing","C","Subject 'He' requires third-person singular auxiliary 'doesn't' followed by base verb 'know'.","rbi-assistant","prelims","English Language","Grammar","easy","RBI Asst 2022",2022
```

---

## 2. Official JSON Import Schema

Import packages must conform to the following JSON structure:

```json
{
  "exam": "sbi-clerk",
  "phase": "prelims",
  "section": "Quantitative Aptitude",
  "questions": [
    {
      "questionText": "If 15 men can complete a project in 20 days, how many days will 25 men take to complete the same work?",
      "optionA": "10 days",
      "optionB": "12 days",
      "optionC": "14 days",
      "optionD": "16 days",
      "optionE": "18 days",
      "correctAnswer": "B",
      "explanation": "M1 * D1 = M2 * D2. 15 * 20 = 25 * D2 => 300 = 25 * D2 => D2 = 12 days.",
      "topicTitle": "Time & Work",
      "difficulty": "easy",
      "source": "SBI Clerk Prelims 2023",
      "year": 2023
    }
  ]
}
```

---

## 3. Validation & Quality Rules

* **Question Text**: Must be at least 10 characters long.
* **Options**: Minimum 4 distinct non-empty options required (A, B, C, D).
* **Correct Answer**: Must be 'A', 'B', 'C', 'D', or 'E'.
* **Explanation**: Must be at least 15 characters long.
* **Difficulty**: Must be `easy`, `moderate`, or `hard`. Defaults to `moderate`.
