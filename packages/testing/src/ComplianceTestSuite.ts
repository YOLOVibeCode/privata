import { Privata } from '@privata/core';

export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  verbose: boolean;
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    dataProtection: boolean;
    privacyControls: boolean;
  };
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    dataProtection: boolean;
    privacyControls: boolean;
  };
  metadata: Record<string, any>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    complianceScore: number;
  };
}

export class ComplianceTestSuite {
  private privata: Privata;
  private config: TestConfig;
  private results: TestResult[] = [];

  constructor(privata: Privata, config: TestConfig) {
    this.privata = privata;
    this.config = config;
  }

  async runAllTests(): Promise<TestSuite> {
    const startTime = Date.now();
    this.results = [];

    console.log('🧪 Running Privata Compliance Test Suite...');

    // GDPR Tests
    if (this.config.compliance.gdpr) {
      await this.runGDPRTests();
    }

    // HIPAA Tests
    if (this.config.compliance.hipaa) {
      await this.runHIPAATests();
    }

    // Data Protection Tests
    if (this.config.compliance.dataProtection) {
      await this.runDataProtectionTests();
    }

    // Privacy Controls Tests
    if (this.config.compliance.privacyControls) {
      await this.runPrivacyControlsTests();
    }

    const duration = Date.now() - startTime;
    const summary = this.calculateSummary(duration);

    console.log(`✅ Test suite completed in ${duration}ms`);
    console.log(`📊 Results: ${summary.passed}/${summary.total} passed`);

    return {
      name: 'Privata Compliance Test Suite',
      tests: this.results,
      summary,
    };
  }

  private async runGDPRTests(): Promise<void> {
    console.log('🔍 Running GDPR compliance tests...');

    // Article 15 - Right to Access
    await this.runTest('GDPR Article 15 - Right to Access', async () => {
      const userData = await this.privata.requestDataAccess('test-user', {
        includePII: true,
        includePHI: true,
        includeAuditLogs: true
      });
      
      if (!userData) {
        throw new Error('Data access request failed');
      }
      
      return { compliance: { gdpr: true } };
    });

    // Article 16 - Right to Rectification
    await this.runTest('GDPR Article 16 - Right to Rectification', async () => {
      const result = await this.privata.rectifyPersonalData({
        dataSubjectId: 'test-user',
        corrections: {
          name: 'Updated Name',
          email: 'updated@example.com'
        },
        reason: 'Test rectification',
        evidence: 'Automated test'
      });
      
      if (!result) {
        throw new Error('Data rectification failed');
      }
      
      return { compliance: { gdpr: true } };
    });

    // Article 17 - Right to Erasure
    await this.runTest('GDPR Article 17 - Right to Erasure', async () => {
      const result = await this.privata.erasePersonalData({
        dataSubjectId: 'test-user',
        reason: 'Test erasure',
        evidence: 'Automated test'
      });
      
      if (!result) {
        throw new Error('Data erasure failed');
      }
      
      return { compliance: { gdpr: true } };
    });

    // Article 18 - Right to Restriction
    await this.runTest('GDPR Article 18 - Right to Restriction', async () => {
      const result = await this.privata.restrictProcessing({
        dataSubjectId: 'test-user',
        restrictions: {
          marketing: false,
          analytics: false
        },
        reason: 'Test restriction',
        evidence: 'Automated test'
      });
      
      if (!result) {
        throw new Error('Processing restriction failed');
      }
      
      return { compliance: { gdpr: true } };
    });

    // Article 20 - Right to Data Portability
    await this.runTest('GDPR Article 20 - Right to Data Portability', async () => {
      const result = await this.privata.requestDataPortability({
        dataSubjectId: 'test-user',
        format: 'JSON',
        deliveryMethod: 'download'
      });
      
      if (!result) {
        throw new Error('Data portability failed');
      }
      
      return { compliance: { gdpr: true } };
    });

    // Article 21 - Right to Object
    await this.runTest('GDPR Article 21 - Right to Object', async () => {
      const result = await this.privata.objectToProcessing({
        dataSubjectId: 'test-user',
        objections: {
          marketing: true,
          analytics: true
        },
        reason: 'Test objection',
        evidence: 'Automated test'
      });
      
      if (!result) {
        throw new Error('Processing objection failed');
      }
      
      return { compliance: { gdpr: true } };
    });

    // Article 22 - Right to Automated Decision Review
    await this.runTest('GDPR Article 22 - Right to Automated Decision Review', async () => {
      const result = await this.privata.requestAutomatedDecisionReview({
        dataSubjectId: 'test-user',
        reason: 'Test automated decision review',
        evidence: 'Automated test'
      });
      
      if (!result) {
        throw new Error('Automated decision review failed');
      }
      
      return { compliance: { gdpr: true } };
    });
  }

