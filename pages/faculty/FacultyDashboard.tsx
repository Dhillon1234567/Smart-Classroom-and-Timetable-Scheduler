import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { BookOpenIcon, MegaphoneIcon, ChevronDownIcon } from '../../components/icons/HeaderIcons';
import { CalendarIcon } from '../../components/icons/NavIcons';

type AccordionItem = 'classes' | 'announcements' | 'timetable';

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [openItem, setOpenItem] = useState<AccordionItem | null>(null);

  const toggleItem = (item: AccordionItem) => {
    setOpenItem(openItem === item ? null : item);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Faculty Dashboard</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Welcome, <span className="font-semibold">{user?.name}</span>. Manage your academic activities from here.
      </p>

      <div className="space-y-4">
        <Accordion
          title="Assigned Classes"
          icon={BookOpenIcon}
          isOpen={openItem === 'classes'}
          onClick={() => toggleItem('classes')}
          linkTo="/faculty/classes"
          linkText="Manage Classes"
        >
          View your current class schedules, student rosters, and course materials.
        </Accordion>
        
        <Accordion
          title="Announcements"
          icon={MegaphoneIcon}
          isOpen={openItem === 'announcements'}
          onClick={() => toggleItem('announcements')}
          linkTo="/faculty/announcements"
          linkText="Create Announcement"
        >
          Publish updates, news, and important information for your students.
        </Accordion>
        
        <Accordion
          title="AI Timetable Generator"
          icon={CalendarIcon}
          isOpen={openItem === 'timetable'}
          onClick={() => toggleItem('timetable')}
          linkTo="/faculty/generate-timetable"
          linkText="Generate Timetable"
        >
          Use our intelligent assistant to generate optimized, conflict-free timetables for your courses.
        </Accordion>
      </div>
    </div>
  );
};

// --- Accordion Component ---
interface AccordionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  linkTo: string;
  linkText: string;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon: Icon, children, isOpen, onClick, linkTo, linkText }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div className="flex items-center">
          <Icon className="w-6 h-6 mr-4 text-indigo-500" />
          <span className="text-lg font-semibold text-gray-800 dark:text-white">{title}</span>
        </div>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40' : 'max-h-0'}`}
      >
        <div className="px-5 pb-5 pt-2">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{children}</p>
          <Link to={linkTo}>
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {linkText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
