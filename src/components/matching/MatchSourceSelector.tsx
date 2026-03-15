import { useState } from "react";
import { Briefcase, SlidersHorizontal, MapPin, Calendar, Users, Tag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTrips, aiTripPreferences, type Trip } from "@/data/mockData";

export interface MatchCriteria {
  type: "trip" | "custom";
  tripId?: string;
  destination?: string;
  tags?: string[];
  travelers?: number;
  budget?: string;
}

interface MatchSourceSelectorProps {
  onMatch: (criteria: MatchCriteria) => void;
  isMatching: boolean;
}

const myTrips = mockTrips; // In real app, filter by current user

const MatchSourceSelector = ({ onMatch, isMatching }: MatchSourceSelectorProps) => {
  const [mode, setMode] = useState<"trip" | "custom">("trip");
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [destination, setDestination] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");

  const selectedTrip = myTrips.find((t) => t.id === selectedTripId);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleMatch = () => {
    if (mode === "trip") {
      if (!selectedTripId) return;
      onMatch({ type: "trip", tripId: selectedTripId });
    } else {
      onMatch({
        type: "custom",
        destination,
        tags: selectedTags,
        travelers: travelers ? parseInt(travelers) : undefined,
        budget: budget || undefined,
      });
    }
  };

  const allTags = [...new Set(aiTripPreferences.interests)];

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold text-card-foreground mb-4">
          How do you want to match?
        </h2>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "trip" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setMode("trip")}
          >
            <Briefcase className="h-4 w-4" />
            From My Trips
          </Button>
          <Button
            variant={mode === "custom" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setMode("custom")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Custom Criteria
          </Button>
        </div>

        {mode === "trip" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select one of your trips to find similar public trips from other travelers.
            </p>
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a trip..." />
              </SelectTrigger>
              <SelectContent>
                {myTrips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {trip.name} — {trip.destination}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTrip && (
              <div className="rounded-lg border bg-accent/50 p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedTrip.image}
                    alt={selectedTrip.name}
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{selectedTrip.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {selectedTrip.destination}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {selectedTrip.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your preferences to find matching public trips.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Japan, Italy..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Number of travelers"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="pl-10"
                    min={1}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Budget</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range..." />
                </SelectTrigger>
                <SelectContent>
                  {aiTripPreferences.budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Interests <span className="text-muted-foreground font-normal">({selectedTags.length} selected)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          className="mt-6 w-full gap-2"
          onClick={handleMatch}
          disabled={isMatching || (mode === "trip" && !selectedTripId)}
        >
          {isMatching ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Finding Matches...
            </>
          ) : (
            <>
              <SlidersHorizontal className="h-4 w-4" />
              Find Matching Trips
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchSourceSelector;
