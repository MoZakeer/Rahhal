import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, Navigation2, Star } from "lucide-react";

const GEMS_DATA = [
  {
    id: 1,
    name: "Wadi El-Weshwash",
    location: "Nuweiba, South Sinai",
    mapsLink: "https://www.google.com/maps?q=29.0806,34.6956",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    description:
      "Hidden turquoise freshwater pools surrounded by dramatic Sinai mountains. Requires a short hike through rocky terrain.",
  },
  {
    id: 2,
    name: "Siwa Salt Lakes",
    location: "Siwa Oasis, Matrouh",
    mapsLink: "https://www.google.com/maps?q=29.2032,25.5197",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
    rating: 4.8,
    description:
      "Extremely salty lakes where you float effortlessly in surreal desert surroundings.",
  },
  {
    id: 3,
    name: "Agiba Beach",
    location: "Marsa Matrouh",
    mapsLink: "https://www.google.com/maps?q=31.4096,27.0825",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Agiba_beach_in_Egypt_2024.jpg",
    rating: 4.7,
    description:
      "A hidden Mediterranean cove framed by limestone cliffs and crystal-clear water.",
  },

  {
    id: 4,
    name: "White Desert National Park",
    location: "Farafra Oasis, New Valley",
    mapsLink: "https://www.google.com/maps?q=27.3333,28.2167",
    image:
      "https://images.unsplash.com/photo-1589395937772-fb8c7c3c3b2a?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    description:
      "Otherworldly chalk formations shaped by wind, creating a surreal desert landscape.",
  },

  {
    id: 5,
    name: "Wadi El Rayan Waterfalls",
    location: "Fayoum Governorate",
    mapsLink: "https://www.google.com/maps?q=29.2747,30.4165",
    image:
      "https://images.unsplash.com/photo-1601758123927-1969a0d9b3d5?auto=format&fit=crop&q=80&w=1200",
    rating: 4.8,
    description:
      "Egypt’s only waterfalls, connecting two desert lakes inside a protected reserve.",
  },

  {
    id: 6,
    name: "The Blue Hole",
    location: "Dahab, South Sinai",
    mapsLink: "https://www.google.com/maps?q=28.5733,34.5364",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    description:
      "One of the world’s most famous diving spots with extreme depth and coral reefs.",
  },

  {
    id: 7,
    name: "Colored Canyon",
    location: "Nuweiba, South Sinai",
    mapsLink: "https://www.google.com/maps?q=29.5020,34.6833",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200",
    rating: 4.7,
    description:
      "Narrow sandstone canyon with naturally layered red, gold, and purple rock walls.",
  },

  {
    id: 8,
    name: "Crystal Mountain",
    location: "Between Bahariya & Farafra Oases",
    mapsLink: "https://www.google.com/maps?q=27.3330,28.5500",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1200",
    rating: 4.6,
    description:
      "A natural quartz ridge that sparkles under sunlight in the middle of the desert.",
  },
];
export default function HiddenGemsHighlight() {
  const [index, setIndex] = useState(0);

  // --- التايمر اللي بيخليها "تقلب لوحدها" ---
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % GEMS_DATA.length);
    }, 5000); // هتقلب كل 5 ثواني

    return () => clearInterval(timer); // تنظيف التايمر عند قفل الصفحة
  }, []);

  const currentGem = GEMS_DATA[index];

  return (
    <div className="px-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Hidden Gem Spotlight
          </span>
        </div>
        {/* مؤشر النقط (Dots) عشان المستخدم يعرف فيه كام واحدة */}
        <div className="flex gap-1">
          {GEMS_DATA.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-3 rounded-full transition-all ${i === index ? "bg-blue-500 w-5" : "bg-slate-200 dark:bg-slate-700"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative h-80 w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/50 dark:shadow-slate-900/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGem.id} // الـ Key مهم جداً عشان الأنميشن يشتغل
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* الصورة الخلفية مع Fallback */}
            <img
              src={currentGem.image}
              alt={currentGem.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget;
                target.src =
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-white">
                {currentGem.rating}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-1 text-indigo-300 dark:text-blue-400 mb-1">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {currentGem.location}
                </span>
              </div>
              <h4 className="text-xl font-black text-white mb-2 leading-tight">
                {currentGem.name}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 mb-4 italic leading-relaxed">
                "{currentGem.description}"
              </p>

              <button
                onClick={() => window.open(currentGem.mapsLink, "_blank")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-blue-800 hover:text-white dark:hover:text-white transition-all active:scale-95 border border-transparent dark:border-slate-700/50"
              >
                <Navigation2 className="h-3 w-3 fill-current" />
                Teleport Now
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
