# GDPR Compliance Tests Specification
## Article-by-Article Legal Compliance Testing

**Version:** 1.0.0  
**Date:** October 17, 2025  
**Status:** Specification  
**Purpose:** Ensure Privata meets every GDPR requirement by statute

---

## 📋 Overview

This document defines comprehensive test suites that verify Privata's compliance with the General Data Protection Regulation (GDPR) on an article-by-article basis. Each test maps directly to specific GDPR articles and requirements.

### Test Categories

1. **Data Subject Rights (Articles 15-22)**
2. **Lawfulness of Processing (Articles 6-7)**
3. **Data Minimization (Article 5)**
4. **Purpose Limitation (Article 5)**
5. **Storage Limitation (Article 5)**
6. **Accuracy (Article 5)**
7. **Integrity and Confidentiality (Article 5)**
8. **Accountability (Article 5)**
9. **Data Protection by Design (Article 25)**
10. **Data Protection by Default (Article 25)**
11. **Consent Management (Articles 6-7)**
12. **Data Breach Notification (Articles 33-34)**
13. **Data Protection Impact Assessment (Article 35)**
14. **Cross-Border Data Transfers (Articles 44-49)**

---

## 🧪 Test Suite Structure

### Test File Organization

```
tests/compliance/
├── gdpr/
│   ├── data-subject-rights/
│   │   ├── article-15-right-of-access.test.ts
│   │   ├── article-16-right-to-rectification.test.ts
│   │   ├── article-17-right-to-erasure.test.ts
│   │   ├── article-18-right-to-restriction.test.ts
│   │   ├── article-20-right-to-portability.test.ts
│   │   ├── article-21-right-to-object.test.ts
│   │   └── article-22-automated-decision-making.test.ts
│   ├── lawfulness-of-processing/
│   │   ├── article-6-lawful-basis.test.ts
│   │   └── article-7-consent.test.ts
│   ├── data-principles/
│   │   ├── article-5-data-minimization.test.ts
│   │   ├── article-5-purpose-limitation.test.ts
│   │   ├── article-5-storage-limitation.test.ts
│   │   ├── article-5-accuracy.test.ts
│   │   ├── article-5-integrity-confidentiality.test.ts
│   │   └── article-5-accountability.test.ts
│   ├── privacy-by-design/
│   │   ├── article-25-design.test.ts
│   │   └── article-25-default.test.ts
│   ├── data-breaches/
│   │   ├── article-33-controller-notification.test.ts
│   │   └── article-34-data-subject-notification.test.ts
│   ├── cross-border-transfers/
│   │   ├── article-44-general-principle.test.ts
│   │   ├── article-45-adequacy-decision.test.ts
│   │   ├── article-46-appropriate-safeguards.test.ts
│   │   └── article-49-derogations.test.ts
│   └── integration/
│       ├── gdpr-end-to-end.test.ts
│       └── gdpr-stress-compliance.test.ts
└── hipaa/
    ├── privacy-rule/
    ├── security-rule/
    ├── breach-notification-rule/
    └── integration/
```

---

## 📊 Data Subject Rights Tests (Articles 15-22)

### Article 15 - Right of Access

**Legal Requirement:** Data subjects have the right to obtain confirmation as to whether personal data concerning them is being processed, and access to that data.

**Test Cases:**

```typescript
describe('GDPR Article 15 - Right of Access', () => {
  describe('Data Subject Access Request', () => {
    it('should provide complete data inventory for a data subject', async () => {
      // Test that all personal data is retrievable
      const dataSubject = await createTestDataSubject();
      const accessRequest = await privata.requestDataAccess(dataSubject.id);
      
      expect(accessRequest).toContainAllPersonalData();
      expect(accessRequest.processingPurposes).toBeDefined();
      expect(accessRequest.retentionPeriods).toBeDefined();
      expect(accessRequest.thirdPartyRecipients).toBeDefined();
    });

    it('should provide data in a structured, commonly used format', async () => {
      // Test data portability format
      const dataSubject = await createTestDataSubject();
      const accessRequest = await privata.requestDataAccess(dataSubject.id, {
        format: 'JSON'
      });
      
      expect(accessRequest.format).toBe('application/json');
      expect(accessRequest.data).toBeValidJSON();
    });

    it('should include processing purposes and legal basis', async () => {
      // Test transparency requirements
      const dataSubject = await createTestDataSubject();
      const accessRequest = await privata.requestDataAccess(dataSubject.id);
      
      expect(accessRequest.processingPurposes).toContainAllRequiredFields();
      expect(accessRequest.legalBasis).toBeDefined();
      expect(accessRequest.legitimateInterests).toBeDefined();
    });

    it('should include retention periods and erasure criteria', async () => {
      // Test storage limitation transparency
      const dataSubject = await createTestDataSubject();
      const accessRequest = await privata.requestDataAccess(dataSubject.id);
      
      expect(accessRequest.retentionPeriods).toBeDefined();
      expect(accessRequest.erasureCriteria).toBeDefined();
    });

    it('should include third-party recipients and safeguards', async () => {
      // Test third-party disclosure transparency
      const dataSubject = await createTestDataSubject();
      const accessRequest = await privata.requestDataAccess(dataSubject.id);
      
      expect(accessRequest.thirdPartyRecipients).toBeDefined();
      expect(accessRequest.safeguards).toBeDefined();
    });

    it('should respond within 30 days (or 60 days for complex requests)', async () => {
      // Test response time requirements
      const startTime = Date.now();
      const dataSubject = await createTestDataSubject();
      await privata.requestDataAccess(dataSubject.id);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(30 * 24 * 60 * 60 * 1000); // 30 days
    });

    it('should handle complex requests within 60 days', async () => {
      // Test extended response time for complex requests
      const startTime = Date.now();
      const dataSubject = await createTestDataSubjectWithComplexData();
      await privata.requestDataAccess(dataSubject.id, {
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true
      });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(60 * 24 * 60 * 60 * 1000); // 60 days
    });
  });

  describe('Data Subject Identity Verification', () => {
    it('should verify data subject identity before providing access', async () => {
      // Test identity verification
      const dataSubject = await createTestDataSubject();
      const unauthorizedRequest = await privata.requestDataAccess('invalid-id');
      
      expect(unauthorizedRequest).toThrow(IdentityVerificationError);
    });

    it('should maintain audit trail of access requests', async () => {
      // Test audit logging
      const dataSubject = await createTestDataSubject();
      await privata.requestDataAccess(dataSubject.id);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_ACCESS_REQUEST',
        dataSubjectId: dataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].timestamp).toBeDefined();
      expect(auditLog[0].dataSubjectId).toBe(dataSubject.id);
    });
  });
});
```

### Article 16 - Right to Rectification

**Legal Requirement:** Data subjects have the right to obtain rectification of inaccurate personal data.

**Test Cases:**

```typescript
describe('GDPR Article 16 - Right to Rectification', () => {
  describe('Data Rectification Process', () => {
    it('should allow data subjects to correct inaccurate personal data', async () => {
      // Test data correction
      const dataSubject = await createTestDataSubject();
      const originalData = await privata.getPersonalData(dataSubject.id);
      
      const rectificationRequest = {
        dataSubjectId: dataSubject.id,
        corrections: {
          name: 'Corrected Name',
          email: 'corrected@example.com'
        }
      };
      
      await privata.rectifyPersonalData(rectificationRequest);
      const updatedData = await privata.getPersonalData(dataSubject.id);
      
      expect(updatedData.name).toBe('Corrected Name');
      expect(updatedData.email).toBe('corrected@example.com');
    });

    it('should maintain data integrity during rectification', async () => {
      // Test data integrity
      const dataSubject = await createTestDataSubject();
      const rectificationRequest = {
        dataSubjectId: dataSubject.id,
        corrections: {
          name: 'New Name'
        }
      };
      
      await privata.rectifyPersonalData(rectificationRequest);
      
      // Verify that related data is still accessible
      const relatedData = await privata.getRelatedData(dataSubject.id);
      expect(relatedData).toBeDefined();
      expect(relatedData.consistency).toBeMaintained();
    });

    it('should notify third parties of rectifications when required', async () => {
      // Test third-party notification
      const dataSubject = await createTestDataSubject();
      const rectificationRequest = {
        dataSubjectId: dataSubject.id,
        corrections: { name: 'New Name' },
        notifyThirdParties: true
      };
      
      await privata.rectifyPersonalData(rectificationRequest);
      
      const thirdPartyNotifications = await privata.getThirdPartyNotifications({
        dataSubjectId: dataSubject.id,
        action: 'RECTIFICATION'
      });
      
      expect(thirdPartyNotifications).toHaveLength.greaterThan(0);
    });

    it('should maintain audit trail of all rectifications', async () => {
      // Test audit logging
      const dataSubject = await createTestDataSubject();
      const rectificationRequest = {
        dataSubjectId: dataSubject.id,
        corrections: { name: 'New Name' }
      };
      
      await privata.rectifyPersonalData(rectificationRequest);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_RECTIFICATION',
        dataSubjectId: dataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].changes).toBeDefined();
      expect(auditLog[0].timestamp).toBeDefined();
    });
  });
});
```

