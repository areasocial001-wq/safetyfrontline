-- Create user_achievements table to track unlocked achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id, scenario_id)
);

-- Create scenario_stats table to track best scores and statistics per scenario
CREATE TABLE IF NOT EXISTS public.scenario_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  best_time INTEGER,
  best_score INTEGER NOT NULL DEFAULT 0,
  min_collisions INTEGER,
  max_exploration_percentage INTEGER DEFAULT 0,
  total_plays INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scenario_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all achievements"
  ON public.user_achievements
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for scenario_stats
CREATE POLICY "Users can view their own stats"
  ON public.scenario_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.scenario_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.scenario_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats"
  ON public.scenario_stats
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at on scenario_stats
CREATE TRIGGER update_scenario_stats_updated_at
  BEFORE UPDATE ON public.scenario_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();