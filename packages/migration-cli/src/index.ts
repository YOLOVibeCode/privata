// Privata Migration CLI - Automated migration tool for GDPR/HIPAA compliance
// Complete CLI tool for migrating existing applications to use Privata

export { MigrationEngine } from './core/MigrationEngine';
export { ProjectAnalyzer } from './analyzers/ProjectAnalyzer';
export { CodeTransformer } from './transformers/CodeTransformer';
export { ReportGenerator } from './reporters/ReportGenerator';
export { ConfigManager } from './config/ConfigManager';
export { Logger } from './utils/Logger';
export { FileSystem } from './utils/FileSystem';

// Re-export types
export * from './types';

// Default export
import { MigrationEngine } from './core/MigrationEngine';
import { ProjectAnalyzer } from './analyzers/ProjectAnalyzer';
import { CodeTransformer } from './transformers/CodeTransformer';
import { ReportGenerator } from './reporters/ReportGenerator';
import { ConfigManager } from './config/ConfigManager';
import { Logger } from './utils/Logger';
import { FileSystem } from './utils/FileSystem';

export default {
  MigrationEngine,
  ProjectAnalyzer,
  CodeTransformer,
  ReportGenerator,
  ConfigManager,
  Logger,
  FileSystem,
};