### Article 17 - Right to Erasure ("Right to be Forgotten")

**Legal Requirement:** Data subjects have the right to obtain erasure of personal data under specific circumstances.

**Test Cases:**

```typescript
describe('GDPR Article 17 - Right to Erasure', () => {
  describe('Erasure Grounds', () => {
    it('should erase data when consent is withdrawn', async () => {
      // Test consent withdrawal erasure
      const dataSubject = await createTestDataSubject();
      await privata.withdrawConsent(dataSubject.id, 'marketing');
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.marketingData).toBeNull();
    });

    it('should erase data when processing is unlawful', async () => {
      // Test unlawful processing erasure
      const dataSubject = await createTestDataSubject();
      await privata.markProcessingAsUnlawful(dataSubject.id, 'specific-purpose');
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.unlawfulData).toBeNull();
    });

    it('should erase data when no longer necessary for original purpose', async () => {
      // Test purpose limitation erasure
      const dataSubject = await createTestDataSubject();
      await privata.markPurposeAsCompleted(dataSubject.id, 'temporary-purpose');
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.temporaryData).toBeNull();
    });

    it('should erase data when data subject objects to processing', async () => {
      // Test objection-based erasure
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest');
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.legitimateInterestData).toBeNull();
    });
  });

  describe('Erasure Exceptions', () => {
    it('should preserve data required for legal compliance', async () => {
      // Test legal compliance exception
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id);
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.legalComplianceData).toBeDefined();
    });

    it('should preserve data for public interest tasks', async () => {
      // Test public interest exception
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id);
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.publicInterestData).toBeDefined();
    });

    it('should preserve data for scientific research', async () => {
      // Test research exception
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id);
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.researchData).toBeDefined();
    });

    it('should preserve data for legal claims', async () => {
      // Test legal claims exception
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id);
      
      const personalData = await privata.getPersonalData(dataSubject.id);
      expect(personalData.legalClaimsData).toBeDefined();
    });
  });

  describe('Third-Party Erasure', () => {
    it('should notify third parties of erasure requests', async () => {
      // Test third-party notification
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id, {
        notifyThirdParties: true
      });
      
      const thirdPartyNotifications = await privata.getThirdPartyNotifications({
        dataSubjectId: dataSubject.id,
        action: 'ERASURE'
      });
      
      expect(thirdPartyNotifications).toHaveLength.greaterThan(0);
    });

    it('should verify third-party erasure completion', async () => {
      // Test third-party erasure verification
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id, {
        notifyThirdParties: true,
        verifyErasure: true
      });
      
      const erasureVerification = await privata.getErasureVerification(dataSubject.id);
      expect(erasureVerification.thirdPartyErasure).toBeCompleted();
    });
  });

  describe('Erasure Audit Trail', () => {
    it('should maintain comprehensive audit trail of erasure', async () => {
      // Test erasure audit logging
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id);
      
      const auditLog = await privata.getAuditLog({
        action: 'DATA_ERASURE',
        dataSubjectId: dataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].erasedData).toBeDefined();
      expect(auditLog[0].erasureReason).toBeDefined();
      expect(auditLog[0].timestamp).toBeDefined();
    });

    it('should maintain erasure certificate for compliance', async () => {
      // Test erasure certificate
      const dataSubject = await createTestDataSubject();
      await privata.requestErasure(dataSubject.id);
      
      const erasureCertificate = await privata.getErasureCertificate(dataSubject.id);
      expect(erasureCertificate).toBeDefined();
      expect(erasureCertificate.erasureDate).toBeDefined();
      expect(erasureCertificate.erasureMethod).toBeDefined();
      expect(erasureCertificate.verificationHash).toBeDefined();
    });
  });
});
```

### Article 18 - Right to Restriction of Processing

**Legal Requirement:** Data subjects have the right to obtain restriction of processing under specific circumstances.

**Test Cases:**

```typescript
describe('GDPR Article 18 - Right to Restriction', () => {
  describe('Restriction Grounds', () => {
    it('should restrict processing when accuracy is contested', async () => {
      // Test accuracy contest restriction
      const dataSubject = await createTestDataSubject();
      await privata.contestDataAccuracy(dataSubject.id, 'specific-field');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.restricted).toBe(true);
      expect(processingStatus.restrictionReason).toBe('ACCURACY_CONTESTED');
    });

    it('should restrict processing when processing is unlawful', async () => {
      // Test unlawful processing restriction
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'UNLAWFUL_PROCESSING');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.restricted).toBe(true);
      expect(processingStatus.restrictionReason).toBe('UNLAWFUL_PROCESSING');
    });

    it('should restrict processing when no longer needed but required for legal claims', async () => {
      // Test legal claims restriction
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'LEGAL_CLAIMS');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.restricted).toBe(true);
      expect(processingStatus.restrictionReason).toBe('LEGAL_CLAIMS');
    });

    it('should restrict processing when data subject objects pending verification', async () => {
      // Test objection restriction
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.restricted).toBe(true);
      expect(processingStatus.restrictionReason).toBe('OBJECTION_PENDING');
    });
  });

  describe('Restriction Effects', () => {
    it('should prevent new processing during restriction', async () => {
      // Test processing prevention
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'ACCURACY_CONTESTED');
      
      const newProcessing = await privata.processData(dataSubject.id, 'new-purpose');
      expect(newProcessing).toThrow(ProcessingRestrictedError);
    });

    it('should allow storage during restriction', async () => {
      // Test storage allowance
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'ACCURACY_CONTESTED');
      
      const storedData = await privata.getPersonalData(dataSubject.id);
      expect(storedData).toBeDefined();
    });

    it('should allow processing with consent during restriction', async () => {
      // Test consent-based processing
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'ACCURACY_CONTESTED');
      await privata.grantConsent(dataSubject.id, 'specific-purpose');
      
      const processing = await privata.processData(dataSubject.id, 'specific-purpose');
      expect(processing).toBeSuccessful();
    });

    it('should allow processing for legal claims during restriction', async () => {
      // Test legal claims processing
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'LEGAL_CLAIMS');
      
      const legalProcessing = await privata.processData(dataSubject.id, 'legal-claim');
      expect(legalProcessing).toBeSuccessful();
    });
  });

  describe('Restriction Lifting', () => {
    it('should lift restriction when accuracy is verified', async () => {
      // Test restriction lifting
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'ACCURACY_CONTESTED');
      await privata.verifyDataAccuracy(dataSubject.id, 'specific-field');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.restricted).toBe(false);
    });

    it('should lift restriction when data subject withdraws objection', async () => {
      // Test objection withdrawal
      const dataSubject = await createTestDataSubject();
      await privata.restrictProcessing(dataSubject.id, 'OBJECTION_PENDING');
      await privata.withdrawObjection(dataSubject.id, 'legitimate-interest');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.restricted).toBe(false);
    });
  });
});
```

### Article 20 - Right to Data Portability

**Legal Requirement:** Data subjects have the right to receive their personal data in a structured, commonly used format.

**Test Cases:**

