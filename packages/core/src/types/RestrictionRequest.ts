/**
 * Restriction Request Type Definition
 *
 * Represents data subject restriction requests as defined in GDPR Article 18
 */

export interface RestrictionRequest {
  dataSubjectId: string;
  reason: RestrictionGround;
  evidence: string;
  scope: 'all-personal-data' | 'specific-categories';
  dataCategories?: string[];
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  exceptions?: RestrictionException[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export type RestrictionGround =
  | 'accuracy-contested'
  | 'unlawful-processing'
  | 'data-no-longer-necessary'
  | 'data-subject-objection'
  | 'pending-verification'
  | 'legal-claim'
  | 'public-interest';

export type RestrictionException =
  | 'legal-obligation'
  | 'vital-interests'
  | 'public-interest'
  | 'legitimate-interests'
  | 'defense-of-legal-claims'
  | 'freedom-of-expression'
  | 'archiving-research';

export interface RestrictionResult {
  success: boolean;
  restrictionId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  restrictedDataCategories: string[];
  unrestrictedDataCategories?: string[];
  restrictionGround?: string;
  exceptionsApplied?: string[];
  partialRestriction?: boolean;
  exceptionBasis?: string;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  verificationRequired?: boolean;
  verificationDeadline?: Date;
  immediateRestriction?: boolean;
  legalReviewRequired?: boolean;
  objectionHandling?: ObjectionHandling;
  restrictionImplementation?: RestrictionImplementation;
  monitoringEnabled?: boolean;
  complianceChecks?: ComplianceChecks;
  complexRequest?: boolean;
  errors?: string[];
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
  auditTrail?: RestrictionAuditEntry[];
  confirmationProvided?: boolean;
}

export interface ObjectionHandling {
  reviewRequired: boolean;
  reviewDeadline?: Date;
  legalBasis?: string;
  legitimateInterests?: string;
  overrideJustification?: string;
}

export interface RestrictionImplementation {
  systemsUpdated: string[];
  enforcementActive: boolean;
  implementationTimestamp: Date;
  rollbackCapability: boolean;
  monitoringEnabled: boolean;
}

export interface ComplianceChecks {
  frequency: string;
  alertsEnabled: boolean;
  escalationThreshold: number;
  reportingRequired: boolean;
  lastCheckDate?: Date;
}

export interface RestrictionStatus {
  restrictionActive: boolean;
  restrictionId?: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending-review';
  lastComplianceCheck?: Date;
  violations: RestrictionViolation[];
  nextReviewDate?: Date;
}

export interface RestrictionViolation {
  violationId: string;
  violationType: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolutionDate?: Date;
}

export interface RestrictionLiftRequest {
  restrictionId: string;
  reason: string;
  evidence: string;
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  verificationDetails?: string;
}

export interface RestrictionLiftResult {
  success: boolean;
  liftId?: string;
  processedAt?: Date;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  auditTrail?: RestrictionAuditEntry[];
  errors?: string[];
}

export interface RestrictionAuditEntry {
  dataCategory: string;
  restrictionMethod: string;
  restrictionTimestamp: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  systemUpdated: string[];
  enforcementLevel: 'full' | 'partial' | 'monitoring' | 'none';
  complianceStatus: boolean;
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
  restrictionId?: string;
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

export interface RestrictionOptions {
  simulateViolation?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
  dryRun?: boolean;
  monitoringLevel?: 'basic' | 'enhanced' | 'strict';
}

export interface RestrictionHistory {
  restrictionId: string;
  dataSubjectId: string;
  reason: string;
  scope: string;
  timestamp: Date;
  status: 'active' | 'lifted' | 'expired';
  dataCategories: string[];
  exceptionsApplied?: string[];
  liftReason?: string;
  liftTimestamp?: Date;
}

export interface RestrictionVerification {
  restrictionId: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationTimestamp: Date;
  verificationDetails: string;
  nextVerificationDate?: Date;
}
