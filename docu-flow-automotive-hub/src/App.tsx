import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import FormBuilder from "./pages/FormBuilder";
import FillForm from "./pages/FillForm";
import FormApproval from "./pages/FormApproval";
import FormSubmissions from "./pages/FormSubmissions";
import JobVerification from "./pages/JobVerification";
import MySubmissions from "./pages/MySubmissions";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DataVisualization from "./pages/DataVisualization";
import PDFVersions from "./pages/PDFVersions";
import ExcelUpload from "./pages/ExcelUpload";
import MachineSetup from "./pages/MachineSetup";
import ToolSetup from "./pages/ToolSetup";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="forms" element={<Forms />} />
              <Route path="form-builder" element={<FormBuilder />} />
              <Route path="fill-form/:formId" element={<FillForm />} />
              <Route path="form-approval" element={<FormApproval />} />
              <Route path="form-submissions" element={<FormSubmissions />} />
              <Route path="job-verification" element={<JobVerification />} />
              <Route path="my-submissions" element={<MySubmissions />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="data-visualization" element={<DataVisualization />} />
              <Route path="pdf-versions" element={<PDFVersions />} />
              <Route path="excel-upload" element={<ExcelUpload />} />
              <Route path="machine-setup" element={<MachineSetup />} />
              <Route path="tool-setup" element={<ToolSetup />} />
              <Route path="audit-log" element={<AuditLog />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
