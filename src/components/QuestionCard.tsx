import React from 'react';
import { QuizQuestion, QuizMode } from '../types';
import { CheckCircle2, XCircle, Lightbulb, Code, Flag } from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  mode: QuizMode;
  selectedAnswer: string | null;
  isFlagged: boolean;
  onSelectOption: (optionId: string) => void;
  onToggleFlag: () => void;
  showExplanation: boolean; // In study mode, true once answered
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  mode,
  selectedAnswer,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  showExplanation,
}) => {
  const isAnswered = selectedAnswer !== null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative">
      {/* Header tags: Topic & Flag */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {question.topic}
          </span>
          <span className="text-xs font-medium text-slate-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <button
          id={`question-flag-toggle-${question.id}`}
          onClick={onToggleFlag}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            isFlagged
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
          }`}
          title={isFlagged ? 'Question flagged for review' : 'Flag question to review later'}
        >
          <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current text-amber-600' : ''}`} />
          <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
        </button>
      </div>

      {/* Question Text */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-4">
        {question.question}
      </h2>

      {/* Code snippet block if applicable */}
      {question.codeSnippet && (
        <div className="mb-6 rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2 pb-1.5 border-b border-slate-800">
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> Python Code
            </span>
          </div>
          <pre className="whitespace-pre">{question.codeSnippet}</pre>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.id === question.correctAnswer;

          // Styling logic depends on mode and whether explanation is revealed
          let buttonStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50/60';
          let indicatorStyle = 'border-slate-300 text-slate-600 bg-slate-100';

          if (mode === 'study' && showExplanation) {
            if (isCorrect) {
              buttonStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-200';
              indicatorStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isSelected && !isCorrect) {
              buttonStyle = 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-200';
              indicatorStyle = 'bg-rose-600 text-white border-rose-600';
            } else {
              buttonStyle = 'border-slate-200 opacity-60 bg-white text-slate-600';
            }
          } else {
            // Normal selection (Exam mode or Study before submit)
            if (isSelected) {
              buttonStyle = 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-200 font-semibold';
              indicatorStyle = 'bg-indigo-600 text-white border-indigo-600';
            }
          }

          return (
            <button
              key={option.id}
              id={`option-btn-${question.id}-${option.id}`}
              onClick={() => onSelectOption(option.id)}
              disabled={mode === 'study' && showExplanation}
              type="button"
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 group cursor-pointer ${buttonStyle}`}
            >
              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 uppercase transition-colors ${indicatorStyle}`}
              >
                {mode === 'study' && showExplanation ? (
                  isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isSelected ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    option.id
                  )
                ) : (
                  option.id
                )}
              </div>
              <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                {option.text}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation Box (Study Mode immediate or Exam post-review) */}
      {showExplanation && (
        <div
          id={`explanation-box-${question.id}`}
          className={`rounded-2xl p-5 border transition-all ${
            selectedAnswer === question.correctAnswer
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-indigo-50/80 border-indigo-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className={`w-5 h-5 shrink-0 ${
              selectedAnswer === question.correctAnswer ? 'text-emerald-700' : 'text-indigo-700'
            }`} />
            <span className="font-bold text-sm sm:text-base">
              {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Official Explanation'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 font-mono font-bold uppercase ml-auto">
              Answer: ({question.correctAnswer})
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-7">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
