/**
 * k6 Load Test Script - Stress Test Level 1
 * 
 * Goal: 100 req/sec baseline performance test
 * Duration: 10 minutes
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
const deleteLatency = new Trend('delete_latency');
const errorCount = new Counter('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Warm up: ramp to 50 VUs
    { duration: '1m', target: 100 },   // Ramp to baseline: 100 VUs
    { duration: '5m', target: 100 },   // Stay at baseline
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    // HTTP thresholds
    'http_req_duration': ['p(95)<50', 'p(99)<100'],  // 95% under 50ms, 99% under 100ms
    'http_req_failed': ['rate<0.001'],                // < 0.1% errors
    
    // Operation-specific thresholds
    'create_latency': ['p(95)<100', 'p(99)<200'],
    'read_latency': ['p(95)<50', 'p(99)<100'],
    'update_latency': ['p(95)<75', 'p(99)<150'],
    'delete_latency': ['p(95)<75', 'p(99)<150'],
    
    // Cache performance
    'cache_hit_rate': ['rate>0.85'],  // > 85% cache hit rate
    
    // Error tracking
    'errors': ['count<10'],  // < 10 total errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

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

// Scenario weights (matching specification)
const SCENARIOS = {
  READ: 0.40,     // 40% - Most common operation
  FIND_MANY: 0.30, // 30% - Search/list operations
  CREATE: 0.20,    // 20% - New data
  UPDATE: 0.10,    // 10% - Updates
};

// Main test function
export default function () {
  const scenario = Math.random();
  
  if (scenario < SCENARIOS.READ) {
    // READ scenario (40%) - Tests cache effectiveness
    testRead();
  } else if (scenario < SCENARIOS.READ + SCENARIOS.FIND_MANY) {
    // FIND_MANY scenario (30%)
    testFindMany();
  } else if (scenario < SCENARIOS.READ + SCENARIOS.FIND_MANY + SCENARIOS.CREATE) {
    // CREATE scenario (20%)
    testCreate();
  } else {
    // UPDATE scenario (10%)
    testUpdate();
  }
  
  // Small sleep to simulate real user behavior
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
    'create response has firstName': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.firstName === userData.firstName;
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
      __ENV[`user_${body.id}`] = body.id;
    } catch {}
  }
}

function testRead() {
  // Try to read a recently created user
  const keys = Object.keys(__ENV).filter(k => k.startsWith('user_'));
  
  if (keys.length === 0) {
    // No users created yet, skip
    return;
  }
  
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const userId = __ENV[randomKey];
  
  const startTime = new Date().getTime();
  const res = http.get(`${BASE_URL}/api/users/${userId}`);
  const duration = new Date().getTime() - startTime;
  
  readLatency.add(duration);
  
  // Track cache hits
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
  // Try to update a recently created user
  const keys = Object.keys(__ENV).filter(k => k.startsWith('user_'));
  
  if (keys.length === 0) {
    return;
  }
  
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const userId = __ENV[randomKey];
  
  const updateData = {
    accountType: 'premium',
    diagnosis: 'Updated Diagnosis',
  };
  
  const startTime = new Date().getTime();
  const res = http.put(`${BASE_URL}/api/users/${userId}`, JSON.stringify(updateData), {
    headers: { 'Content-Type': 'application/json' },
  });
  const duration = new Date().getTime() - startTime;
  
  updateLatency.add(duration);
  
  const success = check(res, {
    'update status is 200': (r) => r.status === 200,
    'update response has changes': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accountType === 'premium';
      } catch {
        return false;
      }
    },
  });
  
  if (!success) {
    errorCount.add(1);
  }
}

// Setup function - runs once at the start
export function setup() {
  console.log('🚀 Starting Stress Test Level 1');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log('🎯 Goal: 100 req/sec for 5 minutes');
  console.log('');
  
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error('Server health check failed');
  }
  
  console.log('✅ Server is healthy');
  console.log('');
  
  // Reset the server
  http.post(`${BASE_URL}/reset`);
  
  return { startTime: new Date().getTime() };
}

// Teardown function - runs once at the end
export function teardown(data) {
  const endTime = new Date().getTime();
  const duration = (endTime - data.startTime) / 1000;
  
  console.log('');
  console.log('📊 Test Complete!');
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
  
  // Get final stats
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

