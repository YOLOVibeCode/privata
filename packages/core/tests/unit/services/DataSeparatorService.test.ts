/**
 * TDD RED Phase: Tests for DataSeparatorService
 * 
 * These tests define the expected behavior of the DataSeparatorService
 * before we implement it. They should FAIL initially (RED).
 */

import { DataSeparatorService } from '../../../src/services/DataSeparatorService';
import { IPseudonymGenerator } from '../../../src/interfaces/IPseudonymGenerator';

describe('DataSeparatorService', () => {
  let dataSeparatorService: DataSeparatorService;
  let mockGenerator: jest.Mocked<IPseudonymGenerator>;

  beforeEach(() => {
    // This will fail until we create the service
    mockGenerator = {
      generate: jest.fn(),
      validate: jest.fn()
    };
    
    dataSeparatorService = new DataSeparatorService(mockGenerator);
  });

  describe('separate method', () => {
    it('should have correct signature: separate(data: any): Promise<{ pii: any; phi: any; metadata: any; pseudonym: string }>', async () => {
      // TDD RED: Test the method signature
      const data = { firstName: 'John', diagnosis: 'Tinnitus' };
      const result = await dataSeparatorService.separate(data);
      expect(typeof dataSeparatorService.separate).toBe('function');
    });

    it('should handle empty object', async () => {
      const data = {};
      const mockPseudonym = 'pseudo_empty';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({});
      expect(result.phi).toEqual({});
      expect(result.metadata).toEqual({});
      expect(result.pseudonym).toBe(mockPseudonym);
    });

    it('should handle null/undefined values', async () => {
      const data = {
        firstName: null,
        lastName: undefined,
        diagnosis: 'Tinnitus',
        age: 0
      };
      const mockPseudonym = 'pseudo_null';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({
        firstName: null,
        lastName: undefined
      });
      expect(result.phi).toEqual({
        diagnosis: 'Tinnitus'
      });
      expect(result.metadata).toEqual({
        age: 0
      });
    });

    it('should handle nested objects', async () => {
      const data = {
        firstName: 'John',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA'
        },
        medicalHistory: {
          conditions: ['diabetes', 'hypertension'],
          medications: ['insulin', 'lisinopril']
        }
      };
      const mockPseudonym = 'pseudo_nested';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({
        firstName: 'John',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA'
        }
      });
      expect(result.phi).toEqual({
        medicalHistory: {
          conditions: ['diabetes', 'hypertension'],
          medications: ['insulin', 'lisinopril']
        }
      });
    });

    it('should handle arrays', async () => {
      const data = {
        emails: ['john@example.com', 'j.doe@company.com'],
        diagnosis: 'diabetes', // Use singular form that's recognized
        medications: ['insulin', 'lisinopril'],
        tags: ['vip', 'premium']
      };
      const mockPseudonym = 'pseudo_array';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({
        emails: ['john@example.com', 'j.doe@company.com']
      });
      expect(result.phi).toEqual({
        diagnosis: 'diabetes',
        medications: ['insulin', 'lisinopril']
      });
      expect(result.metadata).toEqual({
        tags: ['vip', 'premium']
      });
    });

    it('should separate PII fields', async () => {
      // TDD RED: Test separates PII fields
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        address: { street: '123 Main St', city: 'New York' }
      };
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        address: { street: '123 Main St', city: 'New York' }
      });
      expect(result.pseudonym).toBe(mockPseudonym);
    });

    it('should separate PHI fields', async () => {
      // TDD RED: Test separates PHI fields
      const data = {
        firstName: 'John',
        diagnosis: 'Tinnitus',
        treatment: 'Hearing aids',
        medicalHistory: ['Previous condition'],
        medications: ['Medication A', 'Medication B']
      };
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.phi).toEqual({
        diagnosis: 'Tinnitus',
        treatment: 'Hearing aids',
        medicalHistory: ['Previous condition'],
        medications: ['Medication A', 'Medication B']
      });
      expect(result.pseudonym).toBe(mockPseudonym);
    });

    it('should separate metadata fields', async () => {
      // TDD RED: Test separates metadata fields
      const data = {
        firstName: 'John',
        diagnosis: 'Tinnitus',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        version: 1,
        region: 'US'
      };
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.metadata).toEqual({
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        version: 1,
        region: 'US'
      });
      expect(result.pseudonym).toBe(mockPseudonym);
    });

    it('should handle empty object', async () => {
      // TDD RED: Test handles empty object
      const data = {};
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({});
      expect(result.phi).toEqual({});
      expect(result.metadata).toEqual({});
      expect(result.pseudonym).toBe(mockPseudonym);
    });

    it('should handle null/undefined', async () => {
      // TDD RED: Test handles null/undefined
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result1 = await dataSeparatorService.separate(null);
      const result2 = await dataSeparatorService.separate(undefined);
      
      expect(result1.pii).toEqual({});
      expect(result1.phi).toEqual({});
      expect(result1.metadata).toEqual({});
      expect(result1.pseudonym).toBe(mockPseudonym);
      
      expect(result2.pii).toEqual({});
      expect(result2.phi).toEqual({});
      expect(result2.metadata).toEqual({});
      expect(result2.pseudonym).toBe(mockPseudonym);
    });

    it('should generate unique pseudonym for each separation', async () => {
      // TDD RED: Test pseudonym generation
      const data1 = { firstName: 'John' };
      const data2 = { firstName: 'Jane' };
      
      const mockPseudonym1 = 'pseudo_abc123def456';
      const mockPseudonym2 = 'pseudo_xyz789ghi012';
      
      mockGenerator.generate
        .mockReturnValueOnce(mockPseudonym1)
        .mockReturnValueOnce(mockPseudonym2);
      
      const result1 = await dataSeparatorService.separate(data1);
      const result2 = await dataSeparatorService.separate(data2);
      
      expect(result1.pseudonym).toBe(mockPseudonym1);
      expect(result2.pseudonym).toBe(mockPseudonym2);
      expect(mockGenerator.generate).toHaveBeenCalledTimes(2);
    });
  });

  describe('schema-based separation', () => {
    it('should separate based on provided schema', async () => {
      // TDD RED: Test schema-based separation
      const data = {
        firstName: 'John',
        diagnosis: 'Tinnitus',
        customField: 'custom value'
      };
      
      const schema = {
        pii: ['firstName'],
        phi: ['diagnosis'],
        metadata: ['customField']
      };
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data, schema);
      
      expect(result.pii).toEqual({ firstName: 'John' });
      expect(result.phi).toEqual({ diagnosis: 'Tinnitus' });
      expect(result.metadata).toEqual({ customField: 'custom value' });
      expect(result.pseudonym).toBe(mockPseudonym);
    });
  });

  describe('nested object handling', () => {
    it('should handle nested objects', async () => {
      // TDD RED: Test nested object test
      const data = {
        firstName: 'John',
        diagnosis: 'Tinnitus',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA'
        },
        medicalRecord: {
          diagnosis: 'Tinnitus',
          treatment: 'Hearing aids'
        }
      };
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii.address).toEqual({
        street: '123 Main St',
        city: 'New York',
        country: 'USA'
      });
      expect(result.phi.medicalRecord).toEqual({
        diagnosis: 'Tinnitus',
        treatment: 'Hearing aids'
      });
    });
  });

  describe('array handling', () => {
    it('should handle arrays', async () => {
      // TDD RED: Test array handling test
      const data = {
        firstName: 'John',
        medications: ['Medication A', 'Medication B'],
        allergies: ['Allergy 1', 'Allergy 2']
      };
      
      const mockPseudonym = 'pseudo_abc123def456';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      
      expect(result.pii).toEqual({ firstName: 'John' });
      expect(result.phi.medications).toEqual(['Medication A', 'Medication B']);
      expect(result.phi.allergies).toEqual(['Allergy 1', 'Allergy 2']);
    });
  });

  describe('Dependency Injection', () => {
    it('should accept IPseudonymGenerator in constructor', () => {
      // TDD RED: Test constructor dependency injection
      const service = new DataSeparatorService(mockGenerator);
      expect(service).toBeInstanceOf(DataSeparatorService);
    });

    it('should use injected generator for pseudonym generation', async () => {
      // TDD RED: Test uses injected generator
      const data = { firstName: 'John' };
      const mockPseudonym = 'pseudo_test123';
      mockGenerator.generate.mockReturnValue(mockPseudonym);
      
      const result = await dataSeparatorService.separate(data);
      expect(mockGenerator.generate).toHaveBeenCalled();
      expect(result.pseudonym).toBe(mockPseudonym);
    });
  });

  describe('Error Handling', () => {
    it('should handle generator errors gracefully', async () => {
      // TDD RED: Test error handling
      const data = { firstName: 'John' };
      mockGenerator.generate.mockImplementation(() => {
        throw new Error('Generator failed');
      });
      
      await expect(dataSeparatorService.separate(data)).rejects.toThrow('Generator failed');
    });
  });
});
