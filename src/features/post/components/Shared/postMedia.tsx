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
    <div className="flex flex-col gap-4">
      <button
        onClick={() => fileRef.current?.click()}
        className="
        flex items-center gap-2
        bg-gray-100 hover:bg-gray-200
        text-gray-700
        px-4 py-2
        rounded-full
        text-sm
        w-fit
        transition
        "
      >

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 md:h-5 md:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Photo
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
          {media.map((m, i) => (
            <div
              key={i}
              className="relative w-36 h-28 flex-shrink-0 rounded-xl overflow-hidden"
            >
              <img
                src={m.preview || (typeof m.file === "string" ? m.file : "")}
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => removeMedia(m.mediaId)}
                className="
                absolute top-2 right-2
                bg-black/60 text-white
                w-6 h-6
                rounded-full
                text-xs
                flex items-center justify-center
                "
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