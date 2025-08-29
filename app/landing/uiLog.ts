
"use client";


export type UiLogFields = Record<string, any>;

export function uiLog(event: string, fields: UiLogFields = {}) {
  try {
    const payload = {
      ts: new Date().toISOString(),
      route: typeof window !== "undefined" ? window.location.pathname : "/",
      status: "ok",
      duration_ms:
        typeof performance !== "undefined" && performance.now
          ? Math.round(performance.now())
          : 0,
      cat: "ui",
      event,
      ...fields,
    };
    // Contrat M2/M3 : console.info(JSON.stringify({...}))
    // (traçabilité simple, exploitable par la CI visuelle)
    console.info(JSON.stringify(payload));
  } catch {
    // no-op : on ne casse jamais l'UI pour un log
  }
}
