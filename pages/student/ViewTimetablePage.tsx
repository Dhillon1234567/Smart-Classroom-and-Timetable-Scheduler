import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import { Timetable, TimetableEntry } from '../../types';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "14:00 - 15:00", "15:00 - 16:00"];

const ViewTimetablePage: React.FC = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!user?.courseId) {
                setError("You are not enrolled in a course to view a timetable.");
                setLoading(false);
                return;
            }
            try {
                const finalTimetable = await academicService.getFinalTimetable(user.courseId);
                setTimetable(finalTimetable);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch timetable.');
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [user]);
    
    const getEntryForSlot = (day: string, time: string): TimetableEntry | undefined => {
        return timetable?.schedule.find(entry => entry.day === day && entry.time === time);
    };

    if (loading) return <div>Loading timetable...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Weekly Timetable</h1>
            {error && <div className="p-3 text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg mb-4">{error}</div>}
            
            {!timetable && !loading && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-bold mb-2">No Timetable Available</h2>
                    <p>A final timetable has not been set for your course yet. Please check back later or participate in the voting process.</p>
                </div>
            )}

            {timetable && (
                 <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                                {daysOfWeek.map(day => (
                                    <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {timeSlots.map(time => (
                                <tr key={time}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{time}</td>
                                    {daysOfWeek.map(day => {
                                        const entry = getEntryForSlot(day, time);
                                        return (
                                            <td key={day} className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                                {entry ? (
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                                                        <p className="font-bold">{entry.subject}</p>
                                                        <p className="text-xs">{entry.faculty}</p>
                                                        <p className="text-xs italic">{entry.classroom}</p>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewTimetablePage;
