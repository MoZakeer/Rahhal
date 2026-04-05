import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Compass, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TripCard from "@/components/TripCard";
import heroImage from "@/assets/hero-travel.jpg";
import { toast } from "sonner";

const Explore = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilterId, setActiveFilterId] = useState<string>("ALL");
  
  const [pageNumber, setPageNumber] = useState(1);
  const constPageSize = 20; 

  // 1. جلب الاهتمامات
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

  // 2. جلب الرحلات
  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoadingTrips(true);
      try {
        let token = localStorage.getItem("token") || "";
        token = token.replace(/^"(.*)"$/, '$1');

        let url = `https://rahhal-api.runasp.net/TripManagement/GetAll?PageNumber=${pageNumber}&PageSize=${constPageSize}&SortByLastAdded=true`;
        
        if (search.trim() !== "") {
          url += `&SearchTerm=${encodeURIComponent(search.trim())}`;
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
          setTrips(data.data.items);
        } else {
          toast.error("Failed to load trips.");
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        toast.error("Network error while loading trips.");
      } finally {
        setIsLoadingTrips(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchTrips();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, activeFilterId, pageNumber]); 

  // 3. تحديث دالة الـ Favorite لتتصل بالـ API (Optimistic Update)
  const toggleFavorite = async (id: string) => {
    // تجهيز التوكن (لأن الـ Favorite بيحتاج المستخدم يكون مسجل دخول)
    let token = localStorage.getItem("token") || "";
    token = token.replace(/^"(.*)"$/, '$1');

    if (!token) {
      toast.error("Please log in to save trips to your favorites.");
      return;
    }

    // A. التحديث المتفائل: تغيير حالة القلب في الواجهة فوراً
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );

    try {
      // B. إرسال الطلب للسيرفر
      // شيلنا الـ ?tripId=${id} من الرابط، وحطيناها في الـ body
      const res = await fetch(`https://rahhal-api.runasp.net/TripManagement/SaveTrip`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // ضفنا السطر ده عشان نبعت الـ ID جوه الـ Body
        body: JSON.stringify({ tripId: id }) 
      });

      const data = await res.json();
      
      // C. لو السيرفر رفض الطلب (isSuccess: false)
      if (!data.isSuccess) {
        // نرجع حالة القلب زي ما كانت (Rollback)
        setTrips((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
        );
        toast.error(data.message || "Failed to save trip.");
      } else {
        toast.success("Trip saved successfully!");
      }

    } catch (error) {
      // D. لو النت فصل أو حصل خطأ في الشبكة
      console.error("Error saving trip:", error);
      // نرجع حالة القلب زي ما كانت
      setTrips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
      );
      toast.error("Network error. Could not save trip.");
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
            {isLoadingTrips ? "Searching..." : `${trips.length} trips found (Page ${pageNumber})`}
          </p>
        </div>

        {isLoadingTrips ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading trips...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip, i) => (
                <div key={trip.id} className="animate-fade-in" style={{ animationDelay: `${(i % 10) * 100}ms` }}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;