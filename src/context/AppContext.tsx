import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Question, TestAttemptResult, UserProfile, ExamCategory } from '../types';
import { initialQuestions, sampleStudentProfile } from '../data/mockData';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface AppContextType {
  role: UserRole;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  bookmarks: string[];
  toggleBookmark: (questionId: string) => void;
  questions: Question[];
  addQuestion: (q: Question) => void;
  updateQuestionStatus: (id: string, status: 'approved' | 'rejected') => void;
  testAttempts: TestAttemptResult[];
  saveTestAttempt: (attempt: TestAttemptResult) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  supabaseSession: any;
  user: any;
  isLoadingAuth: boolean;
  signOut: () => Promise<void>;
  refreshProfile: (overrideUserId?: string) => Promise<UserRole>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [userProfile, setUserProfileState] = useState<UserProfile>(sampleStudentProfile);

  // Initialize and listen to Supabase Auth State
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (!isMounted) return;

        setSupabaseSession(session);
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setRole('guest');
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    };

    initAuth();

    // Listen to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setSupabaseSession(session);
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setRole('guest');
        setUserProfileState(sampleStudentProfile);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, authUser?: any): Promise<UserRole> => {
    try {
      const profile = await authService.getCurrentProfile(userId);
      let resolvedRole: UserRole = 'student';

      if (profile) {
        resolvedRole = (profile.role as UserRole) || 'student';
      } else if (authUser?.email === 'sundhar1301@gmail.com' || authUser?.user_metadata?.role === 'admin') {
        resolvedRole = 'admin';
      }

      setRole(resolvedRole);
      setUserProfileState({
        name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'User',
        email: profile?.email || authUser?.email || '',
        targetExam: 'SBI Clerk',
        joinedDate: new Date(profile?.created_at || Date.now()).toLocaleDateString(),
        testsTaken: 0,
        averageAccuracy: 0,
        allIndiaRank: 0,
      });

      return resolvedRole;
    } catch {
      setRole('student');
      return 'student';
    }
  };

  const refreshProfile = async (overrideUserId?: string): Promise<UserRole> => {
    const targetUserId = overrideUserId || user?.id;
    if (targetUserId) {
      return await loadUserProfile(targetUserId, user);
    }
    return role;
  };

  const handleSignOut = async () => {
    setIsLoadingAuth(true);
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setSupabaseSession(null);
      setUser(null);
      setRole('guest');
      setUserProfileState(sampleStudentProfile);
      setIsLoadingAuth(false);
    }
  };

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bank_app_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('bank_app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bank_app_bookmarks');
    return saved ? JSON.parse(saved) : ['q-quant-02', 'q-reason-01'];
  });

  const toggleBookmark = (questionId: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      localStorage.setItem('bank_app_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('bank_app_questions');
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const addQuestion = (newQ: Question) => {
    setQuestions((prev) => {
      const updated = [newQ, ...prev];
      localStorage.setItem('bank_app_questions', JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuestionStatus = (id: string, status: 'approved' | 'rejected') => {
    setQuestions((prev) => {
      const updated = prev.map((q) => (q.id === id ? { ...q, status } : q));
      localStorage.setItem('bank_app_questions', JSON.stringify(updated));
      return updated;
    });
  };

  // Test Attempts
  const [testAttempts, setTestAttempts] = useState<TestAttemptResult[]>(() => {
    const saved = localStorage.getItem('bank_app_test_attempts');
    if (saved) return JSON.parse(saved);

    const initialAttempt: TestAttemptResult = {
      attemptId: 'att-001',
      testId: 'test-sbi-clerk-full-01',
      testTitle: 'SBI Clerk Prelims All-India Live Mock',
      exam: 'SBI Clerk' as ExamCategory,
      dateCompleted: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
      timeSpentSeconds: 3120,
      totalQuestions: 100,
      attemptedQuestions: 88,
      correctAnswers: 76,
      wrongAnswers: 12,
      skippedQuestions: 12,
      score: 73.0,
      maxScore: 100,
      accuracy: 86.36,
      percentile: 94.2,
      sectionBreakdown: {
        'Quantitative Aptitude': {
          sectionId: 'Quantitative Aptitude',
          sectionName: 'Quantitative Aptitude',
          totalQuestions: 35,
          attempted: 31,
          correct: 27,
          incorrect: 4,
          skipped: 4,
          score: 26,
          maxScore: 35,
          accuracy: 87.1,
        },
        'Reasoning Ability': {
          sectionId: 'Reasoning Ability',
          sectionName: 'Reasoning Ability',
          totalQuestions: 35,
          attempted: 36,
          correct: 32,
          incorrect: 4,
          skipped: 0,
          score: 31,
          maxScore: 35,
          accuracy: 88.8,
        },
        'English Language': {
          sectionId: 'English Language',
          sectionName: 'English Language',
          totalQuestions: 30,
          attempted: 21,
          correct: 17,
          incorrect: 4,
          skipped: 9,
          score: 16,
          maxScore: 30,
          accuracy: 80.9,
        },
      },
      topicBreakdown: {
        'Percentage': { total: 5, correct: 5, accuracy: 100 },
        'Profit & Loss': { total: 6, correct: 4, accuracy: 66.6 },
        'Syllogism': { total: 5, correct: 5, accuracy: 100 },
        'Puzzles': { total: 10, correct: 8, accuracy: 80 },
        'Error Detection': { total: 5, correct: 3, accuracy: 60 },
      },
      userAnswers: {},
    };
    return [initialAttempt];
  });

  const saveTestAttempt = (attempt: TestAttemptResult) => {
    setTestAttempts((prev) => {
      const updated = [attempt, ...prev];
      localStorage.setItem('bank_app_test_attempts', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const newProfile = { ...prev, ...updated };
      localStorage.setItem('bank_app_user_profile', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        theme,
        toggleTheme,
        bookmarks,
        toggleBookmark,
        questions,
        addQuestion,
        updateQuestionStatus,
        testAttempts,
        saveTestAttempt,
        userProfile,
        updateUserProfile,
        supabaseSession,
        user,
        isLoadingAuth,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
