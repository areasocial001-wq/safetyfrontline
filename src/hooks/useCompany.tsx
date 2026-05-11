import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Company {
  id: string;
  name: string;
  vat_number: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  zip_code: string | null;
  sector: string | null;
  employees_count: number | null;
  logo_url: string | null;
  ateco_code: string | null;
  certificate_template: string;
  certificate_theme_color: string;
  certificate_font: string;
  certificate_text_layout: string;
  certificate_logo_position: string;
  certificate_module_prefix: string;
  certificate_orientation: string;
}

export const useCompany = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) {
        setCompany(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get company through company_users junction table
        const { data, error } = await supabase
          .from('company_users')
          .select(`
            company_id,
            companies (
              id,
              name,
              vat_number,
              address,
              city,
              province,
              zip_code,
              sector,
              employees_count,
              logo_url,
              ateco_code,
              certificate_template,
              certificate_theme_color,
              certificate_font,
              certificate_text_layout,
              certificate_logo_position,
              certificate_module_prefix,
              certificate_orientation
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data && data.companies) {
          setCompany(data.companies as unknown as Company);
        } else {
          setCompany(null);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  return {
    company,
    loading,
  };
};
