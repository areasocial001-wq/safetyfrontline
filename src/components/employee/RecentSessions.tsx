import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, TrendingUp, Package, Building2, Warehouse } from 'lucide-react';

interface Session {
  id: string;
  scenario: string;
  score: number;
  max_score: number;
  completion_time: number | null;
  created_at: string;
}

interface RecentSessionsProps {
  userId: string;
}

export const RecentSessions = ({ userId }: RecentSessionsProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSessions();
  }, [userId]);

  const fetchRecentSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('id, scenario, score, max_score, completion_time, created_at')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScenarioName = (scenario: string) => {
    const names: Record<string, string> = {
      general: 'Safety Run',
      office: 'Office Hazard Quest',
      warehouse: 'Magazzino 2.5D',
    };
    return names[scenario] || scenario;
  };

  const getScenarioIcon = (scenario: string) => {
    const icons: Record<string, any> = {
      general: Package,
      office: Building2,
      warehouse: Warehouse,
    };
    return icons[scenario] || Package;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold">Sessioni Recenti</h3>
        <p className="text-sm text-muted-foreground">Le tue ultime 10 sessioni completate</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nessuna sessione completata</p>
          <p className="text-sm text-muted-foreground mt-2">
            Completa una demo per vedere i tuoi progressi qui
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modulo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Punteggio</TableHead>
                <TableHead className="text-center">Tempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const Icon = getScenarioIcon(session.scenario);
                const percentage = Math.round((session.score / session.max_score) * 100);
                
                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-medium">{getScenarioName(session.scenario)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(session.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          percentage >= 80
                            ? 'default'
                            : percentage >= 60
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {percentage}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-mono">
                        {formatTime(session.completion_time)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
