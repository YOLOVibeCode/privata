/**
 * TDD RED Phase: Tests for RedisCacheAdapter
 * 
 * These tests define the expected behavior of the RedisCacheAdapter
 * before we implement it. They should FAIL initially (RED).
 */

import { RedisCacheAdapter } from '../../../src/adapters/RedisCacheAdapter';
import { ICacheReader } from '../../../src/interfaces/ICacheReader';
import { ICacheWriter } from '../../../src/interfaces/ICacheWriter';
import { CacheOptions } from '../../../src/types/CacheOptions';

// Mock Redis client
const mockRedisClient = {
  get: jest.fn(),
  mGet: jest.fn(),
  exists: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  mSet: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  isOpen: true
};

// Mock the Redis module
jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient)
}));

describe('RedisCacheAdapter', () => {
  let redisAdapter: RedisCacheAdapter;
  let mockClient: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock client
    mockClient = mockRedisClient;
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.disconnect.mockResolvedValue(undefined);
    
    // Setup default mock responses
    mockClient.get.mockResolvedValue(null);
    mockClient.mGet.mockResolvedValue([]);
    mockClient.exists.mockResolvedValue(0);
    mockClient.set.mockResolvedValue('OK');
    mockClient.setEx.mockResolvedValue('OK');
    mockClient.mSet.mockResolvedValue('OK');
    mockClient.del.mockResolvedValue(1);
    mockClient.keys.mockResolvedValue([]);
    
    // This will fail until we create the adapter
    redisAdapter = new RedisCacheAdapter('redis://localhost:6379');
    await redisAdapter.connect();
  });

  describe('ICacheReader implementation', () => {
    it('should implement ICacheReader interface', () => {
      // TDD RED: Test implements ICacheReader
      expect(redisAdapter).toHaveProperty('get');
      expect(redisAdapter).toHaveProperty('getMany');
      expect(redisAdapter).toHaveProperty('exists');
      expect(typeof redisAdapter.get).toBe('function');
      expect(typeof redisAdapter.getMany).toBe('function');
      expect(typeof redisAdapter.exists).toBe('function');
    });

    describe('get method', () => {
      it('should have correct signature: get<T>(key: string, options?: CacheOptions): Promise<T | null>', async () => {
        // TDD RED: Test the method signature
        const result = await redisAdapter.get('test-key');
        expect(typeof redisAdapter.get).toBe('function');
      });

      it('should get a value from cache', async () => {
        // TDD RED: Test gets value
        const key = 'user:123';
        const value = { id: '123', name: 'John Doe', email: 'john@example.com' };
        const serializedValue = JSON.stringify(value);
        
        mockClient.get.mockResolvedValue(serializedValue);
        
        const result = await redisAdapter.get(key);
        
        expect(result).toEqual(value);
        expect(mockClient.get).toHaveBeenCalledWith(key);
      });

      it('should return null when key does not exist', async () => {
        // TDD RED: Test returns null when not found
        const key = 'non-existent-key';
        
        mockClient.get.mockResolvedValue(null);
        
        const result = await redisAdapter.get(key);
        
        expect(result).toBeNull();
      });

      it('should handle JSON parsing errors', async () => {
        // TDD RED: Test handles invalid JSON
        const key = 'invalid-json-key';
        const invalidJson = 'invalid-json-string';
        
        mockClient.get.mockResolvedValue(invalidJson);
        
        const result = await redisAdapter.get(key);
        
        expect(result).toBe(invalidJson); // Should return as string when JSON parsing fails
      });

      it('should handle string values', async () => {
        // TDD RED: Test handles string values
        const key = 'string-key';
        const value = 'simple string value';
        
        mockClient.get.mockResolvedValue(value);
        
        const result = await redisAdapter.get(key);
        
        expect(result).toBe(value);
      });

      it('should handle numeric values', async () => {
        // TDD RED: Test handles numeric values
        const key = 'number-key';
        const value = 42;
        const serializedValue = JSON.stringify(value);
        
        mockClient.get.mockResolvedValue(serializedValue);
        
        const result = await redisAdapter.get(key);
        
        expect(result).toBe(value);
      });

      it('should handle boolean values', async () => {
        // TDD RED: Test handles boolean values
        const key = 'boolean-key';
        const value = true;
        const serializedValue = JSON.stringify(value);
        
        mockClient.get.mockResolvedValue(serializedValue);
        
        const result = await redisAdapter.get(key);
        
        expect(result).toBe(value);
      });
    });

    describe('getMany method', () => {
      it('should have correct signature: getMany<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]>', async () => {
        // TDD RED: Test the method signature
        const result = await redisAdapter.getMany(['key1', 'key2']);
        expect(typeof redisAdapter.getMany).toBe('function');
      });

      it('should get multiple values from cache', async () => {
        // TDD RED: Test gets multiple values
        const keys = ['user:123', 'user:124', 'user:125'];
        const values = [
          { id: '123', name: 'John Doe' },
          { id: '124', name: 'Jane Smith' },
          null // user:125 doesn't exist
        ];
        const serializedValues = values.map(v => v ? JSON.stringify(v) : null);
        
        mockClient.mGet.mockResolvedValue(serializedValues);
        
        const result = await redisAdapter.getMany(keys);
        
        expect(result).toEqual(values);
        expect(mockClient.mGet).toHaveBeenCalledWith(keys);
      });

      it('should return empty array for empty keys', async () => {
        // TDD RED: Test empty keys array
        const keys: string[] = [];
        
        const result = await redisAdapter.getMany(keys);
        
        expect(result).toEqual([]);
        expect(mockClient.mGet).not.toHaveBeenCalled(); // Should return early for empty array
      });

      it('should handle mixed value types', async () => {
        // TDD RED: Test mixed value types
        const keys = ['string-key', 'number-key', 'object-key'];
        const values = ['hello', 42, { name: 'John' }];
        const serializedValues = values.map(v => JSON.stringify(v));
        
        mockClient.mGet.mockResolvedValue(serializedValues);
        
        const result = await redisAdapter.getMany(keys);
        
        expect(result).toEqual(values);
      });
    });

    describe('exists method', () => {
      it('should have correct signature: exists(key: string, options?: CacheOptions): Promise<boolean>', async () => {
        // TDD RED: Test the method signature
        const result = await redisAdapter.exists('test-key');
        expect(typeof redisAdapter.exists).toBe('function');
      });

      it('should return true when key exists', async () => {
        // TDD RED: Test returns true when exists
        const key = 'existing-key';
        
        mockClient.exists.mockResolvedValue(1);
        
        const result = await redisAdapter.exists(key);
        
        expect(result).toBe(true);
        expect(mockClient.exists).toHaveBeenCalledWith(key);
      });

      it('should return false when key does not exist', async () => {
        // TDD RED: Test returns false when not exists
        const key = 'non-existent-key';
        
        mockClient.exists.mockResolvedValue(0);
        
        const result = await redisAdapter.exists(key);
        
        expect(result).toBe(false);
      });
    });
  });

  describe('ICacheWriter implementation', () => {
    it('should implement ICacheWriter interface', () => {
      // TDD RED: Test implements ICacheWriter
      expect(redisAdapter).toHaveProperty('set');
      expect(redisAdapter).toHaveProperty('setMany');
      expect(redisAdapter).toHaveProperty('delete');
      expect(redisAdapter).toHaveProperty('invalidate');
      expect(typeof redisAdapter.set).toBe('function');
      expect(typeof redisAdapter.setMany).toBe('function');
      expect(typeof redisAdapter.delete).toBe('function');
      expect(typeof redisAdapter.invalidate).toBe('function');
    });

    describe('set method', () => {
      it('should have correct signature: set(key: string, value: any, ttl?: number, options?: CacheOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        await redisAdapter.set('test-key', 'test-value');
        expect(typeof redisAdapter.set).toBe('function');
      });

      it('should set a value in cache', async () => {
        // TDD RED: Test sets value
        const key = 'user:123';
        const value = { id: '123', name: 'John Doe' };
        const ttl = 3600; // 1 hour
        
        mockClient.set.mockResolvedValue('OK');
        
        await redisAdapter.set(key, value, ttl);
        
        expect(mockClient.setEx).toHaveBeenCalledWith(key, ttl, JSON.stringify(value));
      });

      it('should set a value without TTL', async () => {
        // TDD RED: Test sets value without TTL
        const key = 'user:123';
        const value = { id: '123', name: 'John Doe' };
        
        mockClient.set.mockResolvedValue('OK');
        
        await redisAdapter.set(key, value);
        
        expect(mockClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
      });

      it('should handle string values', async () => {
        // TDD RED: Test handles string values
        const key = 'string-key';
        const value = 'simple string';
        
        mockClient.set.mockResolvedValue('OK');
        
        await redisAdapter.set(key, value);
        
        expect(mockClient.set).toHaveBeenCalledWith(key, value);
      });

      it('should handle numeric values', async () => {
        // TDD RED: Test handles numeric values
        const key = 'number-key';
        const value = 42;
        
        mockClient.set.mockResolvedValue('OK');
        
        await redisAdapter.set(key, value);
        
        expect(mockClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
      });

      it('should handle boolean values', async () => {
        // TDD RED: Test handles boolean values
        const key = 'boolean-key';
        const value = true;
        
        mockClient.set.mockResolvedValue('OK');
        
        await redisAdapter.set(key, value);
        
        expect(mockClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
      });

      it('should handle null values', async () => {
        // TDD RED: Test handles null values
        const key = 'null-key';
        const value = null;
        
        mockClient.set.mockResolvedValue('OK');
        
        await redisAdapter.set(key, value);
        
        expect(mockClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
      });
    });

    describe('setMany method', () => {
      it('should have correct signature: setMany(entries: Array<{ key: string; value: any; ttl?: number }>, options?: CacheOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        await redisAdapter.setMany([{ key: 'test-key', value: 'test-value' }]);
        expect(typeof redisAdapter.setMany).toBe('function');
      });

      it('should set multiple values in cache', async () => {
        // TDD RED: Test sets multiple values
        const entries = [
          { key: 'user:123', value: { id: '123', name: 'John' }, ttl: 3600 },
          { key: 'user:124', value: { id: '124', name: 'Jane' }, ttl: 1800 },
          { key: 'user:125', value: { id: '125', name: 'Bob' } } // no TTL
        ];
        
        mockClient.mSet.mockResolvedValue('OK');
        mockClient.setEx.mockResolvedValue('OK');
        
        await redisAdapter.setMany(entries);
        
        // Only the non-TTL entry should be passed to mSet
        expect(mockClient.mSet).toHaveBeenCalledWith([
          'user:125', JSON.stringify({ id: '125', name: 'Bob' })
        ]);
        
        // TTL entries should be handled with setEx
        expect(mockClient.setEx).toHaveBeenCalledWith('user:123', 3600, JSON.stringify({ id: '123', name: 'John' }));
        expect(mockClient.setEx).toHaveBeenCalledWith('user:124', 1800, JSON.stringify({ id: '124', name: 'Jane' }));
      });

      it('should handle empty entries array', async () => {
        // TDD RED: Test empty entries array
        const entries: Array<{ key: string; value: any; ttl?: number }> = [];
        
        await redisAdapter.setMany(entries);
        
        expect(mockClient.mSet).not.toHaveBeenCalled(); // Should return early for empty array
      });

      it('should handle mixed value types', async () => {
        // TDD RED: Test mixed value types
        const entries = [
          { key: 'string-key', value: 'hello' },
          { key: 'number-key', value: 42 },
          { key: 'object-key', value: { name: 'John' } }
        ];
        
        mockClient.mSet.mockResolvedValue('OK');
        
        await redisAdapter.setMany(entries);
        
        expect(mockClient.mSet).toHaveBeenCalledWith([
          'string-key', 'hello',
          'number-key', JSON.stringify(42),
          'object-key', JSON.stringify({ name: 'John' })
        ]);
      });
    });

    describe('delete method', () => {
      it('should have correct signature: delete(key: string, options?: CacheOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        await redisAdapter.delete('test-key');
        expect(typeof redisAdapter.delete).toBe('function');
      });

      it('should delete a key from cache', async () => {
        // TDD RED: Test deletes key
        const key = 'user:123';
        
        mockClient.del.mockResolvedValue(1);
        
        await redisAdapter.delete(key);
        
        expect(mockClient.del).toHaveBeenCalledWith(key);
      });

      it('should handle non-existent key', async () => {
        // TDD RED: Test handles non-existent key
        const key = 'non-existent-key';
        
        mockClient.del.mockResolvedValue(0);
        
        await expect(redisAdapter.delete(key)).resolves.not.toThrow();
        expect(mockClient.del).toHaveBeenCalledWith(key);
      });
    });

    describe('invalidate method', () => {
      it('should have correct signature: invalidate(pattern: string, options?: CacheOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        await redisAdapter.invalidate('user:*');
        expect(typeof redisAdapter.invalidate).toBe('function');
      });

      it('should invalidate keys matching pattern', async () => {
        // TDD RED: Test invalidates by pattern
        const pattern = 'user:*';
        const matchingKeys = ['user:123', 'user:124', 'user:125'];
        
        mockClient.keys.mockResolvedValue(matchingKeys);
        mockClient.del.mockResolvedValue(matchingKeys.length);
        
        await redisAdapter.invalidate(pattern);
        
        expect(mockClient.keys).toHaveBeenCalledWith(pattern);
        expect(mockClient.del).toHaveBeenCalledWith(matchingKeys);
      });

      it('should handle no matching keys', async () => {
        // TDD RED: Test handles no matching keys
        const pattern = 'non-existent:*';
        
        mockClient.keys.mockResolvedValue([]);
        
        await expect(redisAdapter.invalidate(pattern)).resolves.not.toThrow();
        expect(mockClient.keys).toHaveBeenCalledWith(pattern);
        expect(mockClient.del).not.toHaveBeenCalled();
      });

      it('should handle wildcard patterns', async () => {
        // TDD RED: Test handles wildcard patterns
        const pattern = 'session:*';
        const matchingKeys = ['session:abc123', 'session:def456'];
        
        mockClient.keys.mockResolvedValue(matchingKeys);
        mockClient.del.mockResolvedValue(matchingKeys.length);
        
        await redisAdapter.invalidate(pattern);
        
        expect(mockClient.keys).toHaveBeenCalledWith(pattern);
        expect(mockClient.del).toHaveBeenCalledWith(matchingKeys);
      });
    });
  });

  describe('Connection Management', () => {
    it('should connect to Redis on initialization', async () => {
      // TDD RED: Test connects on init
      const adapter = new RedisCacheAdapter('redis://localhost:6379');
      
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // TDD RED: Test connection errors
      mockClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      const adapter = new RedisCacheAdapter('redis://invalid:6379');
      
      await expect(adapter.connect()).rejects.toThrow('Connection failed');
    });

    it('should disconnect from Redis', async () => {
      // TDD RED: Test disconnects
      await redisAdapter.disconnect();
      
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis errors gracefully', async () => {
      // TDD RED: Test error handling
      const key = 'test-key';
      mockClient.get.mockRejectedValue(new Error('Redis error'));
      
      await expect(redisAdapter.get(key)).rejects.toThrow('Redis error');
    });

    it('should handle network errors', async () => {
      // TDD RED: Test network errors
      const key = 'test-key';
      const value = 'test-value';
      mockClient.set.mockRejectedValue(new Error('Network error'));
      
      await expect(redisAdapter.set(key, value)).rejects.toThrow('Network error');
    });

    it('should handle serialization errors', async () => {
      // TDD RED: Test serialization errors
      const key = 'test-key';
      const value: any = { circular: null };
      value.circular = value; // Create circular reference
      
      await expect(redisAdapter.set(key, value)).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large values efficiently', async () => {
      // TDD RED: Test large values
      const key = 'large-data';
      const value = { data: 'x'.repeat(10000) }; // 10KB string
      
      mockClient.set.mockResolvedValue('OK');
      
      await redisAdapter.set(key, value);
      
      expect(mockClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should handle many keys efficiently', async () => {
      // TDD RED: Test many keys
      const keys = Array.from({ length: 1000 }, (_, i) => `key:${i}`);
      
      mockClient.mGet.mockResolvedValue(keys.map(() => null));
      
      const result = await redisAdapter.getMany(keys);
      
      expect(result).toHaveLength(1000);
      expect(mockClient.mGet).toHaveBeenCalledWith(keys);
    });
  });

  describe('Error Handling', () => {
    it('should handle set operation errors', async () => {
      mockClient.set.mockRejectedValue(new Error('Set operation failed'));
      
      await expect(redisAdapter.set('test-key', 'test-value')).rejects.toThrow('Set operation failed');
    });

    it('should handle delete operation errors', async () => {
      mockClient.del.mockRejectedValue(new Error('Delete operation failed'));
      
      await expect(redisAdapter.delete('test-key')).rejects.toThrow('Delete operation failed');
    });

    it('should handle exists operation errors', async () => {
      mockClient.exists.mockRejectedValue(new Error('Exists operation failed'));
      
      await expect(redisAdapter.exists('test-key')).rejects.toThrow('Exists operation failed');
    });

    it('should handle batch operations with partial failures', async () => {
      mockClient.mGet.mockRejectedValue(new Error('Batch get failed'));
      
      await expect(redisAdapter.getMany(['key1', 'key2'])).rejects.toThrow('Batch get failed');
    });

    it('should handle batch set operations with partial failures', async () => {
      mockClient.mSet.mockRejectedValue(new Error('Batch set failed'));
      
      await expect(redisAdapter.setMany([{ key: 'key1', value: 'value1' }])).rejects.toThrow('Batch set failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', async () => {
      await expect(redisAdapter.set('test-key', '')).resolves.toBeUndefined();
    });

    it('should handle null value', async () => {
      await expect(redisAdapter.set('test-key', null as any)).resolves.toBeUndefined();
    });

    it('should handle undefined value', async () => {
      await expect(redisAdapter.set('test-key', undefined as any)).resolves.toBeUndefined();
    });

    it('should handle very long keys', async () => {
      const longKey = 'a'.repeat(1000);
      mockClient.get.mockResolvedValue('test-value');
      
      const result = await redisAdapter.get(longKey);
      expect(result).toBe('test-value');
    });

    it('should handle very long values', async () => {
      const longValue = 'a'.repeat(10000);
      mockClient.set.mockResolvedValue('OK');
      
      await expect(redisAdapter.set('test-key', longValue)).resolves.toBeUndefined();
    });

    it('should handle special characters in keys', async () => {
      const specialKey = 'test:key:with:colons:and:spaces:and:unicode:🚀';
      mockClient.get.mockResolvedValue('test-value');
      
      const result = await redisAdapter.get(specialKey);
      expect(result).toBe('test-value');
    });

    it('should handle special characters in values', async () => {
      const specialValue = 'value:with:colons:and:spaces:and:unicode:🚀';
      mockClient.set.mockResolvedValue('OK');
      
      await expect(redisAdapter.set('test-key', specialValue)).resolves.toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should handle concurrent operations', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(redisAdapter.set(`key-${i}`, `value-${i}`));
      }
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle large batch operations', async () => {
      const items = [];
      for (let i = 0; i < 1000; i++) {
        items.push({ key: `batch-key-${i}`, value: `batch-value-${i}` });
      }
      
      await expect(redisAdapter.setMany(items)).resolves.toBeUndefined();
    });
  });
});
