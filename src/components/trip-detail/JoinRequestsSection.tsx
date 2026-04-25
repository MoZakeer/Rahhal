import { useState } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleJoinRequest } from "@/lib/tripApi";
import { ApiError } from "@/lib/api";
import type { JoinRequest, JoinRequestStatus } from "@/types/trip";

interface Props {
  requests: JoinRequest[];
  hideHeader?: boolean;
  loading?: boolean;
  onStatusChange?: (id: string, status: JoinRequestStatus) => void;
}

const statusStyles: Record<JoinRequestStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  accepted: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const JoinRequestsSection = ({ requests, hideHeader = false, loading = false, onStatusChange }: Props) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: JoinRequestStatus) => {
    setBusyId(id);
    try {
      await handleJoinRequest(id, status === "accepted" ? "Accepted" : "Rejected");
      onStatusChange?.(id, status);
      toast.success(status === "accepted" ? "Request accepted" : "Request rejected");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update request";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Join Requests</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage who can join this trip</p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-secondary text-secondary-foreground border-0">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      )}

      <div className={hideHeader ? "space-y-3" : "mt-4 space-y-3"}>
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading requests...
          </div>
        )}
        {!loading && requests.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No join requests yet.
          </p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {r.userAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{r.userName}</p>
                  <Badge className={`${statusStyles[r.status]} border-0 capitalize`}>
                    {r.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                    {r.status}
                  </Badge>
                </div>
                {r.message && <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Requested {new Date(r.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>

                {r.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={busyId === r.id}
                      onClick={() => updateStatus(r.id, "accepted")}
                    >
                      {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={busyId === r.id}
                      onClick={() => updateStatus(r.id, "rejected")}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinRequestsSection;