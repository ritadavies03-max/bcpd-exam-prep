import React from 'react';
import { Flag, Check, HelpCircle, X } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuestionPaletteProps {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  onSelectIndex: (index: number) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  answers,
  flags,
  onSelectIndex,
  onClose,
  isModal = false,
}) => {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const totalCount = questions.length;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-5 ${isModal ? 'max-w-md w-full' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>
          <span className="text-xs text-slate-500">
            {answeredCount} of {totalCount} answered
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 mb-4">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md bg-amber-400 inline-block" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 inline-block" />
          <span>Unanswered</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = currentIndex === idx;
          const isAnswered = answers[q.id] !== undefined;
          const isFlagged = Boolean(flags[q.id]);

          let style = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';

          if (isCurrent) {
            style = 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 font-bold';
          } else if (isAnswered) {
            style = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
          }

          return (
            <button
              key={q.id}
              id={`palette-btn-${idx + 1}`}
              onClick={() => {
                onSelectIndex(idx);
                if (onClose) onClose();
              }}
              className={`relative h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${style}`}
            >
              <span>{idx + 1}</span>
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Flag className="w-2 h-2 fill-current" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
