import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'company_client' | 'employee';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setRole(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uid)
        .maybeSingle();
      if (error) throw error;
      const roleValue = (data?.role as UserRole) || null;
      setRole(roleValue);
      return roleValue;
    } catch (e) {
      console.error('useUserRole - error:', e);
      setRole(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchRole(userId);
  }, [userId, authLoading, fetchRole]);

  const refresh = useCallback(async () => {
    // Force refresh of the auth session (re-reads JWT claims) then refetch role
    await supabase.auth.refreshSession();
    const { data: { user: refreshed } } = await supabase.auth.getUser();
    return await fetchRole(refreshed?.id ?? userId);
  }, [fetchRole, userId]);

  return useMemo(() => ({
    role,
    loading,
    isAdmin: role === 'admin',
    isCompanyClient: role === 'company_client',
    isEmployee: role === 'employee',
    refresh,
  }), [role, loading, refresh]);
};
