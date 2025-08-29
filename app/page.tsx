'use client';

import HeroLanding from "./landing/Hero";
import KPICards from "./landing/KPICards";
import WhyArka from "./landing/WhyArka";
import ConsoleSection from "./landing/ConsoleSection";
import TeamsSection from "./landing/TeamsSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";
import Topbar from "./landing/Topbar";
import { TOKENS } from "./landing/tokens";


export default function Page() {
  return (
    <div style={{ background: TOKENS.bgBody }} className="min-h-screen w-full">
      <Topbar />
      <main role="main" id="main" aria-label="Contenu principal">
        <HeroLanding />
        <KPICards />
        <WhyArka />
        <ConsoleSection />
        <TeamsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
