#!/usr/bin/env node
/**
 * Performance P95 Validation - B28 Phase 3
 * Test endpoints performance < 100ms P95
 */

const http = require('http');
const https = require('https');

const ENDPOINTS = [
  '/api/health',
  '/api/auth/validate',
  '/api/projects',
  '/api/users/profile',
  '/api/cache-test'
];

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const ITERATIONS = 100; // Pour statistiques P95 fiables
const TARGET_P95 = 100; // ms

class PerformanceTester {
  constructor() {
    this.results = [];
  }

  async makeRequest(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, (res) => {
        const duration = Date.now() - startTime;
        resolve({
          endpoint,
          duration,
          status: res.statusCode,
          success: res.statusCode < 400
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        resolve({
          endpoint,
          duration,
          status: 0,
          success: false,
          error: error.message
        });
      });

      req.setTimeout(5000); // 5s timeout
    });
  }

  async testEndpoint(endpoint) {
    console.log(`🔍 Testing ${endpoint}...`);

    const results = [];

    // Warmup requests (not counted)
    console.log('  Warmup...');
    for (let i = 0; i < 5; i++) {
      await this.makeRequest(endpoint);
      await this.sleep(10);
    }

    // Actual test requests
    console.log(`  Running ${ITERATIONS} requests...`);
    for (let i = 0; i < ITERATIONS; i++) {
      const result = await this.makeRequest(endpoint);
      results.push(result);

      if (i % 20 === 0) {
        process.stdout.write('.');
      }
    }
    console.log('');

    return this.analyzeResults(endpoint, results);
  }

  analyzeResults(endpoint, results) {
    const durations = results
      .filter(r => r.success)
      .map(r => r.duration)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return {
        endpoint,
        error: 'No successful requests',
        success: false
      };
    }

    const stats = {
      endpoint,
      count: durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      p50: this.percentile(durations, 50),
      p90: this.percentile(durations, 90),
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
      successRate: Math.round((durations.length / ITERATIONS) * 100),
      failures: ITERATIONS - durations.length
    };

    stats.success = stats.p95 <= TARGET_P95 && stats.successRate >= 95;

    return stats;
  }

  percentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printResults(results) {
    console.log('\n📊 PERFORMANCE VALIDATION RESULTS');
    console.log('='.repeat(60));

    console.log('\n| Endpoint | P95 | Avg | Min | Max | Success% | Status |');
    console.log('|----------|-----|-----|-----|-----|----------|--------|');

    results.forEach(result => {
      if (result.error) {
        console.log(`| ${result.endpoint.padEnd(8)} | ERROR | - | - | - | - | ❌ |`);
        return;
      }

      const status = result.success ? '✅' : '❌';
      const p95Status = result.p95 <= TARGET_P95 ? '⚡' : '🐌';

      console.log(
        `| ${result.endpoint.padEnd(8)} | ` +
        `${result.p95}ms ${p95Status} | ` +
        `${result.avg}ms | ` +
        `${result.min}ms | ` +
        `${result.max}ms | ` +
        `${result.successRate}% | ` +
        `${status} |`
      );
    });

    const globalStats = this.calculateGlobalStats(results);
    this.printGlobalStats(globalStats);

    return globalStats;
  }

  calculateGlobalStats(results) {
    const validResults = results.filter(r => !r.error && r.success);

    if (validResults.length === 0) {
      return { success: false, message: 'No valid results' };
    }

    const avgP95 = Math.round(
      validResults.reduce((sum, r) => sum + r.p95, 0) / validResults.length
    );

    const avgSuccess = Math.round(
      validResults.reduce((sum, r) => sum + r.successRate, 0) / validResults.length
    );

    const passedEndpoints = validResults.filter(r => r.p95 <= TARGET_P95).length;
    const totalEndpoints = validResults.length;

    return {
      avgP95,
      avgSuccess,
      passedEndpoints,
      totalEndpoints,
      overallSuccess: passedEndpoints === totalEndpoints && avgP95 <= TARGET_P95,
      score: Math.round((passedEndpoints / totalEndpoints) * 100)
    };
  }

  printGlobalStats(stats) {
    console.log('\n🎯 GLOBAL PERFORMANCE SUMMARY');
    console.log('-'.repeat(40));
    console.log(`Average P95: ${stats.avgP95}ms (target: <${TARGET_P95}ms)`);
    console.log(`Average Success Rate: ${stats.avgSuccess}%`);
    console.log(`Endpoints Passed: ${stats.passedEndpoints}/${stats.totalEndpoints}`);
    console.log(`Performance Score: ${stats.score}%`);

    if (stats.overallSuccess) {
      console.log('\n🎉 PERFORMANCE TARGET ACHIEVED!');
      console.log('✅ P95 < 100ms ✅ Success rate > 95%');
    } else {
      console.log('\n⚠️  PERFORMANCE TARGET NOT MET');
      if (stats.avgP95 > TARGET_P95) {
        console.log(`❌ P95 too high: ${stats.avgP95}ms > ${TARGET_P95}ms`);
      }
      if (stats.passedEndpoints < stats.totalEndpoints) {
        console.log(`❌ Some endpoints failed performance test`);
      }
    }
  }

  async generateReport(results, globalStats) {
    const timestamp = new Date().toISOString();

    const report = `# Performance Validation Report B28 Phase 3

Generated: ${timestamp}
Target: P95 < ${TARGET_P95}ms
Iterations per endpoint: ${ITERATIONS}

## Results Summary

**Global Performance**: ${globalStats.overallSuccess ? '✅ PASSED' : '❌ FAILED'}
- Average P95: ${globalStats.avgP95}ms
- Performance Score: ${globalStats.score}%
- Endpoints Passed: ${globalStats.passedEndpoints}/${globalStats.totalEndpoints}

## Detailed Results

| Endpoint | P95 (ms) | Avg (ms) | Success Rate | Status |
|----------|----------|----------|--------------|--------|
${results.map(r => {
  if (r.error) return `| ${r.endpoint} | ERROR | - | - | ❌ |`;
  const status = r.success ? '✅' : '❌';
  return `| ${r.endpoint} | ${r.p95} | ${r.avg} | ${r.successRate}% | ${status} |`;
}).join('\n')}

## Performance Analysis

${results.map(r => {
  if (r.error) return `### ${r.endpoint}\n**ERROR**: ${r.error}`;

  return `### ${r.endpoint}
- **P95**: ${r.p95}ms ${r.p95 <= TARGET_P95 ? '✅' : '❌'}
- **Average**: ${r.avg}ms
- **Range**: ${r.min}ms - ${r.max}ms
- **Success Rate**: ${r.successRate}%
- **Failures**: ${r.failures}/${ITERATIONS}`;
}).join('\n\n')}

