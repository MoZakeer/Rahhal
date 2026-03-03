// components/SearchComponent.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SearchComponent() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/search-results?keyword=${encodeURIComponent(keyword)}&tab=0`);
  };

  const isEmpty = !keyword.trim();

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        {/* Input Field */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for anything..."
          className="
            w-full pl-4 pr-12 py-3 rounded-3xl
            bg-white text-black placeholder-gray-400
            border border-gray-300
            shadow-sm
            outline-none
            transition-colors duration-200
          "
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isEmpty}
          aria-label="Search"
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            p-2.5 rounded-full
            flex items-center justify-center cursor-pointer
            ${isEmpty
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900 active:bg-gray-800"
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