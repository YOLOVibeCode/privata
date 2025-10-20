/**
 * Simple Express server for stress testing
 * Provides REST API for CRUD operations
 */

import express, { Request, Response } from 'express';
import { Privata, PrivataConfig } from '../../src/Privata';
import { DataSeparatorService } from '../../src/services/DataSeparatorService';
import { PseudonymService } from '../../src/services/PseudonymService';

// Mock adapters for testing
class InMemoryDB {
  private data: Map<string, any> = new Map();

  async findById(id: string): Promise<any | null> {
    return this.data.get(id) || null;
  }

  async findMany(query: any = {}): Promise<any[]> {
    const all = Array.from(this.data.values());
    
    if (Object.keys(query).length === 0) {
      return all;
    }

    return all.filter(item => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
  }

  async exists(id: string): Promise<boolean> {
    return this.data.has(id);
  }

  async create(data: any): Promise<any> {
    const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doc = { ...data, id };
    this.data.set(id, doc);
    return doc;
  }

  async update(id: string, data: any): Promise<any> {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error('Not found');
    }
    const updated = { ...existing, ...data };
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
  }

  clear() {
    this.data.clear();
  }

  size() {
    return this.data.size;
  }
}

class InMemoryCache {
  private cache: Map<string, { value: string; expiry: number }> = new Map();
  public hits: number = 0;
  public misses: number = 0;

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

  // Create Privata instance with in-memory adapters
  const identityDB = new InMemoryDB();
  const clinicalDB = new InMemoryDB();
  const cache = new InMemoryCache();

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

  // Inject dependencies
  (privata as any).identityDB = identityDB;
  (privata as any).clinicalDB = clinicalDB;
  (privata as any).cache = cache;
  (privata as any).dataSeparator = new DataSeparatorService(
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

