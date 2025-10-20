/**
 * ICacheReader - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY cache read operations.
 * Clients that only need to read from cache can depend on this interface
 * without being forced to implement write operations they don't need.
 *
 * @example
 * ```typescript
 * class ReportingService {
 *   constructor(private readonly cacheReader: ICacheReader) {}
 *
 *   async getCachedReport(reportId: string): Promise<Report | null> {
 *     return await this.cacheReader.get<Report>(`report:${reportId}`);
 *   }
 * }
 * ```
 */

import { CacheOptions } from '../types/CacheOptions';

export interface ICacheReader {
  /**
   * Get a value from cache by key
   *
   * @param key - The cache key to retrieve
   * @param options - Optional cache configuration
   * @returns Promise resolving to the cached value or null if not found
   *
   * @example
   * ```typescript
   * const user = await cacheReader.get<User>('user:123');
   * if (user) {
   *   console.log('Found cached user:', user.name);
   * }
   * ```
   */
  get<T>(key: string, options?: CacheOptions): Promise<T | null>;

  /**
   * Get multiple values from cache by keys
   *
   * @param keys - Array of cache keys to retrieve
   * @param options - Optional cache configuration
   * @returns Promise resolving to array of values (null for missing keys)
   *
   * @example
   * ```typescript
   * const keys = ['user:123', 'user:456', 'user:789'];
   * const users = await cacheReader.getMany<User>(keys);
   * // users[0] might be User object, users[1] might be null, etc.
   * ```
   */
  getMany<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]>;

  /**
   * Check if a key exists in cache
   *
   * @param key - The cache key to check
   * @param options - Optional cache configuration
   * @returns Promise resolving to true if key exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await cacheReader.exists('user:123');
   * if (exists) {
   *   console.log('User is cached');
   * }
   * ```
   */
  exists(key: string, options?: CacheOptions): Promise<boolean>;
}

// Re-export types for convenience
export { CacheOptions };
