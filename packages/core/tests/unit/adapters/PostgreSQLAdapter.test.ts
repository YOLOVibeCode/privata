/**
 * TDD RED Phase: Tests for PostgreSQLAdapter
 * 
 * These tests define the expected behavior of the PostgreSQLAdapter
 * before we implement it. They should FAIL initially (RED).
 */

import { PostgreSQLAdapter } from '../../../src/adapters/PostgreSQLAdapter';
import { IDatabaseReader } from '../../../src/interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../../../src/interfaces/IDatabaseWriter';
import { IDatabaseTransaction } from '../../../src/interfaces/IDatabaseTransaction';
import { ReadOptions } from '../../../src/types/ReadOptions';
import { WriteOptions } from '../../../src/types/WriteOptions';
import { Query } from '../../../src/types/Query';
import { Transaction } from '../../../src/types/Transaction';

// Mock PostgreSQL client
const mockClient = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  release: jest.fn()
};

const mockPool = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn()
};

// Mock the PostgreSQL module
jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool),
  Client: jest.fn(() => mockClient)
}));

describe('PostgreSQLAdapter', () => {
  let postgresAdapter: PostgreSQLAdapter;
  let mockPoolInstance: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock pool
    mockPoolInstance = mockPool;
    mockPool.connect.mockResolvedValue(mockClient);
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.end.mockResolvedValue(undefined);
    mockPool.end.mockResolvedValue(undefined);
    
    // Setup default mock responses
    mockClient.query.mockResolvedValue({
      rows: [],
      rowCount: 0,
      command: 'SELECT'
    });
    mockPool.query.mockResolvedValue({
      rows: [],
      rowCount: 0,
      command: 'SELECT'
    });
    
    // Setup default column schema mock
    mockClient.query.mockImplementation((query: string, params: any[]) => {
      if (query.includes('information_schema.columns')) {
        return Promise.resolve({
          rows: [
            { column_name: 'id' },
            { column_name: 'name' },
            { column_name: 'email' },
            { column_name: 'created_at' },
            { column_name: 'updated_at' }
          ],
          rowCount: 5,
          command: 'SELECT'
        });
      }
      return Promise.resolve({
        rows: [],
        rowCount: 0,
        command: 'SELECT'
      });
    });
    
    // This will fail until we create the adapter
    postgresAdapter = new PostgreSQLAdapter({
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass'
    });
    await postgresAdapter.connect();
  });

  describe('IDatabaseReader implementation', () => {
    it('should implement IDatabaseReader interface', () => {
      // TDD RED: Test implements IDatabaseReader
      expect(postgresAdapter).toHaveProperty('findById');
      expect(postgresAdapter).toHaveProperty('findMany');
      expect(postgresAdapter).toHaveProperty('exists');
      expect(typeof postgresAdapter.findById).toBe('function');
      expect(typeof postgresAdapter.findMany).toBe('function');
      expect(typeof postgresAdapter.exists).toBe('function');
    });

    describe('findById method', () => {
      it('should have correct signature: findById(id: string, options?: ReadOptions): Promise<any | null>', async () => {
        // TDD RED: Test the method signature
        const result = await postgresAdapter.findById('123');
        expect(typeof postgresAdapter.findById).toBe('function');
      });

      it('should find document by ID', async () => {
        // TDD RED: Test finds document by ID
        const id = '123';
        const mockDocument = { id, name: 'John Doe', email: 'john@example.com' };
        
        mockClient.query.mockResolvedValue({
          rows: [mockDocument],
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findById(id);
        
        expect(result).toEqual(mockDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT * FROM documents WHERE id = $1',
          [id]
        );
      });

      it('should return null when document not found', async () => {
        // TDD RED: Test returns null when not found
        const id = '123';
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findById(id);
        
        expect(result).toBeNull();
      });

      it('should handle select options', async () => {
        // TDD RED: Test handles select fields
        const id = '123';
        const options: ReadOptions = {
          select: ['name', 'email']
        };
        const mockDocument = { id, name: 'John Doe' };
        
        mockClient.query.mockResolvedValue({
          rows: [mockDocument],
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findById(id, options);
        
        expect(result).toEqual(mockDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT name, email FROM documents WHERE id = $1',
          [id]
        );
      });

      it('should handle exclude options', async () => {
        // TDD RED: Test handles exclude fields
        const id = '123';
        const options: ReadOptions = {
          exclude: ['password', 'secret']
        };
        const mockDocument = { id, name: 'John Doe', email: 'john@example.com' };
        
        // Override the mock for this specific test
        mockClient.query.mockImplementation((query: string, params: any[]) => {
          if (query.includes('information_schema.columns')) {
            return Promise.resolve({
              rows: [
                { column_name: 'id' },
                { column_name: 'name' },
                { column_name: 'email' },
                { column_name: 'created_at' },
                { column_name: 'updated_at' }
              ],
              rowCount: 5,
              command: 'SELECT'
            });
          }
          return Promise.resolve({
            rows: [mockDocument],
            rowCount: 1,
            command: 'SELECT'
          });
        });
        
        const result = await postgresAdapter.findById(id, options);
        
        expect(result).toEqual(mockDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT id, name, email, created_at, updated_at FROM documents WHERE id = $1',
          [id]
        );
      });

      it('should handle invalid ID format', async () => {
        // TDD RED: Test handles invalid ID
        const invalidId = 'invalid-id';
        
        mockClient.query.mockRejectedValue(new Error('Invalid ID format'));
        
        await expect(postgresAdapter.findById(invalidId)).rejects.toThrow('Invalid ID format');
      });
    });

    describe('findMany method', () => {
      it('should have correct signature: findMany(query: Query, options?: ReadOptions): Promise<any[]>', async () => {
        // TDD RED: Test the method signature
        const result = await postgresAdapter.findMany({ name: 'John' });
        expect(typeof postgresAdapter.findMany).toBe('function');
      });

      it('should find multiple documents', async () => {
        // TDD RED: Test finds multiple documents
        const query: Query = { name: 'John' };
        const mockDocuments = [
          { id: '123', name: 'John Doe' },
          { id: '124', name: 'John Smith' }
        ];
        
        mockClient.query.mockResolvedValue({
          rows: mockDocuments,
          rowCount: 2,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findMany(query);
        
        expect(result).toEqual(mockDocuments);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT * FROM documents WHERE name = $1',
          ['John']
        );
      });

      it('should handle query with complex conditions', async () => {
        // TDD RED: Test complex queries
        const query: Query = {
          $and: [
            { age: { $gte: 18 } },
            { status: 'active' }
          ]
        };
        const mockDocuments = [{ id: '123', age: 25, status: 'active' }];
        
        mockClient.query.mockResolvedValue({
          rows: mockDocuments,
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findMany(query);
        
        expect(result).toEqual(mockDocuments);
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM documents WHERE'),
          expect.arrayContaining([18, 'active'])
        );
      });

      it('should handle sorting options', async () => {
        // TDD RED: Test sorting
        const query: Query = { status: 'active' };
        const options: ReadOptions = {
          sort: { createdAt: -1, name: 1 }
        };
        const mockDocuments = [{ id: '123', name: 'John' }];
        
        mockClient.query.mockResolvedValue({
          rows: mockDocuments,
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findMany(query, options);
        
        expect(result).toEqual(mockDocuments);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT * FROM documents WHERE status = $1 ORDER BY createdAt DESC, name ASC',
          ['active']
        );
      });

      it('should handle limit and offset options', async () => {
        // TDD RED: Test limit and offset
        const query: Query = { status: 'active' };
        const options: ReadOptions = {
          limit: 10,
          offset: 20
        };
        const mockDocuments = [{ id: '123', name: 'John' }];
        
        mockClient.query.mockResolvedValue({
          rows: mockDocuments,
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findMany(query, options);
        
        expect(result).toEqual(mockDocuments);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT * FROM documents WHERE status = $1 LIMIT $2 OFFSET $3',
          ['active', 10, 20]
        );
      });

      it('should return empty array when no documents found', async () => {
        // TDD RED: Test empty results
        const query: Query = { name: 'NonExistent' };
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.findMany(query);
        
        expect(result).toEqual([]);
      });
    });

    describe('exists method', () => {
      it('should have correct signature: exists(id: string): Promise<boolean>', async () => {
        // TDD RED: Test the method signature
        mockClient.query.mockResolvedValue({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT'
        });
        const result = await postgresAdapter.exists('123');
        expect(typeof postgresAdapter.exists).toBe('function');
      });

      it('should return true when document exists', async () => {
        // TDD RED: Test returns true when exists
        const id = '123';
        
        mockClient.query.mockResolvedValue({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.exists(id);
        
        expect(result).toBe(true);
        expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT COUNT(*) as count FROM documents WHERE id = $1',
          [id]
        );
      });

      it('should return false when document does not exist', async () => {
        // TDD RED: Test returns false when not exists
        const id = '123';
        
        mockClient.query.mockResolvedValue({
          rows: [{ count: '0' }],
          rowCount: 1,
          command: 'SELECT'
        });
        
        const result = await postgresAdapter.exists(id);
        
        expect(result).toBe(false);
      });

      it('should handle invalid ID format', async () => {
        // TDD RED: Test handles invalid ID
        const invalidId = 'invalid-id';
        
        mockClient.query.mockRejectedValue(new Error('Invalid ID format'));
        
        await expect(postgresAdapter.exists(invalidId)).rejects.toThrow('Invalid ID format');
      });
    });
  });

  describe('IDatabaseWriter implementation', () => {
    it('should implement IDatabaseWriter interface', () => {
      // TDD RED: Test implements IDatabaseWriter
      expect(postgresAdapter).toHaveProperty('create');
      expect(postgresAdapter).toHaveProperty('update');
      expect(postgresAdapter).toHaveProperty('delete');
      expect(typeof postgresAdapter.create).toBe('function');
      expect(typeof postgresAdapter.update).toBe('function');
      expect(typeof postgresAdapter.delete).toBe('function');
    });

    describe('create method', () => {
      it('should have correct signature: create(data: any, options?: WriteOptions): Promise<any>', async () => {
        // TDD RED: Test the method signature
        const result = await postgresAdapter.create({ name: 'John' });
        expect(typeof postgresAdapter.create).toBe('function');
      });

      it('should create a new document', async () => {
        // TDD RED: Test creates document
        const data = { name: 'John Doe', email: 'john@example.com' };
        const createdDocument = { id: '123', ...data, created_at: new Date(), updated_at: new Date() };
        
        mockClient.query.mockResolvedValue({
          rows: [createdDocument],
          rowCount: 1,
          command: 'INSERT'
        });
        
        const result = await postgresAdapter.create(data);
        
        expect(result).toEqual(createdDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'INSERT INTO documents (name, email) VALUES ($1, $2) RETURNING *',
          ['John Doe', 'john@example.com']
        );
      });

      it('should handle upsert option', async () => {
        // TDD RED: Test handles upsert
        const data = { id: '123', name: 'John Doe', email: 'john@example.com' };
        const options: WriteOptions = { upsert: true };
        const upsertedDocument = { ...data, created_at: new Date(), updated_at: new Date() };
        
        mockClient.query.mockResolvedValue({
          rows: [upsertedDocument],
          rowCount: 1,
          command: 'INSERT'
        });
        
        const result = await postgresAdapter.create(data, options);
        
        expect(result).toEqual(upsertedDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'INSERT INTO documents (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id, name = EXCLUDED.name, email = EXCLUDED.email, updated_at = NOW() RETURNING *',
          ['123', 'John Doe', 'john@example.com']
        );
      });

      it('should handle validation errors', async () => {
        // TDD RED: Test validation errors
        const data = { name: 'John' }; // Missing required email field
        
        mockClient.query.mockRejectedValue(new Error('Validation failed'));
        
        await expect(postgresAdapter.create(data)).rejects.toThrow('Validation failed');
      });
    });

    describe('update method', () => {
      it('should have correct signature: update(id: string, data: any, options?: WriteOptions): Promise<any>', async () => {
        // TDD RED: Test the method signature
        const result = await postgresAdapter.update('123', { name: 'Jane' });
        expect(typeof postgresAdapter.update).toBe('function');
      });

      it('should update an existing document', async () => {
        // TDD RED: Test updates document
        const id = '123';
        const data = { name: 'Jane Doe' };
        const updatedDocument = { id, name: 'Jane Doe', email: 'jane@example.com', updated_at: new Date() };
        
        mockClient.query.mockResolvedValue({
          rows: [updatedDocument],
          rowCount: 1,
          command: 'UPDATE'
        });
        
        const result = await postgresAdapter.update(id, data);
        
        expect(result).toEqual(updatedDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'UPDATE documents SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          ['Jane Doe', id]
        );
      });

      it('should handle upsert option', async () => {
        // TDD RED: Test handles upsert in update
        const id = '123';
        const data = { name: 'Jane Doe' };
        const options: WriteOptions = { upsert: true };
        const upsertedDocument = { id, name: 'Jane Doe', updated_at: new Date() };
        
        mockClient.query.mockResolvedValue({
          rows: [upsertedDocument],
          rowCount: 1,
          command: 'UPDATE'
        });
        
        const result = await postgresAdapter.update(id, data, options);
        
        expect(result).toEqual(upsertedDocument);
        expect(mockClient.query).toHaveBeenCalledWith(
          'INSERT INTO documents (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW() RETURNING *',
          [id, 'Jane Doe']
        );
      });

      it('should handle document not found', async () => {
        // TDD RED: Test document not found
        const id = '123';
        const data = { name: 'Jane Doe' };
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'UPDATE'
        });
        
        const result = await postgresAdapter.update(id, data);
        
        expect(result).toBeNull();
      });
    });

    describe('delete method', () => {
      it('should have correct signature: delete(id: string, options?: WriteOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        await postgresAdapter.delete('123');
        expect(typeof postgresAdapter.delete).toBe('function');
      });

      it('should delete a document', async () => {
        // TDD RED: Test deletes document
        const id = '123';
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 1,
          command: 'DELETE'
        });
        
        await postgresAdapter.delete(id);
        
        expect(mockClient.query).toHaveBeenCalledWith(
          'DELETE FROM documents WHERE id = $1',
          [id]
        );
      });

      it('should handle document not found', async () => {
        // TDD RED: Test document not found
        const id = '123';
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'DELETE'
        });
        
        await expect(postgresAdapter.delete(id)).resolves.not.toThrow();
        expect(mockClient.query).toHaveBeenCalledWith(
          'DELETE FROM documents WHERE id = $1',
          [id]
        );
      });
    });
  });

  describe('IDatabaseTransaction implementation', () => {
    it('should implement IDatabaseTransaction interface', () => {
      // TDD RED: Test implements IDatabaseTransaction
      expect(postgresAdapter).toHaveProperty('begin');
      expect(postgresAdapter).toHaveProperty('commit');
      expect(postgresAdapter).toHaveProperty('rollback');
      expect(typeof postgresAdapter.begin).toBe('function');
      expect(typeof postgresAdapter.commit).toBe('function');
      expect(typeof postgresAdapter.rollback).toBe('function');
    });

    describe('begin method', () => {
      it('should have correct signature: begin(): Promise<Transaction>', async () => {
        // TDD RED: Test the method signature
        const result = await postgresAdapter.begin();
        expect(typeof postgresAdapter.begin).toBe('function');
      });

      it('should begin a new transaction', async () => {
        // TDD RED: Test begins transaction
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'BEGIN'
        });
        
        const result = await postgresAdapter.begin();
        
        expect(result).toMatchObject({
          id: expect.any(String),
          status: 'active',
          startTime: expect.any(Date),
          metadata: expect.any(Object)
        });
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      });
    });

    describe('commit method', () => {
      it('should have correct signature: commit(transaction: Transaction): Promise<void>', async () => {
        // TDD RED: Test the method signature
        const transaction = await postgresAdapter.begin();
        await postgresAdapter.commit(transaction);
        expect(typeof postgresAdapter.commit).toBe('function');
      });

      it('should commit a transaction', async () => {
        // TDD RED: Test commits transaction
        const transaction = await postgresAdapter.begin();
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'COMMIT'
        });
        
        await postgresAdapter.commit(transaction);
        
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      });
    });

    describe('rollback method', () => {
      it('should have correct signature: rollback(transaction: Transaction): Promise<void>', async () => {
        // TDD RED: Test the method signature
        const transaction = await postgresAdapter.begin();
        await postgresAdapter.rollback(transaction);
        expect(typeof postgresAdapter.rollback).toBe('function');
      });

      it('should rollback a transaction', async () => {
        // TDD RED: Test rollbacks transaction
        const transaction = await postgresAdapter.begin();
        
        mockClient.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
          command: 'ROLLBACK'
        });
        
        await postgresAdapter.rollback(transaction);
        
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      });
    });
  });

  describe('Connection Management', () => {
    it('should connect to PostgreSQL on initialization', async () => {
      // TDD RED: Test connects on init
      const adapter = new PostgreSQLAdapter({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass'
      });
      
      expect(mockPool.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // TDD RED: Test connection errors
      mockPool.connect.mockRejectedValue(new Error('Connection failed'));
      
      const adapter = new PostgreSQLAdapter({
        host: 'invalid',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass'
      });
      
      await expect(adapter.connect()).rejects.toThrow('Connection failed');
    });

    it('should close connection', async () => {
      // TDD RED: Test closes connection
      await postgresAdapter.close();
      
      expect(mockClient.release).toHaveBeenCalled();
      expect(mockPool.end).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // TDD RED: Test error handling
      const id = '123';
      mockClient.query.mockRejectedValue(new Error('Database error'));
      
      await expect(postgresAdapter.findById(id)).rejects.toThrow('Database error');
    });

    it('should handle network errors', async () => {
      // TDD RED: Test network errors
      const query: Query = { name: 'John' };
      mockClient.query.mockRejectedValue(new Error('Network error'));
      
      await expect(postgresAdapter.findMany(query)).rejects.toThrow('Network error');
    });
  });
});
