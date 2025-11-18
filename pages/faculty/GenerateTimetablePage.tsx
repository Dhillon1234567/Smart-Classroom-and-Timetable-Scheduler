import React, { useState, useEffect, useCallback } from 'react';
import * as academicService from '../../services/academicService';
import * as aiService from '../../services/aiService';
import { Course, Subject, Classroom, User, Timetable } from '../../types';

const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "14:00 - 15:00", "15:00 - 16:00"];

const GenerateTimetablePage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<number>(1);
    
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [faculties, setFaculties] = useState<User[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
    const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
    const [selectedTimings, setSelectedTimings] = useState<string[]>(timeSlots);

    const [generatedTimetables, setGeneratedTimetables] = useState<Timetable[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        academicService.getCourses().then(setCourses);
        academicService.getClassrooms().then(setClassrooms);
    }, []);

    const loadCourseData = useCallback(async () => {
        if (!selectedCourseId) return;
        setLoading(true);
        try {
            const [subjects, faculties] = await Promise.all([
                academicService.getSubjectsByCourseAndSemester(selectedCourseId, selectedSemester),
                academicService.getFacultyForCourse(selectedCourseId, selectedSemester)
            ]);
            setSubjects(subjects);
            setFaculties(faculties);
            // Auto-select all by default
            setSelectedSubjects(subjects.map(s => s.name));
            setSelectedFaculties(faculties.map(f => f.name));
            setSelectedClassrooms(classrooms.map(c => c.name));
        } catch (e) {
            setError("Failed to load course data.");
        } finally {
            setLoading(false);
        }
    }, [selectedCourseId, selectedSemester, classrooms]);

    useEffect(() => {
        loadCourseData();
    }, [loadCourseData]);

    const handleGenerate = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        setGeneratedTimetables([]);
        try {
            const constraints = {
                courseId: courses.find(c => c.id === selectedCourseId)?.name || '',
                semester: selectedSemester,
                subjects: selectedSubjects,
                faculties: selectedFaculties,
                classrooms: selectedClassrooms,
                timing: selectedTimings,
            };
            const timetables = await aiService.generateTimetable(constraints);
            setGeneratedTimetables(timetables);
        } catch (err: any) {
            setError(err.message || 'Failed to generate timetable.');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePublish = async (timetables: Timetable[]) => {
        if (!selectedCourseId) {
            setError("Please select a course first.");
            return;
        }
        setLoading(true);
        try {
            await academicService.proposeTimetablesForVoting(selectedCourseId, timetables);
            setSuccess("Timetables published successfully for student voting!");
        } catch (err: any) {
            setError(err.message || 'Failed to publish timetables.');
        } finally {
            setLoading(false);
        }
    }

    const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">AI Timetable Generator</h1>
            
            {/* Constraints Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">1. Select Constraints</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                        <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                        <select value={selectedSemester} onChange={e => setSelectedSemester(Number(e.target.value))} className="mt-1 block w-full p-2 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                           {Array.from({ length: courses.find(c=>c.id===selectedCourseId)?.semesters || 0 }, (_, i) => i + 1).map(sem => <option key={sem} value={sem}>{sem}</option>)}
                        </select>
                    </div>
                </div>

                {selectedCourseId && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <CheckboxGroup title="Subjects" items={subjects.map(s=>s.name)} selected={selectedSubjects} onChange={v => handleCheckboxChange(setSelectedSubjects, v)} />
                        <CheckboxGroup title="Faculties" items={faculties.map(f=>f.name)} selected={selectedFaculties} onChange={v => handleCheckboxChange(setSelectedFaculties, v)} />
                        <CheckboxGroup title="Classrooms" items={classrooms.map(c=>c.name)} selected={selectedClassrooms} onChange={v => handleCheckboxChange(setSelectedClassrooms, v)} />
                        <CheckboxGroup title="Time Slots" items={timeSlots} selected={selectedTimings} onChange={v => handleCheckboxChange(setSelectedTimings, v)} />
                    </div>
                    <button onClick={handleGenerate} disabled={loading} className="mt-6 w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark disabled:bg-gray-400">
                        {loading ? 'Generating...' : '✨ Generate Timetables with AI'}
                    </button>
                </>
                )}
            </div>
            
            {error && <div className="p-3 text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg mb-4">{error}</div>}
            {success && <div className="p-3 text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-lg mb-4">{success}</div>}


            {/* Generated Timetables */}
            {generatedTimetables.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold mb-4">2. Review & Publish Options</h2>
                    <div className="space-y-8">
                        {generatedTimetables.map(tt => (
                            <div key={tt.option}>
                                <h3 className="text-lg font-semibold">Option {tt.option}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 italic">AI Reasoning: {tt.reasoning}</p>
                                <TimetableDisplay schedule={tt.schedule} />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => handlePublish(generatedTimetables)} disabled={loading} className="mt-6 w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400">
                        {loading ? 'Publishing...' : 'Publish All Options for Student Voting'}
                    </button>
                </div>
            )}
        </div>
    );
};

const CheckboxGroup: React.FC<{title: string, items: string[], selected: string[], onChange: (value: string) => void}> = ({ title, items, selected, onChange }) => (
    <div>
        <h4 className="font-semibold mb-2">{title}</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-gray-600">
            {items.map(item => (
                <label key={item} className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={selected.includes(item)} onChange={() => onChange(item)} className="rounded" />
                    <span>{item}</span>
                </label>
            ))}
        </div>
    </div>
);

const TimetableDisplay: React.FC<{ schedule: Timetable['schedule'] }> = ({ schedule }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Day</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Faculty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Classroom</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {schedule.map((entry, index) => (
                    <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.day}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.time}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.subject}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.faculty}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.classroom}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default GenerateTimetablePage;
