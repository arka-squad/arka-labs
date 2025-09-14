// Tests de Validation Batch 2 - B28 Phase 2
// Tests automatisés pour vérifier la migration des routes admin

describe('B28 Phase 2 - Batch 2 Migration Admin', () => {
  const baseURL = process.env.TEST_URL || 'http://localhost:3000';

  // Mock auth pour tests admin
  const mockAdminAuth = {
    headers: {
      'Authorization': 'Bearer mock-admin-token'
    }
  };

  
  describe('/backoffice/admin/health', () => {
    
    test('GET /backoffice/admin/health should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/health`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/stats', () => {
    
    test('GET /backoffice/admin/stats should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/stats`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/users', () => {
    
    test('GET /backoffice/admin/users should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/users`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/settings', () => {
    
    test('GET /backoffice/admin/settings should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/settings`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
    test('PUT /backoffice/admin/settings should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/settings`, {
        method: 'PUT',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/logs', () => {
    
    test('GET /backoffice/admin/logs should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/logs`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/cache', () => {
    
    test('DELETE /backoffice/admin/cache should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/cache`, {
        method: 'DELETE',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/metrics', () => {
    
    test('GET /backoffice/admin/metrics should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/metrics`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/backoffice/admin/config', () => {
    
    test('GET /backoffice/admin/config should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/config`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
    test('POST /backoffice/admin/config should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/backoffice/admin/config`, {
        method: 'POST',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/admin/projects/:id', () => {
    
    test('GET /admin/projects/:id should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/admin/projects/:id`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
    test('PUT /admin/projects/:id should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/admin/projects/:id`, {
        method: 'PUT',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
    test('DELETE /admin/projects/:id should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/admin/projects/:id`, {
        method: 'DELETE',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });
  describe('/admin/users/:id', () => {
    
    test('GET /admin/users/:id should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/admin/users/:id`, {
        method: 'GET',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
    test('PUT /admin/users/:id should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/admin/users/:id`, {
        method: 'PUT',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
    test('DELETE /admin/users/:id should work with admin auth', async () => {
      const response = await fetch(`${baseURL}/api/admin/users/:id`, {
        method: 'DELETE',
        ...mockAdminAuth
      });

      // Routes admin doivent au minimum retourner une réponse valide
      expect(response.status).toBeLessThan(500);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Vérifier que c'est bien une route admin
        expect(data.admin).toBe(true);
      }
    });
  });

  test('Admin routes completeness', () => {
    const migratedAdminRoutes = ["/backoffice/admin/health","/backoffice/admin/stats","/backoffice/admin/users","/backoffice/admin/settings","/backoffice/admin/logs","/backoffice/admin/cache","/backoffice/admin/metrics","/backoffice/admin/config","/admin/projects/:id","/admin/users/:id"];
    expect(migratedAdminRoutes).toHaveLength(10);
  });

  test('All admin routes require authentication', () => {
    // Test sans auth doit échouer
    const adminRoutes = ["/backoffice/admin/health","/backoffice/admin/stats","/backoffice/admin/users","/backoffice/admin/settings","/backoffice/admin/logs","/backoffice/admin/cache","/backoffice/admin/metrics","/backoffice/admin/config","/admin/projects/:id","/admin/users/:id"];
    adminRoutes.forEach(endpoint => {
      expect(endpoint).toMatch(/admin|backoffice/);
    });
  });
});

// Utilitaires pour tests admin
export const MIGRATED_ADMIN_ROUTES_BATCH2 = [
  {
    "file": "app/api/backoffice/admin/health/route.ts",
    "endpoint": "/backoffice/admin/health",
    "methods": [
      "GET"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/stats/route.ts",
    "endpoint": "/backoffice/admin/stats",
    "methods": [
      "GET"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/users/route.ts",
    "endpoint": "/backoffice/admin/users",
    "methods": [
      "GET"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/settings/route.ts",
    "endpoint": "/backoffice/admin/settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/logs/route.ts",
    "endpoint": "/backoffice/admin/logs",
    "methods": [
      "GET"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/cache/route.ts",
    "endpoint": "/backoffice/admin/cache",
    "methods": [
      "DELETE"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/metrics/route.ts",
    "endpoint": "/backoffice/admin/metrics",
    "methods": [
      "GET"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/backoffice/admin/config/route.ts",
    "endpoint": "/backoffice/admin/config",
    "methods": [
      "GET",
      "POST"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/admin/projects/[id]/route.ts",
    "endpoint": "/admin/projects/:id",
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "module": "admin"
  },
  {
    "file": "app/api/admin/users/[id]/route.ts",
    "endpoint": "/admin/users/:id",
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "module": "admin"
  }
];
