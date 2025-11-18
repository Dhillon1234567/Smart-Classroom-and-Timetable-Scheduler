import { Course, Subject, Classroom, Timetable, User, Role, Announcement, AttendanceSession, AttendanceRecord, CourseResource } from '../types';
import * as authService from './authService';

// --- MOCK DATABASE for Academic Data ---
const courses: Course[] = [
  { id: 'CS101', name: 'Computer Science', semesters: 8 },
  { id: 'EE201', name: 'Electrical Engineering', semesters: 8 },
];

const subjects: Subject[] = [
    // Computer Science Subjects
    { id: 'CS-S1-1', name: 'Introduction to Programming', courseId: 'CS101', semester: 1, facultyIds: ['2', '10'] },
    { id: 'CS-S1-2', name: 'Discrete Mathematics', courseId: 'CS101', semester: 1, facultyIds: ['10'] },
    { id: 'CS-S1-3', name: 'Digital Logic Design', courseId: 'CS101', semester: 1, facultyIds: ['11'] },
    { id: 'CS-S2-1', name: 'Data Structures', courseId: 'CS101', semester: 2, facultyIds: ['2'] },
    { id: 'CS-S2-2', name: 'Algorithms', courseId: 'CS101', semester: 2, facultyIds: ['10'] },

    // Electrical Engineering Subjects
    { id: 'EE-S1-1', name: 'Basic Electrical Engineering', courseId: 'EE201', semester: 1, facultyIds: ['11', '2'] },
    { id: 'EE-S1-2', name: 'Engineering Physics', courseId: 'EE201', semester: 1, facultyIds: ['10'] },
    { id: 'EE-S2-1', name: 'Circuit Theory', courseId: 'EE201', semester: 2, facultyIds: ['11'] },
];

const classrooms: Classroom[] = [
  { id: 'CR1', name: 'Classroom A1' },
  { id: 'CR2', name: 'Classroom B2' },
  { id: 'LAB1', name: 'Computer Lab 1' },
  { id: 'LAB2', name: 'Electronics Lab' },
];

