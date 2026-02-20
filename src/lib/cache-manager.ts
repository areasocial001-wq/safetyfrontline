/**
 * Local Cache Manager for Game Data
 * Reduces database dependency by caching statistics and replay data
 */

const CACHE_PREFIX = 'sicurazienda_3d_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  userId?: string;
}

/**
 * Generate cache key with user context
 */
function getCacheKey(key: string, userId?: string): string {
  return `${CACHE_PREFIX}${userId ? `${userId}_` : ''}${key}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry<any> | null): boolean {
  if (!entry) return false;
  const now = Date.now();
  return (now - entry.timestamp) < CACHE_DURATION;
}

/**
 * Save data to local cache
 */
export function setCacheData<T>(key: string, data: T, userId?: string): void {
  try {
    const cacheKey = getCacheKey(key, userId);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`[Cache] Saved: ${cacheKey}`);
  } catch (error) {
    console.error('[Cache] Error saving to cache:', error);
  }
}

/**
 * Get data from local cache
 */
export function getCacheData<T>(key: string, userId?: string): T | null {
  try {
    const cacheKey = getCacheKey(key, userId);
    const item = localStorage.getItem(cacheKey);
    
    if (!item) {
      console.log(`[Cache] Miss: ${cacheKey}`);
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(item);
    
    if (!isCacheValid(entry)) {
      console.log(`[Cache] Expired: ${cacheKey}`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`[Cache] Hit: ${cacheKey}`);
    return entry.data;
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return null;
  }
}

/**
 * Invalidate specific cache entry
 */
export function invalidateCache(key: string, userId?: string): void {
  try {
    const cacheKey = getCacheKey(key, userId);
    localStorage.removeItem(cacheKey);
    console.log(`[Cache] Invalidated: ${cacheKey}`);
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error);
  }
}

/**
 * Invalidate all cache entries for a user
 */
export function invalidateUserCache(userId: string): void {
  try {
    const keys = Object.keys(localStorage);
    const userPrefix = getCacheKey('', userId);
    
    keys.forEach(key => {
      if (key.startsWith(userPrefix)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log(`[Cache] Invalidated all cache for user: ${userId}`);
  } catch (error) {
    console.error('[Cache] Error invalidating user cache:', error);
  }
}

/**
 * Clear all game cache
 */
export function clearGameCache(): void {
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[Cache] Cleared all game cache');
  } catch (error) {
    console.error('[Cache] Error clearing game cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalSize: number;
  entries: Array<{ key: string; size: number; age: number }>;
} {
  const keys = Object.keys(localStorage);
  const gameKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
  
  let totalSize = 0;
  const entries = gameKeys.map(key => {
    const value = localStorage.getItem(key) || '';
    const size = new Blob([value]).size;
    totalSize += size;
    
    let age = 0;
    try {
      const entry = JSON.parse(value);
      age = Date.now() - entry.timestamp;
    } catch (e) {
      // Invalid entry
    }
    
    return { key, size, age };
  });
  
  return {
    totalEntries: gameKeys.length,
    totalSize,
    entries,
  };
}
