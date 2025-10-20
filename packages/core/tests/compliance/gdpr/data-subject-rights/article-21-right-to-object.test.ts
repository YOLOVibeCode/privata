/**
 * GDPR Article 21 - Right to Object Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right to object to processing of
 * personal data concerning them based on legitimate interests or for direct
 * marketing purposes, including profiling related to such direct marketing.
 * 
 * This test suite verifies that Privata correctly implements the right to object
 * as specified in GDPR Article 21.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { ObjectionRequest, ObjectionResult } from '../../../../src/types/ObjectionRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 21 - Right to Object', () => {
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

  describe('Objection Request Processing', () => {
    it('should allow data subjects to object to processing based on legitimate interests', async () => {
      // TDD RED: Test basic objection request
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Data subject objects to processing based on legitimate interests',
        processingPurposes: ['analytics', 'service-improvement'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionId).toBeDefined();
      expect(objectionResult.processedAt).toBeDefined();
      expect(objectionResult.objectionType).toBe('legitimate-interests');
      expect(objectionResult.verificationCompleted).toBe(true);
    });

    it('should allow data subjects to object to direct marketing', async () => {
      // TDD RED: Test direct marketing objection
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'direct-marketing',
        reason: 'Data subject objects to direct marketing communications',
        processingPurposes: ['email-marketing', 'sms-marketing'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionType).toBe('direct-marketing');
      expect(objectionResult.immediateEffect).toBe(true);
      expect(objectionResult.processingStopped).toBe(true);
    });

    it('should allow data subjects to object to profiling for direct marketing', async () => {
      // TDD RED: Test profiling objection
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'profiling',
        reason: 'Data subject objects to profiling for direct marketing',
        processingPurposes: ['behavioral-analysis', 'targeted-advertising'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionType).toBe('profiling');
      expect(objectionResult.profilingStopped).toBe(true);
      expect(objectionResult.decisionMakingStopped).toBe(true);
    });

    it('should verify data subject identity before processing objection', async () => {
      // TDD RED: Test identity verification
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.verificationCompleted).toBe(true);
      expect(objectionResult.verificationMethod).toBe('email-confirmation');
      expect(objectionResult.verificationTimestamp).toBeDefined();
    });

    it('should maintain audit trail of all objection activities', async () => {
      // TDD RED: Test audit logging
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processObjection(objectionRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_OBJECTION',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('DATA_OBJECTION');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
      expect(auditLog[0]!.details).toBeDefined();
      expect(auditLog[0]!.details.objectionType).toBeDefined();
    });
  });

  describe('Objection Types and Grounds', () => {
    it('should handle legitimate interests objections with compelling grounds review', async () => {
      // TDD RED: Test legitimate interests objection
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics', 'service-improvement'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionType).toBe('legitimate-interests');
      expect(objectionResult.compellingGroundsReview).toBe(true);
      expect(objectionResult.reviewDeadline).toBeDefined();
      expect(objectionResult.legalBasis).toBeDefined();
    });

    it('should handle direct marketing objections with immediate effect', async () => {
      // TDD RED: Test direct marketing objection
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'direct-marketing',
        reason: 'Objection to direct marketing',
        processingPurposes: ['email-marketing', 'sms-marketing'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionType).toBe('direct-marketing');
      expect(objectionResult.immediateEffect).toBe(true);
      expect(objectionResult.processingStopped).toBe(true);
      expect(objectionResult.marketingChannels).toBeDefined();
    });

    it('should handle profiling objections with decision-making restrictions', async () => {
      // TDD RED: Test profiling objection
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'profiling',
        reason: 'Objection to profiling for direct marketing',
        processingPurposes: ['behavioral-analysis', 'targeted-advertising'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionType).toBe('profiling');
      expect(objectionResult.profilingStopped).toBe(true);
      expect(objectionResult.decisionMakingStopped).toBe(true);
      expect(objectionResult.automatedDecisions).toBeDefined();
    });

    it('should handle scientific research objections with specific conditions', async () => {
      // TDD RED: Test scientific research objection
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'scientific-research',
        reason: 'Objection to processing for scientific research',
        processingPurposes: ['research-analysis', 'statistical-analysis'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionType).toBe('scientific-research');
      expect(objectionResult.researchRestrictions).toBeDefined();
      expect(objectionResult.publicInterestBasis).toBeDefined();
    });
  });

  describe('Objection Implementation and Enforcement', () => {
    it('should implement objection across all processing systems', async () => {
      // TDD RED: Test objection implementation
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.implementationStatus).toBeDefined();
      expect(objectionResult.implementationStatus!.systemsUpdated).toBeDefined();
      expect(objectionResult.implementationStatus!.systemsUpdated.length).toBeGreaterThan(0);
      expect(objectionResult.implementationStatus!.enforcementActive).toBe(true);
    });

    it('should prevent processing of objected data', async () => {
      // TDD RED: Test processing prevention
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processObjection(objectionRequest);
      
      // Attempt to process objected data
      const processingResult = await privata.attemptProcessing(testDataSubject.id, {
        operation: 'analytics',
        dataCategories: ['usage', 'behavior'],
        timestamp: new Date()
      });
      
      expect(processingResult.blocked).toBe(true);
      expect(processingResult.reason).toBe('Processing objected');
      expect(processingResult.restrictionId).toBeDefined();
    });

    it('should allow processing for other purposes not objected to', async () => {
      // TDD RED: Test selective processing allowance
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processObjection(objectionRequest);
      
      // Attempt allowed operations
      const processingResult = await privata.attemptProcessing(testDataSubject.id, {
        operation: 'service-provision',
        dataCategories: ['identity', 'contact'],
        timestamp: new Date()
      });
      
      expect(processingResult.blocked).toBe(false);
      expect(processingResult.allowedOperations).toContain('service-provision');
    });

    it('should handle objection overrides with compelling grounds', async () => {
      // TDD RED: Test objection override
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest, {
        simulateCompellingGrounds: true
      });
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.objectionOverridden).toBe(true);
      expect(objectionResult.compellingGrounds).toBeDefined();
      expect(objectionResult.legalBasis).toBeDefined();
      expect(objectionResult.overrideJustification).toBeDefined();
    });
  });

  describe('Objection Monitoring and Compliance', () => {
    it('should monitor compliance with objection requirements', async () => {
      // TDD RED: Test objection monitoring
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      expect(objectionResult.success).toBe(true);
      expect(objectionResult.monitoringEnabled).toBe(true);
      expect(objectionResult.complianceChecks).toBeDefined();
      expect(objectionResult.complianceChecks!.frequency).toBeDefined();
      expect(objectionResult.complianceChecks!.alertsEnabled).toBe(true);
    });

    it('should provide objection status and compliance reports', async () => {
      // TDD RED: Test status reporting
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processObjection(objectionRequest);
      
      const statusReport = await privata.getObjectionStatus(testDataSubject.id);
      
      expect(statusReport.objectionActive).toBe(true);
      expect(statusReport.objectionId).toBeDefined();
      expect(statusReport.complianceStatus).toBeDefined();
      expect(statusReport.lastComplianceCheck).toBeDefined();
      expect(statusReport.violations).toBeDefined();
    });

    it('should handle objection violations and alerts', async () => {
      // TDD RED: Test violation handling
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processObjection(objectionRequest);
      
      // Simulate a violation
      const violationResult = await privata.reportObjectionViolation(testDataSubject.id, {
        violationType: 'unauthorized-processing',
        description: 'Attempted to process objected data',
        timestamp: new Date(),
        severity: 'high'
      });
      
      expect(violationResult.violationId).toBeDefined();
      expect(violationResult.alertSent).toBe(true);
      expect(violationResult.escalationRequired).toBe(true);
      expect(violationResult.remediationSteps).toBeDefined();
    });
  });

  describe('Objection Withdrawal and Modification', () => {
    it('should allow withdrawal of objections', async () => {
      // TDD RED: Test objection withdrawal
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      const withdrawalRequest = {
        objectionId: objectionResult.objectionId!,
        reason: 'Data subject has withdrawn objection',
        verificationMethod: 'email-confirmation' as const
      };
      
      const withdrawalResult = await privata.withdrawObjection(withdrawalRequest);
      
      expect(withdrawalResult.success).toBe(true);
      expect(withdrawalResult.withdrawalId).toBeDefined();
      expect(withdrawalResult.processedAt).toBeDefined();
      expect(withdrawalResult.verificationCompleted).toBe(true);
    });

    it('should verify conditions before withdrawing objections', async () => {
      // TDD RED: Test withdrawal verification
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      const withdrawalRequest = {
        objectionId: objectionResult.objectionId!,
        reason: 'Data subject has withdrawn objection',
        verificationMethod: 'email-confirmation' as const
      };
      
      const withdrawalResult = await privata.withdrawObjection(withdrawalRequest);
      
      expect(withdrawalResult.success).toBe(true);
      expect(withdrawalResult.verificationCompleted).toBe(true);
      expect(withdrawalResult.verificationMethod).toBe('email-confirmation');
      expect(withdrawalResult.verificationTimestamp).toBeDefined();
    });

    it('should maintain audit trail of objection withdrawal', async () => {
      // TDD RED: Test withdrawal audit trail
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const objectionResult = await privata.processObjection(objectionRequest);
      
      const withdrawalRequest = {
        objectionId: objectionResult.objectionId!,
        reason: 'Data subject has withdrawn objection',
        verificationMethod: 'email-confirmation' as const
      };
      
      await privata.withdrawObjection(withdrawalRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'OBJECTION_WITHDRAWN',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('OBJECTION_WITHDRAWN');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
    });
  });

  describe('Objection Response Time and Deadlines', () => {
    it('should process objection requests without undue delay', async () => {
      // TDD RED: Test response time
      const startTime = Date.now();
      
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(objectionRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
      expect(result.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex objection requests within extended timeline', async () => {
      // TDD RED: Test complex request timeline
      const startTime = Date.now();
      
      const complexRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Complex objection to legitimate interests processing',
        processingPurposes: ['analytics', 'service-improvement', 'research'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(complexRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
      expect(result.complexRequest).toBe(true);
    });
  });

  describe('Objection Validation and Security', () => {
    it('should validate objection requests before processing', async () => {
      // TDD RED: Test request validation
      const invalidRequest: ObjectionRequest = {
        dataSubjectId: 'invalid-id',
        objectionType: 'legitimate-interests',
        reason: 'Objection to legitimate interests processing',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Data subject not found');
    });

    it('should require proper reason for objection requests', async () => {
      // TDD RED: Test reason requirement
      const requestWithoutReason: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: '',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(requestWithoutReason);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Reason is required for objection');
    });

    it('should validate objection types', async () => {
      // TDD RED: Test type validation
      const requestWithInvalidType: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'invalid-type' as any,
        reason: 'Invalid objection type',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(requestWithInvalidType);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid objection type');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent objection requests', async () => {
      // TDD RED: Test concurrent processing
      const requests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: `concurrent-subject-${index}`,
        objectionType: 'legitimate-interests' as const,
        reason: `Concurrent objection ${index}`,
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation' as const
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => privata.processObjection(request))
      );
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // 5 seconds
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle large-scale objection requests efficiently', async () => {
      // TDD RED: Test large-scale objection
      const largeRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Large-scale objection request',
        processingPurposes: ['analytics', 'service-improvement', 'research', 'marketing'],
        verificationMethod: 'email-confirmation'
      };
      
      const startTime = Date.now();
      const result = await privata.processObjection(largeRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.processingPurposes).toBeDefined();
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 21 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Compliance test',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(objectionRequest);
      
      // Verify all required elements are present
      expect(result.success).toBeDefined();
      expect(result.objectionId).toBeDefined();
      expect(result.processedAt).toBeDefined();
      expect(result.objectionType).toBeDefined();
      expect(result.verificationCompleted).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.confirmationProvided).toBeDefined();
    });

    it('should provide clear information about objection process', async () => {
      // TDD RED: Test process transparency
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Transparency test',
        processingPurposes: ['analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processObjection(objectionRequest);
      
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
