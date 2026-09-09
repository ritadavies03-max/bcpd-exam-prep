import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Shuffle, 
  Layers, 
  Play, 
  HelpCircle, 
  GraduationCap, 
  AlertCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { DocumentCollection, QuizFilterConfig, QuizMode } from '../types';
import { getMissedQuestionIds } from '../utils/storage';

interface QuizConfigProps {
  documents: DocumentCollection[];
  selectedDoc: DocumentCollection;
  onSelectDoc: (doc: DocumentCollection) => void;
  onStartQuiz: (config: QuizFilterConfig, questionSubset?: string[]) => void;
  onOpenUpload: () => void;
  onOpenBank: () => void;
}

export const QuizConfig: React.FC<QuizConfigProps> = ({
  documents,
  selectedDoc,
  onSelectDoc,
  onStartQuiz,
  onOpenUpload,
  onOpenBank,
}) => {
  const [mode, setMode] = useState<QuizMode>('study');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);
  const [timed, setTimed] = useState<boolean>(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);

  const missedQuestionIds = getMissedQuestionIds();
  const availableMissedInDoc = selectedDoc.questions.filter((q) =>
    missedQuestionIds.includes(q.id)
  );

  // Filter pool based on topic
  const filteredPool = selectedTopic === 'all'
    ? selectedDoc.questions
    : selectedDoc.questions.filter((q) => q.topic === selectedTopic);

  const maxQuestions = filteredPool.length;
  const effectiveCount = Math.min(questionCount, maxQuestions);

  const handleStart = () => {
    onStartQuiz({
      mode,
      topic: selectedTopic,
      questionCount: effectiveCount,
      shuffleQuestions,
      shuffleOptions,
      timed: mode === 'exam' ? timed : false,
      timeLimitMinutes,
    });
  };

  const handleStartWeakSpots = () => {
    if (availableMissedInDoc.length === 0) return;
    onStartQuiz(
      {
        mode: 'study',
        topic: 'all',
        questionCount: availableMissedInDoc.length,
        shuffleQuestions: true,
        shuffleOptions: false,
        timed: false,
        timeLimitMinutes: 15,
      },
      availableMissedInDoc.map((q) => q.id)
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Overview */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Grounded Strictly in Uploaded PDF Content
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Python Exam Preparation Practice
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          Generate custom practice quizzes and simulated exams based strictly on the uploaded document.
          Review correct answers, wrong answers, and comprehensive explanations after each session.
        </p>
      </div>

      {/* Document Selector Pill if multiple docs exist */}
      {documents.length > 1 && (
        <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Source Document
            </span>
            <span className="text-sm font-bold text-slate-800">
              {selectedDoc.name} ({selectedDoc.questions.length} questions)
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              id="doc-selector-dropdown"
              value={selectedDoc.id}
              onChange={(e) => {
                const doc = documents.find((d) => d.id === e.target.value);
                if (doc) onSelectDoc(doc);
              }}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.questions.length} Qs)
                </option>
              ))}
            </select>
            <button
              id="doc-upload-more-btn"
              onClick={onOpenUpload}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-2 hover:underline whitespace-nowrap"
            >
              + Upload More
            </button>
          </div>
        </div>
      )}

      {/* Missed Questions Callout if any */}
      {availableMissedInDoc.length > 0 && (
        <div className="mb-8 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Target Your Weak Areas ({availableMissedInDoc.length} Missed Questions)
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                You previously missed {availableMissedInDoc.length} question{availableMissedInDoc.length > 1 ? 's' : ''} from this PDF. Review them now to reinforce your understanding.
              </p>
            </div>
          </div>
          <button
            id="start-weak-spots-btn"
            onClick={handleStartWeakSpots}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Retake Missed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Step 1: Mode Selection */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            1. Select Session Mode
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Study Mode */}
            <div
              id="mode-card-study"
              onClick={() => setMode('study')}
              role="button"
              tabIndex={0}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                mode === 'study'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mode === 'study' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Study & Practice Mode</h3>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  mode === 'study' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                }`}>
                  {mode === 'study' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive <strong className="text-slate-800">instant feedback</strong> after each answer with the in-depth explanation right away. Perfect for learning and mastering concepts step by step.
              </p>
            </div>

            {/* Exam Simulation Mode */}
            <div
              id="mode-card-exam"
              onClick={() => setMode('exam')}
              role="button"
              tabIndex={0}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                mode === 'exam'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mode === 'exam' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Exam Simulation Mode</h3>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  mode === 'exam' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                }`}>
                  {mode === 'exam' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simulates official test conditions. Answers remain hidden until final submission. Includes question flagging, palette navigation, and full post-exam review.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Topic Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-900">
              2. Filter by Topic / Section
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {filteredPool.length} questions available
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              id="topic-pill-all"
              type="button"
              onClick={() => setSelectedTopic('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedTopic === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Topics ({selectedDoc.questions.length})
            </button>
            {selectedDoc.topics.map((topic) => {
              const count = selectedDoc.questions.filter((q) => q.topic === topic).length;
              return (
                <button
                  key={topic}
                  id={`topic-pill-${topic.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedTopic === topic
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {topic} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Question Count */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-900">
              3. Number of Questions
            </label>
            <span className="text-xs font-bold text-indigo-600">
              {effectiveCount} questions selected
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[5, 10, 15, 20, 30, maxQuestions].map((cnt, idx) => {
              const isAll = idx === 5;
              const isSelected = isAll ? questionCount >= maxQuestions : questionCount === cnt;
              return (
                <button
                  key={idx}
                  id={`count-btn-${isAll ? 'all' : cnt}`}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {isAll ? `All (${maxQuestions})` : `${cnt} Qs`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Options & Settings */}
        <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Session Customization
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                id="toggle-shuffle-questions"
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Shuffle Questions Order
                </span>
                <span className="text-[11px] text-slate-500">
                  Randomize question order each attempt
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                id="toggle-shuffle-options"
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Shuffle Answer Choices
                </span>
                <span className="text-[11px] text-slate-500">
                  Randomize order of options A, B, C, D
                </span>
              </div>
            </label>

            {mode === 'exam' && (
              <label className="flex items-center gap-3 cursor-pointer sm:col-span-2 pt-2 border-t border-slate-200">
                <input
                  id="toggle-timer"
                  type="checkbox"
                  checked={timed}
                  onChange={(e) => setTimed(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Timed Exam Countdown
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Add time constraint to simulate official testing limits
                  </span>
                </div>
                {timed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Math.max(1, parseInt(e.target.value) || 10))}
                      className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-600">min</span>
                  </div>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Start Button & Quick Bank Link */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            id="start-quiz-session-btn"
            onClick={handleStart}
            className="w-full sm:flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            <Play className="w-5 h-5 fill-current group-hover:translate-x-0.5 transition-transform" />
            <span>
              {mode === 'study' ? 'Start Practice Session' : 'Start Exam Simulation'} ({effectiveCount} Questions)
            </span>
          </button>

          <button
            id="browse-bank-config-btn"
            onClick={onOpenBank}
            type="button"
            className="w-full sm:w-auto px-5 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-2xl transition-colors whitespace-nowrap"
          >
            Browse Full Bank ({selectedDoc.questions.length})
          </button>
        </div>
      </div>
    </div>
  );
};
