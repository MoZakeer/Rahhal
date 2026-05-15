import { useState } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleJoinRequest } from "@/lib/tripApi";
import { ApiError } from "@/lib/api";
import type { JoinRequest, JoinRequestStatus } from "@/types/trip";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "react-router-dom";

const BASE_URL = "https://rahhal-api.runasp.net";

interface Props {
  requests: JoinRequest[];
  hideHeader?: boolean;
  loading?: boolean;
  onStatusChange?: (id: string, status: JoinRequestStatus) => void;
}

const statusStyles: Record<JoinRequestStatus, string> = {
  pending: "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-slate-400",
  accepted: "bg-success text-success-foreground dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-destructive text-destructive-foreground dark:bg-red-900/30 dark:text-red-400",
};

const JoinRequestsSection = ({ requests, hideHeader = false, loading = false, onStatusChange }: Props) => {
  const { t, language } = useLanguage();
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: JoinRequestStatus) => {
    setBusyId(id);
    try {
      await handleJoinRequest(id, status === "accepted" ? "Accepted" : "Rejected");
      onStatusChange?.(id, status);
      toast.success(status === "accepted" ? t("joinRequests.toastAccepted") : t("joinRequests.toastRejected"));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t("joinRequests.toastError");
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
            <h2 className="font-display text-xl font-semibold dark:text-slate-100">
              {t("joinRequests.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
              {t("joinRequests.subtitle")}
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-secondary text-secondary-foreground border-0 dark:bg-blue-900/40 dark:text-blue-300">
              {pendingCount} {t("joinRequests.pending")}
            </Badge>
          )}
        </div>
      )}

      <div className={hideHeader ? "space-y-3" : "mt-4 space-y-3"}>
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-lg dark:border-slate-800 p-6 text-sm text-muted-foreground dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("joinRequests.loading")}
          </div>
        )}
        {!loading && requests.length === 0 && (
          <p className="rounded-lg dark:border-slate-800 p-6 text-center text-sm text-muted-foreground dark:text-slate-400">
            {t("joinRequests.noRequests")}
          </p>
        )}
        
        {requests.map((r) => {
          const isImageUrl = r.userAvatar && r.userAvatar.startsWith("/");
          const fullImageUrl = isImageUrl ? `${BASE_URL}${r.userAvatar}` : null;

          return (
            <div key={r.id} className="rounded-lg border border-gray-300 dark:border-slate-800 bg-card dark:bg-slate-900 p-4 shadow-card">
              <div className="flex items-start gap-3">
                
                <Link to={`/profile/${r.userId}`} className="shrink-0 transition-opacity hover:opacity-80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground dark:text-white overflow-hidden">
                    {fullImageUrl ? (
                      <img 
                        src={fullImageUrl} 
                        alt={r.userName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      r.userAvatar
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/profile/${r.userId}`} className="font-medium hover:underline dark:text-slate-200">
                      {r.userName}
                    </Link>
                    <Badge className={`${statusStyles[r.status]} border-0 capitalize`}>
                      {r.status === "pending" && <Clock className="me-1 h-3 w-3" />}
                      {t(`joinRequests.${r.status}`)}
                    </Badge>
                  </div>
                  {r.message && <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">{r.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground dark:text-slate-500">
                    {t("joinRequests.requested")}{" "}
                    {new Date(r.requestedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>

                  {r.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                        disabled={busyId === r.id}
                        onClick={() => updateStatus(r.id, "accepted")}
                      >
                        {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {t("joinRequests.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 dark:border-slate-700 dark:hover:bg-slate-800"
                        disabled={busyId === r.id}
                        onClick={() => updateStatus(r.id, "rejected")}
                      >
                        <X className="h-4 w-4" /> {t("joinRequests.reject")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JoinRequestsSection;