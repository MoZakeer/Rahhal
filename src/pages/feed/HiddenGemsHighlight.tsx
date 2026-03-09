import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, Navigation2, Star } from "lucide-react";

const GEMS_DATA = [
  {
    id: 1,
    name: "Wadi El-Weshwash",
    location: "Nuweiba, Sinai",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654ca?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    description: "A hidden turquoise pool tucked between mountains."
  },
  {
    id: 2,
    name: "Salt Lakes",
    location: "Siwa Oasis",
    image: "https://images.unsplash.com/photo-1505058707965-09a4469a87e5?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    description: "Crystal clear salty water that makes you float effortlessly."
  },
  {
    id: 3,
    name: "Agiba Beach",
    location: "Marsa Matrouh",
    image: "https://images.unsplash.com/photo-1623150550608-f425890b0231?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    description: "A miraculous cliff-side beach with 7 shades of blue."
  }
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
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Hidden Gem Spotlight</span>
        </div>
        {/* مؤشر النقط (Dots) عشان المستخدم يعرف فيه كام واحدة */}
        <div className="flex gap-1">
          {GEMS_DATA.map((_, i) => (
            <div key={i} className={`h-1 w-3 rounded-full transition-all ${i === index ? 'bg-indigo-500 dark:bg-indigo-400 w-5' : 'bg-slate-200 dark:bg-slate-700'}`} />
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
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800";
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-white">{currentGem.rating}</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-1 text-indigo-300 dark:text-indigo-400 mb-1">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{currentGem.location}</span>
              </div>
              <h4 className="text-xl font-black text-white mb-2 leading-tight">{currentGem.name}</h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 mb-4 italic leading-relaxed">"{currentGem.description}"</p>

              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition-all active:scale-95 border border-transparent dark:border-slate-700/50">
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