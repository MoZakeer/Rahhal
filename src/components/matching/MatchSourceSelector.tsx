import { useState, useEffect } from "react";
import { Briefcase, SlidersHorizontal, Users, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export interface MatchCriteria {
  destinationId?: string;
  preferenceIds?: string[];
  travelers?: number;
  budget?: number;
}

interface MatchSourceSelectorProps {
  onMatch: (criteria: MatchCriteria) => void;
  isMatching: boolean;
}

const MatchSourceSelector = ({ onMatch, isMatching }: MatchSourceSelectorProps) => {
  const [mode, setMode] = useState<"trip" | "custom">("custom");

  // داتا من الـ APIs
  const [destinations, setDestinations] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [myTrips, setMyTrips] = useState<any[]>([]); // تم التغيير لـ MyTrips
  const [isLoadingData, setIsLoadingData] = useState(true);

  // حقول الفورم
  const [destinationId, setDestinationId] = useState("");
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[]>([]);
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        let token = localStorage.getItem("token") || "";
        token = token.replace(/^"(.*)"$/, '$1');

        const headers = { 'accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };

        // استخدام الـ Endpoint الجديد GetMyTrips
        const [destRes, prefRes, myTripsRes] = await Promise.all([
          fetch("https://rahhal-api.runasp.net/City/GetAll?SortByLastAdded=true"),
          fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll?SortByLastAdded=true"),
          fetch("https://rahhal-api.runasp.net/TripManagement/GetMyTrips?pageNumber=1&pageSize=50", { headers })
        ]);

        if (destRes.ok) {
          const d = await destRes.json();
          if (d.isSuccess) setDestinations(d.data);
        }
        if (prefRes.ok) {
          const p = await prefRes.json();
          if (p.isSuccess) setPreferences(p.data);
        }
        if (myTripsRes.ok) {
          const m = await myTripsRes.json();
          if (m.isSuccess && m.data?.items) setMyTrips(m.data.items);
        }
      } catch (error) {
        console.error("Error fetching match data", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  const togglePreference = (id: string) => {
    setSelectedPreferenceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };


  const handleAutoFillFromTrip = (selectedTripId: string) => {
    const trip = myTrips.find((t) => t.tripId === selectedTripId);
    if (trip) {
      if (trip.destination) {
        const matchingDest = destinations.find(d => d.name.toLowerCase().trim() === trip.destination.toLowerCase().trim());
        setDestinationId(matchingDest ? matchingDest.id : "");
      } else {
        setDestinationId("");
      }

      setTravelers(trip.numberOfUser ? trip.numberOfUser.toString() : "");
      setBudget(trip.budget ? trip.budget.toString() : "");

      if (trip.travelPreference && trip.travelPreference.length > 0) {
        const matchedIds = trip.travelPreference.map((tripPref: any) => {
          const match = preferences.find(p =>
            p.id.toLowerCase() === tripPref.id?.toLowerCase() ||
            p.name.toLowerCase().trim() === tripPref.name?.toLowerCase().trim()
          );
          return match ? match.id.toLowerCase() : null;
        }).filter(Boolean);

        setSelectedPreferenceIds(matchedIds as string[]);
      } else {
        setSelectedPreferenceIds([]);
      }

      toast.success(`Form auto-filled with details from "${trip.title || 'selected trip'}"`);
      setMode("custom");
    }
  };

  const handleMatch = () => {
    onMatch({
      destinationId: destinationId || undefined,
      preferenceIds: selectedPreferenceIds,
      travelers: travelers ? parseInt(travelers) : undefined,
      budget: budget ? parseFloat(budget) : undefined,
    });
  };

  if (isLoadingData) {
    return (
      <Card className="border-2 border-primary/20"><CardContent className="p-6 flex justify-center"><Loader2 className="animate-spin text-primary" /></CardContent></Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold text-card-foreground mb-4">
          How do you want to match?
        </h2>

        {/* Mode Tabs */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-start">
          <Button
            variant={mode === "custom" ? "default" : "outline"}
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setMode("custom")}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>Custom Criteria</span>
          </Button>

          <Button
            variant={mode === "trip" ? "default" : "outline"}
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setMode("trip")}
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>Auto-fill from My Trips</span>
          </Button>
        </div>

        {mode === "trip" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select one of your trips (Created, Joined, or Saved) to auto-fill the custom form with its details.</p>
            {myTrips.length === 0 ? (
              <div className="p-4 bg-muted text-center rounded text-sm text-muted-foreground">You don't have any trips yet.</div>
            ) : (
              <Select onValueChange={handleAutoFillFromTrip}>
                <SelectTrigger><SelectValue placeholder="Choose a trip to extract details..." /></SelectTrigger>
                <SelectContent>
                  {myTrips.map((trip) => (
                    // لاحظ استخدام tripId و title
                    <SelectItem key={trip.tripId} value={trip.tripId}>{trip.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Destination</label>
                <Select value={destinationId} onValueChange={setDestinationId}>
                  <SelectTrigger><SelectValue placeholder="Any Destination" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">Any Destination</SelectItem>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" placeholder="Any number" value={travelers} onChange={(e) => setTravelers(e.target.value)} className="pl-10" min={1} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Max Budget ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" placeholder="e.g. 1500" value={budget} onChange={(e) => setBudget(e.target.value)} className="pl-10" min={0} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Preferences <span className="text-muted-foreground font-normal">({selectedPreferenceIds.length} selected)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {preferences.map((pref) => (
                  <Badge
                    key={pref.id}
                    variant={selectedPreferenceIds.includes(pref.id) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => togglePreference(pref.id)}
                  >
                    {pref.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          className="mt-6 w-full gap-2"
          onClick={handleMatch}
          disabled={isMatching || mode === "trip"}
        >
          {isMatching ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Finding Matches...</>
          ) : (
            <><SlidersHorizontal className="h-4 w-4" /> Find Matching Trips</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchSourceSelector;