import React from 'react';
import { BookOpen, Upload, History, FileText, CheckCircle2 } from 'lucide-react';
import { DocumentCollection } from '../types';

interface HeaderProps {
  currentDoc: DocumentCollection;
  onOpenUpload: () => void;
  onOpenBank: () => void;
  onOpenHistory: () => void;
  onResetToHome: () => void;
  isSessionActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDoc,
  onOpenUpload,
  onOpenBank,
  onOpenHistory,
  onResetToHome,
  isSessionActive,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and title */}
        <div
          id="app-brand-logo"
          onClick={onResetToHome}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Exam Preparation Quiz Master
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                Verified PDF Content
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              {currentDoc.name} • {currentDoc.questions.length} questions
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="header-view-bank-btn"
            onClick={onOpenBank}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Browse all extracted questions from the uploaded PDF"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Browse Question Bank</span>
            <span className="sm:hidden">Bank</span>
          </button>

          <button
            id="header-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="View previous test attempts and scores"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            id="header-upload-doc-btn"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all hover:shadow"
            title="Upload another PDF or notes to generate custom quizzes"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
