
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  safe_role user_role;
  company_record_id uuid;
BEGIN
  -- Whitelist only safe self-assignable roles; never allow admin via signup
  safe_role := CASE
    WHEN (NEW.raw_user_meta_data->>'role')::user_role IN ('company_client', 'employee')
    THEN (NEW.raw_user_meta_data->>'role')::user_role
    ELSE 'company_client'::user_role
  END;

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, company_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  
  -- Assign safe role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, safe_role);
  
  -- If user is a company_client, create company record and link
  IF safe_role = 'company_client' THEN
    SELECT id INTO company_record_id
    FROM public.companies
    WHERE name = COALESCE(NEW.raw_user_meta_data->>'company_name', '')
    LIMIT 1;
    
    IF company_record_id IS NULL AND COALESCE(NEW.raw_user_meta_data->>'company_name', '') != '' THEN
      INSERT INTO public.companies (name, vat_number)
      VALUES (
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'vat_number'
      )
      RETURNING id INTO company_record_id;
    END IF;
    
    IF company_record_id IS NOT NULL THEN
      INSERT INTO public.company_users (user_id, company_id, is_admin)
      VALUES (NEW.id, company_record_id, true);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
