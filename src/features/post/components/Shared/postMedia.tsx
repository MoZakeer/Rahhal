import React from "react";

export type EditMedia = {
  mediaId: string;
  file: File | string;
  preview?: string;
};

type Props = {
  media: EditMedia[];
  setMedia: React.Dispatch<React.SetStateAction<EditMedia[]>>;
  fileRef: React.RefObject<HTMLInputElement | null>;
};

export default function PostMedia({ media, setMedia, fileRef }: Props) {

  const uploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: EditMedia[] = Array.from(files).map((file) => ({
      mediaId: "",
      file,
      preview: URL.createObjectURL(file),
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
    <div>

      <button
        onClick={() => fileRef.current?.click()}
        className="mt-4 bg-[var(--color-gray-50)] text-[var(--color-primary-500)] px-4 py-2 rounded-full text-sm"
      >
        + Add Media
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
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {media.map((m, i) => (
            <div key={i} className="relative w-32 h-24 flex-shrink-0">

              <img
                src={m.preview || (typeof m.file === "string" ? m.file : "")}
                className="w-full h-full object-cover rounded-lg"
              />

              <button
                onClick={() => removeMedia(m.mediaId)}
                className="absolute top-1 right-1 bg-white text-red-500 w-5 h-5 rounded-full text-xs flex items-center justify-center"
              >
                ✕
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}