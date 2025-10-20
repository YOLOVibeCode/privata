/**
 * Erasure Request Type Definition
 *
 * Represents data subject erasure requests as defined in GDPR Article 17
 */

export interface ErasureRequest {
  dataSubjectId: string;
  reason: ErasureGround;
  evidence: string;
  scope: 'all-personal-data' | 'specific-categories';
  dataCategories?: string[];
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  notifyThirdParties?: boolean;
  exceptions?: ErasureException[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export type ErasureGround =
  | 'withdrawal-of-consent'
  | 'data-no-longer-necessary'
  | 'unlawful-processing'
  | 'legal-obligation'
  | 'data-subject-objection'
  | 'public-interest'
  | 'legitimate-interests';

export type ErasureException =
  | 'legal-obligation'
  | 'public-interest'
  | 'legitimate-interests'
  | 'vital-interests'
  | 'defense-of-legal-claims'
  | 'freedom-of-expression'
  | 'archiving-research';

export interface ErasureResult {
  success: boolean;
  erasureId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  erasedDataCategories: string[];
  retainedDataCategories?: string[];
  erasureGround?: string;
  exceptionsApplied?: string[];
  partialErasure?: boolean;
  legalBasisForRetention?: string;
  publicInterestBasis?: string;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  thirdPartyNotifications?: ThirdPartyErasureNotification[];
  thirdPartyConfirmations?: ThirdPartyConfirmation[];
  thirdPartyFailures?: ThirdPartyFailure[];
  retryScheduled?: boolean;
  failureReason?: string;
  auditTrail?: ErasureAuditEntry[];
  confirmationProvided?: boolean;
  confirmationMethod?: string;
  confirmationTimestamp?: Date;
  erasureCertificate?: string;
  technicalLimitations?: TechnicalLimitation[];
  alternativeMeasures?: AlternativeMeasure[];
  complexRequest?: boolean;
  errors?: string[];
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
}

export interface ThirdPartyErasureNotification {
  recipient: string;
  notifiedAt: Date;
  method: string;
  status: 'sent' | 'delivered' | 'failed';
  content: string;
  erasureScope: string;
  deadline: Date;
}

export interface ThirdPartyConfirmation {
  recipient: string;
  confirmed: boolean;
  confirmationDate: Date;
  method: string;
  erasureScope: string;
  notes?: string;
}

export interface ThirdPartyFailure {
  recipient: string;
  failureReason: string;
  failureDate: Date;
  retryAttempts: number;
  nextRetryDate?: Date;
}

export interface ErasureAuditEntry {
  dataCategory: string;
  erasureMethod: string;
  erasureTimestamp: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  systemUpdated: string[];
  backupHandling: string;
  retentionCompliance: boolean;
}

export interface TechnicalLimitation {
  system: string;
  limitation: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  workaround?: string;
}

export interface AlternativeMeasure {
  measure: string;
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  implementationDate: Date;
  monitoringRequired: boolean;
}

export interface ErasureOptions {
  simulateThirdPartyFailure?: boolean;
  simulateTechnicalLimitations?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
  dryRun?: boolean;
}

export interface ErasureHistory {
  erasureId: string;
  dataSubjectId: string;
  reason: string;
  scope: string;
  timestamp: Date;
  status: 'completed' | 'partial' | 'failed';
  dataCategories: string[];
  exceptionsApplied?: string[];
}

export interface ErasureVerification {
  erasureId: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationTimestamp: Date;
  verificationDetails: string;
  nextVerificationDate?: Date;
}
