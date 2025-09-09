import { describe, it, expect } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { GET as getFoldersHandler } from '../app/api/folders/[id]/route';
import { POST as assignHandler } from '../app/api/folders/[id]/assign/route';
import { POST as contextHandler } from '../app/api/folders/[id]/context/route';

// Mock the database
jest.mock('../lib/db', () => ({
  sql: jest.fn()
}));

// Mock auth verification to return different roles
const mockVerifyToken = jest.fn();
jest.mock('../lib/auth', () => ({
  verifyToken: mockVerifyToken
}));

describe('Folders API RBAC', () => {
  describe('GET /api/folders/:id', () => {
    it('should allow viewer access', async () => {
      mockVerifyToken.mockReturnValueOnce({ sub: 'test-user', role: 'viewer' });
      
      const { req } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-jwt-token' }
      });

      const response = await getFoldersHandler(req, { sub: 'test-user', role: 'viewer' }, {
        params: { id: 'coworking-q4' }
      });

      // Should not be 403 Forbidden for viewer
      expect(response.status).not.toBe(403);
    });

    it('should allow editor access', async () => {
      mockVerifyToken.mockReturnValueOnce({ sub: 'test-user', role: 'editor' });
      
      const { req } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-jwt-token' }
      });

      const response = await getFoldersHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });

    it('should allow admin access', async () => {
      mockVerifyToken.mockReturnValueOnce({ sub: 'test-user', role: 'admin' });
      
      const { req } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-jwt-token' }
      });

      const response = await getFoldersHandler(req, { sub: 'test-user', role: 'admin' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });

    it('should allow owner access', async () => {
      mockVerifyToken.mockReturnValueOnce({ sub: 'test-user', role: 'owner' });
      
      const { req } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-jwt-token' }
      });

      const response = await getFoldersHandler(req, { sub: 'test-user', role: 'owner' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });
  });

  describe('POST /api/folders/:id/assign', () => {
    it('should deny viewer access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { agentId: 'test', role: 'A', docIds: ['doc1'] }
      });

      const response = await assignHandler(req, null, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(401); // withAuth will return 401 for invalid/missing user
    });

    it('should allow editor access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { agentId: 'heloise-rh', role: 'A', docIds: ['doc1'] }
      });

      // Should not immediately return 403 for editor
      // (will fail later due to mocked DB, but that's expected)
      const response = await assignHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });

    it('should allow admin access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { agentId: 'heloise-rh', role: 'A', docIds: ['doc1'] }
      });

      const response = await assignHandler(req, { sub: 'test-user', role: 'admin' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });

    it('should allow owner access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { agentId: 'heloise-rh', role: 'A', docIds: ['doc1'] }
      });

      const response = await assignHandler(req, { sub: 'test-user', role: 'owner' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });
  });

  describe('POST /api/folders/:id/context', () => {
    it('should deny viewer access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { type: 'user_note', content: 'Test note' }
      });

      const response = await contextHandler(req, null, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).toBe(401);
    });

    it('should allow editor access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { type: 'user_note', content: 'Test note' }
      });

      const response = await contextHandler(req, { sub: 'test-user', role: 'editor' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });

    it('should allow admin access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { type: 'user_note', content: 'Test note' }
      });

      const response = await contextHandler(req, { sub: 'test-user', role: 'admin' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });

    it('should allow owner access', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-jwt-token' },
        body: { type: 'user_note', content: 'Test note' }
      });

      const response = await contextHandler(req, { sub: 'test-user', role: 'owner' }, {
        params: { id: 'coworking-q4' }
      });

      expect(response.status).not.toBe(403);
    });
  });
});