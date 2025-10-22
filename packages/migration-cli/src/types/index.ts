export type ProjectType = 'react' | 'vue' | 'angular' | 'nextjs' | 'express' | 'nestjs' | 'node';

export interface MigrationPlan {
  projectType: ProjectType;
  filesToTransform: FileToTransform[];
  dependenciesToAdd: Dependency[];
  dependenciesToRemove: Dependency[];
  complianceFeatures: ComplianceFeature[];
  transformations: Transformation[];
  issues: Issue[];
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FileToTransform {
  path: string;
  type: string;
  transformations: Transformation[];
}

export interface Transformation {
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  files?: string[];
  content?: string;
}

export interface Dependency {
  name: string;
  version: string;
  reason: string;
}

export interface ComplianceFeature {
  name: string;
  type: string;
  status: 'add' | 'remove' | 'modify';
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  details?: any;
}

export interface MigrationResults {
  filesTransformed: number;
  dependenciesAdded: number;
  dependenciesRemoved: number;
  complianceFeaturesAdded: number;
  generatedFiles: GeneratedFile[];
  errors: Issue[];
  warnings: Issue[];
  executionTime: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  description: string;
  type: string;
}

export interface ComplianceAnalysis {
  gdpr: ComplianceScore;
  hipaa: ComplianceScore;
  dataProtection: ComplianceScore;
  privacyControls: ComplianceScore;
  issues: Issue[];
  recommendations: Recommendation[];
  overallScore: number;
}

export interface ComplianceScore {
  score: number;
  requirements: string[];
  issues: string[];
  recommendations: string[];
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
  file?: string;
}

export interface ProjectAnalysis {
  projectType: ProjectType;
  framework: string;
  language: string;
  totalFiles: number;
  linesOfCode: number;
  files: FileInfo[];
  packageJson: any;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  ormUsage: Record<string, boolean>;
  ormFiles: FileInfo[];
  apiFiles: FileInfo[];
  dataFiles: FileInfo[];
  testFiles: FileInfo[];
  configFiles: FileInfo[];
  conflictingDependencies: string[];
  complexDependencies: string[];
  existingCompliance: boolean;
  customImplementations: CustomImplementation[];
  testCoverage: number;
  hasDatabaseConfig: boolean;
  hasSecurityConfig: boolean;
  hasPrivacyConfig: boolean;
}

export interface FileInfo {
  path: string;
  type: string;
  content: string;
  linesOfCode: number;
  size: number;
}

export interface CustomImplementation {
  file: string;
  type: string;
}

export interface MigrationConfig {
  projectPath: string;
  projectType: ProjectType;
  outputPath: string;
  dryRun: boolean;
  force: boolean;
  backup: boolean;
  verbose: boolean;
  transformations: TransformationConfig[];
  complianceFeatures: ComplianceFeatureConfig[];
}

export interface TransformationConfig {
  type: string;
  enabled: boolean;
  options: Record<string, any>;
}

export interface ComplianceFeatureConfig {
  type: string;
  enabled: boolean;
  options: Record<string, any>;
}

export interface ReportData {
  migrationPlan: MigrationPlan;
  results: MigrationResults;
  analysis: ProjectAnalysis;
  complianceAnalysis: ComplianceAnalysis;
  timestamp: Date;
  version: string;
}

export interface TemplateConfig {
  type: ProjectType;
  name: string;
  description: string;
  files: TemplateFile[];
  dependencies: Dependency[];
  scripts: Record<string, string>;
}

export interface TemplateFile {
  path: string;
  content: string;
  description: string;
}

