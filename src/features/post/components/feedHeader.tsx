import { PenSquare, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  onCreatePost: () => void;
};

export default function FeedHeader({ onCreatePost }: Props) {
  const { t } = useLanguage();

  const userName = localStorage.getItem("username") || t("feed.traveler");
  console.log("Username from localStorage:", userName);

  return (
    <div className="flex flex-col gap-6 w-full px-3 sm:px-4">
      <div
        onClick={onCreatePost}
        className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 sm:gap-4 cursor-text transition-all hover:shadow-lg dark:hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-500/30 group"
      >
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-400 dark:group-hover:bg-blue-900 transition-all duration-300">
          <PenSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors rounded-2xl py-2 sm:py-3 px-3 sm:px-5 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700 min-w-0">
          <span className="sm:hidden">{t("feed.shareMobile")}</span>

          <span className="hidden sm:inline">
            {t("feed.shareDesktop")} {userName}...
          </span>
        </div>

        <button className="p-2 sm:p-3 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-blue-400 transition-all outline-none">
          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
}