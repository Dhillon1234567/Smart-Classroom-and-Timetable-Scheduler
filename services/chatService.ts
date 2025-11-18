import { User, Role, Conversation, Message } from '../types';
import * as authService from './authService';

let conversations: Conversation[] = [];
let messages: Message[] = [];
let nextConversationId = 1;
let nextMessageId = 1;

const SIMULATED_DELAY = 200;

// Dummy subjects data needed for getContacts logic. Moved before its usage.
const subjects = [
    { id: 'CS-S1-1', name: 'Introduction to Programming', courseId: 'CS101', semester: 1, facultyIds: ['2', '10'] },
    { id: 'CS-S1-2', name: 'Discrete Mathematics', courseId: 'CS101', semester: 1, facultyIds: ['10'] },
    { id: 'EE-S1-1', name: 'Basic Electrical Engineering', courseId: 'EE201', semester: 1, facultyIds: ['11', '2'] },
];

const getOrCreateConversation = async (userId1: string, userId2: string): Promise<Conversation> => {
    let conversation = conversations.find(c => 
        c.participants.includes(userId1) && c.participants.includes(userId2)
    );

    if (!conversation) {
        conversation = {
            id: (nextConversationId++).toString(),
            participants: [userId1, userId2],
        };
        conversations.push(conversation);
    }
    return conversation;
};

export const getContacts = async (currentUser: User): Promise<User[]> => {
    const allUsers = await authService.getAllUsers();
    
    switch (currentUser.role) {
        case Role.ADMIN:
            // Admin can talk to all faculty and students
            return allUsers.filter(u => u.role === Role.FACULTY || u.role === Role.STUDENT);
        case Role.FACULTY:
            // Faculty can talk to their students and all admins
            const myStudents = allUsers.filter(u => u.role === Role.STUDENT && u.courseId && subjects.some(s => s.courseId === u.courseId && s.facultyIds.includes(currentUser.id)));
            const admins = allUsers.filter(u => u.role === Role.ADMIN);
            return [...myStudents, ...admins];
        case Role.STUDENT:
            // Student can talk to their faculty and all admins
            if (!currentUser.courseId) return [];
            const studentSubjects = subjects.filter(s => s.courseId === currentUser.courseId);
            const facultyIds = new Set<string>();
            studentSubjects.forEach(s => s.facultyIds.forEach(id => facultyIds.add(id)));
            const myFaculty = allUsers.filter(u => u.role === Role.FACULTY && facultyIds.has(u.id));
            const studentAdmins = allUsers.filter(u => u.role === Role.ADMIN);
            return [...myFaculty, ...studentAdmins];
        default:
            return [];
    }
};

export const getConversationForUsers = (userId1: string, userId2: string): Promise<Conversation> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(getOrCreateConversation(userId1, userId2));
    }, SIMULATED_DELAY));
};

export const getMessages = (conversationId: string): Promise<Message[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(messages.filter(m => m.conversationId === conversationId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    }, SIMULATED_DELAY));
};

export const sendMessage = (conversationId: string, senderId: string, text: string): Promise<Message> => {
    return new Promise(resolve => setTimeout(() => {
        const newMessage: Message = {
            id: (nextMessageId++).toString(),
            conversationId,
            senderId,
            text,
            timestamp: new Date().toISOString(),
            status: 'sent', // Simplified status
        };
        messages.push(newMessage);
        resolve(newMessage);
    }, SIMULATED_DELAY));
};
