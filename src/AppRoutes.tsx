import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { QuestionBank } from './pages/QuestionBank';
import { TopicTests } from './pages/TopicTests';
import { MockTestList } from './pages/MockTestList';
import { ExamSimulatorScreen } from './pages/ExamSimulatorScreen';
import { ResultScreen } from './pages/ResultScreen';
import { PerformanceAnalytics } from './pages/PerformanceAnalytics';
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

export const AppRoutes: React.FC = () => {
  const { role } = useApp();

  const isAdminOrReviewer = role === 'admin' || role === 'super_admin' || role === 'question_reviewer';

  return (
    <Routes>
      {/* Full screen exam simulator route without sidebar layout */}
      <Route
        path="/mock-test/:testId"
        element={role === 'guest' ? <Navigate to="/" replace /> : <ExamSimulatorScreen />}
      />

      {/* Main Layout routes */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/design-system" element={<DesignSystemDoc />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={role === 'guest' ? <Navigate to="/" replace /> : <StudentDashboard />}
        />
        <Route
          path="/questions"
          element={role === 'guest' ? <Navigate to="/" replace /> : <QuestionBank />}
        />
        <Route
          path="/topics"
          element={role === 'guest' ? <Navigate to="/" replace /> : <TopicTests />}
        />
        <Route
          path="/mock-tests"
          element={role === 'guest' ? <Navigate to="/" replace /> : <MockTestList />}
        />
        <Route
          path="/results/:attemptId"
          element={role === 'guest' ? <Navigate to="/" replace /> : <ResultScreen />}
        />
        <Route
          path="/attempts"
          element={role === 'guest' ? <Navigate to="/" replace /> : <AttemptHistory />}
        />
        <Route
          path="/performance"
          element={role === 'guest' ? <Navigate to="/" replace /> : <PerformanceAnalytics />}
        />
        <Route
          path="/bookmarks"
          element={role === 'guest' ? <Navigate to="/" replace /> : <BookmarkScreen />}
        />
        <Route
          path="/profile"
          element={role === 'guest' ? <Navigate to="/" replace /> : <ProfileScreen />}
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
