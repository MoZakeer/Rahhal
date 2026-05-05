import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Briefcase,
  Globe,
  Sparkles,
  Compass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";

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
const filterTypes = [
  { label: "Created", value: 2 },
  { label: "Joined", value: 1 },
  { label: "Favorites", value: 3 },
];

const statusTypes = [
  { label: "Planned", value: 1 },
  { label: "Completed", value: 2 },
  { label: "Past", value: 4 },
  { label: "Upcoming", value: 5 },
];

const MyTrips = () => {
  useFavicon("/plane-lock.png")
  usePageTitle("My Adventures");
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(2);
  const [activeStatus, setActiveStatus] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageNumber] = useState(1);
  const constPageSize = 20;

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        let token = localStorage.getItem("token") || "";
        token = token.replace(/^"(.*)"$/, "$1");

        let url = `https://rahhal-api.runasp.net/TripManagement/GetMyTrips?FilterType=${activeFilter}&Status=${activeStatus}&PageNumber=${pageNumber}&PageSize=${constPageSize}&SortByLastAdded=true`;
        if (search.trim())
          url += `&SearchTerm=${encodeURIComponent(search.trim())}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        if (data.isSuccess && data.data?.items) {
          const normalizedData: ApiTrip[] = data.data.items.map(
            (item: RawApiTrip) => ({
              ...item,
              id: item.tripId, // Create 'id' so TripCard doesn't complain
              name: item.title, // Create 'name' so TripCard doesn't complain
            }),
          );

          setTrips(normalizedData);
        } else {
          setTrips([]);
        }
      } catch {
        toast.error("Network error while loading adventures.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchTrips, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, activeFilter, activeStatus, pageNumber]);

  const toggleFavorite = async (tripid: string) => {
    let token = localStorage.getItem("token") || "";
    token = token.replace(/^"(.*)"$/, "$1");
    if (!token) return toast.error("Please log in.");

    setTrips((prev) =>
      prev.map((t) => (t.id === tripid ? { ...t, isSaved: !t.isSaved } : t)),
    );

    try {
      const res = await fetch(
        `https://rahhal-api.runasp.net/TripManagement/SaveTrip`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tripId: tripid }),
        },
      );
      const data = await res.json();

      if (!data.isSuccess) throw new Error();
    } catch {
      setTrips((prev) =>
        prev.map((t) => (t.id === tripid ? { ...t, isSaved: !t.isSaved } : t)),
      );
      toast.error("Could not update saved trips.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-10 dark:bg-slate-900">
      {/* --- MINIMIZED HERO SECTION --- */}
      <div className="relative overflow-hidden bg-[#0f172a] py-12 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-[5%] -top-[10%] h-[120%] w-[40%] rounded-full bg-blue-900/15 blur-[100px]" />
          <div className="absolute -right-[5%] bottom-0 h-[80%] w-[30%] rounded-full bg-blue-600/10 blur-[80px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 backdrop-blur-md border border-white/10">
                <Sparkles className="h-3.5 w-3.5 text-blue-900" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">
                  My Passport
                </span>
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                My{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-900 bg-clip-text text-transparent">
                  Adventures
                </span>
              </h1>
              {/* Horizontal Stats */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-slate-200">
                    {trips.length}
                  </span>{" "}
                  Trips
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-slate-200 font-mono">
                    Global
                  </span>
                </div>
              </div>
            </div>

            <Link to="/create-trip">
              <Button
                size="lg"
                className="h-14 rounded-2xl px-8 text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                <Plus className="mr-2 h-5 w-5" /> New Trip
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- COMPACT FLOATING FILTER BAR --- */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-8 rounded-3xl border dark:bg-slate-900 border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl md:p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Category Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 dark:border-slate-600 rounded-xl w-fit border border-slate-200/50">
              {filterTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveFilter(t.value)}
                  className={`px-6 py-2 text-xs font-bold transition-all rounded-lg ${
                    activeFilter === t.value
                      ? "bg-white dark:bg-slate-300 text-blue-900 shadow-sm ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white" />
              <Input
                placeholder="Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full border-none bg-slate-100 dark:bg-slate-800 pl-11 dark:text-white rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-blue-900/10"
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t  border-slate-100 dark:border-slate-400 pt-3 px-2">
            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mr-2">
              Status
            </span>
            {statusTypes.map((s) => (
              <button
                key={s.value}
                onClick={() =>
                  setActiveStatus(activeStatus === s.value ? "" : s.value)
                }
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  activeStatus === s.value
                    ? "bg-blue-900 border-blue-900 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* --- CONTENT GRID --- */}
      <main className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <TripCard trip={trip} onToggleFavorite={toggleFavorite} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Compass className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No trips found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrips;
