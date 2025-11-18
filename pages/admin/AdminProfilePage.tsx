
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Admin Profile</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
            <p className="text-lg text-gray-900 dark:text-white">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <p className="text-lg text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
            <p className="text-lg text-gray-900 dark:text-white capitalize">{user?.role}</p>
          </div>
          <button className="w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
