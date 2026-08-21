import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExamCategory, SubjectSection, DifficultyLevel } from '../types';
import { Search, Bookmark, ChevronDown, ChevronUp, CheckCircle, HelpCircle, Filter } from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { questions, bookmarks, toggleBookmark } = useApp();

  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.status && q.status !== 'approved') return false;

      const matchesSearch =
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase());

      const matchesExam = selectedExam === 'All' || q.exam === selectedExam;
      const matchesSection = selectedSection === 'All' || q.section === selectedSection;
      const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

      return matchesSearch && matchesExam && matchesSection && matchesDifficulty;
    });
  }, [questions, search, selectedExam, selectedSection, selectedDifficulty]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Banking Question Bank</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Explore and practice 7,000+ verified previous year questions and practice sets.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, keywords, or question text..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] outline-none focus:border-[#0F4C81] transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Exams</option>
              <option value="IBPS Clerk">IBPS Clerk</option>
              <option value="SBI Clerk">SBI Clerk</option>
              <option value="RBI Assistant">RBI Assistant</option>
              <option value="RRB Clerk">RRB Clerk</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Sections</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Reasoning Ability">Reasoning Ability</option>
              <option value="English Language">English Language</option>
              <option value="General & Banking Awareness">General & Banking Awareness</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
          <span>Showing {filteredQuestions.length} questions</span>
          <span>Updated for 2024 Pattern</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <HelpCircle className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
            <h3 className="font-bold text-base text-[var(--text-main)]">No questions match your filter</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try resetting search keywords or dropdown filters.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isBookmarked = bookmarks.includes(q.id);
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 transition-all hover:border-[#0F4C81]/30"
              >
                {/* Meta Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold">
                      {q.exam}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[var(--text-main)]">
                      {q.section}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">• {q.topic}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                      q.difficulty === 'Moderate' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-rose-500/10 text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(q.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isBookmarked
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Question Text */}
                <p className="text-base font-semibold text-[var(--text-main)] leading-relaxed">
                  {q.questionText}
                </p>

                {/* Options Grid */}
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

                {/* Answer / Explanation Toggle */}
                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>Hide Solution <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show Solution & Explanation <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {/* Explanation Box */}
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
          })
        )}
      </div>

    </div>
  );
};
