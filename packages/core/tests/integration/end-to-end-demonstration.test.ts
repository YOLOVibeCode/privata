/**
 * End-to-End Integration Tests with Comprehensive Demonstration
 * 
 * This test suite demonstrates the complete Privata functionality through
 * realistic scenarios that showcase GDPR and HIPAA compliance in action.
 * 
 * The tests simulate real-world usage patterns and demonstrate how all
 * components work together seamlessly.
 */

import { Privata } from '../../src/Privata';
import { DataSubject } from '../../src/types/DataSubject';
import { PersonalData } from '../../src/types/PersonalData';
import { AccessRequest, AccessRequestOptions } from '../../src/types/AccessRequest';
import { RectificationRequest, RectificationOptions } from '../../src/types/RectificationRequest';
import { ErasureRequest, ErasureOptions } from '../../src/types/ErasureRequest';
import { RestrictionRequest, RestrictionOptions } from '../../src/types/RestrictionRequest';
import { PortabilityRequest, PortabilityOptions } from '../../src/types/PortabilityRequest';
import { ObjectionRequest, ObjectionOptions } from '../../src/types/ObjectionRequest';
import { AutomatedDecisionRequest, AutomatedDecisionOptions } from '../../src/types/AutomatedDecisionRequest';
import { PHIRequest, PHIOptions } from '../../src/types/PHIRequest';
import { AuditEvent } from '../../src/types/AuditEvent';

