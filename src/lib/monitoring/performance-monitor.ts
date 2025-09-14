/**
 * Performance Monitor - B28 Phase 3
 * Monitoring temps réel pour objectif < 100ms P95
 */

import { NextRequest, NextResponse } from 'next/server';

interface MetricData {
  timestamp: number;
  duration: number;
  status: number;
  method: string;
  path: string;
  userAgent?: string;
  cached?: boolean;
}

interface PerformanceStats {
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  successRate: number;
  cacheHitRate: number;
}

class PerformanceMonitor {
  private metrics: MetricData[] = [];
  private readonly maxMetrics = 1000; // Garder dernières 1000 métriques
  private statsCache: { [endpoint: string]: PerformanceStats } = {};
  private lastStatsUpdate = 0;
  private readonly statsUpdateInterval = 30000; // 30 secondes

  recordRequest(
    req: NextRequest,
    response: NextResponse,
    duration: number
  ): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      duration,
      status: response.status,
      method: req.method,
      path: this.normalizePath(new URL(req.url).pathname),
      userAgent: req.headers.get('user-agent')?.substring(0, 100),
      cached: response.headers.get('x-cache') === 'HIT'
    };

    this.metrics.push(metric);

    // Garder seulement les dernières métriques
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Invalider cache stats si nécessaire
    if (Date.now() - this.lastStatsUpdate > this.statsUpdateInterval) {
      this.statsCache = {};
      this.lastStatsUpdate = Date.now();
    }

    // Log performance en temps réel
    this.logPerformance(metric);
  }

  private normalizePath(path: string): string {
    // Normaliser les paths avec IDs dynamiques
    return path
      .replace(/\/api/, '') // Remove /api prefix
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id') // UUID
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\/[a-zA-Z0-9]+$/g, '/:param'); // Generic params
  }

  private logPerformance(metric: MetricData): void {
    const emoji = this.getPerformanceEmoji(metric.duration);
    const cacheStatus = metric.cached ? '⚡CACHED' : '';

    console.log(
      `${emoji} ${metric.method} ${metric.path} - ${metric.duration}ms (${metric.status}) ${cacheStatus}`
    );

    // Alert si très lent
    if (metric.duration > 500) {
      console.warn(`🐌 SLOW REQUEST: ${metric.method} ${metric.path} took ${metric.duration}ms`);
    }
  }

  private getPerformanceEmoji(duration: number): string {
    if (duration < 50) return '⚡';
    if (duration < 100) return '🟢';
    if (duration < 200) return '🟡';
    if (duration < 500) return '🟠';
    return '🔴';
  }

  getStats(endpoint?: string): PerformanceStats | { [key: string]: PerformanceStats } {
    if (endpoint) {
      return this.calculateStats(endpoint);
    }

    // Retourner stats pour tous les endpoints
    const allStats: { [key: string]: PerformanceStats } = {};
    const endpoints = [...new Set(this.metrics.map(m => m.path))];

    endpoints.forEach(ep => {
      allStats[ep] = this.calculateStats(ep);
    });

    return allStats;
  }

  private calculateStats(endpoint: string): PerformanceStats {
    // Utiliser cache si disponible et récent
    if (this.statsCache[endpoint]) {
      return this.statsCache[endpoint];
    }

    const endpointMetrics = this.metrics.filter(m => m.path === endpoint);

    if (endpointMetrics.length === 0) {
      return {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        p95Time: 0,
        successRate: 0,
        cacheHitRate: 0
      };
    }

    const durations = endpointMetrics.map(m => m.duration).sort((a, b) => a - b);
    const successCount = endpointMetrics.filter(m => m.status < 400).length;
    const cacheHits = endpointMetrics.filter(m => m.cached).length;

    const stats: PerformanceStats = {
      count: endpointMetrics.length,
      totalTime: durations.reduce((sum, d) => sum + d, 0),
      avgTime: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
      minTime: durations[0],
      maxTime: durations[durations.length - 1],
      p95Time: this.calculatePercentile(durations, 95),
      successRate: Math.round((successCount / endpointMetrics.length) * 100),
      cacheHitRate: Math.round((cacheHits / endpointMetrics.length) * 100)
    };

    // Cache le résultat
    this.statsCache[endpoint] = stats;

    return stats;
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  // Méthodes pour alertes et monitoring
  checkPerformanceAlerts(): string[] {
    const alerts: string[] = [];
    const stats = this.getStats() as { [key: string]: PerformanceStats };

    Object.entries(stats).forEach(([endpoint, stat]) => {
      // Alert P95 > 100ms
      if (stat.p95Time > 100 && stat.count > 10) {
        alerts.push(`⚠️ ${endpoint}: P95 = ${stat.p95Time}ms (objectif < 100ms)`);
      }

      // Alert taux de succès < 95%
      if (stat.successRate < 95 && stat.count > 5) {
        alerts.push(`❌ ${endpoint}: Success rate = ${stat.successRate}% (objectif > 95%)`);
      }

      // Alert temps moyen > 200ms
      if (stat.avgTime > 200 && stat.count > 5) {
        alerts.push(`🐌 ${endpoint}: Avg time = ${stat.avgTime}ms (trop lent)`);
      }
    });

    return alerts;
  }

  generateReport(): string {
    const stats = this.getStats() as { [key: string]: PerformanceStats };
    const alerts = this.checkPerformanceAlerts();

    const totalRequests = Object.values(stats).reduce((sum, s) => sum + s.count, 0);
    const avgP95 = Object.values(stats)
      .filter(s => s.count > 0)
      .reduce((sum, s) => sum + s.p95Time, 0) / Object.keys(stats).length;

    return `# Performance Report B28 Phase 3

## 📊 Métriques Globales
- **Total requêtes**: ${totalRequests}
- **P95 moyen**: ${Math.round(avgP95)}ms
- **Objectif P95**: < 100ms
- **Status**: ${avgP95 < 100 ? '✅ ATTEINT' : '❌ NON ATTEINT'}

## 🎯 Performance par Endpoint

| Endpoint | Requêtes | P95 | Avg | Success% | Cache% |
|----------|----------|-----|-----|----------|--------|
${Object.entries(stats)
  .sort(([,a], [,b]) => b.p95Time - a.p95Time)
  .map(([endpoint, stat]) =>
    `| ${endpoint} | ${stat.count} | ${stat.p95Time}ms | ${stat.avgTime}ms | ${stat.successRate}% | ${stat.cacheHitRate}% |`
  ).join('\n')}

${alerts.length > 0 ? `
## ⚠️ Alertes Performance
${alerts.map(alert => `- ${alert}`).join('\n')}
` : '## ✅ Aucune Alerte'}

---
*Généré le ${new Date().toLocaleString('fr-FR')}*
`;
  }

  // Exporter métriques pour analyse externe
  exportMetrics() {
    return {
      metrics: this.metrics,
      stats: this.getStats(),
      alerts: this.checkPerformanceAlerts(),
      timestamp: Date.now()
    };
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware pour monitoring automatique des performances
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function monitoredHandler(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Enregistrer métrique
      performanceMonitor.recordRequest(req, response, duration);

      // Ajouter headers performance
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-Performance-Target', '<100ms');

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Créer réponse d'erreur pour monitoring
      const errorResponse = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );

      performanceMonitor.recordRequest(req, errorResponse, duration);

      throw error;
    }
  };
}

export default performanceMonitor;