import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import { Subject, AttendanceSession } from '../../types';
import { QrCodeIcon, UsersIcon } from '../../components/icons/NavIcons';

const AttendancePage: React.FC = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
    const [history, setHistory] = useState<(AttendanceSession & {subjectName: string})[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(user) {
            academicService.getFacultySubjects(user.id).then(setSubjects);
            refreshHistory();
        }
    }, [user]);

    const refreshHistory = () => {
        if(user) academicService.getAttendanceSessions(user.id).then(setHistory);
    }

    const handleCreateSession = async () => {
        if (!selectedSubjectId || !user) return;
        setLoading(true);
        try {
            const session = await academicService.createAttendanceSession(user.id, selectedSubjectId);
            setCurrentSession(session);
            refreshHistory();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Attendance Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Session Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <QrCodeIcon className="w-6 h-6 mr-2 text-indigo-500" />
                        Start New Session
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Class</label>
                            <select 
                                value={selectedSubjectId} 
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Choose a Subject --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <button 
                            onClick={handleCreateSession}
                            disabled={!selectedSubjectId || loading}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Generating...' : 'Generate QR & OTP'}
                        </button>
                    </div>

                    {currentSession && (
                        <div className="mt-6 p-6 bg-slate-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center animate-fade-in-up">
                            <p className="text-sm text-gray-500 mb-4">Scan to mark attendance</p>
                            <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentSession.otp}`} 
                                    alt="Attendance QR" 
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">Or enter manual OTP:</p>
                                <p className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest mt-1">{currentSession.otp}</p>
                            </div>
                            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Live Session Active
                            </div>
                        </div>
                    )}
                </div>

                {/* History Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                     <h2 className="text-xl font-bold mb-4 flex items-center">
                        <UsersIcon className="w-6 h-6 mr-2 text-indigo-500" />
                        Recent Sessions
                    </h2>
                    <div className="overflow-y-auto max-h-[500px] space-y-3">
                        {history.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent sessions found.</p>
                        ) : (
                            history.map(session => (
                                <div key={session.id} className="p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-600 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{session.subjectName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(session.date).toLocaleString()}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {session.isActive ? 'Active' : 'Ended'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;