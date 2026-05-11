-- Reusable training packages (templates)
CREATE TABLE public.training_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_package_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.training_packages(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  module_order integer NOT NULL DEFAULT 0,
  grace_period_days integer NOT NULL DEFAULT 30,
  deadline_offset_days integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, module_id)
);

CREATE TABLE public.company_training_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.training_packages(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid,
  deadline_date timestamptz,
  UNIQUE (company_id, package_id)
);

ALTER TABLE public.training_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_package_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_training_packages ENABLE ROW LEVEL SECURITY;

-- Admins manage everything
CREATE POLICY "Admins manage packages" ON public.training_packages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins manage package modules" ON public.training_package_modules
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins manage company packages" ON public.company_training_packages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Authenticated can view package catalog
CREATE POLICY "Authenticated view packages" ON public.training_packages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated view package modules" ON public.training_package_modules
  FOR SELECT TO authenticated USING (true);

-- Company admins can view their assignments
CREATE POLICY "Company admins view their packages" ON public.company_training_packages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM company_users WHERE company_users.company_id = company_training_packages.company_id AND company_users.user_id = auth.uid() AND company_users.is_admin = true)
  );

CREATE TRIGGER trg_training_packages_updated_at
  BEFORE UPDATE ON public.training_packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();