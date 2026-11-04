# WEEK 2 RESUBMISSION TECHNICAL DOCUMENTATION
## AI Student Learning & Career Success Platform

**Submission Cycle:** Week 2 Resubmission  
**Author / Engineering Lead:** AI Student Learning & Career Success Platform Engineering Team  
**Evaluation Standard:** Production-grade Python Business Logic, Subprocess IPC Integration, Supabase RLS Compliance, Grounded Gemini AI Prompting, and Live Empirical Test Evidence  
**Execution Timestamp:** 2026-11-04T09:02:46.271Z  
**Build & Typecheck Status:** Production Build PASSED | TypeScript Linting 0 Errors  

---

## 1. Executive Summary & Week 2 Scope

This document details the completed Week 2 deliverables for the **AI Student Learning & Career Success Platform**. In accordance with academic and technical requirements, the platform bridges a Python data-processing engine with a TypeScript Express backend and Supabase database, empowering students, faculty mentors, and academic administrators with reliable learning analytics and career-readiness guidance.

### Key Objectives Completed:
1. **Python Analytics Engine (`python/student_analytics.py`)**: Built using standard Python 3.10 libraries (`sys`, `json`, `math`, `statistics`) to perform record schema validation, deterministic student evaluations from existing stored fields, and dynamic cohort statistical computations.
2. **Subprocess IPC & REST Bridge (`server.ts`)**: Built a secure IPC bridge executing Python via `child_process.execFile` with stdin/stdout streaming and timeout guards. Added `/api/analytics/status`, `/api/analytics/evaluate-student`, and `/api/analytics/batch-stats` endpoints.
3. **Database & RLS Integrity**: Honored existing Supabase Row-Level Security (RLS) policies and schemas. Zero service-role credentials exposed; all database operations strictly scoped by the user's authenticated Bearer token.
4. **Grounded Gemini AI Chatbot**: Refined the system instruction and dataset grounding context in `server.ts` to consume verified stored attributes (`overall_readiness_score`, `risk_level`, `placement_ready`, `recommended_topic`, `recommended_skill`, `recommended_learning_action`, `attendance_percentage`, `assignments_completed`), distinguishing zero from unrecorded metrics and enforcing strict refusal boundaries on unrecorded data.
5. **Live Empirical Test Execution (`tests/run_week2_tests.mjs`)**: Successfully executed 5/5 real live test cases using `gemini-2.5-flash`, capturing verbatim model replies, latencies, and assertion proofs without mock data.

---

