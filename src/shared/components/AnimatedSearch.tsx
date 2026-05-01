import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  width?: number;
  placeholder?: string;
  onSearch?: (value: string) => void;
};

export default function AnimatedSearch({
  width = 240,
  placeholder = " Search for anything...",
  onSearch,
}: Props) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const isEmpty = !keyword.trim();

  const handleSearch = () => {
    if (isEmpty) return;

    if (onSearch) {
      onSearch(keyword);
    } else {
      navigate(`/search-results?keyword=${encodeURIComponent(keyword)}&tab=0`);
    }

    setOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center justify-end">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="icon"
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-2 rounded-full hover:bg-gray-200 transition text-slate-500 dark:text-blue-400"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.div
            key="search"
            initial={{ width: 40, opacity: 0, scale: 0.9 }}
            animate={{ width, opacity: 1, scale: 1 }}
            exit={{ width: 40, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex items-center bg-white shadow-sm dark:bg-slate-800 rounded-full px-3 py-1"
          >
            {/* INPUT */}
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder={placeholder}
              autoFocus
              className="flex-1 bg-transparent outline-none dark:text-white"
            />

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              disabled={isEmpty}
              className={`ml-2 p-2 rounded-full ${
                isEmpty
                  ? "text-gray-300 "
                  : "dark:text-blue-900 hover:bg-gray-100"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
