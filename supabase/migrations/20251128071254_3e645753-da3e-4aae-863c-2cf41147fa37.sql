-- Add certificate template field to companies table
ALTER TABLE public.companies 
ADD COLUMN certificate_template TEXT DEFAULT 'formale';

-- Add comment for documentation
COMMENT ON COLUMN public.companies.certificate_template IS 'Certificate template style (formale, moderno, minimalista, personalizzato)';