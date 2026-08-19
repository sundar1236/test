import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Trash2, ChevronDown, ChevronUp, CheckCircle, BookOpen } from 'lucide-react';

export const BookmarkScreen: React.FC = () => {
  const { questions, bookmarks, toggleBookmark } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const bookmarkedQuestions = questions.filter((q) => bookmarks.includes(q.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Bookmarked Questions</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Review saved difficult, wrong, or revision questions anytime.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 fill-current" /> {bookmarkedQuestions.length} Saved
        </div>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
          <h3 className="font-bold text-base text-[var(--text-main)]">No bookmarks saved yet</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Click the bookmark icon on any question in the Question Bank or Mock Exams to save it here for revision.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedQuestions.map((q) => {
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold">
                      {q.exam}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[var(--text-main)]">
                      {q.section}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">• {q.topic}</span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(q.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>

                <p className="text-base font-semibold text-[var(--text-main)] leading-relaxed">
                  {q.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                        isExpanded && opt.id === q.correctOptionId
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-main)]'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>Hide Solution <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show Solution & Explanation <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                      <CheckCircle className="w-4 h-4" /> Correct Answer: Option {q.correctOptionId}
                    </div>
                    <p className="text-[var(--text-main)] leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
