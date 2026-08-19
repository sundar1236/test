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
import { AdminDashboard } from './pages/AdminDashboard';
import { QuestionManagement } from './pages/QuestionManagement';
import { ValidationQueue } from './pages/ValidationQueue';
import { DesignSystemDoc } from './pages/DesignSystemDoc';

export const AppRoutes: React.FC = () => {
  const { role } = useApp();

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
          element={role !== 'admin' ? <Navigate to="/dashboard" replace /> : <AdminDashboard />}
        />
        <Route
          path="/admin/questions"
          element={role !== 'admin' ? <Navigate to="/dashboard" replace /> : <QuestionManagement />}
        />
        <Route
          path="/admin/categories"
          element={role !== 'admin' ? <Navigate to="/dashboard" replace /> : <QuestionManagement />}
        />
        <Route
          path="/admin/tests"
          element={role !== 'admin' ? <Navigate to="/dashboard" replace /> : <AdminDashboard />}
        />
        <Route
          path="/admin/validation"
          element={role !== 'admin' ? <Navigate to="/dashboard" replace /> : <ValidationQueue />}
        />
        <Route
          path="/admin/analytics"
          element={role !== 'admin' ? <Navigate to="/dashboard" replace /> : <AdminDashboard />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
