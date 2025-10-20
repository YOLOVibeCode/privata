/**
 * IDatabaseTransaction - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY transaction management operations.
 * Clients that only need to manage database transactions can depend on this interface
 * without being forced to implement other operations they don't need.
 *
 * @example
 * ```typescript
 * class DataConsistencyService {
 *   constructor(private readonly transaction: IDatabaseTransaction) {}
 *
 *   async performAtomicOperation(): Promise<void> {
 *     const txn = await this.transaction.begin();
 *     try {
 *       // Perform operations
 *       await this.transaction.commit(txn);
 *     } catch (error) {
 *       await this.transaction.rollback(txn);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 */

import { Transaction } from '../types/Transaction';

export interface IDatabaseTransaction {
  /**
   * Begin a new database transaction
   *
   * @returns Promise resolving to the transaction object
   *
   * @example
   * ```typescript
   * const transaction = await dbTransaction.begin();
   * console.log(`Started transaction: ${transaction.id}`);
   * ```
   */
  begin(): Promise<Transaction>;

  /**
   * Commit a transaction, making all changes permanent
   *
   * @param transaction - The transaction to commit
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await dbTransaction.commit(transaction);
   * console.log('Transaction committed successfully');
   * ```
   */
  commit(transaction: Transaction): Promise<void>;

  /**
   * Rollback a transaction, undoing all changes
   *
   * @param transaction - The transaction to rollback
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await dbTransaction.rollback(transaction);
   * console.log('Transaction rolled back');
   * ```
   */
  rollback(transaction: Transaction): Promise<void>;
}

// Re-export types for convenience
export { Transaction };
