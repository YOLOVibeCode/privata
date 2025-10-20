/**
 * @fileoverview Unit tests for the main Privata class
 * @description Tests core functionality, initialization, and error handling
 */

import { Privata } from '../../src/Privata';
import { AccessRequestOptions } from '../../src/types/AccessRequest';

describe('Privata', () => {
  let privata: Privata;

  beforeEach(() => {
    privata = new Privata({
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
    });
  });

  afterEach(async () => {
    if (privata) {
      await privata.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(privata.initialize()).resolves.not.toThrow();
    });

    it('should not re-initialize if already initialized', async () => {
      await privata.initialize();
      // Second call should not throw
      await expect(privata.initialize()).resolves.not.toThrow();
    });

    it('should throw error when calling methods before initialization', async () => {
      const options: AccessRequestOptions = {
        format: 'JSON',
        includeDerivedData: true,
      };

      await expect(privata.requestDataAccess('test-subject', options))
        .rejects.toThrow('Privata not initialized');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup successfully', async () => {
      await privata.initialize();
      await expect(privata.cleanup()).resolves.not.toThrow();
    });

    it('should handle cleanup when not initialized', async () => {
      // Should not throw when cleaning up uninitialized instance
      await expect(privata.cleanup()).resolves.not.toThrow();
    });

    it('should prevent operations after cleanup', async () => {
      await privata.initialize();
      await privata.cleanup();

      const options: AccessRequestOptions = {
        format: 'JSON',
        includeDerivedData: true,
      };

      await expect(privata.requestDataAccess('test-subject', options))
        .rejects.toThrow('Privata not initialized');
    });
  });

  describe('Configuration', () => {
    it('should throw error when GDPR is disabled', async () => {
      const privataDisabled = new Privata({
        compliance: {
          gdpr: {
            enabled: false,
            dataSubjectRights: false,
            auditLogging: false,
          },
        },
      });

      await privataDisabled.initialize();

      const options: AccessRequestOptions = {
        format: 'JSON',
        includeDerivedData: true,
      };

      await expect(privataDisabled.requestDataAccess('test-subject', options))
        .rejects.toThrow('GDPR compliance not enabled');
    });
  });

  describe('Data Access Request', () => {
    beforeEach(async () => {
      await privata.initialize();
    });

    it('should handle basic data access request', async () => {
      const options: AccessRequestOptions = {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true,
      };

      // Mock the internal methods that would be called
      jest.spyOn(privata as any, 'verifyDataSubjectIdentity').mockResolvedValue(true);
      jest.spyOn(privata as any, 'fetchPersonalData').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getProcessingPurposes').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getLegalBasis').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getRetentionPeriods').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getErasureCriteria').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getThirdPartyRecipients').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getSafeguards').mockResolvedValue([]);
      jest.spyOn(privata as any, 'formatAccessData').mockResolvedValue('{"data": "test"}');
      jest.spyOn(privata as any, 'logAuditEvent').mockResolvedValue(undefined);

      const result = await privata.requestDataAccess('test-subject', options);

      expect(result).toBeDefined();
      expect(result.dataSubjectId).toBe('test-subject');
      expect(result.format).toBe('application/json');
    });

    it('should handle invalid format', async () => {
      const options: AccessRequestOptions = {
        format: 'INVALID' as any,
        includeDerivedData: true,
      };

      await expect(privata.requestDataAccess('test-subject', options))
        .rejects.toThrow('Invalid format specified');
    });

    it('should handle progress callbacks', async () => {
      const progressCallback = jest.fn();
      const options: AccessRequestOptions = {
        format: 'JSON',
        onProgress: progressCallback,
      };

      // Mock the internal methods
      jest.spyOn(privata as any, 'verifyDataSubjectIdentity').mockResolvedValue(true);
      jest.spyOn(privata as any, 'fetchPersonalData').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getProcessingPurposes').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getLegalBasis').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getRetentionPeriods').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getErasureCriteria').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getThirdPartyRecipients').mockResolvedValue([]);
      jest.spyOn(privata as any, 'getSafeguards').mockResolvedValue([]);
      jest.spyOn(privata as any, 'formatAccessData').mockResolvedValue('{"data": "test"}');
      jest.spyOn(privata as any, 'logAuditEvent').mockResolvedValue(undefined);

      await privata.requestDataAccess('test-subject', options);

      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });
  });
});
