import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import { CourseResource, Subject } from '../../types';
import { UploadIcon, DocumentIcon, VideoIcon } from '../../components/icons/NavIcons';

const UploadResourcesPage: React.FC = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<{id: string, name: string, courseId: string}[]>([]);
    const [resources, setResources] = useState<CourseResource[]>([]);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'pdf' | 'ppt' | 'video' | 'link'>('pdf');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if(user) {
            academicService.getFacultySubjects(user.id).then(setSubjects);
            academicService.getFacultyResources(user.name).then(setResources);
        }
    }, [user]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedSubject) return;
        setLoading(true);
        
        const subject = subjects.find(s => s.id === selectedSubject);

        try {
            const newResource = await academicService.uploadResource({
                title,
                description,
                type,
                url: '#', // Mock URL
                courseId: subject?.courseId || '',
                subjectId: subject?.id,
                uploadedBy: user.name
            });
            setResources([...resources, newResource]);
            setMsg('Resource uploaded successfully!');
            setTitle('');
            setDescription('');
        } catch (err) {
            setMsg('Failed to upload.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'video': return <VideoIcon className="w-5 h-5 text-red-500" />;
            default: return <DocumentIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Upload Study Material</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-lg font-bold mb-4">New Resource</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            {msg && <p className="text-green-600 text-sm">{msg}</p>}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                                <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option value="pdf">PDF Document</option>
                                    <option value="ppt">Presentation (PPT)</option>
                                    <option value="video">Video Lecture</option>
                                    <option value="link">External Link</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input type="file" className="sr-only" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PPT, MP4 up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={2} />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                                {loading ? 'Uploading...' : 'Upload Resource'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Resource List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-lg font-bold mb-4">My Uploads</h2>
                        <div className="space-y-3">
                            {resources.length === 0 ? <p className="text-gray-500">No resources uploaded yet.</p> : resources.map(res => (
                                <div key={res.id} className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mr-4">
                                        {getTypeIcon(res.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{res.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{res.description}</p>
                                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                                            <span className="uppercase bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{res.type}</span>
                                            <span>{new Date(res.uploadDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadResourcesPage;