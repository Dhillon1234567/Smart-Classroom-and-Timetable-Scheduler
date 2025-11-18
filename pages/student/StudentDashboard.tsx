
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { CalendarIcon, BookOpenIcon, VoteIcon } from '../../components/icons/NavIcons';
import { ArrowRightIcon } from '../../components/icons/HeaderIcons';
import * as academicService from '../../services/academicService';
import { useNotification } from '../../contexts/NotificationContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // Check for notifications on mount
  useEffect(() => {
    const checkUpdates = async () => {
      if (!user?.courseId) return;

      try {
        const [finalTimetable, proposedTimetables] = await Promise.all([
            academicService.getFinalTimetable(user.courseId),
            academicService.getProposedTimetables(user.courseId)
        ]);

        // Simple logic: If this checks run, we assume it's a "fresh" view for the demo.
        // In a real app, we'd check against a timestamp stored in local storage.
        
        if (finalTimetable) {
            addNotification('success', 'Timetable Finalized!', 'Your official class schedule has been published. Check "My Timetable".');
        } else if (proposedTimetables && proposedTimetables.length > 0) {
            addNotification('info', 'Voting Open', 'Faculty has proposed new timetables. Please cast your vote!');
        }
      } catch (error) {
        console.error("Failed to check for updates", error);
      }
    };

    checkUpdates();
  }, [user, addNotification]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Student Dashboard</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Welcome back, <span className="font-semibold text-primary">{user?.name}</span>! Ready to learn something new today?
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DashboardCard
          to="/student/timetable"
          icon={CalendarIcon}
          title="My Timetable"
          description="View your official weekly class schedule."
          variant="orange"
        />
        <DashboardCard
          to="/student/vote-timetable"
          icon={VoteIcon}
          title="Vote for Timetable"
          description="Participate in selecting the best schedule for your class."
          variant="blue"
        />
        <DashboardCard
          to="/student/resources"
          icon={BookOpenIcon}
          title="AI Learning Resources"
          description="Generate notes, summaries, and practice questions for any topic."
          variant="indigo"
        />
      </div>
    </div>
  );
};

interface DashboardCardProps {
    to: string;
    icon: React.ElementType;
    title: string;
    description: string;
    variant: 'orange' | 'indigo' | 'blue';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, icon: Icon, title, description, variant }) => {
    const variants = {
        orange: {
            gradient: 'from-orange-500 to-red-500',
            shadow: 'shadow-orange-500/30',
            text: 'text-orange-600 dark:text-orange-400'
        },
        indigo: {
            gradient: 'from-indigo-500 to-violet-500',
            shadow: 'shadow-indigo-500/30',
            text: 'text-indigo-600 dark:text-indigo-400'
        },
        blue: {
            gradient: 'from-blue-500 to-cyan-500',
            shadow: 'shadow-blue-500/30',
            text: 'text-blue-600 dark:text-blue-400'
        }
    };
    
    const activeVariant = variants[variant];

    return (
        <Link to={to} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-700/50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br ${activeVariant.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
            
            <div className="relative z-10">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${activeVariant.gradient} ${activeVariant.shadow} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{description}</p>
                
                <div className="flex items-center font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    <span>Access Feature</span>
                    <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
};

export default StudentDashboard;
