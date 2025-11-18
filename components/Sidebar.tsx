import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { DashboardIcon, UsersIcon, UserAddIcon, ProfileIcon, BookOpenIcon, MegaphoneIcon, SparklesIcon, CalendarIcon, VoteIcon, ChatBubbleIcon, QrCodeIcon, UploadIcon } from './icons/NavIcons';
import { XIcon } from './icons/MenuIcons';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const adminNavItems: NavItem[] = [
  { to: '/admin/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/admin/users', icon: UsersIcon, label: 'View Users' },
  { to: '/admin/create-user', icon: UserAddIcon, label: 'Create User' },
  { to: '/admin/messages', icon: ChatBubbleIcon, label: 'Messages' },
  { to: '/admin/chatbot', icon: SparklesIcon, label: 'AI Assistant' },
  { to: '/admin/profile', icon: ProfileIcon, label: 'Profile' },
];

const facultyNavItems: NavItem[] = [
  { to: '/faculty/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/faculty/classes', icon: BookOpenIcon, label: 'Assigned Classes' },
  { to: '/faculty/attendance', icon: QrCodeIcon, label: 'Attendance' },
  { to: '/faculty/upload-resources', icon: UploadIcon, label: 'Upload Resources' },
  { to: '/faculty/announcements', icon: MegaphoneIcon, label: 'Announcements' },
  { to: '/faculty/generate-timetable', icon: CalendarIcon, label: 'Generate Timetable' },
  { to: '/faculty/messages', icon: ChatBubbleIcon, label: 'Messages' },
  { to: '/faculty/chatbot', icon: SparklesIcon, label: 'AI Assistant' },
  { to: '/faculty/profile', icon: ProfileIcon, label: 'Profile' },
];

const studentNavItems: NavItem[] = [
  { to: '/student/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/student/timetable', icon: CalendarIcon, label: 'My Timetable' },
  { to: '/student/attendance', icon: QrCodeIcon, label: 'Smart Attendance' },
  { to: '/student/vote-timetable', icon: VoteIcon, label: 'Vote for Timetable' },
  { to: '/student/resources', icon: BookOpenIcon, label: 'Resources' },
  { to: '/student/messages', icon: ChatBubbleIcon, label: 'Messages' },
  { to: '/student/chatbot', icon: SparklesIcon, label: 'AI Assistant' },
  { to: '/student/profile', icon: ProfileIcon, label: 'Profile' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, setIsOpen}) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case Role.ADMIN: return adminNavItems;
      case Role.FACULTY: return facultyNavItems;
      case Role.STUDENT: return studentNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();
  const baseClasses = "flex items-center px-4 py-3.5 text-slate-400 font-medium rounded-xl transition-all duration-200 group";
  const activeClasses = "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/20";
  const hoverClasses = "hover:bg-slate-800 hover:text-white";

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
      
      {/* Logo Area */}
      <div className="flex items-center justify-between px-6 py-8">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-glow">
                <span className="font-bold text-white">S</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">S.A.M.S</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <XIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Menu</p>
        {navItems.map((item) => {
             const isActive = location.pathname.startsWith(item.to);
             return (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : hoverClasses}`}
                    onClick={() => setIsOpen(false)}
                >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                    {item.label}
                </NavLink>
             );
        })}
      </nav>

      {/* User Profile Summary at Bottom */}
      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;