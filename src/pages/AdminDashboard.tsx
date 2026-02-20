import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Shield, ArrowLeft, Users, Gamepad2, FileText, TrendingUp, Settings, Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { StatsCard } from '@/components/admin/StatsCard';
import { UsersTable } from '@/components/admin/UsersTable';
import { DemoSessionsTable } from '@/components/admin/DemoSessionsTable';
import { QuoteRequestsTable } from '@/components/admin/QuoteRequestsTable';
import { RoleManagement } from '@/components/admin/RoleManagement';
import { RequestsByStatusChart } from '@/components/admin/charts/RequestsByStatusChart';
import { SessionsByScenarioChart } from '@/components/admin/charts/SessionsByScenarioChart';
import { UsersByRoleChart } from '@/components/admin/charts/UsersByRoleChart';
import { TrainingRemindersControl } from '@/components/admin/TrainingRemindersControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDemoSessions: 0,
    totalQuoteRequests: 0,
    avgScore: 0,
  });

  const [chartData, setChartData] = useState({
    requestsByStatus: [] as Array<{ status: string; count: number }>,
    sessionsByScenario: [] as Array<{ scenario: string; count: number; avgScore: number }>,
    usersByRole: [] as Array<{ role: string; count: number }>,
  });

  useEffect(() => {
    // IMPORTANTE: aspettiamo che TUTTI i loading siano completi
    if (authLoading || roleLoading) {
      console.log('⏳ Still loading:', { authLoading, roleLoading, user: !!user });
      return;
    }

    console.log('🔍 AdminDashboard - Access check:', {
      userEmail: user?.email,
      isAdmin,
      role,
      hasUser: !!user
    });

    // Prima verifichiamo che ci sia un utente
    if (!user) {
      console.log('❌ No user - redirecting to /auth');
      navigate('/auth');
      return;
    }

    // POI verifichiamo che sia admin (il role loading è già completato)
    if (!isAdmin) {
      console.log('❌ User is not admin (role:', role, ') - redirecting to home');
      sonnerToast.error('Accesso negato. Solo gli amministratori possono accedere a questa pagina.');
      navigate('/');
      return;
    }

    console.log('✅ Admin access granted - role:', role);
  }, [isAdmin, role, authLoading, roleLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchChartData();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [usersRes, sessionsRes, quotesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('demo_sessions').select('score, max_score'),
        supabase.from('quote_requests').select('id', { count: 'exact', head: true }),
      ]);

      const totalUsers = usersRes.count || 0;
      const totalQuoteRequests = quotesRes.count || 0;
      const sessions = sessionsRes.data || [];
      const totalDemoSessions = sessions.length;

      let avgScore = 0;
      if (sessions.length > 0) {
        const totalPercentage = sessions.reduce((sum, session) => {
          return sum + (session.score / session.max_score) * 100;
        }, 0);
        avgScore = Math.round(totalPercentage / sessions.length);
      }

      setStats({
        totalUsers,
        totalDemoSessions,
        totalQuoteRequests,
        avgScore,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch requests by status
      const { data: requests } = await supabase
        .from('quote_requests')
        .select('status');
      
      const requestsByStatus = requests?.reduce((acc: any[], req) => {
        const status = req.status || 'nuovo';
        const existing = acc.find(item => item.status === status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status, count: 1 });
        }
        return acc;
      }, []) || [];

      // Fetch sessions by scenario
      const { data: sessions } = await supabase
        .from('demo_sessions')
        .select('scenario, score, max_score');
      
      const sessionsByScenario = sessions?.reduce((acc: any[], session) => {
        const existing = acc.find(item => item.scenario === session.scenario);
        const scorePercentage = (session.score / session.max_score) * 100;
        if (existing) {
          existing.count++;
          existing.totalScore += scorePercentage;
          existing.avgScore = existing.totalScore / existing.count;
        } else {
          acc.push({ 
            scenario: session.scenario, 
            count: 1, 
            totalScore: scorePercentage,
            avgScore: scorePercentage 
          });
        }
        return acc;
      }, []) || [];

      // Fetch users by role
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');
      
      const userIds = profiles?.map(p => p.id) || [];
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role, user_id')
        .in('user_id', userIds);
      
      const usersByRole = roles?.reduce((acc: any[], roleData) => {
        const existing = acc.find(item => item.role === roleData.role);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ role: roleData.role, count: 1 });
        }
        return acc;
      }, []) || [];

      setChartData({
        requestsByStatus,
        sessionsByScenario,
        usersByRole,
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  // Mostra loading mentre controlliamo l'autenticazione
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  // Se non è admin, non mostrare nulla (il redirect gestirà la navigazione)
  if (!user || !isAdmin) {
    return null;
  }

  const getSectionName = () => {
    switch (activeTab) {
      case 'users': return 'Utenti';
      case 'roles': return 'Gestione Ruoli';
      case 'sessions': return 'Sessioni Demo';
      case 'quotes': return 'Richieste Preventivo';
      case 'settings': return 'Impostazioni';
      default: return 'Panoramica';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="font-bold text-xl">Dashboard Admin</h1>
                <p className="text-xs text-muted-foreground">SicurAzienda Safety Frontline</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4" />
                Torna alla Home
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
                <BreadcrumbLink asChild>
                  <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard Admin
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-primary">
                  {getSectionName()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Benvenuto, Amministratore</h2>
          <p className="text-muted-foreground">
            Panoramica completa della piattaforma Safety Frontline
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <StatsCard
            title="Utenti Registrati"
            value={stats.totalUsers}
            icon={Users}
            description="Totale account creati"
          />
          <StatsCard
            title="Demo Giocate"
            value={stats.totalDemoSessions}
            icon={Gamepad2}
            description="Sessioni completate"
          />
          <StatsCard
            title="Richieste Preventivo"
            value={stats.totalQuoteRequests}
            icon={FileText}
            description="Richieste ricevute"
          />
          <StatsCard
            title="Punteggio Medio"
            value={`${stats.avgScore}%`}
            icon={TrendingUp}
            description="Media accuratezza demo"
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <h3 className="text-2xl font-bold mb-6">Statistiche Visive</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RequestsByStatusChart data={chartData.requestsByStatus} />
            <SessionsByScenarioChart data={chartData.sessionsByScenario} />
            <UsersByRoleChart data={chartData.usersByRole} />
          </div>
        </div>

        {/* Training Reminders Control */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '75ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Gestione Promemoria Training</h3>
            <div className="flex gap-2">
              <Link to="/admin/training-analytics">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4" />
                  Analytics Formazione
                </Button>
              </Link>
              <Link to="/admin/training-config">
                <Button variant="professional">
                  <Settings className="w-4 h-4" />
                  Configura Training
                </Button>
              </Link>
            </div>
          </div>
          <TrainingRemindersControl />
        </div>

        {/* Tabs for Data Tables */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Utenti
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="w-4 h-4 mr-2" />
                Ruoli
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Demo
              </TabsTrigger>
              <TabsTrigger value="quotes">
                <FileText className="w-4 h-4 mr-2" />
                Preventivi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UsersTable />
            </TabsContent>

            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>

            <TabsContent value="sessions">
              <DemoSessionsTable />
            </TabsContent>

            <TabsContent value="quotes">
              <QuoteRequestsTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
