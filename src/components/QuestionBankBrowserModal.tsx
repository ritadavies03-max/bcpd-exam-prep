import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  X, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  Code, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuestionBankBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  documentName: string;
}

export const QuestionBankBrowserModal: React.FC<QuestionBankBrowserModalProps> = ({
  isOpen,
  onClose,
  questions,
  documentName,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const topics = Array.from(new Set(questions.map((q) => q.topic)));

  const toggleReveal = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    questions.forEach((q) => {
      all[q.id] = true;
    });
    setRevealedAnswers(all);
  };

  const hideAll = () => {
    setRevealedAnswers({});
  };

  const filtered = questions.filter((q) => {
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchQ = q.question.toLowerCase().includes(term);
      const matchCode = q.codeSnippet?.toLowerCase().includes(term);
      const matchTopic = q.topic.toLowerCase().includes(term);
      const matchExpl = q.explanation.toLowerCase().includes(term);
      return matchQ || matchCode || matchTopic || matchExpl;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-xl border border-slate-200 relative my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Extracted Question Bank ({questions.length} Total)
              </h2>
              <p className="text-xs text-slate-500">
                {documentName} • Browse, search, and study questions with answers and explanations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Topics ({questions.length})</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t} ({questions.filter((q) => q.topic === t).length})
                </option>
              ))}
            </select>

            <button
              onClick={revealAll}
              className="px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors whitespace-nowrap"
            >
              Show All Answers
            </button>
            <button
              onClick={hideAll}
              className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
            >
              Hide Answers
            </button>
          </div>
        </div>

        {/* List of questions */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
              No questions found matching your filter.
            </div>
          ) : (
            filtered.map((q, idx) => {
              const isRevealed = Boolean(revealedAnswers[q.id]);

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {q.topic}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Answer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>

                  {q.codeSnippet && (
                    <div className="rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto border border-slate-800">
                      <pre className="whitespace-pre">{q.codeSnippet}</pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => {
                      const isCorrect = opt.id === q.correctAnswer;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                            isRevealed && isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-300'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-md border flex items-center justify-center font-bold uppercase text-[10px] shrink-0">
                            {opt.id}
                          </span>
                          <span className="leading-tight">{opt.text}</span>
                          {isRevealed && isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isRevealed && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-slate-800 text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Explanation:</span>
                      </div>
                      <p className="leading-relaxed pl-5 text-slate-700">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
