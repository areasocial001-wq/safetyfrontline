
-- 1. Remove anon SELECT on training_packages and training_package_modules
DROP POLICY IF EXISTS "Public can view training packages" ON public.training_packages;
DROP POLICY IF EXISTS "Public can view training package modules" ON public.training_package_modules;

-- 2. Fix game_replays leaderboard policy bypass
DROP POLICY IF EXISTS "Users can view top leaderboard replays" ON public.game_replays;
DROP POLICY IF EXISTS "Users can view top leaderboard replay videos" ON public.game_replays;

-- SECURITY DEFINER RPC returning safe top-N leaderboard replays
CREATE OR REPLACE FUNCTION public.get_top_leaderboard_replays(_scenario_id text, _limit int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  scenario_id text,
  video_url text,
  score integer,
  time_elapsed integer,
  collisions integer,
  achievements_unlocked text[],
  is_personal_record boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gr.id, gr.user_id, gr.scenario_id, gr.video_url, gr.score,
         gr.time_elapsed, gr.collisions, gr.achievements_unlocked,
         gr.is_personal_record, gr.created_at
  FROM public.game_replays gr
  JOIN (
    SELECT user_id
    FROM public.scenario_stats
    WHERE scenario_id = _scenario_id
    ORDER BY best_score DESC
    LIMIT LEAST(GREATEST(_limit, 1), 50)
  ) top ON top.user_id = gr.user_id
  WHERE gr.scenario_id = _scenario_id
    AND gr.is_personal_record = true
  ORDER BY gr.score DESC
  LIMIT LEAST(GREATEST(_limit, 1), 50);
$$;

-- 3. Lock down SECURITY DEFINER function EXECUTE permissions
REVOKE ALL ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, user_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.issue_certificate(text, integer, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(text, integer, text, text, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.get_top_leaderboard_replays(text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_top_leaderboard_replays(text, int) TO authenticated;

-- 4. Restrict listing of company-logos bucket (files still accessible by direct public URL)
DROP POLICY IF EXISTS "Public read company logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Company logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "Authenticated can list company logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'company-logos');
