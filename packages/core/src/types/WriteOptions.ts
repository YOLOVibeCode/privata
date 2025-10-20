/**
 * WriteOptions - Configuration for database write operations
 *
 * This type defines the options available when writing to the database,
 * following ISP principles by keeping write concerns separate from read concerns.
 */

export interface WriteOptions {
  /** Whether to validate data before writing */
  validate?: boolean;

  /** Whether to use cache for this write operation */
  useCache?: boolean;

  /** Region to write to (for multi-region compliance) */
  region?: string;

  /** Whether to create audit log for this operation */
  audit?: boolean;

  /** Whether to perform upsert (create if not exists, update if exists) */
  upsert?: boolean;

  /** Whether to perform soft delete (mark as deleted instead of removing) */
  softDelete?: boolean;

  /** Write consistency level */
  consistency?: 'eventual' | 'strong' | 'session';

  /** Timeout for the write operation (in milliseconds) */
  timeout?: number;

  /** Whether to return the updated document */
  returnDocument?: 'before' | 'after' | 'none';

  /** Whether to bypass validation (use with caution) */
  bypassValidation?: boolean;

  /** Whether to trigger hooks/events */
  triggerHooks?: boolean;

  /** Custom metadata to attach to the operation */
  metadata?: Record<string, any>;
}
