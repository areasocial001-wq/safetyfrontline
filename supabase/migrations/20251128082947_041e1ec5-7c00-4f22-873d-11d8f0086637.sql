-- Add policy to allow users to view replays of top leaderboard players
-- This enables the comparison feature where users can compare their replays with top performers

CREATE POLICY "Users can view top leaderboard replays"
ON public.game_replays
FOR SELECT
USING (
  is_personal_record = true
  AND EXISTS (
    SELECT 1
    FROM public.scenario_stats
    WHERE scenario_stats.user_id = game_replays.user_id
      AND scenario_stats.scenario_id = game_replays.scenario_id
    ORDER BY scenario_stats.best_score DESC
    LIMIT 10
  )
);

-- Update storage policy to allow viewing top player replay videos
CREATE POLICY "Users can view top leaderboard replay videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'game-replays'
  AND EXISTS (
    SELECT 1
    FROM public.game_replays
    WHERE game_replays.video_url LIKE '%' || storage.objects.name
      AND game_replays.is_personal_record = true
  )
);