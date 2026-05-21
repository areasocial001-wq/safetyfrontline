-- 1. Restrict platform_settings to authenticated users
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Authenticated can view platform settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (true);

-- 2. Add UPDATE policy for game-replays bucket (owner-scoped)
CREATE POLICY "Users can update their own game replays"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'game-replays' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'game-replays' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Realtime authorization: restrict realtime.messages subscriptions to authenticated users
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated can use realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);