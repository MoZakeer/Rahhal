import { useState, useEffect } from "react";
import { UserPlus, Send, Loader2, CheckCircle2, Clock } from "lucide-react";
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
import { toast } from "sonner";

// عرفنا الـ Enum هنا عشان الكود يكون مقروء (اختياري بس بيخلي الشغل نضيف)
export enum UserTripStatus {
  Joined = 1,
  Requested = 2,
  CanJoin = 3,
}

interface Props {
  tripId: string;
  tripName: string;
  userStatus?: UserTripStatus | 1 | 2 | 3; 
}

const JoinTripDialog = ({ tripId, tripName, userStatus = 3 }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(userStatus);

  useEffect(() => {
    setCurrentStatus(userStatus);
  }, [userStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestJoinTrip(tripId);
      toast.success(`Your request to join "${tripName}" has been sent!`);
      setOpen(false);
      setCurrentStatus(UserTripStatus.Requested); 
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send request";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === UserTripStatus.Joined) {
    return (
      <Button variant="secondary" className="w-full gap-2 cursor-default opacity-100" disabled>
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Already Joined
      </Button>
    );
  }

  if (currentStatus === UserTripStatus.Requested) {
    return (
      <Button variant="outline" className="w-full gap-2 cursor-default opacity-100" disabled>
        <Clock className="h-4 w-4 text-muted-foreground" />
        Request Pending
      </Button>
    );
  }

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
            Are you sure you want to send a request to join <strong>{tripName}</strong>? The trip creator will review your request and accept or reject it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Sending..." : "Send Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripDialog;