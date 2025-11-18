
export enum Role {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  courseId?: string; // Foreign key for students
  createdBy?: string;
  createdAt: string;
}

// For AI Assistant Chatbot
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// For Timetable Generation
export interface Course {
    id: string;
    name: string;
    semesters: number;
}
  
export interface Subject {
    id: string;
    name:string;
    courseId: string;
    semester: number;
    facultyIds: string[];
}

export interface Classroom {
    id: string;
    name: string;
}

export interface TimetableEntry {
    day: string;
    time: string;
    subject: string;
    faculty: string;
    classroom: string;
}

export interface Timetable {
    option: number;
    schedule: TimetableEntry[];
    reasoning: string;
}

export interface TimetableConstraints {
    courseId: string;
    semester: number;
    subjects: string[];
    faculties: string[];
    classrooms: string[];
    timing: string[];
}

// For Real-time Chat System
export interface Conversation {
  id: string;
  participants: string[]; // User IDs
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
}

// For Announcements
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string; // Faculty name
  date: string;
}

// For Notifications
export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

// --- NEW TYPES FOR ATTENDANCE & RESOURCES ---

export interface AttendanceSession {
  id: string;
  courseId: string;
  subjectId: string;
  date: string;
  otp: string; // For manual entry if QR fails
  isActive: boolean;
  facultyId: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  timestamp: string;
  status: 'present' | 'absent';
  method: 'qr' | 'face_id' | 'manual';
}

export interface CourseResource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'ppt' | 'video' | 'link';
  url: string;
  courseId: string; // Which course this belongs to
  subjectId?: string;
  uploadedBy: string; // Faculty Name
  uploadDate: string;
}