-- Remove direct INSERT policy on certificates
DROP POLICY IF EXISTS "Users can insert their own certificates" ON public.certificates;

-- Create secure certificate issuance function
CREATE OR REPLACE FUNCTION public.issue_certificate(
  _scenario text,
  _score integer,
  _certificate_code text,
  _verification_hash text,
  _completions integer DEFAULT 1
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- For game scenarios (office, warehouse, general), verify completed demo_session
  IF _scenario IN ('office', 'warehouse', 'general') THEN
    IF NOT EXISTS (
      SELECT 1 FROM demo_sessions
      WHERE user_id = _user_id
        AND scenario = _scenario::demo_scenario
        AND completed = true
    ) THEN
      RAISE EXCEPTION 'Scenario not completed';
    END IF;
  -- For training paths (percorso_*), verify all modules completed
  ELSIF _scenario LIKE 'percorso_%' THEN
    -- At least one training_progress must be completed
    IF NOT EXISTS (
      SELECT 1 FROM training_progress
      WHERE user_id = _user_id
        AND status = 'completed'
    ) THEN
      RAISE EXCEPTION 'Training not completed';
    END IF;
  -- For formazione_generale, verify training progress
  ELSIF _scenario = 'formazione_generale' THEN
    IF NOT EXISTS (
      SELECT 1 FROM training_progress
      WHERE user_id = _user_id
        AND status = 'completed'
    ) THEN
      RAISE EXCEPTION 'Training not completed';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid scenario';
  END IF;

  -- Insert the certificate
  INSERT INTO certificates (user_id, scenario, certificate_code, score, completions, verification_hash)
  VALUES (_user_id, _scenario, _certificate_code, _score, _completions, _verification_hash);

  RETURN _certificate_code;
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.issue_certificate(text, integer, text, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.issue_certificate(text, integer, text, text, integer) TO authenticated;