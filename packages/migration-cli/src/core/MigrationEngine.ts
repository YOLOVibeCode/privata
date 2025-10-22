import { ProjectAnalyzer } from '../analyzers/ProjectAnalyzer';
import { CodeTransformer } from '../transformers/CodeTransformer';
import { ReportGenerator } from '../reporters/ReportGenerator';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';
import { FileSystem } from '../utils/FileSystem';
import { ProjectType, MigrationPlan, MigrationResults, ComplianceAnalysis } from '../types';

export interface MigrationEngineOptions {
  projectPath: string;
  projectType: ProjectType | 'auto';
  outputPath?: string;
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;
  verbose?: boolean;
}

export class MigrationEngine {
  private analyzer: ProjectAnalyzer;
  private transformer: CodeTransformer;
  private reportGenerator: ReportGenerator;
  private configManager: ConfigManager;
  private fileSystem: FileSystem;
  public logger: Logger;

  public options: MigrationEngineOptions;

  constructor(options: MigrationEngineOptions) {
    this.options = options;
    this.logger = new Logger(options.verbose);
    this.fileSystem = new FileSystem(this.logger);
    this.configManager = new ConfigManager();
    this.analyzer = new ProjectAnalyzer(this);
    this.transformer = new CodeTransformer(this);
    this.reportGenerator = new ReportGenerator(this);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing migration engine...');
    
    // Load configuration
    const config = await this.configManager.loadConfig();
    this.logger.debug('Configuration loaded:', config);

    // Validate project path
    if (!await this.fileSystem.exists(this.options.projectPath)) {
      throw new Error(`Project path does not exist: ${this.options.projectPath}`);
    }

    // Create output directory if needed
    if (this.options.outputPath) {
      await this.fileSystem.ensureDir(this.options.outputPath);
    }

    // Create backup if requested
    if (this.options.backup && !this.options.dryRun) {
      await this.createBackup();
    }

    this.logger.info('Migration engine initialized successfully');
  }

  async generateMigrationPlan(
    analysis: any,
    complianceAnalysis: ComplianceAnalysis
  ): Promise<MigrationPlan> {
    this.logger.info('Generating migration plan...');

    const plan: MigrationPlan = {
      projectType: this.detectProjectType(analysis),
      filesToTransform: await this.identifyFilesToTransform(analysis),
      dependenciesToAdd: await this.identifyDependenciesToAdd(analysis),
      dependenciesToRemove: await this.identifyDependenciesToRemove(analysis),
      complianceFeatures: await this.identifyComplianceFeatures(complianceAnalysis),
      transformations: await this.planTransformations(analysis, complianceAnalysis),
      issues: await this.identifyPotentialIssues(analysis, complianceAnalysis),
      estimatedTime: this.estimateMigrationTime(analysis),
      riskLevel: this.assessRiskLevel(analysis, complianceAnalysis),
    };

    this.logger.info('Migration plan generated successfully');
    return plan;
  }

  async executeMigration(plan: MigrationPlan): Promise<MigrationResults> {
    this.logger.info('Executing migration...');

    if (this.options.dryRun) {
      this.logger.info('Dry run mode - no changes will be applied');
      return this.simulateMigration(plan);
    }

    const results: MigrationResults = {
      filesTransformed: 0,
      dependenciesAdded: 0,
      dependenciesRemoved: 0,
      complianceFeaturesAdded: 0,
      generatedFiles: [],
      errors: [],
      warnings: [],
      executionTime: 0,
    };

    const startTime = Date.now();

    try {
      // Execute transformations
      for (const transformation of plan.transformations) {
        await this.transformer.transform(transformation);
        results.filesTransformed++;
      }

      // Update dependencies
      await this.updateDependencies(plan.dependenciesToAdd, plan.dependenciesToRemove);
      results.dependenciesAdded = plan.dependenciesToAdd.length;
      results.dependenciesRemoved = plan.dependenciesToRemove.length;

      // Generate new files
      for (const feature of plan.complianceFeatures) {
        if (feature.status === 'add') {
          await this.generateComplianceFeature(feature);
          results.complianceFeaturesAdded++;
        }
      }

      results.executionTime = Date.now() - startTime;
      this.logger.info(`Migration completed in ${results.executionTime}ms`);

    } catch (error) {
      results.errors.push({
        message: error.message,
        file: 'migration',
        line: 0,
        severity: 'error',
      });
      throw error;
    }

    return results;
  }

