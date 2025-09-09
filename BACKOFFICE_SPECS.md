# 🏢 ARKA BACKOFFICE - SPÉCIFICATIONS FONCTIONNELLES COMPLÈTES

## 📋 Vue d'Ensemble

**URL d'accès :** `/backoffice/`  
**Architecture :** Next.js App Router avec intégration cockpit (Leftbar + ChatDock)  
**Design System :** CSS Variables console theme (`var(--fg)`, `var(--surface)`, etc.)  
**Layout :** Full page sans scroll body, scrollbars invisibles dans les éléments  

---

## 🔷 SECTION SQUAD - Gestion des Équipes d'Agents

### **Navigation & Interface**
- **Header :** `🔷 SQUAD - CRÉATION & ÉDITION`
- **Sélection :** Dropdown des squads existantes + Bouton `+ Créer Squad`
- **Modes :** Création / Édition conditionnels

### **Fonctionnalités CRUD**

#### ✅ **CRÉER une Squad**
```typescript
interface NewSquad {
  name: string;           // * Requis - ex: "Squad RH Alpha"
  domain: string;         // * Requis - ex: "RH", "Tech", "Marketing"  
  visibility: string;     // "Organisation" | "Privée" | "Publique"
  description: string;    // Optionnel
}
```

#### ✅ **LIRE/ÉDITER une Squad**
- **Informations générales :** Nom, domaine, visibilité
- **Statut visuel :** Active/Inactive avec badges colorés
- **Actions :** Activer/Désactiver, Supprimer

#### ✅ **Documents de Contexte (Admin Arka)**
- **Liste :** Documents partagés par toutes les squads
- **États :** Actif/Inactif avec checkboxes
- **Actions :** + Ajouter, Éditer, Supprimer
- **Types :** Mission, Périmètre, Rôle, Squelette

#### ✅ **Agents de la Squad**
- **Assignation :** Liste des agents affectés
- **Actions :** + Ajouter agent, Désactiver, Supprimer
- **Vue d'ensemble :** Nom agent, rôle, statut

#### ✅ **Instructions Rapides (Mini-Prompt)**
- **Zone de saisie :** Textarea pour instructions courtes (1-3 phrases)
- **Historique :** Suivi des instructions envoyées
- **Action :** Bouton "Envoyer à la squad"

#### ✅ **Panneau Statistiques**
- Agents actifs, Instructions envoyées, Projets assignés
- Documents contexte, Statut squad
- **Activité récente :** Timeline des actions
- **Actions rapides :** Raccourcis vers fonctions courantes

---

## 👤 SECTION AGENTS - Gestion des Agents IA

### **Navigation & Interface**
- **Header :** `👤 AGENTS - CRÉATION & ÉDITION`
- **Sélection :** Dropdown agents + Bouton `+ Créer Agent`
- **Chat de test :** Interface de test en temps réel

### **Fonctionnalités CRUD**

#### ✅ **CRÉER un Agent**
```typescript
interface NewAgent {
  name: string;           // * Requis - ex: "Héloïse"
  role: string;           // * Requis - ex: "Assistant RH"
  squad: string;          // Optionnel - Squad assignée
  status: string;         // "active" | "inactive" | "maintenance"
  prompt: string;         // Prompt spécifique IA
  temperature: number;    // 0.0-2.0 (défaut: 0.7)
  max_tokens: number;     // Défaut: 2048
}
```

#### ✅ **LIRE/ÉDITER un Agent**
- **Informations de base :** Nom, rôle, squad, statut
- **Configuration IA :** Prompt personnalisé, température, max tokens
- **Statut visuel :** Badges colorés selon état

#### ✅ **Documents Contexte Spécifiques**
- **Types :** Personnalité, Processus, Template
- **Gestion :** + Ajouter, Activer/Désactiver, Éditer, Supprimer

#### ✅ **Chat de Test en Édition**
- **Interface :** Zone de messages avec historique
- **Test en temps réel :** Saisie + bouton Envoyer
- **Simulation :** Réponses mockées avec streaming
- **Actions :** Vider chat, réinitialiser

#### ✅ **Panneau Statistiques**
- Messages traités, Temps réponse moyen, Taux satisfaction
- Projets actifs, **Activité récente**
- **Actions rapides :** Configuration, test, analytics

---

