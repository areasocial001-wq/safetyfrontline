
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_users WHERE user_id = _user_id LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_company_id FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_company_id TO authenticated;

DROP POLICY IF EXISTS "Company members can view their company members" ON public.company_users;

CREATE POLICY "Company members can view their company members"
ON public.company_users
FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));
