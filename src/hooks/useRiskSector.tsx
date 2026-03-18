import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type RiskSector = 'basso' | 'medio' | 'alto';

export interface UserRiskSector {
  sector: RiskSector;
  is_self_assigned: boolean;
  assigned_by: string | null;
}

export const useRiskSector = () => {
  const { user } = useAuth();
  const [userSector, setUserSector] = useState<UserRiskSector | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSector = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    
    const { data } = await supabase
      .from('user_risk_sectors')
      .select('sector, is_self_assigned, assigned_by')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setUserSector({
        sector: data.sector as RiskSector,
        is_self_assigned: data.is_self_assigned,
        assigned_by: data.assigned_by,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSector(); }, [fetchSector]);

  const selectSector = useCallback(async (sector: RiskSector) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_risk_sectors')
      .upsert({
        user_id: user.id,
        sector,
        is_self_assigned: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (!error) {
      setUserSector({ sector, is_self_assigned: true, assigned_by: null });
    }
    return error;
  }, [user]);

  return { userSector, loading, selectSector, refetch: fetchSector };
};

export const SECTOR_INFO: Record<RiskSector, { label: string; hours: number; modules: number; color: string; description: string }> = {
  basso: {
    label: 'Rischio Basso',
    hours: 4,
    modules: 4,
    color: 'text-green-600',
    description: 'Uffici, commercio, turismo, servizi, artigianato non esposto',
  },
  medio: {
    label: 'Rischio Medio',
    hours: 8,
    modules: 8,
    color: 'text-yellow-600',
    description: 'Agricoltura, pesca, PA, trasporti, magazzinaggio',
  },
  alto: {
    label: 'Rischio Alto',
    hours: 12,
    modules: 12,
    color: 'text-red-600',
    description: 'Costruzioni, industria, chimica, sanità, rifiuti',
  },
};
