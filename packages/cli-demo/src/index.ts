#!/usr/bin/env node

/**
 * Privata CLI Demo - Main Entry Point
 * Interactive demonstration of GDPR/HIPAA compliance features
 */

import { Command } from 'commander';
import { CliUI } from './utils/cli-ui';
import { setupCommand } from './commands/setup';
import { inspectCommand, inspectSeparationCommand } from './commands/inspect';
import { gdprDemonstrationCommand } from './commands/gdpr';
import { hipaaDemonstrationCommand, hipaaComplianceScoreCommand } from './commands/hipaa';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('privata-demo')
  .description('Interactive CLI demonstration of Privata GDPR/HIPAA compliance')
  .version('1.0.0');

// Setup command
program
  .command('setup')
  .description('Initialize databases and seed sample data')
  .option('-p, --patients <number>', 'Number of patients to generate', '10')
  .option('-a, --audit-logs <number>', 'Number of audit logs to generate', '50')
  .option('-c, --clear', 'Clear existing data before setup', false)
  .action(async (options) => {
    try {
      await setupCommand({
        patients: parseInt(options.patients),
        auditLogs: parseInt(options.auditLogs),
        clear: options.clear
      });
    } catch (error) {
      console.error('Setup failed:', error);
      process.exit(1);
    }
  });

// Inspect command
program
  .command('inspect <database>')
  .description('View database contents (identity, clinical, audit, separation)')
  .option('-l, --limit <number>', 'Limit number of records', '10')
  .option('-i, --id <id>', 'View specific record by ID')
  .action(async (database, options) => {
    try {
      if (database === 'separation') {
        await inspectSeparationCommand();
      } else {
        await inspectCommand(database as 'identity' | 'clinical' | 'audit', {
          limit: parseInt(options.limit),
          id: options.id
        });
      }
    } catch (error) {
      console.error('Inspect failed:', error);
      process.exit(1);
    }
  });

// GDPR demonstration
program
  .command('gdpr [article]')
  .description('Demonstrate GDPR compliance (articles: 15, 16, 17, 18, 20, 21, 22)')
  .action(async (article) => {
    try {
      await gdprDemonstrationCommand(article);
    } catch (error) {
      console.error('GDPR demonstration failed:', error);
      process.exit(1);
    }
  });

// HIPAA demonstration
program
  .command('hipaa [safeguard]')
  .description('Demonstrate HIPAA compliance (safeguards: minimum-necessary, audit, access, integrity, breach)')
  .action(async (safeguard) => {
    try {
      await hipaaDemonstrationCommand(safeguard);
    } catch (error) {
      console.error('HIPAA demonstration failed:', error);
      process.exit(1);
    }
  });

// Compliance score
program
  .command('compliance-score')
  .description('Display overall compliance score')
  .action(async () => {
    try {
      await hipaaComplianceScoreCommand();
    } catch (error) {
      console.error('Compliance score failed:', error);
      process.exit(1);
    }
  });

// Interactive demo
program
  .command('run')
  .description('Run full interactive demonstration')
  .action(async () => {
    try {
      await interactiveDemonstration();
    } catch (error) {
      console.error('Interactive demonstration failed:', error);
      process.exit(1);
    }
  });

/**
 * Interactive demonstration flow
 */
async function interactiveDemonstration(): Promise<void> {
  CliUI.clear();
  CliUI.banner();
  CliUI.header('INTERACTIVE PRIVATA DEMONSTRATION', '=');

  CliUI.info('Welcome to the Privata interactive demonstration!');
  CliUI.info('This demo will walk you through:');
  CliUI.info('  • Database setup and data separation');
  CliUI.info('  • GDPR compliance (Articles 15-22)');
  CliUI.info('  • HIPAA compliance (Privacy & Security Rules)');
  CliUI.info('  • Audit logging and compliance verification\n');

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Would you like to proceed with the demonstration?',
      default: true
    }
  ]);

  if (!proceed) {
    CliUI.info('Demonstration cancelled.');
    return;
  }

  // Check if databases are set up
  try {
    const { SqliteAdapter } = require('./database/sqlite-adapter');
    const db = new SqliteAdapter();
    const stats = db.getStatistics();
    db.close();

    if (stats.identity.total === 0) {
      CliUI.warning('\nNo data found. Running setup first...');
      await setupCommand({ patients: 10, auditLogs: 50 });
      await CliUI.pressEnter('Press ENTER to continue...');
    }
  } catch (error) {
    CliUI.warning('\nDatabases not initialized. Running setup...');
    await setupCommand({ patients: 10, auditLogs: 50 });
    await CliUI.pressEnter('Press ENTER to continue...');
  }

  // Main menu loop
  let running = true;
  while (running) {
    CliUI.clear();
    CliUI.banner();

    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to demonstrate?',
        choices: [
          { name: '📊 View Database Separation', value: 'separation' },
          { name: '🆔 Inspect Identity Database (PII)', value: 'identity' },
          { name: '🏥 Inspect Clinical Database (PHI)', value: 'clinical' },
          { name: '📋 Inspect Audit Logs', value: 'audit' },
          { name: '🇪🇺 GDPR Compliance Demo (All Articles)', value: 'gdpr-all' },
          { name: '📖 GDPR Article 15 (Right of Access)', value: 'gdpr-15' },
          { name: '✏️  GDPR Article 17 (Right to Erasure)', value: 'gdpr-17' },
          { name: '🏥 HIPAA Compliance Demo (All Safeguards)', value: 'hipaa-all' },
          { name: '🔒 HIPAA Minimum Necessary', value: 'hipaa-minimum' },
          { name: '📋 HIPAA Audit Controls', value: 'hipaa-audit' },
          { name: '🎯 View Compliance Score', value: 'score' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);

    try {
      switch (choice) {
        case 'separation':
          await inspectSeparationCommand();
          break;
        case 'identity':
          await inspectCommand('identity', { limit: 10 });
          break;
        case 'clinical':
          await inspectCommand('clinical', { limit: 10 });
          break;
        case 'audit':
          await inspectCommand('audit', { limit: 20 });
          break;
        case 'gdpr-all':
          await gdprDemonstrationCommand();
          break;
        case 'gdpr-15':
          await gdprDemonstrationCommand('15');
          break;
        case 'gdpr-17':
          await gdprDemonstrationCommand('17');
          break;
        case 'hipaa-all':
          await hipaaDemonstrationCommand();
          break;
        case 'hipaa-minimum':
          await hipaaDemonstrationCommand('minimum-necessary');
          break;
        case 'hipaa-audit':
          await hipaaDemonstrationCommand('audit');
          break;
        case 'score':
          await hipaaComplianceScoreCommand();
          break;
        case 'exit':
          running = false;
          CliUI.success('\nThank you for using Privata Demo!', '👋');
          CliUI.info('Learn more at: https://github.com/privata/privata');
          continue;
      }

      if (running) {
        await CliUI.pressEnter('\nPress ENTER to return to main menu...');
      }
    } catch (error) {
      CliUI.error(`Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await CliUI.pressEnter('\nPress ENTER to return to main menu...');
    }
  }
}

// Parse command line arguments
if (process.argv.length < 3) {
  // No command provided, show help
  CliUI.clear();
  CliUI.banner();
  CliUI.info('Run "privata-demo run" for interactive demonstration');
  CliUI.info('Run "privata-demo --help" for all available commands\n');
  program.parse(process.argv);
} else {
  program.parse(process.argv);
}
