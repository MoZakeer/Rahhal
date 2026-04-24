import { useState, useEffect, useRef } from "react";
import { Briefcase, SlidersHorizontal, Users, DollarSign, Loader2, Search, Calendar, User, Clock } from "lucide-react";
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
  gender?: number;
  ageGroup?: number;
  startDate?: string;
  endDate?: string;
}

interface MatchSourceSelectorProps {
  onMatch: (criteria: MatchCriteria) => void;
  isMatching: boolean;
}

const genderOptions = [
  { id: 0, name: "Any / Mixed" },
  { id: 1, name: "Male Only" },
  { id: 2, name: "Female Only" },
];

const ageGroupOptions = [
  { id: 1, name: "Youth (18-25)" },
  { id: 2, name: "Adults (26-40)" },
  { id: 3, name: "Seniors (40+)" },
  { id: 4, name: "All Ages / Family" }, 
];

const MatchSourceSelector = ({ onMatch, isMatching }: MatchSourceSelectorProps) => {
  const [mode, setMode] = useState<"trip" | "custom">("custom");

  const [destinations, setDestinations] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [tripSearch, setTripSearch] = useState("");
  const [debouncedTripSearch, setDebouncedTripSearch] = useState("");
  const [tripPage, setTripPage] = useState(1);
  const [hasMoreTrips, setHasMoreTrips] = useState(true);
  const [isFetchingTrips, setIsFetchingTrips] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [destinationId, setDestinationId] = useState("ANY");
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[]>([]);
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");
  const [gender, setGender] = useState<string>("0"); // Default Any
  const [ageGroup, setAgeGroup] = useState<string>("1"); // Default
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [destRes, prefRes] = await Promise.all([
          fetch("https://rahhal-api.runasp.net/City/GetAll?SortByLastAdded=true"),
          fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll?SortByLastAdded=true")
        ]);

        if (destRes.ok) {
          const d = await destRes.json();
          if (d.isSuccess) setDestinations(d.data);
        }
        if (prefRes.ok) {
          const p = await prefRes.json();
          if (p.isSuccess) setPreferences(p.data);
        }
      } catch (error) {
        console.error("Error fetching match data", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTripSearch(tripSearch);
      setTripPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [tripSearch]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (mode !== "trip") return;
      setIsFetchingTrips(true);
      try {
        let token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : "";
        let url = `https://rahhal-api.runasp.net/TripManagement/GetMyTrips?pageNumber=${tripPage}&pageSize=15&SortByLastAdded=true`;
        if (debouncedTripSearch.trim()) {
          url += `&SearchTerm=${encodeURIComponent(debouncedTripSearch.trim())}`;
        }

        const res = await fetch(url, { headers: { 'accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } });
        const data = await res.json();
        if (data.isSuccess && data.data?.items) {
          if (tripPage === 1) {
            setMyTrips(data.data.items);
          } else {
            setMyTrips(prev => {
              const existingIds = new Set(prev.map(t => t.tripId));
              const newTrips = data.data.items.filter((t: any) => !existingIds.has(t.tripId));
              return [...prev, ...newTrips];
            });
          }
          setHasMoreTrips(tripPage < (data.data.pages || 1));
        } else {
          if (tripPage === 1) setMyTrips([]);
          setHasMoreTrips(false);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsFetchingTrips(false);
      }
    };
    fetchTrips();
  }, [debouncedTripSearch, tripPage, mode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreTrips && !isFetchingTrips) {
          setTripPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMoreTrips, isFetchingTrips, mode]);

  const togglePreference = (id: string) => {
    setSelectedPreferenceIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleAutoFillFromTrip = (selectedTripId: string) => {
    const trip = myTrips.find((t) => t.tripId === selectedTripId);
    
    if (trip) {
      const destName = trip.destinationName || trip.destination;
      if (destName) {
        const matchingDest = destinations.find(
          d => d.name.toLowerCase().trim() === destName.toLowerCase().trim()
        );
        setDestinationId(matchingDest ? matchingDest.id : "ANY");
      } else {
        setDestinationId("ANY");
      }

      const travelersCount = trip.numberOfTravelers || trip.numberOfUser;
      setTravelers(travelersCount ? travelersCount.toString() : "");

      setBudget(trip.budget ? trip.budget.toString() : "");

      if (trip.gender !== undefined && trip.gender !== null) {
        setGender(trip.gender.toString());
      }
      if (trip.ageGroup !== undefined && trip.ageGroup !== null) {
        setAgeGroup(trip.ageGroup.toString());
      }

      if (trip.startDate) {
        setStartDate(new Date(trip.startDate).toISOString().split('T')[0]);
      }
      if (trip.endDate) {
        setEndDate(new Date(trip.endDate).toISOString().split('T')[0]);
      }

      const prefs = trip.travelPreferences || trip.travelPreference;
      if (prefs && prefs.length > 0) {
        const matchedIds = prefs.map((tripPref: any) => {
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

      toast.success(`تم ملء البيانات من رحلة "${trip.title || trip.name}"`);
      setMode("custom");
    }
  };

  const handleMatch = () => {
    onMatch({
      destinationId: destinationId !== "ANY" ? destinationId : undefined,
      preferenceIds: selectedPreferenceIds,
      travelers: travelers ? parseInt(travelers) : undefined,
      budget: budget ? parseFloat(budget) : undefined,
      gender: gender ? parseInt(gender) : undefined,
      ageGroup: ageGroup ? parseInt(ageGroup) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  if (isLoadingData) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6 flex justify-center"><Loader2 className="animate-spin text-primary" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold text-card-foreground mb-4">
          How do you want to match?
        </h2>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-start">
          <Button variant={mode === "custom" ? "default" : "outline"} size="sm" className="w-full gap-2 sm:w-auto" onClick={() => setMode("custom")}>
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>Custom Criteria</span>
          </Button>
          <Button variant={mode === "trip" ? "default" : "outline"} size="sm" className="w-full gap-2 sm:w-auto" onClick={() => setMode("trip")}>
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>Auto-fill from My Trips</span>
          </Button>
        </div>

        {mode === "trip" ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-muted-foreground">Select one of your trips to auto-fill the custom form with its details.</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search your trips by name..." value={tripSearch} onChange={(e) => setTripSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-slate-50/50 p-2 space-y-1">
              {myTrips.length === 0 && !isFetchingTrips ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No trips found.</div>
              ) : (
                myTrips.map((trip) => (
                  <button key={trip.tripId} onClick={() => handleAutoFillFromTrip(trip.tripId)} className="w-full text-left px-4 py-3 text-sm font-medium rounded-lg bg-white border border-transparent hover:border-primary/20 hover:shadow-sm hover:text-primary transition-all">
                    {trip.title}
                  </button>
                ))
              )}
              {isFetchingTrips && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
              <div ref={observerTarget} className="h-2 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            
            <div className="grid gap-4 sm:grid-cols-3">
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
                  <Input type="number" placeholder="Any" value={travelers} onChange={(e) => setTravelers(e.target.value)} className="pl-10" min={1} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" placeholder="e.g. 1500" value={budget} onChange={(e) => setBudget(e.target.value)} className="pl-10" min={0} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Age Group</label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger><SelectValue placeholder="Select Age Group" /></SelectTrigger>
                  <SelectContent>
                    {ageGroupOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🔥 الصف الثالث: التواريخ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10" />
                </div>
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

        <Button className="mt-6 w-full gap-2" onClick={handleMatch} disabled={isMatching || mode === "trip"}>
          {isMatching ? <><Loader2 className="h-4 w-4 animate-spin" /> Finding Matches...</> : <><SlidersHorizontal className="h-4 w-4" /> Find Matching Trips</>}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchSourceSelector;