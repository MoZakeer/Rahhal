import HeroSection from "./components/heroSection";
import FeaturesSection from "./components/featureSection";
import CTAsection from "./components/CTAsection";
// import TravelStoriesSection from "./components/travelStoriesSection";
import Navbar from '../../shared/components/navbar';
import Footer from '../../shared/components/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-gray-0)] text-[var(--color-gray-900)]">

      <Navbar />
      <HeroSection />

      <FeaturesSection />
      {/* <TravelStoriesSection /> */}
      <CTAsection />

      <Footer />
    </div>
  );
}