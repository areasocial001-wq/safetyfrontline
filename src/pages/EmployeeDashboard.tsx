import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Shield, ArrowLeft, User, Play, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { ProgressStats } from '@/components/employee/ProgressStats';
import { ModulesProgress } from '@/components/employee/ModulesProgress';
import { RecentSessions } from '@/components/employee/RecentSessions';
import { Certificates } from '@/components/employee/Certificates';
import { EmployeeNotifications } from '@/components/employee/EmployeeNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmployeeDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isEmployee, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    averageScore: 0,
    totalTimeMinutes: 0,
  });

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isEmployee) {
      toast.error('Accesso negato. Solo i dipendenti possono accedere a questa pagina.');
      navigate('/');
      return;
    }
  }, [user, isEmployee, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: sessions, error } = await supabase
        .from('demo_sessions')
        .select('score, max_score, completion_time, completed')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter((s) => s.completed).length || 0;
      
      const completedSessionsData = sessions?.filter((s) => s.completed) || [];
      const averageScore =
        completedSessionsData.length > 0
          ? Math.round(
              completedSessionsData.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) /
                completedSessionsData.length
            )
          : 0;

      const totalTimeSeconds = completedSessionsData.reduce(
        (sum, s) => sum + (s.completion_time || 0),
        0
      );
      const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

      setStats({
        totalSessions,
        completedSessions,
        averageScore,
        totalTimeMinutes,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Errore nel caricamento delle statistiche');
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  La Mia Formazione
                </h1>
                <p className="text-sm text-muted-foreground">Dashboard Personale</p>
              </div>
            </div>
            <Link to="/demo">
              <Button variant="hero" className="gap-2">
                <Play className="w-4 h-4" />
                Nuova Sessione
              </Button>
            </Link>
          </div>

          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-primary">
                  <User className="w-4 h-4" />
                  <span>Dashboard Dipendente</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <ProgressStats
            totalSessions={stats.totalSessions}
            completedSessions={stats.completedSessions}
            averageScore={stats.averageScore}
            totalTimeMinutes={stats.totalTimeMinutes}
          />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Modules Progress */}
            <div className="lg:col-span-2 space-y-6">
              <ModulesProgress userId={user!.id} />
              <RecentSessions userId={user!.id} />
            </div>

            {/* Right Column - Notifications + Certificates */}
            <div className="space-y-6">
              <EmployeeNotifications />
              <Certificates userId={user!.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
