import { NextRequest, NextResponse } from 'next/server';

export type Block = {
  id: number;
  titre: string;
  valeur: string;
  declencheur: string;
  versioned: boolean;
};

let blocks: Block[] = [];

export async function GET() {
  return NextResponse.json(blocks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const block: Block = {
    id: Date.now(),
    titre: body.titre ?? 'Nouveau',
    valeur: body.valeur ?? '',
    declencheur: body.declencheur ?? '',
    versioned: body.versioned ?? false,
  };
  blocks.push(block);
  return NextResponse.json(block, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  blocks = blocks.map((b) => (b.id === body.id ? { ...b, ...body } : b));
  const updated = blocks.find((b) => b.id === body.id);
  return NextResponse.json(updated);
}
