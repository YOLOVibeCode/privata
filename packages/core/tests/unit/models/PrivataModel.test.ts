/**
 * @fileoverview TDD Tests for PrivataModel CRUD Operations
 * @description RED Phase - Tests for create, read, update, delete with data separation
 */

import { PrivataModel } from '../../../src/models/PrivataModel';
import { Model } from '../../../src/models/ModelRegistry';
import { IDatabaseReader } from '../../../src/interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../../../src/interfaces/IDatabaseWriter';
import { ICacheReader } from '../../../src/interfaces/ICacheReader';
import { ICacheWriter } from '../../../src/interfaces/ICacheWriter';
import { IPseudonymGenerator } from '../../../src/interfaces/IPseudonymGenerator';
import { DataSeparatorService } from '../../../src/services/DataSeparatorService';

describe('PrivataModel - CRUD with Data Separation (TDD)', () => {
  let model: PrivataModel;
  let mockIdentityDB: jest.Mocked<IDatabaseReader & IDatabaseWriter>;
  let mockClinicalDB: jest.Mocked<IDatabaseReader & IDatabaseWriter>;
  let mockCache: jest.Mocked<ICacheReader & ICacheWriter>;
  let mockPseudonymGen: jest.Mocked<IPseudonymGenerator>;
  let mockDataSeparator: jest.Mocked<DataSeparatorService>;
  let schema: Model;

  beforeEach(() => {
    // Mock dependencies
    mockIdentityDB = {
      findById: jest.fn(),
      findMany: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockClinicalDB = {
      findById: jest.fn(),
      findMany: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockCache = {
      get: jest.fn(),
      exists: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      invalidate: jest.fn(),
    } as any;

    mockPseudonymGen = {
      generate: jest.fn(),
      validate: jest.fn(),
    };

    mockDataSeparator = {
      separate: jest.fn(),
    } as any;

    // Create test schema
    schema = new Model('User', {
      identity: {
        firstName: { type: String, pii: true, required: true },
        lastName: { type: String, pii: true, required: true },
        email: { type: String, pii: true, required: true },
      },
      clinical: {
        diagnosis: { type: String, phi: true },
        medications: { type: [String], phi: true },
      },
      metadata: {
        createdAt: { type: Date },
        updatedAt: { type: Date },
      },
    });

    model = new PrivataModel(
      schema,
      mockIdentityDB,
      mockClinicalDB,
      mockCache,
      mockDataSeparator
    );
  });

  describe('CREATE Operation', () => {
    it('should create document with automatic data separation', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        diagnosis: 'Hypertension',
      };

      const pseudonym = 'pseu_abc123';
      
      mockDataSeparator.separate.mockResolvedValue({
        pii: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        phi: { diagnosis: 'Hypertension' },
        metadata: {},
        pseudonym,
      });

      mockIdentityDB.create.mockResolvedValue({
        id: 'user-123',
        pseudonym,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      mockClinicalDB.create.mockResolvedValue({
        pseudonym,
        diagnosis: 'Hypertension',
      });

      const result = await model.create(userData);

      expect(mockDataSeparator.separate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          diagnosis: 'Hypertension',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(mockIdentityDB.create).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'John', pseudonym })
      );
      expect(mockClinicalDB.create).toHaveBeenCalledWith(
        expect.objectContaining({ pseudonym, diagnosis: 'Hypertension' })
      );
      
      expect(result.id).toBe('user-123');
      expect(result.firstName).toBe('John');
      expect(result.diagnosis).toBe('Hypertension');
    });

    it('should validate data before creation', async () => {
      const invalidData = {
        firstName: 'John',
        // Missing required lastName and email
      };

      await expect(model.create(invalidData)).rejects.toThrow(
        'Validation failed'
      );
    });

    it('should generate timestamps automatically', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      mockDataSeparator.separate.mockResolvedValue({
        pii: userData,
        phi: {},
        metadata: {},
        pseudonym: 'pseu_123',
      });

      const now = new Date();
      
      mockIdentityDB.create.mockResolvedValue({
        id: 'user-123',
        ...userData,
        pseudonym: 'pseu_123',
        createdAt: now,
        updatedAt: now,
      });

      const result = await model.create(userData);

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('READ Operation (findById)', () => {
    it('should read from cache first', async () => {
      const cachedData = {
        id: 'user-123',
        firstName: 'John',
        diagnosis: 'Hypertension',
      };

      mockCache.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await model.findById('user-123');

      expect(mockCache.get).toHaveBeenCalledWith('User:user-123');
      expect(mockIdentityDB.findById).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('should fall back to database if cache miss', async () => {
      mockCache.get.mockResolvedValue(null);

      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      mockClinicalDB.findById.mockResolvedValue({
        pseudonym: 'pseu_abc123',
        diagnosis: 'Hypertension',
      });

      const result = await model.findById('user-123');

      expect(mockCache.get).toHaveBeenCalledWith('User:user-123');
      expect(mockIdentityDB.findById).toHaveBeenCalledWith('user-123');
      expect(mockClinicalDB.findById).toHaveBeenCalledWith('pseu_abc123');
      
      expect(result.id).toBe('user-123');
      expect(result.firstName).toBe('John');
      expect(result.diagnosis).toBe('Hypertension');
    });

    it('should cache data after database read', async () => {
      mockCache.get.mockResolvedValue(null);

      const identityData = {
        id: 'user-123',
        pseudonym: 'pseu_abc123',
        firstName: 'John',
      };

      const clinicalData = {
        pseudonym: 'pseu_abc123',
        diagnosis: 'Hypertension',
      };

      mockIdentityDB.findById.mockResolvedValue(identityData);
      mockClinicalDB.findById.mockResolvedValue(clinicalData);

      await model.findById('user-123');

      expect(mockCache.set).toHaveBeenCalledWith(
        'User:user-123',
        expect.any(String),
        300
      );
    });

    it('should return null for non-existent document', async () => {
      mockCache.get.mockResolvedValue(null);
      mockIdentityDB.findById.mockResolvedValue(null);

      const result = await model.findById('non-existent');

      expect(result).toBeNull();
      expect(mockClinicalDB.findById).not.toHaveBeenCalled();
    });
  });

  describe('UPDATE Operation', () => {
    it('should update document and invalidate cache', async () => {
      const updates = {
        email: 'newemail@example.com',
        diagnosis: 'Diabetes',
      };

      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc123',
        firstName: 'John',
      });

      mockDataSeparator.separate.mockResolvedValue({
        pii: { email: 'newemail@example.com' },
        phi: { diagnosis: 'Diabetes' },
        metadata: {},
        pseudonym: 'pseu_abc123',
      });

      mockIdentityDB.update.mockResolvedValue({
        id: 'user-123',
        email: 'newemail@example.com',
      });

      mockClinicalDB.update.mockResolvedValue({
        diagnosis: 'Diabetes',
      });

      await model.update('user-123', updates);

      expect(mockCache.invalidate).toHaveBeenCalledWith('User:user-123');
      expect(mockIdentityDB.update).toHaveBeenCalled();
      expect(mockClinicalDB.update).toHaveBeenCalled();
    });

    it('should update timestamps', async () => {
      const updates = { email: 'new@example.com' };

      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc123',
      });

      mockDataSeparator.separate.mockResolvedValue({
        pii: updates,
        phi: {},
        metadata: {},
        pseudonym: 'pseu_abc123',
      });

      mockIdentityDB.update.mockResolvedValue({});

      await model.update('user-123', updates);

      expect(mockIdentityDB.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw error for non-existent document', async () => {
      mockIdentityDB.findById.mockResolvedValue(null);

      await expect(model.update('non-existent', {})).rejects.toThrow(
        'Document not found'
      );
    });
  });

  describe('DELETE Operation', () => {
    it('should delete from both databases and cache', async () => {
      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc123',
      });

      await model.delete('user-123');

      expect(mockIdentityDB.delete).toHaveBeenCalledWith('user-123');
      expect(mockClinicalDB.delete).toHaveBeenCalledWith('pseu_abc123');
      expect(mockCache.invalidate).toHaveBeenCalledWith('User:user-123');
    });

    it('should support soft delete (GDPR-compliant)', async () => {
      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc123',
      });

      await model.delete('user-123', { gdprCompliant: true });

      // GDPR-compliant delete: Remove PII, keep PHI
      expect(mockIdentityDB.delete).toHaveBeenCalledWith('user-123');
      expect(mockClinicalDB.delete).not.toHaveBeenCalled(); // PHI retained
      expect(mockCache.invalidate).toHaveBeenCalledWith('User:user-123');
    });

    it('should throw error for non-existent document', async () => {
      mockIdentityDB.findById.mockResolvedValue(null);

      await expect(model.delete('non-existent')).rejects.toThrow(
        'Document not found'
      );
    });
  });

  describe('FIND Many Operation', () => {
    it('should find multiple documents', async () => {
      mockIdentityDB.findMany.mockResolvedValue([
        { id: 'user-1', pseudonym: 'pseu_1', firstName: 'John' },
        { id: 'user-2', pseudonym: 'pseu_2', firstName: 'Jane' },
      ]);

      mockClinicalDB.findById.mockResolvedValueOnce({ pseudonym: 'pseu_1', diagnosis: 'Hypertension' });
      mockClinicalDB.findById.mockResolvedValueOnce({ pseudonym: 'pseu_2', diagnosis: 'Diabetes' });

      const results = await model.find({ firstName: 'J%' });

      expect(results).toHaveLength(2);
      expect(results[0].firstName).toBe('John');
      expect(results[0].diagnosis).toBe('Hypertension');
      expect(results[1].firstName).toBe('Jane');
      expect(results[1].diagnosis).toBe('Diabetes');
    });

    it('should support query filters', async () => {
      mockIdentityDB.findMany.mockResolvedValue([]);
      
      await model.find({ firstName: 'John', email: 'john@example.com' });

      expect(mockIdentityDB.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          email: 'john@example.com',
        })
      );
    });
  });
});

