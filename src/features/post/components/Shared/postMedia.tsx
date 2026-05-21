import React from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import type { EditMedia } from "../services/editPost";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// 👈 1. ضفنا الحاجات الجديدة في الـ Props
type Props = {
  media: EditMedia[];
  setMedia: React.Dispatch<React.SetStateAction<EditMedia[]>>;
  fileRef: React.RefObject<HTMLInputElement>;
  isCompressing: boolean;
  setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PostMedia({ media, setMedia, fileRef, isCompressing, setIsCompressing }: Props) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);

    try {
      const newMediaPromises = Array.from(files).map(async (file) => {
        let processedFile = file;

        if (file.type.startsWith("image/")) {
          // إعدادات الضغط السريع
          const options = {
            maxSizeMB: 2, 
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.7,
            alwaysKeepResolution: false
          };

          try {
            const compressedBlob = await imageCompression(file, options);
            processedFile = new File([compressedBlob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
          } catch (error) {
            console.error("Error compressing:", error);
          }
        }

        return {
          mediaId: crypto.randomUUID(),
          file: processedFile,
          preview: URL.createObjectURL(processedFile),
          isNew: true,
        };
      });

      const processedMedia = await Promise.all(newMediaPromises);
      setMedia((prev) => [...prev, ...processedMedia]);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsCompressing(false);
      e.target.value = ""; 
    }
  };

  const removeMedia = (mediaId: string) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.mediaId === mediaId);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((m) => m.mediaId !== mediaId);
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isCompressing}
        className={cn(
          "flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm w-fit transition dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 outline-none",
          isCompressing && "opacity-50 cursor-not-allowed"
        )}
      >
        {isCompressing ? (
          <Loader2 className="w-4 h-4 text-blue-500 dark:text-sky-400 animate-spin" />
        ) : (
          <ImagePlus className="w-4 h-4 text-blue-500 dark:text-sky-400" />
        )}
        {isCompressing ? t("feed.processingMedia") : t("feed.addMedia")}
      </button>

      <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={uploadFiles} />

      {media.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {media.map((m) => {
            const mediaSrc = m.preview || (typeof m.file === "string" ? m.file : "");
            const isVideo = (typeof m.file !== "string" && m.file?.type?.startsWith("video")) || /\.(mp4|webm|ogg|mov)$/i.test(mediaSrc);

            return (
              <div key={m.mediaId} className="relative w-36 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {isVideo ? (
                  <video src={mediaSrc} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mediaSrc} alt={t("feed.mediaAlt") || "media"} className="w-full h-full object-cover" loading="lazy" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(m.mediaId)}
                  className={cn("absolute top-2 bg-black/60 hover:bg-black/80 text-white w-6 h-6 rounded-full flex items-center justify-center transition outline-none cursor-pointer", isRtl ? "left-2" : "right-2")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}