let announcements: Announcement[] = [
    {
      id: '1',
      title: 'Mid-term Exam Schedule',
      content: 'The mid-term examinations for all first-year students will commence from the 15th of next month. Please check the notice board for the detailed schedule.',
      author: 'Dr. Jane Doe',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
];
let nextAnnouncementId = 2;

// --- DATA FOR ATTENDANCE ---
let attendanceSessions: AttendanceSession[] = [];
let attendanceRecords: AttendanceRecord[] = [];

// --- DATA FOR RESOURCES ---
let courseResources: CourseResource[] = [
  {
    id: '1',
    title: 'Introduction to Python Slides',
    description: 'Lecture slides covering variables, loops, and functions.',
    type: 'ppt',
    url: '#',
    courseId: 'CS101',
    subjectId: 'CS-S1-1',
    uploadedBy: 'Dr. Jane Doe',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '2',
    title: 'Calculus Cheat Sheet',
    description: 'Important formulas for differentiation and integration.',
    type: 'pdf',
    url: '#',
    courseId: 'CS101',
    subjectId: 'CS-S1-2',
    uploadedBy: 'Prof. Robert Davis',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  }
];


// State for timetable voting
let proposedTimetables: Record<string, Timetable[]> = {}; // key: courseId
let timetableVotes: Record<string, Record<string, number>> = {}; // key: courseId, then key: userId, value: option voted for
let finalTimetables: Record<string, Timetable> = {}; // key: courseId

const SIMULATED_DELAY = 300;

// --- API FUNCTIONS ---

export const getCourses = (): Promise<Course[]> => {
  return new Promise(resolve => setTimeout(() => resolve(courses), SIMULATED_DELAY));
};

export const getSubjectsByCourseAndSemester = (courseId: string, semester: number): Promise<Subject[]> => {
  return new Promise(resolve => setTimeout(() => {
    resolve(subjects.filter(s => s.courseId === courseId && s.semester === semester));
  }, SIMULATED_DELAY));
};

export const getFacultySubjects = async (facultyId: string): Promise<(Subject & { courseName: string })[]> => {
  const facultySubjects = subjects.filter(s => s.facultyIds.includes(facultyId));
  const enrichedSubjects = facultySubjects.map(s => ({
    ...s,
    courseName: courses.find(c => c.id === s.courseId)?.name || 'Unknown Course'
  }));
  return new Promise(resolve => setTimeout(() => resolve(enrichedSubjects), SIMULATED_DELAY));
};

export const getClassrooms = (): Promise<Classroom[]> => {
    return new Promise(resolve => setTimeout(() => resolve(classrooms), SIMULATED_DELAY));
};

export const getFacultyForCourse = async (courseId: string, semester: number): Promise<User[]> => {
    const relevantSubjects = subjects.filter(s => s.courseId === courseId && s.semester === semester);
    const facultyIdSet = new Set<string>();
    relevantSubjects.forEach(s => s.facultyIds.forEach(fid => facultyIdSet.add(fid)));
    
    const allUsers = await authService.getAllUsers();
    return allUsers.filter(u => u.role === Role.FACULTY && facultyIdSet.has(u.id));
}

// Announcement System Functions
export const getAnnouncements = (): Promise<Announcement[]> => {
    return new Promise(resolve => setTimeout(() => resolve(announcements), SIMULATED_DELAY));
};

export const createAnnouncement = (data: Omit<Announcement, 'id' | 'date'>): Promise<Announcement> => {
    return new Promise(resolve => setTimeout(() => {
        const newAnnouncement: Announcement = {
            ...data,
            id: (nextAnnouncementId++).toString(),
            date: new Date().toISOString()
        };
        announcements = [newAnnouncement, ...announcements];
        resolve(newAnnouncement);
    }, SIMULATED_DELAY));
};

// --- ATTENDANCE FUNCTIONS ---

export const createAttendanceSession = (facultyId: string, subjectId: string): Promise<AttendanceSession> => {
    return new Promise(resolve => setTimeout(() => {
        const subject = subjects.find(s => s.id === subjectId);
        const newSession: AttendanceSession = {
            id: Date.now().toString(),
            courseId: subject?.courseId || '',
            subjectId,
            date: new Date().toISOString(),
            otp: Math.floor(1000 + Math.random() * 9000).toString(),
            isActive: true,
            facultyId
        };
        // Deactivate other sessions for this faculty/subject
        attendanceSessions.forEach(s => {
           if(s.facultyId === facultyId && s.subjectId === subjectId) s.isActive = false; 
        });
        
        attendanceSessions.push(newSession);
        resolve(newSession);
    }, SIMULATED_DELAY));
};

export const getAttendanceSessions = (facultyId: string): Promise<(AttendanceSession & {subjectName: string})[]> => {
    return new Promise(resolve => setTimeout(() => {
        const sessions = attendanceSessions.filter(s => s.facultyId === facultyId).map(s => ({
            ...s,
            subjectName: subjects.find(sub => sub.id === s.subjectId)?.name || 'Unknown'
        }));
        resolve(sessions.reverse());
    }, SIMULATED_DELAY));
}

export const getAttendanceStatsForStudent = (studentId: string, courseId: string): Promise<{present: number, total: number, percentage: number}> => {
     return new Promise(resolve => setTimeout(() => {
        // Mock logic: Count total sessions for the student's course
        // In reality, this would query the schedule.
        const relevantSubjects = subjects.filter(s => s.courseId === courseId);
        const relevantSubjectIds = relevantSubjects.map(s => s.id);
        
        const totalSessions = attendanceSessions.filter(s => relevantSubjectIds.includes(s.subjectId)).length;
        const attended = attendanceRecords.filter(r => r.studentId === studentId && r.status === 'present').length;
        
        // Mock data if 0 to look good
        const adjustedTotal = totalSessions === 0 ? 20 : totalSessions;
        const adjustedAttended = totalSessions === 0 ? 16 : attended;

        resolve({
            present: adjustedAttended,
            total: adjustedTotal,
            percentage: Math.round((adjustedAttended / adjustedTotal) * 100)
        });
    }, SIMULATED_DELAY));
}

export const markAttendance = (studentId: string, otp: string, method: 'qr' | 'face_id' | 'manual'): Promise<{success: boolean, message: string}> => {
    return new Promise(resolve => setTimeout(() => {
        const activeSession = attendanceSessions.find(s => s.otp === otp && s.isActive);
        
        if (!activeSession) {
             resolve({ success: false, message: 'Invalid or expired session OTP.' });
             return;
        }

        const existingRecord = attendanceRecords.find(r => r.sessionId === activeSession.id && r.studentId === studentId);
        if (existingRecord) {
            resolve({ success: false, message: 'You have already marked attendance for this session.' });
            return;
        }

        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            sessionId: activeSession.id,
            studentId,
            timestamp: new Date().toISOString(),
            status: 'present',
            method
        };
        attendanceRecords.push(newRecord);
        resolve({ success: true, message: 'Attendance marked successfully!' });

    }, SIMULATED_DELAY));
}


