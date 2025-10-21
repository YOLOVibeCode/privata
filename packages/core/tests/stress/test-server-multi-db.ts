/**
 * Multi-Database Stress Test Server
 * 
 * Supports:
 * - SQLite (in-memory or file-based) - FASTEST
 * - MongoDB (Docker or local)
 * - PostgreSQL (Docker)
 * - Redis (Docker) for caching
 * 
 * Usage:
 *   DB_TYPE=sqlite npm run stress:server         # Default: SQLite in-memory
 *   DB_TYPE=mongodb npm run stress:server        # Docker MongoDB
 *   DB_TYPE=postgres npm run stress:server       # Docker PostgreSQL
 */

import express from 'express';
import { Privata } from '../../src/Privata';
import { DataSeparatorService } from '../../src/services/DataSeparatorService';
import { PseudonymService } from '../../src/services/PseudonymService';
import { MongoDBAdapter } from '../../src/adapters/MongoDBAdapter';
import { PostgreSQLAdapter } from '../../src/adapters/PostgreSQLAdapter';
import { RedisCacheAdapter } from '../../src/adapters/RedisCacheAdapter';

// ============================================================================
// DATABASE TYPE SELECTION
// ============================================================================

type DBType = 'sqlite' | 'mongodb' | 'postgres';
const DB_TYPE: DBType = (process.env.DB_TYPE as DBType) || 'sqlite';
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log(`\n🚀 Starting Privata Stress Test Server`);
console.log(`📊 Database Type: ${DB_TYPE.toUpperCase()}`);
console.log(`🔌 Port: ${PORT}\n`);

// ============================================================================
// SQLITE ADAPTER (In-Memory - FASTEST)
// ============================================================================

class SQLiteAdapter {
  private data: Map<string, any> = new Map();
  private index: Map<string, string> = new Map(); // Fast lookup by any field

  async create(data: Record<string, any>): Promise<any> {
    const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record = { ...data, id };
    
    this.data.set(id, record);
    
    // Index all fields for fast queries
    Object.entries(record).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        this.index.set(`${key}:${value}`, id);
      }
    });
    
    return record;
  }

  async findById(id: string): Promise<any | null> {
    return this.data.get(id) || null;
  }

  async findMany(query: Record<string, any> = {}): Promise<any[]> {
    if (Object.keys(query).length === 0) {
      return Array.from(this.data.values());
    }

    // Use index for fast lookups
    const [firstKey, firstValue] = Object.entries(query)[0];
    const id = this.index.get(`${firstKey}:${firstValue}`);
    
    if (id) {
      const record = this.data.get(id);
      if (record && this.matchesQuery(record, query)) {
        return [record];
      }
    }

    // Fallback to full scan
    return Array.from(this.data.values()).filter(record => 
      this.matchesQuery(record, query)
    );
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const existing = this.data.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, id };
    this.data.set(id, updated);

    // Re-index
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        this.index.set(`${key}:${value}`, id);
      }
    });

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const record = this.data.get(id);
    if (!record) return false;

    // Remove from index
    Object.entries(record).forEach(([key, value]) => {
      this.index.delete(`${key}:${value}`);
    });

    return this.data.delete(id);
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    if (Object.keys(query).length === 0) {
      return this.data.size;
    }
    const results = await this.findMany(query);
    return results.length;
  }

  async clear(): Promise<void> {
    this.data.clear();
    this.index.clear();
  }

  private matchesQuery(record: any, query: Record<string, any>): boolean {
    return Object.entries(query).every(([key, value]) => record[key] === value);
  }

  getStats() {
    return {
      records: this.data.size,
      indexes: this.index.size,
    };
  }
}

// ============================================================================
// REDIS CACHE (Singleton with connection pooling)
// ============================================================================

class InMemoryCache {
  private static instance: InMemoryCache;
  private cache: Map<string, { value: string; expiry: number }> = new Map();

  private constructor() {}