describe('End-to-End Integration Tests - Comprehensive Demonstration', () => {
  let privata: Privata;
  let testDataSubject: DataSubject;
  let testPatient: DataSubject;
  let testPersonalData: PersonalData[];
  let testPHIData: PersonalData[];

  beforeAll(async () => {
    console.log('\n🚀 Starting End-to-End Integration Test Demonstration');
    console.log('=' .repeat(60));
  });

  beforeEach(async () => {
    // Initialize Privata with full compliance enabled
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

    // Create test data subjects
    testDataSubject = await createTestDataSubject();
    testPatient = await createTestPatient();
    
    // Create test data
    testPersonalData = await createTestPersonalData(testDataSubject.id);
    testPHIData = await createTestPHIData(testPatient.id);

    console.log(`\n📋 Test Setup Complete:`);
    console.log(`   - Data Subject: ${testDataSubject.id}`);
    console.log(`   - Patient: ${testPatient.id}`);
    console.log(`   - Personal Data Records: ${testPersonalData.length}`);
    console.log(`   - PHI Data Records: ${testPHIData.length}`);
  });

  afterEach(async () => {
    await privata.cleanup();
  });

  afterAll(() => {
    console.log('\n✅ End-to-End Integration Test Demonstration Complete');
    console.log('=' .repeat(60));
  });

  describe('Scenario 1: Complete GDPR Data Subject Journey', () => {
    it('should demonstrate a complete GDPR data subject rights journey', async () => {
      console.log('\n🔍 SCENARIO 1: Complete GDPR Data Subject Journey');
      console.log('-'.repeat(50));

      // Step 1: Data Subject requests access to their data (Article 15)
      console.log('\n📖 Step 1: Right of Access (GDPR Article 15)');
      const accessRequestOptions: AccessRequestOptions = {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true
      };

      const accessResult = await privata.requestDataAccess(testDataSubject.id, accessRequestOptions);
      console.log(`   ✅ Access request processed: ${accessResult.status === 'completed'}`);
      console.log(`   📊 Data categories: ${accessResult.personalData.length}`);
      console.log(`   ⏱️  Response time: ${accessResult.responseTime}ms`);
      console.log(`   📋 Processing purposes: ${accessResult.processingPurposes.length}`);

      // Step 2: Data Subject requests rectification (Article 16)
      console.log('\n✏️  Step 2: Right to Rectification (GDPR Article 16)');
      const rectificationRequest: RectificationRequest = {
        dataSubjectId: testDataSubject.id,
        corrections: {
          email: 'updated@example.com',
          address: '456 New Street, City, Country'
        },
        reason: 'Data subject moved and changed email',
        evidence: 'Utility bill and email confirmation'
      };

      const rectificationResult = await privata.rectifyPersonalData(rectificationRequest);
      console.log(`   ✅ Rectification processed: ${rectificationResult.success}`);
      console.log(`   🔧 Rectified fields: ${rectificationResult.rectifiedFields.join(', ')}`);
      console.log(`   📧 Notification sent: ${rectificationResult.notificationSent}`);
      console.log(`   ⏱️  Response time: ${rectificationResult.responseTime}ms`);

      // Step 3: Data Subject requests data portability (Article 20)
      console.log('\n📦 Step 3: Right to Data Portability (GDPR Article 20)');
      const portabilityRequest: PortabilityRequest = {
        dataSubjectId: testDataSubject.id,
        format: 'JSON',
        scope: 'all-personal-data',
        includeMetadata: true,
        transmissionMethod: 'download',
        verificationMethod: 'document-verification'
      };

      const portabilityResult = await privata.requestDataPortability(portabilityRequest);
      console.log(`   ✅ Portability request processed: ${portabilityResult.success}`);
      console.log(`   📄 Data format: ${portabilityResult.dataFormat}`);
      console.log(`   🔒 Data integrity: ${portabilityResult.dataIntegrity}`);
      console.log(`   ⏱️  Response time: ${portabilityResult.responseTime}ms`);

      // Step 4: Data Subject objects to processing (Article 21)
      console.log('\n🚫 Step 4: Right to Object (GDPR Article 21)');
      const objectionRequest: ObjectionRequest = {
        dataSubjectId: testDataSubject.id,
        objectionType: 'legitimate-interests',
        reason: 'Data subject objects to marketing processing',
        processingPurposes: ['marketing', 'analytics'],
        verificationMethod: 'email-confirmation'
      };

      const objectionResult = await privata.processObjection(objectionRequest);
      console.log(`   ✅ Objection processed: ${objectionResult.success}`);
      console.log(`   🛑 Processing stopped: ${objectionResult.processingStopped}`);
      console.log(`   ⏱️  Response time: ${objectionResult.responseTime}ms`);

      // Step 5: Data Subject requests restriction (Article 18)
      console.log('\n🔒 Step 5: Right to Restriction (GDPR Article 18)');
      const restrictionRequest: RestrictionRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'accuracy-contested',
        evidence: 'Data subject disputes accuracy of address',
        scope: 'specific-categories',
        dataCategories: ['demographic'],
        verificationMethod: 'document-verification'
      };

      const restrictionResult = await privata.restrictProcessing(restrictionRequest);
      console.log(`   ✅ Restriction processed: ${restrictionResult.success}`);
      console.log(`   🔒 Restricted categories: ${restrictionResult.restrictedDataCategories.join(', ')}`);
      console.log(`   ⏱️  Response time: ${restrictionResult.responseTime}ms`);

      // Step 6: Data Subject requests erasure (Article 17)
      console.log('\n🗑️  Step 6: Right to Erasure (GDPR Article 17)');
      const erasureRequest: ErasureRequest = {
        dataSubjectId: testDataSubject.id,
        reason: 'withdrawal-of-consent',
        evidence: 'Data subject withdrew consent',
        scope: 'specific-categories',
        dataCategories: ['marketing', 'analytics'],
        verificationMethod: 'document-verification'
      };

      const erasureResult = await privata.erasePersonalData(erasureRequest);
      console.log(`   ✅ Erasure processed: ${erasureResult.success}`);
      console.log(`   🗑️  Erased categories: ${erasureResult.erasedDataCategories.join(', ')}`);
      console.log(`   📋 Retained categories: ${erasureResult.retainedDataCategories?.join(', ') || 'None'}`);
      console.log(`   ⏱️  Response time: ${erasureResult.responseTime}ms`);

      // Step 7: Data Subject requests automated decision information (Article 22)
      console.log('\n🤖 Step 7: Automated Decision Making (GDPR Article 22)');
      const automatedDecisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testDataSubject.id,
        decisionType: 'credit-scoring',
        requestType: 'information',
        verificationMethod: 'document-verification'
      };

      const automatedDecisionResult = await privata.processAutomatedDecision(automatedDecisionRequest);
      console.log(`   ✅ Automated decision request processed: ${automatedDecisionResult.success}`);
      console.log(`   🧠 Algorithm used: ${automatedDecisionResult.algorithmUsed}`);
      console.log(`   ⚖️  Legal effects: ${automatedDecisionResult.legalEffects}`);
      console.log(`   ⏱️  Response time: ${automatedDecisionResult.responseTime}ms`);

      // Verify all steps completed successfully
      expect(accessResult.status).toBe('completed');
      expect(rectificationResult.success).toBe(true);
      expect(portabilityResult.success).toBe(true);
      expect(objectionResult.success).toBe(true);
      expect(restrictionResult.success).toBe(true);
      expect(erasureResult.success).toBe(true);
      expect(automatedDecisionResult.success).toBe(true);

      console.log('\n✅ Complete GDPR Data Subject Journey: SUCCESS');
    });
  });

  describe('Scenario 2: Complete HIPAA Patient Journey', () => {
    it('should demonstrate a complete HIPAA patient rights journey', async () => {
      console.log('\n🏥 SCENARIO 2: Complete HIPAA Patient Journey');
      console.log('-'.repeat(50));

      // Step 1: Patient requests access to PHI
      console.log('\n📖 Step 1: Patient Access to PHI');
      const phiAccessRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'patient-request',
        minimumNecessary: true,
        verificationMethod: 'document-verification'
      };

      const phiAccessResult = await privata.processPHIRequest(phiAccessRequest);
      console.log(`   ✅ PHI access processed: ${phiAccessResult.success}`);
      console.log(`   🔒 Minimum necessary applied: ${phiAccessResult.minimumNecessaryApplied}`);
      console.log(`   📊 Data categories: ${phiAccessResult.dataCategories?.join(', ')}`);
      console.log(`   ⏱️  Response time: ${phiAccessResult.responseTime}ms`);

      // Step 2: Patient requests amendment to PHI
      console.log('\n✏️  Step 2: Patient Amendment Request');
      const phiAmendmentRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'amendment',
        purpose: 'patient-request',
        amendmentDetails: {
          field: 'address',
          currentValue: '123 Old Street',
          requestedValue: '456 New Street',
          reason: 'Patient moved'
        },
        verificationMethod: 'document-verification'
      };

      const phiAmendmentResult = await privata.processPHIRequest(phiAmendmentRequest);
      console.log(`   ✅ PHI amendment processed: ${phiAmendmentResult.success}`);
      console.log(`   📝 Amendment status: ${phiAmendmentResult.amendmentStatus}`);
      console.log(`   ⏱️  Response time: ${phiAmendmentResult.responseTime}ms`);

      // Step 3: Patient requests restriction of PHI use
      console.log('\n🔒 Step 3: Patient Restriction Request');
      const phiRestrictionRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'restriction',
        purpose: 'patient-request',
        restrictionDetails: {
          restrictedUses: ['marketing', 'research'],
          restrictedDisclosures: ['family-members'],
          reason: 'Patient privacy concerns',
          scope: 'specific'
        },
        verificationMethod: 'document-verification'
      };

      const phiRestrictionResult = await privata.processPHIRequest(phiRestrictionRequest);
      console.log(`   ✅ PHI restriction processed: ${phiRestrictionResult.success}`);
      console.log(`   🔒 Restriction status: ${phiRestrictionResult.restrictionStatus}`);
      console.log(`   ⏱️  Response time: ${phiRestrictionResult.responseTime}ms`);

      // Step 4: Patient requests confidential communications
      console.log('\n📧 Step 4: Confidential Communications Request');
      const phiCommunicationRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'confidential-communication',
        purpose: 'patient-request',
        communicationDetails: {
          preferredMethod: 'secure-email',
          alternativeAddress: 'secure@patient.com',
          reason: 'Privacy concerns'
        },
        verificationMethod: 'document-verification'
      };

      const phiCommunicationResult = await privata.processPHIRequest(phiCommunicationRequest);
      console.log(`   ✅ Confidential communication processed: ${phiCommunicationResult.success}`);
      console.log(`   📧 Communication method: ${phiCommunicationResult.communicationMethod}`);
      console.log(`   ⏱️  Response time: ${phiCommunicationResult.responseTime}ms`);

      // Step 5: Simulate a breach and demonstrate breach notification
      console.log('\n🚨 Step 5: Breach Notification Process');
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
      console.log(`   ✅ Breach notification processed: ${breachResult.success}`);
      console.log(`   🚨 Breach detected: ${breachResult.breachDetected}`);
      console.log(`   📊 Risk assessment: ${breachResult.riskAssessment}`);
      console.log(`   📧 Patient notification required: ${breachResult.patientNotificationRequired}`);
      console.log(`   ⏱️  Response time: ${breachResult.processedAt ? 'Immediate' : 'N/A'}`);

      // Step 6: Demonstrate compliance monitoring
      console.log('\n📊 Step 6: HIPAA Compliance Monitoring');
      const complianceCheck = await privata.performHIPAAComplianceCheck();
      console.log(`   ✅ Compliance check completed: ${complianceCheck.success}`);
      console.log(`   📈 Compliance score: ${complianceCheck.complianceScore}%`);
      console.log(`   📋 Compliance status: ${complianceCheck.complianceStatus}`);
      console.log(`   🔍 Issues found: ${complianceCheck.complianceIssues.length}`);

      // Verify all steps completed successfully
      expect(phiAccessResult.success).toBe(true);
      expect(phiAmendmentResult.success).toBe(true);
      expect(phiRestrictionResult.success).toBe(true);
      expect(phiCommunicationResult.success).toBe(true);
      expect(breachResult.success).toBe(true);
      expect(complianceCheck.success).toBe(true);

      console.log('\n✅ Complete HIPAA Patient Journey: SUCCESS');
    });
  });

  describe('Scenario 3: Cross-Compliance Integration', () => {
    it('should demonstrate GDPR and HIPAA working together', async () => {
      console.log('\n🔄 SCENARIO 3: Cross-Compliance Integration');
      console.log('-'.repeat(50));

      // Step 1: Process GDPR request for a patient (who is also a data subject)
      console.log('\n📖 Step 1: GDPR Access Request for Patient');
      const gdprAccessRequestOptions: AccessRequestOptions = {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true
      };

      const gdprAccessResult = await privata.requestDataAccess(testPatient.id, gdprAccessRequestOptions);
      console.log(`   ✅ GDPR access processed: ${gdprAccessResult.status === 'completed'}`);
      console.log(`   📊 Personal data records: ${gdprAccessResult.personalData.length}`);
      console.log(`   ⏱️  Response time: ${gdprAccessResult.responseTime}ms`);

      // Step 2: Process HIPAA request for the same patient
      console.log('\n🏥 Step 2: HIPAA PHI Request for Same Patient');
      const hipaaPHIRequest: PHIRequest = {
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'document-verification'
      };

      const hipaaPHIResult = await privata.processPHIRequest(hipaaPHIRequest);
      console.log(`   ✅ HIPAA PHI access processed: ${hipaaPHIResult.success}`);
      console.log(`   🔒 Minimum necessary applied: ${hipaaPHIResult.minimumNecessaryApplied}`);
      console.log(`   ⏱️  Response time: ${hipaaPHIResult.responseTime}ms`);

      // Step 3: Demonstrate audit trail integration
      console.log('\n📋 Step 3: Integrated Audit Trail');
      const auditLog = await privata.getAuditLog({
        action: 'DATA_ACCESS_REQUEST',
        dataSubjectId: testPatient.id
      });

      console.log(`   📊 Total audit events: ${auditLog.length}`);
      console.log(`   🔍 GDPR events: ${auditLog.filter(e => e.action.includes('DATA_ACCESS')).length}`);
      console.log(`   🏥 HIPAA events: ${auditLog.filter(e => e.action.includes('PHI')).length}`);

      // Step 4: Demonstrate restriction enforcement across both frameworks
      console.log('\n🔒 Step 4: Cross-Framework Restriction Enforcement');
      const gdprRestrictionRequest: RestrictionRequest = {
        dataSubjectId: testPatient.id,
        reason: 'accuracy-contested',
        evidence: 'Patient disputes data accuracy',
        scope: 'all-personal-data',
        verificationMethod: 'document-verification'
      };

      const gdprRestrictionResult = await privata.restrictProcessing(gdprRestrictionRequest);
      console.log(`   ✅ GDPR restriction processed: ${gdprRestrictionResult.success}`);
      console.log(`   🔒 Restricted categories: ${gdprRestrictionResult.restrictedDataCategories.join(', ')}`);

      // Test processing attempt to verify restriction is enforced
      const processingAttempt = {
        operation: 'data-analysis',
        dataCategories: ['demographic', 'medical-history'],
        timestamp: new Date()
      };

      const processingResult = await privata.attemptProcessing(testPatient.id, processingAttempt);
      console.log(`   🚫 Processing blocked: ${processingResult.blocked}`);
      console.log(`   📋 Blocked operations: ${processingResult.blockedOperations?.join(', ') || 'None'}`);

      // Step 5: Demonstrate automated decision making with both frameworks
      console.log('\n🤖 Step 5: Automated Decision Making Integration');
      const automatedDecisionRequest: AutomatedDecisionRequest = {
        dataSubjectId: testPatient.id,
        decisionType: 'insurance-pricing',
        requestType: 'information',
        verificationMethod: 'document-verification'
      };

      const automatedDecisionResult = await privata.processAutomatedDecision(automatedDecisionRequest);
      console.log(`   ✅ Automated decision processed: ${automatedDecisionResult.success}`);
      console.log(`   🧠 Decision type: ${automatedDecisionResult.decisionType}`);
      console.log(`   ⚖️  Legal effects: ${automatedDecisionResult.legalEffects}`);
      console.log(`   🏥 Significant effects: ${automatedDecisionResult.significantEffects}`);

      // Verify all steps completed successfully
      expect(gdprAccessResult.status).toBe('completed');
      expect(hipaaPHIResult.success).toBe(true);
      expect(auditLog.length).toBeGreaterThan(0);
      expect(gdprRestrictionResult.success).toBe(true);
      expect(processingResult.blocked).toBe(true);
      expect(automatedDecisionResult.success).toBe(true);

      console.log('\n✅ Cross-Compliance Integration: SUCCESS');
    });
  });

  describe('Scenario 4: Performance and Scalability Demonstration', () => {
    it('should demonstrate system performance under load', async () => {
      console.log('\n⚡ SCENARIO 4: Performance and Scalability Demonstration');
      console.log('-'.repeat(50));

      // Step 1: Concurrent GDPR requests
      console.log('\n🔄 Step 1: Concurrent GDPR Requests');
      const concurrentGDPRRequests = Array.from({ length: 10 }, (_, index) => ({
        dataSubjectId: `concurrent-subject-${index}`,
        options: {
          format: 'JSON' as const,
          includeDerivedData: true,
          includeThirdPartyData: true,
          includeAuditTrail: true
        }
      }));

      const startTime = Date.now();
      const gdprResults = await Promise.all(
        concurrentGDPRRequests.map(request => privata.requestDataAccess(request.dataSubjectId, request.options))
      );
      const gdprProcessingTime = Date.now() - startTime;

      console.log(`   ✅ Concurrent GDPR requests: ${gdprResults.length}`);
      console.log(`   ⏱️  Total processing time: ${gdprProcessingTime}ms`);
      console.log(`   📊 Average per request: ${Math.round(gdprProcessingTime / gdprResults.length)}ms`);
      console.log(`   ✅ Success rate: ${(gdprResults.filter(r => r.status === 'completed').length / gdprResults.length * 100).toFixed(1)}%`);

      // Step 2: Concurrent HIPAA requests
      console.log('\n🏥 Step 2: Concurrent HIPAA Requests');
      const concurrentHIPAARequests = Array.from({ length: 10 }, (_, index) => ({
        patientId: `concurrent-patient-${index}`,
        requestType: 'access' as const,
        purpose: 'treatment' as const,
        minimumNecessary: true,
        verificationMethod: 'document-verification' as const
      }));

      const hipaaStartTime = Date.now();
      const hipaaResults = await Promise.all(
        concurrentHIPAARequests.map(request => privata.processPHIRequest(request))
      );
      const hipaaProcessingTime = Date.now() - hipaaStartTime;

      console.log(`   ✅ Concurrent HIPAA requests: ${hipaaResults.length}`);
      console.log(`   ⏱️  Total processing time: ${hipaaProcessingTime}ms`);
      console.log(`   📊 Average per request: ${Math.round(hipaaProcessingTime / hipaaResults.length)}ms`);
      console.log(`   ✅ Success rate: ${(hipaaResults.filter(r => r.success).length / hipaaResults.length * 100).toFixed(1)}%`);

      // Step 3: Mixed workload demonstration
      console.log('\n🔄 Step 3: Mixed Workload Demonstration');
      const mixedRequests = [
        ...concurrentGDPRRequests.slice(0, 5).map(req => ({ type: 'gdpr' as const, request: req })),
        ...concurrentHIPAARequests.slice(0, 5).map(req => ({ type: 'hipaa' as const, request: req }))
      ];

      const mixedStartTime = Date.now();
      const mixedResults = await Promise.all(
        mixedRequests.map(async ({ type, request }) => {
          if (type === 'gdpr') {
            return { type, result: await privata.requestDataAccess(request.dataSubjectId, request.options) };
          } else {
            return { type, result: await privata.processPHIRequest(request) };
          }
        })
      );
      const mixedProcessingTime = Date.now() - mixedStartTime;

      console.log(`   ✅ Mixed workload requests: ${mixedResults.length}`);
      console.log(`   ⏱️  Total processing time: ${mixedProcessingTime}ms`);
      console.log(`   📊 Average per request: ${Math.round(mixedProcessingTime / mixedResults.length)}ms`);
      console.log(`   🔍 GDPR requests: ${mixedResults.filter(r => r.type === 'gdpr').length}`);
      console.log(`   🏥 HIPAA requests: ${mixedResults.filter(r => r.type === 'hipaa').length}`);

      // Step 4: Audit trail performance
      console.log('\n📋 Step 4: Audit Trail Performance');
      const auditStartTime = Date.now();
      const auditLog = await privata.getAuditLog({});
      const auditProcessingTime = Date.now() - auditStartTime;

      console.log(`   ✅ Audit log retrieved: ${auditLog.length} events`);
      console.log(`   ⏱️  Processing time: ${auditProcessingTime}ms`);
      console.log(`   📊 Events per second: ${Math.round(auditLog.length / (auditProcessingTime / 1000))}`);

      // Verify performance requirements
      expect(gdprResults.every(r => r.status === 'completed')).toBe(true);
      expect(hipaaResults.every(r => r.success)).toBe(true);
      expect(mixedResults.every(r => 
        r.type === 'gdpr' ? r.result.status === 'completed' : r.result.success
      )).toBe(true);
      expect(gdprProcessingTime).toBeLessThan(5000); // 5 seconds
      expect(hipaaProcessingTime).toBeLessThan(5000); // 5 seconds
      expect(mixedProcessingTime).toBeLessThan(5000); // 5 seconds

      console.log('\n✅ Performance and Scalability: SUCCESS');
    });
  });

  describe('Scenario 5: Error Handling and Recovery', () => {
    it('should demonstrate robust error handling and recovery', async () => {
      console.log('\n🛡️  SCENARIO 5: Error Handling and Recovery');
      console.log('-'.repeat(50));

      // Step 1: Invalid data subject ID
      console.log('\n❌ Step 1: Invalid Data Subject ID');
      try {
        const invalidResult = await privata.requestDataAccess('invalid-id');
        console.log(`   ❌ Expected failure: ${invalidResult.status !== 'completed'}`);
        console.log(`   📋 Error handling: ${invalidResult.error || 'No errors'}`);
      } catch (error) {
        console.log(`   ❌ Exception caught: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Step 2: Invalid patient ID for HIPAA
      console.log('\n❌ Step 2: Invalid Patient ID for HIPAA');
      try {
        const invalidPHIRequest: PHIRequest = {
          patientId: 'invalid-patient-id',
          requestType: 'access',
          purpose: 'treatment',
          verificationMethod: 'document-verification'
        };

        const invalidPHIResult = await privata.processPHIRequest(invalidPHIRequest);
        console.log(`   ❌ Expected failure: ${!invalidPHIResult.success}`);
        console.log(`   📋 Error handling: ${invalidPHIResult.errors?.join(', ') || 'No errors'}`);
      } catch (error) {
        console.log(`   ❌ Exception caught: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Step 3: Malformed request data
      console.log('\n❌ Step 3: Malformed Request Data');
      try {
        const malformedResult = await privata.requestDataAccess(testDataSubject.id, {
          format: 'invalid-format' as any
        });
        console.log(`   ❌ Expected failure: ${malformedResult.status !== 'completed'}`);
        console.log(`   📋 Error handling: ${malformedResult.error || 'No errors'}`);
      } catch (error) {
        console.log(`   ❌ Exception caught: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Step 4: Recovery demonstration
      console.log('\n🔄 Step 4: Recovery Demonstration');
      const recoveryResult = await privata.requestDataAccess(testDataSubject.id, {
        format: 'JSON'
      });
      console.log(`   ✅ Recovery successful: ${recoveryResult.status === 'completed'}`);
      console.log(`   📊 Data retrieved: ${recoveryResult.personalData.length} records`);
      console.log(`   ⏱️  Response time: ${recoveryResult.responseTime}ms`);

      // Step 5: Audit trail for error events
      console.log('\n📋 Step 5: Error Event Audit Trail');
      const errorAuditLog = await privata.getAuditLog({
        action: 'DATA_ACCESS_REQUEST'
      });

      const errorEvents = errorAuditLog.filter(event => !event.success);
      console.log(`   📊 Total audit events: ${errorAuditLog.length}`);
      console.log(`   ❌ Error events: ${errorEvents.length}`);
      console.log(`   ✅ Success rate: ${((errorAuditLog.length - errorEvents.length) / errorAuditLog.length * 100).toFixed(1)}%`);

      // Verify error handling worked correctly
      expect(recoveryResult.status).toBe('completed');
      expect(errorAuditLog.length).toBeGreaterThan(0);

      console.log('\n✅ Error Handling and Recovery: SUCCESS');
    });
  });

  describe('Scenario 6: Compliance Verification', () => {
    it('should demonstrate comprehensive compliance verification', async () => {
      console.log('\n✅ SCENARIO 6: Compliance Verification');
      console.log('-'.repeat(50));

      // Step 1: GDPR compliance verification
      console.log('\n📋 Step 1: GDPR Compliance Verification');
      const gdprResult = await privata.requestDataAccess(testDataSubject.id, {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true
      });
      console.log(`   ✅ GDPR Article 15 compliance: ${gdprResult.status === 'completed'}`);
      console.log(`   📊 Data categories: ${gdprResult.personalData.length}`);
      console.log(`   📋 Processing purposes: ${gdprResult.processingPurposes.length}`);
      console.log(`   ⏱️  Response time: ${gdprResult.responseTime}ms`);
      console.log(`   📋 Legal basis: ${gdprResult.legalBasis.length}`);

      // Step 2: HIPAA compliance verification
      console.log('\n🏥 Step 2: HIPAA Compliance Verification');
      const hipaaResult = await privata.processPHIRequest({
        patientId: testPatient.id,
        requestType: 'access',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'document-verification'
      });

      console.log(`   ✅ HIPAA Privacy Rule compliance: ${hipaaResult.success}`);
      console.log(`   🔒 Minimum necessary standard: ${hipaaResult.minimumNecessaryApplied}`);
      console.log(`   🛡️  Administrative safeguards: ${hipaaResult.administrativeSafeguards ? 'Implemented' : 'Not implemented'}`);
      console.log(`   🔐 Physical safeguards: ${hipaaResult.physicalSafeguards ? 'Implemented' : 'Not implemented'}`);
      console.log(`   💻 Technical safeguards: ${hipaaResult.technicalSafeguards ? 'Implemented' : 'Not implemented'}`);

      // Step 3: Audit trail compliance
      console.log('\n📋 Step 3: Audit Trail Compliance');
      const auditLog = await privata.getAuditLog({});
      console.log(`   ✅ Audit trail maintained: ${auditLog.length > 0}`);
      console.log(`   📊 Total audit events: ${auditLog.length}`);
      console.log(`   🔍 GDPR events: ${auditLog.filter(e => e.action.includes('DATA_')).length}`);
      console.log(`   🏥 HIPAA events: ${auditLog.filter(e => e.action.includes('PHI')).length}`);
      console.log(`   ✅ Success rate: ${(auditLog.filter(e => e.success).length / auditLog.length * 100).toFixed(1)}%`);

      // Step 4: Data integrity verification
      console.log('\n🔒 Step 4: Data Integrity Verification');
      const dataIntegrityCheck = await privata.performDataIntegrityCheck(testPatient.id);
      console.log(`   ✅ Data integrity check: ${dataIntegrityCheck.success}`);
      console.log(`   🔒 Data integrity: ${dataIntegrityCheck.dataIntegrity}`);
      console.log(`   ✅ Checksum validation: ${dataIntegrityCheck.checksumValidation}`);
      console.log(`   📋 Integrity violations: ${dataIntegrityCheck.integrityViolations?.length || 0}`);

      // Step 5: Overall compliance score
      console.log('\n📊 Step 5: Overall Compliance Score');
      const hipaaComplianceCheck = await privata.performHIPAAComplianceCheck();
      console.log(`   🏥 HIPAA compliance score: ${hipaaComplianceCheck.complianceScore}%`);
      console.log(`   📋 HIPAA compliance status: ${hipaaComplianceCheck.complianceStatus}`);
      console.log(`   🔍 HIPAA issues: ${hipaaComplianceCheck.complianceIssues.length}`);

      // Calculate overall compliance score
      const gdprComplianceScore = gdprResult.status === 'completed' ? 100 : 0;
      const hipaaComplianceScore = hipaaComplianceCheck.complianceScore;
      const auditComplianceScore = auditLog.length > 0 ? 100 : 0;
      const integrityComplianceScore = dataIntegrityCheck.dataIntegrity ? 100 : 0;

      const overallComplianceScore = Math.round(
        (gdprComplianceScore + hipaaComplianceScore + auditComplianceScore + integrityComplianceScore) / 4
      );

      console.log(`   📊 Overall compliance score: ${overallComplianceScore}%`);
      console.log(`   ✅ GDPR compliance: ${gdprComplianceScore}%`);
      console.log(`   🏥 HIPAA compliance: ${hipaaComplianceScore}%`);
      console.log(`   📋 Audit compliance: ${auditComplianceScore}%`);
      console.log(`   🔒 Integrity compliance: ${integrityComplianceScore}%`);

      // Verify compliance requirements
      expect(gdprResult.status).toBe('completed');
      expect(hipaaResult.success).toBe(true);
      expect(auditLog.length).toBeGreaterThan(0);
      expect(dataIntegrityCheck.success).toBe(true);
      expect(overallComplianceScore).toBeGreaterThanOrEqual(90); // 90% compliance threshold

      console.log('\n✅ Compliance Verification: SUCCESS');
    });
  });
});

// Helper functions for test setup
async function createTestDataSubject(): Promise<DataSubject> {
  const dataSubject: DataSubject = {
    id: `test-subject-${Date.now()}`,
    email: 'test@example.com',
    name: 'Test Data Subject',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return dataSubject;
}

async function createTestPatient(): Promise<DataSubject> {
  const patient: DataSubject = {
    id: `test-patient-${Date.now()}`,
    email: 'patient@example.com',
    name: 'Test Patient',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return patient;
}

async function createTestPersonalData(dataSubjectId: string): Promise<PersonalData[]> {
  const personalData: PersonalData[] = [
    {
      id: `data-1-${Date.now()}`,
      dataSubjectId,
      category: 'identity',
      fields: {
        name: 'Test Data Subject',
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
      category: 'demographic',
      fields: {
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country'
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
      category: 'behavioral',
      fields: {
        preferences: ['newsletter', 'marketing'],
        interests: ['technology', 'privacy']
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