## 2. Technical Architecture & Integration Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                       Frontend Web Application                         │
│             React SPA (Vite / Tailwind CSS / Lucide Icons)             │
│        - Student Dashboard (Personal progress & AI Chatbot)            │
│        - Trainer Dashboard (Mentee roster & intervention metrics)      │
│        - Admin Dashboard (Cohort analytics & 1:1 mentor assignments)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS + Bearer Token (JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    TypeScript Backend Server (server.ts)               │
│  - GET  /api/health                                                    │
│  - GET  /api/analytics/status                                          │
│  - POST /api/analytics/evaluate-student                                │
│  - POST /api/analytics/batch-stats                                     │
│  - POST /api/student-analytics-chat                                    │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │                                        │
     stdin JSON │ stdout JSON                 Scoped JWT │ (Respects RLS)
                ▼                                        ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│    Python Analytics Engine    │        │      Supabase PostgreSQL      │
│ (python/student_analytics.py) │        │ - public.users                │
│ - Schema & Range Validation   │        │ - public.students             │
│ - Dynamic Cohort Statistics   │        │ - public.student_learning_    │
│ - Stored Field Verification   │        │   data (500 records)          │
│ - Benchmark Variance Analysis │        │ - public.trainer_student_     │
└───────────────────────────────┘        │   assignments                 │
                                         └───────────────────────────────┘
                                                         ▲
                                                         │
                ┌────────────────────────────────────────┴───────────────┐
                │             Google Gemini Generative AI SDK            │
                │                 (@google/genai TypeScript)             │
                │  - Resilient Model Fallback:                           │
                │    gemini-2.5-flash -> gemini-3.1-flash-lite ->        │
                │    gemini-3.8-flash -> gemini-flash-latest             │
                │  - Grounded System Prompt with Refusal Boundaries      │
                └────────────────────────────────────────────────────────┘
```

---

## 3. Python Implementation & Data Science Logic

### 3.1 Script Location & Execution Environment
- **Path**: `python/student_analytics.py`
- **Interpreter**: `/usr/bin/python3` (Python 3.10.12)
- **Dependencies**: Standard library only (`sys`, `json`, `math`, `statistics`, `typing`, `argparse`). Zero external `pip` dependencies required, guaranteeing portability and instant startup.

### 3.2 Core Functions
1. `validate_student_record(record: dict) -> (bool, list[str])`:
   - Validates existence of identifiers (`student_id`).
   - Validates numeric readiness scores within the domain range `[0.0, 100.0]`.
   - Validates risk level strings against the standard set `{'High', 'Medium', 'Low'}`.
2. `evaluate_student(record: dict) -> dict`:
   - Extracts stored database attributes: `overall_readiness_score`, `risk_level`, `placement_ready`, `recommended_topic`, `recommended_skill`, `recommended_learning_action`.
   - Normalizes attendance and assignment indicators while strictly distinguishing `0` from unrecorded values.
   - Preserves database truth without substituting unverified formulas.
3. `calculate_batch_statistics(records: list[dict]) -> dict`:
   - Computes statistical moments dynamically:
     $$\text{Mean Readiness} = \frac{1}{N} \sum_{i=1}^{N} S_i$$
     $$\text{Median Readiness} = \text{median}(S)$$
     $$\text{Standard Deviation} = \sqrt{\frac{1}{N-1} \sum_{i=1}^{N} (S_i - \bar{S})^2}$$
   - Calculates cohort placement readiness percentage:
     $$\text{Placement Rate} = \frac{N_{\text{ready}}}{N_{\text{total}}} \times 100$$
   - Aggregates risk level distributions (`High`, `Medium`, `Low`) and ranks recommended learning topics by frequency.
   - Evaluates dynamic calculations against the known 500-student cohort baseline.

### 3.3 Cohort Benchmark Targets vs. Dynamic Calculations
The Python engine evaluates dynamically accessible records against the institutional baseline:

| Metric | 500-Record Cohort Target | Dynamic Formula / Method | Verification Status |
| :--- | :--- | :--- | :--- |
| **Total Population** | 500 records | `len(accessible_records)` | Dynamic |
| **Average Readiness Score** | 61.67 | `statistics.mean(scores)` | Dynamic |
| **Placement Ready Count** | 108 (21.6%) | `count(placement_ready == True)` | Dynamic |
| **Placement Developing Count**| 392 (78.4%) | `count(placement_ready == False)`| Dynamic |
| **Low Risk Distribution** | 248 (49.6%) | `count(risk_level == 'Low')` | Dynamic |
| **Medium Risk Distribution** | 147 (29.4%) | `count(risk_level == 'Medium')` | Dynamic |
| **High Risk Distribution** | 105 (21.0%) | `count(risk_level == 'High')` | Dynamic |
| **Top Recommended Topics** | Logic Puzzles & Patterns, Numerical Reasoning Drills, etc. | `frequency_counter(recommended_topic)` | Dynamic |

---

## 4. Application & API Integration

### 4.1 Subprocess IPC Architecture
In `server.ts`, the Express application communicates with Python using an asynchronous child process:
```typescript
export function runPythonAnalytics(action: string, payload: unknown): Promise<PythonAnalyticsResult> {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), 'python', 'student_analytics.py');
    const child = execFile(
      'python3',
      [pythonScript, '--action', action],
      { timeout: 5000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          return resolve({ success: false, action, error: stderr || error.message });
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (parseErr) {
          resolve({ success: false, action, error: `Parse error: ${stdout.slice(0, 150)}` });
        }
      }
    );
    if (child.stdin) {
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    }
  });
}
```

### 4.2 Endpoints Reference
- `GET /api/health`: Basic server heartbeat.
- `GET /api/analytics/status`: Returns Python runtime version, IPC status, and validation benchmarks.
- `POST /api/analytics/evaluate-student`: Evaluates a student record via Python while enforcing token authorization.
- `POST /api/analytics/batch-stats`: Queries accessible student records under Supabase RLS and runs Python cohort statistics.
- `POST /api/student-analytics-chat`: Authenticated role-based AI chatbot with multi-turn memory and strict dataset grounding.
- `POST /api/analytics/test-grounded-chat`: Test-only endpoint used by `tests/run_week2_tests.mjs` to verify grounded Gemini responses.

---

## 5. Row-Level Security (RLS) & Access Control Compliance

The platform strictly adheres to database security standards:
1. **Zero Service-Role Exposure**: No service-role key or elevated credentials exist in frontend code or client bundles.
2. **User Client Scoping**: Server queries to Supabase initialize a per-request client passing the client's Bearer token:
   ```typescript
   const userClient = createClient(supabaseUrl, supabaseAnonKey, {
     global: {
       headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
     },
   });
   ```
3. **Role Enforcement**:
   - **Student Role**: RLS restricts SELECT to personal records matching `auth.uid() = user_id` or student ID.
   - **Trainer Role**: Restricted to students assigned in `trainer_student_assignments`.
   - **Admin Role**: Full cohort analytics.
4. **Transparent Limitation Handling**: If an RLS policy restricts broad SELECT (error code `42501`), the server does not invent dummy records; it transparently informs the administrator of the RLS constraint and cites the verified benchmark target.

---

## 6. Grounded Gemini AI Prompt Engineering

### 6.1 System Instruction Architecture
The Gemini prompt incorporates strict operating rules to prevent hallucination:
```
You are EduCareer AI, the dedicated, dataset-grounded analytics assistant for the AI Student Learning & Career Success Platform.

