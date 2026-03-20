import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'company_client' | 'employee';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id; // Stabilize with just the ID
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (import.meta.env.DEV) console.log('🔍 useUserRole - fetchRole called, authLoading:', authLoading);
      
      // Se auth sta ancora caricando, aspetta
      if (authLoading) {
        if (import.meta.env.DEV) console.log('⏳ useUserRole - Auth still loading, waiting...');
        return;
      }
      
      // Se auth ha finito ma non c'è userId, allora l'utente non è loggato
      if (!userId) {
        if (import.meta.env.DEV) console.log('⚠️ useUserRole - No userId, user not logged in');
        setRole(null);
        setLoading(false);
        return;
      }

      // Impostiamo loading a true mentre facciamo la fetch
      setLoading(true);

      try {
        console.log('📡 useUserRole - Fetching role from database for userId:', userId);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        console.log('📊 useUserRole - Query result:', { data, error });
        
        if (error) {
          console.error('❌ useUserRole - Error from Supabase:', error);
          throw error;
        }
        
        const roleValue = data?.role as UserRole || null;
        console.log('✅ useUserRole - Role set to:', roleValue);
        setRole(roleValue);
      } catch (error) {
        console.error('❌ useUserRole - Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [userId, authLoading]); // Depend on both userId and authLoading

  // Memoize result to prevent re-renders
  return useMemo(() => ({
    role,
    loading,
    isAdmin: role === 'admin',
    isCompanyClient: role === 'company_client',
    isEmployee: role === 'employee',
  }), [role, loading]);
};
