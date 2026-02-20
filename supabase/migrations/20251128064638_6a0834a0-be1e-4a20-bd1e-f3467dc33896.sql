-- Update the handle_new_user function to read role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role;
BEGIN
  -- Get role from metadata, default to company_client if not specified
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'company_client'::user_role
  );

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, company_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  
  -- Assign role from metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$function$;