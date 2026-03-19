import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompany } from '@/hooks/useCompany';
import { Shield, ArrowLeft, Building, Home, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { CompanyStatsCards } from '@/components/company/CompanyStatsCards';
import { EmployeesTable } from '@/components/company/EmployeesTable';
import { TrainingProgress } from '@/components/company/TrainingProgress';
import { CompanyLogoUpload } from '@/components/company/CompanyLogoUpload';
import { CertificateEditor } from '@/components/company/CertificateEditor';
import { BatchCertificateExport } from '@/components/company/BatchCertificateExport';
import { ComplianceReport } from '@/components/company/ComplianceReport';
import { ModuleCompletionHistory } from '@/components/company/ModuleCompletionHistory';
import { CompletionsByModuleChart } from '@/components/company/CompletionsByModuleChart';
import { ScoreTrendChart } from '@/components/company/ScoreTrendChart';
import { DashboardPDFExport } from '@/components/company/DashboardPDFExport';
import { EmployeeSectorAssignment } from '@/components/company/EmployeeSectorAssignment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CompanyDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isCompanyClient, loading: roleLoading } = useUserRole();
  const { company, loading: companyLoading } = useCompany();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeSessions: 0,
    averageScore: 0,
    completedModules: 0,
  });

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isCompanyClient) {
      toast.error('Accesso negato. Solo le aziende clienti possono accedere a questa pagina.');
      navigate('/');
      return;
    }
  }, [user, isCompanyClient, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (company?.id) {
      fetchStats();
      // Fetch unread notification count
      supabase
        .from('admin_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_read', false)
        .then(({ count }) => setUnreadNotifCount(count || 0));

      // Realtime for bell badge
      const bellChannel = supabase
        .channel('bell-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `company_id=eq.${company.id}`,
        }, () => setUnreadNotifCount(prev => prev + 1))
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_notifications',
          filter: `company_id=eq.${company.id}`,
        }, (payload) => {
          if ((payload.new as any).is_read) {
            setUnreadNotifCount(prev => Math.max(0, prev - 1));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(bellChannel); };
    }
  }, [company]);

  const fetchStats = async () => {
    if (!company?.id) return;

    try {
      // Get company employees
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('user_id')
        .eq('company_id', company.id);

      if (companyUsersError) throw companyUsersError;

      const userIds = companyUsers?.map((cu) => cu.user_id) || [];

      // Get employee roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'employee');

      if (rolesError) throw rolesError;

      const employeeIds = roles?.map((r) => r.user_id) || [];
      const totalEmployees = employeeIds.length;

      // Get demo sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('demo_sessions')
        .select('score, max_score, completed')
        .in('user_id', employeeIds);

      if (sessionsError) throw sessionsError;

      const activeSessions = sessions?.filter((s) => !s.completed).length || 0;
      const completedSessions = sessions?.filter((s) => s.completed) || [];
      const completedModules = completedSessions.length;
      
      const averageScore =
        completedSessions.length > 0
          ? Math.round(
              completedSessions.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) /
                completedSessions.length
            )
          : 0;

      setStats({
        totalEmployees,
        activeSessions,
        averageScore,
        completedModules,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Errore nel caricamento delle statistiche');
    }
  };

  if (authLoading || roleLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Azienda non trovata</p>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Building className="w-6 h-6 text-primary" />
                  {company.name}
                </h1>
                <p className="text-sm text-muted-foreground">Dashboard Aziendale</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DashboardPDFExport companyId={company.id} companyName={company.name} stats={stats} />
              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                  const el = document.getElementById('completion-history');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-[10px] px-1 py-0 rounded-full"
                  >
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </Badge>
                )}
              </Button>
            </div>
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
                  <Building className="w-4 h-4" />
                  <span>Dashboard Azienda</span>
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
          <CompanyStatsCards
            totalEmployees={stats.totalEmployees}
            activeSessions={stats.activeSessions}
            averageScore={stats.averageScore}
            completedModules={stats.completedModules}
          />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Employees + Chart */}
            <div className="lg:col-span-2 space-y-6">
              <EmployeeSectorAssignment companyId={company.id} />
              <EmployeesTable companyId={company.id} />
              <CompletionsByModuleChart companyId={company.id} />
              <ScoreTrendChart companyId={company.id} />
            </div>

            {/* Right Column - Notifications, Logo, Training Progress */}
            <div className="space-y-6">
              <div id="completion-history">
                <ModuleCompletionHistory companyId={company.id} />
              </div>
              <CompanyLogoUpload
                companyId={company.id}
                currentLogoUrl={company.logo_url}
                onLogoUpdated={() => setRefreshKey((prev) => prev + 1)}
              />
              <TrainingProgress companyId={company.id} />
            </div>
          </div>

          {/* Certificate Editor and Batch Export - Full Width */}
          <div className="mt-8 space-y-6">
            {/* Compliance Report */}
            <ComplianceReport companyId={company.id} />
            
            <BatchCertificateExport companyId={company.id} />
            
            <CertificateEditor 
              companyId={company.id}
              currentSettings={{
                certificate_template: company.certificate_template || 'formale',
                certificate_theme_color: company.certificate_theme_color || '#3B82F6',
                certificate_font: company.certificate_font || 'helvetica',
                certificate_text_layout: company.certificate_text_layout || 'centered',
                certificate_logo_position: company.certificate_logo_position || 'top-left',
                logo_url: company.logo_url,
              }}
              onUpdate={() => setRefreshKey((prev) => prev + 1)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
