# B28 - PLAN D'ACTION ULTRA-PRÉCIS
**Date création :** 14 septembre 2025 22:35 UTC
**Contexte :** Post-audit B28 révélant chaos architectural critique
**Objectif :** Nettoyage et stabilisation système Arka Labs
**Durée estimée :** 30 jours (3 phases)

---

## 🎯 ÉTAT ACTUEL CONFIRMÉ

### ✅ Ce qui FONCTIONNE (à préserver absolument)
- **TypeScript compilation** : 2.4s sans erreurs
- **Serveur dev** : Port 3006 opérationnel
- **RBAC sécurité** : Protection admin/manager/operator/viewer OK
- **19 pages React** : Interface cockpit fonctionnelle
- **78+ endpoints API** : Routes fonctionnelles
- **Migration UUID B27** : Complétée et stable

### 🔴 PROBLÈMES CRITIQUES IDENTIFIÉS

#### **CRITIQUE 1 : Schéma DB Corrompu (Priorité 1)**
**Localisation :** `db/schema_export.sql`
**Problème :** Contraintes PRIMARY KEY dupliquées
```sql
-- EXEMPLE du problème
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_pkey PRIMARY KEY (agent_id);
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_pkey PRIMARY KEY (agent_id); -- DUPLIQUÉ !
```
**Impact :** BLOQUANT pour déploiement production

#### **CRITIQUE 2 : Chaos Organisation Racine (Priorité 2)**
**Problème :** 40+ fichiers temporaires/obsolètes à la racine
**Exemples identifiés :**
- `scripts/fix-*.js` (nombreux scripts temporaires)
- `scripts/check-*.js` (scripts de debug temporaires)
- Fichiers `route-old.ts`, `route-complex.ts`

#### **CRITIQUE 3 : Architecture API Triple (Priorité 3)**
**Problème :** 3 systèmes API parallèles créant confusion
- Routes directes Next.js (78+ endpoints)
- API Lite B26 (15/42 routes migrées)
- API Router (fallback Vercel)

---

## 📋 PLAN D'ACTION PHASE PAR PHASE

### **PHASE 1 - STABILISATION CRITIQUE (7 jours)**

#### **Jour 1-2 : Correction Schéma DB**
**ACTION PRÉCISE :**
1. Créer DB de test isolée
2. Analyser contraintes dupliquées avec script SQL
3. Générer script de correction propre
4. Tester migration sur DB test
5. Valider intégrité données

**COMMANDES EXACTES :**
```bash
# Créer script analyse contraintes
DATABASE_URL="[TEST_DB]" node scripts/analyze-db-constraints.js

# Générer script correction
DATABASE_URL="[TEST_DB]" node scripts/fix-duplicate-constraints.js

# Valider migration
DATABASE_URL="[TEST_DB]" node scripts/validate-db-integrity.js
```

**VALIDATION :**
- [ ] Script de correction généré sans erreur
- [ ] Test migration réussie sur DB test
- [ ] Toutes contraintes uniques et cohérentes
- [ ] Données préservées intégralement

#### **Jour 3-4 : Nettoyage Racine Critique**
**ACTION PRÉCISE :**
1. Lister TOUS fichiers racine et `scripts/`
2. Catégoriser : KEEP/ARCHIVE/DELETE
3. Archiver fichiers temporaires vers `archive/temp/`
4. Supprimer scripts obsolètes confirmés

**FICHIERS À TRAITER (liste exacte) :**
```
scripts/fix-*.js → ARCHIVE (sauf fix actifs)
scripts/check-*.js → ARCHIVE
scripts/migrate-*.js → ARCHIVE (post-B27)
scripts/rollback-*.js → ARCHIVE
**/route-old.ts → DELETE
**/route-complex.ts → DELETE
```

**VALIDATION :**
- [ ] Racine contient <20 fichiers essentiels
- [ ] Aucun script temporaire en racine
- [ ] Archive organisée par date/contexte
- [ ] Build et tests passent toujours

#### **Jour 5-7 : Test Intégration**
**ACTION PRÉCISE :**
1. Tests complets post-nettoyage
2. Validation endpoints critiques
3. Check performance (aucune régression)
4. Documentation changements

