import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  LayoutGrid, 
  AlertTriangle,
  X,
  Send
} from 'lucide-react';
import { QuizQuestion, QuizMode, QuizFilterConfig } from '../types';
import { QuestionCard } from './QuestionCard';
import { QuestionPalette } from './QuestionPalette';

interface ActiveQuizProps {
  questions: QuizQuestion[];
  config: QuizFilterConfig;
  documentTitle: string;
  onFinishQuiz: (
    answers: Record<string, string>,
    timeTakenSeconds: number
  ) => void;
  onCancelQuiz: () => void;
}

export const ActiveQuiz: React.FC<ActiveQuizProps> = ({
  questions,
  config,
  documentTitle,
  onFinishQuiz,
  onCancelQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [showPaletteModal, setShowPaletteModal] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Timer state
  const isTimed = config.timed && config.timeLimitMinutes > 0;
  const initialSeconds = isTimed ? config.timeLimitMinutes * 60 : 0;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (isTimed) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit when timer expires
            handleConfirmSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id] || null;
  const isFlagged = Boolean(flags[currentQuestion.id]);

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    setFlags((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    onFinishQuiz(answers, elapsedSeconds);
  };

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Session Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Progress info & Mode */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
            config.mode === 'study' 
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {config.mode === 'study' ? 'Practice Mode' : 'Exam Mode'}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {documentTitle}
          </span>
        </div>

        {/* Center: Timer if applicable */}
        {isTimed ? (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            remainingSeconds < 120 
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' 
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTime(remainingSeconds)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Elapsed: {formatTime(elapsedSeconds)}</span>
          </div>
        )}

        {/* Right: Palette trigger & Exit */}
        <div className="flex items-center gap-2">
          <button
            id="open-palette-btn"
            onClick={() => setShowPaletteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Open Question Navigator"
          >
            <LayoutGrid className="w-4 h-4 text-slate-600" />
            <span>Grid ({answeredCount}/{totalQuestions})</span>
          </button>

          <button
            id="exit-quiz-btn"
            onClick={() => setShowExitModal(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Exit quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sleek Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Question Card + Desktop Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3">
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            mode={config.mode}
            selectedAnswer={selectedAnswer}
            isFlagged={isFlagged}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
            showExplanation={config.mode === 'study' && selectedAnswer !== null}
          />

          {/* Bottom Navigation Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              id="quiz-prev-btn"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              type="button"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  id="quiz-next-btn"
                  onClick={handleNext}
                  type="button"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}

              {/* Submit Button (always visible or highlighted on last question) */}
              <button
                id="quiz-submit-btn"
                onClick={() => setShowSubmitModal(true)}
                type="button"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Desktop Palette */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <QuestionPalette
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flags={flags}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Floating Question Palette Modal */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flags={flags}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            onClose={() => setShowPaletteModal(false)}
            isModal={true}
          />
        </div>
      )}

      {/* Confirm Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Ready to submit your exam?
            </h3>

            {unansweredCount > 0 ? (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs sm:text-sm mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You have <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong> out of {totalQuestions}. Unanswered questions will be marked as incorrect.
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                Great job! You answered all {totalQuestions} questions. Once submitted, you will immediately see your score, correct/wrong answers, and in-depth explanations.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                id="cancel-submit-modal-btn"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Return to Exam
              </button>
              <button
                id="confirm-submit-exam-btn"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Confirm & See Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Quiz Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Quit this practice session?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Your current progress for this session will not be graded or saved to history.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Practicing
              </button>
              <button
                id="confirm-exit-quiz-btn"
                onClick={onCancelQuiz}
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
