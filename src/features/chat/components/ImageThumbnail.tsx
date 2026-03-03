import { useEffect, useRef } from "react";
import { IoMdCloseCircle } from "react-icons/io";

interface ImageThumbnailProps {
  file: File;
  onRemove: () => void;
}

function ImageThumbnail({ file, onRemove }: ImageThumbnailProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);

    if (imgRef.current) {
      imgRef.current.src = url;
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <img
        ref={imgRef}
        alt="preview"
        className="w-full h-full object-cover bg-gray-100"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white rounded-full text-red-500 hover:text-red-700 transition-colors cursor-pointer"
        title="remove image"
      >
        <IoMdCloseCircle size={20} />
      </button>
    </div>
  );
}

export default ImageThumbnail;
