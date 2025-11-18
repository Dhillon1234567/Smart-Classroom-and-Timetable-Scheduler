import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Announcement } from '../../types';
import * as academicService from '../../services/academicService';

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    academicService.getAnnouncements().then(setAnnouncements);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) {
      setError('Title and content are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newAnnouncement = await academicService.createAnnouncement({
        title,
        content,
        author: user.name,
      });
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      setError(err.message || "Failed to create announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Manage Announcements</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Announcement Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                <textarea
                  id="content"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* List of Announcements */}
        <div className="lg:col-span-2">
           <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  By {ann.author} on {new Date(ann.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 dark:text-gray-300">{ann.content}</p>
              </div>
            ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
