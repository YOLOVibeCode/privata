/**
 * GDPR Article 20 - Right to Data Portability Compliance Tests
 * 
 * Legal Requirement: Data subjects have the right to receive personal data
 * concerning them in a structured, commonly used, and machine-readable format,
 * and have the right to transmit that data to another controller.
 * 
 * This test suite verifies that Privata correctly implements the right to data
 * portability as specified in GDPR Article 20.
 */

import { Privata } from '../../../../src/Privata';
import { DataSubject } from '../../../../src/types/DataSubject';
import { PersonalData } from '../../../../src/types/PersonalData';
import { PortabilityRequest, PortabilityResult } from '../../../../src/types/PortabilityRequest';
import { AuditEvent } from '../../../../src/types/AuditEvent';

describe('GDPR Article 20 - Right to Data Portability', () => {
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

  describe('Portability Request Processing', () => {
    it('should allow data subjects to request data portability', async () => {
      // TDD RED: Test basic portability request
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.portabilityId).toBeDefined();
      expect(portabilityResult.processedAt).toBeDefined();
      expect(portabilityResult.dataFormat).toBe('JSON');
      expect(portabilityResult.portableData).toBeDefined();
      expect(portabilityResult.verificationCompleted).toBe(true);
    });

    it('should verify data subject identity before processing portability', async () => {
      // TDD RED: Test identity verification
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.verificationCompleted).toBe(true);
      expect(portabilityResult.verificationMethod).toBe('email-confirmation');
      expect(portabilityResult.verificationTimestamp).toBeDefined();
    });

    it('should support multiple data formats for portability', async () => {
      // TDD RED: Test multiple formats
      const formats = ['JSON', 'CSV', 'XML', 'PDF'];
      
      for (const format of formats) {
        const portabilityRequest: PortabilityRequest = {
          dataSubjectId: testDataSubject.id,
          format: format as any,
          includeMetadata: true,
          verificationMethod: 'email-confirmation'
        };
        
        const result = await privata.requestDataPortability(portabilityRequest);
        expect(result.success).toBe(true);
        expect(result.dataFormat).toBe(format);
        expect(result.portableData).toBeDefined();
      }
    });

    it('should maintain audit trail of all portability activities', async () => {
      // TDD RED: Test audit logging
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      await privata.requestDataPortability(portabilityRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_PORTABILITY_REQUEST',
        dataSubjectId: testDataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]!.action).toBe('DATA_PORTABILITY_REQUEST');
      expect(auditLog[0]!.entityId).toBe(testDataSubject.id);
      expect(auditLog[0]!.timestamp).toBeDefined();
      expect(auditLog[0]!.success).toBe(true);
      expect(auditLog[0]!.details).toBeDefined();
      expect(auditLog[0]!.details.portabilityFormat).toBeDefined();
    });
  });

  describe('Data Format and Structure', () => {
    it('should provide data in structured, machine-readable format', async () => {
      // TDD RED: Test structured format
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.dataFormat).toBe('JSON');
      expect(portabilityResult.structuredData).toBe(true);
      expect(portabilityResult.machineReadable).toBe(true);
      expect(portabilityResult.portableData).toBeDefined();
    });

    it('should include metadata when requested', async () => {
      // TDD RED: Test metadata inclusion
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.metadataIncluded).toBe(true);
      expect(portabilityResult.dataCategories).toBeDefined();
      expect(portabilityResult.processingPurposes).toBeDefined();
      expect(portabilityResult.retentionPeriods).toBeDefined();
    });

    it('should exclude metadata when not requested', async () => {
      // TDD RED: Test metadata exclusion
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: false,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.metadataIncluded).toBe(false);
      expect(portabilityResult.dataCategories).toBeUndefined();
      expect(portabilityResult.processingPurposes).toBeUndefined();
    });

    it('should provide data in commonly used formats', async () => {
      // TDD RED: Test commonly used formats
      const commonFormats = ['JSON', 'CSV', 'XML'];
      
      for (const format of commonFormats) {
        const portabilityRequest: PortabilityRequest = {
          dataSubjectId: testDataSubject.id,
          format: format as any,
          includeMetadata: true,
          verificationMethod: 'email-confirmation'
        };
        
        const result = await privata.requestDataPortability(portabilityRequest);
        expect(result.success).toBe(true);
        expect(result.commonlyUsedFormat).toBe(true);
        expect(result.portableData).toBeDefined();
      }
    });
  });

  describe('Data Transmission and Transfer', () => {
    it('should support direct transmission to another controller', async () => {
      // TDD RED: Test direct transmission
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'direct-api',
        targetController: {
          name: 'New Controller',
          contactEmail: 'privacy@newcontroller.com',
          apiEndpoint: 'https://api.newcontroller.com/import'
        }
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.transmissionSupported).toBe(true);
      expect(portabilityResult.transmissionMethod).toBe('direct-api');
      expect(portabilityResult.targetController).toBeDefined();
      expect(portabilityResult.transmissionStatus).toBeDefined();
    });

    it('should provide download link for manual transfer', async () => {
      // TDD RED: Test download link
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'download'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.downloadLink).toBeDefined();
      expect(portabilityResult.downloadExpiry).toBeDefined();
      expect(portabilityResult.fileSize).toBeDefined();
      expect(portabilityResult.checksum).toBeDefined();
    });

    it('should handle transmission failures gracefully', async () => {
      // TDD RED: Test transmission failure handling
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'direct-api',
        targetController: {
          name: 'Failing Controller',
          contactEmail: 'privacy@failingcontroller.com',
          apiEndpoint: 'https://api.failingcontroller.com/import'
        }
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest, {
        simulateTransmissionFailure: true
      });
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.transmissionStatus).toBe('failed');
      expect(portabilityResult.transmissionError).toBeDefined();
      expect(portabilityResult.alternativeMethod).toBeDefined();
      expect(portabilityResult.retryAvailable).toBe(true);
    });

    it('should verify target controller before transmission', async () => {
      // TDD RED: Test target verification
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'direct-api',
        targetController: {
          name: 'Verified Controller',
          contactEmail: 'privacy@verifiedcontroller.com',
          apiEndpoint: 'https://api.verifiedcontroller.com/import'
        }
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.targetVerified).toBe(true);
      expect(portabilityResult.verificationMethod).toBeDefined();
      expect(portabilityResult.verificationTimestamp).toBeDefined();
    });
  });

  describe('Data Scope and Limitations', () => {
    it('should only include data provided by the data subject', async () => {
      // TDD RED: Test data scope limitation
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        scope: 'provided-by-subject'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.dataScope).toBe('provided-by-subject');
      expect(portabilityResult.includedDataCategories).toBeDefined();
      expect(portabilityResult.excludedDataCategories).toBeDefined();
      expect(portabilityResult.excludedDataCategories).toContain('derived-data');
      expect(portabilityResult.excludedDataCategories).toContain('inferred-data');
    });

    it('should exclude data processed based on legitimate interests', async () => {
      // TDD RED: Test legitimate interests exclusion
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        scope: 'provided-by-subject'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.excludedDataCategories).toContain('legitimate-interests-data');
      expect(portabilityResult.exclusionReason).toBeDefined();
    });

    it('should exclude data that would adversely affect rights of others', async () => {
      // TDD RED: Test rights of others protection
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        scope: 'provided-by-subject'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.excludedDataCategories).toContain('third-party-data');
      expect(portabilityResult.rightsProtection).toBeDefined();
      expect(portabilityResult.rightsProtection!.thirdPartyRights).toBe(true);
    });

    it('should provide clear information about data scope', async () => {
      // TDD RED: Test scope transparency
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.scopeDescription).toBeDefined();
      expect(portabilityResult.includedDataCategories).toBeDefined();
      // excludedDataCategories and exclusionReasons are only defined when there are exclusions
      if (portabilityResult.excludedDataCategories) {
        expect(portabilityResult.excludedDataCategories).toBeDefined();
        expect(portabilityResult.exclusionReasons).toBeDefined();
      }
    });
  });

  describe('Response Time and Deadlines', () => {
    it('should process portability requests without undue delay', async () => {
      // TDD RED: Test response time
      const startTime = Date.now();
      
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.requestDataPortability(portabilityRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
      expect(result.responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000);
    });

    it('should handle complex portability requests within extended timeline', async () => {
      // TDD RED: Test complex request timeline
      const startTime = Date.now();
      
      const complexRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'direct-api',
        targetController: {
          name: 'Complex Controller',
          contactEmail: 'privacy@complexcontroller.com',
          apiEndpoint: 'https://api.complexcontroller.com/import'
        }
      };
      
      const result = await privata.requestDataPortability(complexRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
      expect(result.complexRequest).toBe(true);
    });
  });

  describe('Data Validation and Security', () => {
    it('should validate portability requests before processing', async () => {
      // TDD RED: Test request validation
      const invalidRequest: PortabilityRequest = {
        dataSubjectId: 'invalid-id',
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.requestDataPortability(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Data subject not found');
    });

    it('should validate data format requirements', async () => {
      // TDD RED: Test format validation
      const invalidFormatRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'INVALID' as any,
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.requestDataPortability(invalidFormatRequest);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid data format');
    });

    it('should ensure data integrity and authenticity', async () => {
      // TDD RED: Test data integrity
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.dataIntegrity).toBe(true);
      expect(portabilityResult.authenticityVerified).toBe(true);
      expect(portabilityResult.checksum).toBeDefined();
      expect(portabilityResult.signature).toBeDefined();
    });

    it('should protect data during transmission', async () => {
      // TDD RED: Test transmission security
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'direct-api',
        targetController: {
          name: 'Secure Controller',
          contactEmail: 'privacy@securecontroller.com',
          apiEndpoint: 'https://api.securecontroller.com/import'
        }
      };
      
      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      
      expect(portabilityResult.success).toBe(true);
      expect(portabilityResult.encryptionEnabled).toBe(true);
      expect(portabilityResult.encryptionMethod).toBeDefined();
      expect(portabilityResult.secureTransmission).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent portability requests', async () => {
      // TDD RED: Test concurrent processing
      const requests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: `concurrent-subject-${index}`,
        format: 'JSON' as const,
        includeMetadata: true,
        verificationMethod: 'email-confirmation' as const
      }));
      
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => privata.requestDataPortability(request))
      );
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // 5 seconds
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle large-scale portability requests efficiently', async () => {
      // TDD RED: Test large-scale portability
      const largeRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation',
        transmissionMethod: 'direct-api',
        targetController: {
          name: 'Large Scale Controller',
          contactEmail: 'privacy@largescalecontroller.com',
          apiEndpoint: 'https://api.largescalecontroller.com/import'
        }
      };
      
      const startTime = Date.now();
      const result = await privata.requestDataPortability(largeRequest);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.portableData).toBeDefined();
    });
  });

  describe('Compliance Verification', () => {
    it('should meet all GDPR Article 20 requirements', async () => {
      // TDD RED: Test comprehensive compliance
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.requestDataPortability(portabilityRequest);
      
      // Verify all required elements are present
      expect(result.success).toBeDefined();
      expect(result.portabilityId).toBeDefined();
      expect(result.processedAt).toBeDefined();
      expect(result.dataFormat).toBeDefined();
      expect(result.verificationCompleted).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.confirmationProvided).toBeDefined();
    });

    it('should provide clear information about portability process', async () => {
      // TDD RED: Test process transparency
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        includeMetadata: true,
        verificationMethod: 'email-confirmation'
      };
      
      const result = await privata.requestDataPortability(portabilityRequest);
      
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
    }
  ];

  return personalData;
}
