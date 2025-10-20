/**
 * TDD RED Phase: Interface Contract Tests for ICacheReader
 * 
 * These tests define the expected behavior of the ICacheReader interface
 * before we implement it. They should FAIL initially (RED).
 */

import { ICacheReader, CacheOptions } from '../../../src/interfaces/ICacheReader';

describe('ICacheReader Interface Contract', () => {
  let mockCacheReader: ICacheReader;

  beforeEach(() => {
    // This will fail until we create the interface
    mockCacheReader = {
      get: jest.fn(),
      getMany: jest.fn(),
      exists: jest.fn()
    };
  });

  describe('get method', () => {
    it('should have correct signature: get<T>(key: string, options?: CacheOptions): Promise<T | null>', async () => {
      // TDD RED: Test the method signature
      const result = await mockCacheReader.get<string>('test-key');
      expect(typeof mockCacheReader.get).toBe('function');
    });

    it('should return cached value for existing key', async () => {
      // TDD RED: Test expected behavior
      const cachedValue = { id: '123', name: 'Test User' };
      mockCacheReader.get = jest.fn().mockResolvedValue(cachedValue);
      
      const result = await mockCacheReader.get('user:123');
      expect(result).toEqual(cachedValue);
    });

    it('should return null for non-existent key', async () => {
      // TDD RED: Test expected behavior
      mockCacheReader.get = jest.fn().mockResolvedValue(null);
      
      const result = await mockCacheReader.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should accept optional CacheOptions parameter', async () => {
      // TDD RED: Test optional parameter
      const options: CacheOptions = { 
        region: 'US',
        consistency: 'strong'
      };
      
      await mockCacheReader.get('test-key', options);
      expect(mockCacheReader.get).toHaveBeenCalledWith('test-key', options);
    });

    it('should handle different data types', async () => {
      // TDD RED: Test type safety
      const stringValue = 'test string';
      const numberValue = 42;
      const objectValue = { key: 'value' };
      
      mockCacheReader.get = jest.fn()
        .mockResolvedValueOnce(stringValue)
        .mockResolvedValueOnce(numberValue)
        .mockResolvedValueOnce(objectValue);
      
      const stringResult = await mockCacheReader.get<string>('string-key');
      const numberResult = await mockCacheReader.get<number>('number-key');
      const objectResult = await mockCacheReader.get<object>('object-key');
      
      expect(stringResult).toBe(stringValue);
      expect(numberResult).toBe(numberValue);
      expect(objectResult).toEqual(objectValue);
    });
  });

  describe('getMany method', () => {
    it('should have correct signature: getMany<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]>', async () => {
      // TDD RED: Test the method signature
      const keys = ['key1', 'key2', 'key3'];
      const result = await mockCacheReader.getMany<string>(keys);
      expect(typeof mockCacheReader.getMany).toBe('function');
    });

    it('should return array of values for multiple keys', async () => {
      // TDD RED: Test expected behavior
      const keys = ['key1', 'key2', 'key3'];
      const values = ['value1', 'value2', null]; // key3 not found
      mockCacheReader.getMany = jest.fn().mockResolvedValue(values);
      
      const result = await mockCacheReader.getMany(keys);
      expect(result).toEqual(values);
      expect(result).toHaveLength(3);
    });

    it('should return null for non-existent keys', async () => {
      // TDD RED: Test expected behavior
      const keys = ['non-existent-1', 'non-existent-2'];
      const values = [null, null];
      mockCacheReader.getMany = jest.fn().mockResolvedValue(values);
      
      const result = await mockCacheReader.getMany(keys);
      expect(result).toEqual(values);
    });

    it('should accept optional CacheOptions parameter', async () => {
      // TDD RED: Test optional parameter
      const keys = ['key1', 'key2'];
      const options: CacheOptions = { 
        region: 'EU',
        consistency: 'eventual'
      };
      
      await mockCacheReader.getMany(keys, options);
      expect(mockCacheReader.getMany).toHaveBeenCalledWith(keys, options);
    });

    it('should handle empty keys array', async () => {
      // TDD RED: Test edge case
      mockCacheReader.getMany = jest.fn().mockResolvedValue([]);
      
      const result = await mockCacheReader.getMany([]);
      expect(result).toEqual([]);
    });
  });

  describe('exists method', () => {
    it('should have correct signature: exists(key: string, options?: CacheOptions): Promise<boolean>', async () => {
      // TDD RED: Test the method signature
      const result = await mockCacheReader.exists('test-key');
      expect(typeof mockCacheReader.exists).toBe('function');
    });

    it('should return true for existing key', async () => {
      // TDD RED: Test expected behavior
      mockCacheReader.exists = jest.fn().mockResolvedValue(true);
      
      const result = await mockCacheReader.exists('existing-key');
      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      // TDD RED: Test expected behavior
      mockCacheReader.exists = jest.fn().mockResolvedValue(false);
      
      const result = await mockCacheReader.exists('non-existent-key');
      expect(result).toBe(false);
    });

    it('should accept optional CacheOptions parameter', async () => {
      // TDD RED: Test optional parameter
      const options: CacheOptions = { 
        region: 'US',
        consistency: 'strong'
      };
      
      await mockCacheReader.exists('test-key', options);
      expect(mockCacheReader.exists).toHaveBeenCalledWith('test-key', options);
    });
  });

  describe('ISP Compliance', () => {
    it('should only contain read operations (no write operations)', () => {
      // TDD RED: Test ISP compliance - interface should only have read methods
      const readMethods = ['get', 'getMany', 'exists'];
      
      // Should have all read methods
      readMethods.forEach(method => {
        expect(mockCacheReader).toHaveProperty(method);
        expect(typeof mockCacheReader[method as keyof ICacheReader]).toBe('function');
      });
      
      // Should not have write methods
      const writeMethods = ['set', 'setMany', 'delete', 'invalidate'];
      writeMethods.forEach(method => {
        expect(mockCacheReader).not.toHaveProperty(method);
      });
    });

    it('should be focused on single responsibility (cache reading)', () => {
      // TDD RED: Test ISP compliance - single responsibility
      expect(mockCacheReader).toHaveProperty('get');
      expect(mockCacheReader).toHaveProperty('getMany');
      expect(mockCacheReader).toHaveProperty('exists');
      
      // Should not have database, audit, or other responsibilities
      expect(mockCacheReader).not.toHaveProperty('findById');
      expect(mockCacheReader).not.toHaveProperty('logAudit');
      expect(mockCacheReader).not.toHaveProperty('encrypt');
    });
  });
});
