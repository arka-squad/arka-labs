// Router Core - B28 Phase 2
import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>;
type Middleware = (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse | void>;

export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  middleware?: Middleware[];
}

export class Router {
  private routes: Route[] = [];

  get(path: string, handler: RouteHandler, middleware?: Middleware[]) {
    this.routes.push({ method: 'GET', path, handler, middleware });
    return this;
  }

  post(path: string, handler: RouteHandler, middleware?: Middleware[]) {
    this.routes.push({ method: 'POST', path, handler, middleware });
    return this;
  }

  put(path: string, handler: RouteHandler, middleware?: Middleware[]) {
    this.routes.push({ method: 'PUT', path, handler, middleware });
    return this;
  }

  delete(path: string, handler: RouteHandler, middleware?: Middleware[]) {
    this.routes.push({ method: 'DELETE', path, handler, middleware });
    return this;
  }

  patch(path: string, handler: RouteHandler, middleware?: Middleware[]) {
    this.routes.push({ method: 'PATCH', path, handler, middleware });
    return this;
  }

  async handle(req: NextRequest, context: { params: Record<string, string> }): Promise<NextResponse> {
    const { method } = req;
    const pathname = new URL(req.url).pathname.replace('/api', '');

    // Trouver la route correspondante
    const route = this.routes.find(r =>
      r.method === method && this.matchPath(r.path, pathname)
    );

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    try {
      // Appliquer middlewares
      if (route.middleware) {
        for (const middleware of route.middleware) {
          const result = await middleware(req, context);
          if (result) return result; // Middleware a retourné une réponse
        }
      }

      // Exécuter handler
      return await route.handler(req, context);
    } catch (error) {
      console.error('Route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  private matchPath(routePath: string, requestPath: string): boolean {
    // Simple path matching - peut être amélioré
    const routeRegex = routePath.replace(/:[^/]+/g, '([^/]+)');
    const regex = new RegExp(`^${routeRegex}$`);
    return regex.test(requestPath);
  }

  getRoutes() {
    return this.routes;
  }
}

export function createRouter(): Router {
  return new Router();
}
