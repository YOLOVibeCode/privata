/**
 * AuditEvent - Structure for audit log entries
 *
 * This type defines the structure for audit log entries,
 * ensuring comprehensive tracking of all data access and modifications.
 */

export interface AuditEvent {
  /** Unique identifier for the audit event */
  id: string;

  /** Timestamp when the event occurred */
  timestamp: Date;

  /** Type of action performed */
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'EXPORT' | 'ERASURE' | 'ACCESS' | 'LOGIN' | 'LOGOUT' | 'CONSENT_GRANTED' | 'CONSENT_WITHDRAWN' | 'CONSENT_WITHDRAWAL_ATTEMPTED' | 'DATA_ACCESS_REQUEST' | 'DATA_ACCESS_COMPLETED' | 'DATA_ACCESS_FAILED' | 'DATA_RECTIFICATION' | 'DATA_RECTIFICATION_COMPLETED' | 'DATA_ERASURE' | 'DATA_ERASURE_COMPLETED' | 'DATA_RESTRICTION' | 'DATA_RESTRICTION_COMPLETED' | 'RESTRICTION_LIFTED' | 'DATA_PORTABILITY_REQUEST' | 'DATA_PORTABILITY_COMPLETED' | 'DATA_OBJECTION' | 'DATA_OBJECTION_COMPLETED' | 'OBJECTION_WITHDRAWN' | 'AUTOMATED_DECISION_REQUEST' | 'AUTOMATED_DECISION_COMPLETED' | 'AUTOMATED_DECISION_APPEAL' | 'PHI_REQUEST' | 'PHI_COMPLETED' | 'BREACH_NOTIFICATION' | 'HIPAA_VIOLATION';

  /** Type of entity being acted upon */
  entityType: 'User' | 'Patient' | 'ClinicalRecord' | 'Consent' | 'AuditLog' | 'Pseudonym' | 'EncryptionKey' | 'DataSubject';

  /** ID of the entity being acted upon */
  entityId: string;

  /** ID of the user who performed the action */
  userId: string;

  /** Additional details about the action */
  details: Record<string, any>;

  /** IP address of the user */
  ipAddress?: string;

  /** User agent string */
  userAgent?: string;

  /** Region where the action occurred */
  region?: string;

  /** Compliance framework (GDPR, HIPAA, etc.) */
  compliance?: string;

  /** Whether the action was successful */
  success?: boolean;

  /** Error message if action failed */
  error?: string;
}
