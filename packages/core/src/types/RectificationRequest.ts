/**
 * Rectification Request Type Definition
 *
 * Represents data subject rectification requests as defined in GDPR Article 16
 */

export interface RectificationRequest {
  dataSubjectId: string;
  corrections: Record<string, any>;
  reason: string;
  evidence: string;
  notifyThirdParties?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export interface RectificationResult {
  success: boolean;
  rectificationId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  rectifiedFields: string[];
  errors?: string[];
  thirdPartyNotifications?: ThirdPartyNotification[];
  auditTrail?: RectificationAuditEntry[];
  notificationSent?: boolean;
  notificationMethod?: string;
  notificationTimestamp?: Date;
  notificationContent?: string;
  consistencyCheck?: ConsistencyCheck;
  complexRequest?: boolean;
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
}

export interface ThirdPartyNotification {
  recipient: string;
  notifiedAt: Date;
  method: string;
  status: 'sent' | 'delivered' | 'failed';
  content: string;
}

export interface RectificationAuditEntry {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  evidence: string;
  timestamp: Date;
  processedBy: string;
  systemUpdated: string[];
}

export interface ConsistencyCheck {
  allSystemsUpdated: boolean;
  synchronizationTime?: Date;
  failedSystems?: string[];
  retryScheduled?: boolean;
  lastCheckTime: Date;
}

export interface RectificationDispute {
  disputeId: string;
  rectificationId: string;
  reason: string;
  evidence: string;
  status: 'submitted' | 'under-review' | 'resolved' | 'rejected';
  reviewDeadline?: Date;
  submittedAt: Date;
  reviewedBy?: string;
  resolution?: string;
}

export interface RectificationHistory {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: Date;
  rectificationId: string;
}

export interface RectificationOptions {
  simulateSyncFailure?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
}
