#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { MigrationEngine } from './core/MigrationEngine';
import { ProjectAnalyzer } from './analyzers/ProjectAnalyzer';
import { CodeTransformer } from './transformers/CodeTransformer';
import { ReportGenerator } from './reporters/ReportGenerator';
import { ConfigManager } from './config/ConfigManager';
import { Logger } from './utils/Logger';

const program = new Command();

program
  .name('privata-migrate')
  .description('Automated migration CLI tool for GDPR/HIPAA compliance with Privata')
  .version('1.0.0');

// Main migration command
program
  .command('migrate')
  .description('Migrate an existing application to use Privata compliance features')
  .option('-p, --path <path>', 'Path to the project to migrate', process.cwd())
  .option('-t, --type <type>', 'Project type (react, node, express, nextjs, vue, angular)', 'auto')
  .option('-o, --output <path>', 'Output path for migration results', './privata-migration')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--dry-run', 'Preview changes without applying them', false)
  .option('--force', 'Force migration even if conflicts are detected', false)
  .option('--backup', 'Create backup before migration', true)
  .option('--verbose', 'Verbose output', false)
  .action(async (options) => {
    const logger = new Logger(options.verbose);
    const spinner = ora('Initializing migration...').start();

    try {
      // Initialize migration engine
      const migrationEngine = new MigrationEngine({
        projectPath: options.path,
        projectType: options.type,
        outputPath: options.output,
        dryRun: options.dryRun,
        force: options.force,
        backup: options.backup,
        verbose: options.verbose,
      });

      spinner.text = 'Analyzing project structure...';
      const analyzer = new ProjectAnalyzer(migrationEngine);
      const analysis = await analyzer.analyze();

      spinner.text = 'Detecting compliance requirements...';
      const complianceAnalysis = await analyzer.analyzeComplianceRequirements();

      spinner.text = 'Generating migration plan...';
      const migrationPlan = await migrationEngine.generateMigrationPlan(analysis, complianceAnalysis);

      if (options.dryRun) {
        spinner.succeed('Migration plan generated successfully!');
        await showMigrationPlan(migrationPlan, options);
        return;
      }

      // Confirm migration
      const confirmed = await confirmMigration(migrationPlan, options);
      if (!confirmed) {
        spinner.fail('Migration cancelled by user');
        return;
      }

      spinner.text = 'Applying transformations...';
      const transformer = new CodeTransformer(migrationEngine);
      const results = await transformer.transform(migrationPlan);

      spinner.text = 'Generating reports...';
      const reportGenerator = new ReportGenerator(migrationEngine);
      const report = await reportGenerator.generateReport(results);

      spinner.succeed('Migration completed successfully!');
      
      // Show results
      showMigrationResults(results, report, options);

    } catch (error) {
      spinner.fail('Migration failed');
      logger.error('Migration error:', error);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze a project for compliance requirements without migration')
  .option('-p, --path <path>', 'Path to the project to analyze', process.cwd())
  .option('-t, --type <type>', 'Project type (react, node, express, nextjs, vue, angular)', 'auto')
  .option('-o, --output <file>', 'Output file for analysis report', './privata-analysis.json')
  .option('--verbose', 'Verbose output', false)
  .action(async (options) => {
    const logger = new Logger(options.verbose);
    const spinner = ora('Analyzing project...').start();

    try {
      const migrationEngine = new MigrationEngine({
        projectPath: options.path,
        projectType: options.type,
        verbose: options.verbose,
      });

      const analyzer = new ProjectAnalyzer(migrationEngine);
      const analysis = await analyzer.analyze();
      const complianceAnalysis = await analyzer.analyzeComplianceRequirements();

      spinner.succeed('Analysis completed successfully!');
      
      // Show analysis results
      showAnalysisResults(analysis, complianceAnalysis, options);

    } catch (error) {
      spinner.fail('Analysis failed');
      logger.error('Analysis error:', error);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage migration configuration')
  .option('--init', 'Initialize configuration file', false)
  .option('--show', 'Show current configuration', false)
  .option('--validate', 'Validate configuration file', false)
  .action(async (options) => {
    const configManager = new ConfigManager();

    if (options.init) {
      await configManager.initConfig();
      console.log(chalk.green('Configuration file initialized successfully!'));
    } else if (options.show) {
      const config = await configManager.loadConfig();
      console.log(chalk.blue('Current configuration:'));
      console.log(JSON.stringify(config, null, 2));
    } else if (options.validate) {
      const isValid = await configManager.validateConfig({});
      if (isValid) {
        console.log(chalk.green('Configuration is valid!'));
      } else {
        console.log(chalk.red('Configuration is invalid!'));
        process.exit(1);
      }
    }
  });

// Template command
program
  .command('template')
  .description('Generate migration templates')
  .option('-t, --type <type>', 'Template type (react, node, express, nextjs, vue, angular)')
  .option('-o, --output <path>', 'Output path for template', './privata-template')
  .action(async (options) => {
    const spinner = ora('Generating template...').start();

    try {
      // Generate template based on type
      const templateGenerator = new (await import('./templates/TemplateGenerator')).TemplateGenerator();
      await templateGenerator.generate(options.type, options.output);
      
      spinner.succeed('Template generated successfully!');
      console.log(chalk.green(`Template created at: ${options.output}`));
    } catch (error) {
      spinner.fail('Template generation failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Helper functions
async function showMigrationPlan(plan: any, options: any) {
  console.log(chalk.blue('\n📋 Migration Plan:'));
  console.log(chalk.gray('='.repeat(50)));
  
  console.log(chalk.yellow('\n🔍 Project Analysis:'));
  console.log(`  • Project Type: ${plan.projectType}`);
  console.log(`  • Files to Transform: ${plan.filesToTransform.length}`);
  console.log(`  • Dependencies to Add: ${plan.dependenciesToAdd.length}`);
  console.log(`  • Dependencies to Remove: ${plan.dependenciesToRemove.length}`);
  
  console.log(chalk.yellow('\n🛡️ Compliance Features:'));
  plan.complianceFeatures.forEach((feature: any) => {
    console.log(`  • ${feature.name}: ${feature.status}`);
  });
  
  console.log(chalk.yellow('\n📁 Files to Transform:'));
  plan.filesToTransform.forEach((file: any) => {
    console.log(`  • ${file.path}: ${file.transformations.length} transformations`);
  });
  
  console.log(chalk.yellow('\n📦 Dependencies:'));
  plan.dependenciesToAdd.forEach((dep: any) => {
    console.log(`  • + ${dep.name}@${dep.version}`);
  });
  plan.dependenciesToRemove.forEach((dep: any) => {
    console.log(`  • - ${dep.name}`);
  });
  
  console.log(chalk.yellow('\n⚠️ Potential Issues:'));
  plan.issues.forEach((issue: any) => {
    console.log(`  • ${issue.severity}: ${issue.message}`);
  });
}

async function confirmMigration(plan: any, options: any): Promise<boolean> {
  if (options.force) return true;
  
  const questions = [
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to proceed with the migration?',
      default: true,
    },
  ];
  
  const answers = await inquirer.prompt(questions);
  return answers.confirm;
}

function showMigrationResults(results: any, report: any, options: any) {
  console.log(chalk.green('\n✅ Migration Results:'));
  console.log(chalk.gray('='.repeat(50)));
  
  console.log(chalk.yellow('\n📊 Summary:'));
  console.log(`  • Files Transformed: ${results.filesTransformed}`);
  console.log(`  • Dependencies Added: ${results.dependenciesAdded}`);
  console.log(`  • Dependencies Removed: ${results.dependenciesRemoved}`);
  console.log(`  • Compliance Features Added: ${results.complianceFeaturesAdded}`);
  
  console.log(chalk.yellow('\n📁 Generated Files:'));
  results.generatedFiles.forEach((file: any) => {
    console.log(`  • ${file.path}: ${file.description}`);
  });
  
  console.log(chalk.yellow('\n📋 Next Steps:'));
  console.log('  1. Review the generated files');
  console.log('  2. Install new dependencies: npm install');
  console.log('  3. Update your configuration');
  console.log('  4. Test your application');
  console.log('  5. Deploy with confidence!');
  
  console.log(chalk.blue(`\n📄 Detailed report: ${report.path}`));
}

function showAnalysisResults(analysis: any, complianceAnalysis: any, options: any) {
  console.log(chalk.blue('\n📊 Analysis Results:'));
  console.log(chalk.gray('='.repeat(50)));
  
  console.log(chalk.yellow('\n🔍 Project Structure:'));
  console.log(`  • Project Type: ${analysis.projectType}`);
  console.log(`  • Framework: ${analysis.framework}`);
  console.log(`  • Language: ${analysis.language}`);
  console.log(`  • Total Files: ${analysis.totalFiles}`);
  console.log(`  • Lines of Code: ${analysis.linesOfCode}`);
  
  console.log(chalk.yellow('\n🛡️ Compliance Analysis:'));
  console.log(`  • GDPR Compliance: ${complianceAnalysis.gdpr.score}/100`);
  console.log(`  • HIPAA Compliance: ${complianceAnalysis.hipaa.score}/100`);
  console.log(`  • Data Protection: ${complianceAnalysis.dataProtection.score}/100`);
  console.log(`  • Privacy Controls: ${complianceAnalysis.privacyControls.score}/100`);
  
  console.log(chalk.yellow('\n⚠️ Issues Found:'));
  complianceAnalysis.issues.forEach((issue: any) => {
    console.log(`  • ${issue.severity}: ${issue.message} (${issue.file})`);
  });
  
  console.log(chalk.yellow('\n💡 Recommendations:'));
  complianceAnalysis.recommendations.forEach((rec: any) => {
    console.log(`  • ${rec.priority}: ${rec.message}`);
  });
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled Rejection:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse();

