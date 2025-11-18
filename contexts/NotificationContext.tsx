
import React, { createContext, useState, useContext, useCallback } from 'react';
import { Notification } from '../types';
import { XIcon } from '../components/icons/MenuIcons';
import { BellIcon } from '../components/icons/ActionIcons';

interface NotificationContextType {
  addNotification: (type: Notification['type'], title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const newNotification: Notification = { id, type, title, message };
    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`pointer-events-auto w-80 rounded-xl p-4 shadow-lg backdrop-blur-md border transform transition-all duration-500 animate-fade-in-up
              ${notification.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-700' : ''}
              ${notification.type === 'info' ? 'bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700' : ''}
              ${notification.type === 'warning' ? 'bg-amber-50/90 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700' : ''}
              ${notification.type === 'error' ? 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-700' : ''}
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <BellIcon className={`h-6 w-6 
                   ${notification.type === 'success' ? 'text-emerald-500' : ''}
                   ${notification.type === 'info' ? 'text-blue-500' : ''}
                   ${notification.type === 'warning' ? 'text-amber-500' : ''}
                   ${notification.type === 'error' ? 'text-red-500' : ''}
                `} />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="bg-transparent rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
