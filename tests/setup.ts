/**
 * Jest Setup - B28 Phase 3
 * Configuration globale pour tous les tests
 */

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      headers: new Map(Object.entries(options?.headers || {})),
      json: async () => data
    })),
    next: jest.fn(() => ({}))
  }
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(() => Promise.resolve([])),
    quit: jest.fn()
  }));
});

// Mock database
jest.mock('@/lib/db', () => ({
  sql: jest.fn(() => Promise.resolve([])),
  db: {
    query: jest.fn(() => Promise.resolve({ rows: [], rowCount: 0 }))
  }
}));

// Mock crypto for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    createHash: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(() => 'mockedhash123')
    }))
  }
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test@localhost/test';

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toHaveValidTimestamp(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
      pass
    };
  },

  toHaveValidTimestamp(received: any) {
    const hasTimestamp = received && typeof received.timestamp === 'string';
    const isValidDate = hasTimestamp && !isNaN(Date.parse(received.timestamp));

    return {
      message: () =>
        isValidDate
          ? `expected object not to have a valid timestamp`
          : `expected object to have a valid timestamp`,
      pass: isValidDate
    };
  }
});

// Silence console logs in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  const originalConsole = console;
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  // Keep console.error for debugging
  console.error = originalConsole.error;
}

// Global test timeout
jest.setTimeout(10000);

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

export {};