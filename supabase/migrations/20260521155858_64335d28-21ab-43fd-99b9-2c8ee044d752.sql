
-- 1. realtime.messages: only allow postgres_changes extension (RLS on underlying tables still enforced)
DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated can read realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated postgres_changes only"
ON realtime.messages
FOR SELECT
TO authenticated
USING (extension = 'postgres_changes');

-- 2. company_users: only company admins and platform admins can list members
DROP POLICY IF EXISTS "Company members can view their company members" ON public.company_users;
CREATE POLICY "Company admins can view their company members"
ON public.company_users
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = auth.uid()
      AND cu.company_id = company_users.company_id
      AND cu.is_admin = true
  )
);

-- 3. facsimile_settings: admins only
DROP POLICY IF EXISTS "Anyone authenticated can view facsimile settings" ON public.facsimile_settings;

-- 4. training_time_config: admins only
DROP POLICY IF EXISTS "Authenticated users can view time config" ON public.training_time_config;
