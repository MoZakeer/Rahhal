import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type PostUserProps = {
  name?: string;
  username?: string;
  avatar?: string;
};

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

export default function PostUser({ name, username, avatar }: PostUserProps) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
      <img
        src={avatar || DEFAULT_AVATAR}
        alt={name}
        className="w-11 h-11 rounded-full object-cover"
      />

      <div className={cn("leading-tight", isRtl ? "text-right" : "text-left")}>
        <h1 className="font-medium text-sm text-gray-900 dark:text-slate-100">{name}</h1>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {t("feed.postingAs")} @{username}
        </p>
      </div>
    </div>
  );
}