import { Plus, Share2 } from "lucide-react";
import HiddenGemsHighlight from "./HiddenGemsHighlight";

export function RightSidebar() {
  return (
    <div className="flex flex-col gap-6">
      {/* Plan Actions */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-800 dark:to-violet-900 p-5 rounded-3xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 text-white transition-colors">
        <h3 className="font-bold text-lg mb-4 text-white">Planning a trip?</h3>
        <div className="flex flex-col gap-3">
          
          {/* Primary Button */}
          <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm dark:shadow-none">
            <Plus className="h-4 w-4" /> Create New Plan
          </button>
          
          {/* Secondary Button (Glassmorphism) */}
          <button className="flex items-center justify-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-md text-white py-3 rounded-2xl font-bold text-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all">
            <Share2 className="h-4 w-4" /> Share My Plan
          </button>
          
        </div>
      </div>

      <HiddenGemsHighlight />

    </div>
  );
}