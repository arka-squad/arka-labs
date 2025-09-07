import TopbarLanding from './_components/TopbarLanding';
import Hero from './_components/Hero';
import KPIStrip from './_components/KPIStrip';
import Audience from './_components/Audience';
import Footer from './_components/Footer';
import EnClair from './_components/EnClair';
import AgentsSlider from './_components/AgentsSlider';
import SectionAgents from './_components/SectionAgents';
import SectionExemples from './_components/SectionExemples';
import SectionFonctionnalites from './_components/SectionFonctionnalites';
import WorkspaceSlider from './_components/WorkspaceSlider';
import SectionPreuve from './_components/SectionPreuve';

export default function MarketingLanding() {
  return (
    <main className="min-h-screen">
      <TopbarLanding sticky />
      <Hero />
      <KPIStrip />
      <EnClair />
      <AgentsSlider />
      <SectionAgents />
      <SectionExemples />
      <SectionFonctionnalites />
      <WorkspaceSlider />
      <SectionPreuve />
      <Audience />

      {/* Anchors required by header; for v1, #how and #pricing point to #features or placeholders as per spec */}
      <section id="features" className="sr-only" aria-hidden>
        Features placeholder (redirigé via nav)
      </section>

      <Footer />
    </main>
  );
}
