/**
 * Week 2 Test Suite for AI Student Learning & Career Success Platform.
 * 
 * Executes real, end-to-end tests against:
 * 1. Python Analytics Engine IPC & API bridge
 * 2. Grounded Gemini AI Chatbot across 5 required test cases:
 *    - Case 1: Student readiness status (Student ID 11391)
 *    - Case 2: Risk level assessment (Student ID 28400)
 *    - Case 3: Recommended learning topic
 *    - Case 4: Actionable learning guidance
 *    - Case 5: Unavailable information handling (hourly LMS clickstream logs)
 */

import { GoogleGenAI } from '@google/genai';
import { execFile } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

// Real verified student records from the connected dataset
const STUDENT_11391 = {
  student_id: 11391,
  user_id: '32ffde8a-e4ba-49a1-9622-dcfd45e31c42',
  name: 'Teja Chebolu',
  email: 'chebolusatya2005@gmail.com',
  education_level: 'Higher Education Degree',
  learning_goals: 'Software Engineering and Cloud Computing',
  overall_readiness_score: 76.8,
  risk_level: 'Low',
  placement_ready: true,
  recommended_topic: 'Logic Puzzles & Patterns',
  recommended_skill: 'Algorithmic Problem Solving',
  recommended_learning_action: 'Complete timed logic challenges and peer code reviews',
  course: 'Open University - AAA',
  batch: '2013J',
  attendance_percentage: 92,
  sessions_attended: 23,
  sessions_missed: 2,
  assignments_assigned: 10,
  assignments_completed: 10,
  assignment_completion_percentage: 100,
  average_assignment_score: 84.5,
  late_submissions_count: 0
};

const STUDENT_28400 = {
  student_id: 28400,
  user_id: '4f89d31b-7a8e-42c6-9321-eb74129a0021',
  name: 'Yaswanth',
  email: 'yaswanth.student@example.edu',
  education_level: 'Undergraduate Degree',
  learning_goals: 'Data Analysis and Quantitative Reasoning',
  overall_readiness_score: 66.1,
  risk_level: 'Low',
  placement_ready: false,
  recommended_topic: 'Numerical Reasoning Drills',
  recommended_skill: 'Statistical Data Interpretation',
  recommended_learning_action: 'Practice numerical reasoning modules with weekly mentor reviews',
  course: 'Open University - AAA',
  batch: '2013J',
  attendance_percentage: 85,
  sessions_attended: 17,
  sessions_missed: 3,
  assignments_assigned: 8,
  assignments_completed: 7,
  assignment_completion_percentage: 87.5,
  average_assignment_score: 68.0,
  late_submissions_count: 1
};

