Voici une **proposition de découpage en composants + stories (Storybook)** pour couvrir les tickets **TCK-M2-UX-02 → 06** en cohérence avec le backlog【506†BacklogComplet_Arka_R1-M1-M2-M3-validé.pdf】 et les responsabilités de l’agent UX【505†AGENT#4-UX_UI-Graphiste-Intégrateur.pdf】.

---

# 📂 design-system/components/

### 1. `ChatThread.tsx` (TCK-M2-UX-02)
- **Description** : Thread de chat persisté avec rôles (user / agent / system).
- **Props** : `messages[]`, `onSend(message)`.
- **États** : envoi → streaming SSE → rendu final.
- **Storybook** :
  - `Default` (messages initiaux)
  - `Streaming` (effet typing)
  - `Erreur` (message avec statut error)

---

### 2. `DocUploadPanel.tsx` (TCK-M2-UX-03)
- **Description** : UI upload + gestion fichiers liés à un agent.
- **Props** : `docs[]`, `onUpload(files)`, `onDelete(id)`.
- **États** : vide, upload en cours, liste avec tags.
- **Storybook** :
  - `Empty` (aucun document)
  - `WithDocs` (3 fichiers uploadés)
  - `ErrorState` (échec upload)

---

### 3. `PromptBuilder.tsx` (TCK-M2-UX-04)
- **Description** : MVP Builder avec blocs (titre / valeur / déclencheur).
- **Props** : `blocs[]`, `onAdd()`, `onRemove(id)`.
- **États** : vide, 1 bloc, multiple blocs.
- **Storybook** :
  - `Empty` (aucun bloc)
  - `OneBloc`
  - `Multiple`

---

### 4. `ObservabilityDashboard.tsx` (TCK-M2-UX-06)
- **Description** : MVP Observabilité affichant 3 KPIs (TTFT, RTT, % erreurs).
- **Props** : `metrics {ttft, rtt, err}`.
- **États** : valeurs normales, seuil dépassé, aucun data.
- **Storybook** :
  - `Default` (680 ms, 1200 ms, 5 %)
  - `Critical` (> 2s, > 2s, > 20 %)
  - `Empty`

---

### 5. `ObsTableLotM1.tsx` (TCK-M2-UX-06 complément)
- **Description** : Tableau des objectifs M1 par axe / KPI / objectif.
- **Props** : `data[]`.
- **Storybook** :
  - `Default` (les 6 lignes conformes au backlog)

---

# 📂 design-system/stories/
- `ChatThread.stories.tsx` → `TCK-M2-UX-02`
- `DocUploadPanel.stories.tsx` → `TCK-M2-UX-03`
- `PromptBuilder.stories.tsx` → `TCK-M2-UX-04`
- `ObservabilityDashboard.stories.tsx` → `TCK-M2-UX-06`
- `ObsTableLotM1.stories.tsx` → `TCK-M2-UX-06`

---

✅ Chaque composant est **isolé**, **accessible (ARIA roles, labels)**, et **testable par snapshot** comme exigé【505†AGENT#4-UX_UI-Graphiste-Intégrateur.pdf】.

👉 Veux-tu que je te génère directement les fichiers `stories.tsx` (format Storybook) prêts à être poussés dans `/stories/` ?
