import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { ExamCategory } from '../types';
import { Mail, Calendar, Trophy, Save, CheckCircle2, Trash2, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { userProfile, updateUserProfile, signOut } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [targetExam, setTargetExam] = useState<ExamCategory>(userProfile.targetExam);
  const [isSaved, setIsSaved] = useState(false);

  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, targetExam });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (confirmText.toUpperCase() !== 'DELETE MY ACCOUNT PERMANENTLY') {
      setDeleteError('Confirmation phrase mismatch. Please type the exact confirmation text.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await authService.deleteAccount();
      setShowDeleteModal(false);
      await signOut();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Student Profile & Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your account information, target exam preferences, and security settings.
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

      {/* Danger Zone: Permanent Account Deletion */}
      <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-base">
          <ShieldAlert className="w-5 h-5 text-rose-600" /> Danger Zone: Permanent Account Deletion
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-400">
          Permanently delete your account and remove all personal test attempts, answer history, accuracy metrics, and saved bookmarks. Shared global question banks and live exams will remain unaffected.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete Account Permanently
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-[var(--text-main)]">Delete Your Account Permanently?</h3>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              This action is permanent and irreversible. All your personal mock test attempts, section accuracy records, bookmarks, and account profiles will be erased completely.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Type <span className="text-rose-600 font-mono">DELETE MY ACCOUNT PERMANENTLY</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT PERMANENTLY"
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-bold text-xs hover:bg-[var(--bg-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText.toUpperCase() !== 'DELETE MY ACCOUNT PERMANENTLY'}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