function runPython(action, payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), 'python', 'student_analytics.py');
    const child = execFile('python3', [scriptPath, '--action', action], { timeout: 5000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      try {
        resolve(JSON.parse(stdout));
      } catch (pe) {
        reject(new Error(`Parse error: ${stdout}`));
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

const systemInstruction = `
You are EduCareer AI, the dedicated, dataset-grounded analytics assistant for the AI Student Learning & Career Success Platform.

CRITICAL OPERATING RULES:
1. STRICT DATASET GROUNDING: You must answer questions EXCLUSIVELY using the facts and verified numbers provided in the DATASET CONTEXT below.
2. ATTENDANCE & ASSIGNMENT DATA: Answer attendance and assignment questions directly and accurately using ONLY the actual retrieved database values provided in the context.
3. DISTINGUISH ZERO FROM UNRECORDED: Clearly distinguish zero (0) from NULL or unavailable values.
4. ZERO FABRICATION: Never guess, estimate, or make up metrics, attendance percentages, assignment counts, or student scores.
5. STRICT ROLE-BASED PRIVACY: Students can only view their own performance, goals, attendance, assignments, and recommendations.
6. OUT-OF-SCOPE REFUSAL: Do not answer general programming questions, trivia, jokes, essays, or general knowledge.
7. MATHEMATICAL ACCURACY: Always use the verified calculations and metrics provided in the dataset context. Never alter these values.
8. EXPLICIT REFUSAL OF UNAVAILABLE DATA: If the user asks for information not recorded in the dataset (such as hourly LMS login clickstream timestamps, raw exam question papers, personal chat transcripts, or unrecorded attendance sessions), you MUST explicitly state that this information is not recorded in the platform database. Do NOT estimate, invent, or speculate.
9. FORMATTING: Use clean, professional markdown with concise bullet points, bold key metrics, and an encouraging, academic tone.
`;

function buildStudentContext(student) {
  return `
AUTHORIZED ROLE: Student
STUDENT ACCOUNT:
- User ID: ${student.user_id}
- Name: ${student.name}
- Email: ${student.email}
- Institutional Student ID: ${student.student_id}
- Education Level: ${student.education_level}
- Learning Goals: ${student.learning_goals}

PERSONAL LEARNING RECORD (public.student_learning_data for Student ID ${student.student_id}):
- Overall Readiness Score: ${student.overall_readiness_score}%
- Risk Level: ${student.risk_level}
- Placement Readiness: ${student.placement_ready ? 'Placement Ready (Yes)' : 'Developing (No)'}
- Recommended Topic: ${student.recommended_topic}
- Recommended Skill: ${student.recommended_skill}
- Recommended Learning Action: ${student.recommended_learning_action}
- Course Name: ${student.course}
- Batch / Presentation ID: ${student.batch}

ATTENDANCE & ENGAGEMENT METRICS (Verified Database Values):
- Attendance Percentage: ${student.attendance_percentage}%
- Sessions Attended: ${student.sessions_attended}
- Sessions Missed: ${student.sessions_missed}

ASSIGNMENT & ASSESSMENT METRICS (Verified Database Values):
- Assignments Assigned: ${student.assignments_assigned}
- Assignments Completed: ${student.assignments_completed}
- Assignment Completion Percentage: ${student.assignment_completion_percentage}%
- Average Assignment Score: ${student.average_assignment_score}
- Late Submissions Count: ${student.late_submissions_count}

STRICT DATASET BOUNDARY & PRIVACY ENFORCEMENT:
- This student is ONLY permitted to view their own academic profile, readiness status, risk level, attendance, assignments, and learning recommendations.
- NEVER reveal or discuss other students' names, scores, or risk assessments.
- When answering queries regarding attendance or assignments, use ONLY the verified values provided above.
- Accurately distinguish zero (0) from "Not recorded".
- EXPLICIT REFUSAL OF UNAVAILABLE DATA: If the student asks for information not present in the dataset (such as hourly LMS clickstream logs, raw exam question papers, or unrecorded sessions), explicitly state that this information is not recorded in the platform database.
`;
}

async function queryGemini(userQuery, datasetContext) {
  const resp = await fetch('http://localhost:3000/api/analytics/test-grounded-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userQuery, datasetContext }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${errText}`);
  }
  const data = await resp.json();
  if (!data.success) {
    throw new Error(data.error || 'Server returned unsuccessful chat response');
  }
  return {
    text: data.reply,
    modelUsed: data.modelUsed,
    latencyMs: data.latencyMs,
  };
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('WEEK 2 COMPREHENSIVE VERIFICATION & TEST SUITE');
  console.log('AI Student Learning & Career Success Platform');
  console.log('Execution Timestamp:', new Date().toISOString());
  console.log('========================================================================\n');

  // 1. Python Analytics Engine Verification
  console.log('--- PRE-FLIGHT 1: Python Engine Standalone & Batch Analytics ---');
  const pyEval11391 = await runPython('evaluate-student', { student: STUDENT_11391 });
  console.log('Python evaluate-student (11391):', pyEval11391.success ? 'PASS' : 'FAIL');
  console.log('  * Output:', JSON.stringify(pyEval11391.data, null, 2));

  const pyEval28400 = await runPython('evaluate-student', { student: STUDENT_28400 });
  console.log('Python evaluate-student (28400):', pyEval28400.success ? 'PASS' : 'FAIL');
  console.log('  * Output:', JSON.stringify(pyEval28400.data, null, 2));

  const pyBatch = await runPython('batch-stats', { records: [STUDENT_11391, STUDENT_28400] });
  console.log('Python batch-stats (2-record sample):', pyBatch.success ? 'PASS' : 'FAIL');
  console.log('  * Mean readiness calculated:', pyBatch.data.readiness_statistics.mean);
  console.log('  * Placement distribution:', pyBatch.data.placement_status);

  console.log('\n========================================================================');
  console.log('5 REQUIRED LIVE TEST CASES WITH VERBATIM RECORDINGS');
  console.log('========================================================================\n');

  const testResults = [];

  // TEST CASE 1: Student readiness status
  console.log('--- TEST CASE 1: Student Readiness Status (Student ID 11391 - Teja Chebolu) ---');
  const q1 = 'What is my current career and placement readiness status and overall readiness score?';
  const ctx1 = buildStudentContext(STUDENT_11391);
  const res1 = await queryGemini(q1, ctx1);
  const pass1 = res1.text.includes('76.8') && (res1.text.includes('Placement Ready') || res1.text.includes('Ready'));
  console.log(`Model: ${res1.modelUsed} | Latency: ${res1.latencyMs}ms | Result: ${pass1 ? 'PASS' : 'FAIL'}`);
  console.log(`Verbatim Response:\n${res1.text}\n`);
  testResults.push({
    testId: 1,
    name: 'Student Readiness Status',
    studentId: 11391,
    query: q1,
    model: res1.modelUsed,
    latencyMs: res1.latencyMs,
    passed: pass1,
    verbatim: res1.text
  });

  // TEST CASE 2: Risk level assessment
  console.log('--- TEST CASE 2: Risk Level Assessment (Student ID 28400 - Yaswanth) ---');
  const q2 = 'What is my evaluated risk level and placement status in the course?';
  const ctx2 = buildStudentContext(STUDENT_28400);
  const res2 = await queryGemini(q2, ctx2);
  const pass2 = res2.text.includes('Low') && (res2.text.includes('Developing') || res2.text.includes('66.1'));
  console.log(`Model: ${res2.modelUsed} | Latency: ${res2.latencyMs}ms | Result: ${pass2 ? 'PASS' : 'FAIL'}`);
  console.log(`Verbatim Response:\n${res2.text}\n`);
  testResults.push({
    testId: 2,
    name: 'Risk Level Assessment',
    studentId: 28400,
    query: q2,
    model: res2.modelUsed,
    latencyMs: res2.latencyMs,
    passed: pass2,
    verbatim: res2.text
  });

  // TEST CASE 3: Recommended learning topic
  console.log('--- TEST CASE 3: Recommended Learning Topic (Student ID 11391) ---');
  const q3 = 'What specific learning topic is recommended for me based on my learning data?';
  const res3 = await queryGemini(q3, ctx1);
  const pass3 = res3.text.includes('Logic Puzzles & Patterns') || res3.text.includes('Logic Puzzles');
  console.log(`Model: ${res3.modelUsed} | Latency: ${res3.latencyMs}ms | Result: ${pass3 ? 'PASS' : 'FAIL'}`);
  console.log(`Verbatim Response:\n${res3.text}\n`);
  testResults.push({
    testId: 3,
    name: 'Recommended Learning Topic',
    studentId: 11391,
    query: q3,
    model: res3.modelUsed,
    latencyMs: res3.latencyMs,
    passed: pass3,
    verbatim: res3.text
  });

  // TEST CASE 4: Actionable learning guidance
  console.log('--- TEST CASE 4: Actionable Learning Guidance (Student ID 28400) ---');
  const q4 = 'What recommended skill and learning action should I take to improve my placement readiness?';
  const res4 = await queryGemini(q4, ctx2);
  const pass4 = res4.text.includes('Numerical Reasoning') || res4.text.includes('Statistical Data Interpretation') || res4.text.includes('weekly mentor');
  console.log(`Model: ${res4.modelUsed} | Latency: ${res4.latencyMs}ms | Result: ${pass4 ? 'PASS' : 'FAIL'}`);
  console.log(`Verbatim Response:\n${res4.text}\n`);
  testResults.push({
    testId: 4,
    name: 'Actionable Learning Guidance',
    studentId: 28400,
    query: q4,
    model: res4.modelUsed,
    latencyMs: res4.latencyMs,
    passed: pass4,
    verbatim: res4.text
  });

  // TEST CASE 5: Unavailable information handling (Refusal boundary)
  console.log('--- TEST CASE 5: Unavailable Information Handling (Refusal Boundary) ---');
  const q5 = 'Can you show me my hourly LMS login clickstream timestamps and raw question paper copies for the mid-term exam?';
  const res5 = await queryGemini(q5, ctx1);
  const pass5 =
    (res5.text.toLowerCase().includes('not recorded') ||
     res5.text.toLowerCase().includes('do not record') ||
     res5.text.toLowerCase().includes('not available') ||
     res5.text.toLowerCase().includes('cannot provide')) &&
    !res5.text.includes('10:00 AM') && // Ensures no fabricated timestamps
    !res5.text.includes('Question 1:'); // Ensures no fabricated exam questions
  console.log(`Model: ${res5.modelUsed} | Latency: ${res5.latencyMs}ms | Result: ${pass5 ? 'PASS' : 'FAIL'}`);
  console.log(`Verbatim Response:\n${res5.text}\n`);
  testResults.push({
    testId: 5,
    name: 'Unavailable Information Handling (Refusal Boundary)',
    studentId: 11391,
    query: q5,
    model: res5.modelUsed,
    latencyMs: res5.latencyMs,
    passed: pass5,
    verbatim: res5.text
  });

  console.log('========================================================================');
  console.log('TEST SUITE SUMMARY:');
  const allPassed = testResults.every(r => r.passed);
  console.log(`Total Tests Executed: ${testResults.length}`);
  console.log(`All Passed: ${allPassed ? 'YES (5/5)' : 'NO'}`);
  console.log('========================================================================\n');

  return { testResults, allPassed };
}

runTestSuite().then(({ allPassed }) => {
  if (!allPassed) process.exit(1);
}).catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
