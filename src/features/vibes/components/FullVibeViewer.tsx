import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MoreVertical, Trash2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import VibeReactionsBar from "./VibeReactionsBar";
import VibeCommentsSheet from "./VibeCommentsSheet";
import VibeCreator from "./VibeCreator";
import { deleteVibe, canDeleteVibe, canEditVibe } from "../services/vibesApi";
import type { UserVibesGroup, Vibe } from "../data/vibesData";

interface FullVibeViewerProps {
  groups: UserVibesGroup[];
  startGroupIndex: number;
  currentUserId: string | null;
  tripOwnerId?: string;
  onClose: () => void;
}

const AUTO_MS = 5000;

const FullVibeViewer = ({
  groups,
  startGroupIndex,
  currentUserId,
  tripOwnerId,
  onClose,
}: FullVibeViewerProps) => {
  const [groupIdx, setGroupIdx] = useState(startGroupIndex);
  const [vibeIdx, setVibeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const group = groups[groupIdx];
  const vibe: Vibe | undefined = group?.vibes[vibeIdx];

  // Auto-advance progress
  useEffect(() => {
    if (!vibe || paused || commentsOpen || confirmDelete || editing) return;
    setProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / AUTO_MS) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        next();
      }
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibe?.id, paused, commentsOpen, editing, confirmDelete]);

  const next = () => {
    if (!group) return;
    if (vibeIdx < group.vibes.length - 1) setVibeIdx((i) => i + 1);
    else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      setVibeIdx(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (vibeIdx > 0) setVibeIdx((i) => i - 1);
    else if (groupIdx > 0) {
      const prevG = groups[groupIdx - 1];
      setGroupIdx((i) => i - 1);
      setVibeIdx(prevG.vibes.length - 1);
    }
  };

  const handleDelete = async () => {
    if (!vibe) return;
    try {
      await deleteVibe(vibe.id);
      toast.success("Vibe deleted");
      // remove from local groups
      group.vibes.splice(vibeIdx, 1);
      if (group.vibes.length === 0) {
        if (groups.length === 1) return onClose();
        groups.splice(groupIdx, 1);
        setGroupIdx((i) => Math.min(i, groups.length - 1));
        setVibeIdx(0);
      } else {
        setVibeIdx((i) => Math.min(i, group.vibes.length - 1));
      }
    } catch {
      toast.error("Failed to delete vibe");
    }
  };

  const tripLite = useMemo(() => ({ ownerId: tripOwnerId }), [tripOwnerId]);

  if (!vibe || !group) return null;

  const canDel = canDeleteVibe(vibe, currentUserId, tripLite);
  const canEdit = canEditVibe(vibe, currentUserId);
  const showMenu = canDel || canEdit;
  const initials = group.userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={() => {
          if (editing || confirmDelete || commentsOpen) return;
          onClose();
        }}
      >
        <div
          className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black md:h-[90vh] md:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bars */}
          <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
            {group.vibes.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className="h-full bg-white transition-[width] duration-75"
                  style={{
                    width:
                      i < vibeIdx ? "100%" : i === vibeIdx ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute left-0 right-0 top-3 z-20 flex items-center gap-3 px-4 pt-2">
            <Avatar className="h-9 w-9 border-2 border-white/40">
              <AvatarImage src={group.userAvatar} alt={group.userName} />
              <AvatarFallback className="bg-primary/20 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {group.userName}
              </p>
              <p className="text-[11px] text-white/60">
                {new Date(vibe.createdAt).toLocaleString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-white hover:bg-white/10"
                    onClick={() => setPaused(true)}
                    aria-label="More"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onCloseAutoFocus={() => setPaused(false)}
                >
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  )}
                  {canDel && (
                    <DropdownMenuItem
                      onClick={() => setConfirmDelete(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className="relative flex-1 select-none"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={vibe.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {vibe.type === "text" ? (
                  <div
                    className="flex h-full w-full items-center justify-center p-8 text-center"
                    style={{ background: "var(--gradient-ocean)" }}
                  >
                    <p className="font-display text-2xl leading-snug text-white">
                      {vibe.content}
                    </p>
                  </div>
                ) : vibe.type === "video" ? (
                  <video
                    src={vibe.mediaUrls[0]}
                    autoPlay
                    muted
                    playsInline
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <VibeImageStack urls={vibe.mediaUrls} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Tap zones */}
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="absolute inset-y-0 left-0 z-10 w-1/3"
            />
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="absolute inset-y-0 right-0 z-10 w-1/3"
            />

            {/* Caption for image/mixed */}
            {vibe.content && vibe.type !== "text" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6">
                <p className="text-sm leading-relaxed text-white">{vibe.content}</p>
              </div>
            )}

            {/* Side nav buttons (desktop) */}
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:block"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:block"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Reactions / latest comment */}
          <VibeReactionsBar
            vibe={vibe}
            onOpenComments={() => setCommentsOpen(true)}
            onPause={() => setPaused(true)}
            onResume={() => setPaused(false)}
          />
        </div>

        {commentsOpen && (
          <VibeCommentsSheet
            vibe={vibe}
            currentUserId={currentUserId}
            onClose={() => setCommentsOpen(false)}
          />
        )}

        {editing && currentUserId && (
          <VibeCreator
            tripId={vibe.tripId}
            currentUserId={currentUserId}
            currentUserName={vibe.userName}
            currentUserAvatar={vibe.userAvatar}
            vibe={vibe}
            onSaved={(updated) => {
              // mutate in place so viewer reflects new caption immediately
              group.vibes[vibeIdx] = { ...vibe, ...updated };
            }}
            onClose={() => setEditing(false)}
          />
        )}

        <AlertDialog
          open={confirmDelete}
          onOpenChange={(o) => setConfirmDelete(o)}
        >
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this Vibe?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the Vibe and all its reactions and
                comments. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setConfirmDelete(false);
                  await handleDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
};

const VibeImageStack = ({ urls }: { urls: string[] }) => {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) return null;
  return (
    <div className="relative h-full w-full">
      <img
        src={urls[idx]}
        alt=""
        className="h-full w-full object-contain"
      />
      {urls.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FullVibeViewer;
