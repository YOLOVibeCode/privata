/**
 * TDD RED Phase: Tests for ConsentManagerService
 * 
 * These tests define the expected behavior of the ConsentManagerService
 * before we implement it. They should FAIL initially (RED).
 */

import { ConsentManagerService } from '../../../src/services/ConsentManagerService';
import { IDatabaseReader } from '../../../src/interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../../../src/interfaces/IDatabaseWriter';
import { IAuditLogger } from '../../../src/interfaces/IAuditLogger';
import { AuditEvent } from '../../../src/types/AuditEvent';

describe('ConsentManagerService', () => {
  let consentManagerService: ConsentManagerService;
  let mockReader: jest.Mocked<IDatabaseReader>;
  let mockWriter: jest.Mocked<IDatabaseWriter>;
  let mockAuditLogger: jest.Mocked<IAuditLogger>;

  beforeEach(() => {
    // This will fail until we create the service
    mockReader = {
      findById: jest.fn(),
      findMany: jest.fn(),
      exists: jest.fn()
    };
    
    mockWriter = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    mockAuditLogger = {
      log: jest.fn(),
      logBatch: jest.fn()
    };
    
    consentManagerService = new ConsentManagerService(mockReader, mockWriter, mockAuditLogger);
  });

  describe('grant method', () => {
    it('should have correct signature: grant(userId: string, consentType: string, details: any): Promise<void>', async () => {
      // TDD RED: Test the method signature
      await consentManagerService.grant('user-123', 'data_processing', { purpose: 'analytics' });
      expect(typeof consentManagerService.grant).toBe('function');
    });

    it('should grant consent successfully', async () => {
      // TDD RED: Test grants consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      const details = { purpose: 'analytics', duration: '1 year' };
      
      const mockConsent = {
        id: 'consent-456',
        userId,
        consentType,
        details,
        granted: true,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };
      
      mockWriter.create.mockResolvedValue(mockConsent);
      mockAuditLogger.log.mockResolvedValue(undefined);
      
      await consentManagerService.grant(userId, consentType, details);
      
      expect(mockWriter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          consentType,
          details,
          granted: true,
          grantedAt: expect.any(Date),
          expiresAt: expect.any(Date)
        })
      );
      
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CONSENT_GRANTED',
          entityType: 'Consent',
          userId,
          details: expect.objectContaining({ consentType })
        })
      );
    });

    it('should handle existing consent by updating it', async () => {
      // TDD RED: Test updates existing consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      const details = { purpose: 'marketing' };
      
      const existingConsent = {
        id: 'consent-456',
        userId,
        consentType,
        granted: false,
        grantedAt: null
      };
      
      mockReader.findMany.mockResolvedValue([existingConsent]);
      mockWriter.update.mockResolvedValue({ ...existingConsent, granted: true });
      mockAuditLogger.log.mockResolvedValue(undefined);
      
      await consentManagerService.grant(userId, consentType, details);
      
      expect(mockWriter.update).toHaveBeenCalledWith(
        'consent-456',
        expect.objectContaining({
          granted: true,
          grantedAt: expect.any(Date),
          details
        })
      );
    });

    it('should set appropriate expiration date', async () => {
      // TDD RED: Test expiration date setting
      const userId = 'user-123';
      const consentType = 'data_processing';
      const details = { purpose: 'analytics' };
      
      mockWriter.create.mockResolvedValue({ id: 'consent-456' });
      mockAuditLogger.log.mockResolvedValue(undefined);
      
      await consentManagerService.grant(userId, consentType, details);
      
      const createCall = mockWriter.create.mock.calls[0]?.[0];
      expect(createCall?.expiresAt).toBeInstanceOf(Date);
      expect(createCall?.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('check method', () => {
    it('should have correct signature: check(userId: string, consentType: string): Promise<boolean>', async () => {
      // TDD RED: Test the method signature
      const result = await consentManagerService.check('user-123', 'data_processing');
      expect(typeof consentManagerService.check).toBe('function');
    });

    it('should check consent status', async () => {
      // TDD RED: Test checks consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      const mockConsent = {
        id: 'consent-456',
        userId,
        consentType,
        granted: true,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      };
      
      mockReader.findMany.mockResolvedValue([mockConsent]);
      
      const result = await consentManagerService.check(userId, consentType);
      
      expect(result).toBe(true);
      expect(mockReader.findMany).toHaveBeenCalledWith({
        userId,
        consentType,
        granted: true
      }, {
        sort: { grantedAt: -1 }
      });
    });

    it('should return false for non-existent consent', async () => {
      // TDD RED: Test non-existent consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      mockReader.findMany.mockResolvedValue([]);
      
      const result = await consentManagerService.check(userId, consentType);
      
      expect(result).toBe(false);
    });

    it('should return false for expired consent', async () => {
      // TDD RED: Test expired consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      const expiredConsent = {
        id: 'consent-456',
        userId,
        consentType,
        granted: true,
        grantedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };
      
      mockReader.findMany.mockResolvedValue([expiredConsent]);
      
      const result = await consentManagerService.check(userId, consentType);
      
      expect(result).toBe(false);
    });

    it('should return false for withdrawn consent', async () => {
      // TDD RED: Test withdrawn consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      const withdrawnConsent = {
        id: 'consent-456',
        userId,
        consentType,
        granted: false,
        withdrawnAt: new Date()
      };
      
      mockReader.findMany.mockResolvedValue([withdrawnConsent]);
      
      const result = await consentManagerService.check(userId, consentType);
      
      expect(result).toBe(false);
    });
  });

  describe('withdraw method', () => {
    it('should have correct signature: withdraw(userId: string, consentType: string): Promise<void>', async () => {
      // TDD RED: Test the method signature
      await consentManagerService.withdraw('user-123', 'data_processing');
      expect(typeof consentManagerService.withdraw).toBe('function');
    });

    it('should withdraw consent successfully', async () => {
      // TDD RED: Test withdraws consent
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      const existingConsent = {
        id: 'consent-456',
        userId,
        consentType,
        granted: true,
        grantedAt: new Date()
      };
      
      mockReader.findMany.mockResolvedValue([existingConsent]);
      mockWriter.update.mockResolvedValue({ ...existingConsent, granted: false });
      mockAuditLogger.log.mockResolvedValue(undefined);
      
      await consentManagerService.withdraw(userId, consentType);
      
      expect(mockWriter.update).toHaveBeenCalledWith(
        'consent-456',
        expect.objectContaining({
          granted: false,
          withdrawnAt: expect.any(Date)
        })
      );
      
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CONSENT_WITHDRAWN',
          entityType: 'Consent',
          userId,
          details: expect.objectContaining({ consentType })
        })
      );
    });

    it('should handle non-existent consent gracefully', async () => {
      // TDD RED: Test non-existent consent withdrawal
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      mockReader.findMany.mockResolvedValue([]);
      mockAuditLogger.log.mockResolvedValue(undefined);
      
      await expect(consentManagerService.withdraw(userId, consentType)).resolves.not.toThrow();
      
      expect(mockWriter.update).not.toHaveBeenCalled();
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CONSENT_WITHDRAWAL_ATTEMPTED',
          entityType: 'Consent',
          userId,
          details: expect.objectContaining({ consentType, found: false })
        })
      );
    });
  });

  describe('getHistory method', () => {
    it('should have correct signature: getHistory(userId: string): Promise<any[]>', async () => {
      // TDD RED: Test the method signature
      const result = await consentManagerService.getHistory('user-123');
      expect(typeof consentManagerService.getHistory).toBe('function');
    });

    it('should return consent history', async () => {
      // TDD RED: Test returns consent history
      const userId = 'user-123';
      
      const mockHistory = [
        {
          id: 'consent-1',
          userId,
          consentType: 'data_processing',
          granted: true,
          grantedAt: new Date('2023-01-01'),
          expiresAt: new Date('2024-01-01')
        },
        {
          id: 'consent-2',
          userId,
          consentType: 'marketing',
          granted: false,
          withdrawnAt: new Date('2023-06-01')
        }
      ];
      
      mockReader.findMany.mockResolvedValue(mockHistory);
      
      const result = await consentManagerService.getHistory(userId);
      
      expect(result).toEqual(mockHistory);
      expect(mockReader.findMany).toHaveBeenCalledWith({
        userId
      }, {
        sort: { grantedAt: -1 }
      });
    });

    it('should return empty array for user with no consent history', async () => {
      // TDD RED: Test empty history
      const userId = 'user-123';
      
      mockReader.findMany.mockResolvedValue([]);
      
      const result = await consentManagerService.getHistory(userId);
      
      expect(result).toEqual([]);
    });

    it('should sort history by date (newest first)', async () => {
      // TDD RED: Test sorted history
      const userId = 'user-123';
      
      const mockHistory = [
        {
          id: 'consent-1',
          userId,
          consentType: 'data_processing',
          grantedAt: new Date('2023-01-01')
        },
        {
          id: 'consent-2',
          userId,
          consentType: 'marketing',
          grantedAt: new Date('2023-06-01')
        }
      ];
      
      mockReader.findMany.mockResolvedValue(mockHistory);
      
      const result = await consentManagerService.getHistory(userId);
      
      expect(result).toEqual(mockHistory);
      expect(mockReader.findMany).toHaveBeenCalledWith({
        userId
      }, {
        sort: { grantedAt: -1 }
      });
    });
  });

  describe('Dependency Injection', () => {
    it('should accept dependencies in constructor', () => {
      // TDD RED: Test constructor dependency injection
      const service = new ConsentManagerService(mockReader, mockWriter, mockAuditLogger);
      expect(service).toBeInstanceOf(ConsentManagerService);
    });

    it('should use injected dependencies for operations', async () => {
      // TDD RED: Test uses injected dependencies
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      mockReader.findMany.mockResolvedValue([]);
      mockWriter.create.mockResolvedValue({ id: 'consent-456' });
      mockAuditLogger.log.mockResolvedValue(undefined);
      
      await consentManagerService.grant(userId, consentType, {});
      
      expect(mockReader.findMany).toHaveBeenCalled();
      expect(mockWriter.create).toHaveBeenCalled();
      expect(mockAuditLogger.log).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // TDD RED: Test error handling
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      mockReader.findMany.mockRejectedValue(new Error('Database error'));
      
      await expect(consentManagerService.check(userId, consentType)).rejects.toThrow('Database error');
    });

    it('should handle audit logging errors gracefully', async () => {
      // TDD RED: Test audit error handling
      const userId = 'user-123';
      const consentType = 'data_processing';
      
      mockReader.findMany.mockResolvedValue([]);
      mockWriter.create.mockResolvedValue({ id: 'consent-456' });
      mockAuditLogger.log.mockRejectedValue(new Error('Audit logging failed'));
      
      await expect(consentManagerService.grant(userId, consentType, {})).rejects.toThrow('Audit logging failed');
    });
  });
});
