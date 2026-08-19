import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { initialMockTests, initialQuestions } from '../data/mockData';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  FileSpreadsheet,
  BarChart2
} from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { testAttempts } = useApp();

  const attempt = useMemo(() => {
    return testAttempts.find((a) => a.attemptId === attemptId) || testAttempts[0];
  }, [testAttempts, attemptId]);

  if (!attempt) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold">Attempt not found</h2>
        <Link to="/dashboard" className="text-xs text-[#0F4C81] underline mt-2 block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0F4C81] to-[#2563EB] text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="px-3 py-1 rounded-lg bg-white/15 text-xs font-bold uppercase tracking-wider">
            {attempt.exam} Result Report
          </span>
          <span className="text-xs text-blue-100 font-medium">{attempt.dateCompleted}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold">{attempt.testTitle}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20">
          <div>
            <div className="text-xs text-blue-100 font-semibold uppercase">Total Score</div>
            <div className="text-3xl font-extrabold font-mono mt-0.5">
              {attempt.score.toFixed(1)} <span className="text-xs font-normal text-blue-200">/ {attempt.maxScore}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-blue-100 font-semibold uppercase">Accuracy Rate</div>
            <div className="text-3xl font-extrabold font-mono mt-0.5">{attempt.accuracy.toFixed(1)}%</div>
          </div>

          <div>
            <div className="text-xs text-blue-100 font-semibold uppercase">Estimated Percentile</div>
            <div className="text-3xl font-extrabold font-mono mt-0.5">{attempt.percentile}%ile</div>
          </div>

          <div>
            <div className="text-xs text-blue-100 font-semibold uppercase">Time Spent</div>
            <div className="text-2xl font-extrabold font-mono mt-1">{formatTimeSpent(attempt.timeSpentSeconds)}</div>
          </div>
        </div>
      </div>

      {/* Answer Distribution Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Attempted</div>
            <div className="text-xl font-extrabold text-[var(--text-main)]">{attempt.attemptedQuestions} / {attempt.totalQuestions}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Correct</div>
            <div className="text-xl font-extrabold text-emerald-600">{attempt.correctAnswers}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Wrong</div>
            <div className="text-xl font-extrabold text-rose-600">{attempt.wrongAnswers}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Skipped</div>
            <div className="text-xl font-extrabold text-[var(--text-main)]">{attempt.skippedQuestions}</div>
          </div>
        </div>
      </div>

      {/* Section Performance Table */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-main)]">Sectional Breakdown Analysis</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Section Name</th>
                <th className="py-3 px-4">Total Qs</th>
                <th className="py-3 px-4 text-emerald-600">Correct</th>
                <th className="py-3 px-4 text-rose-600">Wrong</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-semibold text-[var(--text-main)]">
              {Object.entries(attempt.sectionBreakdown).map(([secName, secData]) => {
                const totalAns = secData.correct + secData.wrong;
                const secAcc = totalAns > 0 ? (secData.correct / totalAns) * 100 : 0;
                return (
                  <tr key={secName} className="hover:bg-[var(--bg-main)]">
                    <td className="py-3.5 px-4 font-bold">{secName}</td>
                    <td className="py-3.5 px-4">{secData.total}</td>
                    <td className="py-3.5 px-4 text-emerald-600">{secData.correct}</td>
                    <td className="py-3.5 px-4 text-rose-600">{secData.wrong}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{secData.score.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-[#0F4C81] dark:text-[#38BDF8]">
                      {secAcc.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back To Dashboard
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/questions')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            Review Solutions
          </button>
          <button
            onClick={() => navigate(`/mock-test/${attempt.testId}`)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#0F4C81] text-[#0F4C81] dark:text-[#38BDF8] font-bold text-xs hover:bg-[#0F4C81]/10 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retake Test
          </button>
        </div>
      </div>

    </div>
  );
};
