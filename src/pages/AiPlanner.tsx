import { useState } from "react";
import { Sparkles, MapPin, Compass, DollarSign, Users, Calendar, Trash2, Edit2, Check, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { aiTripPreferences, type TripDay } from "@/data/mockData";

const mockAiResult: TripDay[] = [
  { day: 1, title: "Arrival & City Exploration", description: "Settle in and explore the city center", activities: ["Airport transfer", "Hotel check-in", "City walking tour", "Welcome dinner"] },
  { day: 2, title: "Cultural Immersion", description: "Dive into local culture and traditions", activities: ["Museum visit", "Local cooking class", "Historical site tour", "Night market"] },
  { day: 3, title: "Adventure Day", description: "Outdoor activities and nature", activities: ["Morning hike", "Waterfall visit", "Zip-lining", "Sunset viewpoint"] },
  { day: 4, title: "Relaxation & Shopping", description: "Unwind and find souvenirs", activities: ["Spa morning", "Local market shopping", "Beach afternoon", "Farewell dinner"] },
];

const AiPlanner = () => {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [result, setResult] = useState<TripDay[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const toggleItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleGenerate = () => {
    if (!destination) {
      toast.error("Please select a destination");
      return;
    }
    setStep("loading");
    setTimeout(() => {
      setResult(mockAiResult.slice(0, days));
      setStep("result");
    }, 2000);
  };

  const handleDelete = (dayNum: number) => {
    setResult((prev) => prev.filter((d) => d.day !== dayNum).map((d, i) => ({ ...d, day: i + 1 })));
    toast.success("Day removed from plan");
  };

  const startEdit = (day: TripDay) => {
    setEditingDay(day.day);
    setEditForm({ title: day.title, description: day.description });
  };

  const saveEdit = (dayNum: number) => {
    setResult((prev) =>
      prev.map((d) => (d.day === dayNum ? { ...d, title: editForm.title, description: editForm.description } : d))
    );
    setEditingDay(null);
    toast.success("Day updated");
  };

  const handleSave = () => {
    toast.success("Trip saved successfully!");
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-3xl py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
            <Sparkles className="h-7 w-7 text-secondary" />
          </div>
          <h1 className="font-display text-3xl font-bold">AI Trip Planner</h1>
          <p className="mt-2 text-muted-foreground">Let AI craft your perfect itinerary. Just tell us what you love.</p>
        </div>

        {step === "form" && (
          <div className="space-y-6 rounded-xl    bg-card p-6 shadow-card">
            {/* Destination */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Where do you want to go?</Label>
              <div className="flex flex-wrap gap-2">
                {aiTripPreferences.destinations.map((d) => (
                  <Badge
                    key={d}
                    variant={destination === d ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setDestination(d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
              <Input placeholder="Or type a custom destination..." value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-2" />
            </div>

            {/* Days & Travelers */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Days</Label>
                <Input type="number" min={1} max={30} value={days} onChange={(e) => setDays(parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Travelers</Label>
                <Input type="number" min={1} value={travelers} onChange={(e) => setTravelers(parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Budget</Label>
                <div className="flex flex-wrap gap-1.5">
                  {aiTripPreferences.budgetRanges.map((b) => (
                    <Badge key={b} variant={budget === b ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setBudget(b)}>
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Compass className="h-4 w-4 text-primary" /> Travel Style</Label>
              <div className="flex flex-wrap gap-2">
                {aiTripPreferences.travelStyles.map((s) => (
                  <Badge key={s} variant={selectedStyles.includes(s) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleItem(s, selectedStyles, setSelectedStyles)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Interests</Label>
              <div className="flex flex-wrap gap-2">
                {aiTripPreferences.interests.map((i) => (
                  <Badge key={i} variant={selectedInterests.includes(i) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleItem(i, selectedInterests, setSelectedInterests)}>
                    {i}
                  </Badge>
                ))}
              </div>
            </div>

            <Button className="w-full gap-2" size="lg" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              Generate Trip Plan
            </Button>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="h-16 w-16 animate-spin rounded-full   -4   -muted   -t-primary" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
            </div>
            <p className="font-display text-lg font-semibold">AI is planning your trip...</p>
            <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Your AI-Generated Plan</h2>
                <p className="text-sm text-muted-foreground">{destination} · {result.length} days · {travelers} travelers</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("form")}>Regenerate</Button>
                <Button className="gap-2" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Save Trip
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {result.map((day) => (
                <div key={day.day} className="rounded-lg    bg-card p-4 shadow-card animate-fade-in" style={{ animationDelay: `${day.day * 100}ms` }}>
                  {editingDay === day.day ? (
                    <div className="space-y-3">
                      <Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
                      <Textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1" onClick={() => saveEdit(day.day)}><Check className="h-3 w-3" /> Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingDay(null)}><X className="h-3 w-3" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold">{day.title}</h3>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {day.activities.map((act) => (
                            <Badge key={act} variant="outline" className="text-xs font-normal">{act}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(day)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(day.day)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
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
