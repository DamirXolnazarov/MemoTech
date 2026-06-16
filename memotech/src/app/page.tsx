import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialProof } from "@/components/sections/SocialProof";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { VisionSection } from "@/components/sections/VisionSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/sections/PricingSection";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <SearchSection />
      <VisionSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
