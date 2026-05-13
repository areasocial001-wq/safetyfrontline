import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ModuleProgress {
  module_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  current_section: number;
  total_sections: number;
  score: number;
  max_score: number;
  xp_earned: number;
  time_spent_seconds: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface UserXP {
  total_xp: number;
  level: number;
}

export const useTrainingProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [userXp, setUserXp] = useState<UserXP>({ total_xp: 0, level: 1 });
  const xpRef = useRef<UserXP>({ total_xp: 0, level: 1 });
  const xpQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    
    const { data } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', user.id);
    
    if (data) {
      setProgress(data.map(d => ({
        module_id: d.module_id,
        status: d.status as ModuleProgress['status'],
        current_section: d.current_section,
        total_sections: d.total_sections,
        score: d.score,
        max_score: d.max_score,
        xp_earned: d.xp_earned,
        time_spent_seconds: d.time_spent_seconds,
        started_at: d.started_at,
        completed_at: d.completed_at,
      })));
    }

    const { data: xpData } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (xpData) {
      xpRef.current = { total_xp: xpData.total_xp, level: xpData.level };
      setUserXp(xpRef.current);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const initializeProgress = useCallback(async (moduleId: string, totalSections: number) => {
    if (!user) return;
    
    const existing = progress.find(p => p.module_id === moduleId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('training_progress')
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        status: 'in_progress',
        total_sections: totalSections,
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id,module_id' })
      .select()
      .single();

    if (!error && data) {
      await fetchProgress();
    }
    return data;
  }, [user, progress, fetchProgress]);

  const updateProgress = useCallback(async (
    moduleId: string, 
    updates: Partial<Pick<ModuleProgress, 'current_section' | 'score' | 'max_score' | 'xp_earned' | 'time_spent_seconds' | 'status' | 'completed_at'>>
  ) => {
    if (!user) return;
    
    await supabase
      .from('training_progress')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('module_id', moduleId);

    await fetchProgress();
  }, [user, fetchProgress]);

  const addXp = useCallback(async (amount: number) => {
    if (!user) return;

    // Serialize concurrent calls and use a ref so each call sees the latest total
    const run = async () => {
      const newTotal = xpRef.current.total_xp + amount;
      const newLevel = Math.floor(newTotal / 200) + 1;
      xpRef.current = { total_xp: newTotal, level: newLevel };
      setUserXp(xpRef.current);

      await supabase
        .from('user_xp')
        .upsert({
          user_id: user.id,
          total_xp: newTotal,
          level: newLevel,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    };

    xpQueueRef.current = xpQueueRef.current.then(run, run);
    return xpQueueRef.current;
  }, [user]);

  const getModuleProgress = useCallback((moduleId: string) => {
    return progress.find(p => p.module_id === moduleId);
  }, [progress]);

  return {
    progress,
    userXp,
    loading,
    initializeProgress,
    updateProgress,
    addXp,
    getModuleProgress,
    refetch: fetchProgress,
  };
};
