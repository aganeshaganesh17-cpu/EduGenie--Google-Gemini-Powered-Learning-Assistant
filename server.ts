import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Google Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

// Resilient generator that tries models in succession if high demand / rate limit occurs
async function generateWithFallback(options: {
  contents: any;
  config?: any;
}): Promise<string> {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`Model ${model} attempt error:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All AI models are currently busy. Please try again shortly.');
}

// Clean markdown fences if present
function cleanJsonBlock(text: string): string {
  return text.replace(/```(?:json)?\n?([\s\S]*?)\n?```/gi, '$1').trim();
}

/* ==========================================
   MODULE 1: Q&A MODULE (/qa, /api/qa)
   ========================================== */
async function handleQA(question: string): Promise<string> {
  if (!question || !question.trim()) {
    throw new Error('Please provide a question.');
  }

  return await generateWithFallback({
    contents: `You are EduGenie, an AI educational tutor. Answer the student's question accurately, concisely, and helpfully. Keep the language natural and clear for a student.
Question: ${question}`,
  });
}

app.get(['/qa', '/api/qa'], async (req: Request, res: Response) => {
  try {
    const question = (req.query.question as string) || '';
    if (!question) {
      return res.status(400).json({ error: 'Please provide a question.' });
    }
    const answer = await handleQA(question);
    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in QnA:', error);
    return res.status(500).json({ error: `⚠️ Error in QnA: ${error.message || 'Service temporarily busy'}` });
  }
});

app.post(['/qa', '/api/qa'], async (req: Request, res: Response) => {
  try {
    const question = req.body.question || req.query.question || '';
    if (!question) {
      return res.status(400).json({ error: 'Please provide a question.' });
    }
    const answer = await handleQA(question);
    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in QnA:', error);
    return res.status(500).json({ error: `⚠️ Error in QnA: ${error.message || 'Service temporarily busy'}` });
  }
});

/* ==========================================
   MODULE 2: EXPLANATION MODULE (/explain, /api/explain)
   ========================================== */
async function handleExplain(topic: string, level?: string): Promise<string> {
  if (!topic || !topic.trim()) {
    throw new Error('Please provide a topic.');
  }

  const targetLevel = level || 'school student';
  const prompt = `Explain the concept of '${topic}' in a simple and clear way for a ${targetLevel}.
Break down complex terminology into easily relatable intuition and real-world examples.
Focus on clarity, brevity, and foundational understanding. Keep the answer structured and easy to read.`;

  return await generateWithFallback({
    contents: prompt,
  });
}

app.post(['/explain', '/api/explain'], async (req: Request, res: Response) => {
  try {
    const topic = req.body.topic || req.query.topic;
    const level = req.body.level;
    if (!topic) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    const explanation = await handleExplain(topic, level);
    return res.json({ topic, explanation });
  } catch (error: any) {
    console.error('Error in Explain:', error);
    return res.status(500).json({ error: `⚠️ Error in Explain: ${error.message || 'Service temporarily busy'}` });
  }
});

app.get(['/explain', '/api/explain'], async (req: Request, res: Response) => {
  try {
    const topic = req.query.topic as string;
    if (!topic) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    const explanation = await handleExplain(topic);
    return res.json({ topic, explanation });
  } catch (error: any) {
    console.error('Error in Explain:', error);
    return res.status(500).json({ error: `⚠️ Error in Explain: ${error.message || 'Service temporarily busy'}` });
  }
});

/* ==========================================
   MODULE 3: SUMMARIZATION MODULE (/summarize, /api/summarize)
   ========================================== */
async function handleSummarize(text: string, format?: string): Promise<string> {
  if (!text || !text.trim()) {
    throw new Error('Please provide text to summarize.');
  }

  let prompt = `Summarize the following text in simple language:\n\n${text}\n\nRetain the essential facts and core information while eliminating redundancy. Help learners absorb key points quickly.`;
  if (format === 'bullets') {
    prompt += ` Format the response with bullet points highlighting key takeaways.`;
  }

  return await generateWithFallback({
    contents: prompt,
  });
}

app.post(['/summarize', '/api/summarize'], async (req: Request, res: Response) => {
  try {
    const text = req.body.text;
    const format = req.body.format;
    if (!text) {
      return res.status(400).json({ error: 'Please provide text to summarize.' });
    }
    const summary = await handleSummarize(text, format);
    return res.json({ summary });
  } catch (error: any) {
    console.error('Error in Summary:', error);
    return res.status(500).json({ error: `⚠️ Error in Summary: ${error.message || 'Service temporarily busy'}` });
  }
});

/* ==========================================
   MODULE 4: QUIZ MODULE (/quiz, /api/quiz)
   ========================================== */
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

async function handleQuiz(textOrTopic: string, count: number = 3): Promise<QuizQuestion[]> {
  if (!textOrTopic || !textOrTopic.trim()) {
    throw new Error('Please provide text or a topic for the quiz.');
  }

  const prompt = `You are a quiz generator for students.
From the following topic or passage, create ${count} multiple-choice questions.
Each question should include:
- A "question"
- A list of exactly 4 "options"
- A correct "answer" that must exactly match one of the 4 options
- An "explanation" clarifying why this answer is correct

Topic/Passage:
${textOrTopic}`;

  const text = await generateWithFallback({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: 'The multiple choice question text',
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of 4 multiple choice options',
            },
            answer: {
              type: Type.STRING,
              description: 'The correct answer matching one of the options verbatim',
            },
            explanation: {
              type: Type.STRING,
              description: 'A brief explanation for why this answer is correct',
            },
          },
          required: ['question', 'options', 'answer'],
        },
      },
    },
  });

  const rawJson = cleanJsonBlock(text || '[]');
  const quizData = JSON.parse(rawJson);
  return quizData;
}

app.post(['/quiz', '/api/quiz'], async (req: Request, res: Response) => {
  try {
    const text = req.body.text || req.body.topic;
    const count = parseInt(req.body.count, 10) || 3;
    if (!text) {
      return res.status(400).json({ error: 'Please provide text for quiz.' });
    }
    const quiz = await handleQuiz(text, count);
    return res.json({ quiz });
  } catch (error: any) {
    console.error('Error in Quiz Generation:', error);
    return res.status(500).json({ error: `⚠️ Error in Quiz: ${error.message || 'Service temporarily busy'}` });
  }
});

/* ==========================================
   MODULE 5: LEARNING PATH MODULE (/learn/recommendations, /api/learn/recommendations)
   ========================================== */
async function handleLearningRecommendations(topic: string): Promise<string> {
  if (!topic || !topic.trim()) {
    throw new Error('Please provide a topic.');
  }

  const prompt = `You are an AI tutor. The student wants to learn about: ${topic}.
Suggest a structured and adaptive learning path including key topics, order of learning, and resources (videos, articles, books).
Include beginner, intermediate, and advanced levels with:
1. Level Title & Estimated Time (e.g. **I. Beginner Level: Building a Foundation** (Estimated Time: 1-2 weeks))
2. **Key Topics** with bulleted descriptions
3. **Resources** (Interactive Tutorials, Online Documentation, Video Courses, Books)
4. **Adaptive Learning Tips** (how to practice, real-world projects, community forums)
Format the output cleanly in Markdown with bold headers, bullet points, and actionable guidance.`;

  return await generateWithFallback({
    contents: prompt,
  });
}

app.get(['/learn/recommendations', '/api/learn/recommendations'], async (req: Request, res: Response) => {
  try {
    const topic = (req.query.topic as string) || '';
    if (!topic) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    const recommendation = await handleLearningRecommendations(topic);
    return res.json({ topic, recommendation });
  } catch (error: any) {
    console.error('Error in Learning Recommendations:', error);
    return res.status(500).json({ error: `⚠️ Error in Learning Path: ${error.message || 'Service temporarily busy'}` });
  }
});

app.post(['/learn/recommendations', '/api/learn/recommendations'], async (req: Request, res: Response) => {
  try {
    const topic = req.body.topic || req.query.topic;
    if (!topic) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    const recommendation = await handleLearningRecommendations(topic);
    return res.json({ topic, recommendation });
  } catch (error: any) {
    console.error('Error in Learning Recommendations:', error);
    return res.status(500).json({ error: `⚠️ Error in Learning Path: ${error.message || 'Service temporarily busy'}` });
  }
});

/* ==========================================
   HEALTH & METRICS ENDPOINTS
   ========================================== */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'EduGenie',
    models: CANDIDATE_MODELS,
    endpoints: ['/qa', '/explain', '/summarize', '/quiz', '/learn/recommendations'],
  });
});

/* ==========================================
   START SERVER & VITE INTEGRATION
   ========================================== */
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
