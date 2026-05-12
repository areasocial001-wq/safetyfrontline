CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  bypass_min_times boolean NOT NULL DEFAULT true,
  demo_package_id uuid,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage platform settings"
ON public.platform_settings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

INSERT INTO public.platform_settings (singleton, bypass_min_times, demo_package_id)
VALUES (true, true, '8829ce9f-3bd3-4322-9f5a-1b29237076a2');