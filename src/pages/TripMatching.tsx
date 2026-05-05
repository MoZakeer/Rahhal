import { useState, useEffect, useRef } from "react";
import {
  GitCompareArrows, Search, Loader2, SlidersHorizontal, Map as MapIcon, List, MapPin, X, Sparkles, Banknote, CalendarClock,
  Users,
  Wallet,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import MatchSourceSelector, { type MatchCriteria } from "@/components/matching/MatchSourceSelector";
import MatchResultCard, { type ApiMatchTrip } from "@/components/matching/MatchResultCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";

const getDestinationPosition = (destinationName = "Unknown") => {
  let hash = 0;
  for (let i = 0; i < destinationName.length; i++) {
    hash = destinationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = 15 + Math.abs((Math.sin(hash) * 1000) % 70);
  const y = 15 + Math.abs((Math.cos(hash) * 1000) % 70);
  return { top: `${y}%`, left: `${x}%` };
};

// ==========================================
// Minimalist Skeleton Loader
// ==========================================
const MatchSkeleton = () => (
  <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent" />
    <div className="h-40 w-full sm:w-56 rounded-2xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-4 py-2">
      <div className="flex justify-between items-start">
        <div className="h-6 w-2/3 rounded-lg bg-slate-100" />
        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100" />
      </div>
      <div className="h-4 w-1/3 rounded-md bg-slate-50" />
      <div className="h-4 w-full rounded-md bg-slate-50" />
      <div className="flex gap-2 pt-4">
        <div className="h-8 w-20 rounded-full bg-slate-100" />
        <div className="h-8 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  </div>
);

// ==========================================
// Main Component
// ==========================================
const TripMatching = () => {
  useFavicon("/matching.png");
  usePageTitle("Smart Trip Matching");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMapTrip, setSelectedMapTrip] = useState<ApiMatchTrip | null>(null);

  const [sortBy, setSortBy] = useState<"best_match" | "budget_asc" | "date_asc">("best_match");
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState(true);

  const [isMatching, setIsMatching] = useState(false);
  const [hasMatched, setHasMatched] = useState(false);
  const [results, setResults] = useState<ApiMatchTrip[]>([]);

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<MatchCriteria | null>(null);
  const constPageSize = 20;

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = sessionStorage.getItem("RAHHAL_MATCH_STATE");
    if (savedState) {
      const parsed = JSON.parse(savedState);

      setResults(parsed.results || []);
      setHasMatched(true);
      setCurrentCriteria(parsed.criteria || null);
      setSearch(parsed.search || "");
      setSortBy(parsed.sortBy || "best_match");
      setViewMode(parsed.viewMode || "list");

      setIsCriteriaExpanded(false);
    }
  }, []);

  const [destinations, setDestinations] = useState<any[]>([]);
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch("https://rahhal-api.runasp.net/City/GetAll?SortByLastAdded=true");
        const data = await res.json();
        if (data.isSuccess) setDestinations(data.data);
      } catch (error) {
        console.error("Error fetching destinations", error);
      }
    };
    fetchDestinations();
  }, []);

  // 🚀 Logic for Smart Header (Hide on Scroll Down, Show on Scroll Up)
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // لو اليوزر نزل أكتر من 100 بكسل وسكرول لتحت -> نخفي البار
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      }
      // لو اليوزر طالع لفوق -> نظهر البار فوراً
      else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, []);

  useEffect(() => {
    if (hasMatched) {
      const stateToSave = {
        results,
        criteria: currentCriteria,
        search,
        sortBy,
        viewMode
      };
      sessionStorage.setItem("RAHHAL_MATCH_STATE", JSON.stringify(stateToSave));
    }
  }, [results, currentCriteria, search, sortBy, viewMode, hasMatched]);


  // --- API Logic ---
  const buildUrl = (criteria: MatchCriteria, page: number) => {
    let url = `https://rahhal-api.runasp.net/TripManagement/GetAllMatching?pageNumber=${page}&pageSize=${constPageSize}`;
    if (criteria.budget) url += `&Budget=${criteria.budget}`;
    if (criteria.travelers) url += `&NumberOfTravelers=${criteria.travelers}`;
    if (criteria.destinationId && criteria.destinationId !== "ANY") url += `&DestinationId=${criteria.destinationId}`;
    if (criteria.gender !== undefined) url += `&Gender=${criteria.gender}`;
    if (criteria.ageGroup !== undefined) url += `&AgeGroup=${criteria.ageGroup}`;
    if (criteria.startDate) url += `&StartDate=${criteria.startDate}`;
    if (criteria.endDate) url += `&EndDate=${criteria.endDate}`;
    if (criteria.preferenceIds && criteria.preferenceIds.length > 0) {
      criteria.preferenceIds.forEach(id => {
        url += `&PreferenceIds=${id}`;
      });
    }
    return url;
  };

  const handleMatch = async (criteria: MatchCriteria) => {
    setIsMatching(true);
    setCurrentCriteria(criteria);
    setPageNumber(1);
    setSelectedMapTrip(null);

    try {
      let token = localStorage.getItem("token")?.replace(/^"(.*)"$/, '$1') || "";
      const url = buildUrl(criteria, 1);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();

      if (data.isSuccess && data.data?.items) {
        const sortedItems = data.data.items.sort((a: ApiMatchTrip, b: ApiMatchTrip) => b.matchPercentage - a.matchPercentage);
        setResults(sortedItems);
        setHasMatched(true);
        setHasMore(1 < (data.data.pages || 1));
        setIsCriteriaExpanded(false);
        toast.success(`Found ${sortedItems.length} matching trips!`);
      } else {
        setResults([]);
        setHasMore(false);
        toast.error("Failed to find matches.");
      }
    } catch (error) {
      console.error("Match error:", error);
      toast.error("Network error while matching trips.");
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    const fetchMoreMatches = async () => {
      if (pageNumber === 1 || !currentCriteria) return;
      setIsFetchingMore(true);
      try {
        let token = localStorage.getItem("token")?.replace(/^"(.*)"$/, '$1') || "";
        const url = buildUrl(currentCriteria, pageNumber);
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (data.isSuccess && data.data?.items) {
          const newItems = data.data.items.sort((a: ApiMatchTrip, b: ApiMatchTrip) => b.matchPercentage - a.matchPercentage);
          setResults((prev) => {
            const existingIds = new Set(prev.map(t => t.id));
            const filteredNew = newItems.filter((t: any) => !existingIds.has(t.id));
            return [...prev, ...filteredNew];
          });
          setHasMore(pageNumber < (data.data.pages || 1));
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Pagination error:", error);
      } finally {
        setIsFetchingMore(false);
      }
    };
    fetchMoreMatches();
  }, [pageNumber, currentCriteria]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isMatching && !isFetchingMore && viewMode === 'list') {
          setPageNumber((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isMatching, isFetchingMore, viewMode]);

  const handleJoin = async (id: string, name: string) => {
    let token = localStorage.getItem("token")?.replace(/^"(.*)"$/, '$1') || "";
    if (!token) {
      toast.error("Please log in to join trips.");
      return;
    }
    const targetTrip = results.find(t => t.id === id);
    const previousStatus = targetTrip?.userJoinStatus || 3;

    setResults((prev) => prev.map((trip) => trip.id === id ? { ...trip, userJoinStatus: 2 } : trip));

    try {
      const res = await fetch(`https://rahhal-api.runasp.net/TripManagement/RequestJoin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tripId: id })
      });
      const data = await res.json();
      if (!data.isSuccess) {
        setResults((prev) => prev.map((trip) => trip.id === id ? { ...trip, userJoinStatus: previousStatus } : trip));
        toast.error(data.message || "Failed to request join.");
      } else {
        toast.success(`Request sent to join "${name}"`);
      }
    } catch (error) {
      setResults((prev) => prev.map((trip) => trip.id === id ? { ...trip, userJoinStatus: previousStatus } : trip));
      toast.error("Network error. Could not request to join.");
    }
  };

  // 🚀 الفلترة والترتيب الذكي في خطوة واحدة
  const filteredAndSorted = results
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.destination && t.destination.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "best_match") {
        return b.matchPercentage - a.matchPercentage;
      } else if (sortBy === "budget_asc") {
        const budgetA = a.budget || Infinity;
        const budgetB = b.budget || Infinity;
        return budgetA - budgetB;
      } else if (sortBy === "date_asc") {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">

      {/* --- Clean Minimalist Hero Section --- */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 px-4 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white" />

        <div className="relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
          >
            {isMatching ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <GitCompareArrows className="h-6 w-6 text-primary" />
            )}
          </motion.div>

          <h1 className="font-display text-4xl font-semibold text-slate-900 md:text-5xl tracking-tight">
            Intelligent Matching
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-slate-500 text-base md:text-lg leading-relaxed">
            Discover trips tailored exclusively to your preferences. Let our algorithm find your next perfect getaway.
          </p>
        </div>
      </section>

      {/* --- Match Source Selector & Summary Bar (The Airbnb Effect) --- */}
      <div className="relative z-20 -mt-20 mb-16 px-4">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait" initial={false}>
            {isCriteriaExpanded ? (
              <motion.div
                key="full-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-2 sm:p-4 mb-2">
                  <MatchSourceSelector onMatch={handleMatch} isMatching={isMatching} initialData={currentCriteria} destinations={destinations} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary-bar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-full shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-slate-100/80 px-6 py-3.5 flex flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-[0_16px_50px_rgb(0,0,0,0.12)] transition-shadow group mx-auto max-w-3xl"
                onClick={() => setIsCriteriaExpanded(true)}
              >
                <div className="flex flex-wrap items-center justify-between md:justify-center sm:justify-start gap-x-5 gap-y-2 text-sm font-medium text-slate-700 flex-1">
                  <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-full hidden md:flex">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Filtered</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-slate-700">
                      <MapPin className="h-4 w-4 shrink-0" />

                      {(() => {
                        const destName = currentCriteria?.destinationId && currentCriteria.destinationId !== "ANY"
                          ? (destinations.find(d => d.id === currentCriteria.destinationId)?.name || "Destination")
                          : "Anywhere";

                        return (
                          <>
                            <span className="sm:hidden">
                              {destName.length > 5 ? `${destName.substring(0, 4)}..` : destName}
                            </span>

                            <span className="hidden sm:inline">
                              {destName}
                            </span>
                          </>
                        );
                      })()}
                    </span>

                    {currentCriteria?.travelers && (
                      <span className="flex items-center gap-1.5 transition-colors group-hover:text-slate-700">
                        <Users className="h-4 w-4" /> {currentCriteria.travelers}
                      </span>
                    )}

                    {currentCriteria?.budget && (
                      <span className="flex items-center gap-1.5 transition-colors group-hover:text-slate-700">
                        <Wallet className="h-4 w-4" /> ${currentCriteria.budget}
                      </span>
                    )}

                    {currentCriteria?.startDate && (
                      <span className="flex items-center gap-1.5 hidden md:flex transition-colors group-hover:text-slate-700">
                        <Calendar className="h-4 w-4" /> {new Date(currentCriteria.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold h-9 px-5 shrink-0 text-sm transition-colors flex items-center gap-2"
                  onClick={(e) => { e.stopPropagation(); setIsCriteriaExpanded(true); }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Edit
                  <span className="hidden sm:inline">Search</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Elegant Loading State --- */}
      {isMatching && (
        <div className="container mx-auto max-w-4xl px-4 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-10 text-slate-400">
            <div className="h-[1px] w-12 bg-slate-200" />
            <span className="text-sm tracking-widest uppercase font-medium">Scanning Trips</span>
            <div className="h-[1px] w-12 bg-slate-200" />
          </div>
          {[1, 2, 3].map((i) => (
            <MatchSkeleton key={i} />
          ))}
        </div>
      )}

      {/* --- Results Section --- */}
      {!isMatching && hasMatched && (
        <div className="container mx-auto max-w-5xl px-4 relative">

          <div className={`sticky top-20 z-40 mb-10 mx-auto max-w-5xl pt-2 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="rounded-[2rem] bg-white/80 backdrop-blur-xl p-1.5 sm:p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 flex flex-row items-center justify-between transition-all gap-2">

              <div className="hidden md:flex items-center gap-2 pl-4 shrink-0">
                <span className="font-display font-semibold text-slate-900">Matches</span>
                <span className="flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredAndSorted.length}
                </span>
              </div>

              <div className="flex-1 flex flex-row items-center justify-between gap-1.5 sm:gap-3">

                <div className="relative flex-1 min-w-[80px] max-w-xs">
                  <Search className="absolute left-3 sm:left-4 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 sm:pl-11 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-primary/20 rounded-full h-9 sm:h-11 text-xs sm:text-sm transition-all shadow-none"
                  />
                </div>

                <div className="shrink-0">
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-[90px] sm:w-[150px] bg-slate-50 border-transparent hover:bg-slate-100 text-[10px] sm:text-sm font-semibold text-slate-700 rounded-full h-9 sm:h-11 shadow-none focus:ring-0 px-2 sm:px-4">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-1">
                      <SelectItem value="best_match" className="font-medium rounded-xl py-2 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span>Best Match</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="budget_asc" className="font-medium rounded-xl py-2 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-slate-400" />
                          <span>Low Price</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="date_asc" className="font-medium rounded-xl py-2 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-slate-400" />
                          <span>Soonest</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center bg-slate-100/80 p-0.5 sm:p-1 rounded-full border border-slate-200/50 shrink-0 h-9 sm:h-11">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`relative px-2 sm:px-4 h-full rounded-full flex items-center justify-center transition-all z-10 ${viewMode === 'list' ? 'text-primary' : 'text-slate-400'}`}
                  >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {viewMode === 'list' && <motion.div layoutId="viewToggle" className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/50 -z-10" />}
                  </button>
                  <button
                    onClick={() => { setViewMode('map'); setSelectedMapTrip(null); }}
                    className={`relative px-2 sm:px-4 h-full rounded-full flex items-center justify-center transition-all z-10 ${viewMode === 'map' ? 'text-primary' : 'text-slate-400'}`}
                  >
                    <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {viewMode === 'map' && <motion.div layoutId="viewToggle" className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/50 -z-10" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {viewMode === 'list' ? (
              <motion.div
                key="listView"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAndSorted.map((trip, i) => (
                    <motion.div key={trip.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                      <MatchResultCard trip={trip} index={i} onJoin={handleJoin} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isFetchingMore && (
                  <div className="flex justify-center py-12">
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium text-slate-500">Loading more...</span>
                    </div>
                  </div>
                )}
                <div ref={observerTarget} className="h-10 w-full" />
              </motion.div>

            ) : (

              <motion.div
                key="mapView"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="relative w-full h-[650px] bg-slate-100 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner"
              >
                {/* Abstract Map Grid Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:24px_24px]" />

                {/* Decorative Map elements to feel premium */}
                <div className="absolute top-8 left-8 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Destination Clusters
                  </h4>
                  <p className="text-xs text-slate-500">Abstract representation of trip locations.</p>
                </div>

                {/* Generating Map Pins */}
                {filteredAndSorted.map((trip, index) => {
                  const basePosition = getDestinationPosition(trip.destination || trip.id);
                  const baseTop = parseFloat(basePosition.top);
                  const baseLeft = parseFloat(basePosition.left);

                  const angle = (index * (360 / Math.min(filteredAndSorted.length, 10))) * (Math.PI / 180);

                  const radius = 6;

                  const jitterX = Math.cos(angle) * radius;
                  const jitterY = Math.sin(angle) * radius;

                  const finalTop = `${baseTop + jitterY}%`;
                  const finalLeft = `${baseLeft + jitterX}%`;

                  const isSelected = selectedMapTrip?.id === trip.id;

                  return (
                    <motion.button
                      key={trip.id}
                      className="absolute w-12 h-12 -ml-6 -mt-12 flex flex-col items-center justify-end group z-10"
                      style={{ top: finalTop, left: finalLeft }} // حقن مباشر في الـ style
                      onClick={() => setSelectedMapTrip(trip)}
                      whileHover={{ scale: 1.15, zIndex: 40 }}
                      animate={{ zIndex: isSelected ? 50 : 10 }}
                    >
                      {/* Pin Bubble */}
                      <div className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
                        <MapPin className={`h-10 w-10 drop-shadow-md transition-colors duration-300 ${isSelected ? 'text-primary fill-primary/30' : 'text-slate-500 fill-slate-200 group-hover:text-primary group-hover:fill-primary/20'}`} />
                        <div className="absolute top-2 w-full text-center text-[9px] font-bold text-white">
                          {Math.round(trip.matchPercentage)}%
                        </div>
                      </div>

                      {/* Tooltip */}
                      <span className={`absolute top-full mt-1 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap transition-opacity shadow-lg ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {trip.destination || "Unknown"}
                      </span>
                    </motion.button>
                  );
                })}

                {/* 🚀 Floating Overlay Card when a Pin is clicked */}
                <AnimatePresence>
                  {selectedMapTrip && (
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.9 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
                    >
                      <div className="relative">
                        <button
                          onClick={() => setSelectedMapTrip(null)}
                          className="absolute -top-3 -right-3 z-50 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="shadow-2xl rounded-[1.5rem] bg-white ring-4 ring-white/50">
                          <MatchResultCard trip={selectedMapTrip} index={0} onJoin={handleJoin} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Clean Empty State */}
          {filteredAndSorted.length === 0 && !isFetchingMore && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="bg-white p-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6">
                <SlidersHorizontal className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No matches found</h3>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                We couldn't find a trip that fits these exact criteria. Try adjusting your preferences for better results.
              </p>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
};

export default TripMatching;