import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

const systemInstruction = `
You are EduCareer AI, the dedicated, dataset-grounded analytics assistant for the AI Student Learning & Career Success Platform.

CRITICAL OPERATING RULES:
1. STRICT DATASET GROUNDING: You must answer questions EXCLUSIVELY using the facts and verified numbers provided in the DATASET CONTEXT below.
2. ZERO FABRICATION: Never guess, estimate, or make up metrics, attendance percentages, assignment counts, or student scores.
3. STRICT ROLE-BASED PRIVACY: Students can only view their own performance, goals, and recommendations.
4. OUT-OF-SCOPE REFUSAL: Do not answer general programming questions, trivia, jokes, essays, or general knowledge.
5. MATHEMATICAL ACCURACY: Always use the verified calculations provided in the context.
6. FORMATTING: Use clean, professional markdown with concise bullet points and bold key metrics.
`;

const datasetContext = `
AUTHORIZED ROLE: Student
STUDENT ACCOUNT:
- User ID: 32ffde8a-e4ba-49a1-9622-dcfd45e31c42
- Name: Teja Chebolu
- Email: chebolusatya2005@gmail.com
- Institutional Student ID: 11391
- Education Level: Higher Education Degree
- Learning Goals: Software Engineering and Cloud Computing

PERSONAL LEARNING RECORD (public.student_learning_data for Student ID 11391):
- Readiness Score: 76.8
- Risk Level: Low
- Placement Readiness: Placement Ready (Yes)
- Recommended Topic: Logic Puzzles & Patterns
- Course Name: Open University - AAA
- Batch ID: 2013J

STRICT DATASET BOUNDARY & PRIVACY ENFORCEMENT:
- This student is ONLY permitted to view their own academic profile, readiness status, risk level, and learning recommendations.
- Attendance logs and assignment submission counts are not recorded in this database batch.
`;

// Helper matching server.ts generateGeminiReply
async function generateGeminiReply(contents) {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const timeoutMs = 12000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms with ${model}`)), timeoutMs)
      );

      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text;
      if (text && text.trim().length > 0) {
        return { text, modelUsed: model };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Diagnostics] Model ${model} failed: ${err.message}. Trying next candidate...`);
    }
  }

  throw lastError;
}

// Function simulating server.ts contents builder
function buildContents(history, userQuery) {
  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    const validHistory = history.filter(
      (h) => h && typeof h.content === 'string' && h.content.trim().length > 0
    );

    const lastItem = validHistory[validHistory.length - 1];
    const priorHistory =
      lastItem && lastItem.role === 'user' && lastItem.content.trim() === userQuery.trim()
        ? validHistory.slice(0, -1)
        : validHistory;

    let lastRole = null;
    for (const h of priorHistory.slice(-6)) {
      const geminiRole = h.role === 'assistant' ? 'model' : 'user';
      if (!lastRole && geminiRole === 'model') {
        continue;
      }
      if (geminiRole === lastRole) {
        const prev = contents[contents.length - 1];
        if (prev && prev.parts[0]) {
          prev.parts[0].text += `\n\n${h.content.trim()}`;
        }
      } else {
        contents.push({ role: geminiRole, parts: [{ text: h.content.trim() }] });
        lastRole = geminiRole;
      }
    }
  }

  const promptMessage = `\n[DATASET CONTEXT]\n${datasetContext}\n\n[USER QUESTION]\n${userQuery}\n`;

  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts = [{ text: promptMessage }];
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: promptMessage }],
    });
  }

  return contents;
}

async function run() {
  console.log('--- Step 1: Query 1 (Readiness & Risk Level) ---');
  const q1 = 'What is my current career readiness status and risk level?';
  const history1 = []; // Initial query has no prior history
  const contents1 = buildContents(history1, q1);
  const res1 = await generateGeminiReply(contents1);
  console.log(`Model Used: ${res1.modelUsed}`);
  console.log(`Reply 1:\n${res1.text}\n`);

  console.log('--- Step 2: Query 2 (Student ID, Course Name, Batch ID) ---');
  const q2 = 'What is my student ID, course name, and batch ID?';
  // History passed from frontend (prior completed turns)
  const history2 = [
    { role: 'user', content: q1 },
    { role: 'assistant', content: res1.text },
  ];
  const contents2 = buildContents(history2, q2);
  const res2 = await generateGeminiReply(contents2);
  console.log(`Model Used: ${res2.modelUsed}`);
  console.log(`Reply 2:\n${res2.text}\n`);

  // Verify that key fields are present in reply 2
  const text2 = res2.text;
  const hasId = text2.includes('11391');
  const hasCourse = text2.includes('Open University') || text2.includes('AAA');
  const hasBatch = text2.includes('2013J');

  console.log('Verification:');
  console.log('- Contains Student ID (11391):', hasId);
  console.log('- Contains Course Name (Open University - AAA):', hasCourse);
  console.log('- Contains Batch ID (2013J):', hasBatch);

  if (hasId && hasCourse && hasBatch) {
    console.log('\n>>> ALL MULTI-TURN VERIFICATIONS PASSED SUCCESSFULLY! <<<');
  } else {
    console.error('\n>>> VERIFICATION FAILED: Missing required fields <<<');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
