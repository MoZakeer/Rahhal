import { useEffect, useState, useMemo } from "react";
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
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
  const navigate = useNavigate();

  const [viewerGroups, setViewerGroups] = useState<UserVibesGroup[]>(() => groups);
  const [activeGroupId, setActiveGroupId] = useState<string>(() => groups[startGroupIndex]?.userId || "");
  const [activeVibeId, setActiveVibeId] = useState<string>(() => groups[startGroupIndex]?.vibes[0]?.id || "");

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const [editingVibe, setEditingVibe] = useState<Vibe | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { group, vibe, groupIdx, vibeIdx } = useMemo(() => {
    let gIdx = viewerGroups.findIndex((g) => g.userId === activeGroupId);
    if (gIdx === -1) gIdx = 0;
    const currentGroup = viewerGroups[gIdx];

    let vIdx = currentGroup?.vibes.findIndex((v) => v.id === activeVibeId) ?? -1;
    if (vIdx === -1) vIdx = 0;
    const currentVibe = currentGroup?.vibes[vIdx];

    return { group: currentGroup, vibe: currentVibe, groupIdx: gIdx, vibeIdx: vIdx };
  }, [viewerGroups, activeGroupId, activeVibeId]);

  const vibeText = vibe?.content ?? vibe?.description ?? "";
  const isTextVibe =
    !vibe ||
    vibe.type?.toLowerCase?.() === "text" ||
    !vibe.mediaUrls ||
    vibe.mediaUrls.length === 0;

  const isAnySubModalOpen = !!editingVibe || confirmDelete || commentsOpen || isDeleting;

  useEffect(() => {
    if (!vibe || paused || isAnySubModalOpen || dropdownOpen) return;

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
  }, [activeVibeId, paused, isAnySubModalOpen, dropdownOpen]);

  const next = () => {
    if (!group || isAnySubModalOpen) return;
    if (vibeIdx < group.vibes.length - 1) {
      setActiveVibeId(group.vibes[vibeIdx + 1].id);
    } else if (groupIdx < viewerGroups.length - 1) {
      const nextGroup = viewerGroups[groupIdx + 1];
      setActiveGroupId(nextGroup.userId);
      setActiveVibeId(nextGroup.vibes[0]?.id || "");
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (isAnySubModalOpen) return;
    if (vibeIdx > 0) {
      setActiveVibeId(group.vibes[vibeIdx - 1].id);
    } else if (groupIdx > 0) {
      const prevGroup = viewerGroups[groupIdx - 1];
      setActiveGroupId(prevGroup.userId);
      setActiveVibeId(prevGroup.vibes[prevGroup.vibes.length - 1]?.id || "");
    }
  };

  const handleToggleLike = async (vibeId: string) => {
    let rollbackVibe: Vibe | null = null;
    setViewerGroups((prev) =>
      prev.map((g) => ({
        ...g,
        vibes: g.vibes.map((v) => {
          if (v.id !== vibeId) return v;
          rollbackVibe = v;
          const updatedVibe = {
            ...v,
            isLiked: !v.isLiked,
            likes: v.isLiked ? Math.max(0, v.likes - 1) : v.likes + 1,
          };
          setTimeout(() => onVibeUpdate?.(updatedVibe), 0);
          return updatedVibe;
        }),
      })),
    );

    try {
      await toggleReaction(vibeId);
    } catch (err) {
      console.error("Failed to toggle reaction", err);
      if (rollbackVibe) {
        setViewerGroups((prev) =>
          prev.map((g) => ({
            ...g,
            vibes: g.vibes.map((v) => (v.id === vibeId ? rollbackVibe! : v)),
          })),
        );
        setTimeout(() => onVibeUpdate?.(rollbackVibe!), 0);
      }
    }
  };

  const handleDelete = async () => {
    if (!vibe) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token") ?? "";
      await deleteVibe(vibe.id, token);
      toast.success("Vibe deleted");

      const updatedGroups = viewerGroups
        .map((g) => ({
          ...g,
          vibes: g.vibes.filter((v) => v.id !== vibe.id),
        }))
        .filter((g) => g.vibes.length > 0);

      if (updatedGroups.length === 0) {
        onClose();
        return;
      }

      setViewerGroups(updatedGroups);

      if (vibeIdx < group.vibes.length - 1) {
        setActiveVibeId(group.vibes[vibeIdx + 1].id);
      } else {
        const currentGroupInUpdated = updatedGroups.find(g => g.userId === activeGroupId);
        if (currentGroupInUpdated) {
          setActiveVibeId(currentGroupInUpdated.vibes[currentGroupInUpdated.vibes.length - 1].id);
        } else {
          setActiveGroupId(updatedGroups[0].userId);
          setActiveVibeId(updatedGroups[0].vibes[0].id);
        }
      }
    } catch {
      toast.error("Failed to delete vibe");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
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
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-lg"
          onClick={(e) => {
            if (e.target !== e.currentTarget || isAnySubModalOpen || dropdownOpen) return;
            onClose();
          }}
        >
          <div
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black shadow-2xl md:h-[90vh] md:rounded-2xl md:ring-1 md:ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrim layer */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/60 to-transparent" />

            {/* Progress bars */}
            <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 p-2">
              {group.vibes.map((v, i) => (
                <div
                  key={v.id}
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
                className="h-9 w-9 border border-white/20 shadow-sm cursor-pointer hover:text-white/90 transition-colors pointer-events-auto"
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
                  className="truncate text-sm font-semibold text-white cursor-pointer hover:text-white/90 transition-colors pointer-events-auto"
                >
                  {group.userName}
                </p>
               <p className="text-[11px] text-white/75 font-medium">
  {(() => {
    if (!vibe?.createdAt) return null;

    const date = new Date(vibe.createdAt);
    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

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
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(true);
                      }}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-[200] pointer-events-auto"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDropdownOpen(false);
                          setEditingVibe({
                            ...vibe,
                            mediaUrls: vibe.mediaUrls?.map((url) => normalizeMediaUrl(url)) || [],
                          });
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    {canDel && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDropdownOpen(false);
                          setConfirmDelete(true);
                        }}
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
                className="rounded-full p-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Canvas */}
            <div
              className="relative flex-1 select-none bg-zinc-950"
              onPointerDown={() => { if (!dropdownOpen) setPaused(true); }}
              onPointerUp={() => { if (!dropdownOpen) setPaused(false); }}
              onPointerLeave={() => { if (!dropdownOpen) setPaused(false); }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={vibe.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-w-resize" />
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-e-resize" />

              {/* Caption layer */}
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
        </motion.div>
      </AnimatePresence>

      {/* الـ Edit Modal - تم تصحيحه ليرندر بسلام داخل الـ Fragment الأساسي */}
      {editingVibe && currentUserId && (
        <VibeCreator
          key={editingVibe.id}
          tripId={editingVibe.tripId ?? ""}
          currentUserId={currentUserId}
          currentUserName={editingVibe.userName}
          currentUserAvatar={editingVibe.userAvatar}
          vibe={editingVibe}
          onSaved={(updated) => {
            setViewerGroups((prev) =>
              prev.map((g) => ({
                ...g,
                vibes: g.vibes.map((v) =>
                  v.id === updated.id ? { ...v, ...updated } : v
                ),
              }))
            );
            onVibeUpdate?.(updated);
            setEditingVibe(null);
          }}
          onClose={() => setEditingVibe(null)}
        />
      )}

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(o) => {
          if (!isDeleting) setConfirmDelete(o);
        }}
      >
        <AlertDialogContent
          className="z-[700]"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this Vibe?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the Vibe and all its reactions and
              comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
        className="h-full w-full object-cover"
      />
      {urls.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 p-1.5 backdrop-blur-md">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/40"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FullVibeViewer;