/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { HiMiniPlay } from "react-icons/hi2";

interface ImageThumbnailProps {
  file: File;
  onRemove: () => void;
}

function ImageThumbnail({
  file,
  onRemove,
}: ImageThumbnailProps) {
  const [previewUrl, setPreviewUrl] =
    useState("");

  const isVideo =
    file.type.startsWith("video/");

  useEffect(() => {
    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div
      className="
        relative shrink-0
        w-20 h-20
        rounded-lg overflow-hidden
        border border-gray-200
        shadow-sm bg-gray-100
      "
    >
      {isVideo ? (
        <>
          <video
            src={previewUrl}
            className="
              w-full h-full
              object-cover
            "
            muted
          />

          <div
            className="
              absolute inset-0
              flex items-center justify-center
              bg-black/20
              pointer-events-none
            "
          >
            <div
              className="
                bg-black/60
                rounded-full
                p-1
              "
            >
              <HiMiniPlay className="w-4 h-4 text-white" />
            </div>
          </div>
        </>
      ) : (
        <img
          src={previewUrl}
          alt="preview"
          className="
            w-full h-full
            object-cover
          "
        />
      )}

      <button
        type="button"
        onClick={onRemove}
        className="
          absolute top-1 right-1
          bg-white
          rounded-full
          text-red-500
          hover:text-red-700
          transition-colors
          cursor-pointer
        "
        title="remove media"
      >
        <IoMdCloseCircle size={20} />
      </button>
    </div>
  );
}

export default ImageThumbnail;