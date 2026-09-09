import React, { useState, useEffect } from 'react';
import { 
  DocumentCollection, 
  QuizFilterConfig, 
  QuizQuestion, 
  QuizResultSummary, 
  TopicBreakdown 
} from './types';
import { 
  getDefaultCollection, 
  getCustomDocuments, 
  saveCustomDocument, 
  getQuizHistory, 
  saveQuizResult, 
  shuffleArray 
} from './utils/storage';
import { Header } from './components/Header';
import { QuizConfig } from './components/QuizConfig';
import { ActiveQuiz } from './components/ActiveQuiz';
import { QuizResults } from './components/QuizResults';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { QuestionBankBrowserModal } from './components/QuestionBankBrowserModal';
import { HistoryModal } from './components/HistoryModal';

export default function App() {
  const [documents, setDocuments] = useState<DocumentCollection[]>([getDefaultCollection()]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentCollection>(getDefaultCollection());
  
  // Navigation state
  const [phase, setPhase] = useState<'config' | 'active' | 'results'>('config');
  
  // Active session data
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [activeConfig, setActiveConfig] = useState<QuizFilterConfig | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizResultSummary | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isBankOpen, setIsBankOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<QuizResultSummary[]>([]);

  // Load custom documents and history on mount
  useEffect(() => {
    const defaultDoc = getDefaultCollection();
    const customDocs = getCustomDocuments();
    setDocuments([defaultDoc, ...customDocs]);
    setHistory(getQuizHistory());
  }, []);

  const handleStartQuiz = (config: QuizFilterConfig, questionSubset?: string[]) => {
    let pool = [...selectedDoc.questions];

    if (questionSubset && questionSubset.length > 0) {
      pool = pool.filter((q) => questionSubset.includes(q.id));
    } else if (config.topic !== 'all') {
      pool = pool.filter((q) => q.topic === config.topic);
    }

    if (config.shuffleQuestions) {
      pool = shuffleArray(pool);
    }

    // Slice to selected count
    let selectedQuestions = pool.slice(0, config.questionCount);

    // Shuffle options if requested
    if (config.shuffleOptions) {
      selectedQuestions = selectedQuestions.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    setActiveQuestions(selectedQuestions);
    setActiveConfig(config);
    setPhase('active');
  };

  const handleFinishQuiz = (answers: Record<string, string>, timeTakenSeconds: number) => {
    if (!activeConfig) return;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const topicStats: Record<string, { total: number; correct: number }> = {};

    const questionsReview = activeQuestions.map((q) => {
      const selected = answers[q.id] || null;
      const isCorrect = selected === q.correctAnswer;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total += 1;

      if (isCorrect) {
        correctCount += 1;
        topicStats[q.topic].correct += 1;
      } else {
        wrongCount += 1;
        if (!selected) skippedCount += 1;
      }

      return {
        question: q,
        selectedAnswer: selected,
        isCorrect,
      };
    });

    const totalQuestions = activeQuestions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= 70;

    const finalTopicBreakdown: Record<string, TopicBreakdown> = {};
    Object.entries(topicStats).forEach(([t, s]) => {
      finalTopicBreakdown[t] = {
        total: s.total,
        correct: s.correct,
        percentage: Math.round((s.correct / s.total) * 100),
      };
    });

    const summary: QuizResultSummary = {
      id: `result-${Date.now()}`,
      title: `${selectedDoc.name} (${activeConfig.topic === 'all' ? 'All Topics' : activeConfig.topic})`,
      timestamp: Date.now(),
      documentName: selectedDoc.name,
      mode: activeConfig.mode,
      totalQuestions,
      correctCount,
      wrongCount,
      skippedCount,
      scorePercent,
      passed,
      timeTakenSeconds,
      topicStats: finalTopicBreakdown,
      questionsReview,
    };

    saveQuizResult(summary);
    setCurrentResult(summary);
    setHistory(getQuizHistory());
    setPhase('results');
  };

  const handleRetakeAll = () => {
    if (activeConfig) {
      handleStartQuiz(activeConfig);
    }
  };

  const handleRetakeMissed = () => {
    if (!currentResult || !activeConfig) return;
    const missedIds = currentResult.questionsReview
      .filter((item) => !item.isCorrect)
      .map((item) => item.question.id);

    if (missedIds.length > 0) {
      handleStartQuiz(
        {
          ...activeConfig,
          mode: 'study', // Study mode is best for missed questions review
          questionCount: missedIds.length,
        },
        missedIds
      );
    }
  };

  const handleDocumentAdded = (newDoc: DocumentCollection) => {
    saveCustomDocument(newDoc);
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    setPhase('config');
  };

  const handleClearHistory = () => {
    localStorage.removeItem('exam_prep_quiz_history_v1');
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Header
        currentDoc={selectedDoc}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenBank={() => setIsBankOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onResetToHome={() => setPhase('config')}
        isSessionActive={phase === 'active'}
      />

      <main className="flex-1">
        {phase === 'config' && (
          <QuizConfig
            documents={documents}
            selectedDoc={selectedDoc}
            onSelectDoc={(doc) => setSelectedDoc(doc)}
            onStartQuiz={handleStartQuiz}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenBank={() => setIsBankOpen(true)}
          />
        )}

        {phase === 'active' && activeConfig && (
          <ActiveQuiz
            questions={activeQuestions}
            config={activeConfig}
            documentTitle={selectedDoc.name}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={() => setPhase('config')}
          />
        )}

        {phase === 'results' && currentResult && (
          <QuizResults
            result={currentResult}
            onRetakeAll={handleRetakeAll}
            onRetakeMissed={handleRetakeMissed}
            onBackToConfig={() => setPhase('config')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Exam Preparation Quiz Master • Grounded strictly in uploaded content
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBankOpen(true)}
              className="hover:text-indigo-600 font-medium"
            >
              Browse 90 Extracted Questions
            </button>
            <span>•</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hover:text-indigo-600 font-medium"
            >
              Upload PDF
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAdded={handleDocumentAdded}
      />

      <QuestionBankBrowserModal
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        questions={selectedDoc.questions}
        documentName={selectedDoc.name}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(res) => {
          setCurrentResult(res);
          setPhase('results');
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
