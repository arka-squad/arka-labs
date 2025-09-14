/**
 * ARKA API ROUTER - Types TypeScript
 */

import { NextRequest, NextResponse } from 'next/server';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type RouteStrategy = 'dynamic' | 'query' | 'hybrid';

export interface RouteParams {
  path: Record<string, string>; // Path parameters like {id: "123"}
  query: Record<string, string>; // Query parameters
  body?: any;
  user?: any;
}

export type RouteHandler = (
  req: NextRequest, 
  params: RouteParams
) => Promise<NextResponse>;

export interface RouteDefinition {
  path: string;
  method: HttpMethod;
  strategies: {
    dynamic?: RouteHandler;
    query?: RouteHandler;
    hybrid?: RouteHandler;
  };
  auth?: string[];
  description?: string;
  version?: string;
  deprecated?: boolean;
  rateLimit?: number;
  cacheTTL?: number;
}

export interface RouterConfig {
  strategy: RouteStrategy;
  debug: boolean;
  fallback: boolean;
  monitoring: boolean;
}

export interface RouterStats {
  totalRoutes: number;
  strategies: Record<string, number>;
  uptime: number;
  requests: number;
  errors: number;
}

export interface RouteMeta {
  key: string;
  path: string;
  method: HttpMethod;
  strategies: string[];
  currentStrategy: RouteStrategy;
  description?: string;
  lastUsed?: Date;
  requestCount?: number;
  avgResponseTime?: number;
}

export interface RouterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memory: NodeJS.MemoryUsage;
  activeRoutes: number;
  errorRate: number;
  timestamp: string;
}