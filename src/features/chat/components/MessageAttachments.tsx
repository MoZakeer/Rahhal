import { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";
import { BASE_URL } from "../../../utils/constant";

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

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-col w-full mb-1">
        {attachments.map((file, index) => {
          const isFirstImage = index === 0;
          let cornerRadius = "rounded-md mt-1";

          if (isFirstImage) {
            cornerRadius = isSend
              ? "rounded-t-lg rounded-tr-none mt-0"
              : "rounded-t-lg rounded-tl-none mt-0";
          }

          const fullImageUrl = `${BASE_URL}${file.fileUrl}`;

          return (
            <img
              key={file.attachmentId}
              src={fullImageUrl}
              alt="Attachment"
              onClick={() => setPreviewIndex(index)}
              className={`w-full max-h-64 sm:max-h-72 object-cover cursor-pointer transition-opacity hover:opacity-90 border border-black/5 ${cornerRadius}`}
            />
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
