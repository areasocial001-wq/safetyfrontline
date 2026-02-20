import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, Building2, Warehouse, Calendar } from 'lucide-react';

interface Module {
  scenario: string;
  name: string;
  icon: any;
  completions: number;
  bestScore: number;
  avgScore: number;
  lastPlayed: string | null;
}

interface ModulesProgressProps {
  userId: string;
}

export const ModulesProgress = ({ userId }: ModulesProgressProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModulesProgress();
  }, [userId]);

  const fetchModulesProgress = async () => {
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('demo_sessions')
        .select('scenario, score, max_score, completed, created_at')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const moduleNames: Record<string, { name: string; icon: any }> = {
        general: { name: 'Safety Run', icon: Package },
        office: { name: 'Office Hazard Quest', icon: Building2 },
        warehouse: { name: 'Magazzino 2.5D', icon: Warehouse },
      };

      const modulesData = Object.entries(moduleNames).map(([scenario, info]) => {
        const scenarioSessions = sessions?.filter((s) => s.scenario === scenario) || [];
        const completions = scenarioSessions.length;
        
        const scores = scenarioSessions.map((s) => (s.score / s.max_score) * 100);
        const bestScore = completions > 0 ? Math.round(Math.max(...scores)) : 0;
        const avgScore = completions > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / completions) : 0;
        
        const lastPlayed = scenarioSessions.length > 0 ? scenarioSessions[0].created_at : null;

        return {
          scenario,
          name: info.name,
          icon: info.icon,
          completions,
          bestScore,
          avgScore,
          lastPlayed,
        };
      });

      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching modules progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Mai giocato';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold">Moduli di Formazione</h3>
        <p className="text-sm text-muted-foreground">I tuoi progressi per ogni modulo</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.scenario} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <module.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{module.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {formatDate(module.lastPlayed)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={module.completions > 0 ? 'default' : 'outline'}>
                    {module.completions} {module.completions === 1 ? 'volta' : 'volte'}
                  </Badge>
                </div>
              </div>

              {module.completions > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Miglior Punteggio</p>
                      <p className="text-xl font-bold text-primary">{module.bestScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Punteggio Medio</p>
                      <p className="text-xl font-bold">{module.avgScore}%</p>
                    </div>
                  </div>
                  <Progress value={module.bestScore} className="h-2" />
                </>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                  Non hai ancora completato questo modulo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
