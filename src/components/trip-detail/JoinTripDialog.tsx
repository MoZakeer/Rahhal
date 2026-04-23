import { useState } from "react";
import { z } from "zod";
import { UserPlus, Send } from "lucide-react";
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
  tripName: string;
}

const JoinTripDialog = ({ tripName }: Props) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinSchema.safeParse({ message });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    toast.success(`Your request to join "${tripName}" has been sent!`);
    setMessage("");
    setOpen(false);
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
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripDialog;
