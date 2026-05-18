import { useRef, useState } from "react";
import { Image as ImageIcon, Video, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createVibe, updateVibe } from "../services/vibesApi";
import type { Vibe, VibeType } from "../data/vibesData";

interface VibeCreatorProps {
  tripId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  vibe?: Vibe; // when set, opens in edit mode
  onClose: () => void;
  onSaved?: (vibe: Vibe) => void;
}

interface MediaItem {
  url: string;
  kind: "image" | "video";
  file?: File; // absent for pre-existing media in edit mode
  existing?: boolean;
}

const VibeCreator = ({
  tripId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  vibe,
  onClose,
  onSaved,
}: VibeCreatorProps) => {
  const isEdit = Boolean(vibe);
  const [text, setText] = useState(vibe?.content ?? "");
  const [media, setMedia] = useState<MediaItem[]>(() => {
    if (!vibe || vibe.mediaUrls.length === 0) return [];
    const kind: "image" | "video" = vibe.type === "video" ? "video" : "image";
    return vibe.mediaUrls.map((url) => ({ url, kind, existing: true }));
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState<number | null>(null);
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);

  const isVideoSelected = media.some((m) => m.kind === "video");

  const addImages = (files: FileList | null) => {
    if (!files) return;
    if (isVideoSelected) {
      toast.error("Remove the video to add images.");
      return;
    }
    const remaining = 4 - media.length;
    const next = Array.from(files)
      .slice(0, remaining)
      .map<MediaItem>((file) => ({
        file,
        kind: "image",
        url: URL.createObjectURL(file),
      }));
    setMedia((m) => [...m, ...next]);
  };

  const addVideo = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (media.length > 0) {
      toast.error("Clear images before adding a video.");
      return;
    }
    const file = files[0];
    setMedia([{ file, kind: "video", url: URL.createObjectURL(file) }]);
  };

  const removeMedia = (idx: number) => {
    setMedia((m) => {
      if (!m[idx].existing) URL.revokeObjectURL(m[idx].url);
      return m.filter((_, i) => i !== idx);
    });
  };

  const requestRemove = (idx: number) => {
    if (media[idx]?.existing) {
      setConfirmRemoveIdx(idx);
    } else {
      removeMedia(idx);
    }
  };

  const handleSubmit = async () => {
    if (isEdit) {
      if (!text.trim() && media.length === 0) {
        toast.error("Add a caption or media.");
        return;
      }
      setSubmitting(true);
      try {
        let type: VibeType = "text";
        if (media.length > 0 && text.trim()) type = "mixed";
        else if (media.length > 0) type = isVideoSelected ? "video" : "image";

        const updated = await updateVibe(vibe!.id, {
          content: text.trim() || undefined,
          mediaUrls: media.map((m) => m.url),
          type,
        });
        if (updated) {
          toast.success("Vibe updated");
          onSaved?.(updated);
        }
        onClose();
      } catch {
        toast.error("Failed to update vibe.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!text.trim() && media.length === 0) {
      toast.error("Write something or add media.");
      return;
    }
    setSubmitting(true);
    try {
      let type: VibeType = "text";
      if (media.length > 0 && text.trim()) type = "mixed";
      else if (media.length > 0) type = isVideoSelected ? "video" : "image";

      const created = await createVibe({
        tripId,
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        type,
        content: text.trim() || undefined,
        mediaUrls: media.map((m) => m.url),
      });
      toast.success("Vibe shared!");
      onSaved?.(created);
      onClose();
    } catch {
      toast.error("Failed to share vibe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Vibe" : "Share a Vibe"}
          </DialogTitle>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the vibe? Share a moment from your trip…"
          className="min-h-[110px] resize-none"
        />

        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {media.map((m, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                {m.kind === "image" ? (
                  <img
                    src={m.url}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={m.url}
                    className="h-full w-full object-cover"
                    muted
                  />
                )}
                <button
                  type="button"
                  onClick={() => requestRemove(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-foreground/70 p-1 text-background transition hover:bg-foreground"
                  aria-label="Remove media"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imgInput.current?.click()}
            disabled={isVideoSelected || media.length >= 4}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Images ({media.filter((m) => m.kind === "image").length}/4)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => vidInput.current?.click()}
            disabled={media.length > 0 && !isVideoSelected}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Video
          </Button>
          <input
            ref={imgInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addImages(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={vidInput}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              addVideo(e.target.files);
              e.target.value = "";
            }}
          />

          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {isEdit ? "Saving…" : "Sharing…"}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Share Vibe"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      <AlertDialog
        open={confirmRemoveIdx !== null}
        onOpenChange={(o) => !o && setConfirmRemoveIdx(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this media?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the existing{" "}
              {media[confirmRemoveIdx ?? 0]?.kind === "video"
                ? "video"
                : "image"}{" "}
              from your Vibe once you save changes. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRemoveIdx !== null) removeMedia(confirmRemoveIdx);
                setConfirmRemoveIdx(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default VibeCreator;
