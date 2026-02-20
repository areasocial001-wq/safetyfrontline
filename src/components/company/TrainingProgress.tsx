import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Package, Building2, Warehouse, AlertCircle, Settings } from 'lucide-react';

interface ModuleProgress {
  scenario: string;
  name: string;
  icon: any;
  completions: number;
  avgScore: number;
}

interface TrainingProgressProps {
  companyId: string;
}

export const TrainingProgress = ({ companyId }: TrainingProgressProps) => {
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModulesProgress();
  }, [companyId]);

  const fetchModulesProgress = async () => {
    setLoading(true);
    try {
      // Get all company employees
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('user_id')
        .eq('company_id', companyId);

      if (companyUsersError) throw companyUsersError;

      const userIds = companyUsers?.map((cu) => cu.user_id) || [];

      if (userIds.length === 0) {
        setModules([]);
        setLoading(false);
        return;
      }

      // Get employee roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'employee');

      if (rolesError) throw rolesError;

      const employeeIds = roles?.map((r) => r.user_id) || [];

      // Get all demo sessions for employees
      const { data: sessions, error: sessionsError } = await supabase
        .from('demo_sessions')
        .select('scenario, score, max_score, completed')
        .in('user_id', employeeIds)
        .eq('completed', true);

      if (sessionsError) throw sessionsError;

      // Calculate stats per module
      const moduleNames: Record<string, { name: string; icon: any }> = {
        general: { name: 'Safety Run', icon: Package },
        office: { name: 'Office Hazard Quest', icon: Building2 },
        warehouse: { name: 'Magazzino 2.5D', icon: Warehouse },
      };

      const modulesData = Object.entries(moduleNames).map(([scenario, info]) => {
        const scenarioSessions = sessions?.filter((s) => s.scenario === scenario) || [];
        const completions = scenarioSessions.length;
        const avgScore =
          completions > 0
            ? Math.round(
                scenarioSessions.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) /
                  completions
              )
            : 0;

        return {
          scenario,
          name: info.name,
          icon: info.icon,
          completions,
          avgScore,
        };
      });

      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching modules progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold">Progressi Formazione</h3>
        <p className="text-sm text-muted-foreground">
          Monitoraggio completamento moduli per scenario
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.scenario} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <module.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{module.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {module.completions} completamenti
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{module.avgScore}%</p>
                  <p className="text-xs text-muted-foreground">Punteggio medio</p>
                </div>
              </div>
              <Progress value={module.avgScore} className="h-2" />
            </div>
          ))}

          {modules.every((m) => m.completions === 0) && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nessuna sessione completata ancora
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                I dipendenti devono completare le demo per visualizzare i progressi
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
