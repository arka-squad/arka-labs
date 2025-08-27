# Console UI – Spec d'intégration

_Date: 2025-08-27_

## 1. Contexte
Interface de gestion R1 consommant l'API backend.

## 2. Stack technique
Next.js 14, React 18, TypeScript.

## 3. Design system
Basé sur composants internes et tokens CSS.

## 4. Responsive
Layout mobile/desktop testé via flexbox et media queries.

## 5. Accessibilité
Respect des rôles ARIA et navigation clavier.

## 6. Pages
Console principale, documents, observabilité.

## 7. Composants
Button, Card, Dropzone, DocListItem, ChatMessage, PromptBlock, ObsChart.

## 8. Props & États
Voir [props.json](docs/props.json) pour le contrat de propriétés.

## 9. Tests
Tests unitaires via Jest/React Testing Library.

## 10. CI/CD
`npm test` exécuté en CI, build Vercel.

## 11. Monitoring
Logs client envoyés via console.info(JSON).

## 12. Références
Stories et tokens documentés dans Storybook.
