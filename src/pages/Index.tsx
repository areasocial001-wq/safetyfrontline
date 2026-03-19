import { Hero } from "@/components/Hero";
import { Demo3DShowcase } from "@/components/Demo3DShowcase";
import { ProblemSolution } from "@/components/ProblemSolution";
import { HowItWorks } from "@/components/HowItWorks";
import { Modules } from "@/components/Modules";
import { GamificationEvidence } from "@/components/GamificationEvidence";
import { Compliance } from "@/components/Compliance";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Demo3DShowcase />
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
