
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateUserPage from './pages/admin/CreateUserPage';
import ViewUsersPage from './pages/admin/ViewUsersPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfilePage from './pages/faculty/FacultyProfilePage';
import AssignedClassesPage from './pages/faculty/AssignedClassesPage';
import AnnouncementsPage from './pages/faculty/AnnouncementsPage';
import AttendancePage from './pages/faculty/AttendancePage';
import UploadResourcesPage from './pages/faculty/UploadResourcesPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import ResourcesPage from './pages/student/ResourcesPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';
import DashboardLayout from './components/DashboardLayout';
import ChatbotPage from './pages/shared/ChatbotPage';
import GenerateTimetablePage from './pages/faculty/GenerateTimetablePage';
import TimetableVotePage from './pages/student/TimetableVotePage';
import ViewTimetablePage from './pages/student/ViewTimetablePage';
import ChatLayout from './pages/shared/ChatLayout';


const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <DashboardLayout>
                    <div className="animate-fade-in-up">
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="create-user" element={<CreateUserPage />} />
                        <Route path="users" element={<ViewUsersPage />} />
                        <Route path="chatbot" element={<ChatbotPage />} />
                        <Route path="messages" element={<ChatLayout />} />
                        <Route path="profile" element={<AdminProfilePage />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                      </Routes>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/faculty/*" 
              element={
                <ProtectedRoute allowedRoles={[Role.FACULTY]}>
                  <DashboardLayout>
                    <div className="animate-fade-in-up">
                      <Routes>
                        <Route path="dashboard" element={<FacultyDashboard />} />
                        <Route path="classes" element={<AssignedClassesPage />} />
                        <Route path="attendance" element={<AttendancePage />} />
                        <Route path="upload-resources" element={<UploadResourcesPage />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="generate-timetable" element={<GenerateTimetablePage />} />
                        <Route path="chatbot" element={<ChatbotPage />} />
                        <Route path="messages" element={<ChatLayout />} />
                        <Route path="profile" element={<FacultyProfilePage />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                      </Routes>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                  <DashboardLayout>
                    <div className="animate-fade-in-up">
                      <Routes>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="timetable" element={<ViewTimetablePage />} />
                        <Route path="attendance" element={<StudentAttendancePage />} />
                        <Route path="vote-timetable" element={<TimetableVotePage />} />
                        <Route path="resources" element={<ResourcesPage />} />
                        <Route path="chatbot" element={<ChatbotPage />} />
                        <Route path="messages" element={<ChatLayout />} />
                        <Route path="profile" element={<StudentProfilePage />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                      </Routes>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;