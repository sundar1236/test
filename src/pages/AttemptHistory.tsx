import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Calendar, FileText } from 'lucide-react';

export const AttemptHistory: React.FC = () => {
  const { testAttempts } = useApp();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(testAttempts.length / pageSize) || 1;
  const paginatedAttempts = testAttempts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Attempt History</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Review past mock test attempts, scores, accuracy breakdowns, and solution keys.
          </p>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-xs flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Total Attempts: {testAttempts.length}</span>
        </div>
      </div>

      {/* Attempts List */}
      {testAttempts.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[var(--text-main)]">No mock test attempts recorded yet</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">Start practicing with SBI, IBPS, RBI, or RRB mock tests.</p>
          <button
            onClick={() => navigate('/mock-tests')}
            className="px-5 py-2.5 rounded-xl bg-[#0F4C81] text-white font-bold text-xs"
          >
            Explore Mock Tests
          </button>
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
        </div>
      )}
    </div>
  );
};
