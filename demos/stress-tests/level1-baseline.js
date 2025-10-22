import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },     // Stay at 10 users
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests must complete below 100ms
    http_req_failed: ['rate<0.1'],   // Error rate must be below 10%
    errors: ['rate<0.1'],            // Custom error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test 1: Health Check
  let healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 50ms': (r) => r.timings.duration < 50,
  });
  errorRate.add(healthResponse.status !== 200);

  // Test 2: Create User (PII + PHI)
  let createPayload = {
    firstName: `User${__VU}_${__ITER}`,
    lastName: 'Test',
    email: `user${__VU}_${__ITER}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    address: `${Math.floor(Math.random() * 1000)} Test St`,
    
    // PHI data
    diagnosis: 'Test Condition',
    medication: 'Test Medication',
    symptoms: ['Test Symptom 1', 'Test Symptom 2'],
    allergies: ['Test Allergy'],
    bloodType: 'O+',
  };

  let createResponse = http.post(`${BASE_URL}/api/users`, JSON.stringify(createPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(createResponse, {
    'create user status is 201': (r) => r.status === 201,
    'create user response time < 100ms': (r) => r.timings.duration < 100,
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

  // Test 3: Read User (if creation was successful)
  if (userId) {
    let readResponse = http.get(`${BASE_URL}/api/users/${userId}`);
    check(readResponse, {
      'read user status is 200': (r) => r.status === 200,
      'read user response time < 50ms': (r) => r.timings.duration < 50,
      'read user returns user data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.firstName && body.lastName;
        } catch (e) {
          return false;
        }
      },
    });
    errorRate.add(readResponse.status !== 200);

    // Test 4: Update User
    let updatePayload = {
      firstName: `UpdatedUser${__VU}_${__ITER}`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    };

    let updateResponse = http.put(`${BASE_URL}/api/users/${userId}`, JSON.stringify(updatePayload), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(updateResponse, {
      'update user status is 200': (r) => r.status === 200,
      'update user response time < 100ms': (r) => r.timings.duration < 100,
    });
    errorRate.add(updateResponse.status !== 200);

    // Test 5: GDPR Compliance - Data Access Request
    let gdprResponse = http.get(`${BASE_URL}/api/users/${userId}/gdpr/access`);
    check(gdprResponse, {
      'GDPR access status is 200': (r) => r.status === 200,
      'GDPR access response time < 100ms': (r) => r.timings.duration < 100,
    });
    errorRate.add(gdprResponse.status !== 200);

    // Test 6: HIPAA Compliance - PHI Access Request
    let hipaaResponse = http.get(`${BASE_URL}/api/users/${userId}/hipaa/access`);
    check(hipaaResponse, {
      'HIPAA access status is 200': (r) => r.status === 200,
      'HIPAA access response time < 100ms': (r) => r.timings.duration < 100,
    });
    errorRate.add(hipaaResponse.status !== 200);
  }

  // Test 7: List Users (with pagination)
  let listResponse = http.get(`${BASE_URL}/api/users?limit=10&offset=0`);
  check(listResponse, {
    'list users status is 200': (r) => r.status === 200,
    'list users response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(listResponse.status !== 200);

  // Test 8: Cache Performance - Multiple reads of same data
  if (userId) {
    for (let i = 0; i < 3; i++) {
      let cacheResponse = http.get(`${BASE_URL}/api/users/${userId}`);
      check(cacheResponse, {
        'cache read status is 200': (r) => r.status === 200,
        'cache read response time < 10ms': (r) => r.timings.duration < 10,
      });
      errorRate.add(cacheResponse.status !== 200);
    }
  }

  // Random sleep between 0.1 and 0.5 seconds
  sleep(Math.random() * 0.4 + 0.1);
}

export function handleSummary(data) {
  return {
    'stress-test-level1-results.json': JSON.stringify(data, null, 2),
  };
}
