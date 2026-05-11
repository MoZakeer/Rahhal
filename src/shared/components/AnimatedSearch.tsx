import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  placeholder?: string;
  onSearch?: (value: string) => void;
};

export default function AnimatedSearch({
  placeholder = "Search...",
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
      navigate(
        `/search-results?keyword=${encodeURIComponent(keyword)}&tab=0`
      );
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="flex items-center">
      <AnimatePresence mode="wait">

        {/* ICON STATE */}
        {!open && (
          <motion.button
            key="icon"
            onClick={() => setOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="
              p-2
              rounded-full
              hover:bg-gray-200
              dark:hover:bg-slate-800
              transition
              text-slate-500
              dark:text-blue-400
            "
          >
            <Search className="w-5 h-5" />
          </motion.button>
        )}

        {/* INPUT STATE */}
        {open && (
          <motion.div
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
              flex items-center gap-1
              h-10
              bg-white
              dark:bg-slate-800
              rounded-full
              px-2 py-1
              shadow-sm
              overflow-hidden
              border border-gray-200
              dark:border-slate-700
            "
          >
            {/* INPUT */}
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder={placeholder}
              className="
                flex-1
                min-w-0
                bg-transparent
                outline-none
                text-sm
                pl-1
                dark:text-white
                placeholder:text-gray-400
              "
            />

            {/* RIGHT SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              disabled={isEmpty}
              className={`
                shrink-0
                p-2
                rounded-full
                transition
                flex items-center justify-center
                ${
                  isEmpty
                    ? "text-gray-300"
                    : "text-blue-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                }
              `}
            >
              <Search className="w-5 h-5 shrink-0" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}