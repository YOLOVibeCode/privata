/**
 * IAuditQuery - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY audit query operations.
 * Clients that only need to query audit logs can depend on this interface
 * without being forced to implement logging operations they don't need.
 *
 * @example
 * ```typescript
 * class ComplianceReportingService {
 *   constructor(private readonly auditQuery: IAuditQuery) {}
 *
 *   async generateGDPRReport(userId: string): Promise<string> {
 *     const filter = { userId, compliance: 'GDPR' };
 *     return await this.auditQuery.export(filter, 'PDF');
 *   }
 * }
 * ```
 */

import { AuditEvent } from '../types/AuditEvent';
import { AuditFilter } from '../types/AuditFilter';
import { ExportFormat } from '../types/ExportFormat';

export interface IAuditQuery {
  /**
   * Query audit events based on filter criteria
   *
   * @param filter - Filter criteria for the query
   * @returns Promise resolving to array of matching audit events
   *
   * @example
   * ```typescript
   * const events = await auditQuery.query({
   *   userId: 'admin-456',
   *   entityType: 'User',
   *   startDate: new Date('2023-01-01'),
   *   endDate: new Date('2023-12-31')
   * });
   * ```
   */
  query(filter: AuditFilter): Promise<AuditEvent[]>;

  /**
   * Count audit events matching filter criteria
   *
   * @param filter - Filter criteria for the count
   * @returns Promise resolving to count of matching events
   *
   * @example
   * ```typescript
   * const count = await auditQuery.count({
   *   userId: 'admin-456',
   *   action: 'DELETE'
   * });
   * console.log(`User performed ${count} delete operations`);
   * ```
   */
  count(filter: AuditFilter): Promise<number>;

  /**
   * Export audit events in specified format
   *
   * @param filter - Filter criteria for the export
   * @param format - Export format (JSON, CSV, XML, PDF)
   * @returns Promise resolving to exported data as string
   *
   * @example
   * ```typescript
   * const csvData = await auditQuery.export(
   *   { compliance: 'GDPR' },
   *   'CSV'
   * );
   * ```
   */
  export(filter: AuditFilter, format: ExportFormat): Promise<string>;
}

// Re-export types for convenience
export { AuditEvent, AuditFilter, ExportFormat };
