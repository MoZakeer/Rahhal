import { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  SlidersHorizontal,
  Users,
  DollarSign,
  Loader2,
  Search,
  Calendar,
  Sparkles,
  MapPin,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
  initialData?: MatchCriteria | null;
  destinations: any[];
}

const genderOptions = [
  { id: 0, name: "Male Only" },
  { id: 1, name: "Female Only" },
  { id: 2, name: "Any / Mixed" },
];

const ageGroupOptions = [
  { id: 1, name: "Kid" },
  { id: 2, name: "Young (18-25)" },
  { id: 3, name: "Middle Age (26-40)" },
  { id: 4, name: "Old (40+)" },
];

const MatchSourceSelector = ({
  onMatch,
  isMatching,
  initialData,
  destinations,
}: MatchSourceSelectorProps) => {
  const [mode, setMode] = useState<"trip" | "custom">("custom");

  const [preferences, setPreferences] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [tripSearch, setTripSearch] = useState("");
  const [debouncedTripSearch, setDebouncedTripSearch] = useState("");
  const [tripPage, setTripPage] = useState(1);
  const [hasMoreTrips, setHasMoreTrips] = useState(true);
  const [isFetchingTrips, setIsFetchingTrips] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [destinationId, setDestinationId] = useState(initialData?.destinationId || "ANY");
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[]>(initialData?.preferenceIds || []);
  const [travelers, setTravelers] = useState(initialData?.travelers?.toString() || "");
  const [budget, setBudget] = useState(initialData?.budget?.toString() || "");
  const [gender, setGender] = useState<string>(initialData?.gender?.toString() || "");
  const [ageGroup, setAgeGroup] = useState<string>(initialData?.ageGroup?.toString() || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");

  const [openDest, setOpenDest] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{
    destination?: string;
    travelers?: string;
    budget?: string;
    dates?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setDestinationId(initialData.destinationId || "ANY");
      setSelectedPreferenceIds(initialData.preferenceIds || []);
      setTravelers(initialData.travelers?.toString() || "");
      setBudget(initialData.budget?.toString() || "");
      setGender(initialData.gender?.toString() || "");
      setAgeGroup(initialData.ageGroup?.toString() || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
    }
  }, [initialData]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefRes = await fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll?SortByLastAdded=true");
        if (prefRes.ok) {
          const p = await prefRes.json();
          if (p.isSuccess) setPreferences(p.data);
        }
      } catch (error) {
        console.error("Error fetching preferences", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchPreferences();
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
        let token = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).token
          : "";
        let url = `https://rahhal-api.runasp.net/TripManagement/GetMyTrips?pageNumber=${tripPage}&pageSize=15&SortByLastAdded=true`;
        if (debouncedTripSearch.trim()) {
          url += `&SearchTerm=${encodeURIComponent(debouncedTripSearch.trim())}`;
        }

        const res = await fetch(url, {
          headers: {
            accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (data.isSuccess && data.data?.items) {
          if (tripPage === 1) {
            setMyTrips(data.data.items);
          } else {
            setMyTrips((prev) => {
              const existingIds = new Set(prev.map((t) => t.tripId));
              const newTrips = data.data.items.filter(
                (t: any) => !existingIds.has(t.tripId),
              );
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
      { threshold: 0.1 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMoreTrips, isFetchingTrips, mode]);

  const togglePreference = (id: string) => {
    setSelectedPreferenceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleAutoFillFromTrip = (selectedTripId: string) => {
    const trip = myTrips.find((t) => t.tripId === selectedTripId);

    if (trip) {
      const destName = trip.destinationName || trip.destination;
      if (destName) {
        const matchingDest = destinations.find(
          (d) => d.name.toLowerCase().trim() === destName.toLowerCase().trim(),
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
      } else {
        setGender("");
      }

      if (trip.ageGroup !== undefined && trip.ageGroup !== null) {
        setAgeGroup(trip.ageGroup.toString());
      } else {
        setAgeGroup("");
      }

      if (trip.startDate) {
        setStartDate(new Date(trip.startDate).toISOString().split("T")[0]);
      }
      if (trip.endDate) {
        setEndDate(new Date(trip.endDate).toISOString().split("T")[0]);
      }

      const prefs = trip.travelPreferences || trip.travelPreference;
      if (prefs && prefs.length > 0) {
        const matchedIds = prefs
          .map((tripPref: any) => {
            const match = preferences.find(
              (p) =>
                p.id.toLowerCase() === tripPref.id?.toLowerCase() ||
                p.name.toLowerCase().trim() ===
                tripPref.name?.toLowerCase().trim(),
            );
            return match ? match.id.toLowerCase() : null;
          })
          .filter(Boolean);

        setSelectedPreferenceIds(matchedIds as string[]);
      } else {
        setSelectedPreferenceIds([]);
      }

      setErrors({}); // مسح أي أخطاء سابقة عند عمل Auto-fill
      toast.success(`Data filled from "${trip.title || trip.name}"`);
      setMode("custom");
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMatch = () => {
    const newErrors: { destination?: string; travelers?: string; budget?: string; dates?: string } = {};
    let isValid = true;
    const errorFields: string[] = [];

    // 1. Validate Destination
    if (!destinationId || destinationId === "ANY") {
      newErrors.destination = "Please select a destination";
      errorFields.push("Destination");
      isValid = false;
    }

    // 2. Validate Travelers
    if (!travelers || parseInt(travelers) < 1) {
      newErrors.travelers = "Required";
      errorFields.push("Travelers");
      isValid = false;
    }

    // 3. Validate Budget
    if (!budget || parseFloat(budget) <= 0) {
      newErrors.budget = "Required";
      errorFields.push("Budget");
      isValid = false;
    }

    // 4. Validate Dates
    if (!startDate || !endDate) {
      newErrors.dates = "Both dates are required";
      errorFields.push("Dates");
      isValid = false;
    } else if (new Date(startDate) > new Date(endDate)) {
      newErrors.dates = "Start date cannot be after end date";
      errorFields.push("Valid Dates");
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error(`Please check the following: ${errorFields.join(", ")}`);
      return;
    }

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

  // --- Common Input Styles for Minimalist UI ---
  const inputClass = "bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100/50 rounded-xl transition-all h-12 shadow-none";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block ml-1";

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* --- iOS Style Segmented Control --- */}
      <div className="flex p-1.5 mb-8 bg-slate-100/80 rounded-2xl border border-slate-200/50 w-full md:w-fit mx-auto relative">
        <button
          onClick={() => setMode("custom")}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${mode === "custom" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" />
          Set Criteria
          {mode === "custom" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10"
            />
          )}
        </button>
        <button
          onClick={() => setMode("trip")}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${mode === "trip" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
        >
          <Briefcase className="h-4 w-4 shrink-0" />
          Auto-fill
          {mode === "trip" && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10" />
          )}
        </button>
      </div>

      {/* --- Animated Content Area --- */}
      <AnimatePresence mode="wait">
        {mode === "trip" ? (
          <motion.div
            key="trip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Magic Auto-fill</h3>
              <p className="text-sm text-slate-500">Select one of your existing trips. We'll extract the data and find you similar companions.</p>
            </div>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search your trips by name..."
                value={tripSearch}
                onChange={(e) => setTripSearch(e.target.value)}
                className={`pl-12 text-base ${inputClass}`}
              />
            </div>

            <div className="max-w-xl mx-auto max-h-[300px] overflow-y-auto rounded-2xl bg-white border border-slate-100 p-2 space-y-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] custom-scrollbar">
              {myTrips.length === 0 && !isFetchingTrips ? (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                  <Briefcase className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No trips found.</p>
                </div>
              ) : (
                myTrips.map((trip) => (
                  <button
                    key={trip.tripId}
                    onClick={() => handleAutoFillFromTrip(trip.tripId)}
                    className="w-full group flex items-center justify-between text-left px-4 py-3.5 rounded-xl bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900">{trip.title}</h4>
                      {trip.destination && <p className="text-xs text-slate-400 mt-0.5">{trip.destination}</p>}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  </button>
                ))
              )}
              {isFetchingTrips && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              <div ref={observerTarget} className="h-4 w-full" />
            </div>
          </motion.div>

        ) : (

          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Row 1 */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Destination</label>
                <Popover open={openDest} onOpenChange={setOpenDest}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDest}
                      className={cn(
                        "w-full justify-start pl-11 text-left font-normal relative",
                        inputClass,
                        errors.destination ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-100/50" : ""
                      )}
                    >
                      <MapPin className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 z-10", errors.destination ? "text-red-400" : "text-slate-400")} />
                      {destinationId === "ANY"
                        ? "Anywhere"
                        : destinations.find((d) => d.id === destinationId)?.name || "Select City..."}
                      <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-slate-100" align="start">
                    <Command className="rounded-xl">
                      <CommandInput placeholder="Search city..." className="h-11" />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup className="max-h-[250px] overflow-y-auto">
                        <CommandItem
                          value="any"
                          onSelect={() => { setDestinationId("ANY"); setOpenDest(false); clearError("destination"); }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Check className={cn("h-4 w-4", destinationId === "ANY" ? "opacity-100" : "opacity-0")} />
                          Any Destination
                        </CommandItem>
                        {destinations.map((d) => (
                          <CommandItem
                            key={d.id}
                            value={d.name}
                            onSelect={() => { setDestinationId(d.id); setOpenDest(false); clearError("destination"); }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Check className={cn("h-4 w-4", destinationId === d.id ? "opacity-100" : "opacity-0")} />
                            {d.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.destination && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.destination}</p>}
              </div>

              <div>
                <label className={labelClass}>Travelers</label>
                <div className="relative">
                  <Users className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", errors.travelers ? "text-red-400" : "text-slate-400")} />
                  <Input
                    type="number"
                    placeholder="Any"
                    value={travelers}
                    onChange={(e) => { setTravelers(e.target.value); clearError("travelers"); }}
                    className={cn(`pl-11 ${inputClass}`, errors.travelers ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-100/50" : "")}
                    min={1}
                  />
                </div>
                {errors.travelers && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.travelers}</p>}
              </div>

              <div>
                <label className={labelClass}>Budget ($)</label>
                <div className="relative">
                  <DollarSign className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", errors.budget ? "text-red-400" : "text-slate-400")} />
                  <Input
                    type="number"
                    placeholder="e.g. 1500"
                    value={budget}
                    onChange={(e) => { setBudget(e.target.value); clearError("budget"); }}
                    className={cn(`pl-11 ${inputClass}`, errors.budget ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-100/50" : "")}
                    min={0}
                  />
                </div>
                {errors.budget && <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">{errors.budget}</p>}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Companion Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {genderOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={labelClass}>Age Group</label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Age Group" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {ageGroupOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Dates */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Start Date</label>
                <div className="relative">
                  <Calendar className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", errors.dates ? "text-red-400" : "text-slate-400")} />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); clearError("dates"); }}
                    className={cn(`pl-11 ${inputClass}`, errors.dates ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-100/50" : "")}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <div className="relative">
                  <Calendar className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", errors.dates ? "text-red-400" : "text-slate-400")} />
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => { setEndDate(e.target.value); clearError("dates"); }}
                    className={cn(`pl-11 ${inputClass}`, errors.dates ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-100/50" : "")}
                  />
                </div>
              </div>
              {errors.dates && <p className="text-red-500 text-xs font-medium ml-1 sm:col-span-2 -mt-2">{errors.dates}</p>}
            </div>

            {/* Preferences (Pills) */}
            <div>
              <label className={labelClass}>
                Vibe & Preferences
                {selectedPreferenceIds.length > 0 && (
                  <span className="ml-2 text-slate-400 normal-case font-medium">({selectedPreferenceIds.length} selected)</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2.5 mt-3">
                {preferences.map((pref) => {
                  const isSelected = selectedPreferenceIds.includes(pref.id);
                  return (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      {pref.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100">
              <Button
                className="w-full sm:w-auto min-w-[240px] h-14 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground shadow-lg text-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
                onClick={handleMatch}
                disabled={isMatching}
              >
                {isMatching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Scanning Database...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 opacity-80" /> Find Perfect Match
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchSourceSelector;