import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export async function GET(request: NextRequest) {
  try {
    // Créer un token admin de demo
    const adminPayload = {
      sub: 'admin@arka.com',
      email: 'admin@arka.com', 
      role: 'admin',
      name: 'Admin Demo',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expire dans 24h
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(adminPayload, JWT_SECRET);

    return NextResponse.json({
      token,
      user: {
        id: 'admin@arka.com',
        email: 'admin@arka.com',
        role: 'admin', 
        name: 'Admin Demo'
      },
      expires_in: 24 * 60 * 60,
      message: 'Token admin de demo généré avec succès'
    });

  } catch (error) {
    console.error('Erreur génération token admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du token admin' },
      { status: 500 }
    );
  }
}