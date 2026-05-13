import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";

// Lazy-load secondary routes to reduce initial bundle
const Demo3D = lazy(() => import("./pages/Demo3D"));
const Auth = lazy(() => import("./pages/Auth"));
const Register = lazy(() => import("./pages/Register"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const PlayerProfile = lazy(() => import("./pages/PlayerProfile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const TrainingConfig = lazy(() => import("./pages/TrainingConfig"));
const SoundStudio = lazy(() => import("./pages/SoundStudio"));
const TechnicalSheet = lazy(() => import("./pages/TechnicalSheet"));
const TrainingHub = lazy(() => import("./pages/TrainingHub"));
const TrainingModule = lazy(() => import("./pages/TrainingModule"));
const TrainingAnalytics = lazy(() => import("./pages/TrainingAnalytics"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const MyCertificates = lazy(() => import("./pages/MyCertificates"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PresetTestPage = lazy(() => import("./pages/PresetTestPage"));
const SpotTheHazardPage = lazy(() => import("./pages/SpotTheHazardPage"));
const DemoPath = lazy(() => import("./pages/DemoPath"));
const BonusModules = lazy(() => import("./pages/BonusModules"));
const ROICalculatorPage = lazy(() => import("./pages/ROICalculatorPage"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Navigate to="/spot-the-hazard" replace />} />
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
              <Route path="/preset-test" element={<PresetTestPage />} />
              <Route path="/spot-the-hazard" element={<SpotTheHazardPage />} />
              <Route path="/demo-percorso" element={<DemoPath />} />
              <Route path="/moduli-bonus" element={<BonusModules />} />
              <Route path="/roi" element={<ROICalculatorPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
