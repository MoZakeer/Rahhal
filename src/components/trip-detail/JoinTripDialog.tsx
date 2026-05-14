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
import { useLanguage } from "@/context/LanguageContext";

// eslint-disable-next-line react-refresh/only-export-components
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
  const { t, language } = useLanguage();
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
      // Dynamic success toast with trip name
      toast.success(t("join.success").replace("{name}", tripName));
      setOpen(false);
      setCurrentStatus(UserTripStatus.Requested);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t("join.failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Status: User is already a member
  if (currentStatus === UserTripStatus.Joined) {
    return (
      <Button
        variant="secondary"
        className="w-full gap-2 cursor-default opacity-100 dark:bg-slate-800 dark:text-slate-200"
        disabled
      >
        <CheckCircle2 className="h-4 w-4 text-primary dark:text-blue-400" />
        {t("join.alreadyJoined")}
      </Button>
    );
  }

  // Status: Request is already sent and pending
  if (currentStatus === UserTripStatus.Requested) {
    return (
      <Button
        variant="outline"
        className="w-full gap-2 cursor-default opacity-100 dark:border-slate-800 dark:text-slate-400"
        disabled
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        {t("join.requestPending")}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
          <UserPlus className="h-4 w-4" />
          {t("join.joinTrip")}
        </Button>
      </DialogTrigger>

      <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="font-display dark:text-slate-100">
            {t("join.requestToJoin")}
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {/* Using t() to handle text around the dynamic trip name */}
            {t("join.description")}
            <strong className="dark:text-slate-200">{tripName}</strong>?
            {language === 'ar' ? " سيقوم منشئ الرحلة بمراجعة طلبك." : " The trip creator will review your request."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="dark:border-slate-700 dark:bg-blue-600 dark:hover:bg-slate-800 dark:text-slate-300"
              >
                {t("join.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? t("join.sending") : t("join.sendJoin")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripDialog;