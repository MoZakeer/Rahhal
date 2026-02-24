import { MapPin, Sparkles, Users, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeaturesSection() {
  const navigate = useNavigate();
  const features: Feature[] = [
    {
      icon: <MapPin size={18} />,
      title: "Pick Your Destination",
      description:
        "Search for your dream location or browse trending spots. Not sure where to go? Let us surprise you.",
    },
    {
      icon: <Sparkles size={18} />,
      title: "Let AI Plan Your Route",
      description:
        "Our AI analyzes thousands of data points to build a personalized day-by-day itinerary just for you.",
    },
    {
      icon: <Users size={18} />,
      title: "Find Your Travel Buddies",
      description:
        "Post your trip to the community or invite friends. Manage expenses and chat in one place.",
    },
    {
      icon: <Share2 size={18} />,
      title: "Share Stories",
      description:
        "Document your adventures, share photos and tips, and inspire others to explore the world.",
    },
  ];

  return (
    <section className="py-24 ">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
        
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-4xl font-bold leading-snug text-[var(--color-primary-600)]">
            Everything You Need <br /> for Epic Adventures
          </h2>

          <p className="mt-6 text-[var(--color-gray-600)] max-w-md leading-relaxed">
            From AI-powered planning to real-time coordination,
            Rahhal has all the tools to make your travel dreams a reality.
          </p>

          <button className="mt-8 px-8 py-3 rounded-full 
            bg-[var(--color-primary-600)] 
            text-white 
            font-medium
            transition-all duration-300
            hover:bg-[var(--color-primary-700)]
            hover:scale-105
            active:scale-95"
             onClick={() => navigate("/login")}
            >
           
            Start Planning Now
          </button>
        </div>

        {/* RIGHT SIDE TIMELINE */}
        <div className="relative">
          
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 h-full w-[2px] bg-[var(--color-primary-200)]" />

          <div className="space-y-14">
            {features.map((feature, index) => (
              <div key={index} className="relative flex gap-6 items-start">
                
                {/* Icon Circle */}
                <div className="relative z-10 flex items-center justify-center 
                  w-8 h-8 rounded-full 
                  bg-[var(--color-primary-600)] 
                  text-white shadow-md">
                  {feature.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-primary-600)]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm text-[var(--color-gray-600)] max-w-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

