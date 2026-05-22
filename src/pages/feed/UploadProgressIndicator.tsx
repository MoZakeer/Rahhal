import { useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function UploadProgressIndicator() {
  const isCreating = useIsMutating({ mutationKey: ["createPost"] });
  const isEditing = useIsMutating({ mutationKey: ["editPost"] });

  const isUploading = isCreating > 0 || isEditing > 0;

  if (!isUploading) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-5">
      <Loader2 className="h-4 w-4 animate-spin" />
      {isCreating > 0 ? "Publishing your adventure..." : "Saving changes..."}
    </div>
  );
}