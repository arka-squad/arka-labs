# Scripts

## Réseau

### `scripts/net/selfcheck.js`
Vérifie la résolution DNS et l'établissement d'une connexion TLS :443 pour les hôtes définis.

```bash
node scripts/net/selfcheck.js
HOSTS="example.com api.foo" node scripts/net/selfcheck.js
```

Enregistre les résultats au format NDJSON dans `logs/ui_network.json`.

### `scripts/net/smoke.sh`
Effectue une requête HTTP directe sans proxy et inspecte la réponse.

```bash
bash scripts/net/smoke.sh
HOST=https://www.arka-team.app bash scripts/net/smoke.sh
```

Ajoute dans `logs/ui_network.json` le code HTTP obtenu et la détection éventuelle d'un `CONNECT 403`.
