import { useState } from "react";
import { z } from "zod";
import { Pencil, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Trip } from "@/data/mockData";
import { updateTrip } from "@/lib/tripApi";
import { ApiError } from "@/lib/api";

const editSchema = z.object({
  name: z.string().trim().min(3, { message: "Name must be at least 3 characters" }).max(100),
  destination: z.string().trim().min(2, { message: "Destination is required" }).max(100),
  description: z.string().trim().min(10, { message: "Description must be at least 10 characters" }).max(1000),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  travelers: z.coerce.number().int().min(1, { message: "At least 1 traveler" }).max(50),
  budget: z.string().trim().max(50).optional(),
}).refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface Props {
  trip: Trip;
  // Required to call backend Update — pass IDs from the API response when available.
  destinationId?: string;
  countryId?: string;
  travelPreferencesId?: string[];
  gender?: number;
  ageGroup?: number;
  status?: number;
  onSaved?: () => void;
}

const EditTripDialog = ({
  trip,
  destinationId,
  countryId,
  travelPreferencesId,
  gender = 0,
  ageGroup = 1,
  status = 1,
  onSaved,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: trip.name,
    destination: trip.destination,
    description: trip.description,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelers: trip.travelers,
    budget: trip.budget ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof typeof form, v: string | number) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = editSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const budgetNum = Number(String(result.data.budget ?? "").replace(/[^0-9.]/g, "")) || 0;
    setSubmitting(true);
    try {
      await updateTrip({
        id: trip.id,
        name: result.data.name,
        description: result.data.description,
        startDate: new Date(result.data.startDate).toISOString(),
        endDate: new Date(result.data.endDate).toISOString(),
        numberOfTravelers: result.data.travelers,
        budget: budgetNum,
        gender,
        ageGroup,
        status,
        destinationId: destinationId ?? "",
        countryId: countryId ?? "",
        travelPreferencesId: travelPreferencesId ?? [],
      });
      toast.success("Trip updated successfully");
      setOpen(false);
      onSaved?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update trip";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Pencil className="h-4 w-4" />
          Edit Trip
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Trip</DialogTitle>
          <DialogDescription>Update your trip details and save.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t-name">Trip Name</Label>
            <Input id="t-name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={100} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-dest">Destination</Label>
            <Input id="t-dest" value={form.destination} onChange={(e) => update("destination", e.target.value)} maxLength={100} />
            {errors.destination && <p className="text-xs text-destructive">{errors.destination}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={1000} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="t-start">Start Date</Label>
              <Input id="t-start" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-end">End Date</Label>
              <Input id="t-end" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="t-trav">Travelers</Label>
              <Input
                id="t-trav"
                type="number"
                min={1}
                max={50}
                value={form.travelers}
                onChange={(e) => update("travelers", Number(e.target.value))}
              />
              {errors.travelers && <p className="text-xs text-destructive">{errors.travelers}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-budget">Budget (optional)</Label>
              <Input id="t-budget" placeholder="$2,000" value={form.budget} onChange={(e) => update("budget", e.target.value)} maxLength={50} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripDialog;
