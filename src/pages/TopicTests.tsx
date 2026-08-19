import React from 'react';
import { initialTopicMetas } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Play, CheckCircle2, Award, Clock } from 'lucide-react';

export const TopicTests: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Topic-Wise Practice Tests</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Target specific weak areas with focused 10-15 minute subject quizzes.
        </p>
      </div>

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialTopicMetas.map((topic) => (
          <div
            key={topic.id}
            className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between hover:border-[#0F4C81]/40 transition-all group"
          >
            <div className="space-y-4">

              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8]">
                  {topic.section}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  topic.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                  topic.difficulty === 'Moderate' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-rose-500/10 text-rose-600'
                }`}>
                  {topic.difficulty}
                </span>
              </div>

              {/* Title & Counts */}
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-[#0F4C81] transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-medium">
                  <span>{topic.questionCount} Questions</span>
                  <span>•</span>
                  <span>{topic.testsCount} Tests Available</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Completion Rate</span>
                  <span className="font-bold font-mono text-[var(--text-main)]">{topic.completionPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0F4C81] to-[#2563EB] rounded-full transition-all"
                    style={{ width: `${topic.completionPercent}%` }}
                  />
                </div>
              </div>

              {topic.lastAttemptDate && (
                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Last Attempt: {topic.lastAttemptDate}
                </div>
              )}

            </div>

            <button
              onClick={() => navigate(`/mock-test/test-ibps-clerk-full-01`)}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3A64] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Topic Test
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
