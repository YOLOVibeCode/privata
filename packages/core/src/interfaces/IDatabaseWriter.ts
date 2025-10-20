/**
 * IDatabaseWriter - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY write operations.
 * Clients that only need to write to the database can depend on this interface
 * without being forced to implement read operations they don't need.
 *
 * @example
 * ```typescript
 * class DataIngestionService {
 *   constructor(private readonly writer: IDatabaseWriter) {}
 *
 *   async ingestData(data: any[]): Promise<void> {
 *     for (const item of data) {
 *       await this.writer.create(item);
 *     }
 *   }
 * }
 * ```
 */

import { WriteOptions } from '../types/WriteOptions';

export interface IDatabaseWriter {
  /**
   * Create a new document in the database
   *
   * @param data - The data to create the document with
   * @param options - Optional write configuration
   * @returns Promise resolving to the created document with generated ID
   *
   * @example
   * ```typescript
   * const user = await writer.create({
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * console.log('Created user with ID:', user.id);
   * ```
   */
  create(data: any, options?: WriteOptions): Promise<any>;

  /**
   * Update an existing document by its ID
   *
   * @param id - The unique identifier of the document to update
   * @param data - The data to update the document with
   * @param options - Optional write configuration
   * @returns Promise resolving to the updated document
   *
   * @example
   * ```typescript
   * const updatedUser = await writer.update('user-123', {
   *   name: 'John Smith',
   *   lastLogin: new Date()
   * });
   * ```
   */
  update(id: string, data: any, options?: WriteOptions): Promise<any>;

  /**
   * Delete a document by its ID
   *
   * @param id - The unique identifier of the document to delete
   * @param options - Optional write configuration including soft delete
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * // Hard delete
   * await writer.delete('user-123');
   *
   * // Soft delete
   * await writer.delete('user-123', { softDelete: true });
   * ```
   */
  delete(id: string, options?: WriteOptions): Promise<void>;
}

// Re-export types for convenience
export { WriteOptions };
