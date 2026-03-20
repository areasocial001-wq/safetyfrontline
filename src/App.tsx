import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import Demo3D from "./pages/Demo3D";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Profile from "./pages/Profile";
import PlayerProfile from "./pages/PlayerProfile";
import ResetPassword from "./pages/ResetPassword";
import VerifyCertificate from "./pages/VerifyCertificate";
import TrainingConfig from "./pages/TrainingConfig";
import SoundStudio from "./pages/SoundStudio";
import TechnicalSheet from "./pages/TechnicalSheet";
import TrainingHub from "./pages/TrainingHub";
import TrainingModule from "./pages/TrainingModule";
import TrainingAnalytics from "./pages/TrainingAnalytics";
import GuidePage from "./pages/GuidePage";
import MyCertificates from "./pages/MyCertificates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/demo-3d" element={<Demo3D />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/training-config" element={<TrainingConfig />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/player-profile" element={<PlayerProfile />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/sound-studio" element={<SoundStudio />} />
          <Route path="/scheda-tecnica" element={<TechnicalSheet />} />
          <Route path="/formazione" element={<TrainingHub />} />
          <Route path="/formazione/:moduleId" element={<TrainingModule />} />
          <Route path="/admin/training-analytics" element={<TrainingAnalytics />} />
          <Route path="/guida" element={<GuidePage />} />
          <Route path="/i-miei-attestati" element={<MyCertificates />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
