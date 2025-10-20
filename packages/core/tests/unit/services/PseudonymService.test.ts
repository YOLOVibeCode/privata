/**
 * TDD RED Phase: Tests for PseudonymService
 * 
 * These tests define the expected behavior of the PseudonymService
 * before we implement it. They should FAIL initially (RED).
 */

import { PseudonymService } from '../../../src/services/PseudonymService';
import { IPseudonymGenerator } from '../../../src/interfaces/IPseudonymGenerator';

describe('PseudonymService', () => {
  let pseudonymService: PseudonymService;
  let mockGenerator: jest.Mocked<IPseudonymGenerator>;

  beforeEach(() => {
    // This will fail until we create the service
    mockGenerator = {
      generate: jest.fn(),
      validate: jest.fn()
    };
    
    pseudonymService = new PseudonymService(mockGenerator);
  });

  describe('generate method', () => {
    it('should have correct signature: generate(): string', () => {
      // TDD RED: Test the method signature
      const result = pseudonymService.generate();
      expect(typeof pseudonymService.generate).toBe('function');
    });

    it('should generate pseudonym with prefix', () => {
      // TDD RED: Test generates pseudonym with prefix
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = pseudonymService.generate();
      expect(result).toBe(mockPseudonym);
      expect(result).toMatch(/^pseudo_/);
    });

    it('should generate unique pseudonyms', () => {
      // TDD RED: Test uniqueness
      const pseudonyms = new Set();
      const mockPseudonyms = [
        'pseudo_abc123def456',
        'pseudo_xyz789ghi012',
        'pseudo_mno345pqr678'
      ];
      
      mockGenerator.generate
        .mockReturnValueOnce(mockPseudonyms[0]!)
        .mockReturnValueOnce(mockPseudonyms[1]!)
        .mockReturnValueOnce(mockPseudonyms[2]!);
      
      for (let i = 0; i < 3; i++) {
        const pseudonym = pseudonymService.generate();
        pseudonyms.add(pseudonym);
      }
      
      expect(pseudonyms.size).toBe(3);
      expect(mockGenerator.generate).toHaveBeenCalledTimes(3);
    });

    it('should generate cryptographically secure pseudonyms', () => {
      // TDD RED: Test cryptographic security
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = pseudonymService.generate();
      expect(result).toHaveLength(19); // 'pseudo_' + 12 chars
      expect(result).toMatch(/^pseudo_[a-z0-9]+$/);
    });

    it('should generate pseudonyms with appropriate length', () => {
      // TDD RED: Test length validation
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = pseudonymService.generate();
      expect(result.length).toBeGreaterThanOrEqual(15);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });

  describe('validate method', () => {
    it('should have correct signature: validate(pseudonym: string): boolean', () => {
      // TDD RED: Test the method signature
      const result = pseudonymService.validate('pseudo_abc123def456');
      expect(typeof pseudonymService.validate).toBe('function');
    });

    it('should validate correct pseudonym format', () => {
      // TDD RED: Test validate() accepts valid format
      const validPseudonym = 'pseudo_abc123def456';
      mockGenerator.validate.mockReturnValue(true);
      
      const result = pseudonymService.validate(validPseudonym);
      expect(result).toBe(true);
      expect(mockGenerator.validate).toHaveBeenCalledWith(validPseudonym);
    });

    it('should reject invalid pseudonym format', () => {
      // TDD RED: Test validate() rejects invalid format
      const invalidPseudonym = 'invalid_pseudonym';
      mockGenerator.validate.mockReturnValue(false);
      
      const result = pseudonymService.validate(invalidPseudonym);
      expect(result).toBe(false);
      expect(mockGenerator.validate).toHaveBeenCalledWith(invalidPseudonym);
    });

    it('should reject pseudonyms without prefix', () => {
      // TDD RED: Test missing prefix
      const noPrefixPseudonym = 'abc123def456';
      mockGenerator.validate.mockReturnValue(false);
      
      const result = pseudonymService.validate(noPrefixPseudonym);
      expect(result).toBe(false);
    });

    it('should reject pseudonyms with wrong prefix', () => {
      // TDD RED: Test wrong prefix
      const wrongPrefixPseudonym = 'fake_abc123def456';
      mockGenerator.validate.mockReturnValue(false);
      
      const result = pseudonymService.validate(wrongPrefixPseudonym);
      expect(result).toBe(false);
    });

    it('should reject empty string', () => {
      // TDD RED: Test empty string
      mockGenerator.validate.mockReturnValue(false);
      
      const result = pseudonymService.validate('');
      expect(result).toBe(false);
    });

    it('should reject null or undefined', () => {
      // TDD RED: Test null/undefined
      mockGenerator.validate.mockReturnValue(false);
      
      const result1 = pseudonymService.validate(null as any);
      const result2 = pseudonymService.validate(undefined as any);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });

  describe('Dependency Injection', () => {
    it('should accept IPseudonymGenerator in constructor', () => {
      // TDD RED: Test constructor dependency injection
      const service = new PseudonymService(mockGenerator);
      expect(service).toBeInstanceOf(PseudonymService);
    });

    it('should use injected generator for operations', () => {
      // TDD RED: Test uses injected generator
      const mockPseudonym = 'pseudo_test123';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = pseudonymService.generate();
      expect(mockGenerator.generate).toHaveBeenCalled();
      expect(result).toBe(mockPseudonym);
    });
  });

  describe('Error Handling', () => {
    it('should handle generator errors gracefully', () => {
      // TDD RED: Test error handling
      mockGenerator.generate.mockImplementation(() => {
        throw new Error('Generator failed');
      });
      
      expect(() => pseudonymService.generate()).toThrow('Generator failed');
    });

    it('should handle validation errors gracefully', () => {
      // TDD RED: Test validation error handling
      mockGenerator.validate.mockImplementation(() => {
        throw new Error('Validation failed');
      });
      
      expect(() => pseudonymService.validate('test')).toThrow('Validation failed');
    });
  });
});
