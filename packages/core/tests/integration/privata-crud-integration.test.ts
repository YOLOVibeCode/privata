/**
 * @fileoverview Integration tests for Privata CRUD with data separation
 * @description Tests the full integration of model registry, CRUD, and compliance features
 */

import { Privata, PrivataConfig } from '../../src/Privata';
import { ModelRegistry } from '../../src/models/ModelRegistry';
import { PrivataModel } from '../../src/models/PrivataModel';
import { DataSeparatorService } from '../../src/services/DataSeparatorService';
import { PseudonymService } from '../../src/services/PseudonymService';

describe('Privata CRUD Integration', () => {
  let privata: Privata;
  let mockIdentityDB: any;
  let mockClinicalDB: any;
  let mockCache: any;

  beforeEach(() => {
    // Mock dependencies
    mockIdentityDB = {
      findById: jest.fn(),
      findMany: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockClinicalDB = {
      findById: jest.fn(),
      findMany: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCache = {
      get: jest.fn(),
      exists: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      invalidate: jest.fn(),
      setMany: jest.fn(),
      getMany: jest.fn(),
    };

    const config: PrivataConfig = {
      compliance: {
        gdpr: {
          enabled: true,
          dataSubjectRights: true,
          auditLogging: true,
        },
        hipaa: {
          enabled: true,
          phiProtection: true,
          breachNotification: true,
        },
      },
    };

    privata = new Privata(config);
  });

  describe('Model Registration', () => {
    it('should register a model and make it available', () => {
      const UserModel = privata.model('User', {
        identity: {
          firstName: { type: String, pii: true, required: true },
          lastName: { type: String, pii: true, required: true },
          email: { type: String, pii: true, required: true },
        },
        clinical: {
          diagnosis: { type: String, phi: true },
        },
      });

      expect(UserModel).toBeDefined();
      expect(privata.hasModel('User')).toBe(true);
    });

    it('should throw error for duplicate model registration', () => {
      const schema = {
        identity: { name: { type: String, pii: true } },
      };

      privata.model('User', schema);

      expect(() => privata.model('User', schema)).toThrow(
        'Model "User" is already registered'
      );
    });

    it('should allow registering multiple different models', () => {
      privata.model('User', {
        identity: { name: { type: String, pii: true } },
      });

      privata.model('Patient', {
        clinical: { diagnosis: { type: String, phi: true } },
      });

      expect(privata.hasModel('User')).toBe(true);
      expect(privata.hasModel('Patient')).toBe(true);
    });
  });

  describe('CRUD Operations with Data Separation', () => {
    beforeEach(() => {
      // Setup Privata with dependencies
      const mockPseudonymGen = {
        generate: jest.fn().mockReturnValue('pseu_abc'),
        validate: jest.fn().mockReturnValue(true),
      };
      
      (privata as any).identityDB = mockIdentityDB;
      (privata as any).clinicalDB = mockClinicalDB;
      (privata as any).cache = mockCache;
      (privata as any).dataSeparator = new DataSeparatorService(
        new PseudonymService(mockPseudonymGen)
      );
    });

    it('should create document with automatic PII/PHI separation', async () => {
      const UserModel = privata.model('User', {
        identity: {
          firstName: { type: String, pii: true, required: true },
          email: { type: String, pii: true, required: true },
        },
        clinical: {
          diagnosis: { type: String, phi: true },
        },
      });

      mockIdentityDB.create.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc',
        firstName: 'John',
        email: 'john@example.com',
      });

      mockClinicalDB.create.mockResolvedValue({
        pseudonym: 'pseu_abc',
        diagnosis: 'Hypertension',
      });

      mockCache.set.mockResolvedValue(undefined);

      const user = await UserModel.create({
        firstName: 'John',
        email: 'john@example.com',
        diagnosis: 'Hypertension',
      });

      expect(user.id).toBe('user-123');
      expect(user.firstName).toBe('John');
      expect(user.diagnosis).toBe('Hypertension');

      // Verify PII stored in identity DB
      expect(mockIdentityDB.create).toHaveBeenCalled();

      // Verify PHI stored in clinical DB
      expect(mockClinicalDB.create).toHaveBeenCalled();

      // Verify data is cached
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should read with cache-first strategy', async () => {
      const UserModel = privata.model('User', {
        identity: { name: { type: String, pii: true, required: true } },
      });

      const cachedUser = {
        id: 'user-123',
        name: 'John',
      };

      mockCache.get.mockResolvedValue(JSON.stringify(cachedUser));

      const user = await UserModel.findById('user-123');

      expect(user).toEqual(cachedUser);
      expect(mockCache.get).toHaveBeenCalledWith('User:user-123');
      expect(mockIdentityDB.findById).not.toHaveBeenCalled();
    });

    it('should update and invalidate cache', async () => {
      const UserModel = privata.model('User', {
        identity: {
          name: { type: String, pii: true, required: true },
          email: { type: String, pii: true },
        },
      });

      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc',
        name: 'John',
        email: 'old@example.com',
      });

      mockIdentityDB.update.mockResolvedValue({
        id: 'user-123',
        email: 'new@example.com',
      });

      mockCache.invalidate.mockResolvedValue(undefined);

      await UserModel.update('user-123', { email: 'new@example.com' });

      expect(mockIdentityDB.update).toHaveBeenCalled();
      expect(mockCache.invalidate).toHaveBeenCalledWith('User:user-123');
    });

    it('should delete with GDPR compliance', async () => {
      const UserModel = privata.model('User', {
        identity: { name: { type: String, pii: true, required: true } },
        clinical: { diagnosis: { type: String, phi: true } },
      });

      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc',
        name: 'John',
      });

      mockIdentityDB.delete.mockResolvedValue(undefined);
      mockCache.invalidate.mockResolvedValue(undefined);

      await UserModel.delete('user-123', { gdprCompliant: true });

      // PII deleted
      expect(mockIdentityDB.delete).toHaveBeenCalledWith('user-123');

      // PHI retained (GDPR compliant delete)
      expect(mockClinicalDB.delete).not.toHaveBeenCalled();

      // Cache invalidated
      expect(mockCache.invalidate).toHaveBeenCalledWith('User:user-123');
    });
  });

  describe('Integration with GDPR Rights', () => {
    it('should support Article 15 (Right of Access) with model data', async () => {
      privata.model('User', {
        identity: { name: { type: String, pii: true, required: true } },
        clinical: { diagnosis: { type: String, phi: true } },
      });

      await privata.initialize();

      const accessRequest = await privata.requestDataAccess('user-123');

      expect(accessRequest).toBeDefined();
      expect(accessRequest.dataSubjectId).toBe('user-123');
      expect(accessRequest.status).toBe('completed');
    });

    it('should support Article 17 (Right to Erasure) with model data', async () => {
      // Setup dependencies first
      const mockPseudonymGen = {
        generate: jest.fn().mockReturnValue('pseu_abc'),
        validate: jest.fn().mockReturnValue(true),
      };
      
      (privata as any).identityDB = mockIdentityDB;
      (privata as any).clinicalDB = mockClinicalDB;
      (privata as any).cache = mockCache;
      (privata as any).dataSeparator = new DataSeparatorService(
        new PseudonymService(mockPseudonymGen)
      );

      const UserModel = privata.model('User', {
        identity: { name: { type: String, pii: true, required: true } },
        clinical: { diagnosis: { type: String, phi: true } },
      });

      mockIdentityDB.findById.mockResolvedValue({
        id: 'user-123',
        pseudonym: 'pseu_abc',
      });

      mockIdentityDB.delete.mockResolvedValue(undefined);
      mockCache.invalidate.mockResolvedValue(undefined);

      await UserModel.delete('user-123', { gdprCompliant: true });

      expect(mockIdentityDB.delete).toHaveBeenCalled();
    });
  });
});

