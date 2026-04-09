import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Compass, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TripCard from "@/components/TripCard";
import heroImage from "@/assets/hero-travel.jpg";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

const Explore = () => {
  usePageTitle("Explore the World");
  
  const [trips, setTrips] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilterId, setActiveFilterId] = useState<string>("ALL");
  
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const constPageSize = 20; 

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll?SortByLastAdded=true", {
          headers: { 'accept': 'text/plain' }
        });
        const data = await res.json();
        if (data.isSuccess) {
          setPreferences(data.data);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };
    fetchPreferences();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) {
        setPageNumber(1); 
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (pageNumber === 1) setIsLoadingInitial(true);
      else setIsFetchingMore(true);

      try {
        let token = localStorage.getItem("token") || "";
        token = token.replace(/^"(.*)"$/, '$1');
        let url = `https://rahhal-api.runasp.net/TripManagement/GetAll?PageNumber=${pageNumber}&PageSize=${constPageSize}&SortByLastAdded=true`;
        
        if (debouncedSearch.trim() !== "") {
          url += `&SearchTerm=${encodeURIComponent(debouncedSearch.trim())}`;
        }
        
        if (activeFilterId !== "ALL") {
          url += `&PerfernceIds=${activeFilterId}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });

        const data = await res.json();
        if (data.isSuccess && data.data?.items) {
          console.log("Fetched trips:", data.data.items);
          if (pageNumber === 1) {
            setTrips(data.data.items);
          } else {
            setTrips((prev) => {
              const existingIds = new Set(prev.map(t => t.id));
              const newTrips = data.data.items.filter((t: any) => !existingIds.has(t.id));
              return [...prev, ...newTrips];
            });
          }
          setHasMore(pageNumber < (data.data.pages || 1));
        } else {
          if (pageNumber === 1) setTrips([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        toast.error("Network error while loading trips.");
      } finally {
        setIsLoadingInitial(false);
        setIsFetchingMore(false);
      }
    };

    fetchTrips();
  }, [debouncedSearch, activeFilterId, pageNumber]); 

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingInitial && !isFetchingMore) {
          setPageNumber((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingInitial, isFetchingMore]);

  // Todo: Toggle endpoint in AIP
  const toggleFavorite = async (id: string) => {
    let token = localStorage.getItem("token") || "";
    token = token.replace(/^"(.*)"$/, '$1');

    if (!token) {
      toast.error("Please log in to update your favorites.");
      return;
    }

    const targetTrip = trips.find(t => t.id === id);
    const isCurrentlySaved = targetTrip?.isFavorite || targetTrip?.isSaved;

    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !isCurrentlySaved, isSaved: !isCurrentlySaved } : t))
    );

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
      
      if (!data.isSuccess) {
        setTrips((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isFavorite: isCurrentlySaved, isSaved: isCurrentlySaved } : t))
        );
        toast.error(data.message || "Failed to update trip.");
      } else {
        if (isCurrentlySaved) {
          toast.success("Removed from favorites");
        } else {
          toast.success("Trip saved successfully!");
        }
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      setTrips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFavorite: isCurrentlySaved, isSaved: isCurrentlySaved } : t))
      );
      toast.error("Network error. Could not update trip.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[340px] overflow-hidden">
        <img src={heroImage} alt="Travel" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-3 flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm">
            <Compass className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Discover Amazing Trips</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
            Explore the World
          </h1>
          <p className="mt-3 max-w-lg text-primary-foreground/80">
            Browse trips created by fellow travelers, find your perfect match, and start your next adventure.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="-mt-6 relative z-10 container mx-auto">
        <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-elevated sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trips by name or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Dynamic Filters from API */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge
            variant={activeFilterId === "ALL" ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => {
              setActiveFilterId("ALL");
              setPageNumber(1); 
            }}
          >
            All
          </Badge>
          
          {preferences.map((pref) => (
            <Badge
              key={pref.id}
              variant={activeFilterId === pref.id ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => {
                setActiveFilterId(pref.id);
                setPageNumber(1); 
              }}
            >
              {pref.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoadingInitial ? "Searching..." : `${trips.length} trips loaded`}
          </p>
        </div>

        {isLoadingInitial ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading trips...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip, i) => (
                <div key={trip.id} className="animate-fade-in" style={{ animationDelay: `${(i % 10) * 50}ms` }}>
                  <TripCard trip={trip} onToggleFavorite={toggleFavorite} />
                </div>
              ))}
            </div>

            {trips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Compass className="mb-4 h-12 w-12" />
                <p className="text-lg font-medium">No trips found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}

            {isFetchingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <div ref={observerTarget} className="h-10 w-full" />
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;