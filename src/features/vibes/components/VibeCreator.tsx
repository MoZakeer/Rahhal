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
import type { Vibe } from "../data/vibesData";

interface VibeCreatorProps {
  tripId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  vibe?: Vibe;
  onClose: () => void;
  onSaved?: (vibe: Vibe) => void;
}

interface MediaItem {
  url: string;
  kind: "image" | "video";
  file?: File;
  existing?: boolean;
  mediaId?: string;
}

const VibeCreator = ({
  tripId,
  vibe,
  onClose,
  onSaved,
}: VibeCreatorProps) => {
  const isEdit = Boolean(vibe);

  const [text, setText] = useState(vibe?.content ?? "");

  const [media, setMedia] = useState<MediaItem[]>(() => {
    if (!vibe || !vibe.mediaUrls?.length) return [];

    const kind: "image" | "video" =
      vibe.type === "video" ? "video" : "image";

    return vibe.mediaUrls.map((url) => ({
      url,
      kind,
      existing: true,
      mediaId: url,
    }));
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState<number | null>(null);

  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);

  const isVideoSelected = media.some((m) => m.kind === "video");

  // --------------------
  // ADD IMAGES
  // --------------------
  const addImages = (files: FileList | null) => {
    if (!files) return;

    if (isVideoSelected) {
      toast.error("Remove video first.");
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

  // --------------------
  // ADD VIDEO
  // --------------------
  const addVideo = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (media.length > 0) {
      toast.error("Clear media before adding video.");
      return;
    }

    const file = files[0];

    setMedia([
      {
        file,
        kind: "video",
        url: URL.createObjectURL(file),
      },
    ]);
  };

  // --------------------
  // REMOVE MEDIA
  // --------------------
  const removeMedia = (idx: number) => {
    setMedia((m) => {
      if (!m[idx].existing) {
        URL.revokeObjectURL(m[idx].url);
      }
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

  // --------------------
  // SUBMIT (CREATE / EDIT)
  // --------------------
  const handleSubmit = async () => {
    if (!text.trim() && media.length === 0) {
      toast.error("Write something or add media.");
      return;
    }

    setSubmitting(true);

    try {
      // --------------------
      // EDIT MODE
      // --------------------
      if (isEdit) {
        const updated = await updateVibe({
          id: vibe!.id,
          description: text.trim() || undefined,
          media: media.map((m) => ({
            mediaId: m.mediaId,
            file: m.file,
          })),
        });

        toast.success("Vibe updated");
        onSaved?.(updated as any);
        onClose();
        return;
      }

      // --------------------
      // CREATE MODE
      // --------------------
      const created = await createVibe({
        tripId,
        description: text.trim(),
        files: media.filter((m) => m.file).map((m) => m.file as File),
      });

      toast.success("Vibe shared!");
      onSaved?.(created);
      onClose();
    } catch (error) {
      toast.error(isEdit ? "Failed to update vibe" : "Failed to share vibe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="
            w-[95vw]
            max-w-lg
            rounded-2xl
            border border-slate-200/70
            dark:border-slate-800
            bg-white
            dark:bg-slate-900
            p-4 sm:p-6
            shadow-2xl
          "
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
              {isEdit ? "Edit Vibe" : "Share a Vibe"}
            </DialogTitle>
          </DialogHeader>

          {/* TEXT */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the vibe?"
            className="
              min-h-[120px]
              resize-none
              rounded-xl
              border-slate-200
              bg-slate-50
              text-slate-800
              placeholder:text-slate-400
              focus-visible:ring-1
              focus-visible:ring-blue-500
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-100
              dark:placeholder:text-slate-500
            "
          />

          {/* MEDIA PREVIEW */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {media.map((m, i) => (
                <div
                  key={i}
                  className="
                    relative
                    h-28 sm:h-32
                    overflow-hidden
                    rounded-xl
                    border border-slate-200
                    dark:border-slate-700
                    bg-slate-100
                    dark:bg-slate-800
                  "
                >
                  {m.kind === "image" ? (
                    <img
                      src={m.url}
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
                    onClick={() => requestRemove(i)}
                    className="
                          absolute right-2 top-2
                          rounded-full
                          bg-black/60
                          backdrop-blur-md
                          p-1.5
                          text-white
                          transition hover:bg-black/80
                        "
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => imgInput.current?.click()}
                disabled={isVideoSelected}
                className="
                rounded-xl
                border-slate-200
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-200
                dark:hover:bg-slate-700
              "
              >
                <ImageIcon size={16} className="mr-2" />
                Images
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => vidInput.current?.click()}
                disabled={media.length > 0}
                className="
                  rounded-xl
                  border-slate-200
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-200
                  dark:hover:bg-slate-700
                "
              >
                <Video size={16} className="mr-2" />
                Video
              </Button>
            </div>

            <input
              ref={imgInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addImages(e.target.files)}
            />

            <input
              ref={vidInput}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => addVideo(e.target.files)}
            />

            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="ghost"
                onClick={onClose}
                className="
                rounded-xl
                dark:text-slate-300
                dark:hover:bg-slate-800
              "
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="
                rounded-xl
                bg-blue-600
                text-white
                hover:bg-blue-700
                dark:bg-blue-600
                dark:hover:bg-blue-500
              "
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save"
                ) : (
                  "Share"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE */}
      <AlertDialog
        open={confirmRemoveIdx !== null}
        onOpenChange={() => setConfirmRemoveIdx(null)}
      >
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-slate-100">Remove media?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              This will remove it after saving changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">Cancel</AlertDialogCancel>

            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (confirmRemoveIdx !== null) {
                  removeMedia(confirmRemoveIdx);
                }
                setConfirmRemoveIdx(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VibeCreator;