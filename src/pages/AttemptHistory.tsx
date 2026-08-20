import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, CheckCircle2, ArrowRight, RotateCcw, Calendar, Search, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export const AttemptHistory: React.FC = () => {
  const { testAttempts } = useApp();
  const navigate = useNavigate();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter & Sort Logic
  const filteredAttempts = useMemo(() => {
    return testAttempts
      .filter((a) => {
        const matchesSearch = a.testTitle.toLowerCase().includes(search.toLowerCase());
        const matchesExam = selectedExam === 'All' || a.exam === selectedExam;
        return matchesSearch && matchesExam;
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') return b.score - a.score;
        if (sortBy === 'score_asc') return a.score - b.score;
        if (sortBy === 'date_asc') return new Date(a.dateCompleted).getTime() - new Date(b.dateCompleted).getTime();
        return new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime();
      });
  }, [testAttempts, search, selectedExam, sortBy]);

  const totalPages = Math.ceil(filteredAttempts.length / pageSize) || 1;
  const paginatedAttempts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAttempts.slice(start, start + pageSize);
  }, [filteredAttempts, currentPage, pageSize]);

  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Attempt History Repository</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Search, filter, sort, and inspect past SBI, IBPS, RBI, and RRB mock test scorecards.
          </p>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-xs flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Total Attempts: {testAttempts.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search attempt by test title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
          />
        </div>

        <div>
          <select
            value={selectedExam}
            onChange={(e) => { setSelectedExam(e.target.value); setCurrentPage(1); }}
            className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
          >
            <option value="All">All Exam Series</option>
            <option value="SBI Clerk">SBI Clerk</option>
            <option value="IBPS Clerk">IBPS Clerk</option>
            <option value="RBI Assistant">RBI Assistant</option>
            <option value="RRB Clerk">RRB Clerk</option>
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
          >
            <option value="date_desc">Sort by Recent Date</option>
            <option value="date_asc">Sort by Oldest Date</option>
            <option value="score_desc">Sort by Highest Score</option>
            <option value="score_asc">Sort by Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Attempts List */}
      {filteredAttempts.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-3">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-main)]">No matching attempts found</h3>
          <p className="text-xs text-[var(--text-muted)]">Try adjusting your exam filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedAttempts.map((attempt) => (
            <div
              key={attempt.attemptId}
              className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs hover:border-[#0F4C81]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold">
                    {attempt.exam}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {attempt.dateCompleted}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[var(--text-main)]">{attempt.testTitle}</h2>

                <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)] flex-wrap">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500" /> Score: <strong className="text-[var(--text-main)]">{attempt.score.toFixed(1)}/{attempt.maxScore}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Accuracy: <strong className="text-emerald-600">{attempt.accuracy.toFixed(1)}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#0F4C81]" /> Time: <strong className="text-[var(--text-main)]">{formatTimeSpent(attempt.timeSpentSeconds)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/results/${attempt.attemptId}`, { state: { result: attempt } })}
                  className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  View Scorecard <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate(`/mock-test/${attempt.testId}`)}
                  className="px-3 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold text-xs transition-colors"
                  title="Retake Mock Test"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-2 rounded-xl border border-[var(--border-color)] text-xs font-bold disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-2 rounded-xl border border-[var(--border-color)] text-xs font-bold disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