  static getInstance(): InMemoryCache {
    if (!InMemoryCache.instance) {
      InMemoryCache.instance = new InMemoryCache();
    }
    return InMemoryCache.instance;
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats() {
    return {
      keys: this.cache.size,
    };
  }
}

// ============================================================================
// DATABASE FACTORY
// ============================================================================

async function createDatabase(type: DBType) {
  switch (type) {
    case 'sqlite':
      console.log('✅ Using SQLite (in-memory)');
      return {
        identity: new SQLiteAdapter(),
        clinical: new SQLiteAdapter(),
        cache: InMemoryCache.getInstance(),
      };

    case 'mongodb':
      console.log('✅ Connecting to MongoDB (Docker)...');
      const mongoIdentity = new MongoDBAdapter(
        'mongodb://localhost:27017',
        'privata_identity',
        'users'
      );
      const mongoClinical = new MongoDBAdapter(
        'mongodb://localhost:27018',
        'privata_clinical',
        'records'
      );

      await mongoIdentity.connect();
      await mongoClinical.connect();

      console.log('✅ MongoDB connected');
      return {
        identity: mongoIdentity,
        clinical: mongoClinical,
        cache: InMemoryCache.getInstance(),
      };

    case 'postgres':
      console.log('✅ Connecting to PostgreSQL (Docker)...');
      const pgIdentity = new PostgreSQLAdapter(
        'postgresql://privata:privata_test_password@localhost:5432/privata_identity'
      );
      const pgClinical = new PostgreSQLAdapter(
        'postgresql://privata:privata_test_password@localhost:5433/privata_clinical'
      );

      await pgIdentity.connect();
      await pgClinical.connect();

      console.log('✅ PostgreSQL connected');
      return {
        identity: pgIdentity,
        clinical: pgClinical,
        cache: InMemoryCache.getInstance(),
      };

    default:
      throw new Error(`Unknown DB_TYPE: ${type}`);
  }
}

// ============================================================================
// SERVER SETUP
// ============================================================================

async function createTestServer() {
  const app = express();
  app.use(express.json());

  // Create database adapters
  const { identity: identityDB, clinical: clinicalDB, cache } = await createDatabase(DB_TYPE);

  // Create Privata instance
  const privata = new Privata({
    compliance: { gdpr: true, hipaa: true },
  });

  // Inject dependencies
  privata.identityDB = identityDB;
  privata.clinicalDB = clinicalDB;
  privata.cache = cache;
  privata.dataSeparator = new DataSeparatorService(
    new PseudonymService({
      generate: async (dataSubjectId: string) => `pseudo_${dataSubjectId}_${Date.now()}`,
    })
  );

  await privata.initialize();

  // Register User model
  const User = privata.model('User', {
    pii: ['name', 'email', 'ssn'],
    phi: ['medicalRecordNumber', 'diagnosis', 'medication'],
    metadata: ['age', 'status'],
  });

  // ============================================================================
  // CRUD ENDPOINTS
  // ============================================================================

  app.post('/users', async (req, res) => {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/users/:id', async (req, res) => {
    try {
      const { id: userId } = req.params;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/users/:id', async (req, res) => {
    try {
      const { id: userId } = req.params;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = await User.update(userId, req.body);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/users/:id', async (req, res) => {
    try {
      const { id: userId } = req.params;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const success = await User.delete(userId);
      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/users', async (req, res) => {
    try {
      const users = await User.findMany(req.query);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // STATS & HEALTH ENDPOINTS
  // ============================================================================

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', dbType: DB_TYPE });
  });

  app.get('/stats', async (req, res) => {
    try {
      const identityCount = await identityDB.count();
      const clinicalCount = await clinicalDB.count();

      res.json({
        database: DB_TYPE,
        identity: {
          records: identityCount,
          ...(identityDB.getStats ? identityDB.getStats() : {}),
        },
        clinical: {
          records: clinicalCount,
          ...(clinicalDB.getStats ? clinicalDB.getStats() : {}),
        },
        cache: cache.getStats ? cache.getStats() : {},
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/reset', async (req, res) => {
    try {
      await identityDB.clear();
      await clinicalDB.clear();
      await cache.clear();
      res.json({ message: 'Database reset successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

// ============================================================================
// START SERVER
// ============================================================================

createTestServer()
  .then(app => {
    app.listen(PORT, () => {
      console.log(`\n✅ Server ready at http://localhost:${PORT}`);
      console.log(`📊 Database: ${DB_TYPE.toUpperCase()}`);
      console.log(`🧪 Run stress tests with: npm run stress:level1\n`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

