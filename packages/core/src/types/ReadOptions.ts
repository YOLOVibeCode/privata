/**
 * ReadOptions - Configuration for database read operations
 *
 * This type defines the options available when reading from the database,
 * following ISP principles by keeping read concerns separate from write concerns.
 */

export interface ReadOptions {
  /** Whether to include soft-deleted records */
  includeDeleted?: boolean;

  /** Whether to use cache for this read operation */
  useCache?: boolean;

  /** Region to read from (for multi-region compliance) */
  region?: string;

  /** Maximum number of records to return */
  limit?: number;

  /** Number of records to skip */
  offset?: number;

  /** Sort criteria */
  sort?: Record<string, 1 | -1>;

  /** Fields to include in the result */
  select?: string[];

  /** Fields to exclude from the result */
  exclude?: string[];

  /** Whether to populate referenced documents */
  populate?: string[];

  /** Read consistency level */
  consistency?: 'eventual' | 'strong' | 'session';

  /** Timeout for the read operation (in milliseconds) */
  timeout?: number;
}
