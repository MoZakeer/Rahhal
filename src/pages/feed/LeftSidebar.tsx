import { TrendingUp } from "lucide-react";
import SearchComponent from "@/features/search/components/SearchComponent";
// import LiveRadar from "./LiveRadar";

export function LeftSidebar() {
  return (
    <div className="flex flex-col gap-5">
 {/* Header Text */}
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 dark:text-slate-100 ">
  Stories Beyond Borders
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
  Every journey has a story—discover yours here.
        </p>
      </div>
      <div >
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