/**
 * ICacheWriter - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY cache write operations.
 * Clients that only need to write to cache can depend on this interface
 * without being forced to implement read operations they don't need.
 *
 * @example
 * ```typescript
 * class DataIngestionService {
 *   constructor(private readonly cacheWriter: ICacheWriter) {}
 *
 *   async cacheUserData(user: User): Promise<void> {
 *     await this.cacheWriter.set(`user:${user.id}`, user, 3600);
 *   }
 * }
 * ```
 */

import { CacheOptions } from '../types/CacheOptions';

export interface ICacheWriter {
  /**
   * Set a value in cache with optional TTL
   *
   * @param key - The cache key to set
   * @param value - The value to cache
   * @param ttl - Optional Time To Live in seconds
   * @param options - Optional cache configuration
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await cacheWriter.set('user:123', { id: '123', name: 'John' }, 3600);
   * ```
   */
  set(key: string, value: any, ttl?: number, options?: CacheOptions): Promise<void>;

  /**
   * Set multiple values in cache
   *
   * @param entries - Array of cache entries with key, value, and optional TTL
   * @param options - Optional cache configuration
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await cacheWriter.setMany([
   *   { key: 'user:123', value: user1, ttl: 3600 },
   *   { key: 'user:456', value: user2, ttl: 1800 }
   * ]);
   * ```
   */
  setMany(entries: Array<{ key: string; value: any; ttl?: number }>, options?: CacheOptions): Promise<void>;

  /**
   * Delete a key from cache
   *
   * @param key - The cache key to delete
   * @param options - Optional cache configuration
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await cacheWriter.delete('user:123');
   * ```
   */
  delete(key: string, options?: CacheOptions): Promise<void>;

  /**
   * Invalidate keys matching a pattern
   *
   * @param pattern - The pattern to match keys for invalidation (supports wildcards)
   * @param options - Optional cache configuration
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * // Invalidate all user keys
   * await cacheWriter.invalidate('user:*');
   *
   * // Invalidate specific user
   * await cacheWriter.invalidate('user:123');
   * ```
   */
  invalidate(pattern: string, options?: CacheOptions): Promise<void>;
}

// Re-export types for convenience
export { CacheOptions };
