import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './Toast';
import { DetailedReportModal } from '../common/DetailedReportModal';
import { AskCurcuma } from '../chatbot';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 antialiased overflow-x-hidden w-full print:bg-white print:overflow-visible print:block">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <div className="print:hidden">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full print:block print:w-full print:p-0">
        <div className="print:hidden">
          <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        </div>
        <main className="flex-1 p-3.5 sm:p-5 md:p-7 max-w-7xl w-full mx-auto min-w-0 print:p-0 print:m-0 print:max-w-none print:w-full">
          <Outlet />
        </main>
      </div>

      <div className="print:hidden">
        <ToastContainer />
        <DetailedReportModal />
        <AskCurcuma />
      </div>
    </div>
  );
};

export default AppLayout;
