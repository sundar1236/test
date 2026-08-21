import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, X, Edit3, Sparkles, AlertCircle, FileCheck2, MessageSquare, Send } from 'lucide-react';

export const ValidationQueue: React.FC = () => {
  const { questions, updateQuestionStatus } = useApp();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const pendingQuestions = questions.filter((q) => q.status === 'pending' || q.status === 'under_review' || q.status === 'draft');

  const handleNoteChange = (id: string, text: string) => {
    setReviewNotes((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Review & Validation Workflow Queue</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Audit draft & under-review questions, compare source vs. AI answers, leave reviewer comments, and publish live.
        </p>
      </div>

      {pendingQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-emerald-500" />
          <h3 className="font-bold text-base text-[var(--text-main)]">Review queue is completely clear!</h3>
          <p className="text-xs text-[var(--text-muted)]">
            All submitted banking questions have been audited, validated, and published to active mock test series.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingQuestions.map((q) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4"
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold">
                    {q.exam}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[var(--text-main)]">
                    {q.section}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">• {q.topic}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-extrabold uppercase">
                    {q.status || 'Under Review'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" /> AI Confidence: {q.aiConfidence || 92}%
                </div>
              </div>

              {/* Question Text */}
              <p className="text-base font-semibold text-[var(--text-main)]">
                {q.questionText}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-2.5 rounded-lg border ${
                      opt.id === q.correctOptionId
                        ? 'border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400'
                        : 'border-[var(--border-color)] bg-[var(--bg-main)]'
                    }`}
                  >
                    <span className="font-bold text-[#0F4C81] dark:text-[#38BDF8] mr-2">{opt.id}.</span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>

              {/* Answer Comparison Box */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Imported Source Answer:</span>
                  <div className="mt-1 font-extrabold text-amber-600 text-sm">
                    Option {q.sourceAnswer || q.correctOptionId}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" /> AI Suggested Answer:
                  </span>
                  <div className="mt-1 font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                    Option {q.aiSuggestedAnswer || q.correctOptionId}
                  </div>
                </div>
              </div>

              {/* Reviewer Note Input */}
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Reviewer Audit Note / Comment
                </label>
                <input
                  type="text"
                  placeholder="Enter changes requested or audit approval note..."
                  value={reviewNotes[q.id] || ''}
                  onChange={(e) => handleNoteChange(q.id, e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => updateQuestionStatus(q.id, 'rejected')}
                  className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Request Changes / Reject
                </button>
                <button
                  onClick={() => updateQuestionStatus(q.id, 'approved')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve & Publish Live
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
