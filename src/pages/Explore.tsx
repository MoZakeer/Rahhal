import { useState } from "react";
import { Search, SlidersHorizontal, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TripCard from "@/components/TripCard";
import { mockTrips } from "@/data/mockData";
import heroImage from "@/assets/hero-travel.jpg";

const filters = ["All", "Beach", "Mountains", "Culture", "Luxury", "Adventure", "Food", "Nature", "Wellness"];

const Explore = () => {
  const [trips, setTrips] = useState(mockTrips);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const toggleFavorite = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const filtered = trips.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || t.tags.includes(activeFilter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
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

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Badge
              key={f}
              variant={activeFilter === f ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} trips found</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trip, i) => (
            <div key={trip.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <TripCard trip={trip} onToggleFavorite={toggleFavorite} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Compass className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No trips found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