```typescript
describe('GDPR Article 20 - Right to Data Portability', () => {
  describe('Data Portability Requirements', () => {
    it('should provide data in structured, commonly used format', async () => {
      // Test structured format
      const dataSubject = await createTestDataSubject();
      const portableData = await privata.exportPersonalData(dataSubject.id, {
        format: 'JSON'
      });
      
      expect(portableData.format).toBe('application/json');
      expect(portableData.data).toBeValidJSON();
      expect(portableData.structure).toBeDefined();
    });

    it('should include only data provided by the data subject', async () => {
      // Test data scope limitation
      const dataSubject = await createTestDataSubject();
      const portableData = await privata.exportPersonalData(dataSubject.id);
      
      expect(portableData.data).toContainOnlyProvidedData();
      expect(portableData.data).not.toContainDerivedData();
      expect(portableData.data).not.toContainInferredData();
    });

    it('should include data processed based on consent or contract', async () => {
      // Test legal basis limitation
      const dataSubject = await createTestDataSubject();
      const portableData = await privata.exportPersonalData(dataSubject.id);
      
      expect(portableData.data).toContainConsentBasedData();
      expect(portableData.data).toContainContractBasedData();
      expect(portableData.data).not.toContainLegitimateInterestData();
    });

    it('should not include data processed for public interest or legal obligation', async () => {
      // Test exclusion of non-portable data
      const dataSubject = await createTestDataSubject();
      const portableData = await privata.exportPersonalData(dataSubject.id);
      
      expect(portableData.data).not.toContainPublicInterestData();
      expect(portableData.data).not.toContainLegalObligationData();
    });
  });

  describe('Data Transfer', () => {
    it('should enable direct transfer to another controller', async () => {
      // Test direct transfer
      const dataSubject = await createTestDataSubject();
      const targetController = await createTestController();
      
      const transferResult = await privata.transferPersonalData(dataSubject.id, {
        targetController: targetController.id,
        directTransfer: true
      });
      
      expect(transferResult.success).toBe(true);
      expect(transferResult.transferId).toBeDefined();
    });

    it('should provide data for manual transfer when direct transfer not possible', async () => {
      // Test manual transfer
      const dataSubject = await createTestDataSubject();
      const portableData = await privata.exportPersonalData(dataSubject.id, {
        forTransfer: true
      });
      
      expect(portableData.transferInstructions).toBeDefined();
      expect(portableData.data).toBeTransferReady();
    });

    it('should maintain data integrity during transfer', async () => {
      // Test transfer integrity
      const dataSubject = await createTestDataSubject();
      const originalData = await privata.getPersonalData(dataSubject.id);
      
      const portableData = await privata.exportPersonalData(dataSubject.id);
      const transferredData = await privata.importPersonalData(portableData);
      
      expect(transferredData).toMatchOriginalData(originalData);
    });
  });

  describe('Technical Feasibility', () => {
    it('should handle large datasets efficiently', async () => {
      // Test large dataset handling
      const dataSubject = await createTestDataSubjectWithLargeDataset();
      const startTime = Date.now();
      
      const portableData = await privata.exportPersonalData(dataSubject.id);
      const exportTime = Date.now() - startTime;
      
      expect(exportTime).toBeLessThan(30000); // 30 seconds
      expect(portableData.size).toBeGreaterThan(0);
    });

    it('should provide progress updates for large exports', async () => {
      // Test progress reporting
      const dataSubject = await createTestDataSubjectWithLargeDataset();
      const progressUpdates: number[] = [];
      
      const portableData = await privata.exportPersonalData(dataSubject.id, {
        onProgress: (progress) => progressUpdates.push(progress)
      });
      
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    });
  });
});
```

### Article 21 - Right to Object

**Legal Requirement:** Data subjects have the right to object to processing based on legitimate interests or for direct marketing.

**Test Cases:**

```typescript
describe('GDPR Article 21 - Right to Object', () => {
  describe('Objection to Legitimate Interest Processing', () => {
    it('should allow objection to legitimate interest processing', async () => {
      // Test legitimate interest objection
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest', {
        reason: 'personal-circumstances'
      });
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.objections).toContain('legitimate-interest');
    });

    it('should require compelling legitimate grounds to override objection', async () => {
      // Test compelling grounds requirement
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest');
      
      const overrideAttempt = await privata.overrideObjection(dataSubject.id, 'legitimate-interest', {
        compellingGrounds: 'insufficient'
      });
      
      expect(overrideAttempt).toThrow(InsufficientGroundsError);
    });

    it('should allow processing override with compelling legitimate grounds', async () => {
      // Test compelling grounds override
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest');
      
      const overrideResult = await privata.overrideObjection(dataSubject.id, 'legitimate-interest', {
        compellingGrounds: 'legal-obligation',
        documentation: 'legal-requirement-document'
      });
      
      expect(overrideResult.success).toBe(true);
      expect(overrideResult.documentation).toBeDefined();
    });
  });

  describe('Objection to Direct Marketing', () => {
    it('should immediately stop direct marketing on objection', async () => {
      // Test direct marketing objection
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'direct-marketing');
      
      const marketingStatus = await privata.getMarketingStatus(dataSubject.id);
      expect(marketingStatus.active).toBe(false);
      expect(marketingStatus.objectionDate).toBeDefined();
    });

    it('should not require compelling grounds for direct marketing objection', async () => {
      // Test automatic objection acceptance
      const dataSubject = await createTestDataSubject();
      const objectionResult = await privata.objectToProcessing(dataSubject.id, 'direct-marketing');
      
      expect(objectionResult.accepted).toBe(true);
      expect(objectionResult.effectiveDate).toBeDefined();
    });

    it('should maintain objection across all marketing channels', async () => {
      // Test comprehensive marketing objection
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'direct-marketing');
      
      const marketingChannels = await privata.getMarketingChannels(dataSubject.id);
      marketingChannels.forEach(channel => {
        expect(channel.active).toBe(false);
        expect(channel.objectionDate).toBeDefined();
      });
    });
  });

  describe('Objection to Scientific Research', () => {
    it('should allow objection to research processing', async () => {
      // Test research objection
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'scientific-research', {
        reason: 'personal-beliefs'
      });
      
      const researchStatus = await privata.getResearchStatus(dataSubject.id);
      expect(researchStatus.objections).toContain('scientific-research');
    });

    it('should require compelling legitimate grounds for research override', async () => {
      // Test research override requirements
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'scientific-research');
      
      const overrideAttempt = await privata.overrideObjection(dataSubject.id, 'scientific-research', {
        compellingGrounds: 'public-health-emergency',
        documentation: 'health-emergency-declaration'
      });
      
      expect(overrideAttempt.success).toBe(true);
    });
  });

  describe('Objection Management', () => {
    it('should maintain comprehensive objection records', async () => {
      // Test objection record keeping
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest', {
        reason: 'personal-circumstances'
      });
      
      const objectionRecords = await privata.getObjectionRecords(dataSubject.id);
      expect(objectionRecords).toHaveLength(1);
      expect(objectionRecords[0].reason).toBe('personal-circumstances');
      expect(objectionRecords[0].timestamp).toBeDefined();
    });

    it('should allow withdrawal of objections', async () => {
      // Test objection withdrawal
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest');
      await privata.withdrawObjection(dataSubject.id, 'legitimate-interest');
      
      const processingStatus = await privata.getProcessingStatus(dataSubject.id);
      expect(processingStatus.objections).not.toContain('legitimate-interest');
    });

    it('should maintain audit trail of all objections', async () => {
      // Test objection audit logging
      const dataSubject = await createTestDataSubject();
      await privata.objectToProcessing(dataSubject.id, 'legitimate-interest');
      
      const auditLog = await privata.getAuditLog({
        action: 'PROCESSING_OBJECTION',
        dataSubjectId: dataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].objectionType).toBe('legitimate-interest');
      expect(auditLog[0].timestamp).toBeDefined();
    });
  });
});
```

### Article 22 - Automated Decision Making

**Legal Requirement:** Data subjects have the right not to be subject to automated decision-making, including profiling.

**Test Cases:**

