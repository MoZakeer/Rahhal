import { TrendingUp, Flame, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface TrendingTrip {
  city: string;
  amount: number;
}

export default function TrendingNow() {
  const { t, language } = useLanguage(); 
  const isRtl = language === "ar";

  const [trendingTrips, setTrendingTrips] = useState<TrendingTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTrips = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "https://rahhal-api.runasp.net/TripManagement/MostRelevantTrips",
          {
            method: "GET",
            headers: {
              accept: "text/plain",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.isSuccess) {
          setTrendingTrips(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch trending trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTrips();
  }, []);

  return (
    <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl transition-all duration-300" dir={isRtl ? "rtl" : "ltr"}>
      
      <div className={cn(
        "absolute -top-12 w-36 h-36 bg-sky-400/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none",
        isRtl ? "-left-12" : "-right-12"
      )} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl relative">
            <Flame className="h-5 w-5 text-sky-500 dark:text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-wide">
              {t("feed.trendingTitle")}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {t("feed.trendingSub")}
            </p>
          </div>
        </div>
        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton circle width={32} height={32} />
                <div className="flex-1">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingTrips.length > 0 ? (
          trendingTrips.slice(0, 5).map((trip, index) => (
            <div
              key={trip.city}
              className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-blue-500/30 dark:hover:border-blue-400/20 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-lg hover:shadow-blue-500/[0.03] hover:-translate-y-[3px] transition-all duration-300 ease-out cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-xl font-bold text-xs transition-transform duration-300 group-hover:scale-110",
                  index === 0
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : index === 1
                      ? "bg-sky-400 text-white shadow-md shadow-sky-400/20"  
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  {index + 1}
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {trip.city}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    #{trip.city.replace(/\s+/g, "")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn("flex flex-col", isRtl ? "items-start" : "items-end")}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ArrowUpRight className={cn(
                      "w-3 h-3 transform transition-transform duration-500",
                      isRtl 
                        ? "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 rotate-270" 
                        : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    )} />
                    {trip.amount}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    {t("feed.activeTrip")} 
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
              {t("feed.noTrending")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}