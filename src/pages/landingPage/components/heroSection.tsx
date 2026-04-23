import React from "react";
import useAuthNavigation from "../hooks/useAuthNavigation";

const Hero: React.FC = () => {
  const handleNavigation = useAuthNavigation();

  return (
    <section
      className="relative h-[85vh] flex items-center px-10 text-white"
      style={{
        backgroundImage: "url('/heroSection.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-w-2xl ">
        <div className="relative max-w-2xl mt-20">
       <div className="h-[1px] w-8 bg-[var(--color-primary-500)]" />
    <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary-400)] font-bold">
      AI-Powered Travel Planning
    </span>
  </div>

  <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-white leading-[0.8]">
    Rahhal<span className="text-[var(--color-primary-500)]">.</span>
  </h1>
        <h2 className="mt-2 text-5xl font-bold leading-tight">
          Discover Your Next{" "}
          <span className="text-[var(--color-primary-500)]">Adventure</span>
        </h2>

        <p className="mt-2 text-gray-200">
          Connect with travelers, plan amazing trips with AI assistance, and
          find your perfect travel companions.
        </p>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => handleNavigation("/create-trip")}
            className="px-6 py-3 rounded-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] hover:scale-105
            active:scale-95 transition-all duration-300"
          >
            Plan Your Trip
          </button>

          <button
            onClick={() => handleNavigation("/explore")}
            className="px-6 py-3 rounded-full border border-white hover:bg-white hover:text-black hover:scale-105
            active:scale-95 transition-all duration-300"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
