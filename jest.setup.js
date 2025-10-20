// Global test setup for Privata
// This file runs before each test file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PRIVATA_TEST_MODE = 'true';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestId: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create test user data
  createTestUser: (overrides = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: `test_${Date.now()}@example.com`,
    region: 'US',
    ...overrides
  }),
  
  // Create test clinical data
  createTestClinical: (overrides = {}) => ({
    diagnosis: 'Test Diagnosis',
    treatment: 'Test Treatment',
    notes: 'Test notes',
    ...overrides
  })
};
