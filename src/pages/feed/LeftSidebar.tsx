import { TrendingUp } from "lucide-react";
import SearchComponent from "./SearchComponent";
import LiveRadar from "./LiveRadar";

export function LeftSidebar() {
  return (
    <div className="flex flex-col gap-10">

      <div className="px-2">
        <SearchComponent />
      </div>

      {/* <LiveRadar /> */}

      {/* Trending Topics */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-rose-500 dark:text-rose-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Trending Now</h3>
        </div>
        <div className="space-y-4">
          {['Dahab_Vibes', 'Siwa_Oasis', 'HikingEgypt'].map((tag) => (
            <div key={tag} className="cursor-pointer group">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">#{tag}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">1.2k adventures shared</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}