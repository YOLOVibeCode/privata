/**
 * GDPR Article 18 - Right to Restriction of Processing Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right to obtain restriction of processing
 * where certain conditions apply, including when the accuracy of personal data is
 * contested, processing is unlawful, or the data subject has objected to processing.
 * 
 * This test suite verifies that Privata correctly implements the right to restriction
 * as specified in GDPR Article 18.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { RestrictionRequest, RestrictionResult } from '../../../../src/types/RestrictionRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 18 - Right to Restriction', () => {
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

  describe('Restriction Request Processing', () => {
    it('should allow data subjects to request restriction of processing', async () => {
      // TDD RED: Test basic restriction request
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Data subject contests the accuracy of personal data',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.restrictionId).toBeDefined();
      expect(restrictionResult.processedAt).toBeDefined();
      expect(restrictionResult.restrictedDataCategories).toBeDefined();
      expect(restrictionResult.restrictedDataCategories.length).toBeGreaterThan(0);
      expect(restrictionResult.verificationCompleted).toBe(true);
    });

    it('should verify data subject identity before applying restrictions', async () => {
      // TDD RED: Test identity verification
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'unlawful-processing',
        evidence: 'Processing is unlawful',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.verificationCompleted).toBe(true);
      expect(restrictionResult.verificationMethod).toBe('email-confirmation');
      expect(restrictionResult.verificationTimestamp).toBeDefined();
    });

    it('should handle partial restriction requests for specific data categories', async () => {
      // TDD RED: Test partial restriction
      const partialRestrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested for marketing data only',
        scope: 'specific-categories',
        dataCategories: ['marketing', 'analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(partialRestrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.restrictedDataCategories).toContain('marketing');
      expect(restrictionResult.restrictedDataCategories).toContain('analytics');
      expect(restrictionResult.unrestrictedDataCategories).toBeDefined();
      expect(restrictionResult.unrestrictedDataCategories!.length).toBeGreaterThan(0);
    });

    it('should maintain audit trail of all restriction activities', async () => {
      // TDD RED: Test audit logging
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'data-subject-objection',
        evidence: 'Data subject has objected to processing',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_RESTRICTION',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('DATA_RESTRICTION');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
      expect(auditLog[0]!.details).toBeDefined();
      expect(auditLog[0]!.details.restrictionReason).toBeDefined();
    });
  });

  describe('Restriction Grounds and Conditions', () => {
    it('should process restriction requests based on valid grounds', async () => {
      // TDD RED: Test valid restriction grounds
      const validGrounds = [
        'accuracy-contested',
        'unlawful-processing',
        'data-no-longer-necessary',
        'data-subject-objection',
        'pending-verification'
      ];
      
      for (const ground of validGrounds) {
        const restrictionRequest: RestrictionRequest = {
          dataSubjectId: testDataSubject.id,
          reason: ground as any,
          evidence: `Valid ground: ${ground}`,
          scope: 'all-personal-data',
          verificationMethod: 'email-confirmation'
        };
        
        const result = await privata.restrictProcessing(restrictionRequest);
        expect(result.success).toBe(true);
        expect(result.restrictionGround).toBe(ground);
      }
    });

    it('should handle accuracy contestation restrictions', async () => {
      // TDD RED: Test accuracy contestation
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Data subject contests accuracy of personal data',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.restrictionGround).toBe('accuracy-contested');
      expect(restrictionResult.verificationRequired).toBe(true);
      expect(restrictionResult.verificationDeadline).toBeDefined();
    });

    it('should handle unlawful processing restrictions', async () => {
      // TDD RED: Test unlawful processing restriction
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'unlawful-processing',
        evidence: 'Processing is unlawful',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.restrictionGround).toBe('unlawful-processing');
      expect(restrictionResult.immediateRestriction).toBe(true);
      expect(restrictionResult.legalReviewRequired).toBe(true);
    });

    it('should handle data subject objection restrictions', async () => {
      // TDD RED: Test data subject objection
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'data-subject-objection',
        evidence: 'Data subject has objected to processing',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.restrictionGround).toBe('data-subject-objection');
      expect(restrictionResult.objectionHandling).toBeDefined();
      expect(restrictionResult.objectionHandling!.reviewRequired).toBe(true);
    });
  });

  describe('Restriction Implementation and Enforcement', () => {
    it('should implement processing restrictions across all systems', async () => {
      // TDD RED: Test restriction implementation
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.restrictionImplementation).toBeDefined();
      expect(restrictionResult.restrictionImplementation!.systemsUpdated).toBeDefined();
      expect(restrictionResult.restrictionImplementation!.systemsUpdated.length).toBeGreaterThan(0);
      expect(restrictionResult.restrictionImplementation!.enforcementActive).toBe(true);
    });

    it('should prevent processing of restricted data', async () => {
      // TDD RED: Test processing prevention
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      // Attempt to process restricted data
      const processingResult = await privata.attemptProcessing(testDataSubject.id, {
        operation: 'data-analysis',
        dataCategories: ['identity', 'contact'],
        timestamp: new Date()
      });
      
      expect(processingResult.blocked).toBe(true);
      expect(processingResult.reason).toBe('Processing restricted');
      expect(processingResult.restrictionId).toBeDefined();
    });

    it('should allow storage and other limited processing of restricted data', async () => {
      // TDD RED: Test limited processing allowance
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      // Attempt allowed operations
      const storageResult = await privata.attemptProcessing(testDataSubject.id, {
        operation: 'data-storage',
        dataCategories: ['identity', 'contact'],
        timestamp: new Date()
      });
      
      expect(storageResult.blocked).toBe(false);
      expect(storageResult.allowedOperations).toContain('storage');
    });

    it('should handle restriction exceptions and overrides', async () => {
      // TDD RED: Test restriction exceptions
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        exceptions: ['legal-obligation', 'vital-interests', 'public-interest']
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.exceptionsApplied).toBeDefined();
      expect(restrictionResult.exceptionsApplied!.length).toBeGreaterThan(0);
      expect(restrictionResult.partialRestriction).toBe(true);
      expect(restrictionResult.exceptionBasis).toBeDefined();
    });
  });

  describe('Restriction Monitoring and Compliance', () => {
    it('should monitor compliance with processing restrictions', async () => {
      // TDD RED: Test restriction monitoring
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      expect(restrictionResult.success).toBe(true);
      expect(restrictionResult.monitoringEnabled).toBe(true);
      expect(restrictionResult.complianceChecks).toBeDefined();
      expect(restrictionResult.complianceChecks!.frequency).toBeDefined();
      expect(restrictionResult.complianceChecks!.alertsEnabled).toBe(true);
    });

    it('should provide restriction status and compliance reports', async () => {
      // TDD RED: Test status reporting
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      const statusReport = await privata.getRestrictionStatus(testDataSubject.id);
      
      expect(statusReport.restrictionActive).toBe(true);
      expect(statusReport.restrictionId).toBeDefined();
      expect(statusReport.complianceStatus).toBeDefined();
      expect(statusReport.lastComplianceCheck).toBeDefined();
      expect(statusReport.violations).toBeDefined();
    });

    it('should handle restriction violations and alerts', async () => {
      // TDD RED: Test violation handling
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      // Simulate a violation
      const violationResult = await privata.reportRestrictionViolation(testDataSubject.id, {
        violationType: 'unauthorized-processing',
        description: 'Attempted to process restricted data',
        timestamp: new Date(),
        severity: 'high'
      });
      
      expect(violationResult.violationId).toBeDefined();
      expect(violationResult.alertSent).toBe(true);
      expect(violationResult.escalationRequired).toBe(true);
      expect(violationResult.remediationSteps).toBeDefined();
    });
  });

  describe('Restriction Lifting and Removal', () => {
    it('should allow lifting of restrictions when conditions are met', async () => {
      // TDD RED: Test restriction lifting
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      const liftRequest = {
        restrictionId: 'restriction-123',
        reason: 'accuracy-verified',
        evidence: 'Data accuracy has been verified',
        verificationMethod: 'document-verification' as const
      };
      
      const liftResult = await privata.liftRestriction(liftRequest);
      
      expect(liftResult.success).toBe(true);
      expect(liftResult.liftId).toBeDefined();
      expect(liftResult.processedAt).toBeDefined();
      expect(liftResult.verificationCompleted).toBe(true);
    });

    it('should verify conditions before lifting restrictions', async () => {
      // TDD RED: Test lift verification
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.restrictProcessing(restrictionRequest);
      
      const liftRequest = {
        restrictionId: 'restriction-123',
        reason: 'accuracy-verified',
        evidence: 'Data accuracy verified',
        verificationMethod: 'document-verification' as const
      };
      
      const liftResult = await privata.liftRestriction(liftRequest);
      
      expect(liftResult.success).toBe(true);
      expect(liftResult.verificationCompleted).toBe(true);
      expect(liftResult.verificationMethod).toBe('document-verification');
      expect(liftResult.verificationTimestamp).toBeDefined();
    });

    it('should maintain audit trail of restriction lifting', async () => {
      // TDD RED: Test lift audit trail
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      
      const liftRequest = {
        restrictionId: restrictionResult.restrictionId!,
        reason: 'accuracy-verified',
        evidence: 'Data accuracy verified',
        verificationMethod: 'document-verification' as const
      };
      
      await privata.liftRestriction(liftRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'RESTRICTION_LIFTED',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('RESTRICTION_LIFTED');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
    });
  });

  describe('Restriction Response Time and Deadlines', () => {
    it('should process restriction requests without undue delay', async () => {
      // TDD RED: Test response time
      const startTime = Date.now();
      
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.restrictProcessing(restrictionRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
      expect(result.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex restriction requests within extended timeline', async () => {
      // TDD RED: Test complex request timeline
      const startTime = Date.now();
      
      const complexRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'unlawful-processing',
        evidence: 'Complex unlawful processing case',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        exceptions: ['legal-obligation', 'vital-interests']
      };
      
      const result = await privata.restrictProcessing(complexRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
      expect(result.complexRequest).toBe(true);
    });
  });

  describe('Restriction Validation and Security', () => {
    it('should validate restriction requests before processing', async () => {
      // TDD RED: Test request validation
      const invalidRequest: RestrictionRequest = {
        dataSubjectId: 'invalid-id',
        reason: 'accuracy-contested',
        evidence: 'Accuracy contested',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.restrictProcessing(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Data subject not found');
    });

    it('should require proper evidence for restriction requests', async () => {
      // TDD RED: Test evidence requirement
      const requestWithoutEvidence: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: '',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.restrictProcessing(requestWithoutEvidence);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Evidence is required for restriction');
    });

    it('should validate restriction grounds', async () => {
      // TDD RED: Test ground validation
      const requestWithInvalidGround: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'invalid-ground' as any,
        evidence: 'Invalid ground',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.restrictProcessing(requestWithInvalidGround);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid restriction ground');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent restriction requests', async () => {
      // TDD RED: Test concurrent processing
      const requests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: `concurrent-subject-${index}`,
        reason: 'accuracy-contested' as const,
        evidence: `Concurrent restriction ${index}`,
        scope: 'all-personal-data' as const,
        verificationMethod: 'email-confirmation' as const
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => privata.restrictProcessing(request))
      );
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // 5 seconds
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle large-scale restriction requests efficiently', async () => {
      // TDD RED: Test large-scale restriction
      const largeRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Large-scale restriction request',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        exceptions: ['legal-obligation', 'vital-interests', 'public-interest']
      };
      
      const startTime = Date.now();
      const result = await privata.restrictProcessing(largeRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.restrictedDataCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 18 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Compliance test',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.restrictProcessing(restrictionRequest);
      
      // Verify all required elements are present
      expect(result.success).toBeDefined();
      expect(result.restrictionId).toBeDefined();
      expect(result.processedAt).toBeDefined();
      expect(result.restrictedDataCategories).toBeDefined();
      expect(result.verificationCompleted).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.confirmationProvided).toBeDefined();
    });

    it('should provide clear information about restriction process', async () => {
      // TDD RED: Test process transparency
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Transparency test',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.restrictProcessing(restrictionRequest);
      
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
    },
    {
      id: `data-3-${Date.now()}`,
      dataSubjectId,
      category: 'marketing',
      fields: {
        preferences: 'email-marketing',
        newsletter: true
      },
      source: {
        type: 'user-input',
        timestamp: new Date(),
        method: 'marketing-preferences'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    }
  ];

  return personalData;
}
