# Substrat mémoire — Squelette (B10)

## But
Poser des interfaces KV/DB/Blob et garantir l'absence d'écriture en production. Fournir un endpoint de santé.

## Interfaces
- `packages/memory/kv.ts`: `KeyValueStore` (impl. InMemoryKV)
- `packages/memory/db.ts`: `DocumentDB` (impl. MockDocumentDB + SEED vide)
- `packages/memory/blob.ts`: `BlobStore` (impl. InMemoryBlob, no‑write en prod)
- `packages/memory/repo.ts`: `MemoryRepo` (agrège et applique `MEM_WRITE_ENABLED`)

## Flags
- `MEM_WRITE_ENABLED=true` active les écritures (dev/preview uniquement). En prod: toujours désactivé.

## Endpoints
- `GET /api/memory/health` → `{ kv:"ok", db:"ok", blob:"ok", write_enabled:boolean }`

## Tests (Given/When/Then)
- Given prod When `MemoryRepo.save()` Then no write (log `memory.save.skipped`).
- Given dev When `kv.set/get` Then valeurs conformes, pas d'exception.

## Evidences
- Logs NDJSON (stdout) pour `memory.save.skipped` lors des appels en prod.

