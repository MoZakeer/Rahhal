import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TripCard from "@/components/TripCard";
import { mockTrips } from "@/data/mockData";

const tabs = ["All", "Upcoming", "Past", "Favorites"];

const MyTrips = () => {
  const [trips, setTrips] = useState(mockTrips);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const toggleFavorite = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const now = new Date();

  const filtered = trips.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    switch (activeTab) {
      case "Upcoming":
        return new Date(t.startDate) >= now;
      case "Past":
        return new Date(t.endDate) < now;
      case "Favorites":
        return t.isFavorite;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-accent py-12">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  My Trips
                </h1>
                <p className="text-sm text-muted-foreground">
                  {trips.length} trips in your collection
                </p>
              </div>
            </div>
            <Link to="/create-trip">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Trip
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs & Search */}
      <div className="container mx-auto pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Badge
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 transition-colors"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Badge>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search my trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto py-8">
        <p className="mb-4 text-sm text-muted-foreground">{filtered.length} trips</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trip, i) => (
            <div key={trip.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <TripCard trip={trip} onToggleFavorite={toggleFavorite} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Briefcase className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No trips found</p>
            <p className="mt-1 text-sm">
              {activeTab === "Favorites"
                ? "You haven't favorited any trips yet"
                : "Try a different search or filter"}
            </p>
            <Link to="/create-trip" className="mt-4">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
