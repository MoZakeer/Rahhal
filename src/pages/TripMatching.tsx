import { useState } from "react";
import { GitCompareArrows, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MatchSourceSelector, { type MatchCriteria } from "@/components/matching/MatchSourceSelector";
import MatchResultCard, { type ApiMatchTrip } from "@/components/matching/MatchResultCard";
import { usePageTitle } from "@/hooks/usePageTitle";

const TripMatching = () => {
  usePageTitle("Smart Trip Matching");
  const [search, setSearch] = useState("");
  
  // 🔥 شلنا الـ joinedTrips خالص من هنا لأننا هنعتمد على userJoinStatus

  const [isMatching, setIsMatching] = useState(false);
  const [hasMatched, setHasMatched] = useState(false);
  const [results, setResults] = useState<ApiMatchTrip[]>([]);

  // دالة الاتصال بالـ API للبحث
  const handleMatch = async (criteria: MatchCriteria) => {
    setIsMatching(true);
    
    try {
      let token = localStorage.getItem("token") || "";
      token = token.replace(/^"(.*)"$/, '$1');

      let url = `https://rahhal-api.runasp.net/TripManagement/GetAllMatching?pageNumber=1&pageSize=20`;
      
      if (criteria.budget) url += `&Budget=${criteria.budget}`;
      if (criteria.travelers) url += `&NumberOfTravelers=${criteria.travelers}`;
      if (criteria.destinationId && criteria.destinationId !== "ANY") url += `&DestinationId=${criteria.destinationId}`;
      
      if (criteria.preferenceIds && criteria.preferenceIds.length > 0) {
        criteria.preferenceIds.forEach(id => {
          url += `&PreferenceIds=${id}`;
        });
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
        const sortedItems = data.data.items.sort((a: ApiMatchTrip, b: ApiMatchTrip) => b.matchPercentage - a.matchPercentage);
        setResults(sortedItems);
        setHasMatched(true);
        toast.success(`Found ${sortedItems.length} matching trips!`);
      } else {
        toast.error("Failed to find matches.");
      }
    } catch (error) {
      console.error("Match error:", error);
      toast.error("Network error while matching trips.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleJoin = async (id: string, name: string) => {
    let token = localStorage.getItem("token") || "";
    token = token.replace(/^"(.*)"$/, '$1');

    if (!token) {
      toast.error("Please log in to join trips.");
      return;
    }

    const targetTrip = results.find(t => t.id === id);
    const previousStatus = targetTrip?.userJoinStatus || 3;

    setResults((prev) => 
      prev.map((trip) => 
        trip.id === id ? { ...trip, userJoinStatus: 2 } : trip
      )
    );

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
        setResults((prev) => 
          prev.map((trip) => 
            trip.id === id ? { ...trip, userJoinStatus: previousStatus } : trip
          )
        );
        toast.error(data.message || "Failed to request join.");
      } else {
        toast.success(`Request sent to join "${name}"`);
      }
    } catch (error) {
      console.error("Join error:", error);
      setResults((prev) => 
        prev.map((trip) => 
          trip.id === id ? { ...trip, userJoinStatus: previousStatus } : trip
        )
      );
      toast.error("Network error. Could not request to join.");
    }
  };

  const filtered = results.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.destination && t.destination.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-accent py-16">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-ocean)" }} />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <GitCompareArrows className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Smart Trip Matching
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Find public trips that match your travel style. Auto-fill from your saved trips or enter custom criteria.
          </p>
        </div>
      </section>

      {/* Match Source Selector */}
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4">
          <MatchSourceSelector onMatch={handleMatch} isMatching={isMatching} />
        </div>
      </div>

      {/* Results */}
      {hasMatched && (
        <div className="container mx-auto pb-12 px-4">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Matching Results
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length} trips found)
              </span>
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter results..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((trip, i) => (
              <MatchResultCard
                key={trip.id}
                trip={trip}
                index={i}
                // 🔥 شلنا الـ joined خالص من هنا
                onJoin={handleJoin}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <GitCompareArrows className="mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No matching trips found</p>
              <p className="text-sm">Try different criteria or reducing your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripMatching;