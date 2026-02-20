
-- Create admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Company admins can view notifications for their company
CREATE POLICY "Company admins can view their notifications"
  ON public.admin_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = admin_notifications.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.is_admin = true
    )
  );

-- Company admins can update (mark as read)
CREATE POLICY "Company admins can update their notifications"
  ON public.admin_notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = admin_notifications.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.is_admin = true
    )
  );

-- Platform admins can view all
CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Edge functions can insert (service role)
-- We allow insert for authenticated users (the employee themselves triggers it via edge function)
CREATE POLICY "Service can insert notifications"
  ON public.admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
