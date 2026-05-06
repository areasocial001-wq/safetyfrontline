-- Tighten demo_sessions INSERT policy to prevent user_id spoofing
DROP POLICY IF EXISTS "Anyone can insert demo sessions" ON public.demo_sessions;

CREATE POLICY "Insert demo sessions (no user_id spoofing)"
ON public.demo_sessions
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);