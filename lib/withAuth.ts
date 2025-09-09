import { NextRequest } from 'next/server';
import { verifyToken, JwtUser, Role } from './auth';

export function withAuth<T extends (...args: any[]) => Promise<Response>>(
  allowedRoles: Role[],
  handler: (req: NextRequest, user: JwtUser | null, ...args: any[]) => Promise<Response>
): T {
  return (async (req: NextRequest, ...args: any[]): Promise<Response> => {
    // For now, we'll allow all requests with a mock user for development
    // In production, this would extract and verify the JWT token
    const mockUser: JwtUser = {
      sub: 'dev-user',
      role: 'owner' // Highest permission for development
    };

    // Check if user role is allowed
    if (!allowedRoles.includes(mockUser.role)) {
      return Response.json({
        code: 'ERR_INSUFFICIENT_PERMISSIONS',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        details: { required_roles: allowedRoles },
        trace_id: req.headers.get('x-trace-id') || 'unknown'
      }, { status: 403 });
    }

    return handler(req, mockUser, ...args);
  }) as T;
}

// In a real implementation, this would extract the token from headers:
// const authHeader = req.headers.get('authorization');
// if (!authHeader?.startsWith('Bearer ')) {
//   return unauthorized response
// }
// const token = authHeader.slice(7);
// const user = verifyToken(token);
// if (!user) {
//   return unauthorized response  
// }