  private detectProjectType(analysis: any): ProjectType {
    if (this.options.projectType !== 'auto') {
      return this.options.projectType as ProjectType;
    }

    // Auto-detect project type based on analysis
    if (analysis.packageJson?.dependencies?.react) {
      return 'react';
    } else if (analysis.packageJson?.dependencies?.vue) {
      return 'vue';
    } else if (analysis.packageJson?.dependencies?.['@angular/core']) {
      return 'angular';
    } else if (analysis.packageJson?.dependencies?.next) {
      return 'nextjs';
    } else if (analysis.packageJson?.dependencies?.express) {
      return 'express';
    } else if (analysis.packageJson?.dependencies?.['@nestjs/core']) {
      return 'nestjs';
    } else {
      return 'node';
    }
  }

  private async identifyFilesToTransform(analysis: any): Promise<any[]> {
    const filesToTransform: any[] = [];

    // Identify files that need transformation based on analysis
    for (const file of analysis.files) {
      if (this.needsTransformation(file, analysis)) {
        filesToTransform.push({
          path: file.path,
          type: file.type,
          transformations: await this.identifyTransformations(file, analysis),
        });
      }
    }

    return filesToTransform;
  }

  private needsTransformation(file: any, analysis: any): boolean {
    // Check if file needs transformation based on content and type
    if (file.type === 'typescript' || file.type === 'javascript') {
      // Check for ORM usage
      if (this.containsORMUsage(file.content)) {
        return true;
      }
      
      // Check for data handling
      if (this.containsDataHandling(file.content)) {
        return true;
      }
      
      // Check for API endpoints
      if (this.containsAPIEndpoints(file.content)) {
        return true;
      }
    }

    return false;
  }

