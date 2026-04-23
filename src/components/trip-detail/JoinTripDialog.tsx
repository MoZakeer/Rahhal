import { useState } from "react";
import { z } from "zod";
import { UserPlus, Send, Loader2 } from "lucide-react";
import { requestJoinTrip } from "@/lib/tripApi";
import { ApiError } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const joinSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(500, { message: "Message must be less than 500 characters" }),
});

interface Props {
  tripId: string;
  tripName: string;
}

const JoinTripDialog = ({ tripId, tripName }: Props) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinSchema.safeParse({ message });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestJoinTrip(tripId);
      toast.success(`Your request to join "${tripName}" has been sent!`);
      setMessage("");
      setOpen(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send request";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <UserPlus className="h-4 w-4" />
          Join Trip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Request to Join</DialogTitle>
          <DialogDescription>
            Send a message to the trip creator explaining why you'd like to join.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-message">Your message</Label>
            <Textarea
              id="join-message"
              placeholder="Hi! I'd love to join your trip because..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={5}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={error ? "text-destructive" : "text-muted-foreground"}>
                {error ?? "Tell them about your travel style and what you're looking forward to."}
              </span>
              <span className="text-muted-foreground">{message.length}/500</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripDialog;
