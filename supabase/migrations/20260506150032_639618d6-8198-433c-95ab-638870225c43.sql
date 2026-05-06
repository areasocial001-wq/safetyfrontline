
-- 1. Remove anonymous demo session exposure
DROP POLICY IF EXISTS "Anonymous can view anonymous demo sessions" ON public.demo_sessions;

-- 2. Lock down user_roles INSERT/UPDATE/DELETE to admins (ALL policy already exists but lacks explicit INSERT WITH CHECK for non-admins). Add explicit deny by adding a restrictive admin-only INSERT policy.
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- 3. Restrict leaderboard data to authenticated users only
DROP POLICY IF EXISTS "Anyone can view xp for leaderboard" ON public.user_xp;
CREATE POLICY "Authenticated users can view leaderboard xp"
ON public.user_xp
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view badges for leaderboard" ON public.user_training_badges;
CREATE POLICY "Authenticated users can view leaderboard badges"
ON public.user_training_badges
FOR SELECT
TO authenticated
USING (true);

-- 4. Prevent users from changing user_id on their xp row
DROP POLICY IF EXISTS "Users can update own xp" ON public.user_xp;
CREATE POLICY "Users can update own xp"
ON public.user_xp
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
