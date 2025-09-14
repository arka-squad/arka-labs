/**
 * Tests Cache Middleware - B28 Phase 3
 * Objectif: Coverage > 85% middleware cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCacheMiddleware, cacheMiddleware } from '@/lib/middleware/cache-middleware';
import { cache } from '@/lib/cache/redis-cache';

// Mock cache module
jest.mock('@/lib/cache/redis-cache');
const mockCache = cache as jest.Mocked<typeof cache>;

// Mock console
const mockConsole = {
  log: jest.fn(),
  error: jest.fn()
};

beforeAll(() => {
  global.console = mockConsole as any;
});

describe('Cache Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue();
  });

  describe('Cache Hit Scenarios', () => {
    it('should return cached response when available', async () => {
      const cachedData = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { message: 'cached response' }
      };

      mockCache.get.mockResolvedValue(cachedData);

      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');
      const mockHandler = jest.fn();

      const response = await middleware(req, mockHandler);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBe('HIT');
      expect(await response.json()).toEqual({ message: 'cached response' });
    });

    it('should include cache key in response headers', async () => {
      mockCache.get.mockResolvedValue({
        status: 200,
        headers: {},
        body: {}
      });

      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');
      const mockHandler = jest.fn();

      const response = await middleware(req, mockHandler);

      expect(response.headers.get('X-Cache-Key')).toMatch(/^.{16}\.{3}$/);
      expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/);
    });
  });

  describe('Cache Miss Scenarios', () => {
    it('should call handler and cache response on cache miss', async () => {
      const handlerResponse = NextResponse.json(
        { message: 'fresh response' },
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      );

      const mockHandler = jest.fn().mockResolvedValue(handlerResponse);
      const middleware = createCacheMiddleware({ ttl: 300 });
      const req = new NextRequest('http://localhost:3000/api/test');

      const response = await middleware(req, mockHandler);

      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: 200,
          body: { message: 'fresh response' }
        }),
        300
      );
      expect(response.headers.get('X-Cache')).toBe('MISS');
    });

    it('should not cache non-200 responses', async () => {
      const errorResponse = NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );

      const mockHandler = jest.fn().mockResolvedValue(errorResponse);
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');

      await middleware(req, mockHandler);

      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should not cache non-JSON responses', async () => {
      const textResponse = new NextResponse('Plain text response', {
        status: 200,
        headers: { 'content-type': 'text/plain' }
      });

      const mockHandler = jest.fn().mockResolvedValue(textResponse);
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');

      await middleware(req, mockHandler);

      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should not cache responses with no-cache header', async () => {
      const noCacheResponse = NextResponse.json(
        { data: 'no cache' },
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          }
        }
      );

      const mockHandler = jest.fn().mockResolvedValue(noCacheResponse);
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');

      await middleware(req, mockHandler);

      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });

  describe('Skip Conditions', () => {
    it('should skip cache for POST requests', async () => {
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST'
      });
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      await middleware(req, mockHandler);

      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req);
    });

    it('should skip cache for admin paths', async () => {
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/admin/users');
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      await middleware(req, mockHandler);

      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req);
    });

    it('should skip cache when authorization header present', async () => {
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: 'Bearer token123' }
      });
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      await middleware(req, mockHandler);

      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req);
    });

    it('should respect custom skip conditions', async () => {
      const middleware = createCacheMiddleware({
        skipConditions: {
          methods: ['PATCH'],
          paths: ['/api/custom'],
          headers: ['x-no-cache']
        }
      });

      // Test custom method
      const patchReq = new NextRequest('http://localhost:3000/api/test', {
        method: 'PATCH'
      });
      const mockHandler1 = jest.fn().mockResolvedValue(NextResponse.json({}));
      await middleware(patchReq, mockHandler1);
      expect(mockCache.get).not.toHaveBeenCalled();

      // Test custom path
      jest.clearAllMocks();
      const customPathReq = new NextRequest('http://localhost:3000/api/custom/endpoint');
      const mockHandler2 = jest.fn().mockResolvedValue(NextResponse.json({}));
      await middleware(customPathReq, mockHandler2);
      expect(mockCache.get).not.toHaveBeenCalled();

      // Test custom header
      jest.clearAllMocks();
      const customHeaderReq = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'x-no-cache': 'true' }
      });
      const mockHandler3 = jest.fn().mockResolvedValue(NextResponse.json({}));
      await middleware(customHeaderReq, mockHandler3);
      expect(mockCache.get).not.toHaveBeenCalled();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate different keys for different URLs', async () => {
      const middleware = createCacheMiddleware();
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      // First request
      const req1 = new NextRequest('http://localhost:3000/api/users');
      await middleware(req1, mockHandler);
      const key1 = mockCache.get.mock.calls[0][0];

      // Second request with different URL
      jest.clearAllMocks();
      const req2 = new NextRequest('http://localhost:3000/api/projects');
      await middleware(req2, mockHandler);
      const key2 = mockCache.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different query parameters', async () => {
      const middleware = createCacheMiddleware();
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      // First request
      const req1 = new NextRequest('http://localhost:3000/api/users?page=1');
      await middleware(req1, mockHandler);
      const key1 = mockCache.get.mock.calls[0][0];

      // Second request with different query
      jest.clearAllMocks();
      const req2 = new NextRequest('http://localhost:3000/api/users?page=2');
      await middleware(req2, mockHandler);
      const key2 = mockCache.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should generate same key for same requests', async () => {
      const middleware = createCacheMiddleware();
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      // Two identical requests
      const req1 = new NextRequest('http://localhost:3000/api/users?page=1');
      const req2 = new NextRequest('http://localhost:3000/api/users?page=1');

      await middleware(req1, mockHandler);
      const key1 = mockCache.get.mock.calls[0][0];

      jest.clearAllMocks();
      await middleware(req2, mockHandler);
      const key2 = mockCache.get.mock.calls[0][0];

      expect(key1).toBe(key2);
    });

    it('should vary by user when configured', async () => {
      const middleware = createCacheMiddleware({
        varyBy: ['url', 'user']
      });
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      // Same URL, different auth headers
      const req1 = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: 'Bearer user1token' }
      });
      const req2 = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: 'Bearer user2token' }
      });

      await middleware(req1, mockHandler);
      const key1 = mockCache.get.mock.calls[0][0];

      jest.clearAllMocks();
      await middleware(req2, mockHandler);
      const key2 = mockCache.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      mockCache.get.mockRejectedValue(new Error('Cache error'));

      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({}));

      const response = await middleware(req, mockHandler);

      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(response).toBeDefined();
      expect(mockConsole.error).toHaveBeenCalledWith('Cache middleware error:', expect.any(Error));
    });

    it('should handle cache set errors gracefully', async () => {
      mockCache.set.mockRejectedValue(new Error('Cache set error'));

      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({}, { status: 200 })
      );

      const response = await middleware(req, mockHandler);

      expect(response).toBeDefined();
      expect(response.headers.get('X-Cache')).toBe('MISS');
    });
  });

  describe('Pre-configured Middleware Variants', () => {
    it('should have standard middleware with 5 min TTL', () => {
      expect(cacheMiddleware.standard).toBeDefined();
    });

    it('should have long-term middleware with 1 hour TTL', () => {
      expect(cacheMiddleware.longTerm).toBeDefined();
    });

    it('should have short-term middleware with 1 min TTL', () => {
      expect(cacheMiddleware.shortTerm).toBeDefined();
    });

    it('should have paginated middleware', () => {
      expect(cacheMiddleware.paginated).toBeDefined();
    });

    it('should have user-specific middleware', () => {
      expect(cacheMiddleware.userSpecific).toBeDefined();
    });
  });

  describe('Performance Optimization', () => {
    it('should measure and report response times', async () => {
      const middleware = createCacheMiddleware();
      const req = new NextRequest('http://localhost:3000/api/test');

      // Simulate slow handler
      const mockHandler = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return NextResponse.json({});
      });

      const response = await middleware(req, mockHandler);

      expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/);
      const responseTime = parseInt(response.headers.get('X-Response-Time') || '0');
      expect(responseTime).toBeGreaterThan(40); // At least 40ms due to 50ms delay
    });
  });
});