  private containsORMUsage(content: string): boolean {
    const ormPatterns = [
      /mongoose\./g,
      /prisma\./g,
      /typeorm/g,
      /sequelize\./g,
      /drizzle/g,
      /\.findOne\(/g,
      /\.findMany\(/g,
      /\.create\(/g,
      /\.update\(/g,
      /\.delete\(/g,
    ];

    return ormPatterns.some(pattern => pattern.test(content));
  }

  private containsDataHandling(content: string): boolean {
    const dataPatterns = [
      /user\./g,
      /patient\./g,
      /personal.*data/g,
      /health.*data/g,
      /medical.*record/g,
      /privacy/g,
      /consent/g,
      /gdpr/g,
      /hipaa/g,
    ];

    return dataPatterns.some(pattern => pattern.test(content));
  }

  private containsAPIEndpoints(content: string): boolean {
    const apiPatterns = [
      /app\.get\(/g,
      /app\.post\(/g,
      /app\.put\(/g,
      /app\.delete\(/g,
      /router\./g,
      /@Get\(/g,
      /@Post\(/g,
      /@Put\(/g,
      /@Delete\(/g,
    ];

    return apiPatterns.some(pattern => pattern.test(content));
  }

  private async identifyTransformations(file: any, analysis: any): Promise<any[]> {
    const transformations: any[] = [];

    // Identify specific transformations needed for this file
    if (this.containsORMUsage(file.content)) {
      transformations.push({
        type: 'orm-migration',
        description: 'Migrate ORM usage to Privata compliance',
        priority: 'high',
      });
    }

    if (this.containsDataHandling(file.content)) {
      transformations.push({
        type: 'data-handling',
        description: 'Add data protection and compliance features',
        priority: 'high',
      });
    }

    if (this.containsAPIEndpoints(file.content)) {
      transformations.push({
        type: 'api-compliance',
        description: 'Add GDPR/HIPAA compliance to API endpoints',
        priority: 'medium',
      });
    }

    return transformations;
  }

  private async identifyDependenciesToAdd(analysis: any): Promise<any[]> {
    const dependencies: any[] = [];

    // Add Privata core
    dependencies.push({
      name: '@privata/core',
      version: 'latest',
      reason: 'Core Privata functionality',
    });

    // Add React components if React project
    if (analysis.projectType === 'react' || analysis.framework === 'react') {
      dependencies.push({
        name: '@privata/react',
        version: 'latest',
        reason: 'React components for GDPR/HIPAA compliance',
      });
    }

    // Add specific ORM adapters based on detected usage
    if (analysis.ormUsage?.mongoose) {
      dependencies.push({
        name: '@privata/mongoose',
        version: 'latest',
        reason: 'Mongoose adapter for Privata',
      });
    }

    if (analysis.ormUsage?.prisma) {
      dependencies.push({
        name: '@privata/prisma',
        version: 'latest',
        reason: 'Prisma adapter for Privata',
      });
    }

    return dependencies;
  }

  private async identifyDependenciesToRemove(analysis: any): Promise<any[]> {
    const dependencies: any[] = [];

    // Identify dependencies that might conflict with Privata
    const conflictingDeps = [
      'privacy-policy',
      'gdpr-compliance',
      'hipaa-compliance',
      'data-protection',
    ];

    for (const dep of conflictingDeps) {
      if (analysis.packageJson?.dependencies?.[dep]) {
        dependencies.push({
          name: dep,
          reason: 'Replaced by Privata compliance features',
        });
      }
    }

    return dependencies;
  }

  private async identifyComplianceFeatures(complianceAnalysis: ComplianceAnalysis): Promise<any[]> {
    const features: any[] = [];

    // GDPR features
    if (complianceAnalysis.gdpr.score < 80) {
      features.push({
        name: 'GDPR Compliance',
        type: 'gdpr',
        status: 'add',
        description: 'Complete GDPR compliance implementation',
        priority: 'high',
      });
    }

    // HIPAA features
    if (complianceAnalysis.hipaa.score < 80) {
      features.push({
        name: 'HIPAA Compliance',
        type: 'hipaa',
        status: 'add',
        description: 'Complete HIPAA compliance implementation',
        priority: 'high',
      });
    }

    // Data protection features
    if (complianceAnalysis.dataProtection.score < 80) {
      features.push({
        name: 'Data Protection',
        type: 'data-protection',
        status: 'add',
        description: 'Enhanced data protection features',
        priority: 'high',
      });
    }

    // Privacy controls
    if (complianceAnalysis.privacyControls.score < 80) {
      features.push({
        name: 'Privacy Controls',
        type: 'privacy-controls',
        status: 'add',
        description: 'User privacy control interface',
        priority: 'medium',
      });
    }

    return features;
  }

  private async planTransformations(analysis: any, complianceAnalysis: ComplianceAnalysis): Promise<any[]> {
    const transformations: any[] = [];

    // Plan ORM transformations
    if (analysis.ormUsage) {
      transformations.push({
        type: 'orm-migration',
        files: analysis.ormFiles,
        description: 'Migrate ORM usage to Privata compliance',
        priority: 'high',
      });
    }

    // Plan API transformations
    if (analysis.apiFiles) {
      transformations.push({
        type: 'api-compliance',
        files: analysis.apiFiles,
        description: 'Add compliance features to API endpoints',
        priority: 'high',
      });
    }

    // Plan data handling transformations
    if (analysis.dataFiles) {
      transformations.push({
        type: 'data-protection',
        files: analysis.dataFiles,
        description: 'Add data protection features',
        priority: 'high',
      });
    }

    return transformations;
  }

  private async identifyPotentialIssues(analysis: any, complianceAnalysis: ComplianceAnalysis): Promise<any[]> {
    const issues: any[] = [];

    // Check for potential conflicts
    if (analysis.conflictingDependencies?.length > 0) {
      issues.push({
        severity: 'warning',
        message: 'Conflicting dependencies detected',
        details: analysis.conflictingDependencies,
      });
    }

    // Check for missing configurations
    if (!analysis.hasDatabaseConfig) {
      issues.push({
        severity: 'error',
        message: 'Database configuration not found',
        details: 'Privata requires database configuration',
      });
    }

    // Check for existing compliance implementations
    if (analysis.existingCompliance) {
      issues.push({
        severity: 'warning',
        message: 'Existing compliance implementation detected',
        details: 'May conflict with Privata implementation',
      });
    }

    return issues;
  }

  private estimateMigrationTime(analysis: any): number {
    // Estimate migration time based on project complexity
    let baseTime = 30; // 30 minutes base
    
    baseTime += analysis.totalFiles * 0.5; // 30 seconds per file
    baseTime += analysis.ormFiles?.length * 2; // 2 minutes per ORM file
    baseTime += analysis.apiFiles?.length * 1; // 1 minute per API file
    
    return Math.round(baseTime);
  }

  private assessRiskLevel(analysis: any, complianceAnalysis: ComplianceAnalysis): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Check for complex dependencies
    if (analysis.complexDependencies?.length > 0) {
      riskScore += 2;
    }

    // Check for existing compliance
    if (analysis.existingCompliance) {
      riskScore += 3;
    }

    // Check for custom implementations
    if (analysis.customImplementations?.length > 0) {
      riskScore += 2;
    }

    // Check for test coverage
    if (analysis.testCoverage < 50) {
      riskScore += 1;
    }

    if (riskScore <= 2) return 'low';
    if (riskScore <= 5) return 'medium';
    return 'high';
  }

  private async createBackup(): Promise<void> {
    const backupPath = `${this.options.projectPath}.backup.${Date.now()}`;
    await this.fileSystem.copyDir(this.options.projectPath, backupPath);
    this.logger.info(`Backup created at: ${backupPath}`);
  }

  private async updateDependencies(dependenciesToAdd: any[], dependenciesToRemove: any[]): Promise<void> {
    // Update package.json with new dependencies
    const packageJsonPath = `${this.options.projectPath}/package.json`;
    const packageJson = await this.fileSystem.readJson(packageJsonPath);

    // Add new dependencies
    for (const dep of dependenciesToAdd) {
      packageJson.dependencies[dep.name] = dep.version;
    }

    // Remove old dependencies
    for (const dep of dependenciesToRemove) {
      delete packageJson.dependencies[dep.name];
    }

    await this.fileSystem.writeJson(packageJsonPath, packageJson);
  }

  private async generateComplianceFeature(feature: any): Promise<void> {
    // Generate compliance feature files based on type
    switch (feature.type) {
      case 'gdpr':
        await this.generateGDPRFeature();
        break;
      case 'hipaa':
        await this.generateHIPAAFeature();
        break;
      case 'data-protection':
        await this.generateDataProtectionFeature();
        break;
      case 'privacy-controls':
        await this.generatePrivacyControlsFeature();
        break;
    }
  }

  private async generateGDPRFeature(): Promise<void> {
    // Generate GDPR compliance files
    const gdprConfig = {
      articles: [15, 16, 17, 18, 20, 21, 22],
      features: ['data-access', 'data-rectification', 'data-erasure', 'data-portability'],
    };

    await this.fileSystem.writeJson(
      `${this.options.outputPath}/gdpr-config.json`,
      gdprConfig
    );
  }

  private async generateHIPAAFeature(): Promise<void> {
    // Generate HIPAA compliance files
    const hipaaConfig = {
      safeguards: ['administrative', 'physical', 'technical'],
      features: ['access-control', 'audit-logging', 'breach-notification'],
    };

    await this.fileSystem.writeJson(
      `${this.options.outputPath}/hipaa-config.json`,
      hipaaConfig
    );
  }

  private async generateDataProtectionFeature(): Promise<void> {
    // Generate data protection files
    const dataProtectionConfig = {
      encryption: true,
      pseudonymization: true,
      dataMinimization: true,
      purposeLimitation: true,
    };

    await this.fileSystem.writeJson(
      `${this.options.outputPath}/data-protection-config.json`,
      dataProtectionConfig
    );
  }

  private async generatePrivacyControlsFeature(): Promise<void> {
    // Generate privacy controls files
    const privacyControlsConfig = {
      consentManagement: true,
      dataExport: true,
      dataDeletion: true,
      privacySettings: true,
    };

    await this.fileSystem.writeJson(
      `${this.options.outputPath}/privacy-controls-config.json`,
      privacyControlsConfig
    );
  }

  private async simulateMigration(plan: MigrationPlan): Promise<MigrationResults> {
    // Simulate migration for dry run
    return {
      filesTransformed: plan.filesToTransform.length,
      dependenciesAdded: plan.dependenciesToAdd.length,
      dependenciesRemoved: plan.dependenciesToRemove.length,
      complianceFeaturesAdded: plan.complianceFeatures.length,
      generatedFiles: [],
      errors: [],
      warnings: [],
      executionTime: 0,
    };
  }

  // Getters for other classes
  get options() { return this.options; }
  get logger() { return this.logger; }
  get fileSystem() { return this.fileSystem; }
}

