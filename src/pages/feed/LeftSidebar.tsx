import SearchComponent from "@/features/search/components/SearchComponent";
import TrendingNow from "./TrendingNow";

export function LeftSidebar() {
  return (
    <div className="fixed left-6 w-[260px]">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 dark:text-slate-100">
            Stories Beyond Borders
          </h1>

          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Every journey has a story—discover yours here.
          </p>
        </div>

        <SearchComponent />

        <TrendingNow />
      </div>
    </div>
  );
}