import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing large JSON payloads (such as base64 PDFs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Generate or extract quiz questions from uploaded PDF or text
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { pdfBase64, textContent, numQuestions = 10, focusTopic } = req.body;

    if (!pdfBase64 && !textContent) {
      return res.status(400).json({ error: 'Either pdfBase64 or textContent must be provided' });
    }

    const ai = getGenAI();

    const topicInstruction = focusTopic && focusTopic !== 'all'
      ? `Focus specifically on the topic "${focusTopic}".`
      : 'Cover a balanced spread across all available topics in the document.';

    const systemInstruction = `You are a strict, highly accurate exam quiz preparation engine.
Your task is to generate practice multiple choice questions based STRICTLY and ONLY on the uploaded content.
DO NOT use outside knowledge, do not hallucinate details, and do not make assumptions not supported by the document.
If the document already includes questions, answers, and explanations, extract and format them accurately.
If generating new practice questions from the document text, ensure each question tests understanding of the content.
Every question must have:
- Exactly 4 options with keys "a", "b", "c", "d" (never duplicated).
- The exact correct answer ("a", "b", "c", or "d").
- An in-depth, educational explanation explaining WHY the correct answer is right and clarifying tricky aspects based purely on the provided text.
- Any programming code must be separated cleanly into the 'codeSnippet' field or formatted in backticks.
- An appropriate topic category.`;

    const promptText = `Analyze the provided document carefully.
Generate ${numQuestions} practice multiple-choice questions based ONLY on this uploaded content.
${topicInstruction}
Return the structured quiz according to the schema.`;

    let contentsPayload: any;

    if (pdfBase64) {
      contentsPayload = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
        {
          text: promptText,
        },
      ];
    } else {
      contentsPayload = `${promptText}\n\n=== UPLOADED CONTENT ===\n${textContent}\n=== END OF CONTENT ===`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive title for the generated quiz session' },
            summary: { type: Type.STRING, description: 'Brief overview of what this quiz covers from the document' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'Unique identifier for the question (e.g. q1, q2)' },
                  question: { type: Type.STRING, description: 'The question text' },
                  codeSnippet: { type: Type.STRING, description: 'Code block or snippet if applicable, else empty' },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: 'Option key: a, b, c, or d' },
                        text: { type: Type.STRING, description: 'Option answer text' },
                      },
                      required: ['id', 'text'],
                    },
                  },
                  correctAnswer: { type: Type.STRING, description: 'Correct option key: a, b, c, or d' },
                  explanation: { type: Type.STRING, description: 'Accurate explanation based on the document' },
                  topic: { type: Type.STRING, description: 'Subject or category name' },
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'explanation', 'topic'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Received empty response from AI model');
    }

    const parsedData = JSON.parse(outputText);
    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate quiz from document',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
