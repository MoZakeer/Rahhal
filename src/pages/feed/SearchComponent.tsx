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
            /* قللنا opacity الجريديانت في الدارك مود عشان ميبقاش مزعج للعين */
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-blue-500/10 rounded-[2rem] blur-xl z-0"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          /* شلت ال backgroundColor من هنا عشان مانبوظش الدارك مود، وهنعتمد على Tailwind */
        }}
        className={`relative z-10 flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md 
          ${isFocused
            ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/20"
            : "bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-600"
          }`}
      >
        <motion.div
          animate={{ rotate: isFocused ? 90 : 0, color: isFocused ? "#6366f1" : "currentColor" }}
          className="text-slate-400 dark:text-slate-500"
        >
          <Search className="h-5 w-5" />
        </motion.div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search destinations, explorers..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setQuery("")}
            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
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
            className="absolute top-full left-0 right-0 mt-3 p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl dark:shadow-slate-900/50 z-50 overflow-hidden"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-2">
              Recent Discoveries
            </p>
            <div className="space-y-1">
              {['Dahab_Vibes', 'Siwa Oasis', 'Red Sea Diving'].map((item) => (
                <button key={item} className="w-full flex items-center gap-3 p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors text-left group/item">
                  <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover/item:bg-indigo-400 dark:group-hover/item:bg-indigo-500 transition-colors" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400">
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