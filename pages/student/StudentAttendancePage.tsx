import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import { CameraIcon, QrCodeIcon } from '../../components/icons/NavIcons';

const StudentAttendancePage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ present: 0, total: 0, percentage: 0 });
    const [isScanning, setIsScanning] = useState(false);
    const [otp, setOtp] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (user?.courseId) {
            academicService.getAttendanceStatsForStudent(user.id, user.courseId).then(setStats);
        }
    }, [user]);

    const startCamera = async () => {
        setIsScanning(true);
        setStatusMsg('Initializing AI Face Detection...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setTimeout(() => setStatusMsg('Face Detected: Verified ✅'), 1500);
        } catch (err) {
            setStatusMsg('Camera access denied. Please use manual OTP.');
            setIsScanning(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    const handleSubmit = async () => {
        if (!user || !otp) return;
        
        const result = await academicService.markAttendance(user.id, otp, isScanning ? 'face_id' : 'manual');
        setStatusMsg(result.message);
        if(result.success) {
            stopCamera();
            setOtp('');
             if (user?.courseId) {
                academicService.getAttendanceStatsForStudent(user.id, user.courseId).then(setStats);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Stats Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Smart Attendance</h1>
                    <p className="text-indigo-100 mt-1">Track your presence and maintain your academic record.</p>
                </div>
                <div className="mt-6 md:mt-0 text-center">
                    <div className="text-5xl font-bold">{stats.percentage}%</div>
                    <div className="text-sm text-indigo-100 uppercase tracking-wide font-semibold">Attendance Score</div>
                </div>
            </div>

            {stats.percentage < 75 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-amber-700 font-bold">Low Attendance Warning</p>
                            <p className="text-sm text-amber-600">Your attendance is below 75%. Please attend upcoming classes to avoid penalties.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Camera / Scanner Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                            <CameraIcon className="w-6 h-6 mr-2 text-indigo-500" />
                            Touchless Entry
                        </h2>
                        {isScanning && <span className="text-xs font-bold text-red-500 animate-pulse">● REC</span>}
                    </div>

                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-6 flex items-center justify-center">
                        {!isScanning ? (
                             <button onClick={startCamera} className="text-center space-y-2 group">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/20 transition-all">
                                    <CameraIcon className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-gray-400 text-sm">Tap to enable AI Scanner</p>
                             </button>
                        ) : (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-lg pointer-events-none">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/30 rounded-lg"></div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session OTP (from screen)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0000"
                                />
                                <QrCodeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={!otp || (isScanning && statusMsg === 'Initializing AI Face Detection...')}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                        >
                            Mark Present
                        </button>
                         {statusMsg && <p className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-fade-in-up">{statusMsg}</p>}
                    </div>
                </div>

                {/* Recent Activity (Mock) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold mb-4">Recent History</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-gray-700/30">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">Computer Science 101</p>
                                    <p className="text-xs text-gray-500">Oct {20 - i}, 2023 • 10:00 AM</p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Present</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendancePage;