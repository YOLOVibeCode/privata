/**
 * HIPAA Compliance Tests - Rule-by-Rule Testing
 * 
 * This test suite verifies that Privata correctly implements HIPAA compliance
 * requirements as specified in the HIPAA Privacy Rule, Security Rule, and
 * Breach Notification Rule.
 */

import { Privata } from '../../../src/Privata';
import { DataSubject } from '../../../src/types/DataSubject';
import { PersonalData } from '../../../src/types/PersonalData';
import { PHIRequest, PHIResult } from '../../../src/types/PHIRequest';
import { AuditEvent } from '../../../src/types/AuditEvent';

describe('HIPAA Compliance - Rule-by-Rule Testing', () => {
  let privata: Privata;
  let testPatient: DataSubject;
  let testPHIData: PersonalData[];

  beforeEach(async () => {
    // Initialize Privata with HIPAA compliance enabled
    privata = new Privata({
      compliance: {
        gdpr: {
          enabled: true,
          dataSubjectRights: true,
          auditLogging: true
        },
        hipaa: {
          enabled: true,
          phiProtection: true,
          breachNotification: true
        }
      }
    });

    await privata.initialize();

    // Create test patient
    testPatient = await createTestPatient();
    
    // Create test PHI data
    testPHIData = await createTestPHIData(testPatient.id);
  });

  afterEach(async () => {
    await privata.cleanup();
  });

  describe('HIPAA Privacy Rule - 45 CFR § 164.502', () => {
    it('should implement minimum necessary standard for PHI access', async () => {
      // TDD RED: Test minimum necessary standard
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.minimumNecessaryApplied).toBe(true);
      expect(phiResult.dataMinimized).toBe(true);
      expect(phiResult.accessLevel).toBe('minimum-necessary');
      expect(phiResult.dataCategories).toBeDefined();
      expect(phiResult.dataCategories!.length).toBeLessThanOrEqual(3); // Limited to essential data
    });

    it('should implement patient authorization requirements', async () => {
      // TDD RED: Test patient authorization
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'disclosure',
        purpose: 'marketing',
        authorizationRequired: true,
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.authorizationRequired).toBe(true);
      expect(phiResult.authorizationValid).toBe(true);
      expect(phiResult.authorizationDetails).toBeDefined();
      expect(phiResult.authorizationExpiry).toBeDefined();
    });

    it('should implement business associate agreements', async () => {
      // TDD RED: Test business associate agreements
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'disclosure',
        purpose: 'business-associate',
        businessAssociate: {
          name: 'Test Business Associate',
          agreementId: 'BAA-123',
          agreementDate: new Date(),
          agreementValid: true,
          contactInformation: 'contact@businessassociate.com',
          servicesProvided: ['data-processing', 'cloud-storage'],
          safeguardsRequired: true,
          complianceObligations: ['HIPAA compliance', 'Data protection']
        },
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.businessAssociateAgreement).toBeDefined();
      expect(phiResult.businessAssociateAgreement!.agreementValid).toBe(true);
      expect(phiResult.businessAssociateAgreement!.safeguardsRequired).toBe(true);
      expect(phiResult.businessAssociateAgreement!.complianceObligations).toBeDefined();
    });

    it('should implement patient rights to access PHI', async () => {
      // TDD RED: Test patient access rights
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'patient-request',
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.patientAccessGranted).toBe(true);
      expect(phiResult.accessFormat).toBeDefined();
      expect(phiResult.accessTimeline).toBeDefined();
      expect(phiResult.accessFees).toBeDefined();
      expect(phiResult.accessDenialReasons).toBeUndefined();
    });

    it('should implement patient rights to amend PHI', async () => {
      // TDD RED: Test patient amendment rights
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'amendment',
        purpose: 'patient-request',
        amendmentDetails: {
          field: 'address',
          currentValue: '123 Old Street',
          requestedValue: '456 New Street',
          reason: 'Patient moved'
        },
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.amendmentProcessed).toBe(true);
      expect(phiResult.amendmentStatus).toBeDefined();
      expect(phiResult.amendmentTimeline).toBeDefined();
      expect(phiResult.amendmentNotification).toBeDefined();
    });

    it('should implement patient rights to restrict PHI use', async () => {
      // TDD RED: Test patient restriction rights
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'restriction',
        purpose: 'patient-request',
        restrictionDetails: {
          restrictedUses: ['marketing', 'research'],
          restrictedDisclosures: ['family-members'],
          reason: 'Patient privacy concerns',
          scope: 'specific'
        },
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.restrictionProcessed).toBe(true);
      expect(phiResult.restrictionStatus).toBeDefined();
      expect(phiResult.restrictionScope).toBeDefined();
      expect(phiResult.restrictionEnforcement).toBeDefined();
    });

    it('should implement patient rights to confidential communications', async () => {
      // TDD RED: Test confidential communications
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'confidential-communication',
        purpose: 'patient-request',
        communicationDetails: {
          preferredMethod: 'secure-email',
          alternativeAddress: 'secure@patient.com',
          reason: 'Privacy concerns'
        },
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.confidentialCommunicationProcessed).toBe(true);
      expect(phiResult.communicationMethod).toBeDefined();
      expect(phiResult.communicationSecurity).toBeDefined();
      expect(phiResult.communicationEnforcement).toBeDefined();
    });
  });

  describe('HIPAA Security Rule - 45 CFR § 164.308', () => {
    it('should implement administrative safeguards', async () => {
      // TDD RED: Test administrative safeguards
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.administrativeSafeguards).toBeDefined();
      expect(phiResult.administrativeSafeguards!.securityOfficer).toBeDefined();
      expect(phiResult.administrativeSafeguards!.workforceTraining).toBeDefined();
      expect(phiResult.administrativeSafeguards!.accessManagement).toBeDefined();
      expect(phiResult.administrativeSafeguards!.auditControls).toBeDefined();
    });

    it('should implement physical safeguards', async () => {
      // TDD RED: Test physical safeguards
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.physicalSafeguards).toBeDefined();
      expect(phiResult.physicalSafeguards!.facilityAccess).toBeDefined();
      expect(phiResult.physicalSafeguards!.workstationUse).toBeDefined();
      expect(phiResult.physicalSafeguards!.deviceControls).toBeDefined();
      expect(phiResult.physicalSafeguards!.mediaControls).toBeDefined();
    });

    it('should implement technical safeguards', async () => {
      // TDD RED: Test technical safeguards
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.technicalSafeguards).toBeDefined();
      expect(phiResult.technicalSafeguards!.accessControl).toBeDefined();
      expect(phiResult.technicalSafeguards!.auditControls).toBeDefined();
      expect(phiResult.technicalSafeguards!.integrity).toBeDefined();
      expect(phiResult.technicalSafeguards!.transmissionSecurity).toBeDefined();
    });

    it('should implement encryption requirements', async () => {
      // TDD RED: Test encryption requirements
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.encryptionApplied).toBe(true);
      expect(phiResult.encryptionMethod).toBeDefined();
      expect(phiResult.encryptionStrength).toBeDefined();
      expect(phiResult.encryptionCompliance).toBe(true);
    });

    it('should implement access controls', async () => {
      // TDD RED: Test access controls
      const phiRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        verificationMethod: 'identity-verification'
      };
      
      const phiResult = await privata.processPHIRequest(phiRequest);
      
      expect(phiResult.success).toBe(true);
      expect(phiResult.accessControls).toBeDefined();
      expect(phiResult.accessControls!.userAuthentication).toBeDefined();
      expect(phiResult.accessControls!.roleBasedAccess).toBeDefined();
      expect(phiResult.accessControls!.accessLogging).toBeDefined();
      expect(phiResult.accessControls!.accessMonitoring).toBeDefined();
    });
  });

  describe('HIPAA Breach Notification Rule - 45 CFR § 164.400', () => {
    it('should implement breach detection and assessment', async () => {
      // TDD RED: Test breach detection
      const breachEvent = {
        patientId: testPatient.id,
        breachType: 'unauthorized-access',
        breachDescription: 'Unauthorized access to patient records',
        breachDate: new Date(),
        affectedRecords: 1,
        riskAssessment: 'low',
        discoveredBy: 'Security Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        notificationStatus: 'pending'
      };
      
      const breachResult = await privata.processBreachNotification(breachEvent);
      
      expect(breachResult.success).toBe(true);
      expect(breachResult.breachDetected).toBe(true);
      expect(breachResult.riskAssessment).toBeDefined();
      expect(breachResult.breachClassification).toBeDefined();
      expect(breachResult.notificationRequired).toBeDefined();
    });

    it('should implement patient notification requirements', async () => {
      // TDD RED: Test patient notification
      const breachEvent = {
        patientId: testPatient.id,
        breachType: 'unauthorized-access',
        breachDescription: 'Unauthorized access to patient records',
        breachDate: new Date(),
        affectedRecords: 1,
        riskAssessment: 'high',
        discoveredBy: 'Security Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        notificationStatus: 'pending'
      };
      
      const breachResult = await privata.processBreachNotification(breachEvent);
      
      expect(breachResult.success).toBe(true);
      expect(breachResult.patientNotificationRequired).toBe(true);
      expect(breachResult.patientNotificationTimeline).toBeDefined();
      expect(breachResult.patientNotificationMethod).toBeDefined();
      expect(breachResult.patientNotificationContent).toBeDefined();
    });

    it('should implement HHS notification requirements', async () => {
      // TDD RED: Test HHS notification
      const breachEvent = {
        patientId: testPatient.id,
        breachType: 'unauthorized-access',
        breachDescription: 'Unauthorized access to patient records',
        breachDate: new Date(),
        affectedRecords: 500, // Above threshold
        riskAssessment: 'high',
        discoveredBy: 'Security Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        notificationStatus: 'pending'
      };
      
      const breachResult = await privata.processBreachNotification(breachEvent);
      
      expect(breachResult.success).toBe(true);
      expect(breachResult.hhsNotificationRequired).toBe(true);
      expect(breachResult.hhsNotificationTimeline).toBeDefined();
      expect(breachResult.hhsNotificationMethod).toBeDefined();
      expect(breachResult.hhsNotificationContent).toBeDefined();
    });

    it('should implement media notification requirements', async () => {
      // TDD RED: Test media notification
      const breachEvent = {
        patientId: testPatient.id,
        breachType: 'unauthorized-access',
        breachDescription: 'Unauthorized access to patient records',
        breachDate: new Date(),
        affectedRecords: 500, // Above threshold
        riskAssessment: 'high',
        discoveredBy: 'Security Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        notificationStatus: 'pending'
      };
      
      const breachResult = await privata.processBreachNotification(breachEvent);
      
      expect(breachResult.success).toBe(true);
      expect(breachResult.mediaNotificationRequired).toBeDefined();
      expect(breachResult.mediaNotificationTimeline).toBeDefined();
      expect(breachResult.mediaNotificationMethod).toBeDefined();
      expect(breachResult.mediaNotificationContent).toBeDefined();
    });

    it('should implement breach documentation requirements', async () => {
      // TDD RED: Test breach documentation
      const breachEvent = {
        patientId: testPatient.id,
        breachType: 'unauthorized-access',
        breachDescription: 'Unauthorized access to patient records',
        breachDate: new Date(),
        affectedRecords: 1,
        riskAssessment: 'low',
        discoveredBy: 'Security Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        notificationStatus: 'pending'
      };
      
      const breachResult = await privata.processBreachNotification(breachEvent);
      
      expect(breachResult.success).toBe(true);
      expect(breachResult.breachDocumentation).toBeDefined();
      expect(breachResult.breachDocumentation!.incidentReport).toBeDefined();
      expect(breachResult.breachDocumentation!.investigationReport).toBeDefined();
      expect(breachResult.breachDocumentation!.remediationPlan).toBeDefined();
      expect(breachResult.breachDocumentation!.retentionPeriod).toBeDefined();
    });
  });

  describe('HIPAA Enforcement Rule - 45 CFR § 160.300', () => {
    it('should implement compliance monitoring', async () => {
      // TDD RED: Test compliance monitoring
      const complianceCheck = await privata.performHIPAAComplianceCheck();
      
      expect(complianceCheck.success).toBe(true);
      expect(complianceCheck.complianceStatus).toBeDefined();
      expect(complianceCheck.complianceScore).toBeDefined();
      expect(complianceCheck.complianceIssues).toBeDefined();
      expect(complianceCheck.recommendations).toBeDefined();
      expect(complianceCheck.nextReviewDate).toBeDefined();
    });

    it('should implement violation reporting', async () => {
      // TDD RED: Test violation reporting
      const violation = {
        patientId: testPatient.id,
        violationType: 'unauthorized-disclosure',
        violationDescription: 'Unauthorized disclosure of PHI',
        violationDate: new Date(),
        severity: 'high' as const,
        discoveredBy: 'Compliance Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        remediationStatus: 'pending'
      };
      
      const violationResult = await privata.reportHIPAAViolation(violation);
      
      expect(violationResult.success).toBe(true);
      expect(violationResult.violationReported).toBe(true);
      expect(violationResult.reportingTimeline).toBeDefined();
      expect(violationResult.reportingMethod).toBeDefined();
      expect(violationResult.reportingContent).toBeDefined();
    });

    it('should implement corrective action plans', async () => {
      // TDD RED: Test corrective action plans
      const violation = {
        patientId: testPatient.id,
        violationType: 'unauthorized-disclosure',
        violationDescription: 'Unauthorized disclosure of PHI',
        violationDate: new Date(),
        severity: 'high' as const,
        discoveredBy: 'Compliance Team',
        discoveryDate: new Date(),
        investigationStatus: 'ongoing',
        remediationStatus: 'pending'
      };
      
      const violationResult = await privata.reportHIPAAViolation(violation);
      
      expect(violationResult.success).toBe(true);
      expect(violationResult.correctiveActionPlan).toBeDefined();
      expect(violationResult.correctiveActionPlan!.actionItems).toBeDefined();
      expect(violationResult.correctiveActionPlan!.timeline).toBeDefined();
      expect(violationResult.correctiveActionPlan!.responsibilities).toBeDefined();
      expect(violationResult.correctiveActionPlan!.monitoring).toBeDefined();
    });
  });

  describe('HIPAA Patient Rights - 45 CFR § 164.520', () => {
    it('should implement notice of privacy practices', async () => {
      // TDD RED: Test notice of privacy practices
      const noticeRequest = {
        patientId: testPatient.id,
        requestType: 'privacy-notice',
        language: 'en',
        format: 'electronic'
      };
      
      const noticeResult = await privata.providePrivacyNotice(noticeRequest);
      
      expect(noticeResult.success).toBe(true);
      expect(noticeResult.privacyNotice).toBeDefined();
      expect(noticeResult.privacyNotice!.content).toBeDefined();
      expect(noticeResult.privacyNotice!.effectiveDate).toBeDefined();
      expect(noticeResult.privacyNotice!.acknowledgmentRequired).toBeDefined();
    });

    it('should implement patient complaint procedures', async () => {
      // TDD RED: Test complaint procedures
      const complaint = {
        patientId: testPatient.id,
        complaintType: 'privacy-violation',
        complaintDescription: 'Unauthorized access to medical records',
        complaintDate: new Date()
      };
      
      const complaintResult = await privata.processPatientComplaint(complaint);
      
      expect(complaintResult.success).toBe(true);
      expect(complaintResult.complaintProcessed).toBe(true);
      expect(complaintResult.complaintNumber).toBeDefined();
      expect(complaintResult.investigationTimeline).toBeDefined();
      expect(complaintResult.responseTimeline).toBeDefined();
    });

    it('should implement patient access to PHI', async () => {
      // TDD RED: Test patient access
      const accessRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        format: 'electronic',
        verificationMethod: 'identity-verification'
      };
      
      const accessResult = await privata.processPatientAccessRequest(accessRequest);
      
      expect(accessResult.success).toBe(true);
      expect(accessResult.accessGranted).toBe(true);
      expect(accessResult.accessFormat).toBeDefined();
      expect(accessResult.accessTimeline).toBeDefined();
      expect(accessResult.accessFees).toBeDefined();
    });

    it('should implement patient amendment requests', async () => {
      // TDD RED: Test amendment requests
      const amendmentRequest = {
        patientId: testPatient.id,
        requestType: 'amendment',
        amendmentDetails: {
          field: 'address',
          currentValue: '123 Old Street',
          requestedValue: '456 New Street',
          reason: 'Patient moved'
        },
        verificationMethod: 'identity-verification'
      };
      
      const amendmentResult = await privata.processPatientAmendmentRequest(amendmentRequest);
      
      expect(amendmentResult.success).toBe(true);
      expect(amendmentResult.amendmentProcessed).toBe(true);
      expect(amendmentResult.amendmentStatus).toBeDefined();
      expect(amendmentResult.amendmentTimeline).toBeDefined();
      expect(amendmentResult.amendmentNotification).toBeDefined();
    });
  });

  describe('HIPAA Data Integrity and Security', () => {
    it('should implement data integrity controls', async () => {
      // TDD RED: Test data integrity
      const integrityCheck = await privata.performDataIntegrityCheck(testPatient.id);
      
      expect(integrityCheck.success).toBe(true);
      expect(integrityCheck.dataIntegrity).toBe(true);
      expect(integrityCheck.checksumValidation).toBe(true);
      expect(integrityCheck.auditTrail).toBeDefined();
      expect(integrityCheck.integrityViolations).toBeDefined();
    });

    it('should implement data backup and recovery', async () => {
      // TDD RED: Test backup and recovery
      const backupRequest = {
        patientId: testPatient.id,
        backupType: 'full',
        backupLocation: 'secure-storage',
        encryptionRequired: true
      };
      
      const backupResult = await privata.performDataBackup(backupRequest);
      
      expect(backupResult.success).toBe(true);
      expect(backupResult.backupCompleted).toBe(true);
      expect(backupResult.backupLocation).toBeDefined();
      expect(backupResult.backupEncryption).toBe(true);
      expect(backupResult.backupVerification).toBe(true);
    });

    it('should implement secure data transmission', async () => {
      // TDD RED: Test secure transmission
      const transmissionRequest = {
        patientId: testPatient.id,
        transmissionType: 'secure-email',
        recipient: 'doctor@hospital.com',
        encryptionRequired: true
      };
      
      const transmissionResult = await privata.performSecureTransmission(transmissionRequest);
      
      expect(transmissionResult.success).toBe(true);
      expect(transmissionResult.transmissionSecured).toBe(true);
      expect(transmissionResult.encryptionApplied).toBe(true);
      expect(transmissionResult.transmissionLog).toBeDefined();
      expect(transmissionResult.recipientVerification).toBe(true);
    });
  });

  describe('HIPAA Compliance Monitoring and Reporting', () => {
    it('should implement continuous compliance monitoring', async () => {
      // TDD RED: Test continuous monitoring
      const monitoringResult = await privata.performContinuousComplianceMonitoring();
      
      expect(monitoringResult.success).toBe(true);
      expect(monitoringResult.monitoringActive).toBe(true);
      expect(monitoringResult.complianceMetrics).toBeDefined();
      expect(monitoringResult.alertThresholds).toBeDefined();
      expect(monitoringResult.reportingFrequency).toBeDefined();
    });

    it('should implement compliance reporting', async () => {
      // TDD RED: Test compliance reporting
      const reportRequest = {
        reportType: 'annual-compliance',
        reportPeriod: '2024',
        reportFormat: 'electronic'
      };
      
      const reportResult = await privata.generateComplianceReport(reportRequest);
      
      expect(reportResult.success).toBe(true);
      expect(reportResult.reportGenerated).toBe(true);
      expect(reportResult.reportContent).toBeDefined();
      expect(reportResult.reportFormat).toBeDefined();
      expect(reportResult.reportDelivery).toBeDefined();
    });

    it('should implement audit trail requirements', async () => {
      // TDD RED: Test audit trail
      const auditRequest = {
        patientId: testPatient.id,
        auditPeriod: '30-days',
        auditType: 'access-audit'
      };
      
      const auditResult = await privata.generateAuditTrail(auditRequest);
      
      expect(auditResult.success).toBe(true);
      expect(auditResult.auditTrailGenerated).toBe(true);
      expect(auditResult.auditEvents).toBeDefined();
      expect(auditResult.auditCompliance).toBe(true);
      expect(auditResult.auditRetention).toBeDefined();
    });
  });
});

// Helper functions for test setup
async function createTestPatient(): Promise<DataSubject> {
  const patient: DataSubject = {
    id: `patient-${Date.now()}`,
    email: 'patient@example.com',
    name: 'Test Patient',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return patient;
}

async function createTestPHIData(patientId: string): Promise<PersonalData[]> {
  const phiData: PersonalData[] = [
    {
      id: `phi-1-${Date.now()}`,
      dataSubjectId: patientId,
      category: 'medical-history',
      fields: {
        diagnosis: 'Hypertension',
        treatment: 'Medication',
        provider: 'Dr. Smith',
        dateOfService: '2024-01-15'
      },
      source: {
        type: 'system-generated',
        timestamp: new Date(),
        method: 'clinical-entry'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    },
    {
      id: `phi-2-${Date.now()}`,
      dataSubjectId: patientId,
      category: 'demographic',
      fields: {
        dateOfBirth: '1980-01-01',
        address: '123 Medical Street',
        phone: '+1234567890',
        emergencyContact: 'Jane Doe'
      },
      source: {
        type: 'user-input',
        timestamp: new Date(),
        method: 'patient-input'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    },
    {
      id: `phi-3-${Date.now()}`,
      dataSubjectId: patientId,
      category: 'insurance',
      fields: {
        insuranceProvider: 'Health Insurance Co',
        policyNumber: 'POL123456',
        groupNumber: 'GRP789',
        coverageType: 'PPO'
      },
      source: {
        type: 'third-party',
        timestamp: new Date(),
        method: 'electronic-verification'
      },
      lastUpdated: new Date(),
      accuracy: 'verified'
    }
  ];

  return phiData;
}