```typescript
describe('GDPR Article 22 - Automated Decision Making', () => {
  describe('Automated Decision Prohibition', () => {
    it('should not make automated decisions without explicit consent', async () => {
      // Test automated decision prohibition
      const dataSubject = await createTestDataSubject();
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment',
        requireConsent: true
      });
      
      expect(automatedDecision).toThrow(ConsentRequiredError);
    });

    it('should allow automated decisions with explicit consent', async () => {
      // Test consented automated decisions
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      expect(automatedDecision.result).toBeDefined();
      expect(automatedDecision.consentVerified).toBe(true);
    });

    it('should allow automated decisions for contract performance', async () => {
      // Test contract-based automated decisions
      const dataSubject = await createTestDataSubject();
      const contract = await createTestContract(dataSubject.id);
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'contract-performance',
        contractId: contract.id
      });
      
      expect(automatedDecision.result).toBeDefined();
      expect(automatedDecision.legalBasis).toBe('contract');
    });

    it('should allow automated decisions for legal authorization', async () => {
      // Test legally authorized automated decisions
      const dataSubject = await createTestDataSubject();
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'fraud-detection',
        legalBasis: 'legal-obligation'
      });
      
      expect(automatedDecision.result).toBeDefined();
      expect(automatedDecision.legalBasis).toBe('legal-obligation');
    });
  });

  describe('Decision Transparency', () => {
    it('should provide meaningful information about automated decisions', async () => {
      // Test decision transparency
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      expect(automatedDecision.explanation).toBeDefined();
      expect(automatedDecision.factors).toBeDefined();
      expect(automatedDecision.weights).toBeDefined();
      expect(automatedDecision.thresholds).toBeDefined();
    });

    it('should provide information about decision logic', async () => {
      // Test decision logic transparency
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      expect(automatedDecision.logic).toBeDefined();
      expect(automatedDecision.algorithm).toBeDefined();
      expect(automatedDecision.version).toBeDefined();
    });

    it('should provide information about decision significance', async () => {
      // Test decision significance transparency
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      expect(automatedDecision.significance).toBeDefined();
      expect(automatedDecision.consequences).toBeDefined();
      expect(automatedDecision.alternatives).toBeDefined();
    });
  });

  describe('Human Intervention', () => {
    it('should provide right to human intervention', async () => {
      // Test human intervention right
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      const humanIntervention = await privata.requestHumanIntervention(dataSubject.id, {
        decisionId: automatedDecision.id,
        reason: 'dispute-decision'
      });
      
      expect(humanIntervention.requestId).toBeDefined();
      expect(humanIntervention.status).toBe('pending');
    });

    it('should allow expression of point of view', async () => {
      // Test point of view expression
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      const pointOfView = await privata.expressPointOfView(dataSubject.id, {
        decisionId: automatedDecision.id,
        viewpoint: 'additional-information',
        supportingDocuments: ['bank-statement.pdf']
      });
      
      expect(pointOfView.submissionId).toBeDefined();
      expect(pointOfView.status).toBe('submitted');
    });

    it('should allow contestation of automated decisions', async () => {
      // Test decision contestation
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      const contestation = await privata.contestDecision(dataSubject.id, {
        decisionId: automatedDecision.id,
        grounds: 'inaccurate-data',
        evidence: ['corrected-information.pdf']
      });
      
      expect(contestation.contestationId).toBeDefined();
      expect(contestation.status).toBe('under-review');
    });
  });

  describe('Decision Audit Trail', () => {
    it('should maintain comprehensive audit trail of automated decisions', async () => {
      // Test decision audit logging
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      const auditLog = await privata.getAuditLog({
        action: 'AUTOMATED_DECISION',
        dataSubjectId: dataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].decisionType).toBe('credit-assessment');
      expect(auditLog[0].algorithm).toBeDefined();
      expect(auditLog[0].timestamp).toBeDefined();
    });

    it('should maintain audit trail of human interventions', async () => {
      // Test intervention audit logging
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'automated-decisions');
      
      const automatedDecision = await privata.makeAutomatedDecision(dataSubject.id, {
        decisionType: 'credit-assessment'
      });
      
      await privata.requestHumanIntervention(dataSubject.id, {
        decisionId: automatedDecision.id
      });
      
      const auditLog = await privata.getAuditLog({
        action: 'HUMAN_INTERVENTION_REQUEST',
        dataSubjectId: dataSubject.id
      });
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].decisionId).toBe(automatedDecision.id);
      expect(auditLog[0].timestamp).toBeDefined();
    });
  });
});
```

---

## 🔒 Data Protection Principles Tests (Article 5)

### Article 5 - Data Minimization

**Legal Requirement:** Personal data must be adequate, relevant, and limited to what is necessary for the purposes for which they are processed.

**Test Cases:**

```typescript
describe('GDPR Article 5 - Data Minimization', () => {
  describe('Data Collection Minimization', () => {
    it('should collect only necessary data for stated purpose', async () => {
      // Test purpose-based data collection
      const dataSubject = await createTestDataSubject();
      const purpose = 'user-registration';
      
      const collectedData = await privata.collectData(dataSubject.id, {
        purpose: purpose,
        dataFields: ['name', 'email', 'age', 'income'] // income not necessary for registration
      });
      
      expect(collectedData.fields).toContain('name');
      expect(collectedData.fields).toContain('email');
      expect(collectedData.fields).not.toContain('income');
      expect(collectedData.warnings).toContain('unnecessary-data-field');
    });

    it('should validate data necessity against processing purpose', async () => {
      // Test purpose validation
      const dataSubject = await createTestDataSubject();
      const purpose = 'newsletter-subscription';
      
      const validationResult = await privata.validateDataNecessity(dataSubject.id, {
        purpose: purpose,
        dataFields: ['name', 'email', 'phone', 'address', 'income']
      });
      
      expect(validationResult.necessary).toContain('email');
      expect(validationResult.unnecessary).toContain('income');
      expect(validationResult.unnecessary).toContain('address');
    });

    it('should prevent collection of excessive data', async () => {
      // Test excessive data prevention
      const dataSubject = await createTestDataSubject();
      const purpose = 'contact-form';
      
      const collectionAttempt = await privata.collectData(dataSubject.id, {
        purpose: purpose,
        dataFields: ['name', 'email', 'ssn', 'bank-account', 'medical-history']
      });
      
      expect(collectionAttempt).toThrow(ExcessiveDataCollectionError);
    });
  });

  describe('Data Processing Minimization', () => {
    it('should process only necessary data for each operation', async () => {
      // Test operation-specific processing
      const dataSubject = await createTestDataSubject();
      const operation = 'send-email';
      
      const processedData = await privata.processData(dataSubject.id, {
        operation: operation,
        availableData: ['name', 'email', 'phone', 'address', 'preferences']
      });
      
      expect(processedData.used).toContain('email');
      expect(processedData.used).toContain('name');
      expect(processedData.unused).toContain('address');
      expect(processedData.unused).toContain('phone');
    });

    it('should limit data access based on user role', async () => {
      // Test role-based data access
      const dataSubject = await createTestDataSubject();
      const user = await createTestUser({ role: 'customer-service' });
      
      const accessibleData = await privata.getAccessibleData(dataSubject.id, {
        userId: user.id,
        operation: 'customer-support'
      });
      
      expect(accessibleData.fields).toContain('name');
      expect(accessibleData.fields).toContain('email');
      expect(accessibleData.fields).not.toContain('payment-info');
      expect(accessibleData.fields).not.toContain('medical-data');
    });

    it('should implement data field-level access controls', async () => {
      // Test field-level access control
      const dataSubject = await createTestDataSubject();
      const user = await createTestUser({ role: 'marketing' });
      
      const fieldAccess = await privata.getFieldAccess(dataSubject.id, {
        userId: user.id,
        operation: 'marketing-campaign'
      });
      
      expect(fieldAccess.allowed).toContain('email');
      expect(fieldAccess.allowed).toContain('preferences');
      expect(fieldAccess.denied).toContain('ssn');
      expect(fieldAccess.denied).toContain('medical-data');
    });
  });

  describe('Data Retention Minimization', () => {
    it('should retain data only for necessary period', async () => {
      // Test retention period validation
      const dataSubject = await createTestDataSubject();
      const purpose = 'temporary-survey';
      const retentionPeriod = 30; // days
      
      const retentionResult = await privata.setRetentionPeriod(dataSubject.id, {
        purpose: purpose,
        retentionDays: retentionPeriod
      });
      
      expect(retentionResult.approved).toBe(true);
      expect(retentionResult.expirationDate).toBeDefined();
    });

    it('should prevent excessive retention periods', async () => {
      // Test excessive retention prevention
      const dataSubject = await createTestDataSubject();
      const purpose = 'newsletter-subscription';
      const excessiveRetention = 3650; // 10 years
      
      const retentionResult = await privata.setRetentionPeriod(dataSubject.id, {
        purpose: purpose,
        retentionDays: excessiveRetention
      });
      
      expect(retentionResult.approved).toBe(false);
      expect(retentionResult.reason).toBe('excessive-retention-period');
    });

    it('should automatically delete expired data', async () => {
      // Test automatic data deletion
      const dataSubject = await createTestDataSubject();
      const purpose = 'temporary-survey';
      
      await privata.setRetentionPeriod(dataSubject.id, {
        purpose: purpose,
        retentionDays: 1
      });
      
      // Simulate time passage
      await privata.simulateTimePassage(2 * 24 * 60 * 60 * 1000); // 2 days
      
      const expiredData = await privata.getExpiredData(dataSubject.id);
      expect(expiredData).toHaveLength(0);
    });
  });

  describe('Data Minimization Monitoring', () => {
    it('should monitor data collection for minimization compliance', async () => {
      // Test collection monitoring
      const dataSubject = await createTestDataSubject();
      
      await privata.collectData(dataSubject.id, {
        purpose: 'user-registration',
        dataFields: ['name', 'email', 'phone']
      });
      
      const complianceReport = await privata.getMinimizationCompliance(dataSubject.id);
      expect(complianceReport.collectionCompliant).toBe(true);
      expect(complianceReport.violations).toHaveLength(0);
    });

    it('should detect and report minimization violations', async () => {
      // Test violation detection
      const dataSubject = await createTestDataSubject();
      
      await privata.collectData(dataSubject.id, {
        purpose: 'contact-form',
        dataFields: ['name', 'email', 'ssn', 'bank-account']
      });
      
      const complianceReport = await privata.getMinimizationCompliance(dataSubject.id);
      expect(complianceReport.collectionCompliant).toBe(false);
      expect(complianceReport.violations).toHaveLength(2);
      expect(complianceReport.violations[0].type).toBe('excessive-data-collection');
    });

    it('should provide minimization recommendations', async () => {
      // Test recommendation system
      const dataSubject = await createTestDataSubject();
      
      const recommendations = await privata.getMinimizationRecommendations(dataSubject.id, {
        purpose: 'user-registration'
      });
      
      expect(recommendations.necessary).toBeDefined();
      expect(recommendations.unnecessary).toBeDefined();
      expect(recommendations.alternatives).toBeDefined();
    });
  });
});
```

