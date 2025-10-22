import { MigrationEngine } from '../core/MigrationEngine';
import { FileSystem } from '../utils/FileSystem';
import { Logger } from '../utils/Logger';
import { ProjectType, ComplianceAnalysis } from '../types';

export class ProjectAnalyzer {
  private fileSystem: FileSystem;
  private logger: Logger;

  constructor(private migrationEngine: MigrationEngine) {
    this.fileSystem = new FileSystem(migrationEngine.logger);
    this.logger = migrationEngine.logger;
  }

  async analyze(): Promise<any> {
    this.logger.info('Starting project analysis...');

    const projectPath = this.migrationEngine.options.projectPath;
    const analysis = {
      projectType: 'unknown',
      framework: 'unknown',
      language: 'unknown',
      totalFiles: 0,
      linesOfCode: 0,
      files: [],
      packageJson: null,
      dependencies: [],
      devDependencies: [],
      scripts: {},
      ormUsage: {},
      ormFiles: [],
      apiFiles: [],
      dataFiles: [],
      testFiles: [],
      configFiles: [],
      conflictingDependencies: [],
      complexDependencies: [],
      existingCompliance: false,
      customImplementations: [],
      testCoverage: 0,
      hasDatabaseConfig: false,
      hasSecurityConfig: false,
      hasPrivacyConfig: false,
    };

    try {
      // Analyze package.json
      await this.analyzePackageJson(projectPath, analysis);

      // Analyze file structure
      await this.analyzeFileStructure(projectPath, analysis);

      // Analyze code patterns
      await this.analyzeCodePatterns(projectPath, analysis);

      // Analyze dependencies
      await this.analyzeDependencies(analysis);

      // Analyze existing compliance
      await this.analyzeExistingCompliance(projectPath, analysis);

      // Calculate metrics
      this.calculateMetrics(analysis);

      this.logger.info('Project analysis completed successfully');
      return analysis;

    } catch (error) {
      this.logger.error('Project analysis failed:', error);
      throw error;
    }
  }

  async analyzeComplianceRequirements(): Promise<ComplianceAnalysis> {
    this.logger.info('Analyzing compliance requirements...');

    const analysis = await this.analyze();
    const complianceAnalysis: ComplianceAnalysis = {
      gdpr: {
        score: 0,
        requirements: [],
        issues: [],
        recommendations: [],
      },
      hipaa: {
        score: 0,
        requirements: [],
        issues: [],
        recommendations: [],
      },
      dataProtection: {
        score: 0,
        requirements: [],
        issues: [],
        recommendations: [],
      },
      privacyControls: {
        score: 0,
        requirements: [],
        issues: [],
        recommendations: [],
      },
      issues: [],
      recommendations: [],
      overallScore: 0,
    };

    // Analyze GDPR compliance
    await this.analyzeGDPRCompliance(analysis, complianceAnalysis);

    // Analyze HIPAA compliance
    await this.analyzeHIPAACompliance(analysis, complianceAnalysis);

    // Analyze data protection
    await this.analyzeDataProtection(analysis, complianceAnalysis);

    // Analyze privacy controls
    await this.analyzePrivacyControls(analysis, complianceAnalysis);

    // Calculate overall score
    complianceAnalysis.overallScore = this.calculateOverallScore(complianceAnalysis);

    this.logger.info('Compliance analysis completed successfully');
    return complianceAnalysis;
  }

  private async analyzePackageJson(projectPath: string, analysis: any): Promise<void> {
    const packageJsonPath = `${projectPath}/package.json`;
    
    if (await this.fileSystem.exists(packageJsonPath)) {
      const packageJson = await this.fileSystem.readJson(packageJsonPath);
      analysis.packageJson = packageJson;
      analysis.dependencies = Object.keys(packageJson.dependencies || {});
      analysis.devDependencies = Object.keys(packageJson.devDependencies || {});
      analysis.scripts = packageJson.scripts || {};

      // Detect project type from dependencies
      if (packageJson.dependencies?.react) {
        analysis.framework = 'react';
        analysis.projectType = 'react';
      } else if (packageJson.dependencies?.vue) {
        analysis.framework = 'vue';
        analysis.projectType = 'vue';
      } else if (packageJson.dependencies?.['@angular/core']) {
        analysis.framework = 'angular';
        analysis.projectType = 'angular';
      } else if (packageJson.dependencies?.next) {
        analysis.framework = 'nextjs';
        analysis.projectType = 'nextjs';
      } else if (packageJson.dependencies?.express) {
        analysis.framework = 'express';
        analysis.projectType = 'express';
      } else if (packageJson.dependencies?.['@nestjs/core']) {
        analysis.framework = 'nestjs';
        analysis.projectType = 'nestjs';
      } else {
        analysis.projectType = 'node';
      }
    }
  }

