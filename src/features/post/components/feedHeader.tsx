import { PenSquare, Image as ImageIcon } from "lucide-react";

type Props = {
  onCreatePost: () => void;
};

export default function FeedHeader({ onCreatePost }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Create Post Trigger */}
      <div
        onClick={onCreatePost}
        className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 cursor-text transition-all hover:shadow-lg dark:hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-500/30 group"
      >
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 dark:group-hover:bg-blue-900 transition-all duration-300">
          <PenSquare className="h-6 w-6 text-indigo-600 dark:text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors rounded-2xl py-3 px-5 text-slate-400 dark:text-slate-500 text-sm font-medium border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700">
          Share your next adventure,{" "}
          {localStorage.getItem("username") || "Traveler"}...
        </div>

        <button className="p-3 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-indigo-500 dark:text-blue-400 transition-all">
          <ImageIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
