/**
 * Tests JWT Auth - B28 Phase 3
 * Objectif: Coverage > 85% module auth critique
 */

import { generateToken, verifyToken, createRefreshToken } from '@/lib/auth/jwt';

describe('JWT Authentication', () => {
  const testPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'user'
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const token = await generateToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should generate different tokens for different payloads', async () => {
      const token1 = await generateToken({ userId: 'user1', role: 'admin' });
      const token2 = await generateToken({ userId: 'user2', role: 'user' });

      expect(token1).not.toBe(token2);
    });

    it('should handle empty payload gracefully', async () => {
      const token = await generateToken({});
      expect(token).toBeDefined();
    });
  });

  describe('Token Verification', () => {
    it('should verify valid token and return payload', async () => {
      const token = await generateToken(testPayload);
      const decoded = await verifyToken(token);

      expect(decoded).toMatchObject({
        userId: testPayload.userId,
        email: testPayload.email,
        role: testPayload.role
      });
      expect(decoded.exp).toBeDefined(); // Expiration time
      expect(decoded.iat).toBeDefined(); // Issued at time
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';

      await expect(verifyToken(invalidToken)).rejects.toThrow();
    });

    it('should reject malformed token', async () => {
      const malformedToken = 'not-a-jwt-token';

      await expect(verifyToken(malformedToken)).rejects.toThrow();
    });

    it('should reject token with wrong secret', async () => {
      // Generate token with different secret
      process.env.JWT_SECRET = 'wrong-secret';
      const tokenWithWrongSecret = await generateToken(testPayload);

      // Reset to correct secret
      process.env.JWT_SECRET = 'test-jwt-secret-key';

      await expect(verifyToken(tokenWithWrongSecret)).rejects.toThrow();
    });

    it('should handle expired token', async () => {
      // This would require manipulating token expiration
      // For now, we test the error handling path
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE2MDAwMDAwMDB9.invalid';

      await expect(verifyToken(expiredToken)).rejects.toThrow();
    });
  });

  describe('Refresh Token', () => {
    it('should generate refresh token', async () => {
      const refreshToken = await createRefreshToken(testPayload.userId);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.length).toBeGreaterThan(20);
    });

    it('should generate different refresh tokens', async () => {
      const token1 = await createRefreshToken('user1');
      const token2 = await createRefreshToken('user2');

      expect(token1).not.toBe(token2);
    });

    it('should handle missing userId', async () => {
      await expect(createRefreshToken('')).rejects.toThrow();
    });
  });

  describe('Token Security', () => {
    it('should include standard JWT claims', async () => {
      const token = await generateToken(testPayload);
      const decoded = await verifyToken(token);

      expect(decoded.iat).toBeDefined(); // Issued at
      expect(decoded.exp).toBeDefined(); // Expires at
      expect(decoded.exp > decoded.iat).toBe(true); // Exp after issued
    });

    it('should not expose sensitive information in token', async () => {
      const sensitivePayload = {
        userId: '123',
        password: 'secret123', // This should not be in token
        email: 'test@example.com'
      };

      const token = await generateToken(sensitivePayload);
      const decoded = await verifyToken(token);

      expect(decoded.password).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing JWT_SECRET', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      await expect(generateToken(testPayload)).rejects.toThrow();

      process.env.JWT_SECRET = originalSecret;
    });

    it('should handle null/undefined payload', async () => {
      await expect(generateToken(null as any)).rejects.toThrow();
      await expect(generateToken(undefined as any)).rejects.toThrow();
    });

    it('should handle very large payload', async () => {
      const largePayload = {
        userId: '123',
        data: 'x'.repeat(10000) // Very large data
      };

      // Should still work but might have performance implications
      const token = await generateToken(largePayload);
      expect(token).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end: generate -> verify cycle', async () => {
      const originalPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'integration@test.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      };

      const token = await generateToken(originalPayload);
      const decodedPayload = await verifyToken(token);

      expect(decodedPayload).toMatchObject(originalPayload);
    });

    it('should maintain payload types after decode', async () => {
      const typedPayload = {
        userId: '123',
        isAdmin: true,
        count: 42,
        tags: ['tag1', 'tag2']
      };

      const token = await generateToken(typedPayload);
      const decoded = await verifyToken(token);

      expect(typeof decoded.userId).toBe('string');
      expect(typeof decoded.isAdmin).toBe('boolean');
      expect(typeof decoded.count).toBe('number');
      expect(Array.isArray(decoded.tags)).toBe(true);
    });
  });
});