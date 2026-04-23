import { useState } from "react";
import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { JoinRequest, JoinRequestStatus } from "@/data/mockData";

interface Props {
  requests: JoinRequest[];
  hideHeader?: boolean;
}

const statusStyles: Record<JoinRequestStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  accepted: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const JoinRequestsSection = ({ requests, hideHeader = false }: Props) => {
  const [items, setItems] = useState<JoinRequest[]>(requests);

  const updateStatus = (id: string, status: JoinRequestStatus) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(status === "accepted" ? "Request accepted" : "Request rejected");
  };

  const pendingCount = items.filter((r) => r.status === "pending").length;

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
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No join requests yet.
          </p>
        )}
        {items.map((r) => (
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
                <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requested {new Date(r.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>

                {r.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => updateStatus(r.id, "accepted")}>
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(r.id, "rejected")}>
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
