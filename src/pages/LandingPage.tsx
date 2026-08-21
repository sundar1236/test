import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  FileText,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Target,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleStartFree = () => {
    setRole('student');
    navigate('/mock-tests');
  };

  const handleBrowseQuestions = () => {
    setRole('student');
    navigate('/questions');
  };

  const examCards = [
    {
      title: 'IBPS Clerk 2024',
      code: 'IBPS-CLERK',
      totalTests: '35+ Full Mocks',
      questions: '3500+ Practice Qs',
      badge: 'Popular',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'SBI Clerk 2024',
      code: 'SBI-CLERK',
      totalTests: '40+ Full Mocks',
      questions: '4000+ Practice Qs',
      badge: 'High Yield',
      color: 'from-sky-600 to-blue-700',
    },
    {
      title: 'RBI Assistant 2024',
      code: 'RBI-ASSIST',
      totalTests: '25+ Full Mocks',
      questions: '2500+ Practice Qs',
      badge: 'Premium',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'RRB Office Assistant',
      code: 'RRB-CLERK',
      totalTests: '30+ Full Mocks',
      questions: '3000+ Practice Qs',
      badge: 'Speed Special',
      color: 'from-amber-600 to-orange-600',
    },
  ];

  const heroStats = [
    { label: 'Practice Questions', value: '7,000+' },
    { label: 'Previous Year Papers', value: '10+ Years' },
    { label: 'Topic Wise Tests', value: '150+' },
    { label: 'Full Mock Exams', value: '50+' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-main)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> India's #1 Dedicated Banking Clerk Prep Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Crack <span className="text-[#0F4C81] dark:text-[#38BDF8]">Bank Clerk Exams</span> with Real Exam Precision.
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-muted)] font-normal leading-relaxed">
              Master IBPS Clerk, SBI Clerk, RBI Assistant, and RRB Clerk with exact exam simulations, instant analytics, weak-area targeting, and 7,000+ detailed solutions.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleStartFree}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-[#0F4C81] hover:bg-[#0B3A64] rounded-xl shadow-lg shadow-[#0F4C81]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Start Free Test <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleBrowseQuestions}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-[var(--text-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                Browse Questions <BookOpen className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" />
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {heroStats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
                  <div className="text-2xl font-extrabold text-[#0F4C81] dark:text-[#38BDF8]">{stat.value}</div>
                  <div className="text-xs font-medium text-[var(--text-muted)] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Exam Categories Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">Targeted Exam Coverage</h2>
          <p className="text-[var(--text-muted)] mt-2">Comprehensive test series designed around latest pattern updates and difficulty levels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examCards.map((exam, idx) => (
            <div
              key={idx}
              className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 hover:shadow-xl hover:border-[#0F4C81]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold text-white bg-gradient-to-r ${exam.color} rounded-full`}>
                    {exam.badge}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">{exam.code}</span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-main)] group-hover:text-[#0F4C81] transition-colors">
                  {exam.title}
                </h3>

                <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{exam.totalTests}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{exam.questions}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Sectional & Full Length</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartFree}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8] bg-[#0F4C81]/10 hover:bg-[#0F4C81] hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                Attempt Demo Test <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 bg-[var(--bg-card)] border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-main)]">Engineered For Exam Success</h2>
            <p className="text-[var(--text-muted)] mt-2">Every feature is designed to reduce exam anxiety and maximize accuracy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Real Exam Interface</h3>
              <p className="text-sm text-[var(--text-muted)]">Exact replicate of actual banking exam interface with timed section locks, palette indicators, and auto-submit.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Instant Performance Analytics</h3>
              <p className="text-sm text-[var(--text-muted)]">Get immediate score calculation, accuracy percentages, percentile estimates, and topic-wise weak area mapping.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Curated Solution Explanations</h3>
              <p className="text-sm text-[var(--text-muted)]">Step-by-step verified explanations and shortcut techniques for Quantitative and Reasoning questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-[#0F4C81] to-[#2563EB] text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Ace Your Banking Clerk Exam?</h2>
          <p className="text-blue-100 max-w-xl mx-auto text-base">Join thousands of successful aspirants practicing daily with our high-yield mock series.</p>
          <button
            onClick={handleStartFree}
            className="px-8 py-3.5 bg-white text-[#0F4C81] font-extrabold rounded-xl shadow-lg hover:bg-slate-100 transition-all inline-flex items-center gap-2"
          >
            Start Free Practice Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card)] py-8 text-center text-xs text-[var(--text-muted)]">
        <p>© 2024 BankClerk Mock Test Platform. Built with React + TypeScript + Tailwind CSS.</p>
      </footer>

    </div>
  );
};
