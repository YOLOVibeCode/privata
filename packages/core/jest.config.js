module.exports = {
  displayName: 'core',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,js}',
    '<rootDir>/src/**/*.spec.{ts,js}',
    '<rootDir>/tests/**/*.test.{ts,js}',
    '<rootDir>/tests/**/*.spec.{ts,js}'
  ],
  coverageDirectory: '../../coverage/packages/core',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