---

## 🛡️ Privacy by Design Tests (Article 25)

### Article 25 - Data Protection by Design and by Default

**Legal Requirement:** Controllers must implement appropriate technical and organizational measures to ensure data protection by design and by default.

**Test Cases:**

```typescript
describe('GDPR Article 25 - Privacy by Design', () => {
  describe('Data Protection by Design', () => {
    it('should implement privacy-enhancing technologies by default', async () => {
      // Test default privacy technologies
      const dataSubject = await createTestDataSubject();
      const systemConfig = await privata.getSystemConfiguration();
      
      expect(systemConfig.encryption).toBe('enabled');
      expect(systemConfig.pseudonymization).toBe('enabled');
      expect(systemConfig.anonymization).toBe('enabled');
      expect(systemConfig.accessControls).toBe('enabled');
    });

    it('should minimize data processing by default', async () => {
      // Test default minimization
      const dataSubject = await createTestDataSubject();
      const defaultProcessing = await privata.getDefaultProcessingSettings();
      
      expect(defaultProcessing.dataMinimization).toBe(true);
      expect(defaultProcessing.purposeLimitation).toBe(true);
      expect(defaultProcessing.storageLimitation).toBe(true);
    });

    it('should implement data protection impact assessments', async () => {
      // Test DPIA implementation
      const processingActivity = await createTestProcessingActivity();
      const dpia = await privata.conductDPIA(processingActivity.id);
      
      expect(dpia.required).toBe(true);
      expect(dpia.riskAssessment).toBeDefined();
      expect(dpia.mitigationMeasures).toBeDefined();
      expect(dpia.approval).toBeDefined();
    });

    it('should implement privacy-enhancing data processing', async () => {
      // Test privacy-enhanced processing
      const dataSubject = await createTestDataSubject();
      const processingResult = await privata.processDataWithPrivacyEnhancement(dataSubject.id, {
        operation: 'analytics',
        privacyLevel: 'high'
      });
      
      expect(processingResult.pseudonymized).toBe(true);
      expect(processingResult.encrypted).toBe(true);
      expect(processingResult.aggregated).toBe(true);
    });
  });

  describe('Data Protection by Default', () => {
    it('should use most privacy-friendly settings by default', async () => {
      // Test default privacy settings
      const dataSubject = await createTestDataSubject();
      const defaultSettings = await privata.getDefaultPrivacySettings();
      
      expect(defaultSettings.dataSharing).toBe(false);
      expect(defaultSettings.profiling).toBe(false);
      expect(defaultSettings.marketing).toBe(false);
      expect(defaultSettings.analytics).toBe('anonymized');
    });

    it('should require explicit consent for data sharing', async () => {
      // Test explicit consent requirement
      const dataSubject = await createTestDataSubject();
      
      const sharingAttempt = await privata.shareData(dataSubject.id, {
        recipient: 'third-party',
        purpose: 'marketing'
      });
      
      expect(sharingAttempt).toThrow(ConsentRequiredError);
    });

    it('should implement opt-in rather than opt-out for data processing', async () => {
      // Test opt-in implementation
      const dataSubject = await createTestDataSubject();
      const processingSettings = await privata.getProcessingSettings(dataSubject.id);
      
      expect(processingSettings.optInRequired).toBe(true);
      expect(processingSettings.defaultOptIn).toBe(false);
    });

    it('should implement data minimization by default', async () => {
      // Test default minimization
      const dataSubject = await createTestDataSubject();
      const collectionSettings = await privata.getCollectionSettings(dataSubject.id);
      
      expect(collectionSettings.minimalData).toBe(true);
      expect(collectionSettings.purposeSpecific).toBe(true);
      expect(collectionSettings.retentionLimited).toBe(true);
    });
  });

  describe('Technical and Organizational Measures', () => {
    it('should implement appropriate technical measures', async () => {
      // Test technical measures
      const technicalMeasures = await privata.getTechnicalMeasures();
      
      expect(technicalMeasures.encryption).toBeDefined();
      expect(technicalMeasures.accessControls).toBeDefined();
      expect(technicalMeasures.auditLogging).toBeDefined();
      expect(technicalMeasures.dataIntegrity).toBeDefined();
    });

    it('should implement appropriate organizational measures', async () => {
      // Test organizational measures
      const organizationalMeasures = await privata.getOrganizationalMeasures();
      
      expect(organizationalMeasures.dataProtectionPolicies).toBeDefined();
      expect(organizationalMeasures.staffTraining).toBeDefined();
      expect(organizationalMeasures.accessControls).toBeDefined();
      expect(organizationalMeasures.incidentResponse).toBeDefined();
    });

    it('should regularly review and update measures', async () => {
      // Test measure review
      const reviewSchedule = await privata.getMeasureReviewSchedule();
      
      expect(reviewSchedule.technicalMeasures).toBeDefined();
      expect(reviewSchedule.organizationalMeasures).toBeDefined();
      expect(reviewSchedule.frequency).toBe('quarterly');
    });
  });

  describe('Privacy Impact Assessment', () => {
    it('should conduct privacy impact assessments for high-risk processing', async () => {
      // Test DPIA requirement
      const processingActivity = await createTestProcessingActivity({
        riskLevel: 'high'
      });
      
      const dpia = await privata.conductDPIA(processingActivity.id);
      
      expect(dpia.required).toBe(true);
      expect(dpia.riskAssessment).toBeDefined();
      expect(dpia.mitigationMeasures).toBeDefined();
    });

    it('should involve data protection officer in DPIA process', async () => {
      // Test DPO involvement
      const processingActivity = await createTestProcessingActivity({
        riskLevel: 'high'
      });
      
      const dpia = await privata.conductDPIA(processingActivity.id);
      
      expect(dpia.dpoInvolved).toBe(true);
      expect(dpia.dpoRecommendations).toBeDefined();
    });

    it('should consult supervisory authority for high-risk processing', async () => {
      // Test supervisory authority consultation
      const processingActivity = await createTestProcessingActivity({
        riskLevel: 'very-high'
      });
      
      const dpia = await privata.conductDPIA(processingActivity.id);
      
      expect(dpia.supervisoryAuthorityConsultation).toBe(true);
      expect(dpia.authorityApproval).toBeDefined();
    });
  });
});
```