  private async runHIPAATests(): Promise<void> {
    console.log('🔍 Running HIPAA compliance tests...');

    // Administrative Safeguards
    await this.runTest('HIPAA Administrative Safeguards', async () => {
      const safeguards = await this.privata.getAdministrativeSafeguards('test-user');
      
      if (!safeguards || safeguards.length === 0) {
        throw new Error('Administrative safeguards not implemented');
      }
      
      return { compliance: { hipaa: true } };
    });

    // Physical Safeguards
    await this.runTest('HIPAA Physical Safeguards', async () => {
      const safeguards = await this.privata.getPhysicalSafeguards('test-user');
      
      if (!safeguards || safeguards.length === 0) {
        throw new Error('Physical safeguards not implemented');
      }
      
      return { compliance: { hipaa: true } };
    });

    // Technical Safeguards
    await this.runTest('HIPAA Technical Safeguards', async () => {
      const safeguards = await this.privata.getTechnicalSafeguards('test-user');
      
      if (!safeguards || safeguards.length === 0) {
        throw new Error('Technical safeguards not implemented');
      }
      
      return { compliance: { hipaa: true } };
    });

    // PHI Access Control
    await this.runTest('HIPAA PHI Access Control', async () => {
      const access = await this.privata.requestPHIAccess({
        dataSubjectId: 'test-user',
        requestType: 'access',
        authorization: 'patient'
      });
      
      if (!access) {
        throw new Error('PHI access control failed');
      }
      
      return { compliance: { hipaa: true } };
    });

    // Breach Notification
    await this.runTest('HIPAA Breach Notification', async () => {
      const result = await this.privata.reportBreach({
        description: 'Test breach',
        affectedRecords: 1,
        severity: 'low',
        discoveredAt: new Date()
      });
      
      if (!result) {
        throw new Error('Breach notification failed');
      }
      
      return { compliance: { hipaa: true } };
    });

    // Audit Logging
    await this.runTest('HIPAA Audit Logging', async () => {
      const logs = await this.privata.getAuditLogs('test-user', {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date()
      });
      
      if (!logs || logs.length === 0) {
        throw new Error('Audit logging not implemented');
      }
      
      return { compliance: { hipaa: true } };
    });
  }

  private async runDataProtectionTests(): Promise<void> {
    console.log('🔍 Running data protection tests...');

    // Encryption
    await this.runTest('Data Encryption', async () => {
      const encrypted = await this.privata.encryptField('test-data', 'sensitive-field');
      
      if (!encrypted || encrypted === 'test-data') {
        throw new Error('Data encryption failed');
      }
      
      return { compliance: { dataProtection: true } };
    });

    // Pseudonymization
    await this.runTest('Data Pseudonymization', async () => {
      const pseudonymized = await this.privata.pseudonymizeData({
        name: 'John Doe',
        email: 'john@example.com'
      }, ['name', 'email']);
      
      if (!pseudonymized || pseudonymized.name === 'John Doe') {
        throw new Error('Data pseudonymization failed');
      }
      
      return { compliance: { dataProtection: true } };
    });

    // Data Minimization
    await this.runTest('Data Minimization', async () => {
      const minimized = await this.privata.minimizeData({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St'
      }, 'marketing');
      
      if (!minimized || minimized.phone || minimized.address) {
        throw new Error('Data minimization failed');
      }
      
      return { compliance: { dataProtection: true } };
    });

    // Purpose Limitation
    await this.runTest('Purpose Limitation', async () => {
      const limited = await this.privata.limitPurpose({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          medicalRecord: 'MR123456'
        },
        purpose: 'marketing'
      });
      
      if (!limited || limited.medicalRecord) {
        throw new Error('Purpose limitation failed');
      }
      
      return { compliance: { dataProtection: true } };
    });

