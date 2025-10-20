// Super simple test to validate READ after CREATE
import http from 'k6/http';

const BASE_URL = 'http://localhost:3001';

export default function () {
  // Reset
  http.post(`${BASE_URL}/reset`);
  
  // CREATE a user
  const createRes = http.post(`${BASE_URL}/api/users`, JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    diagnosis: 'Hypertension',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  console.log('CREATE Response:', createRes.body);
  
  if (createRes.status !== 201) {
    console.error('CREATE failed!');
    return;
  }
  
  const user = JSON.parse(createRes.body);
  const userId = user.id;
  console.log('Created user ID:', userId);
  
  // READ the user back
  const readRes = http.get(`${BASE_URL}/api/users/${userId}`);
  console.log('READ Response:', readRes.body);
  console.log('READ Status:', readRes.status);
  
  if (readRes.status !== 200) {
    console.error('READ failed for ID:', userId);
  } else {
    console.log('✅ SUCCESS! READ worked correctly');
  }
}

