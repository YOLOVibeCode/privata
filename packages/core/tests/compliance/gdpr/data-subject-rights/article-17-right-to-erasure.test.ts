/**
 * GDPR Article 17 - Right to Erasure (Right to be Forgotten) Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right to obtain erasure of personal data
 * concerning them without undue delay, and the controller shall have the obligation
 * to erase personal data without undue delay where certain grounds apply.
 * 
 * This test suite verifies that Privata correctly implements the right to erasure
 * as specified in GDPR Article 17.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { ErasureRequest, ErasureResult } from '../../../../src/types/ErasureRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 17 - Right to Erasure', () => {
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

  describe('Erasure Request Processing', () => {
    it('should allow data subjects to request erasure of their personal data', async () => {
      // TDD RED: Test basic erasure request
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Data subject has withdrawn consent for all processing',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.erasureId).toBeDefined();
      expect(erasureResult.processedAt).toBeDefined();
      expect(erasureResult.erasedDataCategories).toBeDefined();
      expect(erasureResult.erasedDataCategories.length).toBeGreaterThan(0);
      expect(erasureResult.verificationCompleted).toBe(true);
    });

    it('should verify data subject identity before erasure', async () => {
      // TDD RED: Test identity verification
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'data-no-longer-necessary',
        evidence: 'Data is no longer necessary for original purposes',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.verificationCompleted).toBe(true);
      expect(erasureResult.verificationMethod).toBe('email-confirmation');
      expect(erasureResult.verificationTimestamp).toBeDefined();
    });

    it('should handle partial erasure requests for specific data categories', async () => {
      // TDD RED: Test partial erasure
      const partialErasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn for marketing data only',
        scope: 'specific-categories',
        dataCategories: ['marketing', 'analytics'],
        verificationMethod: 'email-confirmation'
      };
      
      const erasureResult = await privata.erasePersonalData(partialErasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.erasedDataCategories).toContain('marketing');
      expect(erasureResult.erasedDataCategories).toContain('analytics');
      expect(erasureResult.retainedDataCategories).toBeDefined();
      expect(erasureResult.retainedDataCategories!.length).toBeGreaterThan(0);
    });

    it('should maintain audit trail of all erasure activities', async () => {
      // TDD RED: Test audit logging
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'unlawful-processing',
        evidence: 'Data was processed unlawfully',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.erasePersonalData(erasureRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_ERASURE',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('DATA_ERASURE');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
      expect(auditLog[0]!.details).toBeDefined();
      expect(auditLog[0]!.details.erasureReason).toBeDefined();
    });
  });

  describe('Erasure Grounds and Exceptions', () => {
    it('should process erasure requests based on valid grounds', async () => {
      // TDD RED: Test valid erasure grounds
      const validGrounds = [
        'withdrawal-of-consent',
        'data-no-longer-necessary',
        'unlawful-processing',
        'legal-obligation',
        'data-subject-objection'
      ];
      
      for (const ground of validGrounds) {
        const erasureRequest: ErasureRequest = {
          dataSubjectId: testDataSubject.id,
          reason: ground as any,
          evidence: `Valid ground: ${ground}`,
          scope: 'all-personal-data',
          verificationMethod: 'email-confirmation'
        };
        
        const result = await privata.erasePersonalData(erasureRequest);
        expect(result.success).toBe(true);
        expect(result.erasureGround).toBe(ground);
      }
    });

    it('should handle erasure exceptions appropriately', async () => {
      // TDD RED: Test erasure exceptions
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'data-no-longer-necessary',
        evidence: 'Data no longer necessary',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        exceptions: ['legal-obligation', 'public-interest', 'legitimate-interests']
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.exceptionsApplied).toBeDefined();
      expect(erasureResult.exceptionsApplied!.length).toBeGreaterThan(0);
      expect(erasureResult.partialErasure).toBe(true);
      expect(erasureResult.retainedDataCategories).toBeDefined();
    });

    it('should not erase data when legal obligations require retention', async () => {
      // TDD RED: Test legal obligation exception
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        exceptions: ['legal-obligation']
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.exceptionsApplied).toContain('legal-obligation');
      expect(erasureResult.partialErasure).toBe(true);
      expect(erasureResult.legalBasisForRetention).toBeDefined();
    });

    it('should handle public interest exceptions', async () => {
      // TDD RED: Test public interest exception
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'data-no-longer-necessary',
        evidence: 'Data no longer necessary',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        exceptions: ['public-interest']
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.exceptionsApplied).toContain('public-interest');
      expect(erasureResult.publicInterestBasis).toBeDefined();
    });
  });

  describe('Third-Party Notification and Data Propagation', () => {
    it('should notify third parties of data erasure', async () => {
      // TDD RED: Test third-party notification
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        notifyThirdParties: true
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.thirdPartyNotifications).toBeDefined();
      expect(erasureResult.thirdPartyNotifications!.length).toBeGreaterThan(0);
      expect(erasureResult.thirdPartyNotifications![0]!.recipient).toBeDefined();
      expect(erasureResult.thirdPartyNotifications![0]!.notifiedAt).toBeDefined();
      expect(erasureResult.thirdPartyNotifications![0]!.status).toBeDefined();
    });

    it('should track third-party erasure confirmations', async () => {
      // TDD RED: Test third-party confirmation tracking
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        notifyThirdParties: true
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.thirdPartyConfirmations).toBeDefined();
      expect(erasureResult.thirdPartyConfirmations!.length).toBeGreaterThan(0);
      expect(erasureResult.thirdPartyConfirmations![0]!.confirmed).toBeDefined();
      expect(erasureResult.thirdPartyConfirmations![0]!.confirmationDate).toBeDefined();
    });

    it('should handle third-party erasure failures', async () => {
      // TDD RED: Test third-party failure handling
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        notifyThirdParties: true
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest, {
        simulateThirdPartyFailure: true
      });
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.thirdPartyFailures).toBeDefined();
      expect(erasureResult.thirdPartyFailures!.length).toBeGreaterThan(0);
      expect(erasureResult.retryScheduled).toBe(true);
      expect(erasureResult.failureReason).toBeDefined();
    });
  });

  describe('Erasure Response Time and Deadlines', () => {
    it('should process erasure requests without undue delay', async () => {
      // TDD RED: Test response time
      const startTime = Date.now();
      
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.erasePersonalData(erasureRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
      expect(result.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex erasure requests within extended timeline', async () => {
      // TDD RED: Test complex request timeline
      const startTime = Date.now();
      
      const complexRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'unlawful-processing',
        evidence: 'Complex unlawful processing case',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        notifyThirdParties: true,
        exceptions: ['legal-obligation', 'public-interest']
      };
      
      const result = await privata.erasePersonalData(complexRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
      expect(result.complexRequest).toBe(true);
    });
  });

  describe('Data Verification and Confirmation', () => {
    it('should provide confirmation of data erasure', async () => {
      // TDD RED: Test erasure confirmation
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest);
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.confirmationProvided).toBe(true);
      expect(erasureResult.confirmationMethod).toBeDefined();
      expect(erasureResult.confirmationTimestamp).toBeDefined();
      expect(erasureResult.erasureCertificate).toBeDefined();
    });

    it('should verify that data has been completely erased', async () => {
      // TDD RED: Test erasure verification
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      await privata.erasePersonalData(erasureRequest);
      
      // Verify that data is no longer accessible
      const remainingData = await privata.getPersonalData(testDataSubject.id);
      expect(remainingData).toHaveLength(0);
    });

    it('should handle data that cannot be erased due to technical limitations', async () => {
      // TDD RED: Test technical limitation handling
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const erasureResult = await privata.erasePersonalData(erasureRequest, {
        simulateTechnicalLimitations: true
      });
      
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.technicalLimitations).toBeDefined();
      expect(erasureResult.technicalLimitations!.length).toBeGreaterThan(0);
      expect(erasureResult.alternativeMeasures).toBeDefined();
      expect(erasureResult.alternativeMeasures!.length).toBeGreaterThan(0);
    });
  });

  describe('Erasure Validation and Security', () => {
    it('should validate erasure requests before processing', async () => {
      // TDD RED: Test request validation
      const invalidRequest: ErasureRequest = {
        dataSubjectId: 'invalid-id',
        reason: 'withdrawal-of-consent',
        evidence: 'Consent withdrawn',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.erasePersonalData(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Data subject not found');
    });

    it('should require proper evidence for erasure requests', async () => {
      // TDD RED: Test evidence requirement
      const requestWithoutEvidence: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: '',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.erasePersonalData(requestWithoutEvidence);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Evidence is required for erasure');
    });

    it('should validate erasure grounds', async () => {
      // TDD RED: Test ground validation
      const requestWithInvalidGround: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'invalid-ground' as any,
        evidence: 'Invalid ground',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.erasePersonalData(requestWithInvalidGround);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid erasure ground');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent erasure requests', async () => {
      // TDD RED: Test concurrent processing
      const requests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: `concurrent-subject-${index}`,
        reason: 'withdrawal-of-consent' as const,
        evidence: `Concurrent erasure ${index}`,
        scope: 'all-personal-data' as const,
        verificationMethod: 'email-confirmation' as const
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => privata.erasePersonalData(request))
      );
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // 5 seconds
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle large-scale erasure requests efficiently', async () => {
      // TDD RED: Test large-scale erasure
      const largeRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Large-scale erasure request',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation',
        notifyThirdParties: true,
        exceptions: ['legal-obligation', 'public-interest', 'legitimate-interests']
      };
      
      const startTime = Date.now();
      const result = await privata.erasePersonalData(largeRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.erasedDataCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 17 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Compliance test',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.erasePersonalData(erasureRequest);
      
      // Verify all required elements are present
      expect(result.success).toBeDefined();
      expect(result.erasureId).toBeDefined();
      expect(result.processedAt).toBeDefined();
      expect(result.erasedDataCategories).toBeDefined();
      expect(result.verificationCompleted).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.confirmationProvided).toBeDefined();
    });

    it('should provide clear information about erasure process', async () => {
      // TDD RED: Test process transparency
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Transparency test',
        scope: 'all-personal-data',
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.erasePersonalData(erasureRequest);
      
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
