
-- Fix 1: Restrict leaderboard replay videos storage policy to authenticated users only
DROP POLICY IF EXISTS "Users can view top leaderboard replay videos" ON storage.objects;
CREATE POLICY "Users can view top leaderboard replay videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'game-replays'
  AND EXISTS (
    SELECT 1 FROM public.game_replays gr
    WHERE gr.video_url LIKE '%' || storage.objects.name
      AND gr.is_personal_record = true
  )
);

-- Fix 2: Replace company_users SELECT policy to correctly handle multi-company membership
DROP POLICY IF EXISTS "Company members can view their company members" ON public.company_users;
CREATE POLICY "Company members can view their company members"
ON public.company_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = auth.uid()
      AND cu.company_id = company_users.company_id
  )
);
