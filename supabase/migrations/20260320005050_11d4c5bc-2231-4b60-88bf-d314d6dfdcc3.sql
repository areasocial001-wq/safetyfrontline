
-- Fix overly permissive INSERT policy on employee_notifications
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.employee_notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.employee_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
