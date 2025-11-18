import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import { Subject, Course } from '../../types';

interface EnrichedSubject extends Subject {
  courseName: string;
}

const AssignedClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [assignedClasses, setAssignedClasses] = useState<EnrichedSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      try {
        const classes = await academicService.getFacultySubjects(user.id);
        setAssignedClasses(classes);
      } catch (error) {
        console.error("Failed to fetch assigned classes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  if (loading) {
    return <div>Loading your classes...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Assigned Classes</h1>
      {assignedClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedClasses.map((subject) => (
            <div key={subject.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{subject.name}</h2>
              <p className="text-gray-700 dark:text-gray-300 mt-2">{subject.courseName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Semester {subject.semester}</p>
              <button className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                View Roster
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-300">You are not currently assigned to any classes.</p>
        </div>
      )}
    </div>
  );
};

export default AssignedClassesPage;