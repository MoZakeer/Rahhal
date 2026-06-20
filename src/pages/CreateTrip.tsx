import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Calendar, Users, FileText, DollarSign, Tag, Globe, User, Clock, Loader2, ChevronRight, ChevronLeft, CheckCircle2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type Country = { id: string; name: string };
type City = { id: string; name: string };
type Preference = { id: string; name: string };

const API_BASE_URL = "https://rahhal-api.runasp.net";

const initialFormState = {
  name: "", countryId: "", destinationId: "", startDate: "", endDate: "",
  travelers: "" as number | "", description: "", budget: "", gender: 0, ageGroup: 1,
};

const CreateTrip = () => {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  usePageTitle(t("createTrip.pageTitle"));
  useFavicon("/add.png");

  const [token] = useLocalStorage<string>("token", "");
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useLocalStorage("create_trip_current_step", 1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useLocalStorage("create_trip_draft", initialFormState);
  const [selectedPreferencesIds, setSelectedPreferencesIds] = useLocalStorage<string[]>("create_trip_prefs_draft", []);

  const genderOptions = [
    { id: 0, name: t("createTrip.genders.male") },
    { id: 1, name: t("createTrip.genders.female") },
    { id: 2, name: t("createTrip.genders.other") },
  ];

  const ageGroupOptions = [
    { id: 1, name: t("createTrip.ages.kid") },
    { id: 2, name: t("createTrip.ages.young") },
    { id: 3, name: t("createTrip.ages.middle") },
    { id: 4, name: t("createTrip.ages.old") },
  ];

  const selectClassName = "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-sm transition-all dark:[color-scheme:dark]";
  const inputClassName = "rounded-xl h-11 px-4 dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-sm transition-all focus-visible:ring-blue-500 dark:[color-scheme:dark]";

  const { data: countries = [], isLoading: loadingCountries } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/Country/GetAll?SortByLastAdded=true`);
      const json = await res.json();
      return json.isSuccess ? json.data : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: cities = [], isLoading: loadingCities } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/City/GetAll?SortByLastAdded=true`);
      const json = await res.json();
      return json.isSuccess ? json.data : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: preferences = [], isLoading: loadingPrefs } = useQuery<Preference[]>({
    queryKey: ["preferences"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/TravelPreference/GetAll?SortByLastAdded=true`, { headers: { accept: "text/plain" } });
      const json = await res.json();
      return json.isSuccess ? json.data : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const isLoadingPage = loadingCountries || loadingCities || loadingPrefs;

  const [countrySearch, setCountrySearch] = useLocalStorage("create_trip_country_search", "");
  const [citySearch, setCitySearch] = useLocalStorage("create_trip_city_search", "");
  const [showCountryList, setShowCountryList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    setForm((prev: typeof initialFormState) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const togglePreference = (id: string) => {
    setSelectedPreferencesIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.name.trim()) newErrors.name = t("createTrip.validation.nameReq");
      if (!form.countryId) newErrors.countryId = t("createTrip.validation.countryReq");
      if (!form.destinationId) newErrors.destinationId = t("createTrip.validation.cityReq");
    }

    if (step === 2) {
      if (!form.startDate) {
        newErrors.startDate = t("createTrip.validation.startReq");
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(form.startDate) <= today) {
          newErrors.startDate = t("createTrip.validation.startFuture");
        }
      }

      if (!form.endDate) {
        newErrors.endDate = t("createTrip.validation.endReq");
      } else if (form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
        newErrors.endDate = t("createTrip.validation.endBeforeStart");
      }

      if (!form.travelers) {
        newErrors.travelers = t("createTrip.validation.travelersReq");
      } else if (form.travelers < 1) {
        newErrors.travelers = t("createTrip.validation.travelersMin");
      }

      const numericBudget = Number(form.budget.toString().trim());
      if (!form.budget) {
        newErrors.budget = t("createTrip.validation.budgetReq");
      } else if (isNaN(numericBudget) || numericBudget <= 0) {
        newErrors.budget = t("createTrip.validation.budgetMin");
      }
    }

    if (step === 3) {
      if (!form.description.trim()) {
        newErrors.description = t("createTrip.validation.descReq");
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
      toast.error(t("createTrip.toast.fillFields"));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description || "",
      startDate: form.startDate,
      endDate: form.endDate,
      numberOfTravelers: Number(form.travelers),
      budget: Number(form.budget.toString().trim()),
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cleanToken}` },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (response.ok && result.isSuccess !== false) {
        toast.success(t("createTrip.toast.success"));

        setForm(initialFormState);
        setSelectedPreferencesIds([]);

        setCountrySearch("");
        setCitySearch("");
        setCurrentStep(1);

        navigate("/explore");
      } else {
        toast.error(result.message || t("createTrip.toast.error"));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(t("createTrip.toast.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <span className="text-slate-500 font-medium">{t("createTrip.loading")}</span>
      </div>
    );
  }

  const stepVariants = {
    hidden: { opacity: 0, x: isRtl ? -20 : 20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, x: isRtl ? 20 : -20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" as const } }
  };

  const stepTitles = [
    t("createTrip.step1Title"),
    t("createTrip.step2Title"),
    t("createTrip.step3Title")
  ];

  return (
    <div className="flex justify-center bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 pt-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-xl w-full px-4">

        {/* Header & Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 tracking-wider uppercase">
                {t("createTrip.step")} {currentStep} {t("createTrip.of")} 3
              </p>
              <h1 className="font-display text-3xl font-black text-slate-900 dark:text-slate-100">
                {stepTitles[currentStep - 1]}
              </h1>
            </div>
            <div className="text-sm font-medium text-slate-400">
              {Math.round((currentStep / 3) * 100)}%
            </div>
          </div>

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

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <FileText className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.tripName")}
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder={t("createTrip.placeholders.tripName")}
                      className={inputClassName}
                    />
                    {errors.name && <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-2 relative">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <Globe className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.country")}
                    </Label>
                    <div className="relative">
                      <Search className={cn("absolute top-3.5 h-4 w-4 text-slate-400", isRtl ? "right-3" : "left-3")} />
                      <Input
                        className={cn(inputClassName, isRtl ? "pr-10" : "pl-10")}
                        placeholder={t("createTrip.placeholders.searchCountry")}
                        value={countrySearch}
                        onFocus={() => setShowCountryList(true)}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setShowCountryList(true);
                        }}
                      />
                    </div>
                    {showCountryList && (
                      <div className="absolute z-50 w-full mt-2 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1 dark:text-slate-200">
                        {/* No Results Empty State */}
                        {countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length > 0 ? (
                          countries
                            .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                            .map(c => (
                              <div key={c.id} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                                onClick={() => { update("countryId", c.id); setCountrySearch(c.name); setShowCountryList(false); }}>
                                {c.name}
                              </div>
                            ))
                        ) : (
                          <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">
                            {t("createTrip.noResults")}
                          </div>
                        )}
                      </div>
                    )}
                    {errors.countryId && <p className="text-xs font-bold text-red-500 mt-1">{errors.countryId}</p>}
                  </div>

                  <div className="space-y-2 relative">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <MapPin className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.city")}
                    </Label>
                    <div className="relative">
                      <Search className={cn("absolute top-3.5 h-4 w-4 text-slate-400", isRtl ? "right-3" : "left-3")} />
                      <Input
                        className={cn(inputClassName, isRtl ? "pr-10" : "pl-10")}
                        placeholder={t("createTrip.placeholders.searchCity")}
                        value={citySearch}
                        onFocus={() => setShowCityList(true)}
                        onChange={(e) => {
                          setCitySearch(e.target.value);
                          setShowCityList(true);
                        }}
                      />
                    </div>
                    {showCityList && (
                      <div className="absolute z-50 w-full mt-2 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1 dark:text-slate-200">
                        {/* No Results Empty State */}
                        {cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).length > 0 ? (
                          cities
                            .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
                            .map(c => (
                              <div key={c.id} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                                onClick={() => { update("destinationId", c.id); setCitySearch(c.name); setShowCityList(false); }}>
                                {c.name}
                              </div>
                            ))
                        ) : (
                          <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">
                            {t("createTrip.noResults")}
                          </div>
                        )}
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
                        <Calendar className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.startDate")}
                      </Label>
                      <Input
                        type="date"
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        value={form.startDate}
                        onChange={(e) => update("startDate", e.target.value)}
                        className={inputClassName}
                      />
                      {errors.startDate && <p className="text-xs font-bold text-red-500 mt-1">{errors.startDate}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Calendar className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.endDate")}
                      </Label>
                      <Input
                        type="date"
                        min={form.startDate || new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        value={form.endDate}
                        onChange={(e) => update("endDate", e.target.value)}
                        className={inputClassName}
                      />
                      {errors.endDate && <p className="text-xs font-bold text-red-500 mt-1">{errors.endDate}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Users className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.travelers")}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={1} max={100}
                          value={form.travelers}
                          placeholder={t("createTrip.placeholders.travelers")}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") { update("travelers", ""); return; }
                            update("travelers", Math.min(100, Math.max(1, Number(val))));
                          }}
                          className={cn(inputClassName, isRtl ? "pr-10" : "pl-10")}
                        />
                        <Users className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400", isRtl ? "right-3" : "left-3")} />
                      </div>
                      {errors.travelers && <p className="text-xs font-bold text-red-500 mt-1">{errors.travelers}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <DollarSign className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.budget")}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={form.budget}
                          onChange={(e) => update("budget", e.target.value)}
                          placeholder={t("createTrip.placeholders.budget")}
                          className={cn(inputClassName, isRtl ? "pr-10" : "pl-10")}
                        />
                        <DollarSign className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400", isRtl ? "right-3" : "left-3")} />
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
                        <User className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.gender")}
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
                        <Clock className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.ageGroup")}
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
                      <FileText className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.description")}
                    </Label>
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder={t("createTrip.placeholders.description")}
                      className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white shadow-sm resize-none focus-visible:ring-blue-500"
                    />
                    {errors.description && <p className="text-xs font-bold text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                      <Tag className="h-4 w-4 text-blue-500" /> {t("createTrip.labels.preferences")}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {preferences.map((pref) => {
                        const isSelected = selectedPreferencesIds.includes(pref.id);
                        const prefKey = pref.name.toLowerCase();
                        const translatedName = t(`categories.${prefKey}`);
                        const displayName = translatedName.includes("categories.") ? pref.name : translatedName;

                        return (
                          <button
                            key={pref.id}
                            type="button"
                            onClick={() => togglePreference(pref.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border outline-none ${isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                          >
                            {displayName}
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
                  className="rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
                >
                  <ChevronLeft className={cn("w-4 h-4", isRtl ? "ml-2 rtl:-scale-x-100" : "mr-2")} /> {t("createTrip.buttons.back")}
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 outline-none"
                >
                  {t("createTrip.buttons.next")} <ChevronRight className={cn("w-4 h-4", isRtl ? "mr-2 rtl:-scale-x-100" : "ml-2")} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-500/30 transition-all active:scale-95 outline-none"
                >
                  {isSubmitting ? (
                    <><Loader2 className={cn("w-4 h-4 animate-spin", isRtl ? "ml-2" : "mr-2")} /> {t("createTrip.buttons.creating")}</>
                  ) : (
                    <><CheckCircle2 className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} /> {t("createTrip.buttons.finish")}</>
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