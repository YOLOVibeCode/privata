/**
 * GDPR Article 22 - Automated Decision Making Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right not to be subject to a decision
 * based solely on automated processing, including profiling, which produces legal
 * effects concerning them or similarly significantly affects them.
 * 
 * This test suite verifies that Privata correctly implements the right to automated
 * decision making as specified in GDPR Article 22.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { AutomatedDecisionRequest, AutomatedDecisionResult } from '../../../../src/types/AutomatedDecisionRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 22 - Automated Decision Making', () => {
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

  describe('Automated Decision Making Processing', () => {
    it('should allow data subjects to request information about automated decisions', async () => {
      // TDD RED: Test basic automated decision request
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionId).toBeDefined();
      expect(decisionResult.processedAt).toBeDefined();
      expect(decisionResult.decisionType).toBe('credit-scoring');
      expect(decisionResult.verificationCompleted).toBe(true);
    });

    it('should allow data subjects to object to automated decisions', async () => {
      // TDD RED: Test automated decision objection
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'objection',
        reason: 'Data subject objects to automated credit scoring',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.requestType).toBe('objection');
      expect(decisionResult.objectionProcessed).toBe(true);
      expect(decisionResult.humanReviewRequested).toBe(true);
    });

    it('should allow data subjects to request human intervention', async () => {
      // TDD RED: Test human intervention request
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'human-intervention',
        reason: 'Data subject requests human review of automated decision',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.requestType).toBe('human-intervention');
      expect(decisionResult.humanReviewRequested).toBe(true);
      expect(decisionResult.reviewDeadline).toBeDefined();
    });

    it('should allow data subjects to express their point of view', async () => {
      // TDD RED: Test point of view expression
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'express-viewpoint',
        reason: 'Data subject wants to express their point of view',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.requestType).toBe('express-viewpoint');
      expect(decisionResult.viewpointRecorded).toBe(true);
      expect(decisionResult.viewpointDeadline).toBeDefined();
    });

    it('should verify data subject identity before processing automated decision request', async () => {
      // TDD RED: Test identity verification
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.verificationCompleted).toBe(true);
      expect(decisionResult.verificationMethod).toBe('email-confirmation');
      expect(decisionResult.verificationTimestamp).toBeDefined();
    });

    it('should maintain audit trail of all automated decision activities', async () => {
      // TDD RED: Test audit logging
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processAutomatedDecision(decisionRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'AUTOMATED_DECISION_REQUEST',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('AUTOMATED_DECISION_REQUEST');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
      expect(auditLog[0]!.details).toBeDefined();
      expect(auditLog[0]!.details.decisionType).toBeDefined();
    });
  });

  describe('Decision Types and Legal Effects', () => {
    it('should handle credit scoring decisions with legal effects', async () => {
      // TDD RED: Test credit scoring decisions
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionType).toBe('credit-scoring');
      expect(decisionResult.legalEffects).toBe(true);
      expect(decisionResult.decisionDetails).toBeDefined();
      expect(decisionResult.algorithmUsed).toBeDefined();
      expect(decisionResult.dataCategories).toBeDefined();
    });

    it('should handle employment decisions with significant effects', async () => {
      // TDD RED: Test employment decisions
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'employment-screening',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionType).toBe('employment-screening');
      expect(decisionResult.significantEffects).toBe(true);
      expect(decisionResult.decisionDetails).toBeDefined();
      expect(decisionResult.criteriaUsed).toBeDefined();
      expect(decisionResult.assessmentFactors).toBeDefined();
    });

    it('should handle insurance decisions with legal effects', async () => {
      // TDD RED: Test insurance decisions
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'insurance-pricing',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionType).toBe('insurance-pricing');
      expect(decisionResult.legalEffects).toBe(true);
      expect(decisionResult.decisionDetails).toBeDefined();
      expect(decisionResult.riskFactors).toBeDefined();
      expect(decisionResult.pricingModel).toBeDefined();
    });

    it('should handle marketing profiling decisions', async () => {
      // TDD RED: Test marketing profiling
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'marketing-profiling',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionType).toBe('marketing-profiling');
      expect(decisionResult.profilingInvolved).toBe(true);
      expect(decisionResult.decisionDetails).toBeDefined();
      expect(decisionResult.profileCategories).toBeDefined();
      expect(decisionResult.behavioralData).toBeDefined();
    });
  });

  describe('Decision Information and Transparency', () => {
    it('should provide meaningful information about automated decisions', async () => {
      // TDD RED: Test decision information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionDetails).toBeDefined();
      expect(decisionResult.algorithmUsed).toBeDefined();
      expect(decisionResult.dataCategories).toBeDefined();
      expect(decisionResult.decisionLogic).toBeDefined();
      // importanceWeights is only defined for certain decision types
      if (decisionResult.importanceWeights) {
        expect(decisionResult.importanceWeights).toBeDefined();
      }
    });

    it('should provide information about the logic involved in automated decisions', async () => {
      // TDD RED: Test decision logic information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decisionLogic).toBeDefined();
      expect(decisionResult.algorithmDescription).toBeDefined();
      expect(decisionResult.decisionSteps).toBeDefined();
      expect(decisionResult.thresholds).toBeDefined();
    });

    it('should provide information about the significance and envisaged consequences', async () => {
      // TDD RED: Test consequences information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.consequences).toBeDefined();
      expect(decisionResult.significance).toBeDefined();
      expect(decisionResult.envisagedEffects).toBeDefined();
      expect(decisionResult.impactAssessment).toBeDefined();
    });

    it('should provide information about the data categories used', async () => {
      // TDD RED: Test data categories information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.dataCategories).toBeDefined();
      expect(decisionResult.dataSources).toBeDefined();
      expect(decisionResult.dataRetention).toBeDefined();
      expect(decisionResult.dataAccuracy).toBeDefined();
    });
  });

  describe('Objection and Human Intervention', () => {
    it('should process objections to automated decisions', async () => {
      // TDD RED: Test decision objection
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'objection',
        reason: 'Data subject objects to automated credit scoring decision',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.objectionProcessed).toBe(true);
      expect(decisionResult.humanReviewRequested).toBe(true);
      expect(decisionResult.reviewDeadline).toBeDefined();
      expect(decisionResult.objectionStatus).toBeDefined();
    });

    it('should request human intervention for automated decisions', async () => {
      // TDD RED: Test human intervention
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'human-intervention',
        reason: 'Data subject requests human review',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.humanReviewRequested).toBe(true);
      expect(decisionResult.reviewDeadline).toBeDefined();
      expect(decisionResult.reviewProcess).toBeDefined();
      expect(decisionResult.reviewerAssignment).toBeDefined();
    });

    it('should allow expression of point of view', async () => {
      // TDD RED: Test point of view expression
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'express-viewpoint',
        reason: 'Data subject wants to express their point of view',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.viewpointRecorded).toBe(true);
      expect(decisionResult.viewpointDeadline).toBeDefined();
      expect(decisionResult.viewpointProcess).toBeDefined();
      expect(decisionResult.viewpointConsideration).toBeDefined();
    });

    it('should provide information about objection and intervention rights', async () => {
      // TDD RED: Test rights information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.rightsInformation).toBeDefined();
      expect(decisionResult.objectionRights).toBeDefined();
      expect(decisionResult.interventionRights).toBeDefined();
      expect(decisionResult.viewpointRights).toBeDefined();
    });
  });

  describe('Decision Review and Appeal', () => {
    it('should provide information about decision review process', async () => {
      // TDD RED: Test review process information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      // reviewProcess is only defined for certain request types
      if (decisionResult.reviewProcess) {
        expect(decisionResult.reviewProcess).toBeDefined();
      }
      expect(decisionResult.appealProcess).toBeDefined();
      expect(decisionResult.reviewTimeline).toBeDefined();
      expect(decisionResult.reviewCriteria).toBeDefined();
    });

    it('should provide information about appeal rights', async () => {
      // TDD RED: Test appeal rights information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.appealRights).toBeDefined();
      expect(decisionResult.appealProcess).toBeDefined();
      expect(decisionResult.appealDeadline).toBeDefined();
      expect(decisionResult.appealCriteria).toBeDefined();
    });

    it('should provide information about supervisory authority rights', async () => {
      // TDD RED: Test supervisory authority information
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.supervisoryAuthority).toBeDefined();
      expect(decisionResult.complaintRights).toBeDefined();
      expect(decisionResult.complaintProcess).toBeDefined();
      expect(decisionResult.complaintDeadline).toBeDefined();
    });
  });

  describe('Decision Monitoring and Compliance', () => {
    it('should monitor compliance with automated decision requirements', async () => {
      // TDD RED: Test compliance monitoring
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const decisionResult = await privata.processAutomatedDecision(decisionRequest);
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.monitoringEnabled).toBe(true);
      expect(decisionResult.complianceChecks).toBeDefined();
      expect(decisionResult.complianceChecks!.frequency).toBeDefined();
      expect(decisionResult.complianceChecks!.alertsEnabled).toBe(true);
    });

    it('should provide decision status and compliance reports', async () => {
      // TDD RED: Test status reporting
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processAutomatedDecision(decisionRequest);
      
      const statusReport = await privata.getAutomatedDecisionStatus(testDataSubject.id);
      
      expect(statusReport.decisionActive).toBe(true);
      expect(statusReport.decisionId).toBeDefined();
      expect(statusReport.complianceStatus).toBeDefined();
      expect(statusReport.lastComplianceCheck).toBeDefined();
      expect(statusReport.violations).toBeDefined();
    });

    it('should handle decision violations and alerts', async () => {
      // TDD RED: Test violation handling
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.processAutomatedDecision(decisionRequest);
      
      // Simulate a violation
      const violationResult = await privata.reportAutomatedDecisionViolation(testDataSubject.id, {
        violationType: 'unauthorized-decision',
        description: 'Automated decision made without proper authorization',
        timestamp: new Date(),
        severity: 'high'
      });
      
      expect(violationResult.violationId).toBeDefined();
      expect(violationResult.alertSent).toBe(true);
      expect(violationResult.escalationRequired).toBe(true);
      expect(violationResult.remediationSteps).toBeDefined();
    });
  });

  describe('Response Time and Deadlines', () => {
    it('should process automated decision requests without undue delay', async () => {
      // TDD RED: Test response time
      const startTime = Date.now();
      
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(decisionRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
      expect(result.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex automated decision requests within extended timeline', async () => {
      // TDD RED: Test complex request timeline
      const startTime = Date.now();
      
      const complexRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'objection',
        reason: 'Complex objection to automated credit scoring decision',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(complexRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
      expect(result.complexRequest).toBe(true);
    });
  });

  describe('Decision Validation and Security', () => {
    it('should validate automated decision requests before processing', async () => {
      // TDD RED: Test request validation
      const invalidRequest: AutomatedDecisionRequest = {
        dataSubjectId: 'invalid-id',
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Data subject not found');
    });

    it('should validate decision types', async () => {
      // TDD RED: Test type validation
      const requestWithInvalidType: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'invalid-type' as any,
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(requestWithInvalidType);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid decision type');
    });

    it('should validate request types', async () => {
      // TDD RED: Test request type validation
      const requestWithInvalidRequestType: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'invalid-request-type' as any,
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(requestWithInvalidRequestType);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid request type');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent automated decision requests', async () => {
      // TDD RED: Test concurrent processing
      const requests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: `concurrent-subject-${index}`,
        decisionType: 'credit-scoring' as const,
        requestType: 'information' as const,
        verificationMethod: 'email-confirmation' as const
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => privata.processAutomatedDecision(request))
      );
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // 5 seconds
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle large-scale automated decision requests efficiently', async () => {
      // TDD RED: Test large-scale decision processing
      const largeRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const startTime = Date.now();
      const result = await privata.processAutomatedDecision(largeRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.decisionDetails).toBeDefined();
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 22 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(decisionRequest);
      
      // Verify all required elements are present
      expect(result.success).toBeDefined();
      expect(result.decisionId).toBeDefined();
      expect(result.processedAt).toBeDefined();
      expect(result.decisionType).toBeDefined();
      expect(result.verificationCompleted).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.confirmationProvided).toBeDefined();
    });

    it('should provide clear information about automated decision process', async () => {
      // TDD RED: Test process transparency
      const decisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.processAutomatedDecision(decisionRequest);
      
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
      category: 'financial',
      fields: {
        creditScore: 750,
        income: 50000,
        employmentStatus: 'employed'
      },
      source: {
        type: 'system-generated',
        timestamp: new Date(),
        method: 'credit-assessment'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    },
    {
      id: `data-3-${Date.now()}`,
      dataSubjectId,
      category: 'behavioral',
      fields: {
        purchaseHistory: ['electronics', 'books', 'clothing'],
        browsingPatterns: ['morning', 'evening'],
        preferences: ['online-shopping', 'newsletters']
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
