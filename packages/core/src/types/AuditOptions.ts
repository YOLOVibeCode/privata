/**
 * AuditOptions - Configuration for audit logging operations
 *
 * This type defines the options available when logging audit events,
 * following ISP principles by keeping audit concerns separate from other concerns.
 */

export interface AuditOptions {
  /** Region where the audit event occurred */
  region?: string;

  /** Compliance framework (GDPR, HIPAA, etc.) */
  compliance?: 'GDPR' | 'HIPAA' | 'CCPA' | 'SOX' | 'PCI-DSS';

  /** Retention period in days */
  retention?: number;

  /** Whether to encrypt the audit log entry */
  encrypt?: boolean;

  /** Whether to immediately flush to persistent storage */
  flush?: boolean;

  /** Custom metadata for the audit operation */
  metadata?: Record<string, any>;

  /** Priority level for the audit event */
  priority?: 'low' | 'medium' | 'high' | 'critical';

  /** Whether to trigger alerts for this event */
  alert?: boolean;

  /** Custom index name for the audit log */
  index?: string;

  /** Retention period in days (alias for retention) */
  retentionDays?: number;

  /** Limit for query results */
  limit?: number;

  /** Offset for query results */
  offset?: number;
}
