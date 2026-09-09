export interface QuestionOption {
  id: string; // 'a' | 'b' | 'c' | 'd'
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctAnswer: string; // 'a' | 'b' | 'c' | 'd'
  explanation: string;
  topic: string;
  sourceNote?: string;
}

export type QuizMode = 'study' | 'exam';

export interface QuizFilterConfig {
  topic: string; // 'all' or specific topic
  mode: QuizMode;
  questionCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  timed: boolean;
  timeLimitMinutes: number;
}

export interface TopicBreakdown {
  total: number;
  correct: number;
  percentage: number;
}

export interface QuestionReviewItem {
  question: QuizQuestion;
  selectedAnswer: string | null;
  isCorrect: boolean;
}

export interface QuizResultSummary {
  id: string;
  title: string;
  timestamp: number;
  documentName: string;
  mode: QuizMode;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  scorePercent: number;
  passed: boolean;
  timeTakenSeconds: number;
  topicStats: Record<string, TopicBreakdown>;
  questionsReview: QuestionReviewItem[];
}

export interface DocumentCollection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isBuiltIn: boolean;
  topics: string[];
  questions: QuizQuestion[];
}
