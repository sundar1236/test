import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { BookOpen, Mail, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(email.trim());
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-main)]">
      <div className="max-w-md w-full space-y-8 bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-color)] shadow-xl">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#2563EB] items-center justify-center text-white shadow-lg">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              Password Reset Email Sent!
            </div>
            <p>
              Check your inbox for instructions to reset your password. If you don't see it, check your spam folder.
            </p>
            <div className="pt-2">
              <Link to="/login" className="font-bold underline text-emerald-900 dark:text-emerald-200">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-main)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0F4C81] hover:bg-[#0B3A64] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-[var(--text-muted)]">
              Remembered your password?{' '}
              <Link to="/login" className="font-bold text-[#0F4C81] dark:text-[#38BDF8] hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