---

## 🚨 Data Breach Tests (Articles 33-34)

### Article 33 - Controller Breach Notification

**Legal Requirement:** Controllers must notify supervisory authority of data breaches within 72 hours.

**Test Cases:**

```typescript
describe('GDPR Article 33 - Controller Breach Notification', () => {
  describe('Breach Detection and Assessment', () => {
    it('should detect data breaches automatically', async () => {
      // Test breach detection
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'unauthorized-access',
        severity: 'high'
      });
      
      const detectedBreach = await privata.getDetectedBreach(breach.id);
      expect(detectedBreach.detected).toBe(true);
      expect(detectedBreach.detectionTime).toBeDefined();
    });

    it('should assess breach risk and impact', async () => {
      // Test breach assessment
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-leak',
        severity: 'medium'
      });
      
      const assessment = await privata.assessBreachRisk(breach.id);
      expect(assessment.riskLevel).toBeDefined();
      expect(assessment.impactAssessment).toBeDefined();
      expect(assessment.affectedDataSubjects).toBeDefined();
    });

    it('should determine if breach poses risk to data subjects', async () => {
      // Test risk determination
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'encryption-breach',
        severity: 'low'
      });
      
      const riskAssessment = await privata.assessDataSubjectRisk(breach.id);
      expect(riskAssessment.posesRisk).toBeDefined();
      expect(riskAssessment.riskFactors).toBeDefined();
    });
  });

  describe('Supervisory Authority Notification', () => {
    it('should notify supervisory authority within 72 hours', async () => {
      // Test notification timeline
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'unauthorized-access',
        severity: 'high'
      });
      
      const startTime = Date.now();
      await privata.notifySupervisoryAuthority(breach.id);
      const notificationTime = Date.now() - startTime;
      
      expect(notificationTime).toBeLessThan(72 * 60 * 60 * 1000); // 72 hours
    });

    it('should include required information in notification', async () => {
      // Test notification content
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-leak',
        severity: 'high'
      });
      
      const notification = await privata.notifySupervisoryAuthority(breach.id);
      
      expect(notification.breachDescription).toBeDefined();
      expect(notification.categoriesOfData).toBeDefined();
      expect(notification.approximateDataSubjects).toBeDefined();
      expect(notification.likelyConsequences).toBeDefined();
      expect(notification.measuresProposed).toBeDefined();
    });

    it('should provide additional information within 72 hours if not immediately available', async () => {
      // Test additional information provision
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'complex-breach',
        severity: 'high'
      });
      
      const initialNotification = await privata.notifySupervisoryAuthority(breach.id, {
        immediate: true
      });
      
      const additionalInfo = await privata.provideAdditionalBreachInfo(breach.id, {
        within72Hours: true
      });
      
      expect(initialNotification.complete).toBe(false);
      expect(additionalInfo.provided).toBe(true);
      expect(additionalInfo.timeline).toBeLessThan(72 * 60 * 60 * 1000);
    });

    it('should maintain breach notification records', async () => {
      // Test notification record keeping
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'unauthorized-access',
        severity: 'high'
      });
      
      await privata.notifySupervisoryAuthority(breach.id);
      
      const notificationRecords = await privata.getBreachNotificationRecords(breach.id);
      expect(notificationRecords).toHaveLength(1);
      expect(notificationRecords[0].authority).toBeDefined();
      expect(notificationRecords[0].timestamp).toBeDefined();
    });
  });

  describe('Breach Response and Mitigation', () => {
    it('should implement immediate breach response measures', async () => {
      // Test immediate response
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'active-breach',
        severity: 'critical'
      });
      
      const response = await privata.implementBreachResponse(breach.id);
      
      expect(response.immediateActions).toBeDefined();
      expect(response.containmentMeasures).toBeDefined();
      expect(response.forensicInvestigation).toBeDefined();
    });

    it('should implement breach mitigation measures', async () => {
      // Test mitigation measures
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-leak',
        severity: 'high'
      });
      
      const mitigation = await privata.implementMitigationMeasures(breach.id);
      
      expect(mitigation.dataRecovery).toBeDefined();
      expect(mitigation.systemHardening).toBeDefined();
      expect(mitigation.accessControls).toBeDefined();
    });

    it('should monitor breach resolution progress', async () => {
      // Test resolution monitoring
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'ongoing-breach',
        severity: 'medium'
      });
      
      const progress = await privata.monitorBreachResolution(breach.id);
      
      expect(progress.status).toBeDefined();
      expect(progress.resolutionSteps).toBeDefined();
      expect(progress.timeline).toBeDefined();
    });
  });
});
```

### Article 34 - Data Subject Breach Notification

**Legal Requirement:** Controllers must notify data subjects of breaches that pose high risk to their rights and freedoms.

**Test Cases:**

```typescript
describe('GDPR Article 34 - Data Subject Breach Notification', () => {
  describe('Data Subject Notification Requirements', () => {
    it('should notify data subjects of high-risk breaches', async () => {
      // Test high-risk breach notification
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'sensitive-data-exposure',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.required).toBe(true);
      expect(notification.riskLevel).toBe('high');
      expect(notification.notificationSent).toBe(true);
    });

    it('should not notify data subjects of low-risk breaches', async () => {
      // Test low-risk breach handling
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'minor-access-log',
        severity: 'low',
        riskToDataSubject: 'low'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.required).toBe(false);
      expect(notification.notificationSent).toBe(false);
    });

    it('should notify data subjects without undue delay', async () => {
      // Test notification timeline
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'high-risk-breach',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const startTime = Date.now();
      await privata.notifyDataSubject(breach.id, dataSubject.id);
      const notificationTime = Date.now() - startTime;
      
      expect(notificationTime).toBeLessThan(24 * 60 * 60 * 1000); // 24 hours
    });
  });

  describe('Notification Content Requirements', () => {
    it('should include breach description in notification', async () => {
      // Test notification content
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-leak',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.breachDescription).toBeDefined();
      expect(notification.breachDescription).toContain('nature');
      expect(notification.breachDescription).toContain('circumstances');
    });

    it('should include likely consequences of breach', async () => {
      // Test consequences information
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'financial-data-exposure',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.likelyConsequences).toBeDefined();
      expect(notification.likelyConsequences).toContain('financial');
      expect(notification.likelyConsequences).toContain('identity');
    });

    it('should include measures taken to address breach', async () => {
      // Test measures information
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'system-compromise',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.measuresTaken).toBeDefined();
      expect(notification.measuresTaken).toContain('containment');
      expect(notification.measuresTaken).toContain('mitigation');
    });

    it('should include contact information for data protection officer', async () => {
      // Test DPO contact information
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-breach',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.dpoContact).toBeDefined();
      expect(notification.dpoContact.email).toBeDefined();
      expect(notification.dpoContact.phone).toBeDefined();
    });
  });

  describe('Notification Exceptions', () => {
    it('should not notify if technical and organizational measures were applied', async () => {
      // Test technical measures exception
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'encrypted-data-breach',
        severity: 'high',
        riskToDataSubject: 'low', // Due to encryption
        technicalMeasures: 'encryption'
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.required).toBe(false);
      expect(notification.reason).toBe('technical-measures-applied');
    });

    it('should not notify if measures would involve disproportionate effort', async () => {
      // Test disproportionate effort exception
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'mass-breach',
        severity: 'high',
        riskToDataSubject: 'high',
        affectedSubjects: 1000000
      });
      
      const notification = await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      expect(notification.required).toBe(false);
      expect(notification.reason).toBe('disproportionate-effort');
    });

    it('should provide public communication if individual notification not feasible', async () => {
      // Test public communication alternative
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'mass-breach',
        severity: 'high',
        riskToDataSubject: 'high',
        affectedSubjects: 1000000
      });
      
      const publicCommunication = await privata.providePublicCommunication(breach.id);
      
      expect(publicCommunication.required).toBe(true);
      expect(publicCommunication.websiteNotice).toBeDefined();
      expect(publicCommunication.mediaNotice).toBeDefined();
    });
  });

  describe('Notification Delivery', () => {
    it('should deliver notifications through appropriate channels', async () => {
      // Test notification delivery
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-breach',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      const delivery = await privata.deliverBreachNotification(breach.id, dataSubject.id);
      
      expect(delivery.channels).toContain('email');
      expect(delivery.channels).toContain('sms');
      expect(delivery.deliveryStatus).toBe('delivered');
    });

    it('should maintain notification delivery records', async () => {
      // Test delivery record keeping
      const dataSubject = await createTestDataSubject();
      const breach = await privata.simulateDataBreach(dataSubject.id, {
        type: 'data-breach',
        severity: 'high',
        riskToDataSubject: 'high'
      });
      
      await privata.notifyDataSubject(breach.id, dataSubject.id);
      
      const deliveryRecords = await privata.getNotificationDeliveryRecords(breach.id);
      expect(deliveryRecords).toHaveLength(1);
      expect(deliveryRecords[0].dataSubjectId).toBe(dataSubject.id);
      expect(deliveryRecords[0].deliveryTime).toBeDefined();
    });
  });
});
```

