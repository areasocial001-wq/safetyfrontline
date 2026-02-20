
-- Training modules definition
CREATE TABLE public.training_modules (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  description text,
  module_order integer NOT NULL,
  style text NOT NULL DEFAULT '2d', -- '2d', '3d', 'hybrid'
  min_duration_minutes integer NOT NULL DEFAULT 60, -- minimum time required
  passing_score integer NOT NULL DEFAULT 70,
  icon_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view training modules" ON public.training_modules FOR SELECT USING (true);

-- Insert the 4 FLAV modules
INSERT INTO public.training_modules (id, title, subtitle, description, module_order, style, min_duration_minutes, passing_score, icon_name) VALUES
('giuridico_normativo', 'Giuridico e Normativo', 'D.Lgs 81/08 e Accordo Stato-Regioni', 'Concetti fondamentali di legislazione sulla sicurezza, figure della prevenzione, diritti e doveri dei lavoratori.', 1, '2d', 60, 70, 'Scale'),
('gestione_organizzazione', 'Gestione ed Organizzazione', 'RSPP, RLS, Medico Competente', 'Organigramma della sicurezza, ruoli e responsabilità, comunicazione e segnalazione.', 2, 'hybrid', 60, 70, 'Users'),
('valutazione_rischi', 'Valutazione dei Rischi', 'Pericolo, Rischio, Danno', 'Identificazione dei pericoli, valutazione R=PxD, misure di prevenzione e protezione.', 3, '3d', 60, 70, 'Search'),
('dpi_protezione', 'DPI e Protezione', 'Dispositivi di Protezione Individuale', 'Selezione e utilizzo corretto dei DPI, categorie, manutenzione e obblighi.', 4, '3d', 60, 70, 'Shield');

-- User training progress per module
CREATE TABLE public.training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id text NOT NULL REFERENCES public.training_modules(id),
  status text NOT NULL DEFAULT 'locked', -- locked, available, in_progress, completed
  current_section integer NOT NULL DEFAULT 0,
  total_sections integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  time_spent_seconds integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.training_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.training_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.training_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.training_progress FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

-- Timer tracking (anti-cheat: tracks active time per session)
CREATE TABLE public.training_timer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id text NOT NULL REFERENCES public.training_modules(id),
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  active_seconds integer NOT NULL DEFAULT 0,
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_timer_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own timer logs" ON public.training_timer_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own timer logs" ON public.training_timer_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timer logs" ON public.training_timer_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all timer logs" ON public.training_timer_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

-- XP and leveling system
CREATE TABLE public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own xp" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all xp" ON public.user_xp FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Anyone can view xp for leaderboard" ON public.user_xp FOR SELECT USING (true);

-- Training badges
CREATE TABLE public.training_badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  criteria_type text NOT NULL, -- 'all_risks_no_help', 'perfect_quiz', 'speed_run', 'full_completion'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.training_badges FOR SELECT USING (true);

INSERT INTO public.training_badges (id, name, description, icon_name, xp_reward, criteria_type) VALUES
('occhio_di_falco', 'Occhio di Falco', 'Individua tutti i rischi senza aiuti', 'Eye', 100, 'all_risks_no_help'),
('maestro_della_legge', 'Maestro della Legge', 'Rispondi correttamente a tutte le domande normative senza errori', 'Scale', 100, 'perfect_quiz'),
('velocista_sicuro', 'Velocista Sicuro', 'Completa un modulo nel tempo minimo richiesto', 'Timer', 75, 'speed_run'),
('ispettore_completo', 'Ispettore Completo', 'Completa tutti e 4 i moduli con punteggio massimo', 'Award', 200, 'full_completion'),
('primo_soccorso', 'Primo Soccorso', 'Identifica correttamente tutti i DPI necessari al primo tentativo', 'Heart', 75, 'all_risks_no_help'),
('sentinella', 'Sentinella', 'Trova un rischio critico entro 10 secondi', 'Shield', 50, 'speed_run');

-- User earned badges
CREATE TABLE public.user_training_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id text NOT NULL REFERENCES public.training_badges(id),
  module_id text REFERENCES public.training_modules(id),
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id, module_id)
);

ALTER TABLE public.user_training_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.user_training_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_training_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all badges" ON public.user_training_badges FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Anyone can view badges for leaderboard" ON public.user_training_badges FOR SELECT USING (true);

-- Multiplayer challenges
CREATE TABLE public.training_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  challenged_id uuid NOT NULL,
  module_id text NOT NULL REFERENCES public.training_modules(id),
  challenger_score integer,
  challenged_score integer,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, completed, expired
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.training_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own challenges" ON public.training_challenges FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE POLICY "Users can insert challenges" ON public.training_challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update own challenges" ON public.training_challenges FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE POLICY "Admins can view all challenges" ON public.training_challenges FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

-- Boss test results (intermediate tests between modules)
CREATE TABLE public.boss_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id text NOT NULL REFERENCES public.training_modules(id),
  score integer NOT NULL,
  max_score integer NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]',
  time_taken_seconds integer NOT NULL DEFAULT 0,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boss_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own test results" ON public.boss_test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test results" ON public.boss_test_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all test results" ON public.boss_test_results FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

-- Enable realtime for progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_xp;
