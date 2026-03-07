import { useRef, type ChangeEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";

interface ImageAttachProps {
  onSelectFiles: (files: File[]) => void;
}

function ImageAttachButton({ onSelectFiles }: ImageAttachProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter((file) => {
        const isValidType = file.type.startsWith("image/");
        const isValidSize = file.size <= 16 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      onSelectFiles(validFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer transition-all duration-300 hover:bg-gray-100 p-2 rounded-full"
        title="add image"
      >
        <HiOutlinePhoto className="w-8 h-8 aspect-square text-gray-700" />
      </button>
    </>
  );
}

export default ImageAttachButton;
