const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.stories.{ts,tsx}',
    '!packages/*/src/**/*.test.{ts,tsx}',
    '!packages/*/src/**/*.spec.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  testMatch: [
    '<rootDir>/packages/*/src/**/*.test.{ts,tsx}',
    '<rootDir>/packages/*/src/**/*.spec.{ts,tsx}',
    '<rootDir>/packages/*/tests/**/*.test.{ts,tsx}',
    '<rootDir>/packages/*/tests/**/*.spec.{ts,tsx}'
  ],
  moduleNameMapping: {
    '^@privata/core$': '<rootDir>/packages/core/src',
    '^@privata/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@privata/adapters$': '<rootDir>/packages/adapters/src',
    '^@privata/adapters/(.*)$': '<rootDir>/packages/adapters/src/$1',
    '^@privata/extensions$': '<rootDir>/packages/extensions/src',
    '^@privata/extensions/(.*)$': '<rootDir>/packages/extensions/src/$1'
  }
};
