import { Plus, Sparkles } from "lucide-react";
import HiddenGemsHighlight from "./HiddenGemsHighlight";
import { useNavigate } from "react-router-dom";

export function RightSidebar() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      {/* Plan Actions */}
      <div className="bg-gradient-to-br  from-blue-950 to-blue-700 p-5 rounded-3xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 text-white transition-colors">
        <h3 className="font-bold text-lg mb-4 text-white">Planning a trip?</h3>
        <div className="flex flex-col gap-3">
          {/* Primary Button */}
          <button
            onClick={() => navigate("/create-trip")}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-200 py-3 rounded-2xl font-bold text-sm  dark:hover:bg-slate-400 hover:text-blue-900 hover:bg-slate-50 transition-all active:scale-95 shadow-sm dark:shadow-none"
          >
            <Plus className="h-4 w-4" /> Create New Plan
          </button>

          {/* Secondary Button (Glassmorphism) */}
          <button
            onClick={() => navigate("/ai-planner")}
            className="flex items-center justify-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-md text-white py-3 rounded-2xl font-bold text-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all"
          >
            Generate with Ai <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      <HiddenGemsHighlight />
    </div>
  );
}
