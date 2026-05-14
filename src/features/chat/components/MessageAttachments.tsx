import { useState } from "react";

import ImagePreviewModal from "./ImagePreviewModal";

import { BASE_URL } from "../../../utils/constant";

import { getFileTypeFromUrl } from "../../../utils/helper";

import { HiMiniPlay } from "react-icons/hi2";

export type Attachment = {
  attachmentId: string;
  fileUrl: string;
};

type Props = {
  attachments?: Attachment[];
  isSend: boolean;
};

function MessageAttachments({ attachments, isSend }: Props) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col w-full mb-1">
        {attachments.map((file, index) => {
          const isFirstMedia = index === 0;

          let cornerRadius = "rounded-md mt-1";

          if (isFirstMedia) {
            cornerRadius = isSend
              ? "rounded-t-lg rounded-tr-none mt-0"
              : "rounded-t-lg rounded-tl-none mt-0";
          }

          const fullUrl = `${BASE_URL}${file.fileUrl}`;

          const fileType = getFileTypeFromUrl(file.fileUrl);

          const isVideo = fileType === "video";

          return (
            <div
              key={file.attachmentId}
              className={`
                relative overflow-hidden
                border border-black/5
                ${cornerRadius}
              `}
            >
              {isVideo ? (
                <>
                  <video
                    src={fullUrl}
                    onClick={() => setPreviewIndex(index)}
                    className="
                      w-full
                      max-h-64 sm:max-h-72
                      object-cover
                      cursor-pointer
                      bg-black
                    "
                    muted
                  />

                  <div
                    className="
                      absolute inset-0
                      flex items-center justify-center
                      pointer-events-none
                    "
                  >
                    <div
                      className="
                        bg-black/50
                        rounded-full
                        p-3
                        backdrop-blur-sm
                      "
                    >
                      <HiMiniPlay className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={fullUrl}
                  alt="Attachment"
                  onClick={() => setPreviewIndex(index)}
                  className="
                    w-full
                    max-h-64 sm:max-h-72
                    object-cover
                    cursor-pointer
                    transition-opacity
                    hover:opacity-90
                  "
                />
              )}
            </div>
          );
        })}
      </div>

      <ImagePreviewModal
        attachments={attachments}
        currentIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNext={() =>
          setPreviewIndex((prev) => (prev !== null ? prev + 1 : null))
        }
        onPrev={() =>
          setPreviewIndex((prev) => (prev !== null ? prev - 1 : null))
        }
      />
    </>
  );
}

export default MessageAttachments;
