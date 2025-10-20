/**
 * RedisCacheAdapter - Redis implementation of cache interfaces
 *
 * This adapter provides Redis-specific implementations of the cache interfaces,
 * following the Adapter pattern and ISP principles.
 *
 * @example
 * ```typescript
 * const adapter = new RedisCacheAdapter('redis://localhost:6379');
 * await adapter.connect();
 *
 * await adapter.set('user:123', { name: 'John Doe' }, 3600);
 * const user = await adapter.get('user:123');
 * ```
 */

import { createClient, RedisClientType } from 'redis';
import { ICacheReader } from '../interfaces/ICacheReader';
import { ICacheWriter } from '../interfaces/ICacheWriter';
import { CacheOptions } from '../types/CacheOptions';

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

export class RedisCacheAdapter implements ICacheReader, ICacheWriter {
  private readonly client: RedisClientType;
  private isConnected: boolean = false;

  /**
   * Creates a new RedisCacheAdapter instance
   *
   * @param config - Redis connection configuration (URL string or config object)
   */
  constructor(config: string | RedisConfig) {
    if (typeof config === 'string') {
      this.client = createClient({ url: config });
    } else {
      this.client = createClient(config);
    }
  }

  /**
   * Connects to Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  /**
   * Disconnects from Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // ICacheReader implementation

  /**
   * Retrieves a value from the cache by its key
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const value = await this.client.get(key);

      if (value === null) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        // If JSON parsing fails, return as string
        return value as T;
      }
    } catch (error) {
      throw new Error(`Redis get error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves multiple values from the cache by their keys
   */
  async getMany<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) {
        return [];
      }

      const values = await this.client.mGet(keys);

      return values.map(value => {
        if (value === null) {
          return null;
        }

        // Try to parse as JSON, fallback to string
        try {
          return JSON.parse(value) as T;
        } catch {
          // If JSON parsing fails, return as string
          return value as T;
        }
      });
    } catch (error) {
      throw new Error(`Redis getMany error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a key exists in the cache
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      throw new Error(`Redis exists error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ICacheWriter implementation

  /**
   * Sets a value in the cache with an optional time-to-live (TTL)
   */
  async set(key: string, value: any, ttl?: number, options?: CacheOptions): Promise<void> {
    try {
      let serializedValue: string;

      // Handle different value types
      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }

      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      throw new Error(`Redis set error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sets multiple values in the cache
   */
  async setMany(entries: Array<{ key: string; value: any; ttl?: number }>, options?: CacheOptions): Promise<void> {
    try {
      if (entries.length === 0) {
        return;
      }

      // Group entries by TTL
      const entriesWithoutTTL = entries.filter(entry => !entry.ttl);
      const entriesWithTTL = entries.filter(entry => entry.ttl);

      // Handle entries without TTL using mSet
      if (entriesWithoutTTL.length > 0) {
        const keyValuePairs: string[] = [];
        for (const entry of entriesWithoutTTL) {
          keyValuePairs.push(entry.key);
          keyValuePairs.push(typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value));
        }
        await this.client.mSet(keyValuePairs);
      }

      // Handle entries with TTL individually
      for (const entry of entriesWithTTL) {
        const serializedValue = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value);
        await this.client.setEx(entry.key, entry.ttl!, serializedValue);
      }
    } catch (error) {
      throw new Error(`Redis setMany error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a value from the cache by its key
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      throw new Error(`Redis delete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Invalidates cache entries matching a given pattern
   */
  async invalidate(pattern: string, options?: CacheOptions): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      throw new Error(`Redis invalidate error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Additional utility methods

  /**
   * Gets the Redis client instance
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * Checks if the adapter is connected to Redis
   */
  isConnectedToRedis(): boolean {
    return this.isConnected && this.client.isOpen;
  }

  /**
   * Gets cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string; connected: boolean }> {
    try {
      const info = await this.client.info('memory');
      const keys = await this.client.dbSize();

      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch?.[1]?.trim() || 'unknown';

      return {
        keys,
        memory,
        connected: this.isConnectedToRedis(),
      };
    } catch (error) {
      return {
        keys: 0,
        memory: 'unknown',
        connected: false,
      };
    }
  }

  /**
   * Flushes all cache entries
   */
  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      throw new Error(`Redis flushAll error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sets a value with expiration using a more flexible TTL format
   */
  async setWithExpiration(key: string, value: any, expiration: number | Date, options?: CacheOptions): Promise<void> {
    try {
      let serializedValue: string;

      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }

      if (expiration instanceof Date) {
        // Set expiration to a specific date
        const now = new Date();
        const ttlSeconds = Math.floor((expiration.getTime() - now.getTime()) / 1000);

        if (ttlSeconds > 0) {
          await this.client.setEx(key, ttlSeconds, serializedValue);
        } else {
          // If expiration is in the past, don't set the key

        }
      } else {
        // Set expiration in seconds
        await this.client.setEx(key, expiration, serializedValue);
      }
    } catch (error) {
      throw new Error(`Redis setWithExpiration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the TTL (time to live) of a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      throw new Error(`Redis getTTL error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extends the TTL of a key
   */
  async extendTTL(key: string, additionalSeconds: number): Promise<boolean> {
    try {
      const currentTTL = await this.client.ttl(key);

      if (currentTTL === -2) {
        // Key doesn't exist
        return false;
      }

      if (currentTTL === -1) {
        // Key exists but has no expiration
        await this.client.expire(key, additionalSeconds);
      } else {
        // Key has expiration, extend it
        await this.client.expire(key, currentTTL + additionalSeconds);
      }

      return true;
    } catch (error) {
      throw new Error(`Redis extendTTL error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
