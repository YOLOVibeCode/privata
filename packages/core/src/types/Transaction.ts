/**
 * Transaction - Database transaction object
 *
 * This type defines the structure for database transactions,
 * enabling ACID compliance and data consistency.
 */

export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;

  /** Current status of the transaction */
  status: 'active' | 'committed' | 'rolled_back' | 'failed';

  /** When the transaction was started */
  startTime: Date;

  /** When the transaction was completed (if applicable) */
  endTime?: Date;

  /** Isolation level for the transaction */
  isolationLevel?: 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';

  /** Whether the transaction is read-only */
  readOnly?: boolean;

  /** Custom metadata for the transaction */
  metadata?: Record<string, any>;
}
