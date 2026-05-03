import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Compass, Loader2, Sparkles, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TripCard from "@/components/TripCard";
import heroImage from "@/assets/hero-travel.jpg";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

// ==========================================
// API Fetcher Functions (For React Query)
// ==========================================
const fetchPreferencesAPI = async () => {
  const res = await fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll?SortByLastAdded=true", {
    headers: { 'accept': 'text/plain' }
  });
  const data = await res.json();
  if (!data.isSuccess) throw new Error("Failed to fetch preferences");
  return data.data;
};

const fetchTripsAPI = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, searchTerm, filterId] = queryKey;
  let token = localStorage.getItem("token")?.replace(/^"(.*)"$/, '$1') || "";

  let url = `https://rahhal-api.runasp.net/TripManagement/GetAll?PageNumber=${pageParam}&PageSize=20&SortByLastAdded=true`;

  if (searchTerm && searchTerm.trim() !== "") {
    url += `&SearchTerm=${encodeURIComponent(searchTerm.trim())}`;
  }
  if (filterId && filterId !== "ALL") {
    url += `&PerfernceIds=${filterId}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  const data = await res.json();
  if (!data.isSuccess) throw new Error("Failed to fetch trips");
  return data.data; // { items: [...], pages: number }
};

// ==========================================
// Main Component
// ==========================================
const Explore = () => {
  usePageTitle("Explore the World");
  const queryClient = useQueryClient();

  // --- 1. URL Search Params (State Preservation) ---
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("q") || "";
  const urlFilter = searchParams.get("cat") || "ALL";
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearch) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (searchInput) newParams.set("q", searchInput);
          else newParams.delete("q");
          return newParams;
        }, { replace: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, setSearchParams]);

  const handleFilterChange = (id: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (id !== "ALL") newParams.set("cat", id);
      else newParams.delete("cat");
      return newParams;
    }, { replace: true });
  };

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsHeaderVisible(false);
        setIsFabMenuOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 3. React Query: Fetch Data ---
  const { data: preferences = [] } = useQuery({
    queryKey: ['preferences'],
    queryFn: fetchPreferencesAPI,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: tripsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['trips', urlSearch, urlFilter],
    queryFn: fetchTripsAPI,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= (lastPage.pages || 1) ? nextPage : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  const allTrips = tripsData?.pages.flatMap((page) => page.items) || [];

  // --- 4. Infinite Scroll Observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- 5. Toggle Favorite (Optimistic Update) ---
  const toggleFavorite = async (id: string) => {
    let token = localStorage.getItem("token")?.replace(/^"(.*)"$/, '$1') || "";
    if (!token) {
      toast.error("Please log in to update your favorites.");
      return;
    }

    queryClient.setQueryData(['trips', urlSearch, urlFilter], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((trip: any) => {
            if (trip.id === id) {
              const isCurrentlySaved = trip.isFavorite || trip.isSaved;
              return { ...trip, isFavorite: !isCurrentlySaved, isSaved: !isCurrentlySaved };
            }
            return trip;
          })
        }))
      };
    });

    try {
      const res = await fetch(`https://rahhal-api.runasp.net/TripManagement/SaveTrip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tripId: id })
      });

      const data = await res.json();
      if (!data.isSuccess) throw new Error(data.message);

    } catch (error) {
      console.error("Error updating trip:", error);
      toast.error("Failed to update favorite status.");
      queryClient.invalidateQueries({ queryKey: ['trips', urlSearch, urlFilter] });
    }
  };

  return (
    <div className="min-h-screen relative pt-[140px] lg:pt-[150px]">

      {/* --- Sticky Top Header (Search & Filters) --- */}
      <div
        className={`fixed top-16 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-500 ease-in-out ${isHeaderVisible ? "translate-y-0" : "-translate-y-[200px]"
          }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Search Input Area */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search trips by name or destination..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Horizontal Scrollable Filters */}
            <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Badge
                variant={urlFilter === "ALL" ? "default" : "outline"}
                className={`cursor-pointer transition-colors whitespace-nowrap px-4 py-1.5 ${urlFilter === "ALL"
                  ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                onClick={() => handleFilterChange("ALL")}
              >
                All
              </Badge>

              {preferences.map((pref: any) => (
                <Badge
                  key={pref.id}
                  variant={urlFilter === pref.id ? "default" : "outline"}
                  className={`cursor-pointer transition-colors whitespace-nowrap px-4 py-1.5 ${urlFilter === pref.id
                    ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  onClick={() => handleFilterChange(pref.id)}
                >
                  {pref.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[280px] lg:h-[340px] overflow-hidden mx-2 sm:mx-4 rounded-3xl shadow-sm">
        <img src={heroImage} alt="Travel" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-3 flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md border border-white/10">
            <Compass className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Discover Amazing Trips</span>
          </div>
          <h1 className="font-display text-4xl font-black text-white md:text-5xl drop-shadow-md">
            Explore the World
          </h1>
        </div>
      </section>

      {/* Grid */}
      <div className="px-4 sm:px-0 container mx-auto py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {isLoading ? "Searching..." : `${allTrips.length} trips loaded`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600 dark:text-blue-500" />
            <p className="text-lg font-bold">Loading trips...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allTrips.map((trip: any, i: number) => (
                <div key={trip.id} className="animate-fade-in" style={{ animationDelay: `${(i % 10) * 50}ms` }}>
                  <TripCard trip={trip} onToggleFavorite={toggleFavorite} />
                </div>
              ))}
            </div>

            {allTrips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
                <Compass className="mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg font-bold">No trips found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}

            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
              </div>
            )}

            <div ref={observerTarget} className="h-10 w-full" />
          </>
        )}
      </div>

      {/* --- Overlay Background for FAB Menu --- */}
      <AnimatePresence>
        {isFabMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFabMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* --- FAB Menu Options (Create Post) --- */}
      <AnimatePresence>
        {isHeaderVisible && isFabMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-6 lg:bottom-28 lg:right-10 z-50 flex flex-col items-end gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsFabMenuOpen(false); navigate('/ai-planner'); }}
              className="flex items-center gap-2 rounded-2xl shadow-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-bold transition-colors"
            >
              <span>Create AI Trip</span>
              <Sparkles className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsFabMenuOpen(false); navigate('/create-trip'); }}
              className="flex items-center gap-2 rounded-2xl shadow-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-5 py-3 text-sm font-bold transition-colors"
            >
              <span>Create Manual Trip</span>
              <PenLine className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Create Post FAB --- */}
      <motion.button
        animate={{
          scale: isHeaderVisible ? 1 : 0,
          opacity: isHeaderVisible ? 1 : 0,
          y: isHeaderVisible ? 0 : 50,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 dark:shadow-blue-900/50 hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-colors"
        aria-label="Create Post"
      >
        <motion.div
          animate={{ rotate: isFabMenuOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.div>
      </motion.button>

    </div>
  );
};

export default Explore;