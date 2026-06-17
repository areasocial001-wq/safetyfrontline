ALTER TABLE public.training_packages
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

UPDATE public.training_packages
  SET is_demo = true
  WHERE name = 'AZIENDA SRL';