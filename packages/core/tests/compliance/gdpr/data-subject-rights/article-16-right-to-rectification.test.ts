/**
 * GDPR Article 16 - Right to Rectification Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right to obtain rectification of 
 * inaccurate personal data concerning them.
 * 
 * This test suite verifies that Privata correctly implements the right to rectification
 * as specified in GDPR Article 16.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { RectificationRequest, RectificationResult } from '../../../../src/types/RectificationRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 16 - Right to Rectification', () => {
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

  describe('Data Rectification Process', () => {
    it('should allow data subjects to correct inaccurate personal data', async () => {
      // TDD RED: Test data correction
      const originalData = await privata.getPersonalData(testDataSubject.id);
      
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Corrected Name',
          email: 'corrected@example.com'
        },
        reason: 'Data was inaccurate',
        evidence: 'Updated identification document'
      };
      
      const rectificationResult = await privata.rectifyPersonalData(rectificationRequest);
      
      expect(rectificationResult.success).toBe(true);
      expect(rectificationResult.rectifiedFields).toContain('name');
      expect(rectificationResult.rectifiedFields).toContain('email');
      expect(rectificationResult.rectificationId).toBeDefined();
      expect(rectificationResult.processedAt).toBeDefined();
    });

    it('should maintain data integrity during rectification', async () => {
      // TDD RED: Test data integrity
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'New Name'
        },
        reason: 'Name change due to marriage',
        evidence: 'Marriage certificate'
      };
      
      const rectificationResult = await privata.rectifyPersonalData(rectificationRequest);
      
      expect(rectificationResult.success).toBe(true);
      
      // Verify that related data is still accessible
      const updatedData = await privata.getPersonalData(testDataSubject.id);
      expect(updatedData).toBeDefined();
      expect(updatedData.length).toBeGreaterThan(0);
      
      // Verify that the corrected field is updated
      const nameField = updatedData.find(data => data.fields.name);
      expect(nameField?.fields.name).toBe('New Name');
    });

    it('should notify third parties of rectifications when required', async () => {
      // TDD RED: Test third-party notification
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: { 
          name: 'New Name',
          address: '456 New Street, City, State 54321'
        },
        reason: 'Address and name change',
        evidence: 'Updated identification and utility bill',
        notifyThirdParties: true
      };
      
      const rectificationResult = await privata.rectifyPersonalData(rectificationRequest);
      
      expect(rectificationResult.success).toBe(true);
      expect(rectificationResult.thirdPartyNotifications).toBeDefined();
      expect(rectificationResult.thirdPartyNotifications!.length).toBeGreaterThan(0);
      expect(rectificationResult.thirdPartyNotifications![0]!.recipient).toBeDefined();
      expect(rectificationResult.thirdPartyNotifications![0]!.notifiedAt).toBeDefined();
    });

    it('should maintain audit trail of all rectifications', async () => {
      // TDD RED: Test audit logging
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: { 
          phone: '+1987654321'
        },
        reason: 'Phone number was incorrect',
        evidence: 'Updated contact information'
      };
      
      await privata.rectifyPersonalData(rectificationRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_RECTIFICATION',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('DATA_RECTIFICATION');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
      expect(auditLog[0]!.details).toBeDefined();
      expect(auditLog[0]!.details.changes).toBeDefined();
    });
  });

  describe('Rectification Validation', () => {
    it('should validate rectification requests before processing', async () => {
      // TDD RED: Test request validation
      const invalidRequest: RectificationRequest = {
        dataSubjectId: 'invalid-id',
        corrections: {
          name: 'New Name'
        },
        reason: 'Name change',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Data subject not found');
    });

    it('should require evidence for rectification requests', async () => {
      // TDD RED: Test evidence requirement
      const requestWithoutEvidence: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'New Name'
        },
        reason: 'Name change',
        evidence: ''
      };
      
      const result = await privata.rectifyPersonalData(requestWithoutEvidence);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Evidence is required for rectification');
    });

    it('should validate that corrections are for existing fields', async () => {
      // TDD RED: Test field validation
      const requestWithInvalidField: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          nonExistentField: 'Some Value'
        },
        reason: 'Field correction',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(requestWithInvalidField);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Field nonExistentField does not exist');
    });

    it('should validate data format for corrections', async () => {
      // TDD RED: Test data format validation
      const requestWithInvalidFormat: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          email: 'invalid-email-format'
        },
        reason: 'Email correction',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(requestWithInvalidFormat);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('Rectification Response Time', () => {
    it('should process rectification requests within 30 days', async () => {
      // TDD RED: Test response time
      const startTime = Date.now();
      
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Updated Name'
        },
        reason: 'Name correction',
        evidence: 'Updated ID'
      };
      
      const result = await privata.rectifyPersonalData(rectificationRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
      expect(result.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex rectification requests within 60 days', async () => {
      // TDD RED: Test complex request timeline
      const startTime = Date.now();
      
      const complexRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'New Name',
          address: 'New Address',
          phone: 'New Phone',
          email: 'new@example.com'
        },
        reason: 'Complete profile update',
        evidence: 'Multiple documents',
        notifyThirdParties: true
      };
      
      const result = await privata.rectifyPersonalData(complexRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
      expect(result.complexRequest).toBe(true);
    });
  });

  describe('Rectification Conflicts and Disputes', () => {
    it('should handle conflicting rectification requests', async () => {
      // TDD RED: Test conflict resolution
      const request1: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Name Version 1'
        },
        reason: 'First correction',
        evidence: 'Document 1'
      };
      
      const request2: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Name Version 2'
        },
        reason: 'Second correction',
        evidence: 'Document 2'
      };
      
      const result1 = await privata.rectifyPersonalData(request1);
      const result2 = await privata.rectifyPersonalData(request2);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // Verify that the latest rectification takes precedence
      const finalData = await privata.getPersonalData(testDataSubject.id);
      const nameField = finalData.find(data => data.fields.name);
      expect(nameField?.fields.name).toBe('Name Version 2');
    });

    it('should maintain rectification history for audit purposes', async () => {
      // TDD RED: Test rectification history
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Updated Name'
        },
        reason: 'Name correction',
        evidence: 'Updated ID'
      };
      
      await privata.rectifyPersonalData(rectificationRequest);
      
      const rectificationHistory = await privata.getRectificationHistory(testDataSubject.id);
      
      expect(rectificationHistory).toHaveLength(1);
      expect(rectificationHistory[0]!.field).toBe('name');
      expect(rectificationHistory[0]!.oldValue).toBeDefined();
      expect(rectificationHistory[0]!.newValue).toBe('Updated Name');
      expect(rectificationHistory[0]!.reason).toBe('Name correction');
      expect(rectificationHistory[0]!.timestamp).toBeDefined();
    });

    it('should allow data subjects to dispute rectification decisions', async () => {
      // TDD RED: Test dispute mechanism
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Disputed Name'
        },
        reason: 'Name correction',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(rectificationRequest);
      
      // Simulate a dispute
      const dispute = await privata.disputeRectification(result.rectificationId!, {
        reason: 'The rectification was incorrect',
        evidence: 'Additional documentation'
      });
      
      expect(dispute.disputeId).toBeDefined();
      expect(dispute.status).toBe('under-review');
      expect(dispute.reviewDeadline).toBeDefined();
    });
  });

  describe('Data Consistency and Synchronization', () => {
    it('should ensure data consistency across all systems', async () => {
      // TDD RED: Test data consistency
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          email: 'consistent@example.com'
        },
        reason: 'Email update',
        evidence: 'New email verification'
      };
      
      const result = await privata.rectifyPersonalData(rectificationRequest);
      
      expect(result.success).toBe(true);
      expect(result.consistencyCheck).toBeDefined();
      expect(result.consistencyCheck!.allSystemsUpdated).toBe(true);
      expect(result.consistencyCheck!.synchronizationTime).toBeDefined();
    });

    it('should handle synchronization failures gracefully', async () => {
      // TDD RED: Test synchronization error handling
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Sync Test Name'
        },
        reason: 'Synchronization test',
        evidence: 'Document'
      };
      
      // Simulate a synchronization failure
      const result = await privata.rectifyPersonalData(rectificationRequest, {
        simulateSyncFailure: true
      });
      
      expect(result.success).toBe(true);
      expect(result.consistencyCheck).toBeDefined();
      expect(result.consistencyCheck!.allSystemsUpdated).toBe(false);
      expect(result.consistencyCheck!.failedSystems).toBeDefined();
      expect(result.consistencyCheck!.retryScheduled).toBe(true);
    });
  });

  describe('Rectification Notifications', () => {
    it('should notify data subjects of successful rectifications', async () => {
      // TDD RED: Test success notification
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Notified Name'
        },
        reason: 'Name update',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(rectificationRequest);
      
      expect(result.success).toBe(true);
      expect(result.notificationSent).toBe(true);
      expect(result.notificationMethod).toBeDefined();
      expect(result.notificationTimestamp).toBeDefined();
    });

    it('should notify data subjects of rectification failures', async () => {
      // TDD RED: Test failure notification
      const invalidRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          nonExistentField: 'Value'
        },
        reason: 'Invalid correction',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.notificationSent).toBe(true);
      expect(result.notificationMethod).toBeDefined();
      expect(result.notificationTimestamp).toBeDefined();
      expect(result.notificationContent).toContain('rectification request failed');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent rectification requests', async () => {
      // TDD RED: Test concurrent processing
      const requests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: `Concurrent Name ${index}`
        },
        reason: `Concurrent correction ${index}`,
        evidence: `Document ${index}`
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => privata.rectifyPersonalData(request))
      );
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // 5 seconds
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle large rectification requests efficiently', async () => {
      // TDD RED: Test large request handling
      const largeRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Large Request Name',
          email: 'large@example.com',
          address: 'Large Address',
          phone: '+1234567890',
          preferences: JSON.stringify({ theme: 'dark', language: 'en' })
        },
        reason: 'Large profile update',
        evidence: 'Multiple documents',
        notifyThirdParties: true
      };
      
      const startTime = Date.now();
      const result = await privata.rectifyPersonalData(largeRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.rectifiedFields.length).toBe(5);
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 16 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Compliant Name'
        },
        reason: 'Compliance test',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(rectificationRequest);
      
      // Verify all required elements are present
      expect(result.success).toBeDefined();
      expect(result.rectificationId).toBeDefined();
      expect(result.processedAt).toBeDefined();
      expect(result.rectifiedFields).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.notificationSent).toBeDefined();
      expect(result.consistencyCheck).toBeDefined();
    });

    it('should provide clear information about rectification process', async () => {
      // TDD RED: Test process transparency
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          name: 'Transparent Name'
        },
        reason: 'Transparency test',
        evidence: 'Document'
      };
      
      const result = await privata.rectifyPersonalData(rectificationRequest);
      
      expect(result.processDescription).toBeDefined();
      expect(result.timeline).toBeDefined();
      expect(result.nextSteps).toBeDefined();
      expect(result.contactInformation).toBeDefined();
    });
  });
});

// Helper functions for test setup
async function createTestDataSubject(): Promise<DataSubject> {
  const dataSubject: DataSubject = {
    id: `test-subject-${Date.now()}`,
    email: 'test@example.com',
    name: 'Test Subject',
    createdAt: new Date(),
    updatedAt: new Date()
  };

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
    }
  ];

  return personalData;
}
