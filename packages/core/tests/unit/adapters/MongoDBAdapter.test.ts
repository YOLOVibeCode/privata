/**
 * TDD RED Phase: Tests for MongoDBAdapter
 * 
 * These tests define the expected behavior of the MongoDBAdapter
 * before we implement it. They should FAIL initially (RED).
 */

import { MongoDBAdapter } from '../../../src/adapters/MongoDBAdapter';
import { IDatabaseReader } from '../../../src/interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../../../src/interfaces/IDatabaseWriter';
import { IDatabaseTransaction } from '../../../src/interfaces/IDatabaseTransaction';
import { ReadOptions } from '../../../src/types/ReadOptions';
import { WriteOptions } from '../../../src/types/WriteOptions';
import { Query } from '../../../src/types/Query';
import { Transaction } from '../../../src/types/Transaction';

// Mock MongoDB client
const mockMongoClient = {
  db: jest.fn(),
  connect: jest.fn(),
  close: jest.fn(),
  startSession: jest.fn()
};

const mockCollection = {
  findOne: jest.fn(),
  find: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  startSession: jest.fn()
};

const mockDb = {
  collection: jest.fn(() => mockCollection)
};

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn()
};

// Mock the MongoDB module
jest.mock('mongodb', () => ({
  MongoClient: jest.fn(() => mockMongoClient),
  ObjectId: jest.fn((id) => ({ toString: () => id }))
}));

