import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield, ArrowLeft, GraduationCap, Clock, Target, TrendingUp,
  AlertTriangle, Users, BarChart3, Home, ChevronRight, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast as sonnerToast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', '#f59e0b', '#8b5cf6', '#06b6d4'];

const TrainingAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState<any[]>([]);
  const [bossResults, setBossResults] = useState<any[]>([]);
  const [timerLogs, setTimerLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (!isAdmin) {
      sonnerToast.error('Accesso negato.');
      navigate('/');
      return;
    }
    fetchData();
  }, [authLoading, roleLoading, user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [progressRes, bossRes, timerRes] = await Promise.all([
      supabase.from('training_progress').select('*'),
      supabase.from('boss_test_results').select('*'),
      supabase.from('training_timer_logs').select('*'),
    ]);
    setProgressData(progressRes.data || []);
    setBossResults(bossRes.data || []);
    setTimerLogs(timerRes.data || []);
    setLoading(false);
  };

  // Compute analytics
  const analytics = useMemo(() => {
    // Completion rate per module
    const moduleMap = new Map<string, { total: number; completed: number; totalTime: number }>();
    progressData.forEach(p => {
      if (!moduleMap.has(p.module_id)) moduleMap.set(p.module_id, { total: 0, completed: 0, totalTime: 0 });
      const m = moduleMap.get(p.module_id)!;
      m.total++;
      if (p.status === 'completed') m.completed++;
      m.totalTime += p.time_spent_seconds || 0;
    });

    const completionByModule = Array.from(moduleMap.entries()).map(([id, data]) => ({
      module: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      moduleId: id,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      avgTimeMin: data.total > 0 ? Math.round(data.totalTime / data.total / 60) : 0,
      total: data.total,
      completed: data.completed,
    }));

    // Boss test pass rate
    const bossPassRate = bossResults.length > 0
      ? Math.round(bossResults.filter(b => b.passed).length / bossResults.length * 100)
      : 0;

    // Most failed questions from boss test answers
    const questionFailMap = new Map<string, number>();
    bossResults.forEach(result => {
      if (result.answers && typeof result.answers === 'object') {
        // answers is a record of questionId -> answerIndex; we don't know correct here
        // so we track failed tests' answers
        if (!result.passed) {
          Object.keys(result.answers).forEach(qId => {
            questionFailMap.set(qId, (questionFailMap.get(qId) || 0) + 1);
          });
        }
      }
    });

    const mostFailedQuestions = Array.from(questionFailMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([qId, count]) => ({ questionId: qId, failCount: count }));

    // Overall stats
    const totalStudents = new Set(progressData.map(p => p.user_id)).size;
    const totalCompleted = progressData.filter(p => p.status === 'completed').length;
    const avgXp = progressData.length > 0
      ? Math.round(progressData.reduce((s, p) => s + (p.xp_earned || 0), 0) / totalStudents || 0)
      : 0;

    // Status distribution
    const statusCounts = progressData.reduce((acc: Record<string, number>, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status === 'completed' ? 'Completato' : status === 'in_progress' ? 'In Corso' : status === 'locked' ? 'Bloccato' : status,
      value: count as number,
    }));

    return {
      completionByModule,
      bossPassRate,
      mostFailedQuestions,
      totalStudents,
      totalCompleted,
      avgXp,
      statusDistribution,
    };
  }, [progressData, bossResults]);

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              <div>
                <h1 className="font-bold text-xl">Analytics Formazione</h1>
                <p className="text-xs text-muted-foreground">Statistiche di apprendimento</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-1" /> Admin</Button>
            </Link>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><Home className="w-4 h-4" /><span>Home</span></Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
              <BreadcrumbItem><BreadcrumbPage className="font-semibold text-primary">Analytics Formazione</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Studenti Attivi</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalCompleted}</p>
                <p className="text-xs text-muted-foreground">Moduli Completati</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.bossPassRate}%</p>
                <p className="text-xs text-muted-foreground">Tasso Superamento Boss</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.avgXp}</p>
                <p className="text-xs text-muted-foreground">XP Medio per Studente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate by Module */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Tasso Completamento per Modulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.completionByModule.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.completionByModule}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="module" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis unit="%" />
                    <Tooltip formatter={(v: number) => [`${v}%`, 'Completamento']} />
                    <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nessun dato disponibile</p>
              )}
            </CardContent>
          </Card>

          {/* Average Time per Module */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" /> Tempo Medio per Modulo (minuti)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.completionByModule.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.completionByModule}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="module" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis unit=" min" />
                    <Tooltip formatter={(v: number) => [`${v} min`, 'Tempo medio']} />
                    <Bar dataKey="avgTimeMin" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nessun dato disponibile</p>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Distribuzione Stato Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics.statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {analytics.statusDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nessun dato disponibile</p>
              )}
            </CardContent>
          </Card>

          {/* Most Failed Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Argomenti più Sbagliati
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.mostFailedQuestions.length > 0 ? (
                <div className="space-y-3">
                  {analytics.mostFailedQuestions.map((q, i) => (
                    <div key={q.questionId} className="flex items-center gap-3">
                      <Badge variant={i < 3 ? 'destructive' : 'secondary'} className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">
                        {i + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-mono">{q.questionId}</p>
                        <Progress value={Math.min(100, (q.failCount / (analytics.totalStudents || 1)) * 100)} className="h-1.5 mt-1" />
                      </div>
                      <div className="flex items-center gap-1 text-destructive">
                        <XCircle className="w-3 h-3" />
                        <span className="text-sm font-bold">{q.failCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nessun dato disponibile</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Module Details Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dettaglio per Modulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Modulo</th>
                    <th className="text-center py-2 px-3 font-medium">Studenti</th>
                    <th className="text-center py-2 px-3 font-medium">Completati</th>
                    <th className="text-center py-2 px-3 font-medium">Tasso</th>
                    <th className="text-center py-2 px-3 font-medium">Tempo Medio</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.completionByModule.map(m => (
                    <tr key={m.moduleId} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{m.module}</td>
                      <td className="py-2 px-3 text-center">{m.total}</td>
                      <td className="py-2 px-3 text-center">{m.completed}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={m.rate >= 70 ? 'default' : m.rate >= 40 ? 'secondary' : 'destructive'}>
                          {m.rate}%
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">{m.avgTimeMin} min</td>
                    </tr>
                  ))}
                  {analytics.completionByModule.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nessun dato</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TrainingAnalytics;
