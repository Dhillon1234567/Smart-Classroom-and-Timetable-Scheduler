import { User, Role } from '../types';

// Let's define the payload types used by the service
export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role.FACULTY | Role.STUDENT;
}

// --- MOCK DATABASE ---
// In a real app, this would be a backend API call.
// We are mocking the database and API logic here.
let users: (User & { password?: string })[] = [
  // Admins
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@sams.com',
    password: 'password',
    role: Role.ADMIN,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  // Faculty
  {
    id: '2',
    name: 'Dr. Jane Doe',
    email: 'jane.doe@sams.com',
    password: 'password',
    role: Role.FACULTY,
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '10',
    name: 'Prof. Robert Davis',
    email: 'robert.davis@sams.com',
    password: 'password',
    role: Role.FACULTY,
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: '11',
    name: 'Dr. Emily Wilson',
    email: 'emily.wilson@sams.com',
    password: 'password',
    role: Role.FACULTY,
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  // Students
  {
    id: '3',
    name: 'John Smith',
    email: 'john.smith@sams.com',
    password: 'password',
    role: Role.STUDENT,
    courseId: 'CS101',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '4',
    name: 'Alice Johnson',
    email: 'alice.j@sams.com',
    password: 'password',
    role: Role.STUDENT,
    courseId: 'CS101',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.b@sams.com',
    password: 'password',
    role: Role.STUDENT,
    courseId: 'EE201',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
   {
    id: '6',
    name: 'Sarah Miller',
    email: 'sarah.m@sams.com',
    password: 'password',
    role: Role.STUDENT,
    courseId: 'EE201',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

let nextId = 12;
const generateId = () => (nextId++).toString();

const SIMULATED_DELAY = 500; // ms

// --- API FUNCTIONS ---

/**
 * Logs in a user.
 */
export const login = (credentials: LoginCredentials): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === credentials.email);

      if (!user) {
        return reject(new Error('User not found. Please check your email.'));
      }
      if (user.password !== credentials.password) {
        return reject(new Error('Invalid password. Please try again.'));
      }
      if (user.role !== credentials.role) {
        return reject(new Error('Incorrect Role Selected. Please select your correct role.'));
      }
      
      // Don't send password to the client
      const { password, ...userToReturn } = user;
      resolve(userToReturn as User);

    }, SIMULATED_DELAY);
  });
};

/**
 * Logs out the user (client-side logic is in AuthContext).
 */
export const logout = (): void => {
  // In a real app, this might invalidate a token on the server.
  console.log('User logged out');
};

/**
 * Creates a new user (admin only).
 */
export const createUser = (payload: CreateUserPayload, adminId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users.some(u => u.email === payload.email)) {
        return reject(new Error('An account with this email already exists.'));
      }

      const newUser: User & { password?: string } = {
        id: generateId(),
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        createdBy: adminId,
        createdAt: new Date().toISOString(),
        courseId: payload.role === Role.STUDENT ? 'CS101' : undefined, // Default course for new students
      };

      users.push(newUser);
      
      const { password, ...userToReturn } = newUser;
      resolve(userToReturn as User);

    }, SIMULATED_DELAY);
  });
};

/**
 * Fetches all users (admin only).
 */
export const getAllUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const usersToReturn = users.map(u => {
        const { password, ...user } = u;
        return user as User;
      });
      resolve(usersToReturn);
    }, SIMULATED_DELAY);
  });
};


/**
 * Fetches a user by ID.
 */
export const getUserById = (userId: string): Promise<User | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = users.find(u => u.id === userId);
        if (user) {
          const { password, ...userToReturn } = user;
          resolve(userToReturn as User);
        } else {
          resolve(undefined);
        }
      }, SIMULATED_DELAY / 2); // Faster lookup
    });
  };

/**
 * Deletes a user (admin only).
 */
export const deleteUser = (userId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = users.length;
      const adminUser = users.find(u => u.role === Role.ADMIN);
      if (userId === adminUser?.id) {
          return reject(new Error('Admin user cannot be deleted.'));
      }
      users = users.filter(u => u.id !== userId);

      if (users.length === initialLength) {
        return reject(new Error('User not found for deletion.'));
      }
      resolve();
    }, SIMULATED_DELAY);
  });
};