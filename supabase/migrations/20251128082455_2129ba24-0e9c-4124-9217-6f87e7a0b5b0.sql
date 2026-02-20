-- Create game_replays table for storing video replay metadata
CREATE TABLE public.game_replays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_elapsed INTEGER NOT NULL,
  collisions INTEGER NOT NULL DEFAULT 0,
  achievements_unlocked TEXT[] DEFAULT '{}',
  is_personal_record BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_replays ENABLE ROW LEVEL SECURITY;

-- Users can view their own replays
CREATE POLICY "Users can view their own replays"
ON public.game_replays
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own replays
CREATE POLICY "Users can insert their own replays"
ON public.game_replays
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own replays
CREATE POLICY "Users can delete their own replays"
ON public.game_replays
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all replays
CREATE POLICY "Admins can view all replays"
ON public.game_replays
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create storage bucket for replay videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-replays', 'game-replays', false);

-- RLS policies for game-replays bucket
CREATE POLICY "Users can view their own replay videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'game-replays' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own replay videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'game-replays' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own replay videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'game-replays' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create index for faster queries
CREATE INDEX idx_game_replays_user_scenario ON public.game_replays(user_id, scenario_id);
CREATE INDEX idx_game_replays_score ON public.game_replays(scenario_id, score DESC);