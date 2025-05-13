import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import 'highlight.js/styles/github.css';

import DashboardLayout from "@/components/layout/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Pomodoro from "@/pages/Pomodoro";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/NotFound";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import AITutor from "@/pages/AITutor";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Materials from "@/pages/Materials";
import Landing from "@/pages/Landing";
import WeeklyTime from "@/pages/WeeklyTime";
import StreakTracker from "@/pages/StreakTracker";
import Inspiration from "@/pages/Inspiration";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Landing />} />
    <Route path="/landing" element={<Navigate to="/" replace />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    
    {/* Dashboard Routes - Protected */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="pomodoro" element={<Pomodoro />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="ai-tutor" element={<AITutor />} />
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route path="materials" element={<Materials />} />
      <Route path="weeklytime" element={<WeeklyTime />} />
      <Route path="streak-tracker" element={<StreakTracker />} />
      <Route path="inspiration" element={<Inspiration />} />
      <Route path="*" element={<NotFound />} />
    </Route>
    
    {/* Fallback route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ChatProvider>
        <BrowserRouter>
          <AuthProvider>
            <TimeTrackingProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TimeTrackingProvider>
          </AuthProvider>
        </BrowserRouter>
      </ChatProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
