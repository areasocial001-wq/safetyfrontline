
CREATE OR REPLACE FUNCTION public.get_module_time_config(_module_id text)
RETURNS TABLE(section_id text, min_time_seconds integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT section_id, min_time_seconds
  FROM public.training_time_config
  WHERE module_id = _module_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_module_time_config(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_module_time_config(text) TO authenticated;
