
-- Fix demo_sessions: split the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own demo sessions" ON public.demo_sessions;

CREATE POLICY "Users can view own demo sessions"
  ON public.demo_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous can view anonymous demo sessions"
  ON public.demo_sessions FOR SELECT
  USING (auth.uid() IS NULL AND user_id IS NULL);

-- Fix admin_notifications: restrict INSERT to own notifications only
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.admin_notifications;

CREATE POLICY "Users can insert own completion notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (auth.uid() = employee_user_id);
