import { supabase } from "@/integrations/supabase/client";
import { ScenarioStats } from "./achievements-db";

export type LeaderboardCategory = 'time' | 'score' | 'collisions';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  value: number;
  scenario_id: string;
  is_current_user?: boolean;
}

/**
 * Get top 10 players for a specific category and scenario
 */
export async function getLeaderboard(
  scenarioId: string,
  category: LeaderboardCategory
): Promise<LeaderboardEntry[]> {
  let orderColumn: string;
  let ascending: boolean;

  switch (category) {
    case 'time':
      orderColumn = 'best_time';
      ascending = true; // Lower is better
      break;
    case 'score':
      orderColumn = 'best_score';
      ascending = false; // Higher is better
      break;
    case 'collisions':
      orderColumn = 'min_collisions';
      ascending = true; // Lower is better
      break;
  }

  const { data: stats, error } = await supabase
    .from('scenario_stats')
    .select('user_id, scenario_id, best_time, best_score, min_collisions')
    .eq('scenario_id', scenarioId)
    .not(orderColumn, 'is', null)
    .order(orderColumn, { ascending })
    .limit(10);

  if (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }

  if (!stats || stats.length === 0) {
    return [];
  }

  // Get user names from profiles
  const userIds = stats.map(s => s.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profileMap = new Map(
    profiles?.map(p => [p.id, p.full_name || 'Utente Anonimo']) || []
  );

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  return stats.map((stat, index) => {
    let value: number;
    switch (category) {
      case 'time':
        value = stat.best_time || 0;
        break;
      case 'score':
        value = stat.best_score;
        break;
      case 'collisions':
        value = stat.min_collisions || 0;
        break;
    }
    
    return {
      rank: index + 1,
      user_id: stat.user_id,
      user_name: profileMap.get(stat.user_id) || 'Utente Anonimo',
      value,
      scenario_id: stat.scenario_id,
      is_current_user: user?.id === stat.user_id,
    };
  });
}

/**
 * Get current user's rank for a specific category and scenario
 */
export async function getUserRank(
  scenarioId: string,
  category: LeaderboardCategory
): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  let orderColumn: string;
  let ascending: boolean;

  switch (category) {
    case 'time':
      orderColumn = 'best_time';
      ascending = true;
      break;
    case 'score':
      orderColumn = 'best_score';
      ascending = false;
      break;
    case 'collisions':
      orderColumn = 'min_collisions';
      ascending = true;
      break;
  }

  // Get user's value
  const { data: userStats } = await supabase
    .from('scenario_stats')
    .select(orderColumn)
    .eq('user_id', user.id)
    .eq('scenario_id', scenarioId)
    .not(orderColumn, 'is', null)
    .maybeSingle();

  if (!userStats) {
    return null;
  }

  const userValue = userStats[orderColumn as keyof typeof userStats] as number;

  // Count how many players have a better value
  const { count } = await supabase
    .from('scenario_stats')
    .select('*', { count: 'exact', head: true })
    .eq('scenario_id', scenarioId)
    .not(orderColumn, 'is', null)
    .filter(
      orderColumn,
      ascending ? 'lt' : 'gt',
      userValue
    );

  return (count || 0) + 1;
}
