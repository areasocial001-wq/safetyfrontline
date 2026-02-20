-- Add certificate customization fields to companies table
ALTER TABLE public.companies 
ADD COLUMN certificate_theme_color TEXT DEFAULT '#3B82F6',
ADD COLUMN certificate_font TEXT DEFAULT 'helvetica',
ADD COLUMN certificate_text_layout TEXT DEFAULT 'centered',
ADD COLUMN certificate_logo_position TEXT DEFAULT 'top-left';

-- Add comment for documentation
COMMENT ON COLUMN public.companies.certificate_theme_color IS 'Theme color for certificates in hex format';
COMMENT ON COLUMN public.companies.certificate_font IS 'Font family for certificate text (helvetica, times, courier)';
COMMENT ON COLUMN public.companies.certificate_text_layout IS 'Text layout style (centered, left-aligned, modern)';
COMMENT ON COLUMN public.companies.certificate_logo_position IS 'Logo position (top-left, top-right, top-center)';