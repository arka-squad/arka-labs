/**
 * Jest Configuration - B28 Phase 3
 * Objectif: Coverage > 80% pour tous les modules
 */

module.exports = {
  // Environment
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test files location
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx)',
    '**/tests/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)'
  ],

  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        // Allow JS in tests for mocking
        allowJs: true,
        // Skip type checking for faster tests
        skipLibCheck: true
      }
    }]
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1'
  },

  // Coverage configuration - STRICT
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    // Exclude generated files
    '!src/lib/api-lite/setup.ts.backup-*'
  ],

  // Coverage thresholds - Phase 3 objectives
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Strict thresholds for critical modules
    'src/lib/cache/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/api/core/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/lib/auth/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'json',
    'lcov',
    'clover'
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],

  // Test timeout
  testTimeout: 10000,

  // Verbose output for debugging
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Globals for Next.js
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // Watch mode configuration - disabled for CI
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],

  // Error handling
  errorOnDeprecated: true,

  // Performance
  maxWorkers: '50%',

  // Mock configuration
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/'
  ]
};