${globalStats.overallSuccess ?
  '## ✅ Performance Validation PASSED\n\nAll endpoints meet the P95 < 100ms target.' :
  '## ❌ Performance Validation FAILED\n\nSome endpoints do not meet performance requirements.'
}

---
*B28 Phase 3 Performance Validation*
`;

    return report;
  }
}

async function main() {
  console.log('🚀 B28 PERFORMANCE VALIDATION - P95 < 100ms');
  console.log(`Testing ${ENDPOINTS.length} endpoints with ${ITERATIONS} requests each`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  const tester = new PerformanceTester();
  const results = [];

  // Test each endpoint
  for (const endpoint of ENDPOINTS) {
    try {
      const result = await tester.testEndpoint(endpoint);
      results.push(result);
    } catch (error) {
      results.push({
        endpoint,
        error: error.message,
        success: false
      });
    }
  }

  // Print and analyze results
  const globalStats = tester.printResults(results);

  // Generate report
  const report = await tester.generateReport(results, globalStats);

  // Save report
  const fs = require('fs');
  const reportPath = 'arka-meta/reports/b28-performance-validation.md';

  // Ensure directory exists
  const reportDir = require('path').dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, report);
  console.log(`\n📊 Report saved: ${reportPath}`);

  // Exit with appropriate code
  process.exit(globalStats.overallSuccess ? 0 : 1);
}

// Handle CLI execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Performance validation failed:', error);
    process.exit(1);
  });
}

module.exports = { PerformanceTester };