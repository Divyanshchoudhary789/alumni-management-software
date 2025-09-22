import { logger } from '../config/logger';

/**
 * Simple in-memory cache service
 * For production, consider using Redis for distributed caching
 */
class CacheService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Set a value in cache with TTL (time to live) in seconds
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const expiry = Date.now() + (ttlSeconds * 1000);
      this.cache.set(key, { data: value, expiry });
      logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<any | null> {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }

      if (Date.now() > entry.expiry) {
        this.cache.delete(key);
        logger.debug(`Cache expired: ${key}`);
        return null;
      }

      logger.debug(`Cache hit: ${key}`);
      return entry.data;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      this.cache.clear();
      logger.debug('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cache cleanup: removed ${cleanedCount} expired entries`);
    }
  }

  /**
   * Destroy the cache service and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    logger.info('Cache service destroyed');
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Graceful shutdown
process.on('SIGTERM', () => {
  cacheService.destroy();
});

process.on('SIGINT', () => {
  cacheService.destroy();
});