describe('MongoDBAdapter', () => {
  let mongoAdapter: MongoDBAdapter;
  let mockClient: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock client
    mockClient = mockMongoClient;
    mockClient.db.mockReturnValue(mockDb);
    mockCollection.startSession.mockReturnValue(mockSession);
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.startSession.mockReturnValue(mockSession);
    
    // Setup default mock responses
    mockCollection.findOne.mockResolvedValue(null);
    mockCollection.insertOne.mockResolvedValue({ insertedId: '507f1f77bcf86cd799439011', acknowledged: true });
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1, acknowledged: true });
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1, acknowledged: true });
    mockCollection.countDocuments.mockResolvedValue(0);
    
    // Setup default cursor mock
    const mockCursor = {
      toArray: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis()
    };
    mockCollection.find.mockReturnValue(mockCursor);
    
    // This will fail until we create the adapter
    mongoAdapter = new MongoDBAdapter('mongodb://localhost:27017', 'testdb');
    await mongoAdapter.connect();
  });

  describe('IDatabaseReader implementation', () => {
    it('should implement IDatabaseReader interface', () => {
      // TDD RED: Test implements IDatabaseReader
      expect(mongoAdapter).toHaveProperty('findById');
      expect(mongoAdapter).toHaveProperty('findMany');
      expect(mongoAdapter).toHaveProperty('exists');
      expect(typeof mongoAdapter.findById).toBe('function');
      expect(typeof mongoAdapter.findMany).toBe('function');
      expect(typeof mongoAdapter.exists).toBe('function');
    });

    describe('findById method', () => {
      it('should have correct signature: findById(id: string, options?: ReadOptions): Promise<any | null>', async () => {
        // TDD RED: Test the method signature
        const result = await mongoAdapter.findById('507f1f77bcf86cd799439011');
        expect(typeof mongoAdapter.findById).toBe('function');
      });

      it('should find document by ObjectId', async () => {
        // TDD RED: Test finds document by ObjectId
        const id = '507f1f77bcf86cd799439011';
        const mockDocument = { _id: id, name: 'John Doe', email: 'john@example.com' };
        
        mockCollection.findOne.mockResolvedValue(mockDocument);
        
        const result = await mongoAdapter.findById(id);
        
        expect(result).toEqual(mockDocument);
        expect(mockCollection.findOne).toHaveBeenCalledWith(
          { _id: expect.any(Object) },
          {}
        );
      });

      it('should return null when document not found', async () => {
        // TDD RED: Test returns null when not found
        const id = '507f1f77bcf86cd799439011';
        
        mockCollection.findOne.mockResolvedValue(null);
        
        const result = await mongoAdapter.findById(id);
        
        expect(result).toBeNull();
      });

      it('should handle select options', async () => {
        // TDD RED: Test handles select fields
        const id = '507f1f77bcf86cd799439011';
        const options: ReadOptions = {
          select: ['name', 'email']
        };
        const mockDocument = { _id: id, name: 'John Doe' };
        
        mockCollection.findOne.mockResolvedValue(mockDocument);
        
        const result = await mongoAdapter.findById(id, options);
        
        expect(result).toEqual(mockDocument);
        expect(mockCollection.findOne).toHaveBeenCalledWith(
          { _id: expect.any(Object) },
          { projection: { name: 1, email: 1 } }
        );
      });

      it('should handle populate options', async () => {
        // TDD RED: Test handles populate (MongoDB uses aggregation for population)
        const id = '507f1f77bcf86cd799439011';
        const options: ReadOptions = {
          populate: ['user', 'organization']
        };
        const mockDocument = { _id: id, name: 'John Doe' };
        
        mockCollection.findOne.mockResolvedValue(mockDocument);
        
        const result = await mongoAdapter.findById(id, options);
        
        expect(result).toEqual(mockDocument);
        // MongoDB adapter should handle populate through aggregation
        expect(mockCollection.findOne).toHaveBeenCalled();
      });

      it('should handle invalid ObjectId format', async () => {
        // TDD RED: Test handles invalid ObjectId
        const invalidId = 'invalid-id';
        
        mockCollection.findOne.mockRejectedValue(new Error('Invalid ObjectId'));
        
        await expect(mongoAdapter.findById(invalidId)).rejects.toThrow('Invalid ObjectId');
      });
    });

    describe('findMany method', () => {
      it('should have correct signature: findMany(query: Query, options?: ReadOptions): Promise<any[]>', async () => {
        // TDD RED: Test the method signature
        const result = await mongoAdapter.findMany({ name: 'John' });
        expect(typeof mongoAdapter.findMany).toBe('function');
      });

      it('should find multiple documents', async () => {
        // TDD RED: Test finds multiple documents
        const query: Query = { name: 'John' };
        const mockDocuments = [
          { _id: '507f1f77bcf86cd799439011', name: 'John Doe' },
          { _id: '507f1f77bcf86cd799439012', name: 'John Smith' }
        ];
        
        const mockCursor = {
          toArray: jest.fn().mockResolvedValue(mockDocuments)
        };
        mockCollection.find.mockReturnValue(mockCursor);
        
        const result = await mongoAdapter.findMany(query);
        
        expect(result).toEqual(mockDocuments);
        expect(mockCollection.find).toHaveBeenCalledWith(query);
        expect(mockCursor.toArray).toHaveBeenCalled();
      });

      it('should handle query with complex conditions', async () => {
        // TDD RED: Test complex queries
        const query: Query = {
          $and: [
            { age: { $gte: 18 } },
            { status: 'active' }
          ]
        };
        const mockDocuments = [{ _id: '507f1f77bcf86cd799439011', age: 25, status: 'active' }];
        
        const mockCursor = {
          toArray: jest.fn().mockResolvedValue(mockDocuments)
        };
        mockCollection.find.mockReturnValue(mockCursor);
        
        const result = await mongoAdapter.findMany(query);
        
        expect(result).toEqual(mockDocuments);
        expect(mockCollection.find).toHaveBeenCalledWith(query);
      });

      it('should handle sorting options', async () => {
        // TDD RED: Test sorting
        const query: Query = { status: 'active' };
        const options: ReadOptions = {
          sort: { createdAt: -1, name: 1 }
        };
        const mockDocuments = [{ _id: '507f1f77bcf86cd799439011', name: 'John' }];
        
        const mockCursor = {
          toArray: jest.fn().mockResolvedValue(mockDocuments),
          sort: jest.fn().mockReturnThis()
        };
        mockCollection.find.mockReturnValue(mockCursor);
        
        const result = await mongoAdapter.findMany(query, options);
        
        expect(result).toEqual(mockDocuments);
        expect(mockCursor.sort).toHaveBeenCalledWith({ createdAt: -1, name: 1 });
      });

      it('should handle limit and offset options', async () => {
        // TDD RED: Test limit and offset
        const query: Query = { status: 'active' };
        const options: ReadOptions = {
          limit: 10,
          offset: 20
        };
        const mockDocuments = [{ _id: '507f1f77bcf86cd799439011', name: 'John' }];
        
        const mockCursor = {
          toArray: jest.fn().mockResolvedValue(mockDocuments),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis()
        };
        mockCollection.find.mockReturnValue(mockCursor);
        
        const result = await mongoAdapter.findMany(query, options);
        
        expect(result).toEqual(mockDocuments);
        expect(mockCursor.limit).toHaveBeenCalledWith(10);
        expect(mockCursor.skip).toHaveBeenCalledWith(20);
      });

      it('should return empty array when no documents found', async () => {
        // TDD RED: Test empty results
        const query: Query = { name: 'NonExistent' };
        
        const mockCursor = {
          toArray: jest.fn().mockResolvedValue([])
        };
        mockCollection.find.mockReturnValue(mockCursor);
        
        const result = await mongoAdapter.findMany(query);
        
        expect(result).toEqual([]);
      });
    });

    describe('exists method', () => {
      it('should have correct signature: exists(id: string): Promise<boolean>', async () => {
        // TDD RED: Test the method signature
        const result = await mongoAdapter.exists('507f1f77bcf86cd799439011');
        expect(typeof mongoAdapter.exists).toBe('function');
      });

      it('should return true when document exists', async () => {
        // TDD RED: Test returns true when exists
        const id = '507f1f77bcf86cd799439011';
        
        mockCollection.countDocuments.mockResolvedValue(1);
        
        const result = await mongoAdapter.exists(id);
        
        expect(result).toBe(true);
        expect(mockCollection.countDocuments).toHaveBeenCalledWith(
          { _id: expect.any(Object) },
          { limit: 1 }
        );
      });

      it('should return false when document does not exist', async () => {
        // TDD RED: Test returns false when not exists
        const id = '507f1f77bcf86cd799439011';
        
        mockCollection.countDocuments.mockResolvedValue(0);
        
        const result = await mongoAdapter.exists(id);
        
        expect(result).toBe(false);
      });

      it('should handle invalid ObjectId format', async () => {
        // TDD RED: Test handles invalid ObjectId
        const invalidId = 'invalid-id';
        
        mockCollection.countDocuments.mockRejectedValue(new Error('Invalid ObjectId'));
        
        await expect(mongoAdapter.exists(invalidId)).rejects.toThrow('Invalid ObjectId');
      });
    });
  });

  describe('IDatabaseWriter implementation', () => {
    it('should implement IDatabaseWriter interface', () => {
      // TDD RED: Test implements IDatabaseWriter
      expect(mongoAdapter).toHaveProperty('create');
      expect(mongoAdapter).toHaveProperty('update');
      expect(mongoAdapter).toHaveProperty('delete');
      expect(typeof mongoAdapter.create).toBe('function');
      expect(typeof mongoAdapter.update).toBe('function');
      expect(typeof mongoAdapter.delete).toBe('function');
    });

    describe('create method', () => {
      it('should have correct signature: create(data: any, options?: WriteOptions): Promise<any>', async () => {
        // TDD RED: Test the method signature
        const result = await mongoAdapter.create({ name: 'John' });
        expect(typeof mongoAdapter.create).toBe('function');
      });

      it('should create a new document', async () => {
        // TDD RED: Test creates document
        const data = { name: 'John Doe', email: 'john@example.com' };
        const insertedId = '507f1f77bcf86cd799439011';
        const mockResult = {
          insertedId,
          acknowledged: true
        };
        
        mockCollection.insertOne.mockResolvedValue(mockResult);
        mockCollection.findOne.mockResolvedValue({ _id: insertedId, ...data });
        
        const result = await mongoAdapter.create(data);
        
        expect(result).toEqual({ _id: insertedId, ...data });
        expect(mockCollection.insertOne).toHaveBeenCalledWith(data);
        expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: expect.any(Object) }, {});
      });

      it('should handle upsert option', async () => {
        // TDD RED: Test handles upsert
        const data = { name: 'John Doe', email: 'john@example.com' };
        const options: WriteOptions = { upsert: true };
        const insertedId = '507f1f77bcf86cd799439011';
        
        mockCollection.insertOne.mockResolvedValue({ insertedId, acknowledged: true });
        mockCollection.findOne.mockResolvedValue({ _id: insertedId, ...data });
        
        const result = await mongoAdapter.create(data, options);
        
        expect(result).toEqual({ _id: insertedId, ...data });
        expect(mockCollection.insertOne).toHaveBeenCalledWith(data);
      });

      it('should handle validation errors', async () => {
        // TDD RED: Test validation errors
        const data = { name: 'John' }; // Missing required email field
        
        mockCollection.insertOne.mockRejectedValue(new Error('Validation failed'));
        
        await expect(mongoAdapter.create(data)).rejects.toThrow('Validation failed');
      });
    });

    describe('update method', () => {
      it('should have correct signature: update(id: string, data: any, options?: WriteOptions): Promise<any>', async () => {
        // TDD RED: Test the method signature
        const result = await mongoAdapter.update('507f1f77bcf86cd799439011', { name: 'Jane' });
        expect(typeof mongoAdapter.update).toBe('function');
      });

      it('should update an existing document', async () => {
        // TDD RED: Test updates document
        const id = '507f1f77bcf86cd799439011';
        const data = { name: 'Jane Doe' };
        const mockResult = {
          modifiedCount: 1,
          acknowledged: true
        };
        const updatedDocument = { _id: id, name: 'Jane Doe', email: 'jane@example.com' };
        
        mockCollection.updateOne.mockResolvedValue(mockResult);
        mockCollection.findOne.mockResolvedValue(updatedDocument);
        
        const result = await mongoAdapter.update(id, data);
        
        expect(result).toEqual(updatedDocument);
        expect(mockCollection.updateOne).toHaveBeenCalledWith(
          { _id: expect.any(Object) },
          { $set: data },
          {}
        );
        expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: expect.any(Object) }, {});
      });

      it('should handle upsert option', async () => {
        // TDD RED: Test handles upsert in update
        const id = '507f1f77bcf86cd799439011';
        const data = { name: 'Jane Doe' };
        const options: WriteOptions = { upsert: true };
        const mockResult = {
          modifiedCount: 1,
          upsertedId: id,
          acknowledged: true
        };
        const updatedDocument = { _id: id, name: 'Jane Doe' };
        
        mockCollection.updateOne.mockResolvedValue(mockResult);
        mockCollection.findOne.mockResolvedValue(updatedDocument);
        
        const result = await mongoAdapter.update(id, data, options);
        
        expect(result).toEqual(updatedDocument);
        expect(mockCollection.updateOne).toHaveBeenCalledWith(
          { _id: expect.any(Object) },
          { $set: data },
          { upsert: true }
        );
      });

      it('should handle document not found', async () => {
        // TDD RED: Test document not found
        const id = '507f1f77bcf86cd799439011';
        const data = { name: 'Jane Doe' };
        const mockResult = {
          modifiedCount: 0,
          acknowledged: true
        };
        
        mockCollection.updateOne.mockResolvedValue(mockResult);
        mockCollection.findOne.mockResolvedValue(null);
        
        const result = await mongoAdapter.update(id, data);
        
        expect(result).toBeNull();
      });
    });

    describe('delete method', () => {
      it('should have correct signature: delete(id: string, options?: WriteOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        await mongoAdapter.delete('507f1f77bcf86cd799439011');
        expect(typeof mongoAdapter.delete).toBe('function');
      });

      it('should delete a document', async () => {
        // TDD RED: Test deletes document
        const id = '507f1f77bcf86cd799439011';
        const mockResult = {
          deletedCount: 1,
          acknowledged: true
        };
        
        mockCollection.deleteOne.mockResolvedValue(mockResult);
        
        await mongoAdapter.delete(id);
        
        expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
      });

      it('should handle document not found', async () => {
        // TDD RED: Test document not found
        const id = '507f1f77bcf86cd799439011';
        const mockResult = {
          deletedCount: 0,
          acknowledged: true
        };
        
        mockCollection.deleteOne.mockResolvedValue(mockResult);
        
        await expect(mongoAdapter.delete(id)).resolves.not.toThrow();
        expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
      });
    });
  });

  describe('IDatabaseTransaction implementation', () => {
    it('should implement IDatabaseTransaction interface', () => {
      // TDD RED: Test implements IDatabaseTransaction
      expect(mongoAdapter).toHaveProperty('begin');
      expect(mongoAdapter).toHaveProperty('commit');
      expect(mongoAdapter).toHaveProperty('rollback');
      expect(typeof mongoAdapter.begin).toBe('function');
      expect(typeof mongoAdapter.commit).toBe('function');
      expect(typeof mongoAdapter.rollback).toBe('function');
    });

    describe('begin method', () => {
      it('should have correct signature: begin(): Promise<Transaction>', async () => {
        // TDD RED: Test the method signature
        const result = await mongoAdapter.begin();
        expect(typeof mongoAdapter.begin).toBe('function');
      });

      it('should begin a new transaction', async () => {
        // TDD RED: Test begins transaction
        const mockTransaction: Transaction = {
          id: 'txn-123',
          status: 'active',
          startTime: new Date(),
          metadata: { sessionId: 'session-123' }
        };
        
        mockSession.startTransaction.mockResolvedValue(undefined);
        
        const result = await mongoAdapter.begin();
        
        expect(result).toMatchObject({
          id: expect.any(String),
          status: 'active',
          startTime: expect.any(Date),
          metadata: expect.any(Object)
        });
        expect(mockSession.startTransaction).toHaveBeenCalled();
      });
    });

    describe('commit method', () => {
      it('should have correct signature: commit(transaction: Transaction): Promise<void>', async () => {
        // TDD RED: Test the method signature
        const transaction = await mongoAdapter.begin();
        await mongoAdapter.commit(transaction);
        expect(typeof mongoAdapter.commit).toBe('function');
      });

      it('should commit a transaction', async () => {
        // TDD RED: Test commits transaction
        const transaction = await mongoAdapter.begin();
        
        mockSession.commitTransaction.mockResolvedValue(undefined);
        
        await mongoAdapter.commit(transaction);
        
        expect(mockSession.commitTransaction).toHaveBeenCalled();
      });
    });

    describe('rollback method', () => {
      it('should have correct signature: rollback(transaction: Transaction): Promise<void>', async () => {
        // TDD RED: Test the method signature
        const transaction = await mongoAdapter.begin();
        await mongoAdapter.rollback(transaction);
        expect(typeof mongoAdapter.rollback).toBe('function');
      });

      it('should rollback a transaction', async () => {
        // TDD RED: Test rollbacks transaction
        const transaction = await mongoAdapter.begin();
        
        mockSession.abortTransaction.mockResolvedValue(undefined);
        
        await mongoAdapter.rollback(transaction);
        
        expect(mockSession.abortTransaction).toHaveBeenCalled();
      });
    });
  });

  describe('Connection Management', () => {
    it('should connect to MongoDB on initialization', async () => {
      // TDD RED: Test connects on init
      mockClient.connect.mockResolvedValue(undefined);
      
      const adapter = new MongoDBAdapter('mongodb://localhost:27017', 'testdb');
      
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // TDD RED: Test connection errors
      mockClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      const adapter = new MongoDBAdapter('mongodb://invalid:27017', 'testdb');
      await expect(adapter.connect()).rejects.toThrow('Connection failed');
    });

    it('should close connection', async () => {
      // TDD RED: Test closes connection
      mockClient.close.mockResolvedValue(undefined);
      
      await mongoAdapter.close();
      
      expect(mockClient.close).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // TDD RED: Test error handling
      const id = '507f1f77bcf86cd799439011';
      mockCollection.findOne.mockRejectedValue(new Error('Database error'));
      
      await expect(mongoAdapter.findById(id)).rejects.toThrow('Database error');
    });

    it('should handle network errors', async () => {
      // TDD RED: Test network errors
      const query: Query = { name: 'John' };
      const mockCursor = {
        toArray: jest.fn().mockRejectedValue(new Error('Network error'))
      };
      mockCollection.find.mockReturnValue(mockCursor);
      
      await expect(mongoAdapter.findMany(query)).rejects.toThrow('Network error');
    });
  });
});
