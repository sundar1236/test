import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Question, TestAttemptResult, UserProfile, ExamCategory } from '../types';
import { initialQuestions, sampleStudentProfile } from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  bookmarks: string[]; // question ids
  toggleBookmark: (questionId: string) => void;
  questions: Question[];
  addQuestion: (q: Question) => void;
  updateQuestionStatus: (id: string, status: 'approved' | 'rejected') => void;
  testAttempts: TestAttemptResult[];
  saveTestAttempt: (attempt: TestAttemptResult) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Role State
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('bank_app_role') as UserRole) || 'student';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('bank_app_role', newRole);
  };

  // 2. Theme State
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

  // 3. Bookmarks State
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

  // 4. Questions Management State
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

  // 5. Test Attempts State
  const [testAttempts, setTestAttempts] = useState<TestAttemptResult[]>(() => {
    const saved = localStorage.getItem('bank_app_test_attempts');
    if (saved) return JSON.parse(saved);

    // Initial mock completed attempt
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
        'Quantitative Aptitude': { score: 26, total: 35, correct: 27, wrong: 4 },
        'Reasoning Ability': { score: 31, total: 35, correct: 32, wrong: 4 },
        'English Language': { score: 16, total: 30, correct: 17, wrong: 4 },
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

  // 6. User Profile State
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bank_app_user_profile');
    return saved ? JSON.parse(saved) : sampleStudentProfile;
  });

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
        setRole,
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
