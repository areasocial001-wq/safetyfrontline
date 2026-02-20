
-- Replace overly permissive INSERT policy with authenticated-only
DROP POLICY "Service can insert notifications" ON public.admin_notifications;

CREATE POLICY "Authenticated can insert notifications"
  ON public.admin_notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
