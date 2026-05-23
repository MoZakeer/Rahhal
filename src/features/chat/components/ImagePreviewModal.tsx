import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineXMark,
} from "react-icons/hi2";
import { BASE_URL } from "../../../utils/constant";
import { getFileTypeFromUrl } from "../../../utils/helper";
import type { Attachment } from "./MessageAttachments";

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

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowRight" && hasNext) {
        onNext();
      }

      if (e.key === "ArrowLeft" && hasPrev) {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!isOpen) return null;
  const currentAttachment = attachments[currentIndex];
  const fullUrl = `${BASE_URL}${currentAttachment.fileUrl}`;
  const fileType = getFileTypeFromUrl(currentAttachment.fileUrl);
  const isVideo = fileType === "video";

  return createPortal(
    <div
      className="
        fixed inset-0 z-9999
        flex items-center justify-center
        bg-black/90 backdrop-blur-sm
        p-4 sm:p-10
      "
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="
          absolute top-4 right-4
          sm:top-6 sm:right-6
          text-white
          hover:bg-white/10
          rounded-full
          p-2
          cursor-pointer
          z-50
          transition-all duration-300
        "
      >
        <HiOutlineXMark className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="
            absolute right-4 sm:right-10
            text-white
            hover:bg-white/10
            rounded-full
            p-3
            transition-all duration-300
            cursor-pointer
            z-50
          "
        >
          <HiOutlineChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Prev Button */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="
            absolute left-4 sm:left-10
            text-white
            hover:bg-white/10
            rounded-full
            p-3
            transition-all duration-300
            cursor-pointer
            z-50
          "
        >
          <HiOutlineChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Media */}
      {isVideo ? (
        <video
          key={currentAttachment.attachmentId}
          src={fullUrl}
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
          className="
            max-w-full max-h-full
            rounded-2xl
            shadow-2xl
            outline-none
          "
        />
      ) : (
        <img
          key={currentAttachment.attachmentId}
          src={fullUrl}
          alt="Preview"
          onClick={(e) => e.stopPropagation()}
          className="
            max-w-full max-h-full
            object-contain
            rounded-2xl
            shadow-2xl
            transition-opacity duration-300
          "
        />
      )}

      {/* Counter */}
      <div
        className="
          absolute bottom-6
          text-white text-sm
          bg-white/10
          backdrop-blur-md
          px-4 py-1.5
          rounded-full
        "
      >
        {currentIndex + 1} / {attachments.length}
      </div>
    </div>,
    document.body,
  );
}

export default ImagePreviewModal;
