import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MenuIcon } from './icons/MenuIcons';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface dark:bg-dark-bg text-slate-800 dark:text-slate-200 font-sans selection:bg-primary selection:text-white">
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white focus:outline-none lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
        </Header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface dark:bg-dark-bg p-4 sm:p-6 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;