/**
 * k6 Load Test Script - Stress Test Level 1 (QUICK VERSION - 2 minutes)
 * 
 * Goal: Quick validation of optimizations
 * Duration: 2 minutes
 * 
 * Success Criteria:
 * - P95 latency < 50ms
 * - P99 latency < 100ms
 * - Error rate < 0.1%
 * - Cache hit rate > 85%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const cacheHitRate = new Rate('cache_hit_rate');
const createLatency = new Trend('create_latency');
const readLatency = new Trend('read_latency');
const updateLatency = new Trend('update_latency');
const errorCount = new Counter('errors');

// Global array to store created user IDs (shared across VUs)
const createdUserIds = [];

// Test configuration (QUICK VERSION)
export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Quick warm up
    { duration: '30s', target: 100 },   // Ramp to baseline
    { duration: '30s', target: 100 },   // Hold
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<50', 'p(99)<100'],
    'http_req_failed': ['rate<0.001'],
    'create_latency': ['p(95)<100', 'p(99)<200'],
    'read_latency': ['p(95)<50', 'p(99)<100'],
    'update_latency': ['p(95)<75', 'p(99)<150'],
    'cache_hit_rate': ['rate>0.85'],
    'errors': ['count<10'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Test data generator
function generateUser() {
  const id = Math.floor(Math.random() * 1000000);
  return {
    firstName: `User${id}`,
    lastName: `Test${id}`,
    email: `user${id}@test.com`,
    diagnosis: ['Hypertension', 'Diabetes', 'Asthma'][Math.floor(Math.random() * 3)],
    medications: [['Lisinopril'], ['Metformin'], ['Albuterol']][Math.floor(Math.random() * 3)],
    accountType: 'standard',
  };
}

// Scenario weights
const SCENARIOS = {
  READ: 0.40,
  FIND_MANY: 0.30,
  CREATE: 0.20,
  UPDATE: 0.10,
};

// Main test function
export default function (data) {
  // Use warmup IDs for the first reads
  if (data && data.warmupIds && createdUserIds.length === 0) {
    createdUserIds.push(...data.warmupIds);
  }
  
  const scenario = Math.random();
  
  if (scenario < SCENARIOS.READ) {
    testRead();
  } else if (scenario < SCENARIOS.READ + SCENARIOS.FIND_MANY) {
    testFindMany();
  } else if (scenario < SCENARIOS.READ + SCENARIOS.FIND_MANY + SCENARIOS.CREATE) {
    testCreate();
  } else {
    testUpdate();
  }
  
  sleep(0.1);
}

function testCreate() {
  const userData = generateUser();
  
  const startTime = new Date().getTime();
  const res = http.post(`${BASE_URL}/api/users`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
  });
  const duration = new Date().getTime() - startTime;
  
  createLatency.add(duration);
  
  const success = check(res, {
    'create status is 201': (r) => r.status === 201,
    'create response has id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (!success) {
    errorCount.add(1);
  }
  
  // Store ID for later use
  if (res.status === 201) {
    try {
      const body = JSON.parse(res.body);
      if (body.id) {
        createdUserIds.push(body.id);
      }
    } catch {}
  }
}

function testRead() {
  if (createdUserIds.length === 0) {
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * createdUserIds.length);
  const userId = createdUserIds[randomIndex];
  
  const startTime = new Date().getTime();
  const res = http.get(`${BASE_URL}/api/users/${userId}`);
  const duration = new Date().getTime() - startTime;
  
  readLatency.add(duration);
  
  const cacheHit = res.headers['X-Cache-Hit'] === 'true';
  cacheHitRate.add(cacheHit ? 1 : 0);
  
  const success = check(res, {
    'read status is 200': (r) => r.status === 200,
    'read response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id === userId;
      } catch {
        return false;
      }
    },
  });
  
  if (!success) {
    errorCount.add(1);
  }
}

function testFindMany() {
  const startTime = new Date().getTime();
  const res = http.get(`${BASE_URL}/api/users`);
  const duration = new Date().getTime() - startTime;
  
  readLatency.add(duration);
  
  const success = check(res, {
    'find status is 200': (r) => r.status === 200,
    'find response is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });
  
  if (!success) {
    errorCount.add(1);
  }
}

function testUpdate() {
  if (createdUserIds.length === 0) {
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * createdUserIds.length);
  const userId = createdUserIds[randomIndex];
  
  const updateData = {
    accountType: 'premium',
  };
  
  const startTime = new Date().getTime();
  const res = http.put(`${BASE_URL}/api/users/${userId}`, JSON.stringify(updateData), {
    headers: { 'Content-Type': 'application/json' },
  });
  const duration = new Date().getTime() - startTime;
  
  updateLatency.add(duration);
  
  const success = check(res, {
    'update status is 200': (r) => r.status === 200,
  });
  
  if (!success) {
    errorCount.add(1);
  }
}

// Setup
export function setup() {
  console.log('🚀 Starting QUICK Stress Test (2 min validation)');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log('');
  
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error('Server health check failed');
  }
  
  console.log('✅ Server is healthy');
  http.post(`${BASE_URL}/reset`);
  
  // WARMUP: Create 100 users so READ operations have data from the start
  console.log('🔥 Warming up: creating 100 initial users...');
  const warmupIds = [];
  for (let i = 0; i < 100; i++) {
    const userData = {
      firstName: `WarmupUser${i}`,
      lastName: `Test${i}`,
      email: `warmup${i}@test.com`,
      diagnosis: 'Hypertension',
      medications: ['Lisinopril'],
      accountType: 'standard',
    };
    
    const res = http.post(`${BASE_URL}/api/users`, JSON.stringify(userData), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (res.status === 201) {
      try {
        const body = JSON.parse(res.body);
        if (body.id) {
          warmupIds.push(body.id);
        }
      } catch {}
    }
  }
  
  console.log(`✅ Warmup complete: ${warmupIds.length} users created`);
  console.log('');
  
  return { 
    startTime: new Date().getTime(),
    warmupIds: warmupIds,
  };
}

// Teardown
export function teardown(data) {
  const endTime = new Date().getTime();
  const duration = (endTime - data.startTime) / 1000;
  
  console.log('');
  console.log('📊 Quick Test Complete!');
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
  
  const statsRes = http.get(`${BASE_URL}/stats`);
  if (statsRes.status === 200) {
    try {
      const stats = JSON.parse(statsRes.body);
      console.log('');
      console.log('📈 Final Statistics:');
      console.log(`   Cache Hit Rate: ${(stats.cache.hitRate * 100).toFixed(2)}%`);
      console.log(`   Cache Hits: ${stats.cache.hits}`);
      console.log(`   Cache Misses: ${stats.cache.misses}`);
      console.log(`   Identity DB Size: ${stats.database.identity}`);
      console.log(`   Clinical DB Size: ${stats.database.clinical}`);
    } catch (e) {
      console.log('Failed to parse stats');
    }
  }
}

