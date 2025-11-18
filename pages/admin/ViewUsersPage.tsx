import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import * as authService from '../../services/authService';
import { TrashIcon } from '../../components/icons/ActionIcons';

const ViewUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete user.');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return <div className="p-4 text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-200 rounded-xl border border-red-200">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <span className="px-4 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 font-medium">Total: {users.length}</span>
      </div>
      
      <div className="bg-white dark:bg-card-dark shadow-glass rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Date</th>
                <th scope="col" className="relative px-6 py-5"><span className="sr-only">Actions</span></th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                    <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                            ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                              user.role === 'faculty' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                              'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        onClick={() => handleDelete(user.id)} 
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete User"
                    >
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ViewUsersPage;