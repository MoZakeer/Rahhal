import { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Compass,
  DollarSign,
  Users,
  Calendar,
  ChevronRight,
  Info,
  Clock,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { usePageInView } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
// import type { S } from "node_modules/framer-motion/dist/types.d-DOCC-kZB";

type PlannerForm = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  budget: number;
  destinationId: string;
  countryId: string;
  gender: number;
  ageGroup: number;
  travelPreferencesId: string[];
  user_interests: string[];
  user_governorate: string;
  user_days: number;
  activity_level: ActivityLevel;
  user_budget: number;
  user_start_date: string;
  user_end_date: string;
};

const interestsList = [
  "General Activities",
  "Curious",
  "Shopping",
  "Beach & Relaxation",
  "Walking & Explore",
  "Excited",
];
interface Preference {
  id: string;
  name: string;
}
interface City {
  id: string;
  name: string;
}
interface Recommendation {
  Name: string;
  Description: string;
  Image: string;
  Category: string;
  Location: string;
  TicketPrice: number;
}
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
}
interface AIRecommendation {
  Name: string;
  Description: string;
  Image: string;
  Government: string;
  Category: string;
  Location: string;
  Latitude: string | number;
  Longitude: number;
  OpenTime: string;
  CloseTime: string;
  TicketPrice: number;
  Duration: number;
}

interface AIPlace {
  place: string;
  arrival_time: string;
  departure_time: string;
  Duration: number;
  Ticket_Price: number;
  Category: string;
  Government: string;
  Description: string;
  Image: string;
  Location: string;
  List_of_recommendations: AIRecommendation[];
}
const SafeImage = ({ src, alt, className, category }: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Fallback map based on category
  const getFallback = (cat?: string) => {
    const categoryLower = cat?.toLowerCase() || "";
    if (categoryLower.includes("beach"))
      return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80";
    if (categoryLower.includes("restaurant") || categoryLower.includes("food"))
      return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80";
    if (categoryLower.includes("historic"))
      return "https://images.unsplash.com/photo-1548013146-72479768bbaa?w=500&q=80";
    return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&q=80"; // Nature/General
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`${className} ${hasError ? "opacity-80" : "opacity-100"}`}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(getFallback(category));
        }
      }}
    />
  );
};
interface Place {
  place: string;
  arrival_time: string;
  departure_time: string;
  Duration: number;
  Ticket_Price: number;
  Category: string;
  Description: string;
  Image: string;
  Location: string;
  List_of_recommendations?: Recommendation[];
}
type ActivityLevel = "Relaxed" | "Moderate" | "Active";

