-- Create certificates table to track issued certificates
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario TEXT NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL,
  completions INTEGER NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_hash TEXT NOT NULL,
  CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own certificates
CREATE POLICY "Users can insert their own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all certificates
CREATE POLICY "Admins can view all certificates"
ON public.certificates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create index for faster lookups
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);