---

## 🌍 Cross-Border Data Transfer Tests (Articles 44-49)

### Article 44 - General Principle for Transfers

**Legal Requirement:** Any transfer of personal data to a third country must ensure an adequate level of protection.

**Test Cases:**

```typescript
describe('GDPR Article 44 - Cross-Border Data Transfers', () => {
  describe('Transfer Adequacy Assessment', () => {
    it('should assess adequacy of third country protection', async () => {
      // Test adequacy assessment
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'cloud-storage'
      });
      
      const adequacyAssessment = await privata.assessTransferAdequacy(transferRequest.id);
      
      expect(adequacyAssessment.adequacyDecision).toBeDefined();
      expect(adequacyAssessment.protectionLevel).toBeDefined();
      expect(adequacyAssessment.risks).toBeDefined();
    });

    it('should allow transfers to adequate countries', async () => {
      // Test adequate country transfers
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'switzerland', // Adequate country
        purpose: 'data-processing'
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(true);
      expect(transferResult.adequacyDecision).toBe('adequate');
    });

    it('should require safeguards for non-adequate countries', async () => {
      // Test non-adequate country requirements
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'china', // Non-adequate country
        purpose: 'business-operations'
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(false);
      expect(transferResult.requiredSafeguards).toBeDefined();
    });
  });

  describe('Appropriate Safeguards (Article 46)', () => {
    it('should implement standard contractual clauses', async () => {
      // Test SCC implementation
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'cloud-services',
        safeguards: 'standard-contractual-clauses'
      });
      
      const scc = await privata.implementStandardContractualClauses(transferRequest.id);
      
      expect(scc.implemented).toBe(true);
      expect(scc.clauseVersion).toBeDefined();
      expect(scc.contractualTerms).toBeDefined();
    });

    it('should implement binding corporate rules', async () => {
      // Test BCR implementation
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'intra-group-transfer',
        safeguards: 'binding-corporate-rules'
      });
      
      const bcr = await privata.implementBindingCorporateRules(transferRequest.id);
      
      expect(bcr.implemented).toBe(true);
      expect(bcr.approval).toBeDefined();
      expect(bcr.enforcement).toBeDefined();
    });

    it('should implement certification mechanisms', async () => {
      // Test certification implementation
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'certified-processing',
        safeguards: 'certification'
      });
      
      const certification = await privata.implementCertificationMechanism(transferRequest.id);
      
      expect(certification.implemented).toBe(true);
      expect(certification.certificationBody).toBeDefined();
      expect(certification.validityPeriod).toBeDefined();
    });

    it('should implement codes of conduct', async () => {
      // Test code of conduct implementation
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'industry-processing',
        safeguards: 'code-of-conduct'
      });
      
      const codeOfConduct = await privata.implementCodeOfConduct(transferRequest.id);
      
      expect(codeOfConduct.implemented).toBe(true);
      expect(codeOfConduct.approval).toBeDefined();
      expect(codeOfConduct.monitoring).toBeDefined();
    });
  });

  describe('Derogations (Article 49)', () => {
    it('should allow transfers based on explicit consent', async () => {
      // Test consent-based transfer
      const dataSubject = await createTestDataSubject();
      await privata.grantConsent(dataSubject.id, 'cross-border-transfer');
      
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'consent-based-processing',
        legalBasis: 'consent'
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(true);
      expect(transferResult.legalBasis).toBe('consent');
    });

    it('should allow transfers for contract performance', async () => {
      // Test contract-based transfer
      const dataSubject = await createTestDataSubject();
      const contract = await createTestContract(dataSubject.id);
      
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'contract-performance',
        legalBasis: 'contract',
        contractId: contract.id
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(true);
      expect(transferResult.legalBasis).toBe('contract');
    });

    it('should allow transfers for important reasons of public interest', async () => {
      // Test public interest transfer
      const dataSubject = await createTestDataSubject();
      
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'public-health-emergency',
        legalBasis: 'public-interest'
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(true);
      expect(transferResult.legalBasis).toBe('public-interest');
    });

    it('should allow transfers for legal claims', async () => {
      // Test legal claims transfer
      const dataSubject = await createTestDataSubject();
      
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'legal-proceedings',
        legalBasis: 'legal-claims'
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(true);
      expect(transferResult.legalBasis).toBe('legal-claims');
    });

    it('should allow transfers for vital interests', async () => {
      // Test vital interests transfer
      const dataSubject = await createTestDataSubject();
      
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'medical-emergency',
        legalBasis: 'vital-interests'
      });
      
      const transferResult = await privata.executeDataTransfer(transferRequest.id);
      
      expect(transferResult.approved).toBe(true);
      expect(transferResult.legalBasis).toBe('vital-interests');
    });
  });

  describe('Transfer Monitoring and Compliance', () => {
    it('should monitor ongoing transfers for compliance', async () => {
      // Test transfer monitoring
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'ongoing-processing'
      });
      
      await privata.executeDataTransfer(transferRequest.id);
      
      const monitoring = await privata.monitorTransferCompliance(transferRequest.id);
      
      expect(monitoring.status).toBeDefined();
      expect(monitoring.complianceChecks).toBeDefined();
      expect(monitoring.violations).toBeDefined();
    });

    it('should maintain transfer audit trail', async () => {
      // Test transfer audit logging
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'data-processing'
      });
      
      await privata.executeDataTransfer(transferRequest.id);
      
      const auditLog = await privata.getTransferAuditLog(transferRequest.id);
      
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].transferId).toBe(transferRequest.id);
      expect(auditLog[0].destination).toBe('united-states');
      expect(auditLog[0].timestamp).toBeDefined();
    });

    it('should handle transfer suspension and termination', async () => {
      // Test transfer control
      const dataSubject = await createTestDataSubject();
      const transferRequest = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'data-processing'
      });
      
      await privata.executeDataTransfer(transferRequest.id);
      
      const suspension = await privata.suspendDataTransfer(transferRequest.id, {
        reason: 'compliance-violation'
      });
      
      expect(suspension.suspended).toBe(true);
      expect(suspension.reason).toBe('compliance-violation');
    });
  });
});
```

---

## 📊 Integration and Stress Testing

### End-to-End GDPR Compliance

