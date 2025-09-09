# 📑 Gouvernance des Gates — Arka

## 🎯 Finalité
Garantir une gouvernance **radicale, auditable et séquentielle** de tous les tickets et lots Arka, depuis l’idéation jusqu’au cut en production.

---

## 🔄 Ordre des Gates

1. **DoR (Definition of Ready)**  
   - Vérifie que le ticket est clair, complet, testable.  
   - AC, oracles et contrats API/UI définis.  
   - Responsables : **PMO** (structuration) + **AGP** (validation de cadrage).  

2. **AGP-PASS**  
   - Vérifie la **conformité produit** (sécurité, multi-clients, mémoire, UX minimale).  
   - Émission éventuelle d’**ADR** (Architecture Decision Record).  
   - Responsable : **AGP** (Architecte Gouvernance Produit).  

3. **Owner-PASS**  
   - Vérifie l’alignement stratégique et business.  
   - Arbitre en cas de conflit entre agents.  
   - Responsable : **Owner**.  

4. **QA-PASS**  
   - Vérifie la qualité technique et fonctionnelle (tests, perf, sécurité).  
   - Génère décision **QA/ARC PASS/FAIL**.  
   - Responsable : **QA/ARC**.  

5. **Owner-Release (Cut)**  
   - Gate final avant publication/production.  
   - Repose sur un **evidence pack 100% texte** (logs NDJSON, rapports MD, sha256sums).  
   - Responsable : **Owner**.  

---

## 📦 Principes Directeurs

- **Anti-sauts** : impossible de franchir un gate sans le précédent validé.  
- **Auditabilité** : chaque gate doit être justifié par des **évidences textuelles**.  
- **Traçabilité** : propagation de `X-Trace-Id` dans tous les artefacts.  
- **Responsabilités cloisonnées** :  
  - AGP = conformité produit et gouvernance.  
  - PMO = structuration backlog et testabilité.  
  - QA/ARC = qualité technique.  
  - Owner = arbitrage final et validation.  

---

## ✅ Résumé (Check-list)

- [ ] Ticket **DoR** complet (AC, oracles, contrats).  
- [ ] Validation **AGP-PASS** (conformité produit).  
- [ ] Validation **Owner-PASS** (vision + stratégie).  
- [ ] Validation **QA-PASS** (tests/perf/sécu).  
- [ ] Validation **Owner-Release** (evidence pack).  

