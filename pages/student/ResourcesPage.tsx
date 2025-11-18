import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import * as aiService from '../../services/aiService';
import { Subject, CourseResource } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SparklesIcon, BookOpenIcon, DownloadIcon, VideoIcon, DocumentIcon } from '../../components/icons/NavIcons';

const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'materials' | 'ai'>('materials');
  
  // AI State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Materials State
  const [resources, setResources] = useState<CourseResource[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.courseId) {
        const allSubjects = await academicService.getSubjectsByCourseAndSemester(user.courseId, 1);
        setSubjects(allSubjects);
        
        const courseResources = await academicService.getCourseResources(user.courseId);
        setResources(courseResources);
      }
    };
    fetchData();
  }, [user]);

  const handleAIGenerate = async () => {
    if (!topic.trim() || !selectedSubject) return;
    setIsLoadingAI(true);
    try {
      const fullTopic = `${topic} (from the subject: ${selectedSubject})`;
      const content = await aiService.generateLearningResource(fullTopic);
      setGeneratedContent(content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getTypeIcon = (type: string) => {
        switch(type) {
            case 'video': return <VideoIcon className="w-6 h-6 text-red-500" />;
            default: return <DocumentIcon className="w-6 h-6 text-blue-500" />;
        }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Learning Hub</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'materials' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
          >
              Course Materials
          </button>
          <button 
             onClick={() => setActiveTab('ai')}
             className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'ai' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
          >
              <SparklesIcon className="w-4 h-4 mr-2" />
              AI Generator
          </button>
      </div>

      {/* Tab Content: Materials */}
      {activeTab === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {resources.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                      No materials uploaded by faculty yet.
                  </div>
              ) : (
                  resources.map(res => (
                      <div key={res.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                               <div className="p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                                   {getTypeIcon(res.type)}
                               </div>
                               <span className="text-xs font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{res.type}</span>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{res.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{res.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-xs text-gray-400">
                                    {new Date(res.uploadDate).toLocaleDateString()}
                                </div>
                                <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm flex items-center">
                                    <DownloadIcon className="w-4 h-4 mr-1" /> Download
                                </button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}

      {/* Tab Content: AI Generator */}
      {activeTab === 'ai' && (
          <div className="animate-fade-in-up">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8 border border-indigo-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="mt-1 block w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="">Select...</option>
                      {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., 'Thermodynamics'"
                      className="mt-1 block w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAIGenerate}
                  disabled={isLoadingAI}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isLoadingAI ? 'Generating Study Guide...' : 'Generate with AI'}
                </button>
              </div>

              {generatedContent && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="prose prose-indigo dark:prose-invert max-w-none">
                        <ReactMarkdown children={generatedContent} remarkPlugins={[remarkGfm]} />
                    </div>
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default ResourcesPage;