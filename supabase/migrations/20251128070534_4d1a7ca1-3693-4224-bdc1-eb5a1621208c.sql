-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Create RLS policies for company logos bucket
CREATE POLICY "Company admins can upload their logo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid() IN (
    SELECT cu.user_id 
    FROM company_users cu 
    WHERE cu.company_id::text = (storage.foldername(name))[1]
    AND cu.is_admin = true
  )
);

CREATE POLICY "Company admins can update their logo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'company-logos'
  AND auth.uid() IN (
    SELECT cu.user_id 
    FROM company_users cu 
    WHERE cu.company_id::text = (storage.foldername(name))[1]
    AND cu.is_admin = true
  )
);

CREATE POLICY "Company admins can delete their logo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'company-logos'
  AND auth.uid() IN (
    SELECT cu.user_id 
    FROM company_users cu 
    WHERE cu.company_id::text = (storage.foldername(name))[1]
    AND cu.is_admin = true
  )
);

CREATE POLICY "Company logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');

-- Add logo_url column to companies table
ALTER TABLE public.companies
ADD COLUMN logo_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.companies.logo_url IS 'URL to the company logo stored in company-logos bucket';