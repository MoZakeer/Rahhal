import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggleButton() {
  const context = useContext(ThemeContext);

  if (!context) return null;

  const { theme, toggleTheme } = context;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold w-full cursor-pointer transition-colors
      text-slate-600 hover:bg-blue-50 hover:text-blue-600
      dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" /> Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" /> Dark Mode
        </>
      )}
    </button>
  );
}
