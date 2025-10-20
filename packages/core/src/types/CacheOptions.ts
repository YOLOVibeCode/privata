/**
 * CacheOptions - Configuration for cache operations
 *
 * This type defines the options available when reading from or writing to cache,
 * following ISP principles by keeping cache concerns separate from database concerns.
 */

export interface CacheOptions {
  /** Region to read/write from (for multi-region compliance) */
  region?: string;

  /** Cache consistency level */
  consistency?: 'eventual' | 'strong' | 'session';

  /** Timeout for the cache operation (in milliseconds) */
  timeout?: number;

  /** Whether to bypass cache and go to source */
  bypassCache?: boolean;

  /** Custom TTL (Time To Live) for this specific operation */
  ttl?: number;

  /** Whether to refresh the cache entry if it's close to expiry */
  refreshAhead?: boolean;

  /** Compression level for cached data */
  compression?: 'none' | 'gzip' | 'brotli';

  /** Whether to use local cache (L1) or distributed cache (L2) */
  cacheLevel?: 'L1' | 'L2' | 'both';

  /** Custom metadata for the cache operation */
  metadata?: Record<string, any>;
}
