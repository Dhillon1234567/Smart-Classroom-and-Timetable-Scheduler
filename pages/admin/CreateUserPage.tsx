
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import * as authService from '../../services/authService';

const CreateUserPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role.FACULTY | Role.STUDENT>(Role.FACULTY);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!user) {
      setError("You must be logged in to create a user.");
      setLoading(false);
      return;
    }

    try {
      await authService.createUser({ name, email, password, role }, user.id);
      setMessage(`Successfully created ${role} account for ${name}.`);
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole(Role.FACULTY);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Create New User</h1>
      <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 text-sm text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>}
          {message && <div className="p-3 text-sm text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800 rounded-lg">{message}</div>}
          
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role.FACULTY | Role.STUDENT)} required className={inputClasses}>
              <option value={Role.FACULTY}>Faculty</option>
              <option value={Role.STUDENT}>Student</option>
            </select>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;
