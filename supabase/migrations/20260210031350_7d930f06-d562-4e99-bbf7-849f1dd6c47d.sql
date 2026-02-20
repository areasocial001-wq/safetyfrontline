
-- Table to store admin-configurable minimum times per section
CREATE TABLE public.training_time_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id text NOT NULL,
  section_id text NOT NULL,
  min_time_seconds integer NOT NULL DEFAULT 60,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(module_id, section_id)
);

ALTER TABLE public.training_time_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage time config"
ON public.training_time_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Authenticated users can view time config"
ON public.training_time_config
FOR SELECT
USING (auth.uid() IS NOT NULL);
