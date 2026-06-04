
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users
    WHERE user_id = _user_id AND company_id = _company_id AND is_admin = true
  );
$$;

DROP POLICY IF EXISTS "Company admins can view their company members" ON public.company_users;

CREATE POLICY "Company admins can view their company members"
ON public.company_users
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR auth.uid() = user_id
  OR public.is_company_admin(auth.uid(), company_id)
);
