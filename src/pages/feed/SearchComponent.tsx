import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

export default function SearchComponent() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="relative w-full max-w-md mx-auto group">
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[2rem] blur-xl z-0"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          backgroundColor: isFocused ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.6)"
        }}
        className={`relative z-10 flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md ${isFocused
            ? "border-indigo-500 shadow-2xl shadow-indigo-100"
            : "border-slate-200/60 shadow-sm group-hover:border-slate-300"
          }`}
      >
        {/* أيقونة البحث مع انيميشن دوران خفيف */}
        <motion.div
          animate={{ rotate: isFocused ? 90 : 0, color: isFocused ? "#6366f1" : "#94a3b8" }}
        >
          <Search className="h-5 w-5" />
        </motion.div>

        {/* Input البحث */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search destinations, explorers..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
        />

        {/* زرار المسح (Clear) */}
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setQuery("")}
            className="p-1 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-2xl z-50 overflow-hidden"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              Recent Discoveries
            </p>
            <div className="space-y-1">
              {['Dahab_Vibes', 'Siwa Oasis', 'Red Sea Diving'].map((item) => (
                <button key={item} className="w-full flex items-center gap-3 p-2.5 hover:bg-indigo-50 rounded-xl transition-colors text-left group/item">
                  <div className="h-2 w-2 rounded-full bg-slate-200 group-hover/item:bg-indigo-400 transition-colors" />
                  <span className="text-sm font-semibold text-slate-600 group-hover/item:text-indigo-600">
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}