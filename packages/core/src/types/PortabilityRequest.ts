/**
 * Portability Request Type Definition
 *
 * Represents data subject portability requests as defined in GDPR Article 20
 */

export interface PortabilityRequest {
  dataSubjectId: string;
  format: PortabilityFormat;
  includeMetadata?: boolean;
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  transmissionMethod?: 'download' | 'direct-api' | 'email' | 'secure-link';
  targetController?: TargetController | undefined;
  scope?: 'provided-by-subject' | 'all-personal-data';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export type PortabilityFormat = 'JSON' | 'CSV' | 'XML' | 'PDF' | 'XLSX';

export interface TargetController {
  name: string;
  contactEmail: string;
  apiEndpoint?: string;
  verificationRequired?: boolean;
  supportedFormats?: PortabilityFormat[];
  securityRequirements?: SecurityRequirement[];
}

export interface SecurityRequirement {
  type: 'encryption' | 'authentication' | 'authorization';
  method: string;
  level: 'basic' | 'enhanced' | 'high';
  description: string;
}

export interface PortabilityResult {
  success: boolean;
  portabilityId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  dataFormat?: string;
  portableData?: string;
  structuredData?: boolean;
  machineReadable?: boolean;
  commonlyUsedFormat?: boolean;
  metadataIncluded?: boolean | undefined;
  dataCategories?: string[];
  processingPurposes?: string[];
  retentionPeriods?: string[];
  transmissionSupported?: boolean;
  transmissionMethod?: string | undefined;
  targetController?: TargetController | undefined;
  transmissionStatus?: 'pending' | 'completed' | 'failed' | 'in-progress';
  transmissionError?: string;
  alternativeMethod?: string;
  retryAvailable?: boolean;
  targetVerified?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  dataScope?: string;
  includedDataCategories?: string[];
  excludedDataCategories?: string[];
  exclusionReason?: string;
  rightsProtection?: RightsProtection;
  scopeDescription?: string;
  exclusionReasons?: string[];
  dataIntegrity?: boolean;
  authenticityVerified?: boolean;
  checksum?: string;
  signature?: string;
  encryptionEnabled?: boolean;
  encryptionMethod?: string;
  secureTransmission?: boolean;
  downloadLink?: string;
  downloadExpiry?: Date;
  fileSize?: number;
  verificationCompleted?: boolean;
  complexRequest?: boolean;
  errors?: string[];
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
  auditTrail?: PortabilityAuditEntry[];
  confirmationProvided?: boolean;
}

export interface RightsProtection {
  thirdPartyRights: boolean;
  protectedDataCategories: string[];
  protectionMechanisms: string[];
  legalBasis: string;
}

export interface PortabilityAuditEntry {
  dataCategory: string;
  exportMethod: string;
  exportTimestamp: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  systemUpdated: string[];
  formatUsed: string;
  transmissionMethod?: string | undefined;
  targetController?: string;
  securityApplied: string[];
  complianceStatus: boolean;
}

export interface PortabilityOptions {
  simulateTransmissionFailure?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
  dryRun?: boolean;
  encryptionLevel?: 'basic' | 'enhanced' | 'high';
  compressionEnabled?: boolean;
}

export interface PortabilityHistory {
  portabilityId: string;
  dataSubjectId: string;
  format: string;
  timestamp: Date;
  status: 'completed' | 'failed' | 'in-progress';
  dataCategories: string[];
  transmissionMethod?: string | undefined;
  targetController?: string;
  fileSize?: number;
  downloadCount?: number;
}

export interface PortabilityVerification {
  portabilityId: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationTimestamp: Date;
  verificationDetails: string;
  nextVerificationDate?: Date;
}

export interface DataFormatSpecification {
  format: PortabilityFormat;
  structure: string;
  encoding: string;
  compression?: string;
  validationSchema?: string;
  exampleData?: string;
  compatibilityNotes?: string[];
}

export interface TransmissionProtocol {
  method: string;
  protocol: string;
  security: string[];
  authentication: string;
  rateLimiting?: string;
  retryPolicy?: string;
  monitoring?: string;
}

export interface PortabilityCompliance {
  gdprCompliant: boolean;
  dataScopeCompliant: boolean;
  formatCompliant: boolean;
  transmissionCompliant: boolean;
  securityCompliant: boolean;
  auditCompliant: boolean;
  complianceScore: number;
  complianceIssues: string[];
  recommendations: string[];
}
