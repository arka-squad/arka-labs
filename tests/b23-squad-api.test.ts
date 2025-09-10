import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { testApiHandler } from 'next-test-api-route-handler';
import { sql } from '../lib/db';

// Import API handlers
import * as squadsHandler from '../app/api/admin/squads/route';
import * as squadDetailHandler from '../app/api/admin/squads/[id]/route';
import * as squadMembersHandler from '../app/api/admin/squads/[id]/members/route';
import * as squadInstructionsHandler from '../app/api/admin/squads/[id]/instructions/route';

// Test data
const mockAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhcmthLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OSwidGVzdCI6dHJ1ZX0.test-token';
const mockViewerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2aWV3ZXJAYXJrYS5jb20iLCJyb2xlIjoidmlld2VyIiwiZXhwIjo5OTk5OTk5OTk5LCJ0ZXN0Ijp0cnVlfQ.test-token';

// Mock data setup
let testSquadId: string;
let testAgentId: string;
let testProjectId: number;

beforeAll(async () => {
  // Setup test database
  try {
    // Create test agent
    const { rows: agentRows } = await sql`
      INSERT INTO agents (name, role) 
      VALUES ('Test Agent', 'specialist')
      RETURNING id
    `;
    testAgentId = agentRows[0].id;

    // Create test project
    const { rows: projectRows } = await sql`
      INSERT INTO projects (name, status, created_by) 
      VALUES ('Test Project', 'active', 'admin@arka.com')
      RETURNING id
    `;
    testProjectId = projectRows[0].id;
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  // Cleanup test data
  try {
    if (testSquadId) {
      await sql`DELETE FROM squads WHERE id = ${testSquadId}`;
    }
    if (testAgentId) {
      await sql`DELETE FROM agents WHERE id = ${testAgentId}`;
    }
    if (testProjectId) {
      await sql`DELETE FROM projects WHERE id = ${testProjectId}`;
    }
  } catch (error) {
    console.warn('Test cleanup failed:', error);
  }
});

describe('B23 Squad API - CRUD Operations', () => {
  // Test: Create squad (admin only)
  test('POST /api/admin/squads - admin can create squad', async () => {
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-create-squad'
          },
          body: JSON.stringify({
            name: 'Test Squad Alpha',
            mission: 'Test mission for automated testing',
            domain: 'Tech'
          })
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        
        expect(data).toMatchObject({
          name: 'Test Squad Alpha',
          slug: 'test-squad-alpha',
          mission: 'Test mission for automated testing',
          domain: 'Tech',
          status: 'active',
          members_count: 0,
          projects_count: 0
        });

        testSquadId = data.id;
      }
    });
  });

  // Test: Create squad validation
  test('POST /api/admin/squads - validation fails with invalid data', async () => {
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-validation'
          },
          body: JSON.stringify({
            name: 'AB', // Too short (min 3 chars)
            domain: 'InvalidDomain' // Invalid enum
          })
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('validation_failed');
      }
    });
  });

  // Test: List squads with pagination
  test('GET /api/admin/squads - list squads with pagination', async () => {
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'X-Trace-Id': 'test-list-squads'
          }
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('page', 1);
        expect(data).toHaveProperty('limit', 20);
        expect(data).toHaveProperty('count');
        expect(Array.isArray(data.items)).toBe(true);
        expect(data.items.length).toBeGreaterThan(0);
      }
    });
  });

  // Test: Get squad detail
  test('GET /api/admin/squads/[id] - get squad details', async () => {
    await testApiHandler({
      pagesHandler: squadDetailHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'X-Trace-Id': 'test-squad-detail'
          }
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        
        expect(data).toMatchObject({
          id: testSquadId,
          name: 'Test Squad Alpha',
          slug: 'test-squad-alpha',
          domain: 'Tech',
          status: 'active'
        });
        expect(data).toHaveProperty('members');
        expect(data).toHaveProperty('attached_projects');
        expect(data).toHaveProperty('recent_instructions');
        expect(data).toHaveProperty('performance');
      }
    });
  });

  // Test: Update squad
  test('PATCH /api/admin/squads/[id] - update squad', async () => {
    await testApiHandler({
      pagesHandler: squadDetailHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-squad-update'
          },
          body: JSON.stringify({
            mission: 'Updated mission for testing',
            status: 'inactive'
          })
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        
        expect(data.mission).toBe('Updated mission for testing');
        expect(data.status).toBe('inactive');
      }
    });
  });
});

describe('B23 Squad Members Management', () => {
  // Test: Add member to squad
  test('POST /api/admin/squads/[id]/members - add member', async () => {
    await testApiHandler({
      pagesHandler: squadMembersHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-add-member'
          },
          body: JSON.stringify({
            agent_id: testAgentId,
            role: 'specialist',
            specializations: ['testing', 'automation']
          })
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        
        expect(data).toMatchObject({
          squad_id: testSquadId,
          agent_id: testAgentId,
          role: 'specialist',
          specializations: ['testing', 'automation']
        });
      }
    });
  });

  // Test: Add duplicate member fails
  test('POST /api/admin/squads/[id]/members - duplicate member fails', async () => {
    await testApiHandler({
      pagesHandler: squadMembersHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-duplicate-member'
          },
          body: JSON.stringify({
            agent_id: testAgentId,
            role: 'lead'
          })
        });

        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error).toBe('agent_already_member');
      }
    });
  });
});

