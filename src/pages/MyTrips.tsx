import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Compass, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

// --- Types & Interfaces ---
export interface ApiTrip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  numberOfUser: number;
  imageUrl: string | null;
  createdBy: string;
  status: number;
  tripStatus: string;
  travelPreference?: { id: string; name: string }[];
  destination?: string;
  withPlan?: boolean;
  isPublic?: boolean;
  isSaved?: boolean;
}

interface RawApiTrip extends Omit<ApiTrip, "id" | "name"> {
  tripId: string;
  title: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const MyTrips = () => {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const queryClient = useQueryClient();

  useFavicon("/plane-lock.png");
  usePageTitle(t("myTrips.pageTitle"));

  // States
  const [activeFilter, setActiveFilter] = useState<number>(2);
  const [activeStatus, setActiveStatus] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const constPageSize = 20;

  const { ref: loadMoreRef, inView } = useInView();

  const filterTypes = [
    { label: t("myTrips.filters.created"), value: 2 },
    { label: t("myTrips.filters.joined"), value: 1 },
    { label: t("myTrips.filters.favorites"), value: 3 },
  ];

  const statusTypes = [
    { label: t("myTrips.statuses.planned"), value: 1 },
    { label: t("myTrips.statuses.completed"), value: 2 },
    { label: t("myTrips.statuses.past"), value: 4 },
    { label: t("myTrips.statuses.upcoming"), value: 5 },
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["myTrips", activeFilter, activeStatus, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      let token = localStorage.getItem("token") || "";
      token = token.replace(/^"(.*)"$/, "$1");

      let url = `https://rahhal-api.runasp.net/TripManagement/GetMyTrips?FilterType=${activeFilter}&Status=${activeStatus}&PageNumber=${pageParam}&PageSize=${constPageSize}&SortByLastAdded=true`;
      if (debouncedSearch.trim()) {
        url += `&SearchTerm=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!json.isSuccess) throw new Error("Failed to fetch");
      return json.data?.items || [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === constPageSize ? allPages.length + 1 : undefined;
    },
  });

  const trips: ApiTrip[] =
    data?.pages.flat().map((item: RawApiTrip) => ({
      ...item,
      id: item.tripId,
      name: item.title,
    })) || [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (tripId: string) => {
      let token = localStorage.getItem("token") || "";
      token = token.replace(/^"(.*)"$/, "$1");
      if (!token) throw new Error("No token");

      const res = await fetch(`https://rahhal-api.runasp.net/TripManagement/SaveTrip`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tripId }),
      });
      const data = await res.json();
      if (!data.isSuccess) throw new Error("Failed to save");
      return data;
    },
    onMutate: async (tripId) => {
      await queryClient.cancelQueries({ queryKey: ["myTrips"] });

      const previousData = queryClient.getQueryData(["myTrips", activeFilter, activeStatus, debouncedSearch]);

      queryClient.setQueryData(["myTrips", activeFilter, activeStatus, debouncedSearch], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: RawApiTrip[]) =>
            page.map((trip) =>
              trip.tripId === tripId ? { ...trip, isSaved: !trip.isSaved } : trip
            )
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["myTrips", activeFilter, activeStatus, debouncedSearch], context.previousData);
      }
      toast.error(t("myTrips.toast.saveError"));
    },
  });

  if (isError) {
    toast.error(t("myTrips.toast.fetchError"));
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-10 dark:bg-slate-900" dir={isRtl ? "rtl" : "ltr"}>
      {/* --- MODERN & COMPACT DASHBOARD HEADER --- */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-35 px-4 py-3 sm:py-6 transition-all duration-300 shadow-sm">
        <div className="container mx-auto flex flex-col gap-3 sm:gap-6">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 transition-all">
                {t("myTrips.pageTitle")}
                {trips.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] sm:text-xs py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-full font-bold">
                    {trips.length}
                  </span>
                )}
              </h1>
              <p className="hidden sm:block text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                {t("myTrips.pageSubtitle")}
              </p>
            </div>

            <Link to="/create-trip">
              <Button
                size="default"
                className="h-9 w-9 sm:h-11 sm:w-auto rounded-full sm:rounded-xl p-0 sm:px-6 text-sm font-bold shadow-sm transition-all duration-300 hover:scale-[1.05] active:scale-95 bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center overflow-hidden group"
                aria-label={t("myTrips.newTrip")}
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4 sm:mx-1 transition-transform group-hover:rotate-90" />
                <span className="hidden sm:inline-block whitespace-nowrap">{t("myTrips.newTrip")}</span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-3">

            {/* Category Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700/50 w-full lg:w-fit overflow-x-auto no-scrollbar">
              {filterTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveFilter(t.value)}
                  className={`flex-1 lg:flex-none px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition-all duration-300 ease-in-out rounded-md sm:rounded-lg outline-none whitespace-nowrap ${activeFilter === t.value
                      ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600 scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Bar & Status Pills (Same line on mobile!) */}
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">

              {/* Search */}
              <div className="relative flex-1 sm:w-64 group">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 transition-colors group-focus-within:text-blue-600", isRtl ? "right-3" : "left-3")} />
                <Input
                  placeholder={t("myTrips.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "h-9 sm:h-10 w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all",
                    isRtl ? "pr-9" : "pl-9"
                  )}
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[45%] sm:max-w-none pr-1">
                {statusTypes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setActiveStatus(activeStatus === s.value ? "" : s.value)}
                    className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 border outline-none whitespace-nowrap ${activeStatus === s.value
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 scale-105"
                        : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <main className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 h-80 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
                <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded-md mt-2" />
                <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <div key={trip.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <TripCard trip={trip} onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)} />
                </div>
              ))}
            </div>

            <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">{t("myTrips.loadingMore")}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400">
            <Compass className="mb-4 h-16 w-16 opacity-40 text-blue-900 dark:text-blue-500" />
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t("myTrips.noTrips")}</p>
            <p className="text-sm mb-6">{t("myTrips.noTripsDesc")}</p>

            {/* 🚀 Smart Empty State CTA */}
            <Link to="/create-trip">
              <Button className="rounded-full bg-slate-900 hover:bg-blue-700 text-white px-8 py-5 text-sm font-bold shadow-lg transition-colors">
                {t("myTrips.createFirstTripBtn")}
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrips;