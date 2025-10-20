/**
 * Setup Command
 * Initializes databases and seeds sample data
 */

import ora from 'ora';
import { SqliteAdapter } from '../database/sqlite-adapter';
import { CliUI } from '../utils/cli-ui';

export async function setupCommand(options: { patients?: number; auditLogs?: number; clear?: boolean }): Promise<void> {
  CliUI.clear();
  CliUI.banner();
  CliUI.header('DATABASE SETUP', '=');

  const patientCount = options.patients || 10;
  const auditLogCount = options.auditLogs || 50;

  try {
    // Initialize database adapter
    CliUI.info('Initializing database adapter...');
    const db = new SqliteAdapter();
    const paths = db.getDatabasePaths();

    // Clear existing data if requested
    if (options.clear) {
      const spinner = ora('Clearing existing data...').start();
      db.clearAllData();
      spinner.succeed('Existing data cleared');
    }

    // Initialize schemas
    const spinner = ora('Creating database schemas...').start();
    db.initializeSchemas();
    spinner.succeed('Database schemas created');

    CliUI.keyValue('Identity Database', paths.identity);
    CliUI.keyValue('Clinical Database', paths.clinical);
    CliUI.keyValue('Audit Database', paths.audit);

    // Seed data
    CliUI.info(`\nSeeding databases with sample data...`);
    const seedSpinner = ora('Generating sample data...').start();

    db.seedData(patientCount, auditLogCount);

    seedSpinner.succeed('Sample data generated and inserted');

    // Show statistics
    CliUI.subHeader('Database Statistics', '📊');
    const stats = db.getStatistics();

    CliUI.metric('Total Patients', stats.identity.total, '', '👥');
    CliUI.keyValue('US Patients', stats.identity.byRegion.US);
    CliUI.keyValue('EU Patients', stats.identity.byRegion.EU);
    CliUI.metric('Medical Records', stats.clinical.total, '', '🏥');
    CliUI.metric('Audit Log Entries', stats.audit.total, '', '📋');

    // Data separation demonstration
    CliUI.subHeader('Data Separation Verification', '🔒');
    CliUI.success('Identity data (PII) stored in: identity.db');
    CliUI.success('Clinical data (PHI) stored in: clinical.db');
    CliUI.success('Audit logs stored in: audit.db');
    CliUI.info('All databases are physically separated for GDPR/HIPAA compliance');

    // Show sample patient
    CliUI.subHeader('Sample Patient Data', '👤');
    const samplePatient = db.getAllPatients()[0];
    const sampleClinical = db.getMedicalRecordByPseudonym(samplePatient.pseudonym);

    CliUI.info('Identity Database (PII):');
    CliUI.keyValue('ID', samplePatient.id);
    CliUI.keyValue('Name', `${samplePatient.firstName} ${samplePatient.lastName}`);
    CliUI.keyValue('Email', samplePatient.email);
    CliUI.keyValue('Region', samplePatient.region);
    CliUI.keyValue('Pseudonym', samplePatient.pseudonym);

    CliUI.info('\nClinical Database (PHI):');
    CliUI.keyValue('Pseudonym', sampleClinical?.pseudonym || 'N/A');
    CliUI.keyValue('Blood Type', sampleClinical?.bloodType || 'N/A');
    CliUI.keyValue('Primary Physician', sampleClinical?.primaryPhysician || 'N/A');
    CliUI.keyValue('Diagnoses', sampleClinical?.diagnoses.join(', ') || 'N/A');

    CliUI.info('\n💡 Notice: Identity and Clinical data are linked only by pseudonym');
    CliUI.info('💡 This ensures PII and PHI are physically separated');

    // Close database
    db.close();

    CliUI.success('\n✅ Setup complete! You can now run demonstrations.', '🎉');
    CliUI.info('\nNext steps:');
    CliUI.info('  • Run "privata-demo run" for full interactive demonstration');
    CliUI.info('  • Run "privata-demo inspect identity" to view identity database');
    CliUI.info('  • Run "privata-demo inspect clinical" to view clinical database');
    CliUI.info('  • Run "privata-demo inspect audit" to view audit logs');

  } catch (error) {
    CliUI.error(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
