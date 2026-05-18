import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useLanguage } from "@/context/LanguageContext"; 
import { cn } from "@/lib/utils";

type Props = {
  placeholder?: string;
  onSearch?: (value: string) => void;
};

export default function AnimatedSearch({
  placeholder,
  onSearch,
}: Props) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const { suggestions, saveToHistory, clearAllHistory, deleteSpecificItem } = useSearchHistory(keyword);

  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    inputRef.current?.blur();
    saveToHistory(searchTerm);

    setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      } else {
        navigate(`/search-results?keyword=${encodeURIComponent(searchTerm)}&tab=0`);
      }
      setIsLoading(false);
      setOpen(false);
    }, 500);
  };

  const finalPlaceholder = placeholder || t("search.placeholder") || "Search...";

  return (
    <div ref={ref} className="relative flex items-center z-50" dir={isRtl ? "rtl" : "ltr"}>
      <AnimatePresence mode="wait">
        {!open && (
          <motion.button
            key="icon"
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition text-slate-500 dark:text-blue-400"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        )}

        {open && (
          <motion.div
            key="input-container"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative flex flex-col"
          >
            <form
              onSubmit={(e) => { e.preventDefault(); executeSearch(keyword); }}
              className="flex items-center gap-1 w-full h-10 bg-white dark:bg-slate-800 rounded-full px-2 py-1 shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <input
                ref={inputRef}
                autoFocus
                type="text"
                maxLength={100}
                enterKeyHint="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Escape") setOpen(false);
                }}
                disabled={isLoading}
                placeholder={finalPlaceholder}
                className={cn(
                  "flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400",
                  isRtl ? "pr-2 pl-1 text-right" : "pl-2 pr-1 text-left"
                )}
              />
              {keyword.trim() && !isLoading && (
                <button type="button" onClick={() => setKeyword("")} className="p-1 rounded-full text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="submit" disabled={!keyword.trim() || isLoading} className="shrink-0 p-1.5 text-blue-500">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>

            {suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50">
                {!keyword.trim() && (
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      {t("search.recentSearches")} 
                    </span>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearAllHistory} className="text-[10px] flex items-center gap-1 font-medium text-red-500">
                      <Trash2 className="w-3 h-3" /> {t("search.clearAll")}
                    </button>
                  </div>
                )}
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex px-1 group">
                      <div className="flex-1 flex items-start justify-between rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <button 
                          type="button" 
                          onMouseDown={(e) => e.preventDefault()} 
                          onClick={() => { setKeyword(suggestion); executeSearch(suggestion); }} 
                          className={cn(
                            "flex-1 px-3 py-2.5 flex items-start gap-2 text-gray-700 dark:text-gray-300 min-w-0",
                            isRtl ? "text-right flex-row" : "text-left flex-row-reverse"
                          )}
                        >
                          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className={cn(
                            "flex-1 whitespace-normal break-words leading-snug text-xs sm:text-sm",
                            isRtl ? "pl-2" : "pr-2"
                          )}>
                            {suggestion}
                          </span>
                        </button>
                        {!keyword.trim() && (
                          <button 
                            type="button" 
                            onMouseDown={(e) => e.preventDefault()} 
                            onClick={(e) => { e.stopPropagation(); deleteSpecificItem(suggestion); }} 
                            title={t("search.removeHistory") || "Remove"}
                            className={cn("p-2 text-gray-300 hover:text-red-500", isRtl ? "ml-1" : "mr-1")}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}