  private async analyzeFileStructure(projectPath: string, analysis: any): Promise<void> {
    const files = await this.fileSystem.readDir(projectPath, { recursive: true });
    analysis.totalFiles = files.length;

    for (const file of files) {
      const filePath = `${projectPath}/${file}`;
      const fileInfo = await this.analyzeFile(filePath);
      
      if (fileInfo) {
        analysis.files.push(fileInfo);
        analysis.linesOfCode += fileInfo.linesOfCode;

        // Categorize files
        if (fileInfo.type === 'typescript' || fileInfo.type === 'javascript') {
          if (this.containsORMUsage(fileInfo.content)) {
            analysis.ormFiles.push(fileInfo);
            this.analyzeORMUsage(fileInfo, analysis);
          }
          
          if (this.containsAPIEndpoints(fileInfo.content)) {
            analysis.apiFiles.push(fileInfo);
          }
          
          if (this.containsDataHandling(fileInfo.content)) {
            analysis.dataFiles.push(fileInfo);
          }
          
          if (this.containsTests(fileInfo.content)) {
            analysis.testFiles.push(fileInfo);
          }
        }

        if (fileInfo.type === 'config') {
          analysis.configFiles.push(fileInfo);
        }
      }
    }
  }

  private async analyzeFile(filePath: string): Promise<any> {
    try {
      const content = await this.fileSystem.readFile(filePath);
      const extension = filePath.split('.').pop()?.toLowerCase();
      
      let type = 'unknown';
      if (extension && ['ts', 'tsx'].includes(extension)) {
        type = 'typescript';
      } else if (extension && ['js', 'jsx'].includes(extension)) {
        type = 'javascript';
      } else if (extension && ['json'].includes(extension)) {
        type = 'config';
      } else if (extension && ['css', 'scss', 'sass'].includes(extension)) {
        type = 'stylesheet';
      } else if (extension && ['html'].includes(extension)) {
        type = 'markup';
      }

      return {
        path: filePath,
        type,
        content,
        linesOfCode: content.split('\n').length,
        size: content.length,
      };
    } catch (error) {
      this.logger.debug(`Failed to analyze file ${filePath}:`, error);
      return null;
    }
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

  private containsTests(content: string): boolean {
    const testPatterns = [
      /describe\(/g,
      /it\(/g,
      /test\(/g,
      /expect\(/g,
      /jest\./g,
      /mocha/g,
      /chai/g,
    ];

    return testPatterns.some(pattern => pattern.test(content));
  }

  private analyzeORMUsage(fileInfo: any, analysis: any): void {
    const content = fileInfo.content;

    if (content.includes('mongoose')) {
      analysis.ormUsage.mongoose = true;
    }
    if (content.includes('prisma')) {
      analysis.ormUsage.prisma = true;
    }
    if (content.includes('typeorm')) {
      analysis.ormUsage.typeorm = true;
    }
    if (content.includes('sequelize')) {
      analysis.ormUsage.sequelize = true;
    }
    if (content.includes('drizzle')) {
      analysis.ormUsage.drizzle = true;
    }
  }

  private async analyzeCodePatterns(projectPath: string, analysis: any): Promise<void> {
    // Analyze code patterns for compliance requirements
    for (const file of analysis.files) {
      if (file.type === 'typescript' || file.type === 'javascript') {
        await this.analyzeCodePattern(file, analysis);
      }
    }
  }

  private async analyzeCodePattern(file: any, analysis: any): Promise<void> {
    const content = file.content;

    // Check for existing compliance implementations
    if (content.includes('gdpr') || content.includes('hipaa') || content.includes('privacy')) {
      analysis.existingCompliance = true;
    }

    // Check for custom implementations
    if (content.includes('custom') && (content.includes('compliance') || content.includes('privacy'))) {
      analysis.customImplementations.push({
        file: file.path,
        type: 'custom-compliance',
      });
    }

    // Check for database configuration
    if (content.includes('database') || content.includes('mongodb') || content.includes('postgresql')) {
      analysis.hasDatabaseConfig = true;
    }

    // Check for security configuration
    if (content.includes('security') || content.includes('encryption') || content.includes('auth')) {
      analysis.hasSecurityConfig = true;
    }

    // Check for privacy configuration
    if (content.includes('privacy') || content.includes('consent') || content.includes('data-protection')) {
      analysis.hasPrivacyConfig = true;
    }
  }

  private async analyzeDependencies(analysis: any): Promise<void> {
    // Check for conflicting dependencies
    const conflictingDeps = [
      'privacy-policy',
      'gdpr-compliance',
      'hipaa-compliance',
      'data-protection',
    ];

    for (const dep of conflictingDeps) {
      if (analysis.dependencies.includes(dep)) {
        analysis.conflictingDependencies.push(dep);
      }
    }

    // Check for complex dependencies
    const complexDeps = [
      'webpack',
      'babel',
      'typescript',
      'eslint',
      'prettier',
    ];

    for (const dep of complexDeps) {
      if (analysis.dependencies.includes(dep) || analysis.devDependencies.includes(dep)) {
        analysis.complexDependencies.push(dep);
      }
    }
  }

  private async analyzeExistingCompliance(projectPath: string, analysis: any): Promise<void> {
    // Check for existing compliance files
    const complianceFiles = [
      'privacy-policy.html',
      'terms-of-service.html',
      'gdpr-compliance.js',
      'hipaa-compliance.js',
      'data-protection.js',
    ];

    for (const file of complianceFiles) {
      if (await this.fileSystem.exists(`${projectPath}/${file}`)) {
        analysis.existingCompliance = true;
        break;
      }
    }
  }

  private calculateMetrics(analysis: any): void {
    // Calculate test coverage
    if (analysis.testFiles.length > 0) {
      analysis.testCoverage = Math.round((analysis.testFiles.length / analysis.totalFiles) * 100);
    }

    // Calculate complexity score
    let complexityScore = 0;
    complexityScore += analysis.complexDependencies.length * 2;
    complexityScore += analysis.customImplementations.length * 3;
    complexityScore += analysis.conflictingDependencies.length * 2;
    analysis.complexityScore = complexityScore;
  }

  private async analyzeGDPRCompliance(analysis: any, complianceAnalysis: ComplianceAnalysis): Promise<void> {
    let score = 0;
    const requirements = [];
    const issues = [];
    const recommendations = [];

    // Check for GDPR Article 15 - Right to Access
    if (this.hasDataAccessEndpoint(analysis)) {
      score += 20;
      requirements.push('Article 15 - Right to Access: Implemented');
    } else {
      issues.push('Article 15 - Right to Access: Not implemented');
      recommendations.push('Implement data access endpoint');
    }

    // Check for GDPR Article 17 - Right to Erasure
    if (this.hasDataErasureEndpoint(analysis)) {
      score += 20;
      requirements.push('Article 17 - Right to Erasure: Implemented');
    } else {
      issues.push('Article 17 - Right to Erasure: Not implemented');
      recommendations.push('Implement data erasure endpoint');
    }

    // Check for GDPR Article 20 - Right to Data Portability
    if (this.hasDataPortabilityEndpoint(analysis)) {
      score += 20;
      requirements.push('Article 20 - Right to Data Portability: Implemented');
    } else {
      issues.push('Article 20 - Right to Data Portability: Not implemented');
      recommendations.push('Implement data portability endpoint');
    }

    // Check for consent management
    if (this.hasConsentManagement(analysis)) {
      score += 20;
      requirements.push('Consent Management: Implemented');
    } else {
      issues.push('Consent Management: Not implemented');
      recommendations.push('Implement consent management system');
    }

    // Check for data protection
    if (this.hasDataProtection(analysis)) {
      score += 20;
      requirements.push('Data Protection: Implemented');
    } else {
      issues.push('Data Protection: Not implemented');
      recommendations.push('Implement data protection measures');
    }

    complianceAnalysis.gdpr = {
      score,
      requirements,
      issues,
      recommendations,
    };
  }

  private async analyzeHIPAACompliance(analysis: any, complianceAnalysis: ComplianceAnalysis): Promise<void> {
    let score = 0;
    const requirements = [];
    const issues = [];
    const recommendations = [];

    // Check for HIPAA Administrative Safeguards
    if (this.hasAdministrativeSafeguards(analysis)) {
      score += 25;
      requirements.push('Administrative Safeguards: Implemented');
    } else {
      issues.push('Administrative Safeguards: Not implemented');
      recommendations.push('Implement administrative safeguards');
    }

    // Check for HIPAA Physical Safeguards
    if (this.hasPhysicalSafeguards(analysis)) {
      score += 25;
      requirements.push('Physical Safeguards: Implemented');
    } else {
      issues.push('Physical Safeguards: Not implemented');
      recommendations.push('Implement physical safeguards');
    }

    // Check for HIPAA Technical Safeguards
    if (this.hasTechnicalSafeguards(analysis)) {
      score += 25;
      requirements.push('Technical Safeguards: Implemented');
    } else {
      issues.push('Technical Safeguards: Not implemented');
      recommendations.push('Implement technical safeguards');
    }

    // Check for breach notification
    if (this.hasBreachNotification(analysis)) {
      score += 25;
      requirements.push('Breach Notification: Implemented');
    } else {
      issues.push('Breach Notification: Not implemented');
      recommendations.push('Implement breach notification system');
    }

    complianceAnalysis.hipaa = {
      score,
      requirements,
      issues,
      recommendations,
    };
  }

  private async analyzeDataProtection(analysis: any, complianceAnalysis: ComplianceAnalysis): Promise<void> {
    let score = 0;
    const requirements = [];
    const issues = [];
    const recommendations = [];

    // Check for encryption
    if (this.hasEncryption(analysis)) {
      score += 25;
      requirements.push('Encryption: Implemented');
    } else {
      issues.push('Encryption: Not implemented');
      recommendations.push('Implement encryption for sensitive data');
    }

    // Check for pseudonymization
    if (this.hasPseudonymization(analysis)) {
      score += 25;
      requirements.push('Pseudonymization: Implemented');
    } else {
      issues.push('Pseudonymization: Not implemented');
      recommendations.push('Implement pseudonymization for personal data');
    }

    // Check for data minimization
    if (this.hasDataMinimization(analysis)) {
      score += 25;
      requirements.push('Data Minimization: Implemented');
    } else {
      issues.push('Data Minimization: Not implemented');
      recommendations.push('Implement data minimization practices');
    }

    // Check for purpose limitation
    if (this.hasPurposeLimitation(analysis)) {
      score += 25;
      requirements.push('Purpose Limitation: Implemented');
    } else {
      issues.push('Purpose Limitation: Not implemented');
      recommendations.push('Implement purpose limitation for data processing');
    }

    complianceAnalysis.dataProtection = {
      score,
      requirements,
      issues,
      recommendations,
    };
  }

  private async analyzePrivacyControls(analysis: any, complianceAnalysis: ComplianceAnalysis): Promise<void> {
    let score = 0;
    const requirements = [];
    const issues = [];
    const recommendations = [];

    // Check for privacy settings
    if (this.hasPrivacySettings(analysis)) {
      score += 25;
      requirements.push('Privacy Settings: Implemented');
    } else {
      issues.push('Privacy Settings: Not implemented');
      recommendations.push('Implement privacy settings interface');
    }

    // Check for data export
    if (this.hasDataExport(analysis)) {
      score += 25;
      requirements.push('Data Export: Implemented');
    } else {
      issues.push('Data Export: Not implemented');
      recommendations.push('Implement data export functionality');
    }

    // Check for data deletion
    if (this.hasDataDeletion(analysis)) {
      score += 25;
      requirements.push('Data Deletion: Implemented');
    } else {
      issues.push('Data Deletion: Not implemented');
      recommendations.push('Implement data deletion functionality');
    }

    // Check for consent management
    if (this.hasConsentManagement(analysis)) {
      score += 25;
      requirements.push('Consent Management: Implemented');
    } else {
      issues.push('Consent Management: Not implemented');
      recommendations.push('Implement consent management system');
    }

    complianceAnalysis.privacyControls = {
      score,
      requirements,
      issues,
      recommendations,
    };
  }

  private hasDataAccessEndpoint(analysis: any): boolean {
    // Check if data access endpoint exists
    for (const file of analysis.apiFiles) {
      if (file.content.includes('data-access') || file.content.includes('user-data')) {
        return true;
      }
    }
    return false;
  }

  private hasDataErasureEndpoint(analysis: any): boolean {
    // Check if data erasure endpoint exists
    for (const file of analysis.apiFiles) {
      if (file.content.includes('data-erasure') || file.content.includes('delete-user')) {
        return true;
      }
    }
    return false;
  }

  private hasDataPortabilityEndpoint(analysis: any): boolean {
    // Check if data portability endpoint exists
    for (const file of analysis.apiFiles) {
      if (file.content.includes('data-export') || file.content.includes('data-portability')) {
        return true;
      }
    }
    return false;
  }

  private hasConsentManagement(analysis: any): boolean {
    // Check if consent management exists
    for (const file of analysis.files) {
      if (file.content.includes('consent') && file.content.includes('management')) {
        return true;
      }
    }
    return false;
  }

  private hasDataProtection(analysis: any): boolean {
    // Check if data protection exists
    for (const file of analysis.files) {
      if (file.content.includes('encryption') || file.content.includes('data-protection')) {
        return true;
      }
    }
    return false;
  }

  private hasAdministrativeSafeguards(analysis: any): boolean {
    // Check if administrative safeguards exist
    for (const file of analysis.files) {
      if (file.content.includes('administrative') && file.content.includes('safeguards')) {
        return true;
      }
    }
    return false;
  }

  private hasPhysicalSafeguards(analysis: any): boolean {
    // Check if physical safeguards exist
    for (const file of analysis.files) {
      if (file.content.includes('physical') && file.content.includes('safeguards')) {
        return true;
      }
    }
    return false;
  }

  private hasTechnicalSafeguards(analysis: any): boolean {
    // Check if technical safeguards exist
    for (const file of analysis.files) {
      if (file.content.includes('technical') && file.content.includes('safeguards')) {
        return true;
      }
    }
    return false;
  }

  private hasBreachNotification(analysis: any): boolean {
    // Check if breach notification exists
    for (const file of analysis.files) {
      if (file.content.includes('breach') && file.content.includes('notification')) {
        return true;
      }
    }
    return false;
  }

  private hasEncryption(analysis: any): boolean {
    // Check if encryption exists
    for (const file of analysis.files) {
      if (file.content.includes('encryption') || file.content.includes('crypto')) {
        return true;
      }
    }
    return false;
  }

  private hasPseudonymization(analysis: any): boolean {
    // Check if pseudonymization exists
    for (const file of analysis.files) {
      if (file.content.includes('pseudonym') || file.content.includes('anonymize')) {
        return true;
      }
    }
    return false;
  }

  private hasDataMinimization(analysis: any): boolean {
    // Check if data minimization exists
    for (const file of analysis.files) {
      if (file.content.includes('data-minimization') || file.content.includes('minimize')) {
        return true;
      }
    }
    return false;
  }

  private hasPurposeLimitation(analysis: any): boolean {
    // Check if purpose limitation exists
    for (const file of analysis.files) {
      if (file.content.includes('purpose') && file.content.includes('limitation')) {
        return true;
      }
    }
    return false;
  }

  private hasPrivacySettings(analysis: any): boolean {
    // Check if privacy settings exist
    for (const file of analysis.files) {
      if (file.content.includes('privacy-settings') || file.content.includes('privacy-controls')) {
        return true;
      }
    }
    return false;
  }

  private hasDataExport(analysis: any): boolean {
    // Check if data export exists
    for (const file of analysis.files) {
      if (file.content.includes('data-export') || file.content.includes('export-data')) {
        return true;
      }
    }
    return false;
  }

  private hasDataDeletion(analysis: any): boolean {
    // Check if data deletion exists
    for (const file of analysis.files) {
      if (file.content.includes('data-deletion') || file.content.includes('delete-data')) {
        return true;
      }
    }
    return false;
  }

  private calculateOverallScore(complianceAnalysis: ComplianceAnalysis): number {
    const scores = [
      complianceAnalysis.gdpr.score,
      complianceAnalysis.hipaa.score,
      complianceAnalysis.dataProtection.score,
      complianceAnalysis.privacyControls.score,
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
}

