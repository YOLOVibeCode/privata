/**
 * IDatabaseReader - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY read operations.
 * Clients that only need to read from the database can depend on this interface
 * without being forced to implement write operations they don't need.
 *
 * @example
 * ```typescript
 * class ReportingService {
 *   constructor(private readonly reader: IDatabaseReader) {}
 *
 *   async generateReport(): Promise<Report> {
 *     const data = await this.reader.findMany({ status: 'active' });
 *     return this.processReport(data);
 *   }
 * }
 * ```
 */

import { ReadOptions } from '../types/ReadOptions';
import { Query } from '../types/Query';

export interface IDatabaseReader {
  /**
   * Find a single document by its ID
   *
   * @param id - The unique identifier of the document
   * @param options - Optional read configuration
   * @returns Promise resolving to the document or null if not found
   *
   * @example
   * ```typescript
   * const user = await reader.findById('user-123');
   * if (user) {
   *   console.log('Found user:', user.name);
   * }
   * ```
   */
  findById(id: string, options?: ReadOptions): Promise<any | null>;

  /**
   * Find multiple documents matching the query criteria
   *
   * @param query - Query criteria for filtering documents
   * @param options - Optional read configuration including pagination, sorting, etc.
   * @returns Promise resolving to an array of matching documents
   *
   * @example
   * ```typescript
   * const activeUsers = await reader.findMany(
   *   { status: 'active' },
   *   { limit: 10, sort: { createdAt: -1 } }
   * );
   * ```
   */
  findMany(query: Query, options?: ReadOptions): Promise<any[]>;

  /**
   * Check if a document exists by its ID
   *
   * @param id - The unique identifier of the document
   * @returns Promise resolving to true if document exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await reader.exists('user-123');
   * if (exists) {
   *   console.log('User exists');
   * }
   * ```
   */
  exists(id: string): Promise<boolean>;
}

// Re-export types for convenience
export { ReadOptions, Query };