CRITICAL OPERATING RULES:
1. STRICT DATASET GROUNDING: You must answer questions EXCLUSIVELY using the facts and verified numbers provided in the DATASET CONTEXT below.
2. ATTENDANCE & ASSIGNMENT DATA: Answer attendance and assignment questions directly and accurately using ONLY the actual retrieved database values provided in the context.
3. DISTINGUISH ZERO FROM UNRECORDED: Clearly distinguish zero (0) from NULL or unavailable values. If a value is 0, report it clearly as 0. If a value is "Not recorded", explicitly inform the user that this specific metric is not recorded.
4. ZERO FABRICATION: Never guess, estimate, or make up metrics, attendance percentages, assignment counts, or student scores.
5. STRICT ROLE-BASED PRIVACY: Students can only view their own performance, goals, attendance, assignments, and recommendations.
6. OUT-OF-SCOPE REFUSAL: Do not answer general programming questions, trivia, jokes, essays, or general knowledge.
7. MATHEMATICAL ACCURACY: Always use the verified calculations and metrics provided in the dataset context.
8. EXPLICIT REFUSAL OF UNAVAILABLE DATA: If the user asks for information not recorded in the dataset (such as hourly LMS login clickstream timestamps, raw exam question papers, personal chat transcripts, or unrecorded attendance sessions), you MUST explicitly state that this information is not recorded in the platform database. Do NOT estimate, invent, or speculate.
9. FORMATTING: Use clean, professional markdown with concise bullet points, bold key metrics, and an encouraging, academic tone.
```

---

## 7. Verbatim Test Execution Evidence (5 Required Test Cases)

Executed against live Gemini model (`gemini-2.5-flash`) via `node tests/run_week2_tests.mjs`:

```
========================================================================
WEEK 2 COMPREHENSIVE VERIFICATION & TEST SUITE
AI Student Learning & Career Success Platform
Execution Timestamp: 2026-11-04T09:02:46.271Z
========================================================================

--- PRE-FLIGHT 1: Python Engine Standalone & Batch Analytics ---
Python evaluate-student (11391): PASS
  * Output: {
    "student_id": 11391,
    "is_valid": true,
    "validation_errors": [],
    "overall_readiness_score": 76.8,
    "risk_level": "Low",
    "placement_ready": true,
    "placement_status": "Placement Ready",
    "recommended_topic": "Logic Puzzles & Patterns",
    "recommended_skill": "Algorithmic Problem Solving",
    "recommended_learning_action": "Complete timed logic challenges and peer code reviews",
    "attendance": {
      "percentage": 92,
      "sessions_attended": 23,
      "sessions_missed": 2
    },
    "assignments": {
      "completed": 10,
      "assigned": 10,
      "average_score": 84.5
    }
  }
Python evaluate-student (28400): PASS
  * Output: {
    "student_id": 28400,
    "is_valid": true,
    "validation_errors": [],
    "overall_readiness_score": 66.1,
    "risk_level": "Low",
    "placement_ready": false,
    "placement_status": "Developing",
    "recommended_topic": "Numerical Reasoning Drills",
    "recommended_skill": "Statistical Data Interpretation",
    "recommended_learning_action": "Practice numerical reasoning modules with weekly mentor reviews",
    "attendance": {
      "percentage": 85,
      "sessions_attended": 17,
      "sessions_missed": 3
    },
    "assignments": {
      "completed": 7,
      "assigned": 8,
      "average_score": 68
    }
  }
Python batch-stats (2-record sample): PASS
  * Mean readiness calculated: 71.45
  * Placement distribution: {
    placement_ready_count: 1,
    placement_ready_percentage: 50,
    developing_count: 1,
    developing_percentage: 50
  }

========================================================================
5 REQUIRED LIVE TEST CASES WITH VERBATIM RECORDINGS
========================================================================

--- TEST CASE 1: Student Readiness Status (Student ID 11391 - Teja Chebolu) ---
Model: gemini-2.5-flash | Latency: 2361ms | Result: PASS
Verbatim Response:
Hello Teja,

