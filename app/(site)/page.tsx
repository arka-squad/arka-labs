import TopbarLanding from './_components/TopbarLanding';
import Hero from './_components/Hero';
import KPIStrip from './_components/KPIStrip';
import EnClair from './_components/EnClair';
import AgentsSlider from './_components/AgentsSlider';
import BetaSignup from './_components/BetaSignup';
import Examples from './_components/Examples';
import SectionFonctionnalites from './_components/SectionFonctionnalites';
import WorkspaceSlider from './_components/WorkspaceSlider';
import SectionPreuve from './_components/SectionPreuve';
import Audience from './_components/Audience';
import Footer from './_components/Footer';

export default function MarketingLanding() {
  return (
    <main className="min-h-screen">
      <TopbarLanding sticky />
      <Hero />
      <KPIStrip />
      <EnClair />
      <AgentsSlider />
      <Examples
        items={[
          {
            title: 'Préparer un onboarding RH',
            command: '/kit onboarding',
            status: 'A_FAIRE',
            resultTitle: 'Onboarding',
            resultDesc:
              'Le Conseiller RH prépare le kit, le Coach organisation vérifie les étapes, le Qualité valide la conformité. Résultat : checklist complète J‑7 → J+7.',
          },
          {
            title: 'Mettre une procédure à jour',
            command: '/assign Proc-23',
            status: 'A_FAIRE',
            resultTitle: 'Procédure mise à jour',
            resultDesc:
              'Le Coach prend la tâche, le Qualité revoit la cohérence, le Support la publie. Résultat : procédure à jour, validée.',
          },
          {
            title: 'Signaler un risque conformité',
            command: '/gate conformité',
            status: 'A_RISQUE',
            resultTitle: 'Conformité',
            resultDesc:
              'Le Qualité évalue, l’Analyste propose des correctifs, le Coach les intègre. Résultat : livrable marqué à risque avec actions proposées.',
          },
        ]}
      />
      <SectionFonctionnalites />
      <WorkspaceSlider />
      <SectionPreuve />
      <Audience />
      <BetaSignup />

      {/* Anchors required by header; for v1, #how and #pricing point to #features or placeholders as per spec */}
      <section id="features" className="sr-only" aria-hidden>
        Features placeholder (redirigÃ© via nav)
      </section>

      <Footer />
    </main>
  );
}

