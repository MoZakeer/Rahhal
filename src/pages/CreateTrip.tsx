import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Tag,
  Globe,
  User,
  Clock,
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";

const genderOptions = [
  { id: 0, name: "Male" },
  { id: 1, name: "Female" },
  { id: 2, name: "Other" },
];

const ageGroupOptions = [
  { id: 1, name: "Kid" },
  { id: 2, name: "Young" },
  { id: 3, name: "Middle Age" },
  { id: 4, name: "Old" },
];

type Country = { id: string; name: string };
type City = { id: string; name: string };
type Preference = { id: string; name: string };

const API_BASE_URL = "https://rahhal-api.runasp.net";

const CreateTrip = () => {
  usePageTitle("Plan your next adventure");
  useFavicon("/add.png");

  const [token] = useLocalStorage<string>("token", "");
  const navigate = useNavigate();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const [form, setForm] = useState({
    name: "",
    countryId: "",
    destinationId: "",
    startDate: "",
    endDate: "",
    travelers: "" as number | "",
    description: "",
    budget: "",
    gender: 0,
    ageGroup: 1,
  });

  const [selectedPreferencesIds, setSelectedPreferencesIds] = useState<string[]>([]);

  const selectClassName =
    "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:ring-offset-slate-900 shadow-sm transition-all";
  const inputClassName =
    "rounded-xl h-11 px-4 dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-sm transition-all focus-visible:ring-blue-500";

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [countriesRes, preferencesRes, citiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Country/GetAll?SortByLastAdded=true`),
          fetch(`${API_BASE_URL}/TravelPreference/GetAll?SortByLastAdded=true`, {
            headers: { accept: "text/plain" },
          }),
          fetch(`${API_BASE_URL}/City/GetAll?SortByLastAdded=true`),
        ]);

        const countriesData = await countriesRes.json();
        const preferencesData = await preferencesRes.json();

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          if (citiesData.isSuccess) setCities(citiesData.data);
        }

        if (countriesData.isSuccess) setCountries(countriesData.data);
        if (preferencesData.isSuccess) setPreferences(preferencesData.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Failed to load initial data. Please refresh.");
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchInitialData();
  }, []);

  // State for search terms
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // State to toggle search result lists
  const [showCountryList, setShowCountryList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  // Ref to close lists when clicking outside
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close lists when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
        setShowCityList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const togglePreference = (id: string) => {
    setSelectedPreferencesIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  // 🔥 Smart Step Validation
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.name.trim()) newErrors.name = "Trip name is required";
      if (!form.countryId) newErrors.countryId = "Please select a country";
      if (!form.destinationId) newErrors.destinationId = "Please select a destination";
    }

    if (step === 2) {
      if (!form.startDate) {
        newErrors.startDate = "Start date is required";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(form.startDate) <= today) {
          newErrors.startDate = "Start date must be in the future";
        }
      }

      if (!form.endDate) {
        newErrors.endDate = "End date is required";
      } else if (form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
        newErrors.endDate = "End date cannot be before start date";
      }

      if (!form.travelers) {
        newErrors.travelers = "Number of travelers is required";
      } else if (form.travelers < 1) {
        newErrors.travelers = "Minimum travelers is 1";
      }

      const numericBudget = Number(form.budget.toString().trim());
      if (!form.budget) {
        newErrors.budget = "Budget is required";
      } else if (isNaN(numericBudget) || numericBudget <= 0) {
        newErrors.budget = "Budget must be greater than 0";
      }
    }

    if (step === 3) {
      if (!form.description.trim()) {
        newErrors.description = "Description is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const numericBudget = Number(form.budget.toString().trim());
    const payload = {
      name: form.name,
      description: form.description || "",
      startDate: form.startDate,
      endDate: form.endDate,
      numberOfTravelers: Number(form.travelers),
      budget: numericBudget,
      destinationId: form.destinationId,
      countryId: form.countryId,
      gender: Number(form.gender),
      ageGroup: Number(form.ageGroup),
      travelPreferencesId: selectedPreferencesIds,
    };

    try {
      const cleanToken = token.replace(/^"(.*)"$/, "$1");
      const response = await fetch(`${API_BASE_URL}/TripManagement/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (response.ok && result.isSuccess !== false) {
        toast.success("Trip created successfully! 🎉");
        navigate("/explore");
      } else {
        toast.error(result.message || "Failed to create trip.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <span className="text-slate-500 font-medium">Preparing your canvas...</span>
      </div>
    );
  }

  // Animation variants for step transitions
  const stepVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const stepTitles = [
    "Where to?",
    "Logistics & Dates",
    "Set the Vibe"
  ];

  return (
    <div className="flex justify-center bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 pt-6">
      <div className="max-w-xl w-full px-4">

        {/* Header & Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 tracking-wider uppercase">
                Step {currentStep} of 3
              </p>
              <h1 className="font-display text-3xl font-black text-slate-900 dark:text-slate-100">
                {stepTitles[currentStep - 1]}
              </h1>
            </div>
            <div className="text-sm font-medium text-slate-400">
              {Math.round((currentStep / 3) * 100)}%
            </div>
          </div>

          {/* Progress Track */}
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              initial={{ width: "33%" }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Multi-step Form */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* STEP 1: Destination */}
              {currentStep === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6" ref={wrapperRef}>

                  {/* Trip Name Input */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <FileText className="h-4 w-4 text-blue-500" /> Trip Name
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g., Summer Eurotrip 2026"
                      className={inputClassName}
                    />
                    {errors.name && <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Country Searchable Select */}
                  <div className="space-y-2 relative">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <Globe className="h-4 w-4 text-blue-500" /> Country
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        className={`${inputClassName} pl-10`}
                        placeholder="Search country..."
                        value={countrySearch}
                        onFocus={() => setShowCountryList(true)}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setShowCountryList(true);
                        }}
                      />
                    </div>
                    {showCountryList && (
                      <div className="absolute z-50 w-full mt-2 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1">
                        {countries
                          .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                          .map(c => (
                            <div key={c.id} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                              onClick={() => { update("countryId", c.id); setCountrySearch(c.name); setShowCountryList(false); }}>
                              {c.name}
                            </div>
                          ))}
                      </div>
                    )}
                    {errors.countryId && <p className="text-xs font-bold text-red-500 mt-1">{errors.countryId}</p>}
                  </div>

                  {/* City Searchable Select */}
                  <div className="space-y-2 relative">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <MapPin className="h-4 w-4 text-blue-500" /> Destination City
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        className={`${inputClassName} pl-10`}
                        placeholder="Search city..."
                        value={citySearch}
                        onFocus={() => setShowCityList(true)}
                        onChange={(e) => {
                          setCitySearch(e.target.value);
                          setShowCityList(true);
                        }}
                      />
                    </div>
                    {showCityList && (
                      <div className="absolute z-50 w-full mt-2 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1">
                        {cities
                          .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
                          .map(c => (
                            <div key={c.id} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                              onClick={() => { update("destinationId", c.id); setCitySearch(c.name); setShowCityList(false); }}>
                              {c.name}
                            </div>
                          ))}
                      </div>
                    )}
                    {errors.destinationId && <p className="text-xs font-bold text-red-500 mt-1">{errors.destinationId}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Logistics */}
              {currentStep === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Calendar className="h-4 w-4 text-blue-500" /> Start Date
                      </Label>
                      <Input
                        type="date"
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        value={form.startDate}
                        onChange={(e) => update("startDate", e.target.value)}
                        className={`${inputClassName} dark:[color-scheme:dark]`}
                      />
                      {errors.startDate && <p className="text-xs font-bold text-red-500 mt-1">{errors.startDate}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Calendar className="h-4 w-4 text-blue-500" /> End Date
                      </Label>
                      <Input
                        type="date"
                        min={form.startDate || new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        value={form.endDate}
                        onChange={(e) => update("endDate", e.target.value)}
                        className={`${inputClassName} dark:[color-scheme:dark]`}
                      />
                      {errors.endDate && <p className="text-xs font-bold text-red-500 mt-1">{errors.endDate}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Users className="h-4 w-4 text-blue-500" /> Travelers
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={1} max={100}
                          value={form.travelers}
                          placeholder="e.g. 5"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") { update("travelers", ""); return; }
                            update("travelers", Math.min(100, Math.max(1, Number(val))));
                          }}
                          className={`${inputClassName} pl-10`}
                        />
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                      {errors.travelers && <p className="text-xs font-bold text-red-500 mt-1">{errors.travelers}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <DollarSign className="h-4 w-4 text-blue-500" /> Est. Budget
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={form.budget}
                          onChange={(e) => update("budget", e.target.value)}
                          placeholder="e.g., 2500"
                          className={`${inputClassName} pl-10`}
                        />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                      {errors.budget && <p className="text-xs font-bold text-red-500 mt-1">{errors.budget}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Vibe & Preferences */}
              {currentStep === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <User className="h-4 w-4 text-blue-500" /> Target Gender
                      </Label>
                      <select
                        className={selectClassName}
                        value={form.gender}
                        onChange={(e) => update("gender", Number(e.target.value))}
                      >
                        {genderOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Clock className="h-4 w-4 text-blue-500" /> Age Group
                      </Label>
                      <select
                        className={selectClassName}
                        value={form.ageGroup}
                        onChange={(e) => update("ageGroup", Number(e.target.value))}
                      >
                        {ageGroupOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <FileText className="h-4 w-4 text-blue-500" /> Description
                    </Label>
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="What's the vibe of this trip? Any specific goals?"
                      className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-sm resize-none focus-visible:ring-blue-500"
                    />
                    {errors.description && <p className="text-xs font-bold text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <Tag className="h-4 w-4 text-blue-500" /> Travel Style & Preferences
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {preferences.map((pref) => {
                        const isSelected = selectedPreferencesIds.includes(pref.id);
                        return (
                          <button
                            key={pref.id}
                            type="button"
                            onClick={() => togglePreference(pref.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                          >
                            {pref.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div /> // Placeholder to keep Next button on the right
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Finish & Create</>
                  )}
                </Button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;