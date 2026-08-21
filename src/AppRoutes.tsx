import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { StudentDashboard } from './pages/StudentDashboard';
import { QuestionBank } from './pages/QuestionBank';
import { TopicTests } from './pages/TopicTests';
import { MockTestList } from './pages/MockTestList';
import { ExamSimulatorScreen } from './pages/ExamSimulatorScreen';
import { ResultScreen } from './pages/ResultScreen';
import { PerformanceAnalytics } from './pages/PerformanceAnalytics';
import { PracticeModeScreen } from './pages/PracticeModeScreen';
import { BookmarkScreen } from './pages/BookmarkScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { AttemptHistory } from './pages/AttemptHistory';
import { AdminDashboard } from './pages/AdminDashboard';
import { QuestionManagement } from './pages/QuestionManagement';
import { CategoryManagement } from './pages/CategoryManagement';
import { ValidationQueue } from './pages/ValidationQueue';
import { AuditLogScreen } from './pages/AuditLogScreen';
import { DesignSystemDoc } from './pages/DesignSystemDoc';

// Admin Import Center Components
import { ImportDashboard } from './components/admin/import/ImportDashboard';
import { CSVImport } from './components/admin/import/CSVImport';
import { JSONImport } from './components/admin/import/JSONImport';
import { ImportHistory } from './components/admin/import/ImportHistory';
import { DuplicateReview } from './components/admin/import/DuplicateReview';
import { Loader2 } from 'lucide-react';

export const AppRoutes: React.FC = () => {
  const { role, isLoadingAuth } = useApp();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
        <span className="text-sm font-semibold text-[var(--text-muted)]">Verifying session security...</span>
      </div>
    );
  }

  const isAdminOrReviewer = role === 'admin' || role === 'super_admin' || role === 'question_reviewer';
  const isAuthenticated = role !== 'guest';

  return (
    <Routes>
      {/* Full screen exam simulator route without sidebar layout */}
      <Route
        path="/mock-test/:testId"
        element={!isAuthenticated ? <Navigate to="/login" replace /> : <ExamSimulatorScreen />}
      />
      <Route
        path="/exam/:testId"
        element={!isAuthenticated ? <Navigate to="/login" replace /> : <ExamSimulatorScreen />}
      />

      {/* Main Layout routes */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/design-system" element={<DesignSystemDoc />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <StudentDashboard />}
        />
        <Route
          path="/questions"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <QuestionBank />}
        />
        <Route
          path="/topics"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <TopicTests />}
        />
        <Route
          path="/mock-tests"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <MockTestList />}
        />
        <Route
          path="/results/:attemptId"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <ResultScreen />}
        />
        <Route
          path="/attempts"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <AttemptHistory />}
        />
        <Route
          path="/performance"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <PerformanceAnalytics />}
        />
        <Route
          path="/practice"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <PracticeModeScreen />}
        />
        <Route
          path="/bookmarks"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <BookmarkScreen />}
        />
        <Route
          path="/profile"
          element={!isAuthenticated ? <Navigate to="/login" replace /> : <ProfileScreen />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <AdminDashboard />}
        />
        <Route
          path="/admin/questions"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <QuestionManagement />}
        />
        <Route
          path="/admin/categories"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <CategoryManagement />}
        />
        <Route
          path="/admin/tests"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <AdminDashboard />}
        />
        <Route
          path="/admin/validation"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <ValidationQueue />}
        />
        <Route
          path="/admin/analytics"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <AuditLogScreen />}
        />

        {/* Admin Bulk Import Sub-routes */}
        <Route
          path="/admin/import"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <ImportDashboard />}
        />
        <Route
          path="/admin/import/csv"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <CSVImport />}
        />
        <Route
          path="/admin/import/json"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <JSONImport />}
        />
        <Route
          path="/admin/import/history"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <ImportHistory />}
        />
        <Route
          path="/admin/import/duplicates"
          element={!isAdminOrReviewer ? <Navigate to="/dashboard" replace /> : <DuplicateReview />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
