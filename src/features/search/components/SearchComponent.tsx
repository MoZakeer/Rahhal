import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SearchComponent() {
  usePageTitle("Search");
  
  const [searchParams] = useSearchParams();
  const queryKeyword = searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(queryKeyword);
  const navigate = useNavigate();

  useEffect(() => {
    setKeyword(queryKeyword);
  }, [queryKeyword]);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/search-results?keyword=${encodeURIComponent(keyword)}&tab=0`);
  };

  const isEmpty = !keyword.trim();

  return (
    <div className="w-full max-w-md mx-auto ">
      <div className="relative">
        <input
          type="text"
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") setKeyword("");
          }}
          placeholder="Search for anything..."
          className="
            w-full pl-4 pr-12 py-3 rounded-3xl
            bg-white text-black placeholder-gray-400
            border border-gray-300
            shadow-sm
            outline-none
            transition-colors duration-200 dark:bg-slate-900 dark:text-white
          "
        />

        <button
          onClick={handleSearch}
          disabled={isEmpty}
          aria-label="Search"
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            p-2.5 rounded-full
            flex items-center justify-center cursor-pointer
            ${
              isEmpty
                ? " text-gray-300 cursor-not-allowed"
                : " text-blue-900 active:bg-gray-100"
            }
            transition-colors duration-200
          `}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}