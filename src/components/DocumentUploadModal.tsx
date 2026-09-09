import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { DocumentCollection, QuizQuestion } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: DocumentCollection) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'text'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!docName) {
        setDocName(selected.name.replace('.pdf', ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf' && !droppedFile.name.endsWith('.pdf')) {
        setError('Please drop a valid PDF file.');
        return;
      }
      setFile(droppedFile);
      setError(null);
      if (!docName) {
        setDocName(droppedFile.name.replace('.pdf', ''));
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:application/pdf;base64, prefix
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let payload: any = {
        numQuestions,
      };

      if (activeTab === 'pdf') {
        if (!file) {
          throw new Error('Please select a PDF file.');
        }
        const pdfBase64 = await fileToBase64(file);
        payload.pdfBase64 = pdfBase64;
      } else {
        if (!textContent.trim()) {
          throw new Error('Please enter text or notes content.');
        }
        payload.textContent = textContent;
      }

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to extract practice questions');
      }

      const questions: QuizQuestion[] = json.data.questions.map((q: any, i: number) => ({
        id: `custom-q-${Date.now()}-${i}`,
        question: q.question,
        codeSnippet: q.codeSnippet || undefined,
        options: q.options,
        correctAnswer: q.correctAnswer.toLowerCase(),
        explanation: q.explanation,
        topic: q.topic || 'General',
      }));

      const topics = Array.from(new Set(questions.map((q) => q.topic)));
      const newDoc: DocumentCollection = {
        id: `doc-${Date.now()}`,
        name: docName.trim() || json.data.title || (file ? file.name : 'Custom Study Material'),
        description: json.data.summary || 'Custom practice set based strictly on uploaded content.',
        itemCount: questions.length,
        isBuiltIn: false,
        topics,
        questions,
      };

      onDocumentAdded(newDoc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload Exam Content</h2>
            <p className="text-xs text-slate-500">
              Practice questions are generated strictly from your uploaded content ONLY.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pdf'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PDF File Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste Text / Notes
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'pdf' ? (
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3 text-indigo-700">
                    <FileText className="w-8 h-8" />
                    <div className="text-left">
                      <span className="text-xs font-bold block">{file.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Click to choose or drag & drop a PDF
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Exam guides, lecture slides, question banks, or notes
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Paste Document Text
              </label>
              <textarea
                rows={5}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste questions, study guide chapters, or syllabus text here..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Document Label / Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Practice Exam"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Practice Questions to Extract
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    numQuestions === num
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              id="submit-upload-doc-btn"
              type="submit"
              disabled={isLoading || (activeTab === 'pdf' && !file) || (activeTab === 'text' && !textContent.trim())}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Content Strictly...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Practice Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