    // Data Integrity
    await this.runTest('Data Integrity', async () => {
      const integrity = await this.privata.verifyDataIntegrity('test-data-id');
      
      if (!integrity) {
        throw new Error('Data integrity verification failed');
      }
      
      return { compliance: { dataProtection: true } };
    });
  }

  private async runPrivacyControlsTests(): Promise<void> {
    console.log('🔍 Running privacy controls tests...');

    // Consent Management
    await this.runTest('Consent Management', async () => {
      const consent = await this.privata.updateConsent('test-user', {
        analytics: true,
        marketing: false,
        personalization: true
      });
      
      if (!consent) {
        throw new Error('Consent management failed');
      }
      
      return { compliance: { privacyControls: true } };
    });

    // Data Export
    await this.runTest('Data Export', async () => {
      const exportData = await this.privata.exportData('test-user', 'JSON');
      
      if (!exportData) {
        throw new Error('Data export failed');
      }
      
      return { compliance: { privacyControls: true } };
    });

    // Data Deletion
    await this.runTest('Data Deletion', async () => {
      const result = await this.privata.deleteData('test-user', 'Test deletion', 'Automated test');
      
      if (!result) {
        throw new Error('Data deletion failed');
      }
      
      return { compliance: { privacyControls: true } };
    });

    // Privacy Settings
    await this.runTest('Privacy Settings', async () => {
      const settings = await this.privata.getPrivacySettings('test-user');
      
      if (!settings) {
        throw new Error('Privacy settings failed');
      }
      
      return { compliance: { privacyControls: true } };
    });
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        status: 'pass',
        duration,
        compliance: result.compliance || {},
        metadata: result.metadata || {}
      });
      
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.results.push({
        name,
        status: 'fail',
        duration,
        error: errorMessage,
        compliance: {
          gdpr: false,
          hipaa: false,
          dataProtection: false,
          privacyControls: false,
        },
        metadata: {},
      });
      
      console.log(`❌ ${name} - FAILED (${duration}ms): ${errorMessage}`);
    }
  }

  private calculateSummary(duration: number): TestSuite['summary'] {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    
    const complianceScore = this.calculateComplianceScore();
    
    return {
      total,
      passed,
      failed,
      skipped,
      duration,
      complianceScore
    };
  }

  private calculateComplianceScore(): number {
    const gdprTests = this.results.filter(r => r.name.includes('GDPR'));
    const hipaaTests = this.results.filter(r => r.name.includes('HIPAA'));
    const dataProtectionTests = this.results.filter(r => r.name.includes('Data'));
    const privacyTests = this.results.filter(r => r.name.includes('Privacy'));
    
    const gdprScore = gdprTests.length > 0 ? (gdprTests.filter(t => t.status === 'pass').length / gdprTests.length) * 100 : 0;
    const hipaaScore = hipaaTests.length > 0 ? (hipaaTests.filter(t => t.status === 'pass').length / hipaaTests.length) * 100 : 0;
    const dataProtectionScore = dataProtectionTests.length > 0 ? (dataProtectionTests.filter(t => t.status === 'pass').length / dataProtectionTests.length) * 100 : 0;
    const privacyScore = privacyTests.length > 0 ? (privacyTests.filter(t => t.status === 'pass').length / privacyTests.length) * 100 : 0;
    
    return Math.round((gdprScore + hipaaScore + dataProtectionScore + privacyScore) / 4);
  }

  // Public methods
  getResults(): TestResult[] {
    return [...this.results];
  }

  async generateReport(): Promise<string> {
    const summary = this.calculateSummary(0);
    
    return `
# Privata Compliance Test Report

## Summary
- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Skipped**: ${summary.skipped}
- **Duration**: ${summary.duration}ms
- **Compliance Score**: ${summary.complianceScore}%

## Test Results
${this.results.map(result => `
### ${result.name}
- **Status**: ${result.status.toUpperCase()}
- **Duration**: ${result.duration}ms
${result.error ? `- **Error**: ${result.error}` : ''}
`).join('')}

## Compliance Status
- **GDPR**: ${summary.complianceScore >= 80 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **HIPAA**: ${summary.complianceScore >= 80 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Data Protection**: ${summary.complianceScore >= 80 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Privacy Controls**: ${summary.complianceScore >= 80 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
`;
  }
}

