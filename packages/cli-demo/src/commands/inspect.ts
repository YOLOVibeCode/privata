/**
 * Inspect Command
 * View database contents and audit logs
 */

import { SqliteAdapter } from '../database/sqlite-adapter';
import { CliUI } from '../utils/cli-ui';

export async function inspectCommand(database: 'identity' | 'clinical' | 'audit', options: { limit?: number; id?: string }): Promise<void> {
  CliUI.clear();
  CliUI.banner();
  CliUI.header(`INSPECTING ${database.toUpperCase()} DATABASE`, '=');

  try {
    const db = new SqliteAdapter();
    const limit = options.limit || 10;

    switch (database) {
      case 'identity':
        await inspectIdentityDatabase(db, limit, options.id);
        break;

      case 'clinical':
        await inspectClinicalDatabase(db, limit, options.id);
        break;

      case 'audit':
        await inspectAuditDatabase(db, limit);
        break;

      default:
        CliUI.error(`Unknown database: ${database}`);
        CliUI.info('Valid options: identity, clinical, audit');
    }

    db.close();

  } catch (error) {
    CliUI.error(`Inspection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

async function inspectIdentityDatabase(db: SqliteAdapter, limit: number, id?: string): Promise<void> {
  CliUI.subHeader('Identity Database (PII)', '🆔');
  CliUI.info('Contains: Names, emails, addresses, phone numbers, dates of birth');
  CliUI.info('Purpose: Store personally identifiable information');
  CliUI.divider();

  if (id) {
    // Show specific patient
    const patient = db.getPatientById(id);
    if (!patient) {
      CliUI.error(`Patient not found: ${id}`);
      return;
    }

    CliUI.info('Patient Details:');
    CliUI.keyValue('ID', patient.id);
    CliUI.keyValue('Pseudonym', patient.pseudonym);
    CliUI.keyValue('Name', `${patient.firstName} ${patient.lastName}`);
    CliUI.keyValue('Email', patient.email);
    CliUI.keyValue('Phone', patient.phone);
    CliUI.keyValue('Address', `${patient.address}, ${patient.city}, ${patient.state} ${patient.zipCode}`);
    CliUI.keyValue('Country', patient.country);
    CliUI.keyValue('Region', patient.region);
    CliUI.keyValue('Date of Birth', patient.dateOfBirth);
    if (patient.ssn) CliUI.keyValue('SSN', patient.ssn);
    if (patient.nationalId) CliUI.keyValue('National ID', patient.nationalId);
    CliUI.keyValue('Consent Given', patient.consentGiven ? 'Yes' : 'No');
    CliUI.keyValue('Consent Date', patient.consentDate);
    CliUI.keyValue('Created At', patient.createdAt);
    CliUI.keyValue('Updated At', patient.updatedAt);

  } else {
    // Show all patients (limited)
    const patients = db.getAllPatients();
    const displayData = patients.slice(0, limit).map(p => ({
      ID: p.id.substring(0, 8) + '...',
      Pseudonym: p.pseudonym,
      Name: `${p.firstName} ${p.lastName}`,
      Email: p.email,
      Region: p.region,
      Consent: p.consentGiven ? '✓' : '✗'
    }));

    CliUI.printDatabaseTable('Patient Identity Records', displayData);

    const stats = db.getStatistics();
    CliUI.subHeader('Regional Distribution', '🌍');
    CliUI.metric('US Patients', stats.identity.byRegion.US, '', '🇺🇸');
    CliUI.metric('EU Patients', stats.identity.byRegion.EU, '', '🇪🇺');
  }

  CliUI.info('\n💡 This database contains PII that must be protected under GDPR');
}

async function inspectClinicalDatabase(db: SqliteAdapter, limit: number, id?: string): Promise<void> {
  CliUI.subHeader('Clinical Database (PHI)', '🏥');
  CliUI.info('Contains: Medical records, diagnoses, prescriptions, vital signs');
  CliUI.info('Purpose: Store protected health information');
  CliUI.info('⚠️  Notice: No direct patient identifiers - only pseudonyms');
  CliUI.divider();

  if (id) {
    // Show specific patient's clinical data
    const patient = db.getPatientById(id);
    if (!patient) {
      CliUI.error(`Patient not found: ${id}`);
      return;
    }

    const clinical = db.getMedicalRecordByPseudonym(patient.pseudonym);
    if (!clinical) {
      CliUI.error(`No clinical data found for patient: ${id}`);
      return;
    }

    CliUI.info('Clinical Record Details:');
    CliUI.keyValue('Record ID', clinical.id);
    CliUI.keyValue('Pseudonym', clinical.pseudonym);
    CliUI.keyValue('Blood Type', clinical.bloodType);
    CliUI.keyValue('Allergies', clinical.allergies.join(', '));
    CliUI.keyValue('Medications', clinical.medications.join(', '));
    CliUI.keyValue('Diagnoses', clinical.diagnoses.join(', '));
    CliUI.keyValue('Last Visit', clinical.lastVisitDate);
    CliUI.keyValue('Next Appointment', clinical.nextAppointmentDate || 'None scheduled');
    CliUI.keyValue('Primary Physician', clinical.primaryPhysician);
    CliUI.keyValue('Insurance Provider', clinical.insuranceProvider);
    CliUI.keyValue('Policy Number', clinical.policyNumber);
    CliUI.keyValue('Medical History', clinical.medicalHistory);

    CliUI.info('\nVital Signs:');
    CliUI.keyValue('Blood Pressure', clinical.vitalSigns.bloodPressure);
    CliUI.keyValue('Heart Rate', `${clinical.vitalSigns.heartRate} bpm`);
    CliUI.keyValue('Temperature', `${clinical.vitalSigns.temperature}°F`);
    CliUI.keyValue('Weight', `${clinical.vitalSigns.weight} lbs`);
    CliUI.keyValue('Height', `${clinical.vitalSigns.height} cm`);

  } else {
    // Show all clinical records (limited)
    const records = db.getAllMedicalRecords();
    const displayData = records.slice(0, limit).map(r => ({
      Pseudonym: r.pseudonym,
      'Blood Type': r.bloodType,
      Physician: r.primaryPhysician,
      'Last Visit': r.lastVisitDate,
      Diagnoses: r.diagnoses.join(', ')
    }));

    CliUI.printDatabaseTable('Medical Records', displayData);
  }

  CliUI.info('\n💡 This database contains PHI that must be protected under HIPAA');
  CliUI.info('💡 Notice: No names or emails - only pseudonyms for privacy');
}

async function inspectAuditDatabase(db: SqliteAdapter, limit: number): Promise<void> {
  CliUI.subHeader('Audit Log Database', '📋');
  CliUI.info('Contains: All access logs for PII and PHI');
  CliUI.info('Purpose: Compliance audit trail (6-year retention for HIPAA)');
  CliUI.divider();

  // Get recent audit logs
  const logs = db.getAuditLogs({ limit });

  if (logs.length === 0) {
    CliUI.warning('No audit logs found');
    return;
  }

  const displayData = logs.map(log => ({
    Timestamp: new Date(log.timestamp).toLocaleString(),
    Action: log.action,
    Resource: log.resourceType,
    'User Role': log.userRole,
    PHI: log.containsPHI ? '✓' : '✗',
    PII: log.containsPII ? '✓' : '✗',
    Success: log.success ? '✓' : '✗'
  }));

  CliUI.printDatabaseTable('Recent Audit Logs', displayData);

  // Statistics
  CliUI.subHeader('Audit Statistics', '📊');
  const stats = db.getStatistics();
  CliUI.metric('Total Audit Entries', stats.audit.total, '', '📋');

  const successLogs = logs.filter(l => l.success).length;
  const failedLogs = logs.filter(l => !l.success).length;
  const successRate = ((successLogs / logs.length) * 100).toFixed(1);

  CliUI.metric('Success Rate', successRate, '%', '✅');
  CliUI.keyValue('Successful Operations', successLogs);
  CliUI.keyValue('Failed Operations', failedLogs);

  const phiAccess = logs.filter(l => l.containsPHI).length;
  const piiAccess = logs.filter(l => l.containsPII).length;

  CliUI.metric('PHI Access Logs', phiAccess, '', '🏥');
  CliUI.metric('PII Access Logs', piiAccess, '', '🆔');

  // Action breakdown
  CliUI.subHeader('Action Breakdown', '🔍');
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([action, count]) => {
      CliUI.keyValue(action, count);
    });

  CliUI.info('\n💡 All PHI/PII access is automatically logged for compliance');
  CliUI.info('💡 Audit logs are immutable and retained for 6 years (HIPAA requirement)');
}

export async function inspectSeparationCommand(): Promise<void> {
  CliUI.clear();
  CliUI.banner();
  CliUI.header('DATA SEPARATION DEMONSTRATION', '=');

  try {
    const db = new SqliteAdapter();

    CliUI.subHeader('Physical Database Separation', '🔒');
    const paths = db.getDatabasePaths();
    CliUI.success('Identity Database (PII):', '🆔');
    CliUI.info(`   ${paths.identity}`);
    CliUI.success('Clinical Database (PHI):', '🏥');
    CliUI.info(`   ${paths.clinical}`);
    CliUI.success('Audit Database:', '📋');
    CliUI.info(`   ${paths.audit}`);

    CliUI.info('\n💡 Three physically separate SQLite databases');
    CliUI.info('💡 No PII exists in clinical database');
    CliUI.info('💡 No PHI exists in identity database');
    CliUI.info('💡 Linked only by cryptographic pseudonyms');

    // Show example
    CliUI.subHeader('Example: Data Linking via Pseudonym', '🔗');
    const patient = db.getAllPatients()[0];
    const clinical = db.getMedicalRecordByPseudonym(patient.pseudonym);

    CliUI.step(1, 'Identity Database Record');
    CliUI.keyValue('Patient ID', patient.id);
    CliUI.keyValue('Name', `${patient.firstName} ${patient.lastName}`);
    CliUI.keyValue('Email', patient.email);
    CliUI.keyValue('Pseudonym', patient.pseudonym);

    CliUI.step(2, 'Clinical Database Record');
    CliUI.keyValue('Pseudonym', clinical?.pseudonym || 'N/A');
    CliUI.keyValue('Blood Type', clinical?.bloodType || 'N/A');
    CliUI.keyValue('Diagnoses', clinical?.diagnoses.join(', ') || 'N/A');
    CliUI.info('   ⚠️  No name, email, or identifying information!');

    CliUI.step(3, 'Transparent Joining');
    CliUI.info('   Privata automatically joins data using pseudonyms');
    CliUI.info('   Application sees complete record');
    CliUI.info('   Physical separation maintained for compliance');

    // GDPR/HIPAA benefits
    CliUI.subHeader('Compliance Benefits', '✅');
    CliUI.success('GDPR Article 17 (Erasure)', '🇪🇺');
    CliUI.info('   Delete PII from identity DB, preserve PHI in clinical DB');

    CliUI.success('HIPAA Minimum Necessary', '🏥');
    CliUI.info('   Query clinical data without exposing PII');

    CliUI.success('Geographic Compliance', '🌍');
    CliUI.info('   EU data in EU database, US data in US database');

    db.close();

  } catch (error) {
    CliUI.error(`Inspection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
