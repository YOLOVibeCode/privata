/**
 * MongoDBAdapter - MongoDB implementation of database interfaces
 *
 * This adapter provides MongoDB-specific implementations of the database interfaces,
 * following the Adapter pattern and ISP principles.
 *
 * @example
 * ```typescript
 * const adapter = new MongoDBAdapter('mongodb://localhost:27017', 'mydb');
 * await adapter.connect();
 *
 * const user = await adapter.findById('507f1f77bcf86cd799439011');
 * const users = await adapter.findMany({ status: 'active' });
 * ```
 */

import { MongoClient, Db, Collection, ObjectId, ClientSession } from 'mongodb';
import { IDatabaseReader } from '../interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../interfaces/IDatabaseWriter';
import { IDatabaseTransaction } from '../interfaces/IDatabaseTransaction';
import { ReadOptions } from '../types/ReadOptions';
import { WriteOptions } from '../types/WriteOptions';
import { Query } from '../types/Query';
import { Transaction } from '../types/Transaction';

export class MongoDBAdapter implements IDatabaseReader, IDatabaseWriter, IDatabaseTransaction {
  private readonly client: MongoClient;
  private db!: Db;
  private collection!: Collection;
  private readonly sessions: Map<string, ClientSession> = new Map();

  /**
   * Creates a new MongoDBAdapter instance
   *
   * @param connectionString - MongoDB connection string
   * @param databaseName - Name of the database
   * @param collectionName - Name of the collection (defaults to 'documents')
   */
  constructor(
    private readonly connectionString: string,
    private readonly databaseName: string,
    private readonly collectionName: string = 'documents',
  ) {
    this.client = new MongoClient(connectionString);
  }

  /**
   * Connects to MongoDB
   */
  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.databaseName);
    this.collection = this.db.collection(this.collectionName);
  }

  /**
   * Closes the MongoDB connection
   */
  async close(): Promise<void> {
    await this.client.close();
  }

  // IDatabaseReader implementation

  /**
   * Finds a single document by its unique identifier
   */
  async findById(id: string, options?: ReadOptions): Promise<any | null> {
    try {
      const objectId = new ObjectId(id);
      const mongoOptions: any = {};

      // Convert ReadOptions to MongoDB options
      if (options?.select) {
        const projection: Record<string, 1> = {};
        options.select.forEach(field => {
          projection[field] = 1;
        });
        mongoOptions.projection = projection;
      }

      if (options?.exclude) {
        const projection: Record<string, 0> = {};
        options.exclude.forEach(field => {
          projection[field] = 0;
        });
        mongoOptions.projection = { ...mongoOptions.projection, ...projection };
      }

      return await this.collection.findOne({ _id: objectId }, mongoOptions);
    } catch (error) {
      throw new Error(`MongoDB findById error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds multiple documents based on a query
   */
  async findMany(query: Query, options?: ReadOptions): Promise<any[]> {
    try {
      let cursor = this.collection.find(query);

      // Apply sorting
      if (options?.sort) {
        cursor = cursor.sort(options.sort);
      }

      // Apply limit
      if (options?.limit) {
        cursor = cursor.limit(options.limit);
      }

      // Apply offset (skip)
      if (options?.offset) {
        cursor = cursor.skip(options.offset);
      }

      // Apply projection
      if (options?.select || options?.exclude) {
        const projection: Record<string, 0 | 1> = {};

        if (options.select) {
          options.select.forEach(field => {
            projection[field] = 1;
          });
        }

        if (options.exclude) {
          options.exclude.forEach(field => {
            projection[field] = 0;
          });
        }

        cursor = cursor.project(projection);
      }

      return await cursor.toArray();
    } catch (error) {
      throw new Error(`MongoDB findMany error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a document with the given ID exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const count = await this.collection.countDocuments(
        { _id: objectId },
        { limit: 1 },
      );
      return count > 0;
    } catch (error) {
      throw new Error(`MongoDB exists error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // IDatabaseWriter implementation

  /**
   * Creates a new document in the database
   */
  async create(data: any, options?: WriteOptions): Promise<any> {
    try {
      const result = await this.collection.insertOne(data);

      if (result.acknowledged && result.insertedId) {
        // Return the created document
        return await this.findById(result.insertedId.toString());
      }

      throw new Error('Failed to create document');
    } catch (error) {
      throw new Error(`MongoDB create error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an existing document identified by its ID
   */
  async update(id: string, data: any, options?: WriteOptions): Promise<any> {
    try {
      const objectId = new ObjectId(id);
      const updateOptions: any = {};

      if (options?.upsert) {
        updateOptions.upsert = true;
      }

      const result = await this.collection.updateOne(
        { _id: objectId },
        { $set: data },
        updateOptions,
      );

      if (result.acknowledged) {
        if (result.modifiedCount > 0 || result.upsertedId) {
          // Return the updated document
          return await this.findById(id);
        }
        return null; // Document not found
      }

      throw new Error('Failed to update document');
    } catch (error) {
      throw new Error(`MongoDB update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a document identified by its ID
   */
  async delete(id: string, options?: WriteOptions): Promise<void> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });

      if (!result.acknowledged) {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      throw new Error(`MongoDB delete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // IDatabaseTransaction implementation

  /**
   * Begins a new database transaction
   */
  async begin(): Promise<Transaction> {
    try {
      const session = this.client.startSession();
      await session.startTransaction();

      const transaction: Transaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        startTime: new Date(),
        metadata: { sessionId: session.id },
      };

      this.sessions.set(transaction.id, session);
      return transaction;
    } catch (error) {
      throw new Error(`MongoDB begin transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Commits an active database transaction
   */
  async commit(transaction: Transaction): Promise<void> {
    try {
      const session = this.sessions.get(transaction.id);
      if (!session) {
        throw new Error('Transaction session not found');
      }

      await session.commitTransaction();
      await session.endSession();
      this.sessions.delete(transaction.id);
    } catch (error) {
      throw new Error(`MongoDB commit transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rolls back an active database transaction
   */
  async rollback(transaction: Transaction): Promise<void> {
    try {
      const session = this.sessions.get(transaction.id);
      if (!session) {
        throw new Error('Transaction session not found');
      }

      await session.abortTransaction();
      await session.endSession();
      this.sessions.delete(transaction.id);
    } catch (error) {
      throw new Error(`MongoDB rollback transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the MongoDB collection instance
   */
  getCollection(): Collection {
    return this.collection;
  }

  /**
   * Gets the MongoDB database instance
   */
  getDatabase(): Db {
    return this.db;
  }

  /**
   * Gets the MongoDB client instance
   */
  getClient(): MongoClient {
    return this.client;
  }
}
