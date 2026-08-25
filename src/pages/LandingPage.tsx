import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-16">

      {/* Hero Section */}
      <div className="pt-8 sm:pt-12 text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>India's #1 Premium Exam Preparation Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-main)] tracking-tight leading-tight">
          Ace Your <span className="text-[#0F4C81] dark:text-[#38BDF8]">Bank Clerk</span> Exams with Live NTA-Pattern Mocks
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto font-medium leading-relaxed">
          Prepare for <strong>SBI Clerk, IBPS Clerk, RBI Assistant, and RRB Clerk</strong> with 7,000+ validated questions, real-time section timers, step-by-step math explanations, and accuracy analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Go to Student Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Start Free Test Now
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-main)] font-bold text-sm transition-all"
              >
                Browse Questions
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Highlights Pill Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto px-4 text-center">
        {[
          { label: '7000+ Questions', detail: 'Latest 2024 Pattern' },
          { label: 'Previous Year Papers', detail: 'Detailed Step Solutions' },
          { label: 'Topic Wise Tests', detail: 'Quant, Reasoning, English' },
          { label: 'Full Mock Exams', detail: 'Real NTA Exam Simulator' },
          { label: 'Detailed Analytics', detail: 'Percentile & Speed Metrics' },
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
            <div className="font-extrabold text-xs text-[#0F4C81] dark:text-[#38BDF8]">{item.label}</div>
            <div className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">{item.detail}</div>
          </div>
        ))}
      </div>

      {/* Target Exam Series Cards */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-[var(--text-main)]">Supported Banking Examinations</h2>
          <p className="text-xs text-[var(--text-muted)]">Select your target exam to access full-length mock tests and sectional drills</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'SBI Clerk 2024', desc: 'Junior Associate Prelims & Mains Live Mocks', color: 'from-[#0F4C81] to-[#2563EB]' },
            { title: 'IBPS Clerk 2024', desc: 'Nationalized Bank Clerk Selection Pattern', color: 'from-blue-600 to-indigo-600' },
            { title: 'RBI Assistant 2024', desc: 'Reserve Bank High-Speed Test Drills', color: 'from-purple-600 to-indigo-700' },
            { title: 'RRB Clerk 2024', desc: 'Regional Rural Bank Office Assistant Mocks', color: 'from-emerald-600 to-teal-700' },
          ].map((exam, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-3 hover:border-[#0F4C81] transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${exam.color} text-white flex items-center justify-center font-black text-sm`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-main)]">{exam.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{exam.desc}</p>
              </div>

              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-main)] text-xs font-bold text-[var(--text-main)] transition-colors"
              >
                Explore Tests →
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
