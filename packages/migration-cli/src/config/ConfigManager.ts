import { FileSystem } from '../utils/FileSystem';
import { Logger } from '../utils/Logger';
import { MigrationConfig } from '../types';
import * as path from 'path';

export class ConfigManager {
  private fileSystem: FileSystem;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.fileSystem = new FileSystem(this.logger);
  }

  async loadConfig(configPath?: string): Promise<MigrationConfig> {
    const defaultConfigPath = configPath || './privata-migration.config.json';
    
    if (await this.fileSystem.exists(defaultConfigPath)) {
      try {
        const config = await this.fileSystem.readJson(defaultConfigPath);
        this.logger.debug('Configuration loaded from file:', config);
        return this.validateConfig(config);
      } catch (error) {
        this.logger.warn('Failed to load configuration file, using defaults:', error);
      }
    }

    return this.getDefaultConfig();
  }

  async saveConfig(config: MigrationConfig, configPath?: string): Promise<void> {
    const defaultConfigPath = configPath || './privata-migration.config.json';
    
    try {
      await this.fileSystem.writeJson(defaultConfigPath, config);
      this.logger.info('Configuration saved successfully');
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }

  async initConfig(configPath?: string): Promise<void> {
    const defaultConfigPath = configPath || './privata-migration.config.json';
    const defaultConfig = this.getDefaultConfig();
    
    try {
      await this.fileSystem.writeJson(defaultConfigPath, defaultConfig);
      this.logger.info(`Configuration file initialized at: ${defaultConfigPath}`);
    } catch (error) {
      this.logger.error('Failed to initialize configuration:', error);
      throw error;
    }
  }

  async validateConfig(config: any): Promise<boolean> {
    try {
      // Check required fields
      const requiredFields = ['projectPath', 'projectType', 'outputPath'];
      for (const field of requiredFields) {
        if (!config[field]) {
          this.logger.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate project type
      const validProjectTypes = ['react', 'vue', 'angular', 'nextjs', 'express', 'nestjs', 'node'];
      if (!validProjectTypes.includes(config.projectType)) {
        this.logger.error(`Invalid project type: ${config.projectType}`);
        return false;
      }

      // Validate boolean fields
      const booleanFields = ['dryRun', 'force', 'backup', 'verbose'];
      for (const field of booleanFields) {
        if (typeof config[field] !== 'boolean') {
          this.logger.warn(`Invalid boolean field: ${field}, using default`);
          config[field] = this.getDefaultConfig()[field];
        }
      }

      this.logger.info('Configuration validation successful');
      return true;
    } catch (error) {
      this.logger.error('Configuration validation failed:', error);
      return false;
    }
  }

  private getDefaultConfig(): MigrationConfig {
    return {
      projectPath: process.cwd(),
      projectType: 'node',
      outputPath: './privata-migration',
      dryRun: false,
      force: false,
      backup: true,
      verbose: false,
      transformations: [
        {
          type: 'orm-migration',
          enabled: true,
          options: {
            preserveOriginalCode: true,
            addComments: true,
          },
        },
        {
          type: 'data-handling',
          enabled: true,
          options: {
            addDataProtection: true,
            addAuditLogging: true,
          },
        },
        {
          type: 'api-compliance',
          enabled: true,
          options: {
            addGDPREndpoints: true,
            addHIPAAEndpoints: true,
          },
        },
      ],
      complianceFeatures: [
        {
          type: 'gdpr',
          enabled: true,
          options: {
            articles: [15, 16, 17, 18, 20, 21, 22],
            addUIComponents: true,
          },
        },
        {
          type: 'hipaa',
          enabled: true,
          options: {
            safeguards: ['administrative', 'physical', 'technical'],
            addAuditLogging: true,
          },
        },
        {
          type: 'data-protection',
          enabled: true,
          options: {
            encryption: true,
            pseudonymization: true,
            dataMinimization: true,
          },
        },
        {
          type: 'privacy-controls',
          enabled: true,
          options: {
            consentManagement: true,
            dataExport: true,
            dataDeletion: true,
          },
        },
      ],
    };
  }

  async getConfigForProjectType(projectType: string): Promise<Partial<MigrationConfig>> {
    const baseConfig = this.getDefaultConfig();
    
    switch (projectType) {
      case 'react':
        return {
          ...baseConfig,
          projectType: 'react',
          transformations: [
            ...baseConfig.transformations,
            {
              type: 'react-components',
              enabled: true,
              options: {
                addConsentBanner: true,
                addPrivacyDashboard: true,
                addDataExportButton: true,
              },
            },
          ],
        };
      
      case 'vue':
        return {
          ...baseConfig,
          projectType: 'vue',
          transformations: [
            ...baseConfig.transformations,
            {
              type: 'vue-components',
              enabled: true,
              options: {
                addConsentBanner: true,
                addPrivacyDashboard: true,
                addDataExportButton: true,
              },
            },
          ],
        };
      
      case 'angular':
        return {
          ...baseConfig,
          projectType: 'angular',
          transformations: [
            ...baseConfig.transformations,
            {
              type: 'angular-components',
              enabled: true,
              options: {
                addConsentBanner: true,
                addPrivacyDashboard: true,
                addDataExportButton: true,
              },
            },
          ],
        };
      
      case 'nextjs':
        return {
          ...baseConfig,
          projectType: 'nextjs',
          transformations: [
            ...baseConfig.transformations,
            {
              type: 'nextjs-pages',
              enabled: true,
              options: {
                addPrivacyPages: true,
                addGDPRPages: true,
                addHIPAAPages: true,
              },
            },
          ],
        };
      
      case 'express':
        return {
          ...baseConfig,
          projectType: 'express',
          transformations: [
            ...baseConfig.transformations,
            {
              type: 'express-middleware',
              enabled: true,
              options: {
                addComplianceMiddleware: true,
                addAuditMiddleware: true,
              },
            },
          ],
        };
      
      case 'nestjs':
        return {
          ...baseConfig,
          projectType: 'nestjs',
          transformations: [
            ...baseConfig.transformations,
            {
              type: 'nestjs-decorators',
              enabled: true,
              options: {
                addComplianceDecorators: true,
                addAuditDecorators: true,
              },
            },
          ],
        };
      
      default:
        return baseConfig;
    }
  }

  async mergeConfigs(baseConfig: MigrationConfig, overrideConfig: Partial<MigrationConfig>): Promise<MigrationConfig> {
    return {
      ...baseConfig,
      ...overrideConfig,
      transformations: [
        ...baseConfig.transformations,
        ...(overrideConfig.transformations || []),
      ],
      complianceFeatures: [
        ...baseConfig.complianceFeatures,
        ...(overrideConfig.complianceFeatures || []),
      ],
    };
  }

  async getConfigSchema(): Promise<any> {
    return {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project to migrate',
          default: process.cwd(),
        },
        projectType: {
          type: 'string',
          enum: ['react', 'vue', 'angular', 'nextjs', 'express', 'nestjs', 'node'],
          description: 'Type of project to migrate',
          default: 'node',
        },
        outputPath: {
          type: 'string',
          description: 'Path for migration output',
          default: './privata-migration',
        },
        dryRun: {
          type: 'boolean',
          description: 'Preview changes without applying them',
          default: false,
        },
        force: {
          type: 'boolean',
          description: 'Force migration even if conflicts are detected',
          default: false,
        },
        backup: {
          type: 'boolean',
          description: 'Create backup before migration',
          default: true,
        },
        verbose: {
          type: 'boolean',
          description: 'Verbose output',
          default: false,
        },
        transformations: {
          type: 'array',
          description: 'Transformation configurations',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              enabled: { type: 'boolean' },
              options: { type: 'object' },
            },
          },
        },
        complianceFeatures: {
          type: 'array',
          description: 'Compliance feature configurations',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              enabled: { type: 'boolean' },
              options: { type: 'object' },
            },
          },
        },
      },
      required: ['projectPath', 'projectType', 'outputPath'],
    };
  }
}

