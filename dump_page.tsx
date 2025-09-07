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
            title: 'PrÃ©parer un onboarding RH',
            command: '/kit onboarding',
            status: 'A_FAIRE',
            resultTitle: 'Onboarding',
            resultDesc:
              'Le Conseiller RH prÃ©pare le kit, le Coach organisation vÃ©rifie les Ã©tapes, le QualitÃ© valide la conformitÃ©. RÃ©sultat : checklist complÃ¨te Jâ€‘7 â†’ J+7.',
          },
          {
            title: 'Mettre une procÃ©dure Ã  jour',
            command: '/assign Proc-23',
            status: 'A_FAIRE',
            resultTitle: 'ProcÃ©dure mise Ã  jour',
            resultDesc:
              'Le Coach prend la tÃ¢che, le QualitÃ© revoit la cohÃ©rence, le Support la publie. RÃ©sultat : procÃ©dure Ã  jour, validÃ©e.',
          },
          {
            title: 'Signaler un risque conformitÃ©',
            command: '/gate conformitÃ©',
            status: 'A_RISQUE',
            resultTitle: 'ConformitÃ©',
            resultDesc:
              'Le QualitÃ© Ã©value, lâ€™Analyste propose des correctifs, le Coach les intÃ¨gre. RÃ©sultat : livrable marquÃ© Ã  risque avec actions proposÃ©es.',
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


