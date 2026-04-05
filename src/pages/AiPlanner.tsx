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
const EGYPT_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

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
  const [citySearch, setCitySearch] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
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
          countryId: EGYPT_ID,
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
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".city-search-container")) {
        setCityOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, prefRes] = await Promise.all([
          fetch("https://rahhal-api.runasp.net/City/GetAll"),
          fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll"),
        ]);
        const cityData = await cityRes.json();
        const prefData = await prefRes.json();
        setCities(cityData.data || []);
        setPreferences(prefData.data || []);
      } catch {
        toast.error("Failed to load travel data");
      }
    };
    fetchData();
  }, []);

  const toggleInterest = (item: string) => {
    setForm((prev) => ({
      ...prev,
      user_interests: prev.user_interests.includes(item)
        ? prev.user_interests.filter((i) => i !== item)
        : [...prev.user_interests, item],
    }));
  };

  const handleGenerate = async () => {
    // 1. Basic Field Checks
    if (!form.destinationId) return toast.error("Please select a destination");
    if (!form.user_start_date) return toast.error("Please select a start date");
    if (form.numberOfTravelers < 1)
      return toast.error("At least 1 traveler required");
    if (form.user_budget < 0) return toast.error("Budget cannot be negative");

    // 2. Date Logic & Capping
    const startDate = new Date(form.user_start_date);
    const endDate = new Date(form.user_end_date);

    if (startDate > endDate) {
      return toast.error("Start date cannot be after end date");
    }

    // Calculate the number of days between dates
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day

    // 3. Sync the 'user_days' state and enforce the 5-day limit
    const finalDays = Math.min(diffDays, 5);

    if (diffDays > 5) {
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
            user_days: finalDays,
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
            itinerary: retrieveData.itinerary, // Sending the nested array structure
          },
          name: form.name || `Trip to ${form.user_governorate}`,
          startDate: form.startDate,
          endDate: form.endDate,
          numberOfTravelers: form.numberOfTravelers,
          gender: form.gender,
          ageGroup: form.ageGroup,
          budget: form.user_budget,
          destinationId: form.destinationId,
          countryId: EGYPT_ID,
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
    <div className="min-h-screen bg-[#f9fafb] flex justify-center px-4 py-8 md:py-16">
      <div className="max-w-4xl w-full space-y-10">
        {/* HEADER SECTION */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            AI POWERED TRAVEL
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Plan your next{" "}
            <span className="text-primary italic">Adventure</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Fill in your preferences below and let our AI curate the perfect
            itinerary for your trip to Egypt.
          </p>
        </header>

        {step === "form" && (
          <div className="grid gap-8">
            {/* CARD 1: THE BASICS */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Trip Logistics</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-600">
                      Trip Name
                    </Label>
                    <Input
                      placeholder="e.g., Weekend Getaway"
                      className="rounded-xl border-slate-200 h-12 focus:ring-primary"
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div
                    className="space-y-2 relative city-search-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <MapPin className="w-4 h-4 text-primary" /> Destination
                      City
                    </Label>

                    <Input
                      placeholder="Search city..."
                      className="rounded-xl border-slate-200 h-12"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setCityOpen(true);
                      }}
                      onFocus={() => setCityOpen(true)}
                    />

                    {cityOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-60 overflow-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                        {cities
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(citySearch.toLowerCase()),
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              className="px-4 py-3 hover:bg-primary/5 rounded-xl cursor-pointer text-sm font-medium transition-colors flex items-center justify-between group"
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
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-all" />
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
                  <Label className="text-sm font-semibold text-slate-600">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Mention any specific vibes or requirements..."
                    className="rounded-xl border-slate-200 min-h-[100px] resize-none"
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      className="rounded-xl"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          startDate: e.target.value,
                          user_start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      className="rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Days
                    </Label>
                    <Input
                      type="number"
                      placeholder="1"
                      className="rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, user_days: +e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Budget
                    </Label>
                    <Input
                      type="number"
                      placeholder="EGP"
                      className="rounded-xl"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          user_budget: +e.target.value,
                          budget: +e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: THE VIBE */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Preferences & Interests</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Activity Level */}
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-700">
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
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Travelers
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      className="rounded-xl h-10 border-slate-200"
                      onChange={(e) =>
                        setForm({ ...form, numberOfTravelers: +e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Interests Pills */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-slate-700">
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
                            ? "bg-primary text-white scale-105"
                            : "bg-white text-slate-600 hover:bg-slate-100"
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
                  <Label className="text-sm font-bold text-slate-700">
                    Travel Preferences
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {preferences.map((p) => (
                      <Badge
                        key={p.id}
                        className={`px-4 py-2 cursor-pointer rounded-full transition-all text-xs font-medium border-none shadow-sm ${
                          form.travelPreferencesId.includes(p.id)
                            ? "bg-primary text-white scale-105"
                            : "bg-white text-slate-600 hover:bg-slate-100"
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
                    <Label className="text-sm font-bold text-slate-700">
                      Gender
                    </Label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                      {["Any / Mixed", "Male only", "Female only"].map(
                        (g, i) => (
                          <button
                            key={g}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              form.gender === i
                                ? "bg-white text-primary shadow-sm"
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
                    <Label className="text-sm font-bold text-slate-700">
                      Age Range
                    </Label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                      {[0, 1, 2, 3].map((a) => (
                        <button
                          key={a}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            form.ageGroup === a
                              ? "bg-white text-primary shadow-sm"
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
              className="w-full h-16 rounded-3xl text-xl font-bold shadow-2xl shadow-primary/20 transition-transform active:scale-95 group"
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
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
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
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {form.name || "Your Trip"}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {form.user_governorate}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold border-slate-200"
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
                  className="relative pl-8 border-l-2 border-slate-100"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm" />
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">
                    Day {i + 1}
                  </h3>

                  <div className="grid gap-4">
                    {day.map((p, idx) => (
                      <Card
                        key={idx}
                        className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
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
                                <h4 className="text-lg font-bold text-slate-900 leading-tight">
                                  {p.place}
                                </h4>
                                <span className="text-xs font-bold text-emerald-600 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-lg">
                                  {p.Ticket_Price * 50} EGP
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
                                              <p className="text-[9px] text-slate-400 font-medium">
                                                {rec.Category} •{" "}
                                                <span className="text-emerald-600">
                                                  {rec.TicketPrice * 50} EGP
                                                </span>
                                              </p>
                                            </div>
                                          </div>

                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full opacity-0 group-hover/rec:opacity-100 transition-opacity"
                                            asChild
                                          >
                                            <a
                                              href={rec.Location}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <MapPin className="w-3 h-3 text-primary" />
                                            </a>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary text-[11px] font-black uppercase"
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