// --- RESOURCE FUNCTIONS ---

export const uploadResource = (data: Omit<CourseResource, 'id' | 'uploadDate'>): Promise<CourseResource> => {
    return new Promise(resolve => setTimeout(() => {
        const newResource: CourseResource = {
            ...data,
            id: Date.now().toString(),
            uploadDate: new Date().toISOString()
        };
        courseResources.push(newResource);
        resolve(newResource);
    }, SIMULATED_DELAY));
}

export const getCourseResources = (courseId: string): Promise<CourseResource[]> => {
     return new Promise(resolve => setTimeout(() => {
        resolve(courseResources.filter(r => r.courseId === courseId));
    }, SIMULATED_DELAY));
}

export const getFacultyResources = (facultyName: string): Promise<CourseResource[]> => {
    return new Promise(resolve => setTimeout(() => {
       resolve(courseResources.filter(r => r.uploadedBy === facultyName));
   }, SIMULATED_DELAY));
}


// Timetable Voting System Functions
export const proposeTimetablesForVoting = (courseId: string, timetables: Timetable[]): Promise<void> => {
    return new Promise(resolve => setTimeout(() => {
        proposedTimetables[courseId] = timetables;
        // Reset votes when new timetables are proposed
        timetableVotes[courseId] = {};
        delete finalTimetables[courseId];
        resolve();
    }, SIMULATED_DELAY));
}

export const getProposedTimetables = (courseId: string): Promise<Timetable[] | null> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(proposedTimetables[courseId] || null);
    }, SIMULATED_DELAY));
}

export const castVote = (userId: string, courseId: string, option: number): Promise<void> => {
    return new Promise(resolve => setTimeout(() => {
        if (!timetableVotes[courseId]) {
            timetableVotes[courseId] = {};
        }
        timetableVotes[courseId][userId] = option;
        resolve();
    }, SIMULATED_DELAY));
}

export const getVoteResults = (courseId: string): Promise<{ votes: number[], userVote: number | null }> => {
    // This would be a real user ID in a real app
    const currentUserId = "3"; // Mocking as John Smith for now
    return new Promise(resolve => setTimeout(() => {
        const courseVotes = timetableVotes[courseId];
        if (!courseVotes) {
            resolve({ votes: [], userVote: null });
            return;
        }
        const results = Object.values(courseVotes);
        const voteCounts = (proposedTimetables[courseId] || []).map(option => {
            return results.filter(vote => vote === option.option).length;
        });
        resolve({ votes: voteCounts, userVote: courseVotes[currentUserId] || null });
    }, SIMULATED_DELAY));
}


export const finalizeTimetable = (courseId: string): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const results = timetableVotes[courseId];
        const proposals = proposedTimetables[courseId];

        if (!results || !proposals) {
            return reject(new Error("No votes or proposals found to finalize."));
        }

        const voteCounts: Record<number, number> = {};
        proposals.forEach(p => voteCounts[p.option] = 0);
        Object.values(results).forEach(vote => {
            voteCounts[vote]++;
        });

        let winningOption = -1;
        let maxVotes = -1;
        for (const option in voteCounts) {
            if (voteCounts[option] > maxVotes) {
                maxVotes = voteCounts[option];
                winningOption = parseInt(option, 10);
            }
        }
        
        const winningTimetable = proposals.find(p => p.option === winningOption);
        if (winningTimetable) {
            finalTimetables[courseId] = winningTimetable;
            delete proposedTimetables[courseId]; // Clear proposals after finalizing
            resolve();
        } else {
            reject(new Error("Could not determine a winning timetable."));
        }
    }, SIMULATED_DELAY));
}


export const getFinalTimetable = (courseId: string): Promise<Timetable | null> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(finalTimetables[courseId] || null);
    }, SIMULATED_DELAY));
}