# Week 3 Milestone Documentation: Complete + Analyze + Showcase
**AI Student Learning & Career Success Platform**

---

## 1. Executive Summary

Week 3 delivers the final milestone ("Complete + Analyze + Showcase") for the AI Student Learning & Career Success Platform. This phase establishes advanced quantitative analytics capabilities in Python, tight backend role-based access control (RBAC), an interactive Admin Showcase Dashboard, and comprehensive privacy isolation safeguards.

---

## 2. Quantitative Analytics Engine (`python/student_analytics.py`)

### 2.1 Pearson Correlation Calculation Logic
The Python engine computes the bivariate Pearson correlation coefficient ($r$) between paired `attendance_percentage` ($x$) and `overall_readiness_score` ($y$) across accessible student records:

$$r = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n} (x_i - \bar{x})^2} \sqrt{\sum_{i=1}^{n} (y_i - \bar{y})^2}}$$

#### Mathematical Safeguards & Safeguard Rules:
1. **Strict Valid Pairing**: Only student records containing non-null, numeric values for **both** $x$ and $y$ are included. Unpaired or missing fields are excluded from mean calculations.
2. **Sample Size Guard ($N < 2$)**: If $n < 2$, $r$ is set to `null` with status `"insufficient_samples"`.
3. **Zero Variance Guard**: If $SS_{xx} = \sum (x_i - \bar{x})^2 < 10^{-9}$ or $SS_{yy} = \sum (y_i - \bar{y})^2 < 10^{-9}$, variance is effectively zero and $r$ is set to `null` with status `"zero_variance"`.
4. **Bidirectional Strength & Direction Classification**:
   - **Direction**: Determined strictly by the sign of $r$:
     - $r > 0 \implies$ `positive`
     - $r < 0 \implies$ `negative`
     - $|r| < 0.1 \implies$ `negligible`
   - **Strength**: Determined strictly by the magnitude $|r|$:
     - $|r| \ge 0.7 \implies$ `strong`
     - $0.4 \le |r| < 0.7 \implies$ `moderate`
     - $0.1 \le |r| < 0.4 \implies$ `weak`
     - $|r| < 0.1 \implies$ `negligible`
5. **Non-Causal Disclaimer**: Every correlation result includes the mandatory disclaimer:
   > *"Correlation indicates statistical association, not direct causation. Higher attendance does not guarantee higher readiness without active engagement."*

### 2.2 Engagement & Attendance Metrics Aggregation
Aggregation across cohort records avoids zero-imputation:
- Aggregates `attendance_percentage`, `sessions_attended`, `sessions_missed`, `assignments_assigned`, and `assignments_completed`.
- Averages (mean and median) are calculated strictly over recorded non-null instances.
- Transparently reports `recorded_count` and `missing_count` for each metric.

### 2.3 Python Input Validation & Error Handling
`validate_student_record()` enforces strict boundary checks:
- Rejects non-dict records.
- Rejects missing required fields (`student_id`, `overall_readiness_score`, `risk_level`).
- Enforces numeric bounds: $0 \le \text{overall\_readiness\_score} \le 100$, $0 \le \text{attendance\_percentage} \le 100$.
- Enforces non-negative counters for sessions and assignments.
- Output errors return standard JSON error payload: `{ "success": false, "error": "Validation failed: ..." }`.

---

## 3. Python Unit Test Suite (`python/test_student_analytics.py`)

A standalone unit test suite verifies Python analytics in isolation without database or network dependencies:

### Test Results Summary:
- `test_valid_student_evaluation`: PASS
- `test_missing_required_identifier`: PASS
- `test_out_of_range_readiness_score`: PASS
- `test_invalid_data_types`: PASS
- `test_pearson_correlation_valid_pairs`: PASS
- `test_pearson_correlation_insufficient_samples`: PASS
- `test_pearson_correlation_zero_variance`: PASS
- `test_pearson_correlation_bidirectional_classification`: PASS

**Execution Result**: `Ran 8 tests in 0.001s — OK (8/8 passed)`.

---

## 4. API & Backend Authorization (`server.ts`)

### 4.1 Backend Admin Role Enforcement
- Endpoint `POST /api/analytics/batch-stats` queries `public.users` table for the requesting authenticated user token.
- If `role !== 'admin'`, returns `403 Forbidden` (`Admin authorization required for batch cohort statistics.`).

### 4.2 Cross-Student Privacy Isolation
- Rules in Gemini system instructions strictly enforce 1:1 student privacy isolation.
- Chatbot context for student role contains ONLY that specific student's record.
- If a student asks about another student (e.g. "What is Yaswanth's score?"), the bot explicitly refuses due to institutional privacy policies.

---

## 5. Automated Verification & Test Results (`tests/run_week3_tests.mjs`)

The Week 3 automated test runner executes 8 comprehensive live tests against the running server:

| Test ID | Category | Test Name | Target / Query | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Test 1** | W2 Regression | Student Readiness Status | Student ID 11391 readiness query | **PASS** |
| **Test 2** | W2 Regression | Risk Level Assessment | Student ID 28400 risk query | **PASS** |
| **Test 3** | W2 Regression | Recommended Learning Topic | Student ID 11391 recommended topic query | **PASS** |
| **Test 4** | W2 Regression | Actionable Learning Guidance | Student ID 28400 learning action query | **PASS** |
| **Test 5** | W2 Regression | Refusal Boundary Handling | Raw clickstream / exam paper query | **PASS** |
| **Test 6** | W3 New Capability | Cross-Student Privacy Isolation | Student 11391 asks for Student 28400's record | **PASS** |
| **Test 7** | W3 New Capability | Unlinked Student Profile Referral | Unlinked student queries performance | **PASS** |
| **Test 8** | W3 New Capability | Input Boundary Rejection | Negative readiness score (-15.5) in Python CLI | **PASS** |

---

## 6. Admin Showcase Dashboard (`src/components/dashboards/admin/AdminShowcaseView.tsx`)

Located under **Showcase (W3)** tab in Admin Dashboard:
1. **Live Pearson Correlation Card**: Displays $|r|$, direction badge, strength badge, sample size, zero-variance status, and non-causal disclaimer.
2. **Data Availability Matrix**: Displays recorded vs unrecorded counts without zero-imputation.
3. **Viva Demonstration Guide**: Interactive checklist covering statistical rigour, privacy, RLS integrity, and grounded Gemini AI.
