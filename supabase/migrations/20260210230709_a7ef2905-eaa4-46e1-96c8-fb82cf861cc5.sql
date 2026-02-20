
-- Table for point-and-click level progress
CREATE TABLE public.point_click_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level_id TEXT NOT NULL,
  found_hazards TEXT[] NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, level_id)
);

ALTER TABLE public.point_click_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.point_click_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.point_click_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.point_click_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.point_click_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_point_click_progress_updated_at
  BEFORE UPDATE ON public.point_click_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
