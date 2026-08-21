import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExamCategory } from '../types';
import { User, Mail, Calendar, Trophy, Target, Save, CheckCircle2 } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { userProfile, updateUserProfile } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [targetExam, setTargetExam] = useState<ExamCategory>(userProfile.targetExam);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, targetExam });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Student Profile</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your account information, exam target preferences, and study metrics.
        </p>
      </div>

      {/* Main Profile Details Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#2563EB] text-white flex items-center justify-center font-extrabold text-3xl shadow-md shrink-0">
          {userProfile.name.charAt(0)}
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-[var(--text-main)]">{userProfile.name}</h2>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
              Active Student
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" /> {userProfile.email}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0F4C81] dark:text-[#38BDF8]" /> Joined {userProfile.joinedDate}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Rank #{userProfile.globalRank}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Settings Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[var(--text-main)]">Account Settings & Target Preferences</h3>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">Primary Target Exam</label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value as ExamCategory)}
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
            >
              <option value="SBI Clerk">SBI Clerk 2024</option>
              <option value="IBPS Clerk">IBPS Clerk 2024</option>
              <option value="RBI Assistant">RBI Assistant 2024</option>
              <option value="RRB Clerk">RRB Office Assistant 2024</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
