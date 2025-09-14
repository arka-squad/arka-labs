/**
 * ARKA SQUADS API - HOTFIX Session Expired
 *
 * Utilise handlers directs pour contourner le problème d'auth
 * du router centralisé qui cause "Session expired or invalid"
 */

import {
  handleSquadsGET,
  handleSquadsPOST,
  handleSquadsPUT,
  handleSquadsDELETE
} from './direct-route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handlers directs sans auth complexe - HOTFIX
export const GET = handleSquadsGET;
export const POST = handleSquadsPOST;
export const PUT = handleSquadsPUT;
export const DELETE = handleSquadsDELETE;