/**
 * Objection Request Type Definition
 *
 * Represents data subject objection requests as defined in GDPR Article 21
 */

export interface ObjectionRequest {
  dataSubjectId: string;
  objectionType: ObjectionType;
  reason: string;
  processingPurposes: string[];
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  specificProcessing?: string[];
  objectionScope?: 'all-processing' | 'specific-purposes' | 'specific-systems';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export type ObjectionType =
  | 'legitimate-interests'
  | 'direct-marketing'
  | 'profiling'
  | 'scientific-research'
  | 'historical-research'
  | 'statistical-purposes'
  | 'public-interest'
  | 'automated-decision-making';

export interface ObjectionResult {
  success: boolean;
  objectionId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  objectionType?: string;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  immediateEffect?: boolean;
  processingStopped?: boolean;
  compellingGroundsReview?: boolean;
  reviewDeadline?: Date;
  legalBasis?: string;
  marketingChannels?: string[];
  profilingStopped?: boolean;
  decisionMakingStopped?: boolean;
  automatedDecisions?: string[];
  researchRestrictions?: string[];
  publicInterestBasis?: string;
  implementationStatus?: ObjectionImplementation;
  monitoringEnabled?: boolean;
  complianceChecks?: ComplianceChecks;
  objectionOverridden?: boolean;
  compellingGrounds?: string;
  overrideJustification?: string;
  complexRequest?: boolean;
  errors?: string[];
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
  auditTrail?: ObjectionAuditEntry[];
  confirmationProvided?: boolean;
  processingPurposes?: string[];
}

export interface ObjectionImplementation {
  systemsUpdated: string[];
  enforcementActive: boolean;
  implementationTimestamp: Date;
  rollbackCapability: boolean;
  monitoringEnabled: boolean;
  processingRestrictions: string[];
}

export interface ComplianceChecks {
  frequency: string;
  alertsEnabled: boolean;
  escalationThreshold: number;
  reportingRequired: boolean;
  lastCheckDate?: Date;
}

export interface ObjectionStatus {
  objectionActive: boolean;
  objectionId?: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending-review';
  lastComplianceCheck?: Date;
  violations: ObjectionViolation[];
  nextReviewDate?: Date;
}

export interface ObjectionViolation {
  violationId: string;
  violationType: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolutionDate?: Date;
}

export interface ObjectionWithdrawalRequest {
  objectionId: string;
  reason: string;
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  verificationDetails?: string;
}

export interface ObjectionWithdrawalResult {
  success: boolean;
  withdrawalId?: string;
  processedAt?: Date;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  auditTrail?: ObjectionAuditEntry[];
  errors?: string[];
}

export interface ObjectionAuditEntry {
  dataCategory: string;
  objectionMethod: string;
  objectionTimestamp: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  systemUpdated: string[];
  enforcementLevel: 'full' | 'partial' | 'monitoring' | 'none';
  complianceStatus: boolean;
  processingRestrictions: string[];
}

export interface ProcessingAttempt {
  operation: string;
  dataCategories: string[];
  timestamp: Date;
  userId?: string;
  systemId?: string;
}

export interface ProcessingResult {
  blocked: boolean;
  reason?: string;
  objectionId?: string;
  allowedOperations?: string[];
  blockedOperations?: string[];
  overrideAvailable?: boolean;
  overrideReason?: string;
}

export interface ViolationReport {
  violationType: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  systemId?: string;
  userId?: string;
}

export interface ViolationResult {
  violationId: string;
  alertSent: boolean;
  escalationRequired: boolean;
  remediationSteps: string[];
  reviewDeadline?: Date;
  assignedTo?: string;
}

export interface ObjectionOptions {
  simulateCompellingGrounds?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
  dryRun?: boolean;
  monitoringLevel?: 'basic' | 'enhanced' | 'strict';
}

export interface ObjectionHistory {
  objectionId: string;
  dataSubjectId: string;
  objectionType: string;
  timestamp: Date;
  status: 'active' | 'withdrawn' | 'overridden';
  processingPurposes: string[];
  withdrawalReason?: string;
  withdrawalTimestamp?: Date;
  overrideJustification?: string;
}

export interface ObjectionVerification {
  objectionId: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationTimestamp: Date;
  verificationDetails: string;
  nextVerificationDate?: Date;
}

export interface CompellingGrounds {
  grounds: string[];
  legalBasis: string;
  justification: string;
  reviewRequired: boolean;
  reviewDeadline: Date;
  overrideConditions: string[];
}

export interface ObjectionCompliance {
  gdprCompliant: boolean;
  objectionHandlingCompliant: boolean;
  processingRestrictionCompliant: boolean;
  monitoringCompliant: boolean;
  auditCompliant: boolean;
  complianceScore: number;
  complianceIssues: string[];
  recommendations: string[];
}
