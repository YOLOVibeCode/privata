/**
 * AuditFilter - Filter criteria for audit log queries
 *
 * This type defines the filter criteria for querying audit logs,
 * supporting comprehensive filtering for compliance reporting.
 */

export interface AuditFilter {
  /** Filter by user ID who performed the action */
  userId?: string;

  /** Filter by entity type */
  entityType?: 'User' | 'Patient' | 'ClinicalRecord' | 'Consent' | 'AuditLog' | 'Pseudonym' | 'EncryptionKey';

  /** Filter by entity ID */
  entityId?: string;

  /** Filter by action type */
  action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'EXPORT' | 'ERASURE' | 'ACCESS' | 'LOGIN' | 'LOGOUT';

  /** Filter by start date */
  startDate?: Date;

  /** Filter by end date */
  endDate?: Date;

  /** Filter by region */
  region?: string;

  /** Filter by compliance framework */
  compliance?: 'GDPR' | 'HIPAA' | 'CCPA' | 'SOX' | 'PCI-DSS';

  /** Filter by IP address */
  ipAddress?: string;

  /** Filter by success status */
  success?: boolean;

  /** Filter by error message */
  error?: string;

  /** Limit number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Sort criteria */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}
