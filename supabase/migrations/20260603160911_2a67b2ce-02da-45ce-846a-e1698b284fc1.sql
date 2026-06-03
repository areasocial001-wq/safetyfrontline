CREATE TABLE public.user_control_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  mouse_sensitivity numeric NOT NULL DEFAULT 1.0,
  invert_y boolean NOT NULL DEFAULT false,
  touch_sensitivity numeric NOT NULL DEFAULT 1.0,
  gamepad_enabled boolean NOT NULL DEFAULT true,
  gamepad_deadzone numeric NOT NULL DEFAULT 0.15,
  key_bindings jsonb NOT NULL DEFAULT '{}'::jsonb,
  gamepad_bindings jsonb NOT NULL DEFAULT '{}'::jsonb,
  controls_revision integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_control_preferences TO authenticated;
GRANT ALL ON public.user_control_preferences TO service_role;

ALTER TABLE public.user_control_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own control preferences"
  ON public.user_control_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own control preferences"
  ON public.user_control_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own control preferences"
  ON public.user_control_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own control preferences"
  ON public.user_control_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all control preferences"
  ON public.user_control_preferences FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE TRIGGER update_user_control_preferences_updated_at
  BEFORE UPDATE ON public.user_control_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();