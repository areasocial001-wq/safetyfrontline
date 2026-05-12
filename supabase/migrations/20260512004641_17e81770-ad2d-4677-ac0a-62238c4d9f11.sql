
-- Singleton table to persist editable fac-simile settings
CREATE TABLE public.facsimile_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  test_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  certificate_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.facsimile_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view facsimile settings"
  ON public.facsimile_settings FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage facsimile settings"
  ON public.facsimile_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE TRIGGER set_facsimile_settings_updated_at
  BEFORE UPDATE ON public.facsimile_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.facsimile_settings (singleton) VALUES (true);
