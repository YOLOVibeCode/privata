import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const complianceLatency = new Trend('compliance_latency');

export let options = {
  stages: [
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 50 },     // Stay at 50 users
    { duration: '1m', target: 100 },    // Ramp up to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 150 },    // Ramp up to 150 users
    { duration: '3m', target: 150 },   // Stay at 150 users
    { duration: '1m', target: 200 },    // Ramp up to 200 users
    { duration: '5m', target: 200 },    // Stay at 200 users (peak load)
    { duration: '1m', target: 150 },    // Ramp down to 150 users
    { duration: '2m', target: 150 },    // Stay at 150 users
    { duration: '1m', target: 100 },    // Ramp down to 100 users
    { duration: '2m', target: 100 },    // Stay at 100 users
    { duration: '1m', target: 50 },      // Ramp down to 50 users
    { duration: '2m', target: 50 },      // Stay at 50 users
    { duration: '1m', target: 0 },      // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
    errors: ['rate<0.05'],           // Custom error rate must be below 5%
    compliance_latency: ['p(95)<150'], // 95% of compliance requests below 150ms
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test 1: Health Check
  let healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(healthResponse.status !== 200);

  // Test 2: Bulk User Creation (PII + PHI)
  let createPayload = {
    firstName: `BulkUser${__VU}_${__ITER}`,
    lastName: 'ScaleTest',
    email: `bulkuser${__VU}_${__ITER}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    address: `${Math.floor(Math.random() * 1000)} Scale St`,
    
    // PHI data
    diagnosis: 'Scale Test Condition',
    medication: 'Scale Test Medication',
    symptoms: ['Scale Symptom 1', 'Scale Symptom 2'],
    allergies: ['Scale Allergy'],
    bloodType: 'O+',
  };

  let createResponse = http.post(`${BASE_URL}/api/users`, JSON.stringify(createPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(createResponse, {
    'create user status is 201': (r) => r.status === 201,
    'create user response time < 200ms': (r) => r.timings.duration < 200,
    'create user returns user ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.id.length > 0;
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(createResponse.status !== 201);

  let userId = null;
  if (createResponse.status === 201) {
    try {
      const body = JSON.parse(createResponse.body);
      userId = body.id;
    } catch (e) {
      console.error('Failed to parse create response:', e);
    }
  }

  // Test 3: High-Frequency Reads
  if (userId) {
    for (let i = 0; i < 5; i++) {
      let readResponse = http.get(`${BASE_URL}/api/users/${userId}`);
      check(readResponse, {
        'read user status is 200': (r) => r.status === 200,
        'read user response time < 100ms': (r) => r.timings.duration < 100,
      });
      errorRate.add(readResponse.status !== 200);
    }
  }

  // Test 4: GDPR Compliance - Data Access Request
  if (userId) {
    let gdprStart = Date.now();
    let gdprResponse = http.get(`${BASE_URL}/api/users/${userId}/gdpr/access`);
    let gdprDuration = Date.now() - gdprStart;
    
    check(gdprResponse, {
      'GDPR access status is 200': (r) => r.status === 200,
      'GDPR access response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(gdprResponse.status !== 200);
    complianceLatency.add(gdprDuration);
  }

  // Test 5: HIPAA Compliance - PHI Access Request
  if (userId) {
    let hipaaStart = Date.now();
    let hipaaResponse = http.get(`${BASE_URL}/api/users/${userId}/hipaa/access`);
    let hipaaDuration = Date.now() - hipaaStart;
    
    check(hipaaResponse, {
      'HIPAA access status is 200': (r) => r.status === 200,
      'HIPAA access response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(hipaaResponse.status !== 200);
    complianceLatency.add(hipaaDuration);
  }

  // Test 6: GDPR Data Portability
  if (userId) {
    let portabilityResponse = http.get(`${BASE_URL}/api/users/${userId}/gdpr/portability`);
    check(portabilityResponse, {
      'GDPR portability status is 200': (r) => r.status === 200,
      'GDPR portability response time < 300ms': (r) => r.timings.duration < 300,
    });
    errorRate.add(portabilityResponse.status !== 200);
  }

  // Test 7: HIPAA Breach Reporting
  if (userId) {
    let breachPayload = {
      description: 'Scale test breach simulation',
      affectedRecords: 1,
      severity: 'low',
    };

    let breachResponse = http.post(`${BASE_URL}/api/users/${userId}/hipaa/breach`, JSON.stringify(breachPayload), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(breachResponse, {
      'HIPAA breach report status is 200': (r) => r.status === 200,
      'HIPAA breach report response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(breachResponse.status !== 200);
  }

  // Test 8: Complex Queries with Pagination
  let listResponse = http.get(`${BASE_URL}/api/users?limit=20&offset=${Math.floor(Math.random() * 100)}`);
  check(listResponse, {
    'list users status is 200': (r) => r.status === 200,
    'list users response time < 200ms': (r) => r.timings.duration < 200,
  });
  errorRate.add(listResponse.status !== 200);

  // Test 9: Cache Performance - Multiple reads of same data
  if (userId) {
    for (let i = 0; i < 10; i++) {
      let cacheResponse = http.get(`${BASE_URL}/api/users/${userId}`);
      check(cacheResponse, {
        'cache read status is 200': (r) => r.status === 200,
        'cache read response time < 20ms': (r) => r.timings.duration < 20,
      });
      errorRate.add(cacheResponse.status !== 200);
    }
  }

  // Test 10: Concurrent Updates
  if (userId) {
    let updatePayload = {
      firstName: `UpdatedScaleUser${__VU}_${__ITER}`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    };

    let updateResponse = http.put(`${BASE_URL}/api/users/${userId}`, JSON.stringify(updatePayload), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(updateResponse, {
      'update user status is 200': (r) => r.status === 200,
      'update user response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(updateResponse.status !== 200);
  }

  // Test 11: Batch Operations
  let batchPayload = {
    operations: [
      { type: 'create', data: { firstName: 'Batch1', lastName: 'Test', email: 'batch1@test.com' } },
      { type: 'create', data: { firstName: 'Batch2', lastName: 'Test', email: 'batch2@test.com' } },
      { type: 'create', data: { firstName: 'Batch3', lastName: 'Test', email: 'batch3@test.com' } },
    ]
  };

  let batchResponse = http.post(`${BASE_URL}/api/users/batch`, JSON.stringify(batchPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(batchResponse, {
    'batch operations status is 200': (r) => r.status === 200,
    'batch operations response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(batchResponse.status !== 200);

  // Random sleep between 0.1 and 0.3 seconds
  sleep(Math.random() * 0.2 + 0.1);
}

export function handleSummary(data) {
  return {
    'stress-test-level2-results.json': JSON.stringify(data, null, 2),
  };
}
