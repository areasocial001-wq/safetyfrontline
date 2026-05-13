import { Hero } from "@/components/Hero";
import { DemoCTA } from "@/components/DemoCTA";
import { Demo3DShowcase } from "@/components/Demo3DShowcase";
import { SpotTheHazardShowcase } from "@/components/SpotTheHazardShowcase";
import { ProblemSolution } from "@/components/ProblemSolution";
import { HowItWorks } from "@/components/HowItWorks";
import { Modules } from "@/components/Modules";
import { GamificationEvidence } from "@/components/GamificationEvidence";
import { Compliance } from "@/components/Compliance";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Safety Frontline | Formazione Sicurezza Gamificata"
        description="Formazione sicurezza sul lavoro gamificata per PMI. Conforme D.Lgs. 81/08 e Accordo Stato-Regioni 2025."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Safety Frontline",
          url: "https://www.safetyfrontline.com/",
          inLanguage: "it-IT",
        }}
      />
      <Hero />
      <DemoCTA />
      <Demo3DShowcase />
      <SpotTheHazardShowcase />
      <ProblemSolution />
      <HowItWorks />
      <Modules />
      <GamificationEvidence />
      <Compliance />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
