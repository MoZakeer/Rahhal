import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, FileText, DollarSign, Tag, Globe, User, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const genderOptions = [
   { id: 0, name: "Any / Mixed" },
   { id: 1, name: "Male Only" },
   { id: 2, name: "Female Only" },
];

const ageGroupOptions = [
   { id: 0, name: "All Ages" },
   { id: 1, name: "Youth (18-25)" },
   { id: 2, name: "Adults (26-40)" },
   { id: 3, name: "Seniors (40+)" },
];

const CreateTrip = () => {
   const [token] = useLocalStorage<string>("token", "");
   const navigate = useNavigate();
   const [isLoadingPage, setIsLoadingPage] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Data from APIs
   const [countries, setCountries] = useState<any[]>([]);
   const [cities, setCities] = useState<any[]>([]); // State جديد للمدن
   const [preferences, setPreferences] = useState<any[]>([]);

   // Form State
   const [form, setForm] = useState({
      name: "",
      countryId: "",
      destinationId: "",
      startDate: "",
      endDate: "",
      travelers: 1,
      description: "",
      budget: "",
      gender: 0,
      ageGroup: 1,
   });

   const [selectedPreferencesIds, setSelectedPreferencesIds] = useState<string[]>([]);

   const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

   // Fetch initial data on mount
   useEffect(() => {
      const fetchInitialData = async () => {
         try {
            // قمنا بإضافة رابط City/GetAll بناءً على التخمين
            const [countriesRes, preferencesRes, citiesRes] = await Promise.all([
               fetch("https://rahhal-api.runasp.net/Country/GetAll?SortByLastAdded=true"),
               fetch("https://rahhal-api.runasp.net/TravelPreference/GetAll?SortByLastAdded=true", {
                  headers: { 'accept': 'text/plain' }
               }),
               fetch("https://rahhal-api.runasp.net/City/GetAll?SortByLastAdded=true")
            ]);

            const countriesData = await countriesRes.json();
            const preferencesData = await preferencesRes.json();

            // التحقق من أن السيرفر رد بشكل صحيح (وليست صفحة 404)
            if (citiesRes.ok) {
               const citiesData = await citiesRes.json();
               if (citiesData.isSuccess) setCities(citiesData.data);
            } else {
               // console.warn("مسار City/GetAll غير موجود أو به خطأ");
            }

            if (countriesData.isSuccess) setCountries(countriesData.data);
            if (preferencesData.isSuccess) setPreferences(preferencesData.data);
         } catch (error) {
            // console.error("Error fetching data:", error);
            toast.error("Failed to load initial data. Please refresh.");
         } finally {
            setIsLoadingPage(false);
         }
      };

      fetchInitialData();
   }, []);

   const update = (field: string, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   };

   const togglePreference = (id: string) => {
      setSelectedPreferencesIds((prev) =>
         prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
      );
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!form.name || !form.countryId || !form.destinationId || !form.startDate || !form.endDate) {
         toast.error("Please fill in all required fields");
         return;
      }

      setIsSubmitting(true);

      const numericBudget = Number(form.budget.toString().replace(/[^0-9.-]+/g, "")) || 0;

      const payload = {
         name: form.name,
         description: form.description || "",
         startDate: new Date(form.startDate).toISOString(),
         endDate: new Date(form.endDate).toISOString(),
         numberOfTravelers: Number(form.travelers),
         budget: numericBudget,
         destinationId: form.destinationId,
         countryId: form.countryId,
         gender: Number(form.gender),
         ageGroup: Number(form.ageGroup),
         travelPreferencesId: selectedPreferencesIds
      };

      try {
      //   let token = localStorage.getItem("token") || "";
         const response = await fetch("https://rahhal-api.runasp.net/TripManagement/Create", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
         });

         const text = await response.text();
         const result = text ? JSON.parse(text) : {};

         if (response.ok && (result.isSuccess !== false)) {
            toast.success("Trip created successfully!");
            navigate("/explore");
         } else {
            toast.error(result.message || "Failed to create trip.");
            // console.error("API Error:", result);
         }
      } catch (error) {
        //  console.error("Network Error:", error);
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
      <div className="flex justify-center">
         <div className="max-w-2xl py-10 w-full px-4">
            <div className="mb-8">
               <h1 className="font-display text-3xl font-bold">Create a New Trip</h1>
               <p className="mt-2 text-muted-foreground">Plan your next adventure by selecting the details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {/* Name */}
               <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                     <FileText className="h-4 w-4 text-primary" /> Trip Name *
                  </Label>
                  <Input id="name" placeholder="e.g., Summer Exploration" value={form.name} onChange={(e) => update("name", e.target.value)} disabled={isSubmitting} />
               </div>

               {/* Country & Destination */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="country" className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Country *
                     </Label>
                     <select
                        id="country"
                        className={selectClassName}
                        value={form.countryId}
                        onChange={(e) => update("countryId", e.target.value)}
                        disabled={isSubmitting}
                     >
                        <option value="" disabled>Select Country</option>
                        {countries.map((country) => (
                           <option key={country.id} value={country.id}>
                              {country.name}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="dest" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> Destination (City) *
                     </Label>
                     <select
                        id="dest"
                        className={selectClassName}
                        value={form.destinationId}
                        onChange={(e) => update("destinationId", e.target.value)}
                        disabled={isSubmitting || cities.length === 0}
                     >
                        <option value="" disabled>
                           {cities.length === 0 ? "Loading cities..." : "Select City"}
                        </option>
                        {cities.map((city) => (
                           <option key={city.id} value={city.id}>
                              {city.name}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               {/* Dates */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="start" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" /> Start Date *
                     </Label>
                     <Input id="start" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="end" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" /> End Date *
                     </Label>
                     <Input id="end" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} disabled={isSubmitting} />
                  </div>
               </div>

               {/* Demographics (Gender & Age) */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="gender" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" /> Target Gender
                     </Label>
                     <select id="gender" className={selectClassName} value={form.gender} onChange={(e) => update("gender", Number(e.target.value))} disabled={isSubmitting}>
                        {genderOptions.map((opt) => (
                           <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="ageGroup" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Age Group
                     </Label>
                     <select id="ageGroup" className={selectClassName} value={form.ageGroup} onChange={(e) => update("ageGroup", Number(e.target.value))} disabled={isSubmitting}>
                        {ageGroupOptions.map((opt) => (
                           <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                     </select>
                  </div>
               </div>

               {/* Travelers & Budget */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="travelers" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Number of Travelers
                     </Label>
                     <Input id="travelers" type="number" min={1} value={form.travelers} onChange={(e) => update("travelers", parseInt(e.target.value))} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="budget" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" /> Budget
                     </Label>
                     <Input id="budget" placeholder="e.g., 2500" value={form.budget} onChange={(e) => update("budget", e.target.value)} disabled={isSubmitting} />
                  </div>
               </div>

               {/* Description */}
               <div className="space-y-2">
                  <Label htmlFor="desc" className="flex items-center gap-2">
                     <FileText className="h-4 w-4 text-primary" /> Description
                  </Label>
                  <Textarea id="desc" rows={4} placeholder="Describe your trip..." value={form.description} onChange={(e) => update("description", e.target.value)} disabled={isSubmitting} />
               </div>

               {/* Travel Preferences (Dynamic Badges) */}
               <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                     <Tag className="h-4 w-4 text-primary" /> Travel Preferences
                  </Label>
                  <div className="flex flex-wrap gap-2">
                     {preferences.map((pref) => {
                        const isSelected = selectedPreferencesIds.includes(pref.id);
                        return (
                           <Badge
                              key={pref.id}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer transition-colors ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
                              onClick={() => !isSubmitting && togglePreference(pref.id)}
                           >
                              {pref.name}
                           </Badge>
                        );
                     })}
                  </div>
               </div>

               {/* Submit */}
               <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                     {isSubmitting ? "Creating..." : "Create Trip"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={isSubmitting}>
                     Cancel
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default CreateTrip;