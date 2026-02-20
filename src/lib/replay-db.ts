import { supabase } from "@/integrations/supabase/client";
import { getCacheData, setCacheData, invalidateCache } from "./cache-manager";

export interface GameReplay {
  id: string;
  user_id: string;
  scenario_id: string;
  video_url: string;
  score: number;
  time_elapsed: number;
  collisions: number;
  achievements_unlocked: string[];
  is_personal_record: boolean;
  created_at: string;
}

/**
 * Upload replay video to Supabase Storage
 */
export async function uploadReplayVideo(
  videoBlob: Blob,
  userId: string,
  scenarioId: string
): Promise<string | null> {
  const timestamp = Date.now();
  const filename = `${userId}/${scenarioId}_${timestamp}.mp4`;

  const { error: uploadError } = await supabase.storage
    .from('game-replays')
    .upload(filename, videoBlob, {
      contentType: 'video/mp4',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading replay video:', uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('game-replays')
    .getPublicUrl(filename);

  return data.publicUrl;
}

/**
 * Save replay metadata to database
 * Invalidates replay cache after saving
 */
export async function saveReplay(replay: Omit<GameReplay, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('game_replays')
    .insert({
      user_id: replay.user_id,
      scenario_id: replay.scenario_id,
      video_url: replay.video_url,
      score: replay.score,
      time_elapsed: replay.time_elapsed,
      collisions: replay.collisions,
      achievements_unlocked: replay.achievements_unlocked,
      is_personal_record: replay.is_personal_record,
    });

  if (error) {
    console.error('Error saving replay:', error);
    return false;
  }

  // Invalidate replay caches
  invalidateCache(`user_replays_${replay.scenario_id}`, replay.user_id);
  invalidateCache(`top_replays_${replay.scenario_id}`);

  return true;
}

/**
 * Get user's replays for a scenario
 * Uses local cache to reduce database calls
 */
export async function getUserReplays(scenarioId: string): Promise<GameReplay[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // Check cache first
  const cacheKey = `user_replays_${scenarioId}`;
  const cached = getCacheData<GameReplay[]>(cacheKey, user.id);
  if (cached !== null) {
    return cached;
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('game_replays')
    .select('*')
    .eq('user_id', user.id)
    .eq('scenario_id', scenarioId)
    .order('score', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error loading replays:', error);
    return [];
  }

  const replays = data || [];
  
  // Store in cache
  setCacheData(cacheKey, replays, user.id);

  return replays;
}

/**
 * Get top replays from leaderboard for comparison
 * Uses local cache to reduce database calls
 */
export async function getTopReplays(scenarioId: string, limit: number = 10): Promise<GameReplay[]> {
  // Check cache first (not user-specific)
  const cacheKey = `top_replays_${scenarioId}`;
  const cached = getCacheData<GameReplay[]>(cacheKey);
  if (cached !== null) {
    return cached.slice(0, limit);
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('game_replays')
    .select('*')
    .eq('scenario_id', scenarioId)
    .eq('is_personal_record', true)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error loading top replays:', error);
    return [];
  }

  const replays = data || [];
  
  // Store in cache
  setCacheData(cacheKey, replays);

  return replays;
}

/**
 * Get a specific replay by ID
 */
export async function getReplayById(replayId: string): Promise<GameReplay | null> {
  const { data, error } = await supabase
    .from('game_replays')
    .select('*')
    .eq('id', replayId)
    .maybeSingle();

  if (error) {
    console.error('Error loading replay:', error);
    return null;
  }

  return data;
}

/**
 * Delete old replays keeping only top 5
 */
export async function cleanupOldReplays(userId: string, scenarioId: string): Promise<void> {
  // Get all replays for this user and scenario
  const { data: replays } = await supabase
    .from('game_replays')
    .select('*')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .order('score', { ascending: false });

  if (!replays || replays.length <= 5) {
    return;
  }

  // Delete replays beyond top 5
  const replaysToDelete = replays.slice(5);
  
  for (const replay of replaysToDelete) {
    // Delete from storage
    const filename = replay.video_url.split('/').pop();
    if (filename) {
      await supabase.storage
        .from('game-replays')
        .remove([`${userId}/${filename}`]);
    }

    // Delete from database
    await supabase
      .from('game_replays')
      .delete()
      .eq('id', replay.id);
  }
}

/**
 * Check if a score is a personal record
 */
export async function isPersonalRecord(
  userId: string,
  scenarioId: string,
  newScore: number
): Promise<boolean> {
  const { data } = await supabase
    .from('game_replays')
    .select('score')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();

  return !data || newScore > data.score;
}

/**
 * Download replay video
 */
export async function downloadReplay(videoUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading replay:', error);
    throw error;
  }
}