```typescript
describe('GDPR End-to-End Compliance', () => {
  describe('Complete Data Subject Journey', () => {
    it('should handle complete data subject lifecycle with full GDPR compliance', async () => {
      // Test complete lifecycle
      const dataSubject = await createTestDataSubject();
      
      // 1. Data collection with minimization
      await privata.collectData(dataSubject.id, {
        purpose: 'user-registration',
        dataFields: ['name', 'email', 'phone']
      });
      
      // 2. Consent management
      await privata.grantConsent(dataSubject.id, 'marketing');
      await privata.grantConsent(dataSubject.id, 'analytics');
      
      // 3. Data processing with privacy by design
      await privata.processData(dataSubject.id, {
        operation: 'personalization',
        privacyLevel: 'high'
      });
      
      // 4. Data subject rights exercise
      const accessRequest = await privata.requestDataAccess(dataSubject.id);
      expect(accessRequest).toBeDefined();
      
      // 5. Data rectification
      await privata.rectifyPersonalData({
        dataSubjectId: dataSubject.id,
        corrections: { name: 'Updated Name' }
      });
      
      // 6. Consent withdrawal
      await privata.withdrawConsent(dataSubject.id, 'marketing');
      
      // 7. Data erasure
      await privata.requestErasure(dataSubject.id, {
        reason: 'consent-withdrawal'
      });
      
      // Verify complete compliance throughout lifecycle
      const complianceReport = await privata.getComplianceReport(dataSubject.id);
      expect(complianceReport.gdprCompliant).toBe(true);
    });
  });

  describe('Multi-Controller Scenarios', () => {
    it('should handle data sharing between controllers with proper safeguards', async () => {
      // Test multi-controller compliance
      const dataSubject = await createTestDataSubject();
      const controller1 = await createTestController();
      const controller2 = await createTestController();
      
      // Data sharing with proper agreements
      await privata.shareData(dataSubject.id, {
        fromController: controller1.id,
        toController: controller2.id,
        purpose: 'joint-processing',
        safeguards: 'data-sharing-agreement'
      });
      
      // Verify both controllers maintain compliance
      const compliance1 = await privata.getControllerCompliance(controller1.id);
      const compliance2 = await privata.getControllerCompliance(controller2.id);
      
      expect(compliance1.gdprCompliant).toBe(true);
      expect(compliance2.gdprCompliant).toBe(true);
    });
  });

  describe('Cross-Border Processing', () => {
    it('should handle cross-border processing with appropriate safeguards', async () => {
      // Test cross-border compliance
      const dataSubject = await createTestDataSubject();
      
      // EU to US transfer with SCCs
      const transfer = await privata.requestDataTransfer(dataSubject.id, {
        destination: 'united-states',
        purpose: 'cloud-processing',
        safeguards: 'standard-contractual-clauses'
      });
      
      await privata.executeDataTransfer(transfer.id);
      
      // Verify transfer compliance
      const transferCompliance = await privata.getTransferCompliance(transfer.id);
      expect(transferCompliance.compliant).toBe(true);
      expect(transferCompliance.safeguards).toBe('standard-contractual-clauses');
    });
  });
});
```

### Stress Testing for Compliance

```typescript
describe('GDPR Compliance Stress Testing', () => {
  describe('High-Volume Data Subject Rights', () => {
    it('should handle 10,000 concurrent access requests', async () => {
      // Test high-volume access requests
      const dataSubjects = await createTestDataSubjects(10000);
      
      const startTime = Date.now();
      const accessRequests = await Promise.all(
        dataSubjects.map(subject => 
          privata.requestDataAccess(subject.id)
        )
      );
      const processingTime = Date.now() - startTime;
      
      expect(accessRequests).toHaveLength(10000);
      expect(processingTime).toBeLessThan(300000); // 5 minutes
      
      // Verify all requests are GDPR compliant
      const complianceChecks = await Promise.all(
        accessRequests.map(request => 
          privata.verifyAccessRequestCompliance(request.id)
        )
      );
      
      expect(complianceChecks.every(check => check.compliant)).toBe(true);
    });

    it('should handle 5,000 concurrent erasure requests', async () => {
      // Test high-volume erasure requests
      const dataSubjects = await createTestDataSubjects(5000);
      
      const startTime = Date.now();
      const erasureRequests = await Promise.all(
        dataSubjects.map(subject => 
          privata.requestErasure(subject.id, { reason: 'consent-withdrawal' })
        )
      );
      const processingTime = Date.now() - startTime;
      
      expect(erasureRequests).toHaveLength(5000);
      expect(processingTime).toBeLessThan(600000); // 10 minutes
      
      // Verify all erasures are GDPR compliant
      const complianceChecks = await Promise.all(
        erasureRequests.map(request => 
          privata.verifyErasureCompliance(request.id)
        )
      );
      
      expect(complianceChecks.every(check => check.compliant)).toBe(true);
    });
  });

  describe('Large-Scale Data Breach Response', () => {
    it('should handle breach notification for 1 million affected data subjects', async () => {
      // Test large-scale breach response
      const dataSubjects = await createTestDataSubjects(1000000);
      const breach = await privata.simulateDataBreach(dataSubjects[0].id, {
        type: 'mass-data-breach',
        severity: 'high',
        affectedSubjects: 1000000
      });
      
      const startTime = Date.now();
      
      // Notify supervisory authority
      await privata.notifySupervisoryAuthority(breach.id);
      
      // Notify affected data subjects
      const notifications = await privata.notifyAffectedDataSubjects(breach.id);
      
      const processingTime = Date.now() - startTime;
      
      expect(notifications.sent).toBe(1000000);
      expect(processingTime).toBeLessThan(3600000); // 1 hour
      
      // Verify all notifications are GDPR compliant
      const complianceReport = await privata.getBreachNotificationCompliance(breach.id);
      expect(complianceReport.compliant).toBe(true);
      expect(complianceReport.authorityNotified).toBe(true);
      expect(complianceReport.dataSubjectsNotified).toBe(true);
    });
  });

  describe('Complex Multi-Purpose Processing', () => {
    it('should handle complex processing with multiple legal bases', async () => {
      // Test complex processing scenarios
      const dataSubject = await createTestDataSubject();
      
      // Multiple processing purposes with different legal bases
      const processingActivities = [
        { purpose: 'user-registration', legalBasis: 'contract' },
        { purpose: 'marketing', legalBasis: 'consent' },
        { purpose: 'analytics', legalBasis: 'legitimate-interest' },
        { purpose: 'fraud-prevention', legalBasis: 'legal-obligation' },
        { purpose: 'medical-research', legalBasis: 'public-interest' }
      ];
      
      const startTime = Date.now();
      
      const results = await Promise.all(
        processingActivities.map(activity => 
          privata.processData(dataSubject.id, activity)
        )
      );
      
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(5);
      expect(processingTime).toBeLessThan(30000); // 30 seconds
      
      // Verify all processing is GDPR compliant
      const complianceChecks = await Promise.all(
        results.map(result => 
          privata.verifyProcessingCompliance(result.id)
        )
      );
      
      expect(complianceChecks.every(check => check.compliant)).toBe(true);
    });
  });
});
```

---

## 📋 Test Implementation Checklist

### Phase 1: Core Data Subject Rights (Articles 15-22)
- [ ] Article 15 - Right of Access tests
- [ ] Article 16 - Right to Rectification tests
- [ ] Article 17 - Right to Erasure tests
- [ ] Article 18 - Right to Restriction tests
- [ ] Article 20 - Right to Data Portability tests
- [ ] Article 21 - Right to Object tests
- [ ] Article 22 - Automated Decision Making tests

### Phase 2: Data Protection Principles (Article 5)
- [ ] Data Minimization tests
- [ ] Purpose Limitation tests
- [ ] Storage Limitation tests
- [ ] Accuracy tests
- [ ] Integrity and Confidentiality tests
- [ ] Accountability tests

### Phase 3: Privacy by Design (Article 25)
- [ ] Data Protection by Design tests
- [ ] Data Protection by Default tests
- [ ] Technical and Organizational Measures tests
- [ ] Privacy Impact Assessment tests

### Phase 4: Data Breach Management (Articles 33-34)
- [ ] Controller Breach Notification tests
- [ ] Data Subject Breach Notification tests
- [ ] Breach Response and Mitigation tests

### Phase 5: Cross-Border Transfers (Articles 44-49)
- [ ] Transfer Adequacy Assessment tests
- [ ] Appropriate Safeguards tests
- [ ] Derogations tests
- [ ] Transfer Monitoring tests

### Phase 6: Integration and Stress Testing
- [ ] End-to-End Compliance tests
- [ ] Multi-Controller Scenarios tests
- [ ] Cross-Border Processing tests
- [ ] High-Volume Rights Exercise tests
- [ ] Large-Scale Breach Response tests
- [ ] Complex Multi-Purpose Processing tests

---

## 🎯 Success Criteria

### Compliance Verification
- ✅ All GDPR articles tested with comprehensive coverage
- ✅ Legal requirements mapped to technical implementations
- ✅ Edge cases and exceptions properly handled
- ✅ Performance requirements met under stress
- ✅ Audit trails maintained for all operations
- ✅ Data subject rights fully implemented and tested

### Quality Assurance
- ✅ 100% test coverage for GDPR compliance features
- ✅ Automated compliance monitoring and reporting
- ✅ Real-time violation detection and alerting
- ✅ Comprehensive audit logging and reporting
- ✅ Performance benchmarks met under load
- ✅ Security and privacy by design verified

This comprehensive GDPR compliance test suite ensures that Privata meets every requirement of the General Data Protection Regulation, providing confidence that healthcare applications using Privata will be fully compliant with EU data protection law.
