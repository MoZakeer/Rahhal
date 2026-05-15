import React from "react";
import type { EditMedia } from "../services/editPost";

type Props = {
  media: EditMedia[];
  setMedia: React.Dispatch<React.SetStateAction<EditMedia[]>>;
  fileRef: React.RefObject<HTMLInputElement>;
};

export default function PostMedia({
  media,
  setMedia,
  fileRef,
}: Props) {
  const uploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const newMedia: EditMedia[] = Array.from(files).map((file) => ({
      mediaId: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setMedia((prev) => [...prev, ...newMedia]);

    e.target.value = "";
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
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm w-fit transition dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
      >
        Add Media
      </button>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        hidden
        onChange={uploadFiles}
      />

      {media.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {media.map((m) => {
            const mediaSrc =
              m.preview ||
              (typeof m.file === "string" ? m.file : "");

            const isVideo =
              (typeof m.file !== "string" &&
                m.file?.type?.startsWith("video")) ||
              /\.(mp4|webm|ogg|mov)$/i.test(mediaSrc);

            return (
              <div
                key={m.mediaId}
                className="relative w-36 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                {isVideo ? (
                  <video
                    src={mediaSrc}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={mediaSrc}
                    alt="media"
                    className="w-full h-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeMedia(m.mediaId)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}