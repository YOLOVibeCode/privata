/**
 * Simple Express server for stress testing
 * Provides REST API for CRUD operations
 */

import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Privata, PrivataConfig } from '../../src/Privata';
import { DataSeparatorService } from '../../src/services/DataSeparatorService';
import { PseudonymService } from '../../src/services/PseudonymService';

// SQLite database adapter for realistic performance testing
class SQLiteDB {
  private db: Database.Database;
  private tableName: string;

  constructor(tableName: string) {
    // Use in-memory database for speed
    this.db = new Database(':memory:');
    this.tableName = tableName;
    this.initTable();
  }

  private initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_id ON ${this.tableName}(id);
    `);
  }

  async findById(id: string): Promise<any | null> {
    const stmt = this.db.prepare(`SELECT data FROM ${this.tableName} WHERE id = ?`);
    const row = stmt.get(id) as any;
    return row ? JSON.parse(row.data) : null;
  }

  async findMany(query: any = {}): Promise<any[]> {
    const stmt = this.db.prepare(`SELECT data FROM ${this.tableName}`);
    const rows = stmt.all() as any[];
    const results = rows.map(row => JSON.parse(row.data));
    
    if (Object.keys(query).length === 0) {
      return results;
    }

    return results.filter(item => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
  }

  async exists(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`);
    return stmt.get(id) !== undefined;
  }

  async create(data: any): Promise<any> {
    const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doc = { ...data, id };
    
    const stmt = this.db.prepare(`
      INSERT INTO ${this.tableName} (id, data)
      VALUES (?, ?)
    `);
    
    stmt.run(id, JSON.stringify(doc));
    return doc;
  }

  async update(id: string, data: any): Promise<any> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Not found');
    }
    
    const updated = { ...existing, ...data, id };
    
    const stmt = this.db.prepare(`
      UPDATE ${this.tableName}
      SET data = ?
      WHERE id = ?
    `);
    
    stmt.run(JSON.stringify(updated), id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    stmt.run(id);
  }

  clear() {
    this.db.exec(`DELETE FROM ${this.tableName}`);
  }

  size() {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    const row = stmt.get() as any;
    return row.count;
  }
}

class InMemoryCache {
  private static instance: InMemoryCache; // Singleton instance
  private cache: Map<string, { value: string; expiry: number }> = new Map();
  public hits: number = 0;
  public misses: number = 0;

  // Singleton pattern to ensure shared cache across all requests
  static getInstance(): InMemoryCache {
    if (!InMemoryCache.instance) {
      InMemoryCache.instance = new InMemoryCache();
    }
    return InMemoryCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000),
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidate(pattern: string): Promise<void> {
    // Simple pattern matching
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async setMany(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      size: this.cache.size,
    };
  }
}

// Create server
export function createTestServer(port: number = 3000) {
  const app = express();
  app.use(express.json());

  // Create Privata instance with in-memory adapters (using singleton cache)
  const identityDB = new SQLiteDB('identity');
  const clinicalDB = new SQLiteDB('clinical');
  const cache = InMemoryCache.getInstance(); // Use singleton for shared cache

  const mockPseudonymGen = {
    generate: () => `pseu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    validate: () => true,
  };

  const config: PrivataConfig = {
    compliance: {
      gdpr: { enabled: true, dataSubjectRights: true, auditLogging: true },
      hipaa: { enabled: true, phiProtection: true, breachNotification: true },
    },
  };

  const privata = new Privata(config);

  // Inject dependencies (now using public properties)
  privata.identityDB = identityDB;
  privata.clinicalDB = clinicalDB;
  privata.cache = cache;
  privata.dataSeparator = new DataSeparatorService(
    new PseudonymService(mockPseudonymGen)
  );

  // Register User model
  const User = privata.model('User', {
    identity: {
      firstName: { type: String, pii: true, required: true },
      lastName: { type: String, pii: true, required: true },
      email: { type: String, pii: true, required: true },
    },
    clinical: {
      diagnosis: { type: String, phi: true },
      medications: { type: [String], phi: true },
    },
    metadata: {
      accountType: { type: String },
    },
  });

  // Routes
  app.post('/api/users', async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Add cache hit header for monitoring
      const cacheKey = `User:${userId}`;
      const cached = await cache.get(cacheKey);
      res.setHeader('X-Cache-Hit', cached ? 'true' : 'false');
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users', async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find(req.query);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }
      
      const user = await User.update(userId, req.body);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'Document not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }
      
      const gdprCompliant = req.query.gdprCompliant === 'true';
      await User.delete(userId, { gdprCompliant });
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Document not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      cache: cache.getStats(),
      database: {
        identity: identityDB.size(),
        clinical: clinicalDB.size(),
      },
    });
  });

  // Stats endpoint
  app.get('/stats', (req: Request, res: Response) => {
    res.json({
      cache: cache.getStats(),
      database: {
        identity: identityDB.size(),
        clinical: clinicalDB.size(),
      },
    });
  });

  // Reset endpoint (for testing)
  app.post('/reset', (req: Request, res: Response) => {
    identityDB.clear();
    clinicalDB.clear();
    cache.clear();
    res.json({ message: 'Reset complete' });
  });

  return {
    app,
    cache,
    identityDB,
    clinicalDB,
    start: () => {
      return new Promise<any>((resolve) => {
        const server = app.listen(port, () => {
          console.log(`Test server running on http://localhost:${port}`);
          resolve(server);
        });
      });
    },
  };
}

// CLI entry point
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3000', 10);
  createTestServer(port).start();
}

