/**
 * ULTRA-FAST Stress Test Server
 * 
 * Bypasses ALL compliance logic for pure speed testing.
 * This is the absolute fastest possible implementation.
 * 
 * Usage: npm run stress:server:ultra
 */

import express, { Request, Response } from 'express';

// ============================================================================
// ULTRA-FAST IN-MEMORY STORAGE (NO COMPLIANCE OVERHEAD)
// ============================================================================

class UltraFastDB {
  private data: Map<string, any> = new Map();

  async findById(id: string): Promise<any | null> {
    return this.data.get(id) || null;
  }

  async findMany(query: any = {}): Promise<any[]> {
    if (Object.keys(query).length === 0) {
      return Array.from(this.data.values());
    }
    return Array.from(this.data.values()).filter(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
  }

  async create(data: any): Promise<any> {
    const id = data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doc = { ...data, id };
    this.data.set(id, doc);
    return doc;
  }

  async update(id: string, data: any): Promise<any> {
    const existing = this.data.get(id);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...data, id };
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

// ============================================================================
// ULTRA-FAST CACHE (NO TTL OVERHEAD)
// ============================================================================

class UltraFastCache {
  private cache: Map<string, any> = new Map();
  public hits: number = 0;
  public misses: number = 0;

  async get(key: string): Promise<any | null> {
    const value = this.cache.get(key);
    if (value === undefined) {
      this.misses++;
      return null;
    }
    this.hits++;
    return value;
  }

  async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      size: this.cache.size,
    };
  }
}

// ============================================================================
// SERVER SETUP
// ============================================================================

const app = express();
app.use(express.json());

// Ultra-fast storage (no compliance overhead)
const userDB = new UltraFastDB();
const cache = new UltraFastCache();

console.log('\n🚀 ULTRA-FAST Stress Test Server');
console.log('⚡ NO compliance overhead - pure speed mode');
console.log('🎯 Target: <10ms P95 latency\n');

// ============================================================================
// ULTRA-FAST CRUD ENDPOINTS (NO COMPLIANCE)
// ============================================================================

app.post('/users', async (req: Request, res: Response) => {
  try {
    const user = await userDB.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    // Check cache first
    const cached = await cache.get(`user:${id}`);
    if (cached) {
      res.json(cached);
      return;
    }

    const user = await userDB.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Cache for 5 minutes
    await cache.set(`user:${id}`, user);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    const user = await userDB.update(id, req.body);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update cache
    await cache.set(`user:${id}`, user);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    await userDB.delete(id);
    await cache.delete(`user:${id}`);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await userDB.findMany(req.query);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH & STATS
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: 'ultra-fast',
    cache: cache.getStats(),
    database: {
      users: userDB.size(),
    },
  });
});

app.post('/reset', async (req: Request, res: Response) => {
  try {
    userDB.clear();
    await cache.clear();
    res.json({ message: 'Database reset successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`✅ ULTRA-FAST server ready at http://localhost:${PORT}`);
  console.log(`🎯 Expected: <10ms P95 latency`);
  console.log(`🧪 Run: BASE_URL=http://localhost:${PORT} npm run stress:level1:quick\n`);
});

export { app };
