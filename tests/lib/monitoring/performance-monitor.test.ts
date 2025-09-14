/**
 * Tests Performance Monitor - B28 Phase 3
 * Objectif: Coverage > 85% module monitoring critique
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor, withPerformanceMonitoring } from '@/lib/monitoring/performance-monitor';

// Mock console methods
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = originalConsole.error;
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset monitor state
    (performanceMonitor as any).metrics = [];
    (performanceMonitor as any).statsCache = {};
  });

  describe('Request Recording', () => {
    it('should record request metrics', () => {
      // Mock URL for NextRequest
      Object.defineProperty(global, 'URL', {
        writable: true,
        value: class {
          constructor(url: string) {
            this.pathname = url.replace('http://localhost:3000', '');
          }
          pathname: string;
        }
      });

      const mockReq = {
        url: 'http://localhost:3000/api/users/123',
        method: 'GET',
        headers: {
          get: jest.fn().mockReturnValue('test-agent')
        }
      } as any;

      const response = NextResponse.json({ success: true }, { status: 200 });
      response.headers = new Map();

      performanceMonitor.recordRequest(mockReq, response, 150);

      const stats = performanceMonitor.getStats('/users/:id');
      expect(stats).toMatchObject({
        count: 1,
        avgTime: 150,
        minTime: 150,
        maxTime: 150,
        successRate: 100
      });
    });

    it('should normalize paths with UUIDs', () => {
      const req = new NextRequest('http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000/profile');
      const response = NextResponse.json({}, { status: 200 });

      performanceMonitor.recordRequest(req, response, 100);

      const allStats = performanceMonitor.getStats() as { [key: string]: any };
      expect(allStats).toHaveProperty('/users/:id/profile');
    });

    it('should normalize paths with numeric IDs', () => {
      const req = new NextRequest('http://localhost:3000/api/projects/12345');
      const response = NextResponse.json({}, { status: 200 });

      performanceMonitor.recordRequest(req, response, 80);

      const allStats = performanceMonitor.getStats() as { [key: string]: any };
      expect(allStats).toHaveProperty('/projects/:id');
    });

    it('should detect cached responses', () => {
      const req = new NextRequest('http://localhost:3000/api/cached-data');
      const response = NextResponse.json({}, { status: 200 });
      response.headers.set('x-cache', 'HIT');

      performanceMonitor.recordRequest(req, response, 25);

      const stats = performanceMonitor.getStats('/cached-data');
      expect(stats).toMatchObject({
        cacheHitRate: 100
      });
    });

    it('should track error rates', () => {
      const req = new NextRequest('http://localhost:3000/api/error-endpoint');

      // Record successful request
      const successResponse = NextResponse.json({}, { status: 200 });
      performanceMonitor.recordRequest(req, successResponse, 100);

      // Record error request
      const errorResponse = NextResponse.json({}, { status: 500 });
      performanceMonitor.recordRequest(req, errorResponse, 200);

      const stats = performanceMonitor.getStats('/error-endpoint');
      expect(stats).toMatchObject({
        count: 2,
        successRate: 50
      });
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(() => {
      const req = new NextRequest('http://localhost:3000/api/test-endpoint');
      const response = NextResponse.json({}, { status: 200 });

      // Record multiple requests with different durations
      [50, 100, 150, 200, 250].forEach(duration => {
        performanceMonitor.recordRequest(req, response, duration);
      });
    });

    it('should calculate correct average', () => {
      const stats = performanceMonitor.getStats('/test-endpoint');
      expect(stats.avgTime).toBe(150); // (50+100+150+200+250)/5
    });

    it('should calculate correct P95', () => {
      const stats = performanceMonitor.getStats('/test-endpoint');
      expect(stats.p95Time).toBe(250); // 95th percentile of [50,100,150,200,250]
    });

    it('should calculate min and max correctly', () => {
      const stats = performanceMonitor.getStats('/test-endpoint');
      expect(stats.minTime).toBe(50);
      expect(stats.maxTime).toBe(250);
    });

    it('should return zero stats for non-existent endpoint', () => {
      const stats = performanceMonitor.getStats('/non-existent');
      expect(stats).toMatchObject({
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        p95Time: 0,
        successRate: 0,
        cacheHitRate: 0
      });
    });
  });

  describe('Performance Alerts', () => {
    it('should generate P95 alerts for slow endpoints', () => {
      const req = new NextRequest('http://localhost:3000/api/slow-endpoint');
      const response = NextResponse.json({}, { status: 200 });

      // Record 15 slow requests (> 100ms P95 threshold)
      for (let i = 0; i < 15; i++) {
        performanceMonitor.recordRequest(req, response, 150);
      }

      const alerts = performanceMonitor.checkPerformanceAlerts();
      expect(alerts.some(alert => alert.includes('P95 = 150ms'))).toBe(true);
    });

    it('should generate success rate alerts', () => {
      const req = new NextRequest('http://localhost:3000/api/failing-endpoint');

      // Record mostly failing requests
      for (let i = 0; i < 8; i++) {
        const errorResponse = NextResponse.json({}, { status: 500 });
        performanceMonitor.recordRequest(req, errorResponse, 100);
      }

      // Only 2 successful requests out of 10 (80% failure)
      for (let i = 0; i < 2; i++) {
        const successResponse = NextResponse.json({}, { status: 200 });
        performanceMonitor.recordRequest(req, successResponse, 100);
      }

      const alerts = performanceMonitor.checkPerformanceAlerts();
      expect(alerts.some(alert => alert.includes('Success rate = 20%'))).toBe(true);
    });

    it('should generate average time alerts', () => {
      const req = new NextRequest('http://localhost:3000/api/very-slow-endpoint');
      const response = NextResponse.json({}, { status: 200 });

      // Record multiple very slow requests
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordRequest(req, response, 300); // > 200ms threshold
      }

      const alerts = performanceMonitor.checkPerformanceAlerts();
      expect(alerts.some(alert => alert.includes('Avg time = 300ms'))).toBe(true);
    });

    it('should not generate alerts for low-traffic endpoints', () => {
      const req = new NextRequest('http://localhost:3000/api/low-traffic');
      const response = NextResponse.json({}, { status: 500 });

      // Record only 3 requests (below thresholds)
      for (let i = 0; i < 3; i++) {
        performanceMonitor.recordRequest(req, response, 300);
      }

      const alerts = performanceMonitor.checkPerformanceAlerts();
      expect(alerts.length).toBe(0);
    });
  });

  describe('Report Generation', () => {
    beforeEach(() => {
      // Setup test data
      const req1 = new NextRequest('http://localhost:3000/api/fast-endpoint');
      const req2 = new NextRequest('http://localhost:3000/api/slow-endpoint');
      const fastResponse = NextResponse.json({}, { status: 200 });
      const slowResponse = NextResponse.json({}, { status: 200 });

      // Fast endpoint
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordRequest(req1, fastResponse, 50);
      }

      // Slow endpoint
      for (let i = 0; i < 15; i++) {
        performanceMonitor.recordRequest(req2, slowResponse, 150);
      }
    });

    it('should generate comprehensive performance report', () => {
      const report = performanceMonitor.generateReport();

      expect(report).toContain('# Performance Report B28 Phase 3');
      expect(report).toContain('Total requêtes');
      expect(report).toContain('P95 moyen');
      expect(report).toContain('Performance par Endpoint');
    });

    it('should include endpoint performance table', () => {
      const report = performanceMonitor.generateReport();

      expect(report).toContain('/fast-endpoint');
      expect(report).toContain('/slow-endpoint');
      expect(report).toContain('| Endpoint | Requêtes | P95 | Avg |');
    });

    it('should show alerts in report when present', () => {
      const report = performanceMonitor.generateReport();

      // Slow endpoint should trigger alert
      expect(report).toContain('Alertes Performance');
    });
  });

  describe('Metrics Export', () => {
    it('should export complete metrics data', () => {
      const req = new NextRequest('http://localhost:3000/api/export-test');
      const response = NextResponse.json({}, { status: 200 });

      performanceMonitor.recordRequest(req, response, 100);

      const exported = performanceMonitor.exportMetrics();

      expect(exported).toHaveProperty('metrics');
      expect(exported).toHaveProperty('stats');
      expect(exported).toHaveProperty('alerts');
      expect(exported).toHaveProperty('timestamp');
      expect(Array.isArray(exported.metrics)).toBe(true);
    });
  });
});

describe('Performance Monitoring Middleware', () => {
  it('should wrap handler and record metrics', async () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ data: 'test' }, { status: 200 })
    );

    const monitoredHandler = withPerformanceMonitoring(mockHandler);
    const req = new NextRequest('http://localhost:3000/api/middleware-test');

    const response = await monitoredHandler(req);

    expect(mockHandler).toHaveBeenCalledWith(req);
    expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/);
    expect(response.headers.get('X-Performance-Target')).toBe('<100ms');
  });

  it('should handle errors and still record metrics', async () => {
    const error = new Error('Handler failed');
    const mockHandler = jest.fn().mockRejectedValue(error);

    const monitoredHandler = withPerformanceMonitoring(mockHandler);
    const req = new NextRequest('http://localhost:3000/api/error-test');

    await expect(monitoredHandler(req)).rejects.toThrow('Handler failed');

    // Verify error was recorded in metrics
    const stats = performanceMonitor.getStats('/error-test');
    expect(stats.count).toBe(1);
    expect(stats.successRate).toBe(0);
  });

  it('should measure execution time accurately', async () => {
    const delay = 50;
    const mockHandler = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return NextResponse.json({}, { status: 200 });
    });

    const monitoredHandler = withPerformanceMonitoring(mockHandler);
    const req = new NextRequest('http://localhost:3000/api/timing-test');

    const startTime = Date.now();
    await monitoredHandler(req);
    const endTime = Date.now();

    const actualDuration = endTime - startTime;
    const stats = performanceMonitor.getStats('/timing-test');

    expect(stats.avgTime).toBeGreaterThanOrEqual(delay - 10); // Allow 10ms margin
    expect(stats.avgTime).toBeLessThan(actualDuration + 10);
  });
});