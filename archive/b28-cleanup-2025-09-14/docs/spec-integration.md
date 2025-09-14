# 🧩 Projet : Landing — Hero Arka (TCK-M2-UX-10)

## 1. Contexte & Objectifs
- **Source de la maquette** : Preview interne + assets fournis (PNG/SVG via Vercel).
- **Objectifs principaux** : Refonte du **hero** de la landing avec logo, tagline claire et visuel produit (Arka.box + Arka.board). Ajout d’une topbar navigable.
- **Public cible / contexte d’usage** : B2B, desktop first (responsive mobile requis).
- **Contraintes globales** : Perf légère (image unique optimisée), accessibilité AA, SEO (H1 clair), cohérence tokens R1 (dark UI, CTA gradient).

---

## 2. Technologies & Environnement
- **Stack front-end** : React + TailwindCSS (compatible shadcn/ui, lucide-react).
- **Outils & Versions** : Node 18+, Vite/Next.js (au choix projet), Tailwind 3+.
- **Convention de nommage** : tokens simples JS + utilitaires Tailwind.
- **Gestionnaire de paquets** : npm (ou pnpm/yarn selon repo).
- **Scripts utiles** :
  - `npm run dev` : démarre l’environnement de dev
  - `npm run build` : build production
  - `npm test` : (optionnel) tests unitaires

---

## 3. Design System & Ressources
- **Couleurs**
  - Fond body : `#0C1319`
  - Anneaux/bordures douces : `ring-slate-700/60` (≈ rgb(51 65 85 / .6))
  - Texte principal : `#E5E7EB` (tailwind slate-200/300)
  - **CTA gradient** : `#FAB652 → #F25636 → #E0026D`
  - **Texte gradient** : `amber-400 → rose-500 → fuchsia-600` (to-r)
- **Typographies** : Sans-serif (Inter/Poppins système).  
  - H1 ligne 1 ~ 36px (desktop) ; ligne 2 ~ 34px gradient (légèrement plus petit que maquette initiale)  
  - Body : 16px
- **Spacings** : `px-6` conteneur, `gap-12` hero grid, `mt-16` KPI row.
- **Radius/Shadows**
  - CTA / Chips / KPI : `rounded-full` (CTA) & `rounded-xl` (KPI)
  - Ombre visuel : `drop-shadow-[0_25px_60px_rgba(0,0,0,0.55)]`
- **Icônes/Images**
  - Logo blanc : `https://arka-liard.vercel.app/assets/logo/arka-logo-blanc.svg`
  - Logo radiant : `https://arka-liard.vercel.app/assets/logo/arka-logo-blanc-radient.svg`
  - Visuel hero (Arka.box + board) : `https://arka-liard.vercel.app/assets/hero/arkabox-board.png`
- **Tokens globaux**
  ```ts
  const TOKENS = {
    bgBody: "#0C1319",
    ringSoftClass: "ring-slate-700/60",
    gradCTA: "linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)",
    gradTextClass: "bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600",
  };
  ```

## 4. Responsive & Breakpoints
sm/md/lg/xl : breakpoints Tailwind par défaut.


Comportements


Topbar : menu visible md+, stack vertical en mobile (logo puis CTA menu dans une future itération si burger).


Hero : grid 12, left (logo + titre + CTA), right (visuel). En mobile : empilement vertical.


KPI : grille 2 cols sur mobile → 4 cols en md+.



## 5. Accessibilité & SEO
ARIA roles : header, nav (liens), images avec alt.


Contraste : texte clair sur #0C1319 (≥ 4.5:1 OK).


Navigation clavier : focus visible via anneaux ring.


SEO :


H1 = “la puissance des grandes équipes, / entre les mains des petites”


Title/Page gérés par l’app ; hero ne doit pas dupliquer le H1 ailleurs.


Liens CTA descriptifs.


## 6. Liste des Pages / Vues
Page : Landing


URL : / ou /landing


Composants : Topbar, HeroLanding


Données nécessaires : aucune (statique)


Logique spécifique : liens d’ancre / routes internes


## 7. Composants détaillés
### 7.1 <Topbar />
Rôle : barre de navigation (logo + menu + actions)


États : hover liens, focus anneaux, responsive md+


HTML indicatif

 

<header>
  <img alt="Arka logo" />
  <nav>
    <a>Fonctionnalités</a>
    <a>Sécurité</a>
    <a>Tarification</a>
    <button>Se connecter</button>
    <button>Ouvrir la console</button>
  </nav>
</header>


### 7.2 <HeroLanding />
Rôle : zone d’accroche principale (logo, tagline, visuel produit, KPI)


Props : n/a (statique)


États : CTA hover/focus, anneaux KPI hover


HTML indicatif

 

<section>
  <Topbar />
  <h1>
    la <strong>puissance</strong> des grandes équipes,
    <span class="gradient-text">entre les mains des petites</span>
  </h1>
  <p>Console multi-agents …</p>
  <div class="cta-row">…</div>
  <img alt="Arka.box et Arka.board" />
  <div class="kpi-grid">TTFT | RTT | % erreurs | Vélocité</div>
</section>


Styles / Responsivité : cf. code ; grille 12, KPIs 2→4 cols.


Animations : ombre douce sur le visuel ; pas d’animations obligatoires.


## 8. Interactions Globales & Flux
Navigation : liens topbar vers pages dédiées ; CTA vers route console/bêta.


Auth : bouton “Se connecter” (hook à brancher plus tard).


États globaux : aucun requis.


Services externes : aucun (assets statiques).



## 9. Scénarios / Historique
US : “En tant que visiteur, je comprends le produit d’un coup d’œil et j’accède à la bêta.”


Edge cases : pas d’assets → alt lisibles ; petit viewport → stack propre.



## 10. Tests & Validation
Unitaires : n/a


E2E : présence CTA + liens, rendu responsive


Manuels : vérifier contrastes, focus, clavier, mobile/desktop.



## 11. Tâches & Priorités
Tâche
Priorité
Estim.
Intégrer Topbar
Haute
2h
Intégrer Hero + KPIs
Haute
3h
Responsive & QA a11y
Haute
1h


## 12. Ressources / Annexes
Logos :
 https://arka-liard.vercel.app/assets/logo/arka-logo-blanc.svg
 https://arka-liard.vercel.app/assets/logo/arka-logo-blanc-radient.svg


Visuel Hero :
 https://arka-liard.vercel.app/assets/hero/arkabox-board.png



🔔 Règles de gouvernance
Fichier obligatoire à la racine du module (spec-integration.md).


Validé QA dans DoD Intégration (FAIL si absent/incomplet).


Versionné comme tout livrable (YYYY-MM-DD).


---

Si tu veux, je peux aussi te générer une **variante mobile-only** (taille de police, stacking strak) ou un **snippet Next.js** pour `app/(marketing)/page.tsx`.

