import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, FileText, DollarSign, Tag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const suggestedTags = ["Beach", "Mountains", "Culture", "Food", "Adventure", "Luxury", "Nature", "City", "History", "Nightlife"];

const CreateTrip = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    description: "",
    budget: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags((prev) => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.destination || !form.startDate || !form.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Trip created successfully!");
    navigate("/");
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-2xl py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Create a New Trip</h1>
          <p className="mt-2 text-muted-foreground">Plan your next adventure manually by filling in the details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Trip Name *
            </Label>
            <Input id="name" placeholder="e.g., Summer in Santorini" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="dest" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Destination *
            </Label>
            <Input id="dest" placeholder="e.g., Santorini, Greece" value={form.destination} onChange={(e) => update("destination", e.target.value)} />
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Start Date *
              </Label>
              <Input id="start" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> End Date *
              </Label>
              <Input id="end" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
            </div>
          </div>

          {/* Travelers & Budget */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="travelers" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Number of Travelers
              </Label>
              <Input id="travelers" type="number" min={1} value={form.travelers} onChange={(e) => update("travelers", parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> Budget
              </Label>
              <Input id="budget" placeholder="e.g., $2,500" value={form.budget} onChange={(e) => update("budget", e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="desc" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Description
            </Label>
            <Textarea id="desc" rows={4} placeholder="Describe your trip..." value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addCustomTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Create Trip</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