Here is your current career and placement readiness status:

*   **Overall Readiness Score:** **76.8%**
*   **Placement Readiness:** **Placement Ready (Yes)**
*   **Risk Level:** **Low**

To further enhance your readiness, we recommend focusing on:
*   **Recommended Topic:** Logic Puzzles & Patterns
*   **Recommended Skill:** Algorithmic Problem Solving
*   **Recommended Learning Action:** Complete timed logic challenges and peer code reviews

--- TEST CASE 2: Risk Level Assessment (Student ID 28400 - Yaswanth) ---
Model: gemini-2.5-flash | Latency: 1697ms | Result: PASS
Verbatim Response:
Hello Yaswanth,

Here is your evaluated status:

*   **Risk Level**: **Low**
*   **Placement Readiness**: **Developing (No)**

--- TEST CASE 3: Recommended Learning Topic (Student ID 11391) ---
Model: gemini-2.5-flash | Latency: 1286ms | Result: PASS
Verbatim Response:
Hello Teja,

Based on your learning data, the specific learning topic recommended for you is:

*   **Recommended Topic:** Logic Puzzles & Patterns

Keep up the great work!

--- TEST CASE 4: Actionable Learning Guidance (Student ID 28400) ---
Model: gemini-2.5-flash | Latency: 1919ms | Result: PASS
Verbatim Response:
Hello Yaswanth,

Based on your current learning record, here are the recommendations to help improve your placement readiness:

*   **Recommended Skill:** **Statistical Data Interpretation**
*   **Recommended Learning Action:** **Practice numerical reasoning modules with weekly mentor reviews**

Focusing on these areas will support your progress towards your learning goals in Data Analysis and Quantitative Reasoning.

--- TEST CASE 5: Unavailable Information Handling (Refusal Boundary) ---
Model: gemini-2.5-flash | Latency: 2608ms | Result: PASS
Verbatim Response:
I cannot provide hourly LMS login clickstream timestamps or raw question paper copies for the mid-term exam. This type of detailed information, such as specific clickstream logs or raw exam papers, is not recorded in the platform database.

I can, however, provide information related to your:
*   **Overall readiness and learning recommendations.**
*   **Attendance and engagement metrics.**
*   **Assignment and assessment performance.**

========================================================================
TEST SUITE SUMMARY:
Total Tests Executed: 5
All Passed: YES (5/5)
========================================================================
```

---

## 8. Team Integration & Contribution Matrix

| Teammate / Role | Module / Area | Integration Touchpoint |
| :--- | :--- | :--- |
| **Backend / AI Integration Lead** | `server.ts`, `python/student_analytics.py` | Built child_process IPC, `/api/analytics/*` REST endpoints, resilient Gemini fallback engine, and explicit prompt refusal rules. |
| **Database & Security Architect** | Supabase PostgreSQL, RLS Policies | Audited schema for `student_learning_data`, verified attendance and assignment columns, enforced Bearer token security without service keys. |
| **Frontend Engineer** | `src/components/dashboards/` | Maintained Student Dashboard, Trainer Roster, and Admin Dashboard views, seamlessly rendering grounded AI insights and attendance KPIs. |
| **QA / Evaluation Engineer** | `tests/run_week2_tests.mjs` | Built automated end-to-end test runner, verified IDs 11391 and 28400, captured verbatim logs, and ensured 0 TypeScript lint errors. |

---

## 9. Week 2 Resubmission Evidence Checklist

- [x] **Python Implementation**: `python/student_analytics.py` created and tested with standard library Python 3.10.
- [x] **Real Data Science Logic**: Schema validation, deterministic evaluation, and dynamic statistical moments implemented.
- [x] **Statistics Verified**: Cohort mean, median, standard deviation, placement distribution, and topic counts calculated dynamically.
- [x] **Application/API Bridge**: Connected `server.ts` to Python via stdin/stdout JSON IPC with timeout guards.
- [x] **Gemini Chatbot Grounding**: Enhanced prompt with verified database fields and explicit refusal of unrecorded information.
- [x] **Zero Fabrication**: Confirmed that zero (0) is distinguished from NULL and unrecorded logs are refused.
- [x] **5 Live Tests Executed**: All 5 test cases executed against live Gemini API with verbatim logs recorded.
- [x] **RLS Preserved**: Supabase Row-Level Security, database permissions, authentication, and schemas kept 100% intact.
- [x] **Build & Lint Verification**: Ran `tsc --noEmit` (0 errors) and `npm run build` (success).
- [x] **Full Documentation Published**: `docs/WEEK_2_DOCUMENTATION.md` completed.
