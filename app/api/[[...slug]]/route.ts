// Catch-all API route - B28 Phase 2
// Redirige TOUTES les requêtes API vers src/api
import { apiHandler } from '@/src/api';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function POST(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function PUT(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function DELETE(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function PATCH(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

// Métadonnées pour Next.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
