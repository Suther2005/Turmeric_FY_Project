import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/translations';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './Toast';
import { DetailedReportModal } from '../common/DetailedReportModal';

export const AppLayout: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="flex min-h-screen bg-[#f8faf9]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <footer className="py-3 px-6 text-center text-[11px] text-slate-400 border-t border-[#e2ece6] bg-white/50">
          {TRANSLATIONS.footer.text[language]}
        </footer>
      </div>
      <ToastContainer />
      <DetailedReportModal />
    </div>
  );
};
