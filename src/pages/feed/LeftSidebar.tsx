import SearchComponent from "@/features/search/components/SearchComponent";
import TrendingNow from "./TrendingNow";
import { useLanguage } from "@/context/LanguageContext";

export function LeftSidebar() {
  const { t } = useLanguage();

  return (
    <div className="sticky top-24 w-full flex flex-col gap-5 transition-all duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 dark:text-slate-100">
          {t("feed.storiesTitle")}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          {t("feed.storiesDesc")}
        </p>
      </div>

      <SearchComponent />

      <TrendingNow />
    </div>
  );
}