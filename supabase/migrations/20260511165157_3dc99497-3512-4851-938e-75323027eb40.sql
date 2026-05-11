ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS certificate_module_prefix text NOT NULL DEFAULT 'Verifica della Ricaduta sulla',
  ADD COLUMN IF NOT EXISTS certificate_orientation text NOT NULL DEFAULT 'portrait';