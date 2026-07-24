import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import UploadPapers from "./pages/UploadPapers";
import EvalDetails from "./pages/EvalDetails";
import StudentResults from "./pages/StudentResults";
import Profile from "./pages/Profile";
import AdminManageUsers from "./pages/AdminManageUsers";
import AdminManageExams from "./pages/AdminManageExams";
import AdminManageSubjects from "./pages/AdminManageSubjects";
import AdminAllEvaluations from "./pages/AdminAllEvaluations";
import AdminModelAnswers from "./pages/AdminModelAnswers";
import StudentDashboard from "./pages/StudentDashboard";
import StudentMyResults from "./pages/StudentMyResults";
import StudentResultDetail from "./pages/StudentResultDetail";
import StudentProfile from "./pages/StudentProfile";
import InstructorStudents from "./pages/InstructorStudents";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageUsers /></ProtectedRoute>} />
          <Route path="/manage-exams" element={<ProtectedRoute allowedRoles={['admin', 'instructor']}><AdminManageExams /></ProtectedRoute>} />
          <Route path="/manage-subjects" element={<ProtectedRoute allowedRoles={['admin', 'instructor']}><AdminManageSubjects /></ProtectedRoute>} />
          <Route path="/model-answers" element={<ProtectedRoute allowedRoles={['admin', 'instructor']}><AdminModelAnswers /></ProtectedRoute>} />
          <Route path="/all-evaluations" element={<ProtectedRoute allowedRoles={['admin']}><AdminAllEvaluations /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Instructor routes */}
          <Route path="/instructor-dashboard" element={<ProtectedRoute allowedRoles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor-students" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorStudents /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><UploadPapers /></ProtectedRoute>} />
          <Route path="/eval-details" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><EvalDetails /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><StudentResults /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student-results" element={<ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />
          <Route path="/my-results" element={<ProtectedRoute allowedRoles={['student']}><StudentMyResults /></ProtectedRoute>} />
          <Route path="/result-detail/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentResultDetail /></ProtectedRoute>} />
          <Route path="/student-profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
