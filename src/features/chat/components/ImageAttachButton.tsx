import { useRef, type ChangeEvent } from "react";
import { IoAttach } from "react-icons/io5";
import { toast } from "sonner";

interface ImageAttachProps {
  onSelectFiles: (files: File[]) => void;
}

const MAX_FILES = 10;

function ImageAttachButton({ onSelectFiles }: ImageAttachProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(e.target.files).slice(0, MAX_FILES);

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");

      const isVideo = file.type.startsWith("video/");

      const isValidType = isImage || isVideo;

      const maxSize = isVideo ? 100 * 1024 * 1024 : 16 * 1024 * 1024;

      const isValidSize = file.size <= maxSize;

      if (!isValidType) {
        toast.error(`${file.name} is not supported`);

        return false;
      }

      if (!isValidSize) {
        toast.error(`${file.name} exceeds size limit`);

        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      onSelectFiles(validFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="
          cursor-pointer
          transition-all
          duration-300
          hover:bg-gray-100
          p-2
          rounded-full
        "
        title="add media"
      >
        <IoAttach className="w-8 h-8 aspect-square text-gray-700" />
      </button>
    </>
  );
}

export default ImageAttachButton;
