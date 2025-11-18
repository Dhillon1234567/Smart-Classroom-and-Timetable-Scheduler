import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UsersIcon, UserAddIcon, BookOpenIcon } from '../../components/icons/NavIcons';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
          <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-indigo-100">Welcome back, {user?.name}. Here's what's happening today.</p>
          </div>
          <div className="mt-4 md:mt-0">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium border border-white/30">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            title="Total Users" 
            value="45" 
            icon={UsersIcon} 
            trend="+5% from last month"
            color="blue"
        />
        <StatCard 
            title="New Registrations" 
            value="12" 
            icon={UserAddIcon} 
            trend="+12% from last month"
            color="purple"
        />
        <StatCard 
            title="Active Courses" 
            value="28" 
            icon={BookOpenIcon} 
            trend="Stable"
            color="green"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend: string;
    color: 'blue' | 'purple' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
    const colors = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500'
    };
    const lightColors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
    };

    return (
        <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${lightColors[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-500 font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    {trend}
                </span>
            </div>
        </div>
    );
};

export default AdminDashboard;