describe('B23 Squad Instructions', () => {
  beforeAll(async () => {
    // Attach squad to project for instructions
    await sql`
      INSERT INTO project_squads (project_id, squad_id, attached_by)
      VALUES (${testProjectId}, ${testSquadId}, 'admin@arka.com')
    `;
    
    // Ensure squad is active for instructions
    await sql`UPDATE squads SET status = 'active' WHERE id = ${testSquadId}`;
  });

  // Test: Create instruction
  test('POST /api/admin/squads/[id]/instructions - create instruction', async () => {
    await testApiHandler({
      pagesHandler: squadInstructionsHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-create-instruction'
          },
          body: JSON.stringify({
            project_id: testProjectId,
            content: 'Test instruction for automated testing suite',
            priority: 'normal'
          })
        });

        expect(res.status).toBe(202); // Accepted for async processing
        const data = await res.json();
        
        expect(data).toMatchObject({
          squad_id: testSquadId,
          project_id: testProjectId,
          content: 'Test instruction for automated testing suite',
          priority: 'normal',
          status: 'queued'
        });
        expect(data).toHaveProperty('instruction_id');
        expect(data).toHaveProperty('estimated_completion');
        expect(data).toHaveProperty('routing');
      }
    });
  });

  // Test: Create instruction for disabled project fails with 423
  test('POST /api/admin/squads/[id]/instructions - disabled project returns 423', async () => {
    // Disable the project
    await sql`UPDATE projects SET status = 'disabled' WHERE id = ${testProjectId}`;

    await testApiHandler({
      pagesHandler: squadInstructionsHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-disabled-project'
          },
          body: JSON.stringify({
            project_id: testProjectId,
            content: 'This should fail',
            priority: 'normal'
          })
        });

        expect(res.status).toBe(423); // Locked
        const data = await res.json();
        expect(data.error).toBe('project_disabled');
      }
    });

    // Re-enable project for other tests
    await sql`UPDATE projects SET status = 'active' WHERE id = ${testProjectId}`;
  });
});

describe('B23 RBAC Authorization', () => {
  // Test: Viewer can read but not write
  test('Viewer can GET but not POST squads', async () => {
    // GET should work
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockViewerToken}`,
            'X-Trace-Id': 'test-viewer-read'
          }
        });
        expect(res.status).toBe(200);
      }
    });

    // POST should fail
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockViewerToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-viewer-write'
          },
          body: JSON.stringify({
            name: 'Should Fail',
            domain: 'Tech'
          })
        });
        expect(res.status).toBe(403);
      }
    });
  });

  // Test: Unauthorized access fails
  test('No auth token returns 401', async () => {
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            'X-Trace-Id': 'test-no-auth'
          }
        });
        expect(res.status).toBe(401);
      }
    });
  });
});

describe('B23 State Machine Validation', () => {
  // Test: Cannot attach inactive squad to project
  test('Inactive squad cannot be used for instructions', async () => {
    // Set squad to inactive
    await sql`UPDATE squads SET status = 'inactive' WHERE id = ${testSquadId}`;

    await testApiHandler({
      pagesHandler: squadInstructionsHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-inactive-squad'
          },
          body: JSON.stringify({
            project_id: testProjectId,
            content: 'This should fail for inactive squad',
            priority: 'normal'
          })
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Squad must be active');
      }
    });

    // Reactivate for cleanup
    await sql`UPDATE squads SET status = 'active' WHERE id = ${testSquadId}`;
  });

  // Test: Archive squad auto-detaches from projects
  test('Archiving squad auto-detaches from projects', async () => {
    await testApiHandler({
      pagesHandler: squadDetailHandler,
      params: { id: testSquadId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'Content-Type': 'application/json',
            'X-Trace-Id': 'test-archive-squad'
          },
          body: JSON.stringify({
            status: 'archived'
          })
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('archived');
      }
    });

    // Check that project attachment was detached
    const { rows } = await sql`
      SELECT status FROM project_squads 
      WHERE squad_id = ${testSquadId} AND project_id = ${testProjectId}
    `;
    expect(rows[0]?.status).toBe('detached');
  });
});

describe('B23 Performance & Caching', () => {
  // Test: List endpoint has reasonable performance
  test('Squad list endpoint performance', async () => {
    const start = Date.now();
    
    await testApiHandler({
      pagesHandler: squadsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockAdminToken}`,
            'X-Trace-Id': 'test-performance'
          }
        });
        
        const duration = Date.now() - start;
        expect(res.status).toBe(200);
        expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds per B23 spec
      }
    });
  });
});