## 📋 SECTION PROJETS - Gestion & Assignation

### **Navigation & Interface**
- **Header :** `📋 PROJETS - GESTION & ASSIGNATION`
- **Sélection :** Dropdown projets + Bouton `+ Créer Projet`

### **Fonctionnalités CRUD**

#### ✅ **CRÉER un Projet**
```typescript
interface NewProject {
  name: string;           // * Requis - ex: "Journée Coworking Q4"
  client: string;         // * Requis - Sélection parmi clients existants
  status: string;         // "active" | "paused" | "completed" | "cancelled"
  priority: string;       // "low" | "medium" | "high" | "urgent"
  budget: string;         // ex: "15 000€"
  deadline: string;       // Date limite (date picker)
  description: string;    // Objectifs, livrables
}
```

#### ✅ **LIRE/ÉDITER un Projet**
- **Informations générales :** Tous les champs modifiables
- **Badges visuels :** Statut + priorité avec couleurs

#### ✅ **Gestion des Squads Assignées**
- **Liste :** Squads actuellement assignées
- **Actions :** + Assigner Squad, Retirer, Voir détail
- **Disponibilité :** Boutons squads libres
- **Calcul automatique :** Nombre total d'agents mobilisés

#### ✅ **Documents Client par Projet**
- **Upload/Gestion :** + Upload Document
- **États :** Actif/Inactif par document
- **Types :** Planning, Technique, Brief, Budget, Logistique
- **Actions :** Télécharger, Éditer, Supprimer

#### ✅ **Instructions Projet**
- **Zone globale :** Instructions pour toutes les squads assignées
- **Historique :** Suivi des instructions envoyées
- **Action :** "Envoyer aux squads"

#### ✅ **Timeline & Statistiques**
- **Métriques temps réel :** Squads, agents, documents, progression
- **Timeline :** Historique complet du projet
- **Budget :** Suivi utilisé vs estimé
- **Actions rapides :** Raccourcis fonctions courantes

---

## 🏢 SECTION CLIENTS - Gestion & Contact

### **Navigation & Interface**
- **Header :** `🏢 CLIENTS - GESTION & CONTACT`
- **Sélection :** Dropdown clients + Bouton `+ Nouveau Client`

### **Fonctionnalités CRUD**

#### ✅ **CRÉER un Client**
```typescript
interface NewClient {
  name: string;           // * Requis - ex: "TechStart Inc"
  sector: string;         // Secteur d'activité (dropdown prédéfini)
  contact_person: string; // * Requis - Contact principal
  email: string;          // Email contact
  phone: string;          // Téléphone
  status: string;         // "active" | "inactive" | "prospect"
}
```

**Secteurs prédéfinis :**
- Technologie, Services B2B, Créatif & Design
- Banque & Finance, Environnement, Santé
- Éducation, E-commerce, Autre

#### ✅ **LIRE/ÉDITER un Client**
- **Fiche complète :** Tous les champs modifiables
- **Statut visuel :** Badges colorés

#### ✅ **Projets du Client**
- **Liste automatique :** Projets associés au client
- **Actions :** + Créer Projet, Voir, Éditer
- **Informations :** Statut, budget par projet

#### ✅ **Statistiques Client**
- **Calculs automatiques :**
  - Projets actifs/terminés
  - Budget total (somme de tous les projets)
  - Secteur d'activité
- **Actions contact :** Email, Appel, Projet, Export

---

## 📊 SECTION ANALYTICS - Métriques & Rapports

### **Interface**
- **Header :** `📊 Analytics`
- **État :** En cours de développement...

### **Fonctionnalités Prévues**
- **Dashboard métriques :** KPIs globaux
- **Rapports détaillés :** Par squad, agent, projet, client
- **Visualisations :** Graphiques temps réel
- **Export données :** CSV, PDF, Excel

---

## 🎨 ARCHITECTURE TECHNIQUE

### **Structure Frontend**
```
/app/backoffice/
├── layout.tsx          # Layout avec design system
├── page.tsx            # Page principale avec sections
└── styles/
    └── scrollbar.css   # Scrollbars invisibles
```

### **Components Utilisés**
- **Leftbar :** Navigation sidebar existante
- **ChatDock :** Chat intégré
- **Topbar :** Header avec rôle utilisateur

