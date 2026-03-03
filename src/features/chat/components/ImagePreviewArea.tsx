import ImageThumbnail from "./ImageThumbnail";

interface ImagePreviewAreaProps {
  files: File[];
  onRemove: (index: number) => void;
}

function ImagePreviewArea({ files, onRemove }: ImagePreviewAreaProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-3 mb-2 overflow-x-auto p-2">
      {files.map((file, index) => (
        <ImageThumbnail
          key={`${file.name}-${file.lastModified}-${index}`}
          file={file}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}
export default ImagePreviewArea;
