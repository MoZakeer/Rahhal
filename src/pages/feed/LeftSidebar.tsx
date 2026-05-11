import SearchComponent from "@/features/search/components/SearchComponent";
import TrendingNow from "./TrendingNow";
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
      <div>
        <SearchComponent />
      </div>

      {/* <LiveRadar /> */}

      {/* Trending Topics */}

      <TrendingNow />
    </div>
  );
}
