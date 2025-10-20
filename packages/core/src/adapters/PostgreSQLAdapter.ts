/**
 * PostgreSQLAdapter - PostgreSQL implementation of database interfaces
 *
 * This adapter provides PostgreSQL-specific implementations of the database interfaces,
 * following the Adapter pattern and ISP principles.
 *
 * @example
 * ```typescript
 * const adapter = new PostgreSQLAdapter({
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'mydb',
 *   user: 'user',
 *   password: 'password'
 * });
 * await adapter.connect();
 *
 * const user = await adapter.findById('123');
 * const users = await adapter.findMany({ status: 'active' });
 * ```
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { IDatabaseReader } from '../interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../interfaces/IDatabaseWriter';
import { IDatabaseTransaction } from '../interfaces/IDatabaseTransaction';
import { ReadOptions } from '../types/ReadOptions';
import { WriteOptions } from '../types/WriteOptions';
import { Query } from '../types/Query';
import { Transaction } from '../types/Transaction';

export interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class PostgreSQLAdapter implements IDatabaseReader, IDatabaseWriter, IDatabaseTransaction {
  private readonly pool: Pool;
  private client!: PoolClient;
  private readonly transactions: Map<string, PoolClient> = new Map();
  private readonly tableName: string = 'documents';

  /**
   * Creates a new PostgreSQLAdapter instance
   *
   * @param config - PostgreSQL connection configuration
   * @param tableName - Name of the table to operate on (defaults to 'documents')
   */
  constructor(
    private readonly config: PostgreSQLConfig,
    tableName?: string,
  ) {
    this.pool = new Pool(config);
    if (tableName) {
      this.tableName = tableName;
    }
  }

  /**
   * Connects to PostgreSQL
   */
  async connect(): Promise<void> {
    this.client = await this.pool.connect();
  }

  /**
   * Closes the PostgreSQL connection
   */
  async close(): Promise<void> {
    if (this.client) {
      this.client.release();
    }
    await this.pool.end();
  }

  // IDatabaseReader implementation

  /**
   * Finds a single document by its unique identifier
   */
  async findById(id: string, options?: ReadOptions): Promise<any | null> {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const params: any[] = [id];

      // Handle select fields
      if (options?.select) {
        const fields = options.select.join(', ');
        query = `SELECT ${fields} FROM ${this.tableName} WHERE id = $1`;
      }

      // Handle exclude fields
      if (options?.exclude) {
        // Get all columns except excluded ones
        const allColumns = await this.getAllColumns();
        const selectedColumns = allColumns.filter(col => !options.exclude!.includes(col));
        const fields = selectedColumns.join(', ');
        query = `SELECT ${fields} FROM ${this.tableName} WHERE id = $1`;
      }

      const result: QueryResult = await this.client.query(query, params);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`PostgreSQL findById error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds multiple documents based on a query
   */
  async findMany(query: Query, options?: ReadOptions): Promise<any[]> {
    try {
      const { whereClause, params } = this.buildWhereClause(query);
      let sql = `SELECT * FROM ${this.tableName}`;

      // Handle select fields
      if (options?.select) {
        const fields = options.select.join(', ');
        sql = `SELECT ${fields} FROM ${this.tableName}`;
      }

      // Handle exclude fields
      if (options?.exclude) {
        const allColumns = await this.getAllColumns();
        const selectedColumns = allColumns.filter(col => !options.exclude!.includes(col));
        const fields = selectedColumns.join(', ');
        sql = `SELECT ${fields} FROM ${this.tableName}`;
      }

      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }

      // Handle sorting
      if (options?.sort) {
        const sortClause = Object.entries(options.sort)
          .map(([field, direction]) => `${field} ${direction === 1 ? 'ASC' : 'DESC'}`)
          .join(', ');
        sql += ` ORDER BY ${sortClause}`;
      }

      // Handle limit and offset
      if (options?.limit) {
        sql += ` LIMIT $${params.length + 1}`;
        params.push(options.limit);
      }

      if (options?.offset) {
        sql += ` OFFSET $${params.length + 1}`;
        params.push(options.offset);
      }

      const result: QueryResult = await this.client.query(sql, params);
      return result.rows;
    } catch (error) {
      throw new Error(`PostgreSQL findMany error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a document with the given ID exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE id = $1`;
      const result: QueryResult = await this.client.query(query, [id]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      throw new Error(`PostgreSQL exists error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // IDatabaseWriter implementation

  /**
   * Creates a new document in the database
   */
  async create(data: any, options?: WriteOptions): Promise<any> {
    try {
      const { fields, values, placeholders } = this.buildInsertData(data);

      let query: string;
      if (options?.upsert) {
        // Use ON CONFLICT for upsert
        const updateFields = fields.map(field => `${field} = EXCLUDED.${field}`).join(', ');
        query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) ON CONFLICT (id) DO UPDATE SET ${updateFields}, updated_at = NOW() RETURNING *`;
      } else {
        query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      }

      const result: QueryResult = await this.client.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`PostgreSQL create error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an existing document identified by its ID
   */
  async update(id: string, data: any, options?: WriteOptions): Promise<any> {
    try {
      const { fields, values, placeholders } = this.buildUpdateData(data);

      let query: string;
      if (options?.upsert) {
        // Use ON CONFLICT for upsert
        const insertFields = ['id', ...fields];
        const insertValues = [id, ...values];
        const insertPlaceholders = ['$1', ...placeholders.map((_, i) => `$${i + 2}`)];
        const updateFields = fields.map((field, i) => `${field} = EXCLUDED.${field}`).join(', ');

        query = `INSERT INTO ${this.tableName} (${insertFields.join(', ')}) VALUES (${insertPlaceholders.join(', ')}) ON CONFLICT (id) DO UPDATE SET ${updateFields}, updated_at = NOW() RETURNING *`;
        values.unshift(id);
      } else {
        query = `UPDATE ${this.tableName} SET ${fields.map((field, i) => `${field} = ${placeholders[i]}`).join(', ')}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`;
        values.push(id);
      }

      const result: QueryResult = await this.client.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`PostgreSQL update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a document identified by its ID
   */
  async delete(id: string, options?: WriteOptions): Promise<void> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
      await this.client.query(query, [id]);
    } catch (error) {
      throw new Error(`PostgreSQL delete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // IDatabaseTransaction implementation

  /**
   * Begins a new database transaction
   */
  async begin(): Promise<Transaction> {
    try {
      const client = await this.pool.connect();
      await client.query('BEGIN');

      const transaction: Transaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        startTime: new Date(),
        metadata: { clientId: client.toString() },
      };

      this.transactions.set(transaction.id, client);
      return transaction;
    } catch (error) {
      throw new Error(`PostgreSQL begin transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Commits an active database transaction
   */
  async commit(transaction: Transaction): Promise<void> {
    try {
      const client = this.transactions.get(transaction.id);
      if (!client) {
        throw new Error('Transaction client not found');
      }

      await client.query('COMMIT');
      client.release();
      this.transactions.delete(transaction.id);
    } catch (error) {
      throw new Error(`PostgreSQL commit transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rolls back an active database transaction
   */
  async rollback(transaction: Transaction): Promise<void> {
    try {
      const client = this.transactions.get(transaction.id);
      if (!client) {
        throw new Error('Transaction client not found');
      }

      await client.query('ROLLBACK');
      client.release();
      this.transactions.delete(transaction.id);
    } catch (error) {
      throw new Error(`PostgreSQL rollback transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods

  /**
   * Builds WHERE clause from query object
   */
  private buildWhereClause(query: Query): { whereClause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(query)) {
      if (key === '$and') {
        // Handle $and operator
        const andConditions: string[] = [];
        for (const condition of value as Query[]) {
          const { whereClause, params: conditionParams } = this.buildWhereClause(condition);
          if (whereClause) {
            andConditions.push(`(${whereClause})`);
            // Adjust parameter indices for nested conditions
            const adjustedParams = conditionParams.map((param, index) => {
              const adjustedIndex = paramIndex + index;
              return param;
            });
            params.push(...adjustedParams);
            paramIndex += conditionParams.length;
          }
        }
        if (andConditions.length > 0) {
          conditions.push(`(${andConditions.join(' AND ')})`);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Handle operators like $gte, $lte, etc.
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case '$gte':
              conditions.push(`${key} >= $${paramIndex}`);
              params.push(opValue);
              paramIndex++;
              break;
            case '$lte':
              conditions.push(`${key} <= $${paramIndex}`);
              params.push(opValue);
              paramIndex++;
              break;
            case '$gt':
              conditions.push(`${key} > $${paramIndex}`);
              params.push(opValue);
              paramIndex++;
              break;
            case '$lt':
              conditions.push(`${key} < $${paramIndex}`);
              params.push(opValue);
              paramIndex++;
              break;
            case '$ne':
              conditions.push(`${key} != $${paramIndex}`);
              params.push(opValue);
              paramIndex++;
              break;
            case '$in':
              const inPlaceholders = Array.isArray(opValue)
                ? opValue.map(() => `$${paramIndex++}`).join(', ')
                : `$${paramIndex++}`;
              conditions.push(`${key} IN (${inPlaceholders})`);
              if (Array.isArray(opValue)) {
                params.push(...opValue);
              } else {
                params.push(opValue);
              }
              break;
          }
        }
      } else {
        // Simple equality
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    return {
      whereClause: conditions.length > 0 ? conditions.join(' AND ') : '',
      params,
    };
  }

  /**
   * Builds INSERT data from object
   */
  private buildInsertData(data: any): { fields: string[]; values: any[]; placeholders: string[] } {
    const fields: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(key);
      values.push(value);
      placeholders.push(`$${values.length}`);
    }

    return { fields, values, placeholders };
  }

  /**
   * Builds UPDATE data from object
   */
  private buildUpdateData(data: any): { fields: string[]; values: any[]; placeholders: string[] } {
    const fields: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(key);
      values.push(value);
      placeholders.push(`$${values.length}`);
    }

    return { fields, values, placeholders };
  }

  /**
   * Gets all columns from the table
   */
  private async getAllColumns(): Promise<string[]> {
    try {
      const query = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `;
      const result: QueryResult = await this.client.query(query, [this.tableName]);
      return result.rows.map(row => row.column_name);
    } catch (error) {
      // Fallback to common columns if we can't query the schema
      return ['id', 'name', 'email', 'created_at', 'updated_at'];
    }
  }

  /**
   * Gets the PostgreSQL pool instance
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * Gets the PostgreSQL client instance
   */
  getClient(): PoolClient {
    return this.client;
  }
}
