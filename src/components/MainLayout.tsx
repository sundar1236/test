import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useApp } from '../context/AppContext';

export const MainLayout: React.FC = () => {
  const { role } = useApp();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans flex flex-col transition-colors">
      <Header />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {role !== 'guest' && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
