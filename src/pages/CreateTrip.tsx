import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

type Country = {
  id: string;
  name: string;
};

type City = {
  id: string;
  name: string;
};

type Preference = {
  id: string;
  name: string;
};

const API_BASE_URL = "https://rahhal-api.runasp.net";

const CreateTrip = () => {
  usePageTitle("Plan your next adventure");
  useFavicon("/add.png");

  const [token] = useLocalStorage<string>("token", "");

  const navigate = useNavigate();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [selectedPreferencesIds, setSelectedPreferencesIds] = useState<
    string[]
  >([]);

  const selectClassName =
    "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:border-slate-700 dark:text-white";

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [countriesRes, preferencesRes, citiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Country/GetAll?SortByLastAdded=true`),

          fetch(
            `${API_BASE_URL}/TravelPreference/GetAll?SortByLastAdded=true`,
            {
              headers: {
                accept: "text/plain",
              },
            },
          ),

          fetch(`${API_BASE_URL}/City/GetAll?SortByLastAdded=true`),
        ]);

        const countriesData = await countriesRes.json();
        const preferencesData = await preferencesRes.json();

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();

          if (citiesData.isSuccess) {
            setCities(citiesData.data);
          }
        }

        if (countriesData.isSuccess) {
          setCountries(countriesData.data);
        }

        if (preferencesData.isSuccess) {
          setPreferences(preferencesData.data);
        }
      } catch (error) {
        toast.error("Failed to load initial data. Please refresh.");
      } finally {
        setIsLoadingPage(false);
      }
    };

    fetchInitialData();
  }, []);

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const togglePreference = (id: string) => {
    setSelectedPreferencesIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name
    if (!form.name.trim()) {
      newErrors.name = "Trip name is required";
    }

    // Country
    if (!form.countryId) {
      newErrors.countryId = "Please select a country";
    }

    // Destination
    if (!form.destinationId) {
      newErrors.destinationId = "Please select a destination";
    }

    // Start Date
    if (!form.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const startDate = new Date(form.startDate);

      if (startDate <= today) {
        newErrors.startDate = "Start date must be in the future";
      }
    }

    // End Date
    if (!form.endDate) {
      newErrors.endDate = "End date is required";
    }

    // Compare Dates
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);

      if (end < start) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    // Travelers
    if (!form.travelers) {
      newErrors.travelers = "Number of travelers is required";
    } else if (form.travelers < 1) {
      newErrors.travelers = "Minimum travelers is 1";
    } else if (form.travelers > 100) {
      newErrors.travelers = "Maximum travelers is 100";
    }

    // Budget
    const rawBudget = form.budget.toString().trim();
    const numericBudget = Number(rawBudget);

    if (!rawBudget) {
      newErrors.budget = "Budget is required";
    } else if (isNaN(numericBudget)) {
      newErrors.budget = "Budget must be numeric";
    } else if (numericBudget <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }

    // Description
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 0) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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
        toast.success("Trip created successfully!");

        navigate("/explore");
      } else {
        toast.error(result.message || "Failed to create trip.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center dark:bg-slate-900 min-h-screen">
      <div className="max-w-2xl py-10 w-full px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold dark:text-slate-100">
            Create a New Trip
          </h1>

          <p className="mt-2 text-muted-foreground">
            Plan your next adventure by selecting the details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 dark:text-slate-100">
              <FileText className="h-4 w-4 text-blue-700" />
              Trip Name *
            </Label>

            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., Summer Exploration"
              className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
            />

            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Country & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <Globe className="h-4 w-4 text-blue-700" />
                Country *
              </Label>

              <select
                className={selectClassName}
                value={form.countryId}
                onChange={(e) => update("countryId", e.target.value)}
              >
                <option value="">Select Country</option>

                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>

              {errors.countryId && (
                <p className="text-sm text-red-500">{errors.countryId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <MapPin className="h-4 w-4 text-blue-700" />
                Destination *
              </Label>

              <select
                className={selectClassName}
                value={form.destinationId}
                onChange={(e) => update("destinationId", e.target.value)}
              >
                <option value="">Select City</option>

                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>

              {errors.destinationId && (
                <p className="text-sm text-red-500">{errors.destinationId}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <Calendar className="h-4 w-4 text-blue-700" />
                Start Date *
              </Label>

              <Input
                type="date"
                min={
                  new Date(Date.now() + 86400000).toISOString().split("T")[0]
                }
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                disabled={isSubmitting}
                className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white dark:color-scheme"
              />

              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <Calendar className="h-4 w-4 text-blue-700" />
                End Date *
              </Label>

              <Input
                type="date"
                min={
                  form.startDate ||
                  new Date(Date.now() + 86400000).toISOString().split("T")[0]
                }
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                disabled={isSubmitting}
                className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white dark:color-scheme"
              />

              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Travelers & Budget */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <Users className="h-4 w-4 text-blue-700" />
                Number of Travelers
              </Label>

              <Input
                type="number"
                min={1}
                max={100}
                value={form.travelers}
                placeholder="e.g. 5"
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    update("travelers", "");
                    return;
                  }

                  update(
                    "travelers",
                    Math.min(100, Math.max(1, Number(value))),
                  );
                }}
                disabled={isSubmitting}
                className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
              />

              {errors.travelers && (
                <p className="text-sm text-red-500">{errors.travelers}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <DollarSign className="h-4 w-4 text-blue-700" />
                Budget *
              </Label>

              <Input
                type="number"
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., 2500"
                className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
              />

              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget}</p>
              )}
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <User className="h-4 w-4 text-blue-700" />
                Target Gender
              </Label>

              <select
                className={selectClassName}
                value={form.gender}
                onChange={(e) => update("gender", Number(e.target.value))}
              >
                {genderOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 dark:text-slate-100">
                <Clock className="h-4 w-4 text-blue-700" />
                Age Group
              </Label>

              <select
                className={selectClassName}
                value={form.ageGroup}
                onChange={(e) => update("ageGroup", Number(e.target.value))}
              >
                {ageGroupOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 dark:text-slate-100">
              <FileText className="h-4 w-4 text-blue-700" />
              Description *
            </Label>

            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              disabled={isSubmitting}
              placeholder="Describe your trip..."
              className="rounded-xl dark:bg-slate-700 dark:border-slate-700 dark:text-white"
            />

            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 dark:text-slate-100">
              <Tag className="h-4 w-4 text-blue-700" />
              Travel Preferences
            </Label>

            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => {
                const isSelected = selectedPreferencesIds.includes(pref.id);

                return (
                  <Badge
                    key={pref.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      cursor-pointer transition-colors dark:border-0
                      ${
                        isSelected
                          ? "dark:bg-blue-700 dark:text-white"
                          : "dark:bg-slate-500 dark:text-white"
                      }
                    `}
                    onClick={() => togglePreference(pref.id)}
                  >
                    {pref.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-700"
            >
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>

            {/* <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </Button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
