import HeroSection from "./components/heroSection"
import FeaturesSection from "./components/featureSection"
import CTAsection from "./components/CTAsection"
import TravelStoriesSection from "./components/travelStoriesSection"
import Navbar from '../../shared/components/navbar';
import Footer from '../../shared/components/footer';
export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-gray-0)] text-[var(--color-gray-900)]">

      <Navbar />
      <HeroSection />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturesSection />
        <TravelStoriesSection />
        <CTAsection />
      </div>

      <Footer />
    </div>

  );
}
