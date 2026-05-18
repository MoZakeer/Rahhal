import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, Loader2, Clock, Trash2 } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function SearchComponent() {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const [searchParams] = useSearchParams();
  const queryKeyword = searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(queryKeyword);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { suggestions, saveToHistory, clearAllHistory, deleteSpecificItem } = useSearchHistory(keyword);

  useEffect(() => {
    setKeyword(queryKeyword);
  }, [queryKeyword]);

  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    inputRef.current?.blur();
    saveToHistory(searchTerm);

    setTimeout(() => {
      navigate(`/search-results?keyword=${encodeURIComponent(searchTerm)}&tab=0`);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-2 relative" dir={isRtl ? "rtl" : "ltr"}>
      <form
        onSubmit={(e) => { e.preventDefault(); executeSearch(keyword); }}
        className={cn(
          "relative flex items-center w-full bg-white dark:bg-slate-900/90 rounded-full transition-all duration-300 ease-out border z-20",
          isFocused 
            ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500" 
            : "border-gray-200 dark:border-slate-700/80 shadow-sm hover:border-gray-300 dark:hover:border-slate-600"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          maxLength={100}
          enterKeyHint="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder={t("search.placeholder") || "Search for anything..."} 
          className={cn(
            "flex-1 min-w-0 py-3.5 bg-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 outline-none text-base w-full disabled:opacity-50 transition-colors",
            isRtl ? "pr-6 pl-2 text-right" : "pl-6 pr-2 text-left"
          )}
        />
        <div className={cn("flex items-center gap-1.5", isRtl ? "pl-1.5" : "pr-1.5")}>
          {!keyword.trim() || isLoading ? null : (
            <button 
              type="button" 
              onClick={() => setKeyword("")} 
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4 pointer-events-none" />
            </button>
          )}
          <button 
            type="submit" 
            disabled={!keyword.trim() || isLoading} 
            className={cn(
              "flex items-center justify-center p-2.5 rounded-full transition-all duration-200", 
              !keyword.trim() 
                ? "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500" 
                : "bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-90"
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
          {!keyword.trim() && (
            <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {t("search.recentSearches")}
              </span>
              <button 
                type="button" 
                onMouseDown={(e) => e.preventDefault()} 
                onClick={clearAllHistory} 
                className="text-xs flex items-center gap-1 font-medium text-red-500 hover:text-red-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t("search.clearAll")}
              </button>
            </div>
          )}
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex px-2 group">
                <div className="flex-1 flex items-start justify-between rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <button 
                    type="button" 
                    onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => { setKeyword(suggestion); executeSearch(suggestion); }} 
                    className={cn(
                      "flex-1 px-3 py-2.5 flex items-start gap-3 min-w-0 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400",
                      isRtl ? "text-right flex-row" : "text-left flex-row-reverse"
                    )}
                  >
                    <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0 mt-1 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                    <span className={cn(
                      "flex-1 whitespace-normal break-words leading-snug text-sm sm:text-base text-gray-700 dark:text-slate-200 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400",
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
                      className={cn(
                        "p-2 text-gray-300 hover:text-red-500 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all rounded-full self-center mt-1",
                        isRtl ? "ml-1" : "mr-1"
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}