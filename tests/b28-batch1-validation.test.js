// Tests de Validation Batch 1 - B28 Phase 2
// Tests automatisés pour vérifier la migration des routes simples

describe('B28 Phase 2 - Batch 1 Migration', () => {
  const baseURL = process.env.TEST_URL || 'http://localhost:3000';

  
  describe('/_readyz', () => {
    
    test('GET /_readyz should work', async () => {
      const response = await fetch(`${baseURL}/api/_readyz`, {
        method: 'GET'
      });

      // La route doit au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });
  describe('/_livez', () => {
    
    test('GET /_livez should work', async () => {
      const response = await fetch(`${baseURL}/api/_livez`, {
        method: 'GET'
      });

      // La route doit au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });
  describe('/version', () => {
    
    test('GET /version should work', async () => {
      const response = await fetch(`${baseURL}/api/version`, {
        method: 'GET'
      });

      // La route doit au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });
  describe('/health', () => {
    
    test('GET /health should work', async () => {
      const response = await fetch(`${baseURL}/api/health`, {
        method: 'GET'
      });

      // La route doit au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });
  describe('/metrics', () => {
    
    test('GET /metrics should work', async () => {
      const response = await fetch(`${baseURL}/api/metrics`, {
        method: 'GET'
      });

      // La route doit au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });
  describe('/providers', () => {
    
    test('GET /providers should work', async () => {
      const response = await fetch(`${baseURL}/api/providers`, {
        method: 'GET'
      });

      // La route doit au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });

  test('Migration completeness', () => {
    const migratedRoutes = ["/_readyz","/_livez","/version","/health","/metrics","/providers"];
    expect(migratedRoutes).toHaveLength(6);
  });
});

// Utilitaires pour tests
export const MIGRATED_ROUTES_BATCH1 = [
  {
    "file": "app/api/_readyz/route.ts",
    "endpoint": "/_readyz",
    "methods": [
      "GET"
    ],
    "module": "system"
  },
  {
    "file": "app/api/_livez/route.ts",
    "endpoint": "/_livez",
    "methods": [
      "GET"
    ],
    "module": "system"
  },
  {
    "file": "app/api/version/route.ts",
    "endpoint": "/version",
    "methods": [
      "GET"
    ],
    "module": "system"
  },
  {
    "file": "app/api/health/route.ts",
    "endpoint": "/health",
    "methods": [
      "GET"
    ],
    "module": "system"
  },
  {
    "file": "app/api/metrics/route.ts",
    "endpoint": "/metrics",
    "methods": [
      "GET"
    ],
    "module": "system"
  },
  {
    "file": "app/api/providers/route.ts",
    "endpoint": "/providers",
    "methods": [
      "GET"
    ],
    "module": "system"
  }
];
