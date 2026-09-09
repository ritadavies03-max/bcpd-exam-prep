import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  ArrowLeft, 
  Search, 
  Code, 
  Lightbulb, 
  Clock, 
  BarChart3, 
  ChevronDown, 
  ChevronUp,
  Share2,
  Printer,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizResultSummary, QuestionReviewItem, TopicBreakdown } from '../types';

interface QuizResultsProps {
  result: QuizResultSummary;
  onRetakeAll: () => void;
  onRetakeMissed: () => void;
  onBackToConfig: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onRetakeAll,
  onRetakeMissed,
  onBackToConfig,
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Confetti if score is >= 70%
  useEffect(() => {
    if (result.scorePercent >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [result.scorePercent]);

  const toggleExpand = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    result.questionsReview.forEach((item) => {
      all[item.question.id] = true;
    });
    setExpandedQuestions(all);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  // Filter questions
  const filteredReviewItems = result.questionsReview.filter((item) => {
    if (filter === 'incorrect' && item.isCorrect) return false;
    if (filter === 'correct' && !item.isCorrect) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesQ = item.question.question.toLowerCase().includes(q);
      const matchesTopic = item.question.topic.toLowerCase().includes(q);
      const matchesCode = item.question.codeSnippet?.toLowerCase().includes(q);
      const matchesExpl = item.question.explanation.toLowerCase().includes(q);
      return matchesQ || matchesTopic || matchesCode || matchesExpl;
    }

    return true;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner Scorecard */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-inner ${
                result.passed
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              {result.passed ? (
                <Trophy className="w-10 h-10" />
              ) : (
                <AlertCircle className="w-10 h-10" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                    result.passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {result.passed ? 'Passed Benchmark' : 'Needs Practice'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(result.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Session Completed: {result.scorePercent}% Score
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {result.documentName} • {result.mode === 'study' ? 'Practice Mode' : 'Exam Simulation'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 text-center">
              <span className="text-xl font-extrabold text-emerald-700 block">
                {result.correctCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Correct
              </span>
            </div>
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 text-center">
              <span className="text-xl font-extrabold text-rose-700 block">
                {result.wrongCount}
              </span>
              <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
                Incorrect
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-xl font-extrabold text-slate-700 block">
                {formatTime(result.timeTakenSeconds)}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Duration
              </span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown Bars */}
        {Object.keys(result.topicStats).length > 0 && (
          <div className="py-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Performance by Topic
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(result.topicStats) as [string, TopicBreakdown][]).map(([topic, stat]) => (
                <div key={topic} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="truncate pr-2">{topic}</span>
                    <span>
                      {stat.correct}/{stat.total} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stat.percentage >= 80
                          ? 'bg-emerald-500'
                          : stat.percentage >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            id="results-back-config-btn"
            onClick={onBackToConfig}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>New Practice Session</span>
          </button>

          <div className="flex items-center gap-2.5">
            {result.wrongCount > 0 && (
              <button
                id="results-retake-missed-btn"
                onClick={onRetakeMissed}
                className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Missed Only ({result.wrongCount})</span>
              </button>
            )}

            <button
              id="results-retake-all-btn"
              onClick={onRetakeAll}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Full Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Answers & Explanations Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Detailed Question Review & Explanations
            </h2>
            <p className="text-xs text-slate-500">
              Review every answer with the official explanations grounded in the uploaded document.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAll}
              className="text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAll}
              className="text-slate-500 hover:text-slate-700 font-semibold px-2 py-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              id="filter-all-btn"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({result.totalQuestions})
            </button>
            <button
              id="filter-incorrect-btn"
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'incorrect'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Incorrect ({result.wrongCount})
            </button>
            <button
              id="filter-correct-btn"
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Correct ({result.correctCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="results-search-input"
              type="text"
              placeholder="Search in questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Questions Review List */}
        {filteredReviewItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No questions found matching your filter criteria.
            </p>
          </div>
        ) : (
          filteredReviewItems.map((item, index) => {
            const isExpanded = expandedQuestions[item.question.id] !== false; // default expanded
            const isCorrect = item.isCorrect;
            const hasAnswered = item.selectedAnswer !== null;

            return (
              <div
                key={item.question.id}
                id={`review-item-${item.question.id}`}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isCorrect
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Review Header Bar */}
                <div
                  onClick={() => toggleExpand(item.question.id)}
                  className="p-5 cursor-pointer flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          Q{index + 1}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {item.question.topic}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isCorrect ? 'Correct' : hasAnswered ? 'Incorrect' : 'Unanswered'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">
                        {item.question.question}
                      </h3>
                    </div>
                  </div>

                  <button className="text-slate-400 p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-1 border-t border-slate-100 space-y-4">
                    {/* Full Question Text */}
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {item.question.question}
                    </p>

                    {/* Code Snippet if any */}
                    {item.question.codeSnippet && (
                      <div className="rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto border border-slate-800">
                        <pre className="whitespace-pre">{item.question.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Options Breakdown */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Answer Options:
                      </span>
                      {item.question.options.map((opt) => {
                        const isCorrectOpt = opt.id === item.question.correctAnswer;
                        const isUserSelected = opt.id === item.selectedAnswer;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        let badge = null;

                        if (isCorrectOpt) {
                          style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                          badge = (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md ml-auto">
                              Correct Answer
                            </span>
                          );
                        } else if (isUserSelected && !isCorrectOpt) {
                          style = 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-300';
                          badge = (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md ml-auto">
                              Your Choice (Wrong)
                            </span>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-3 ${style}`}
                          >
                            <span className="w-5 h-5 rounded-lg border flex items-center justify-center font-bold uppercase shrink-0 text-xs">
                              {opt.id}
                            </span>
                            <span className="leading-snug">{opt.text}</span>
                            {badge}
                          </div>
                        );
                      })}
                    </div>

                    {/* Appropriate Explanation from PDF */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-slate-900">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Lightbulb className="w-4 h-4 text-indigo-700 shrink-0" />
                        <span className="font-bold text-xs sm:text-sm text-indigo-950">
                          Official Explanation:
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6">
                        {item.question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
