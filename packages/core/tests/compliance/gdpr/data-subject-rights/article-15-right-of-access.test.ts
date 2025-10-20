/**
 * GDPR Article 15 - Right of Access Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right to obtain confirmation as to whether 
 * personal data concerning them is being processed, and access to that data.
 * 
 * This test suite verifies that Privata correctly implements the right of access
 * as specified in GDPR Article 15.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { AccessRequest } from '../../../../src/types/AccessRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 15 - Right of Access', () => {
  let privata: Privata;
  let testDataSubject: DataSubject;
  let testPersonalData: PersonalData[];

  beforeEach(async () => {
    // Initialize Privata with GDPR compliance enabled
    privata = new Privata({
      compliance: {
        gdpr: {
          enabled: true,
          dataSubjectRights: true,
          auditLogging: true
        }
      }
    });

    await privata.initialize();

    // Create test data subject
    testDataSubject = await createTestDataSubject();
    
    // Create test personal data
    testPersonalData = await createTestPersonalData(testDataSubject.id);
  });

  afterEach(async () => {
    await privata.cleanup();
  });

  describe('Data Subject Access Request', () => {
    it('should provide complete data inventory for a data subject', async () => {
      // TDD RED: Test that all personal data is retrievable
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest).toBeDefined();
      expect(accessRequest.dataSubjectId).toBe(testDataSubject.id);
      expect(accessRequest.personalData).toBeDefined();
      expect(accessRequest.personalData.length).toBeGreaterThan(0);
      expect(accessRequest.processingPurposes).toBeDefined();
      expect(accessRequest.retentionPeriods).toBeDefined();
      expect(accessRequest.thirdPartyRecipients).toBeDefined();
    });

    it('should provide data in a structured, commonly used format', async () => {
      // TDD RED: Test data portability format
      const accessRequest = await privata.requestDataAccess(testDataSubject.id, {
        format: 'JSON'
      });
      
      expect(accessRequest.format).toBe('application/json');
      expect(accessRequest.data).toBeDefined();
      expect(() => JSON.parse(accessRequest.data)).not.toThrow();
    });

    it('should include processing purposes and legal basis', async () => {
      // TDD RED: Test transparency requirements
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.processingPurposes).toBeDefined();
      expect(Array.isArray(accessRequest.processingPurposes)).toBe(true);
      expect(accessRequest.processingPurposes.length).toBeGreaterThan(0);
      
      expect(accessRequest.legalBasis).toBeDefined();
      expect(Array.isArray(accessRequest.legalBasis)).toBe(true);
      
      // Check that each purpose has a legal basis
      accessRequest.processingPurposes.forEach((purpose: any) => {
        const legalBasis = accessRequest.legalBasis.find((basis: any) => basis.purpose === purpose.name);
        expect(legalBasis).toBeDefined();
        expect(legalBasis!.basis).toBeDefined();
      });
    });

    it('should include retention periods and erasure criteria', async () => {
      // TDD RED: Test storage limitation transparency
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.retentionPeriods).toBeDefined();
      expect(Array.isArray(accessRequest.retentionPeriods)).toBe(true);
      
      expect(accessRequest.erasureCriteria).toBeDefined();
      expect(Array.isArray(accessRequest.erasureCriteria)).toBe(true);
      
      // Check that each data category has retention information
      accessRequest.personalData.forEach((data: any) => {
        const retention = accessRequest.retentionPeriods.find((r: any) => r.dataCategory === data.category);
        expect(retention).toBeDefined();
        expect(retention!.period).toBeDefined();
        expect(retention!.criteria).toBeDefined();
      });
    });

    it('should include third-party recipients and safeguards', async () => {
      // TDD RED: Test third-party disclosure transparency
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.thirdPartyRecipients).toBeDefined();
      expect(Array.isArray(accessRequest.thirdPartyRecipients)).toBe(true);
      
      expect(accessRequest.safeguards).toBeDefined();
      expect(Array.isArray(accessRequest.safeguards)).toBe(true);
      
      // Check that each recipient has safeguard information
      accessRequest.thirdPartyRecipients.forEach((recipient: any) => {
        expect(recipient.name).toBeDefined();
        expect(recipient.purpose).toBeDefined();
        expect(recipient.safeguards).toBeDefined();
      });
    });

    it('should respond within 30 days (or 60 days for complex requests)', async () => {
      // TDD RED: Test response time requirements
      const startTime = Date.now();
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
      expect(accessRequest.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex requests within 60 days', async () => {
      // TDD RED: Test extended response time for complex requests
      const startTime = Date.now();
      const accessRequest = await privata.requestDataAccess(testDataSubject.id, {
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true
      });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days in milliseconds
      expect(accessRequest.responseTime).toBeLessThan(60 * 24 * 60 * 60 * 1000);
      expect(accessRequest.complexRequest).toBe(true);
    });
  });

  describe('Data Subject Identity Verification', () => {
    it('should verify data subject identity before providing access', async () => {
      // TDD RED: Test identity verification
      const unauthorizedRequest = privata.requestDataAccess('invalid-id');
      
      await expect(unauthorizedRequest).rejects.toThrow('Identity verification failed');
    });

    it('should maintain audit trail of access requests', async () => {
      // TDD RED: Test audit logging
      await privata.requestDataAccess(testDataSubject.id);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_ACCESS_REQUEST',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('DATA_ACCESS_REQUEST');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
    });

    it('should handle identity verification failures gracefully', async () => {
      // TDD RED: Test identity verification failure handling
      const invalidRequest = privata.requestDataAccess('non-existent-id');
      
      await expect(invalidRequest).rejects.toThrow();
      
      // Verify that failed access attempts are logged
      const auditLog = await privata.getAuditLog({
        action: 'DATA_ACCESS_REQUEST',
        dataSubjectId: 'non-existent-id'
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.success).toBe(false);
      expect(auditLog[0]!.error).toBeDefined();
    });
  });

  describe('Data Completeness and Accuracy', () => {
    it('should provide all personal data categories', async () => {
      // TDD RED: Test data completeness
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      // Verify that all expected data categories are present
      const expectedCategories = ['identity', 'contact', 'preferences', 'usage'];
      const providedCategories = accessRequest.personalData.map((data: any) => data.category);
      
      expectedCategories.forEach(category => {
        expect(providedCategories).toContain(category);
      });
    });

    it('should provide accurate and up-to-date information', async () => {
      // TDD RED: Test data accuracy
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      // Verify that the data matches what we expect
      accessRequest.personalData.forEach((data: any) => {
        expect(data.lastUpdated).toBeDefined();
        expect(data.accuracy).toBe('verified');
        expect(data.source).toBeDefined();
      });
    });

    it('should include data source information', async () => {
      // TDD RED: Test data source transparency
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      accessRequest.personalData.forEach((data: any) => {
        expect(data.source).toBeDefined();
        expect(data.source.type).toBeDefined();
        expect(data.source.timestamp).toBeDefined();
        expect(data.source.method).toBeDefined();
      });
    });
  });

  describe('Data Format and Structure', () => {
    it('should provide data in machine-readable format when requested', async () => {
      // TDD RED: Test machine-readable format
      const accessRequest = await privata.requestDataAccess(testDataSubject.id, {
        format: 'JSON'
      });
      
      expect(accessRequest.format).toBe('application/json');
      expect(accessRequest.data).toBeDefined();
      
      const parsedData = JSON.parse(accessRequest.data);
      expect(parsedData).toBeDefined();
      expect(parsedData.dataSubjectId).toBe(testDataSubject.id);
    });

    it('should provide data in human-readable format by default', async () => {
      // TDD RED: Test human-readable format
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.format).toBe('text/plain');
      expect(accessRequest.data).toBeDefined();
      expect(typeof accessRequest.data).toBe('string');
    });

    it('should structure data logically by category', async () => {
      // TDD RED: Test data structure
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.personalData).toBeDefined();
      expect(Array.isArray(accessRequest.personalData)).toBe(true);
      
      // Verify data is grouped by category
      const categories = [...new Set(accessRequest.personalData.map((data: any) => data.category))];
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle requests for non-existent data subjects', async () => {
      // TDD RED: Test non-existent data subject handling
      const nonExistentRequest = privata.requestDataAccess('non-existent-id');
      
      await expect(nonExistentRequest).rejects.toThrow('Data subject not found');
    });

    it('should handle requests with no personal data', async () => {
      // TDD RED: Test empty data handling
      const emptyDataSubject = await createTestDataSubject({ hasPersonalData: false });
      
      const accessRequest = await privata.requestDataAccess(emptyDataSubject.id);
      
      expect(accessRequest.personalData).toHaveLength(0);
      expect(accessRequest.processingPurposes).toHaveLength(0);
      expect(accessRequest.retentionPeriods).toHaveLength(0);
    });

    it('should handle concurrent access requests', async () => {
      // TDD RED: Test concurrent request handling
      const concurrentRequests = Array.from({ length: 10 }, () => 
        privata.requestDataAccess(testDataSubject.id)
      );
      
      const results = await Promise.all(concurrentRequests);
      
      expect(results).toHaveLength(10);
      results.forEach((result: any) => {
        expect(result.dataSubjectId).toBe(testDataSubject.id);
        expect(result.personalData).toBeDefined();
      });
    });

    it('should handle malformed access requests', async () => {
      // TDD RED: Test malformed request handling
      const malformedRequest = privata.requestDataAccess(testDataSubject.id, {
        format: 'invalid-format' as any
      });
      
      await expect(malformedRequest).rejects.toThrow('Invalid format specified');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', async () => {
      // TDD RED: Test large dataset handling
      const largeDataSubject = await createTestDataSubject({ 
        dataSize: 'large',
        recordCount: 10000
      });
      
      const startTime = Date.now();
      const accessRequest = await privata.requestDataAccess(largeDataSubject.id);
      const processingTime = Date.now() - startTime;
      
      expect(processingTime).toBeLessThan(30000); // 30 seconds
      expect(accessRequest.personalData.length).toBeGreaterThan(0);
    });

    it('should provide progress updates for large requests', async () => {
      // TDD RED: Test progress reporting
      const largeDataSubject = await createTestDataSubject({ 
        dataSize: 'large',
        recordCount: 5000
      });
      
      const progressUpdates: number[] = [];
      
      const accessRequest = await privata.requestDataAccess(largeDataSubject.id, {
        onProgress: (progress: number) => progressUpdates.push(progress)
      });
      
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 15 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      // Verify all required elements are present
      expect(accessRequest.dataSubjectId).toBeDefined();
      expect(accessRequest.personalData).toBeDefined();
      expect(accessRequest.processingPurposes).toBeDefined();
      expect(accessRequest.legalBasis).toBeDefined();
      expect(accessRequest.retentionPeriods).toBeDefined();
      expect(accessRequest.thirdPartyRecipients).toBeDefined();
      expect(accessRequest.safeguards).toBeDefined();
      expect(accessRequest.dataSubjectRights).toBeDefined();
      expect(accessRequest.complaintRights).toBeDefined();
    });

    it('should provide information about data subject rights', async () => {
      // TDD RED: Test data subject rights information
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.dataSubjectRights).toBeDefined();
      expect(accessRequest.dataSubjectRights).toContain('right-to-rectification');
      expect(accessRequest.dataSubjectRights).toContain('right-to-erasure');
      expect(accessRequest.dataSubjectRights).toContain('right-to-restriction');
      expect(accessRequest.dataSubjectRights).toContain('right-to-portability');
      expect(accessRequest.dataSubjectRights).toContain('right-to-object');
    });

    it('should provide information about complaint rights', async () => {
      // TDD RED: Test complaint rights information
      const accessRequest = await privata.requestDataAccess(testDataSubject.id);
      
      expect(accessRequest.complaintRights).toBeDefined();
      expect(accessRequest.complaintRights.supervisoryAuthority).toBeDefined();
      expect(accessRequest.complaintRights.contactInformation).toBeDefined();
      expect(accessRequest.complaintRights.procedure).toBeDefined();
    });
  });
});

// Helper functions for test setup
async function createTestDataSubject(options: { hasPersonalData?: boolean; dataSize?: string; recordCount?: number } = {}): Promise<DataSubject> {
  const dataSubject: DataSubject = {
    id: options.hasPersonalData === false ? `empty-test-subject-${Date.now()}` : `test-subject-${Date.now()}`,
    email: 'test@example.com',
    name: 'Test Subject',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (options.hasPersonalData !== false) {
    // Create associated personal data
    await createTestPersonalData(dataSubject.id);
  }

  return dataSubject;
}

async function createTestPersonalData(dataSubjectId: string): Promise<PersonalData[]> {
  const personalData: PersonalData[] = [
    {
      id: `data-1-${Date.now()}`,
      dataSubjectId,
      category: 'identity',
      fields: {
        name: 'Test Subject',
        email: 'test@example.com',
        dateOfBirth: '1990-01-01'
      },
      source: {
        type: 'user-input',
        timestamp: new Date(),
        method: 'registration'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    },
    {
      id: `data-2-${Date.now()}`,
      dataSubjectId,
      category: 'contact',
      fields: {
        address: '123 Test Street',
        phone: '+1234567890'
      },
      source: {
        type: 'user-input',
        timestamp: new Date(),
        method: 'profile-update'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    },
    {
      id: `data-3-${Date.now()}`,
      dataSubjectId,
      category: 'preferences',
      fields: {
        language: 'en',
        timezone: 'UTC',
        notifications: true
      },
      source: {
        type: 'user-input',
        timestamp: new Date(),
        method: 'settings'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    },
    {
      id: `data-4-${Date.now()}`,
      dataSubjectId,
      category: 'usage',
      fields: {
        lastLogin: new Date().toISOString(),
        loginCount: 42,
        pagesVisited: ['home', 'profile', 'settings']
      },
      source: {
        type: 'system-generated',
        timestamp: new Date(),
        method: 'analytics'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    }
  ];

  return personalData;
}
