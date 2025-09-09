gates:
  order: ["DoR", "AGP-PASS", "Owner-PASS", "QA-PASS", "Owner-Release"]
  rules:
    - gate: DoR
      owner: PMO
      evidence: [definition_of_ready, oracles, contrats]
    - gate: AGP-PASS
      owner: AGP
      evidence: [ADR, AGP-Review]
    - gate: Owner-PASS
      owner: Owner
      evidence: [alignment_notes]
    - gate: QA-PASS
      owner: QA
      evidence: [qa_arc_report]
    - gate: Owner-Release
      owner: Owner
      evidence: [evidence_pack, sha256sums]

principes:
  - "Anti-sauts : impossible de franchir un gate sans le précédent validé"
  - "Auditabilité : chaque gate doit être justifié par des évidences textuelles"
  - "Traçabilité : propagation de X-Trace-Id dans tous les artefacts"
  - "Responsabilités cloisonnées : AGP (conformité), PMO (backlog/testabilité), QA (qualité), Owner (arbitrage final)"