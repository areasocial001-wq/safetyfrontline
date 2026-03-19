
CREATE TABLE public.employee_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'sector_assignment',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.employee_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.employee_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications"
  ON public.employee_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all notifications"
  ON public.employee_notifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::user_role));
