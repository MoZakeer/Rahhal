import { useEffect } from "react";

import { BASE_URL } from "../../../utils/constant";
import type { Attachment } from "./MessageAttachments";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineXMark,
} from "react-icons/hi2";

type Props = {
  attachments: Attachment[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

function ImagePreviewModal({
  attachments,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: Props) {
  const isOpen = currentIndex !== null && attachments && attachments.length > 0;

  const hasNext = isOpen && currentIndex < attachments.length - 1;
  const hasPrev = isOpen && currentIndex > 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!isOpen) return null;

  const currentImage = attachments[currentIndex];
  const fullImageUrl = `${BASE_URL}${currentImage.fileUrl}`;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white  hover:bg-black/40 rounded-full p-2  cursor-pointer z-50 transition-all duration-300"
      >
        <HiOutlineXMark className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 sm:right-10 text-white  hover:bg-black/40 rounded-full p-3 transition-all duration-300 cursor-pointer z-50"
        >
          <HiOutlineChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 sm:left-10 text-white hover:bg-black/40 rounded-full p-3 transition-all duration-300 cursor-pointer z-50"
        >
          <HiOutlineChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      <img
        key={currentImage.attachmentId}
        src={fullImageUrl}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300"
      />

      <div className="absolute bottom-6 text-white text-sm bg-black/50 px-4 py-1.5 rounded-full">
        {currentIndex + 1} / {attachments.length}
      </div>
    </div>
  );
}

export default ImagePreviewModal;
