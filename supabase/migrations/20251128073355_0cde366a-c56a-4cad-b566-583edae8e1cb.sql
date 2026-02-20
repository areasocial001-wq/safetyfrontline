-- Create table for training reminder configuration
CREATE TABLE IF NOT EXISTS public.training_reminder_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for company-specific mandatory modules
CREATE TABLE IF NOT EXISTS public.company_mandatory_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_id text NOT NULL CHECK (module_id IN ('office', 'warehouse', 'general')),
  is_mandatory boolean NOT NULL DEFAULT true,
  deadline_date timestamp with time zone,
  grace_period_days integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, module_id)
);

-- Enable RLS on new tables
ALTER TABLE public.training_reminder_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_mandatory_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_reminder_config (only admins can manage)
CREATE POLICY "Admins can view reminder config"
  ON public.training_reminder_config
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reminder config"
  ON public.training_reminder_config
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert reminder config"
  ON public.training_reminder_config
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS policies for company_mandatory_modules
CREATE POLICY "Admins can view all mandatory modules"
  ON public.company_mandatory_modules
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage mandatory modules"
  ON public.company_mandatory_modules
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company admins can view their mandatory modules"
  ON public.company_mandatory_modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = company_mandatory_modules.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.is_admin = true
    )
  );

-- Trigger for updated_at on training_reminder_config
CREATE TRIGGER update_training_reminder_config_updated_at
  BEFORE UPDATE ON public.training_reminder_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on company_mandatory_modules
CREATE TRIGGER update_company_mandatory_modules_updated_at
  BEFORE UPDATE ON public.company_mandatory_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default reminder configuration
INSERT INTO public.training_reminder_config (frequency, enabled)
VALUES ('weekly', true)
ON CONFLICT DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_company_mandatory_modules_company_id 
  ON public.company_mandatory_modules(company_id);

CREATE INDEX IF NOT EXISTS idx_company_mandatory_modules_deadline 
  ON public.company_mandatory_modules(deadline_date) 
  WHERE deadline_date IS NOT NULL;