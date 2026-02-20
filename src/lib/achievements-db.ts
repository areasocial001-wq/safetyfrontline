import { supabase } from "@/integrations/supabase/client";
import { GameStats } from "./achievements";
import { getCacheData, setCacheData, invalidateCache } from "./cache-manager";

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  scenario_id: string;
  unlocked_at: string;
}

export interface ScenarioStats {
  id: string;
  user_id: string;
  scenario_id: string;
  best_time: number | null;
  best_score: number;
  min_collisions: number | null;
  max_exploration_percentage: number;
  total_plays: number;
  created_at: string;
  updated_at: string;
}

/**
 * Load all achievements for the current user for a specific scenario
 * Uses local cache to reduce database calls
 */
export async function loadUserAchievements(scenarioId: string): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // Check cache first
  const cacheKey = `achievements_${scenarioId}`;
  const cached = getCacheData<string[]>(cacheKey, user.id);
  if (cached !== null) {
    return cached;
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', user.id)
    .eq('scenario_id', scenarioId);

  if (error) {
    console.error('Error loading achievements:', error);
    return [];
  }

  const achievements = data.map(a => a.achievement_id);
  
  // Store in cache
  setCacheData(cacheKey, achievements, user.id);

  return achievements;
}

/**
 * Save a newly unlocked achievement
 * Invalidates cache after saving
 */
export async function saveAchievement(
  achievementId: string,
  scenarioId: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: user.id,
      achievement_id: achievementId,
      scenario_id: scenarioId,
    });

  if (error) {
    // Ignore unique constraint violations (achievement already unlocked)
    if (error.code === '23505') {
      return true;
    }
    console.error('Error saving achievement:', error);
    return false;
  }

  // Invalidate cache
  invalidateCache(`achievements_${scenarioId}`, user.id);

  return true;
}

/**
 * Load scenario statistics for the current user
 * Uses local cache to reduce database calls
 */
export async function loadScenarioStats(scenarioId: string): Promise<ScenarioStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Check cache first
  const cacheKey = `stats_${scenarioId}`;
  const cached = getCacheData<ScenarioStats>(cacheKey, user.id);
  if (cached !== null) {
    return cached;
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('scenario_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('scenario_id', scenarioId)
    .maybeSingle();

  if (error) {
    console.error('Error loading scenario stats:', error);
    return null;
  }

  // Store in cache
  if (data) {
    setCacheData(cacheKey, data, user.id);
  }

  return data;
}

/**
 * Save or update scenario statistics
 * Invalidates cache after saving
 */
export async function saveScenarioStats(
  scenarioId: string,
  stats: GameStats
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  // First, try to get existing stats
  const existingStats = await loadScenarioStats(scenarioId);

  const explorationPercentage = Math.round(
    (stats.exploredCells.size / stats.totalCells) * 100
  );

  if (existingStats) {
    // Update existing record with best values
    const { error } = await supabase
      .from('scenario_stats')
      .update({
        best_time: 
          existingStats.best_time === null || stats.timeElapsed < existingStats.best_time
            ? stats.timeElapsed
            : existingStats.best_time,
        best_score: Math.max(stats.risksFound * 150, existingStats.best_score),
        min_collisions:
          existingStats.min_collisions === null || stats.collisions < existingStats.min_collisions
            ? stats.collisions
            : existingStats.min_collisions,
        max_exploration_percentage: Math.max(
          explorationPercentage,
          existingStats.max_exploration_percentage
        ),
        total_plays: existingStats.total_plays + 1,
      })
      .eq('id', existingStats.id);

    if (error) {
      console.error('Error updating scenario stats:', error);
      return false;
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from('scenario_stats')
      .insert({
        user_id: user.id,
        scenario_id: scenarioId,
        best_time: stats.timeElapsed,
        best_score: stats.risksFound * 150,
        min_collisions: stats.collisions,
        max_exploration_percentage: explorationPercentage,
        total_plays: 1,
      });

    if (error) {
      console.error('Error inserting scenario stats:', error);
      return false;
    }
  }

  // Invalidate cache
  invalidateCache(`stats_${scenarioId}`, user.id);

  return true;
}

/**
 * Get all scenario stats for the current user
 */
export async function getAllScenarioStats(): Promise<ScenarioStats[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('scenario_stats')
    .select('*')
    .eq('user_id', user.id)
    .order('best_score', { ascending: false });

  if (error) {
    console.error('Error loading all scenario stats:', error);
    return [];
  }

  return data || [];
}