**TESTS OBLIGATOIRES :**
```bash
npm run typecheck         # TypeScript OK
npm run test             # Tests unitaires OK (si existants)
curl endpoints critiques # API fonctionnelle
```

### **PHASE 2 - RÉORGANISATION (14 jours)**

#### **Jour 8-14 : Consolidation Architecture API**
**DÉCISION STRATÉGIQUE :** Migrer vers API Lite unique
**ACTION PRÉCISE :**
1. Mapper les 78+ endpoints existants
2. Migrer 27 routes restantes vers API Lite
3. Déprécier routes directes progressivement
4. Tester chaque migration

**VALIDATION :**
- [ ] 42/42 routes dans API Lite
- [ ] Aucune route directe critique restante
- [ ] Performance équivalente ou meilleure

#### **Jour 15-21 : Réorganisation Dossiers**
**STRUCTURE CIBLE :**
```
lib/
├── api-lite/          # API centralisée unique
├── auth/              # Authentification RBAC
├── database/          # Connexions et schemas
├── utils/             # Utilitaires partagés
└── types/             # Types TypeScript

scripts/
├── production/        # Scripts déploiement
├── development/       # Scripts dev uniquement
└── archive/           # Anciens scripts
```

### **PHASE 3 - OPTIMISATION (9 jours)**

#### **Jour 22-27 : Tests et Performance**
**ACTION PRÉCISE :**
1. Suite tests complète
2. Monitoring performance
3. Optimisation requêtes lentes
4. Load testing basique

#### **Jour 28-30 : Documentation et Finalisation**
**LIVRABLES FINAUX :**
1. Architecture documentée complètement
2. Guide maintenance pour agents futurs
3. Scripts de monitoring automatisés
4. Checklist déploiement production

---

## 🚨 RÈGLES CRITIQUES POUR AGENTS FUTURS

### **AVANT TOUTE INTERVENTION :**
1. **Lire ce document INTÉGRALEMENT**
2. **Vérifier état actuel** vs attendu dans chaque phase
3. **Sauvegarder DB** avant modifications critiques
4. **Tester sur environnement isolé** avant production

### **VALIDATION OBLIGATOIRE APRÈS CHAQUE PHASE :**
```bash
# Check compilation
npm run typecheck

# Check serveur
PORT=3006 npm run dev

# Check endpoints critiques
curl -H "Authorization: Bearer [TOKEN]" http://localhost:3006/api/admin/projects
curl http://localhost:3006/api/health

# Check DB (si modifiée)
DATABASE_URL="[DB]" node scripts/validate-db-integrity.js
```

### **COMMANDES INTERDITES (DANGER) :**
```bash
# JAMAIS sur DB production directement
DROP TABLE *
ALTER TABLE ... DROP CONSTRAINT *

# JAMAIS supprimer sans archive
rm -rf lib/
rm -rf app/
```

---

## 📞 CONTACT ET ESCALADE

**En cas de blocage CRITIQUE :**
1. **STOP toute action**
2. **Documenter l'état exact** dans ce fichier
3. **Sauvegarder contexte** pour handover
4. **Demander expertise architecte technique**

**Fichiers SACRÉS (ne jamais modifier sans validation) :**
- `package.json`
- `next.config.js`
- `tsconfig.json`
- `db/migrations/b27_*` (migration UUID)
- `lib/auth/rbac.ts` (sécurité)

---

## 📊 MÉTRIQUES DE SUCCÈS

### **Phase 1 - Stabilisation :**
- [ ] 0 erreur TypeScript
- [ ] Schéma DB 100% cohérent
- [ ] <20 fichiers racine
- [ ] Temps build <3s

### **Phase 2 - Réorganisation :**
- [ ] API unique (42/42 routes)
- [ ] Structure dossiers standard
- [ ] 0 code legacy restant

### **Phase 3 - Optimisation :**
- [ ] Documentation 100% à jour
- [ ] Tests automatisés fonctionnels
- [ ] Performance baseline documentée
- [ ] Plan maintenance établi

---

**RÉSUMÉ EXÉCUTIF :** Système fonctionnel mais architecture chaotique nécessitant intervention chirurgicale 30 jours pour éviter effondrement dans 6 mois.

**PROCHAINE ACTION IMMÉDIATE :** Correction schéma DB (Phase 1, Jour 1)