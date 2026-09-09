import { QuizResultSummary, DocumentCollection, QuizQuestion } from '../types';
import { DEFAULT_DOCUMENT_NAME, DEFAULT_QUESTIONS } from '../data/defaultQuizBank';

const STORAGE_KEYS = {
  HISTORY: 'exam_prep_quiz_history_v1',
  DOCUMENTS: 'exam_prep_custom_docs_v1',
  MISSED_QUESTIONS: 'exam_prep_missed_questions_v1',
};

export function getQuizHistory(): QuizResultSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveQuizResult(result: QuizResultSummary): void {
  try {
    const history = getQuizHistory();
    const updated = [result, ...history].slice(0, 50); // Keep last 50 results
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

    // Update missed question pool
    const missedIds = result.questionsReview
      .filter((q) => !q.isCorrect)
      .map((q) => q.question.id);
    const existingMissed = getMissedQuestionIds();
    const newMissed = Array.from(new Set([...existingMissed, ...missedIds]));
    localStorage.setItem(STORAGE_KEYS.MISSED_QUESTIONS, JSON.stringify(newMissed));
  } catch (e) {
    console.error('Failed to save quiz result', e);
  }
}

export function getMissedQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISSED_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearMissedQuestion(questionId: string): void {
  try {
    const existing = getMissedQuestionIds();
    const updated = existing.filter((id) => id !== questionId);
    localStorage.setItem(STORAGE_KEYS.MISSED_QUESTIONS, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getCustomDocuments(): DocumentCollection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const parsed: DocumentCollection[] = raw ? JSON.parse(raw) : [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCustomDocument(doc: DocumentCollection): void {
  try {
    const docs = getCustomDocuments().filter((d) => d.id !== doc.id);
    docs.unshift(doc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save custom doc', e);
  }
}

export function getDefaultCollection(): DocumentCollection {
  const topics = Array.from(new Set(DEFAULT_QUESTIONS.map((q) => q.topic)));
  return {
    id: 'default-python-pdf',
    name: DEFAULT_DOCUMENT_NAME,
    description: 'Extracted directly from the uploaded 40-page Python MCQs, answers, and explanations document.',
    itemCount: DEFAULT_QUESTIONS.length,
    isBuiltIn: true,
    topics,
    questions: DEFAULT_QUESTIONS,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
