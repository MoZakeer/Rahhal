import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { normalizeMediaUrl } from "@/features/post/components/services/posts.api";

interface VibeAvatarRingProps {
  src?: string;
  fallback: string;
  label: string;
  seen?: boolean;
  variant?: "user" | "add" | "all";
  onClick?: () => void;
}

const VibeAvatarRing = ({
  src,
  fallback,
  label,
  seen = false,
  variant = "user",
  onClick,
}: VibeAvatarRingProps) => {
  const ring =
    variant === "user"
      ? seen
        ? "bg-muted"
        : "bg-gradient-to-tr from-accent via-blue-900 to-blue-950"
      : "bg-transparent";

  return (
    <button
      onClick={onClick}
      type="button"
      className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5 focus:outline-none"
      aria-label={label}
    >
      <div
        className={cn(
          "relative rounded-full p-[2.5px] transition-transform group-hover:scale-105 group-active:scale-95",
          ring,
        )}
      >
        {variant === "add" ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary/60 bg-primary/5 text-primary">
            <Plus className="h-6 w-6" />
          </div>
        ) : variant === "all" ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-muted/50 text-xs font-semibold text-foreground">
            All
          </div>
        ) : (
          <Avatar className="h-16 w-16 border-2  border-white dark:border-slate-900">
            <AvatarImage src={normalizeMediaUrl(src)} alt={label} />
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-blue-100">
              {fallback}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <span className="line-clamp-1 max-w-[72px] text-center text-[11px] font-medium text-foreground/80 dark:text-slate-100">
        {label}
      </span>
    </button>
  );
};

export default VibeAvatarRing;
