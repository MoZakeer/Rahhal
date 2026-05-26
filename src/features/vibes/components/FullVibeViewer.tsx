import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MoreVertical, Trash2, Pencil } from "lucide-react";
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
import { normalizeMediaUrl } from "@/features/post/components/services/posts.api";
import { toggleReaction } from "../services/vibesApi";
import { useNavigate } from "react-router-dom";
interface FullVibeViewerProps {
  groups: UserVibesGroup[];
  startGroupIndex: number;
  currentUserId: string | null;
  tripOwnerId?: string;
  onClose: () => void;
  onVibeUpdate?: (updatedVibe: Vibe) => void;
}

const AUTO_MS = 5000;

const FullVibeViewer = ({
  groups,
  startGroupIndex,
  currentUserId,
  onClose,
  onVibeUpdate,
}: FullVibeViewerProps) => {
  const [groupIdx, setGroupIdx] = useState(startGroupIndex);
  const [vibeIdx, setVibeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const [viewerGroups, setViewerGroups] = useState(groups);

  const group = viewerGroups[groupIdx];
  const vibe: Vibe | undefined = group?.vibes[vibeIdx];
  const vibeText = vibe?.content ?? vibe?.description ?? "";
  const isTextVibe =
    vibe.type?.toLowerCase?.() === "text" ||
    !vibe.mediaUrls ||
    vibe.mediaUrls.length === 0;

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
    else if (groupIdx < viewerGroups.length - 1) {
      setGroupIdx((i) => i + 1);
      setVibeIdx(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (vibeIdx > 0) setVibeIdx((i) => i - 1);
    else if (groupIdx > 0) {
      const prevG = viewerGroups[groupIdx - 1];
      setGroupIdx((i) => i - 1);
      setVibeIdx(prevG.vibes.length - 1);
    }
  };
  const handleToggleLike = async (vibeId: string) => {
    let rollbackVibe: Vibe | null = null;

    // Optimistic update
    setViewerGroups((prev) =>
      prev.map((group) => ({
        ...group,
        vibes: group.vibes.map((v) => {
          if (v.id !== vibeId) return v;

          rollbackVibe = v;

          const updatedVibe = {
            ...v,
            isLiked: !v.isLiked,
            likes: v.isLiked ? Math.max(0, v.likes - 1) : v.likes + 1,
          };

          // sync parent
          onVibeUpdate?.(updatedVibe);

          return updatedVibe;
        }),
      })),
    );

    try {
      await toggleReaction(vibeId);
    } catch (err) {
      console.error("Failed to toggle reaction", err);

      // rollback
      if (rollbackVibe) {
        setViewerGroups((prev) =>
          prev.map((group) => ({
            ...group,
            vibes: group.vibes.map((v) =>
              v.id === vibeId ? rollbackVibe! : v,
            ),
          })),
        );

        onVibeUpdate?.(rollbackVibe);
      }
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

  if (!vibe || !group) return null;

  const canDel = canDeleteVibe(vibe, currentUserId);
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
        // OPTIMIZATION: Softened backdrop for desktop, richer blur effect
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-lg"
        onClick={() => {
          if (editing || confirmDelete || commentsOpen) return;
          onClose();
        }}
      >
        <div
          // OPTIMIZATION: Ring borders on desktop create a crisp edge against dark backdrops
          className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black shadow-2xl md:h-[90vh] md:rounded-2xl md:ring-1 md:ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 
        OPTIMIZATION: Added a scrim (gradient protection layer) 
        This keeps progress bars & headers visible even over pure white images/videos
      */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Progress bars */}
          <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 p-2">
            {group.vibes.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-[width] linear"
                  style={{
                    width:
                      i < vibeIdx
                        ? "100%"
                        : i === vibeIdx
                          ? `${progress}%`
                          : "0%",
                    // OPTIMIZATION: ensures smooth fluid transition tracking updates perfectly
                    transitionDuration: i === vibeIdx ? "75ms" : "0ms",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute left-0 right-0 top-3 z-30 flex items-center gap-3 px-4 pt-2">
            <Avatar
              onClick={() => navigate(`/profile/${group.userId}`)}
              className="h-9 w-9 border border-white/20 shadow-sm cursor-pointer  hover:text-white/90 transition-colors"
            >
              <AvatarImage
                src={normalizeMediaUrl(group.userAvatar)}
                alt={group.userName}
              />
              <AvatarFallback className="bg-white/10 text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 drop-shadow-sm">
              <p
                onClick={() => navigate(`/profile/${group.userId}`)}
                className="truncate text-sm font-semibold text-white cursor-pointer hover:text-white/90 transition-colors"
              >
                {group.userName}
              </p>
              <p className="text-[11px] text-white/75 font-medium">
                {(() => {
                  const date = new Date(vibe.createdAt);
                  const now = new Date();

                  const isToday = date.toDateString() === now.toDateString();

                  const yesterday = new Date();
                  yesterday.setDate(now.getDate() - 1);

                  const isYesterday =
                    date.toDateString() === yesterday.toDateString();

                  const time = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  if (isToday) return `Today, ${time}`;

                  if (isYesterday) return `Yesterday, ${time}`;

                  return date.toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                })()}
              </p>
            </div>
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
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
              className="rounded-full p-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Canvas */}
          <div
            className="relative flex-1 select-none bg-zinc-950"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={vibe.id}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {isTextVibe ? (
                  <div className="relative flex h-full w-full flex-col items-center justify-center px-8 text-center bg-zinc-950 overflow-hidden">
                    <img
                      src={normalizeMediaUrl(group.userAvatar)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover scale-150 blur-[80px] opacity-40 brightness-[0.4] saturate-[1.8]"
                    />

                    {/* Vignette layer to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />

                    <p className="relative z-10 font-display text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-md max-w-xs">
                      {vibeText}
                    </p>
                  </div>
                ) : vibe.type === "video" ? (
                  <video
                    src={vibe.mediaUrls[0]}
                    autoPlay
                    muted
                    playsInline
                    loop
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <VibeImageStack urls={vibe.mediaUrls} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Tap zones for Navigation */}
            <button
              type="button"
              aria-label="Previous story"
              onClick={prev}
              className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-w-resize"
            />
            <button
              type="button"
              aria-label="Next story"
              onClick={next}
              className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-e-resize"
            />

            {/* Caption layer for media */}
            {vibeText && !isTextVibe && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pb-23">
                <p className="text-sm font-medium leading-relaxed text-white drop-shadow-md">
                  {vibeText}
                </p>
              </div>
            )}
          </div>

          {/* Reactions Footer Container */}
          <div className="relative z-30 bg-black">
            <VibeReactionsBar
              key={vibe.id}
              vibe={vibe}
              onToggleLike={() => handleToggleLike(vibe.id)}
              onOpenComments={() => setCommentsOpen(true)}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
            />
          </div>
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
            tripId={vibe.tripId ?? ""}
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
        src={normalizeMediaUrl(urls[idx])}
        alt=""
        /* OPTIMIZATION: Changed object-contain to object-cover for full bleed integration */
        className="h-full w-full object-cover"
      />
      {urls.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 p-1.5 backdrop-blur-md">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-4 bg-white" : "w-1.5 bg-white/40"
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