const AiPlanner = () => {
  usePageTitle("AI Trip Planner");
  usePageInView();
  usePageTitle("AI Trip Planner");
  type Step = "form" | "loading" | "result";

  const [step, setStep] = useState<Step>(() => {
    const savedStep = localStorage.getItem("tripStep");
    // Check if the saved string is one of our valid steps
    if (
      savedStep === "form" ||
      savedStep === "loading" ||
      savedStep === "result"
    ) {
      return savedStep;
    }
    return "form";
  });
  const [result, setResult] = useState<Place[][]>(
    JSON.parse(localStorage.getItem("lastResult") || "[]"),
  );
  const [cities, setCities] = useState<City[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [countries, setCountries] = useState<City[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [form, setForm] = useState<PlannerForm>(() => {
    const savedForm = localStorage.getItem("rahhal_trip_form");
    return savedForm
      ? JSON.parse(savedForm)
      : {
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          numberOfTravelers: 1,
          budget: 0,
          destinationId: "",
          countryId: "",
          gender: 0,
          ageGroup: 1,
          travelPreferencesId: [],
          user_interests: [],
          user_governorate: "",
          user_days: 1,
          activity_level: "Moderate",
          user_budget: 0,
          user_end_date: "",
          user_start_date: "",
        };
  });
  const isInterestValid =
    form.user_interests.includes("General Activities") ||
    form.user_interests.length >= 3;
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if we clicked completely outside both search areas
      if (
        !target.closest(".city-search-container") &&
        !target.closest(".country-search-container")
      ) {
        setCityOpen(false);
        setCountryOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const handleCityInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    setCityOpen((prev) => !prev); // Toggles City
    setCountryOpen(false); // Always closes Country
  };

  const handleCountryInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    setCountryOpen((prev) => !prev); // Toggles Country
    setCityOpen(false); // Always closes City
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, prefRes, countryres] = await Promise.all([
          fetch("https://rahhal-api.runasp.net/City/GetAll"),
          fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll"),
          fetch("https://rahhal-api.runasp.net/Country/GetAll"),
        ]);
        const cityData = await cityRes.json();
        const prefData = await prefRes.json();
        const countryData = await countryres.json();

        setCities(cityData.data || []);
        setPreferences(prefData.data || []);
        setCountries(countryData.data || []);
      } catch {
        toast.error("Failed to load travel data");
      }
    };
    fetchData();
  }, []);
  const today = new Date().toISOString().split("T")[0];
  const toggleInterest = (item: string) => {
    setForm((prev) => ({
      ...prev,
      user_interests: prev.user_interests.includes(item)
        ? prev.user_interests.filter((i) => i !== item)
        : [...prev.user_interests, item],
    }));
  };
  const calculateEndDate = (start: string, days: number) => {
    const date = new Date(start);
    date.setDate(date.getDate() + (days - 1)); // -1 because day 1 is the start date
    return date.toISOString().split("T")[0];
  };
  const handleGenerate = async () => {
    // 1. Basic Field Checks
    if (!form.destinationId) return toast.error("Please select a destination");
    if (!form.user_start_date) return toast.error("Please select a start date");
    if (form.numberOfTravelers < 1)
      return toast.error("At least 1 traveler required");
    if (form.user_budget < 100)
      return toast.error(
        "Budget must be at least $100 to generate an itinerary.",
      );
    if (!form.countryId)
      return toast.error("Please select a departure country");
    // 2. Date Logic & Capping

    // 3. Sync the 'user_days' state and enforce the 5-day limit

    if (form.user_days > 5) {
      toast.warning(
        "Our AI planner is currently limited to 5 days. We'll generate the first 5 days of your trip!",
      );
    }

    // 4. Preference & Interest Checks
    if (form.travelPreferencesId.length === 0)
      return toast.error("Select at least one travel preference");

    if (!isInterestValid)
      return toast.error("Select 3 interests or 'General Activities'");
    setStep("loading");

    try {
      // --- STEP A: GENERATE (AI POST) ---
      const genRes = await fetch(
        "https://3tito-rahhalplanner.hf.space/generate_trip",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_interests: form.user_interests,
            user_governorate: form.user_governorate,
            user_days: Math.min(form.user_days, 5), // Enforce 5-day limit
            activity_level: form.activity_level,
            user_budget: form.user_budget,
            user_start_date: form.user_start_date,
            selected_events: [],
            event_times: {},
          }),
        },
      );
      if (!genRes.ok) throw new Error("Generation failed");

      // --- STEP B: RETRIEVE (AI GET) ---
      // We fetch the clean, structured itinerary to save it
      const retrieveRes = await fetch(
        "https://3tito-rahhalplanner.hf.space/generate_trip",
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
      );
      const retrieveData = await retrieveRes.json();

      if (retrieveData.status === "success" && retrieveData.itinerary) {
        // --- STEP C: SAVE TO DATABASE (RAHHAL API POST) ---
        const saveBody = {
          data: {
            itinerary: retrieveData.itinerary.map((day: AIPlace[]) =>
              day.map((item: AIPlace) => ({
                place: item.place,
                arrival_time: item.arrival_time,
                departure_time: item.departure_time,
                duration: item.Duration || 0,
                ticket_Price: item.Ticket_Price || 0, // Mapping Pascal to snake_case
                category: item.Category || "General",
                government: item.Government || form.user_governorate,
                description: item.Description || "",
                image: item.Image || "",
                location: item.Location || "",
                list_of_recommendations: (
                  item.List_of_recommendations || []
                ).map((rec) => ({
                  name: rec.Name, // Mapping Name to name
                  description: rec.Description,
                  image: rec.Image,
                  government: rec.Government,
                  category: rec.Category,
                  location: rec.Location,
                  latitude:
                    typeof rec.Latitude === "string"
                      ? parseFloat(rec.Latitude)
                      : rec.Latitude || 0,
                  longitude: rec.Longitude || 0,
                  openTime: rec.OpenTime,
                  closeTime: rec.CloseTime,
                  ticketPrice: rec.TicketPrice || 0,
                  duration: rec.Duration || 0,
                })),
              })),
            ),
          },
          name: form.name || `Trip to ${form.user_governorate}`,
          startDate: form.user_start_date,
          endDate: calculateEndDate(form.user_start_date, form.user_days),
          numberOfTravelers: form.numberOfTravelers,
          gender: form.gender,
          ageGroup: form.ageGroup,
          budget: form.user_budget,
          destinationId: form.destinationId,
          countryId: form.countryId,
          travelPreferencesId: form.travelPreferencesId,
        };
        const saveRes = await fetch(
          "https://rahhal-api.runasp.net/Plan/SavePlan",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "*/*",
              authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify(saveBody),
          },
        );
        if (saveRes.ok) {
          setResult(retrieveData.itinerary);
          setStep("result");
          localStorage.setItem(
            "lastResult",
            JSON.stringify(retrieveData.itinerary),
          );
          console.log("Saved itinerary:", retrieveData.itinerary);
          localStorage.setItem("tripStep", "result");
          toast.success("Trip planned and saved to your profile!");
        } else {
          // Even if save fails, we show the result but warn the user
          setResult(retrieveData.itinerary);
          setStep("result");
          toast.warning("Trip generated, but could not be saved.");
        }
      }
    } catch {
      toast.error("An error occurred. Please try again.");
      setStep("form");
    }
  };
  useEffect(() => {
    localStorage.setItem("tripStep", step);
    localStorage.setItem("lastResult", JSON.stringify(result));
    localStorage.setItem("tripForm", JSON.stringify(form));
  }, [step, result, form]);
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900 flex justify-center px-4 py-8 md:py-16">
      <div className="max-w-4xl w-full space-y-10">
        {/* HEADER SECTION */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/10 text-blue-900 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            AI POWERED TRAVEL
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Plan your next{" "}
            <span className="text-blue-900 italic">Adventure</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Fill in your preferences below and let our AI curate the perfect
            itinerary for your trip to Egypt.
          </p>
        </header>

        {step === "form" && (
          <div className="grid gap-8 ">
            {/* CARD 1: THE BASICS */}
            <Card className="border-none shadow-xl  rounded-3xl overflow-hidden dark:bg-slate-800">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="p-2 bg-blue-900 rounded-lg text-white">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold dark:text-slate-100">
                    Trip Logistics
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
                      Trip Name
                    </Label>
                    <Input
                      placeholder="e.g., Weekend Getaway"
                      className="rounded-xl border-slate-200 h-12 dark:bg-slate-700 dark:border-slate-700 dark:text-white dark:focus:ring-accent-foreground focus:ring-blue-900"
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div
                    className="space-y-2 relative city-search-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-600  dark:text-slate-200">
                      <MapPin className="w-4 h-4 text-blue-900" /> Destination
                      City
                    </Label>

                    <Input
                      onClick={handleCityInputClick}
                      placeholder="Search city..."
                      className="rounded-xl border-slate-200 h-12 dark:bg-slate-700 dark:text-white dark:border-slate-700"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                      }}
                    />
                    {!form.destinationId && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase italic">
                        <AlertCircle className="w-3 h-3" /> Required
                      </span>
                    )}
                    {cityOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 dark:text-white rounded-2xl shadow-2xl max-h-60 overflow-auto p-2 animate-in fade-in zoom-in-95 duration-200 dark:bg-slate-800 dark:border-slate-700">
                        {cities
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(citySearch.toLowerCase()),
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              className="px-4 py-3 hover:bg-blue-900/5  rounded-xl cursor-pointer text-sm font-medium transition-colors flex items-center justify-between group"
                              onClick={() => {
                                setForm({
                                  ...form,
                                  destinationId: c.id,
                                  user_governorate: c.name,
                                });
                                setCitySearch(c.name);
                                setCityOpen(false); // Manually close after selection
                              }}
                            >
                              <span>{c.name}</span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-900 transition-all" />
                            </div>
                          ))}

                        {cities.filter((c) =>
                          c.name
                            .toLowerCase()
                            .includes(citySearch.toLowerCase()),
                        ).length === 0 && (
                          <div className="p-4 text-center text-slate-400 text-sm">
                            No cities found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Mention any specific vibes or requirements..."
                    className="rounded-xl border-slate-200 min-h-[100px] dark:text-white resize-none dark:bg-slate-700 dark:border-slate-700"
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div
                  className="space-y-2  country-search-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-blue-900" /> Departure
                    Country
                  </Label>

                  <Input
                    onClick={handleCountryInputClick}
                    placeholder="Starting your journey from ..."
                    className="rounded-xl border-slate-200 h-12 dark:text-white dark:bg-slate-700 dark:border-slate-700"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                    }}
                  />
                  {!form.countryId && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase italic">
                      <AlertCircle className="w-3 h-3" /> Required
                    </span>
                  )}
                  {countryOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border dark:text-white border-slate-100 rounded-2xl shadow-2xl max-h-60 overflow-auto p-2 animate-in fade-in zoom-in-95 duration-200 dark:bg-slate-800 dark:border-slate-700">
                      {countries
                        .filter((c) =>
                          c.name
                            .toLowerCase()
                            .includes(countrySearch.toLowerCase()),
                        )
                        .map((c) => (
                          <div
                            key={c.id}
                            className="px-4 py-3 hover:bg-blue-900/5 rounded-xl cursor-pointer text-sm font-medium transition-colors flex items-center justify-between group"
                            onClick={() => {
                              setForm({
                                ...form,
                                countryId: c.id,
                              });
                              setCountrySearch(c.name);
                              setCountryOpen(false); // Manually close after selection
                            }}
                          >
                            <span>{c.name}</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-900 transition-all" />
                          </div>
                        ))}

                      {countries.filter((c) =>
                        c.name
                          .toLowerCase()
                          .includes(countrySearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          No countries found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className=" block text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-200">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
                      min={today}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          startDate: e.target.value,
                          user_start_date: e.target.value,
                        })
                      }
                    />
                    {!form.startDate && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase italic">
                        <AlertCircle className="w-3 h-3" /> Required
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1 dark:text-slate-200">
                      <Calendar className="w-3 h-3" /> Days
                    </Label>
                    <Input
                      type="number"
                      placeholder="1"
                      min={1}
                      max={100}
                      onKeyDown={(e) =>
                        ["-", ".", "e", "+"].includes(e.key) &&
                        e.preventDefault()
                      }
                      className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
                      value={form.user_days || ""}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (val === "") {
                          setForm({ ...form, user_days: 0 });
                          return;
                        }

                        const numValue = parseInt(val, 10);
                        const maxDays = 100;

                        if (numValue > 0 && numValue <= maxDays) {
                          setForm({ ...form, user_days: numValue });
                        }
                      }}
                    />
                    {!form.user_days && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase italic">
                        <AlertCircle className="w-3 h-3" /> Required
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1 dark:text-slate-200">
                      <DollarSign className="w-3 h-3" /> Budget
                    </Label>
                    <Input
                      type="number"
                      placeholder="dollars"
                      onKeyDown={(e) =>
                        ["-", "e", "E", "+"].includes(e.key) &&
                        e.preventDefault()
                      }
                      min={30}
                      max={9999}
                      className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
                      onChange={(e) => {
                        const value = +e.target.value;
                        const maxBudget = 9999;

                        // Validation logic
                        if (value < 0) return;
                        if (value > maxBudget) return;

                        setForm({
                          ...form,
                          user_budget: value,
                          budget: value,
                        });
                      }}
                      value={form.user_budget || ""}
                    />
                    {!form.budget && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase italic">
                        <AlertCircle className="w-3 h-3" /> Required
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: THE VIBE */}
            <Card className="border-none dark:bg-slate-800 rounded-3xl ">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="p-2 bg-blue-900 rounded-lg text-white">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold dark:text-slate-100">
                    Preferences & Interests
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Activity Level */}
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Pace of Trip
                    </Label>
                    <div className="flex gap-2">
                      {["Relaxed", "Moderate", "Active"].map((lvl) => (
                        <Badge
                          key={lvl}
                          className="flex-1 justify-center py-2.5 cursor-pointer text-sm rounded-xl transition-all border-none"
                          variant={
                            form.activity_level === lvl
                              ? "default"
                              : "secondary"
                          }
                          onClick={() =>
                            setForm({
                              ...form,
                              activity_level: lvl as ActivityLevel,
                            })
                          }
                        >
                          {lvl}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Travelers Count */}
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-1 dark:text-slate-200">
                      <Users className="w-4 h-4" /> Travelers
                    </Label>
                    <Input
                      type="number"
                      placeholder="1"
                      min={1}
                      max={100}
                      onKeyDown={(e) =>
                        ["-", ".", "e", "+"].includes(e.key) &&
                        e.preventDefault()
                      }
                      className="rounded-xl h-10 border-slate-200 dark:text-white dark:bg-slate-700 dark:border-slate-700"
                      value={form.numberOfTravelers || ""}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (val === "") {
                          setForm({ ...form, numberOfTravelers: 0 });
                          return;
                        }

                        const num = parseInt(val, 10);
                        const maxTravelers = 100;

                        if (num >= 1 && num <= maxTravelers) {
                          setForm({ ...form, numberOfTravelers: num });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Interests Pills */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Interests
                    </Label>
                    {!isInterestValid && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase italic">
                        <AlertCircle className="w-3 h-3" /> Select 3 or 'General
                        Activities'
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {interestsList.map((i) => (
                      <Badge
                        key={i}
                        className={`px-4 py-2 cursor-pointer rounded-full transition-all text-xs font-medium border-none shadow-sm ${
                          form.user_interests.includes(i)
                            ? "bg-blue-900 text-white scale-105"
                            : "bg-white dark:bg-slate-500 dark:text-white text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-400"
                        }`}
                        onClick={() => toggleInterest(i)}
                      >
                        {form.user_interests.includes(i) ? "✓ " : "+ "} {i}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Travel Preferences (Dynamic) */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Travel Preferences
                  </Label>

                  <div className="flex flex-wrap gap-2 ">
                    {preferences.map((p) => (
                      <Badge
                        key={p.id}
                        className={`px-4 py-2 cursor-pointer rounded-full transition-all text-xs font-medium border-none shadow-sm ${
                          form.travelPreferencesId.includes(p.id)
                            ? "bg-blue-900 text-white scale-105"
                            : "bg-white dark:bg-slate-500 dark:text-white text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-400"
                        }`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            travelPreferencesId:
                              prev.travelPreferencesId.includes(p.id)
                                ? prev.travelPreferencesId.filter(
                                    (id) => id !== p.id,
                                  )
                                : [...prev.travelPreferencesId, p.id],
                          }))
                        }
                      >
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Gender
                    </Label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl dark:bg-slate-700">
                      {["Any / Mixed", "Male only", "Female only"].map(
                        (g, i) => (
                          <button
                            key={g}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              form.gender === i
                                ? "bg-white dark:bg-slate-300 text-blue-900 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                            onClick={() => setForm({ ...form, gender: i })}
                          >
                            {g}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Age Range
                    </Label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl dark:bg-slate-700">
                      {[0, 1, 2, 3].map((a) => (
                        <button
                          key={a}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            form.ageGroup === a
                              ? "bg-white dark:bg-slate-300 text-blue-900 shadow-sm"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          onClick={() => setForm({ ...form, ageGroup: a })}
                        >
                          {a === 0
                            ? "All Ages"
                            : a === 1
                              ? "Youth (18-25)"
                              : a === 2
                                ? "Adults (26-40)"
                                : "Seniors (40+)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              size="lg"
              className="w-full h-16 rounded-3xl text-xl font-bold shadow-2xl shadow-blue-900/20 transition-transform active:scale-95 group"
            >
              Build My Journey{" "}
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* LOADING STATE */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-900/20 border-t-blue-900 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-900 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">
                Creating your itinerary...
              </h2>
              <p className="text-slate-500 italic">
                Finding the best spots in {form.user_governorate}
              </p>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 max-w-4xl mx-auto">
            {/* COMPACT HEADER */}
            <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-black text-blue-900 tracking-tight ">
                  {form.name || "Your Trip"}
                </h2>
              </div>
              <Button
                size="sm"
                className="rounded-xl font-bold border-slate-200 dark:border-slate-700 dark:text-white"
                onClick={() => setStep("form")}
              >
                New Plan
              </Button>
            </div>

            {/* ITINERARY */}
            <div className="space-y-10">
              {(result as Place[][]).map((day, i) => (
                <div
                  key={i}
                  className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-700"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-900 dark:bg-blue-900 dark:border-2 dark:border-white shadow-sm" />
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6">
                    Day {i + 1}
                  </h3>

                  <div className="grid gap-4">
                    {day.map((p, idx) => (
                      <Card
                        key={idx}
                        className="border dark:bg-slate-800 border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex h-full min-h-[140px]">
                          {/* COMPACT IMAGE */}
                          <div className="w-28 sm:w-40 relative flex-shrink-0">
                            <SafeImage
                              src={p.Image}
                              alt={p.place}
                              category={p.Category}
                              className="w-full h-full object-cover transition-all"
                            />
                            <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-white border-none py-0 px-2">
                              {p.Category}
                            </Badge>
                          </div>

                          {/* CONTENT */}
                          <CardContent className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-lg font-bold text-slate-900 leading-tight dark:text-slate-100">
                                  {p.place}
                                </h4>
                                <span className="text-xs font-bold text-emerald-600 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-lg">
                                  {p.Ticket_Price} $
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-tighter">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {p.arrival_time}{" "}
                                  - {p.departure_time}
                                </span>
                                <span>•</span>
                                <span>{p.Duration} Hours</span>
                              </div>

                              <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                                {p.Description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                              {/* NESTED RECOMMENDATIONS - Detailed but Compact */}
                              {p.List_of_recommendations &&
                                p.List_of_recommendations.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                      Nearby Suggestions
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {p.List_of_recommendations.slice(
                                        0,
                                        2,
                                      ).map((rec, rIdx) => (
                                        <div
                                          key={rIdx}
                                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 border border-slate-100/50 group/rec"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                              <SafeImage
                                                src={rec.Image}
                                                alt={rec.Name}
                                                category={rec.Category}
                                                className="w-full h-full object-cover transition-all"
                                              />
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-[11px] font-bold text-slate-700 truncate leading-tight">
                                                {rec.Name}
                                              </p>
                                              <p className="text-[9px] text-slate-400 dark:text-slate-600 font-medium">
                                                {rec.Category} •{" "}
                                                <span className="text-emerald-700">
                                                  {rec.TicketPrice} $
                                                </span>
                                              </p>
                                            </div>
                                          </div>

                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full opacity-0 group-hover/rec:opacity-100 transition-opacity "
                                            asChild
                                          >
                                            <a
                                              href={rec.Location}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <MapPin className="w-3 h-3 text-blue-900" />
                                            </a>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              <Button
                                variant="link"
                                className="p-0 h-auto text-blue-900 text-[11px] font-black uppercase"
                                asChild
                              >
                                <a
                                  href={p.Location}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Maps{" "}
                                  <ChevronRight className="w-3 h-3 ml-0.5" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPlanner;