### **Design System**
```css
/* Variables CSS utilisées */
--fg          /* Texte principal */
--fgdim       /* Texte secondaire */
--bg          /* Arrière-plan */
--surface     /* Cartes/panneaux */
--border      /* Bordures */
--primary     /* Action principale */
--success     /* Succès/actif */
--warn        /* Attention/moyen */
--danger      /* Erreur/urgent */
--accent      /* Accent/spécial */
--muted       /* Désactivé */
```

### **États & Interactions**
- **Modes conditionnels :** Création vs Édition
- **Validation :** Champs requis avec alerts
- **Feedback visuel :** Loading, success, error states
- **Responsive :** Grid 12 colonnes adaptatif

---

## 📊 DONNÉES MOCK INTÉGRÉES

### **Squads (3 exemples)**
```typescript
mockSquads = [
  { id: 1, name: "Squad RH Alpha", domain: "RH", status: "active", agents_count: 5 },
  { id: 2, name: "Squad Tech Core", domain: "Tech", status: "active", agents_count: 8 },
  { id: 3, name: "Squad Marketing Beta", domain: "Marketing", status: "inactive", agents_count: 3 }
]
```

### **Agents (3 exemples)**
```typescript
mockAgents = [
  { id: 1, name: "Héloïse", role: "Assistant RH", status: "active", squad: "Squad RH Alpha" },
  { id: 2, name: "AGP", role: "Analyste Tech", status: "active", squad: "Squad Tech Core" },
  { id: 3, name: "Marketing Pro", role: "Content Manager", status: "inactive", squad: "Squad Marketing Beta" }
]
```

### **Projets (4 exemples)**
```typescript
mockProjects = [
  {
    id: 1, name: "Journée Coworking Q4", client: "TechStart Inc",
    status: "active", priority: "high", budget: "15 000€",
    assigned_squads: [1], client_documents: [...]
  },
  // + Migration Cloud Azure, Campagne Brand Awareness, Audit Sécurité IT
]
```

### **Clients (5 exemples)**
```typescript
mockClients = [
  { id: 1, name: "TechStart Inc", sector: "Technologie", contact_person: "Marie Dubois" },
  // + Enterprise Corp, Creative Studio, SecureBank, GreenTech Solutions
]
```

---

## 🚀 ROADMAP DÉVELOPPEMENT

### **Phase 1 - Backend API** 
- [ ] Endpoints CRUD pour Squads
- [ ] Endpoints CRUD pour Agents  
- [ ] Endpoints CRUD pour Projets
- [ ] Endpoints CRUD pour Clients
- [ ] Gestion des documents/uploads

### **Phase 2 - Intégration Données**
- [ ] Remplacement des données mock
- [ ] Connexion API REST/GraphQL
- [ ] Gestion des erreurs
- [ ] Loading states

### **Phase 3 - Fonctionnalités Avancées**
- [ ] Instructions réelles aux squads
- [ ] Chat de test fonctionnel
- [ ] Upload/gestion documents
- [ ] Notifications temps réel

### **Phase 4 - Analytics & Rapports**
- [ ] Dashboard métriques
- [ ] Graphiques temps réel  
- [ ] Export données
- [ ] Alertes automatiques

### **Phase 5 - Optimisations**
- [ ] Performance/caching
- [ ] SEO/accessibilité
- [ ] Tests unitaires/e2e
- [ ] Documentation technique

---

## 🔐 SÉCURITÉ & PERMISSIONS

### **Contrôle d'Accès**
- **Rôles supportés :** viewer, operator, owner, admin
- **Restrictions :** Gestion squads réservée admin/owner
- **Auth :** JWT token validation via middleware

### **Validations Frontend**
- **Champs requis :** Validation avant soumission
- **Formats :** Email, téléphone, dates
- **Limites :** Longueur texte, taille fichiers

---

## 📱 RESPONSIVE & UX

### **Mobile First**
- **Breakpoints :** sm, md, lg responsive
- **Navigation :** Leftbar adaptative
- **Forms :** Layout adaptatif colonnes

### **Accessibilité**
- **ARIA labels :** Navigation, buttons, forms
- **Keyboard :** Focus visible, navigation clavier
- **Screen readers :** Structure sémantique

---

**Version :** 1.0.0  
**Dernière mise à jour :** 9 septembre 2024  
**URL de test :** `http://localhost:3004/backoffice`