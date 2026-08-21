import React from 'react';
import { initialMockTests } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, Trophy, Play } from 'lucide-react';

export const MockTestList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Full Mock Test Series</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Full 100-question timed exam simulations based on the latest 2024 IBPS, SBI, RBI, and RRB exam patterns.
        </p>
      </div>

      <div className="space-y-4">
        {initialMockTests.map((test) => (
          <div
            key={test.id}
            className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs hover:border-[#0F4C81]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold">
                  {test.exam}
                </span>
                {test.isFreeSample && (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                    Free Sample Test
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  • {test.attemptsCount.toLocaleString()} Aspirants Attempted
                </span>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-main)]">{test.title}</h2>

              <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> {test.durationMinutes} Minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> {test.totalQuestions} Questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> {test.totalMarks} Marks
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Sections:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.isArray(test.sections) && test.sections.map((sec, i) => {
                    const secLabel = typeof sec === 'string' ? sec : sec.sectionName;
                    return (
                      <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[var(--text-main)]">
                        {secLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
              <button
                onClick={() => navigate(`/mock-test/${test.id}`)}
                className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-[#0F4C81] hover:bg-[#0B3A64] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Take Test Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
