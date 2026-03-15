import { useState } from "react";
import { GitCompareArrows, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockTrips } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import MatchSourceSelector, { type MatchCriteria } from "@/components/matching/MatchSourceSelector";
import MatchResultCard from "@/components/matching/MatchResultCard";

const TripMatching = () => {
  const [search, setSearch] = useState("");
  const [joinedTrips, setJoinedTrips] = useState<Set<string>>(new Set());
  const [isMatching, setIsMatching] = useState(false);
  const [hasMatched, setHasMatched] = useState(false);
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria | null>(null);

  const generateResults = (criteria: MatchCriteria) => {
    return mockTrips
      .filter((t) => t.isPublic)
      .filter((t) => {
        // Don't show the selected trip in results
        if (criteria.type === "trip" && t.id === criteria.tripId) return false;
        return true;
      })
      .map((t) => {
        let score = t.matchPercentage ?? Math.floor(Math.random() * 40 + 50);

        if (criteria.type === "trip") {
          const sourceTrip = mockTrips.find((m) => m.id === criteria.tripId);
          if (sourceTrip) {
            const sharedTags = t.tags.filter((tag) => sourceTrip.tags.includes(tag)).length;
            const tagBonus = sharedTags * 10;
            const destBonus = t.destination.toLowerCase().includes(sourceTrip.destination.toLowerCase()) ? 20 : 0;
            score = Math.min(98, Math.floor(50 + tagBonus + destBonus + Math.random() * 15));
          }
        } else {
          let bonus = 0;
          if (criteria.destination && t.destination.toLowerCase().includes(criteria.destination.toLowerCase())) bonus += 25;
          if (criteria.tags?.length) {
            const shared = t.tags.filter((tag) => criteria.tags!.some((ct) => tag.toLowerCase().includes(ct.toLowerCase()))).length;
            bonus += shared * 10;
          }
          score = Math.min(98, Math.floor(40 + bonus + Math.random() * 20));
        }

        return { ...t, matchPercentage: score };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const handleMatch = (criteria: MatchCriteria) => {
    setIsMatching(true);
    setMatchCriteria(criteria);
    // Simulate API call
    setTimeout(() => {
      setIsMatching(false);
      setHasMatched(true);
      toast({
        title: "Matching Complete!",
        description: `Found matching trips based on your ${criteria.type === "trip" ? "selected trip" : "custom criteria"}.`,
      });
    }, 1500);
  };

  const handleJoin = (id: string, name: string) => {
    setJoinedTrips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ title: "Left trip", description: `You left "${name}"` });
      } else {
        next.add(id);
        toast({ title: "Joined trip!", description: `You joined "${name}"` });
      }
      return next;
    });
  };

  const results = matchCriteria ? generateResults(matchCriteria) : [];

  const filtered = results.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-accent py-16">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-ocean)" }} />
        <div className="  relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <GitCompareArrows className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Trip Matching
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Find public trips that match your travel style. Pick one of your trips or enter custom criteria.
          </p>
        </div>
      </section>

      {/* Match Source Selector */}
      <div className="  py-8">
        <div className="mx-auto max-w-2xl">
          <MatchSourceSelector onMatch={handleMatch} isMatching={isMatching} />
        </div>
      </div>

      {/* Results */}
      {hasMatched && (
        <div className="container mx-auto pb-12">
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

          <div className="space-y-4 ">
            {filtered.map((trip, i) => (
              <MatchResultCard
                key={trip.id}
                trip={trip}
                index={i}
                joined={joinedTrips.has(trip.id)}
                onJoin={handleJoin}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <GitCompareArrows className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No matching trips found</p>
              <p className="text-sm">Try different criteria or a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripMatching;
