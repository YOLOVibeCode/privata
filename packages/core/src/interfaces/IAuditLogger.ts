/**
 * IAuditLogger - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY audit logging operations.
 * Clients that only need to log audit events can depend on this interface
 * without being forced to implement query operations they don't need.
 *
 * @example
 * ```typescript
 * class ComplianceService {
 *   constructor(private readonly auditLogger: IAuditLogger) {}
 *
 *   async trackDataAccess(userId: string, entityId: string): Promise<void> {
 *     await this.auditLogger.log({
 *       id: generateId(),
 *       timestamp: new Date(),
 *       action: 'READ',
 *       entityType: 'User',
 *       entityId,
 *       userId,
 *       details: { accessType: 'data_export' }
 *     });
 *   }
 * }
 * ```
 */

import { AuditEvent } from '../types/AuditEvent';
import { AuditOptions } from '../types/AuditOptions';

export interface IAuditLogger {
  /**
   * Log a single audit event
   *
   * @param event - The audit event to log
   * @param options - Optional audit configuration
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await auditLogger.log({
   *   id: 'audit-123',
   *   timestamp: new Date(),
   *   action: 'CREATE',
   *   entityType: 'User',
   *   entityId: 'user-123',
   *   userId: 'admin-456',
   *   details: { field: 'email', newValue: 'test@example.com' }
   * });
   * ```
   */
  log(event: AuditEvent, options?: AuditOptions): Promise<void>;

  /**
   * Log multiple audit events in a batch
   *
   * @param events - Array of audit events to log
   * @param options - Optional audit configuration
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await auditLogger.logBatch([
   *   { id: 'audit-1', timestamp: new Date(), action: 'CREATE', ... },
   *   { id: 'audit-2', timestamp: new Date(), action: 'UPDATE', ... }
   * ]);
   * ```
   */
  logBatch(events: AuditEvent[], options?: AuditOptions): Promise<void>;
}

// Re-export types for convenience
export { AuditEvent, AuditOptions };
