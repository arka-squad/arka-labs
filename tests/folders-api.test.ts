import { describe, it, expect, beforeAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { GET as getFoldersHandler } from '../app/api/folders/[id]/route';
import { GET as getDocumentsHandler } from '../app/api/folders/[id]/documents/route';
import { POST as assignHandler } from '../app/api/folders/[id]/assign/route';
import { POST as contextHandler } from '../app/api/folders/[id]/context/route';
import { GET as roadmapHandler } from '../app/api/folders/[id]/roadmap/route';

// Mock the database
jest.mock('../lib/db', () => ({
  sql: jest.fn()
}));

const mockSql = require('../lib/db').sql as jest.MockedFunction<any>;

// Mock auth verification
jest.mock('../lib/auth', () => ({
  verifyToken: jest.fn(() => ({ sub: 'test-user', role: 'editor' }))
}));

describe('Folders API Routes', () => {
  beforeAll(() => {
    process.env.POSTGRES_URL = 'mock://localhost/test';
  });

  describe('GET /api/folders/:id', () => {
    it('should return folder data for valid ID', async () => {
      const mockFolderData = [{
        id: 'coworking-q4',
        title: 'Journée Coworking Q4',
        status: 'active',
        vision: JSON.stringify({
          objectif: 'Organiser journée coworking RH + plan formation Q4',
          livrable: 'Synthèse écrite, planning validé, décisions actées',
          contraintes: ['Budget ≤ 1k€', 'Salle J-7', 'Docs Q3 disponibles'],
          succes: ['3 décisions actées', 'Planning assigné', 'Feedback collecté']
        }),
        context: JSON.stringify({
          guided_notes: [
            { id: 'ctx1', type: 'agent_question', content: 'Test question?', agent: 'heloise-rh' }
          ],
          completion: 75
        }),
        agents: JSON.stringify([
          { id: 'heloise-rh', name: 'Héloïse RH', role: 'A', load: 65, status: 'active' }
        ]),
        stats: JSON.stringify({
          docs_total: 5, docs_tested: 3, agents_assigned: 2, roadmap_progress: 60
        }),
        updated_at: '2025-09-08T10:00:00Z'
      }];

      mockSql.mockResolvedValueOnce(mockFolderData);

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-jwt-token'
        }
      });

      const response = await getFoldersHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe('coworking-q4');
      expect(data.title).toBe('Journée Coworking Q4');
      expect(data.vision).toHaveProperty('objectif');
      expect(data.context).toHaveProperty('completion', 75);
      expect(Array.isArray(data.agents)).toBe(true);
    });

    it('should return 404 for non-existent folder', async () => {
      mockSql.mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-jwt-token'
        }
      });

      const response = await getFoldersHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'non-existent' }
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('folder not found');
    });
  });

  describe('GET /api/folders/:id/documents', () => {
    it('should return paginated documents', async () => {
      const mockCountResult = [{ total: '5' }];
      const mockDocuments = [
        {
          id: 'doc.coworking.proc',
          title: 'Procédure Journée Coworking',
          type: 'procedure',
          owner: 'RH',
          status: 'pass',
          assigned_to: 'heloise-rh',
          raci_role: 'A',
          updated_at: '2025-09-08T10:00:00Z'
        }
      ];

      mockSql
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDocuments);

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/folders/coworking-q4/documents?page=1&limit=20',
        headers: {
          authorization: 'Bearer valid-jwt-token'
        }
      });

      const response = await getDocumentsHandler(req, { sub: 'test-user', role: 'viewer' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('page', 1);
      expect(data).toHaveProperty('limit', 20);
      expect(data).toHaveProperty('total', 5);
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe('POST /api/folders/:id/assign', () => {
    it('should assign agent to documents successfully', async () => {
      const mockFolder = [{ id: 'coworking-q4' }];
      const mockAgent = [{ id: 'heloise-rh' }];
      const mockFolderDoc = [{ folder_id: 'coworking-q4', document_id: 'doc.coworking.proc' }];

      mockSql
        .mockResolvedValueOnce(mockFolder)     // Check folder exists
        .mockResolvedValueOnce(mockAgent)     // Check agent exists
        .mockResolvedValueOnce(mockFolderDoc) // Check doc linked to folder
        .mockResolvedValueOnce([])            // Update assignment
        .mockResolvedValueOnce([]);           // Log activity

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer valid-jwt-token'
        },
        body: {
          agentId: 'heloise-rh',
          role: 'A',
          docIds: ['doc.coworking.proc']
        }
      });

      const response = await assignHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.folder_id).toBe('coworking-q4');
      expect(data.agent_id).toBe('heloise-rh');
      expect(data.role).toBe('A');
      expect(Array.isArray(data.assigned_docs)).toBe(true);
    });

    it('should validate RACI role correctly', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer valid-jwt-token'
        },
        body: {
          agentId: 'heloise-rh',
          role: 'X', // Invalid RACI role
          docIds: ['doc.coworking.proc']
        }
      });

      const response = await assignHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('validation error');
    });
  });

  describe('POST /api/folders/:id/context', () => {
    it('should add context note successfully', async () => {
      const mockFolder = [{ id: 'coworking-q4' }];
      const mockContextEntries = [{ total: '3', user_responses: '2' }];

      mockSql
        .mockResolvedValueOnce(mockFolder)         // Check folder exists
        .mockResolvedValueOnce([])                 // Insert context
        .mockResolvedValueOnce(mockContextEntries) // Get context stats
        .mockResolvedValueOnce([])                 // Update folder completion
        .mockResolvedValueOnce([]);                // Log activity

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer valid-jwt-token'
        },
        body: {
          type: 'user_note',
          content: 'Test note content'
        }
      });

      const response = await contextHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.folder_id).toBe('coworking-q4');
      expect(data.type).toBe('user_note');
      expect(data.content).toBe('Test note content');
      expect(data).toHaveProperty('context_id');
    });
  });

  describe('GET /api/folders/:id/roadmap', () => {
    it('should return roadmap with milestones', async () => {
      const mockFolder = [{ id: 'coworking-q4' }];
      const mockMilestones = [
        {
          id: 'm1_coworking',
          title: 'Salle réservée',
          date: '2025-09-15',
          status: 'done',
          dependencies: '[]'
        },
        {
          id: 'm2_coworking',
          title: 'Atelier coworking',
          date: '2025-09-22',
          status: 'pending',
          dependencies: '["m1_coworking"]'
        }
      ];

      mockSql
        .mockResolvedValueOnce(mockFolder)
        .mockResolvedValueOnce(mockMilestones);

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-jwt-token'
        }
      });

      const response = await roadmapHandler(req, { sub: 'test-user', role: 'viewer' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.folder_id).toBe('coworking-q4');
      expect(Array.isArray(data.milestones)).toBe(true);
      expect(data.milestones).toHaveLength(2);
      expect(data.progress).toBe(50); // 1 done out of 2 = 50%
      expect(Array.isArray(data.critical_path)).toBe(true);
    });
  });
});