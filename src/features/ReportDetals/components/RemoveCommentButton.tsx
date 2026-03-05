import { Trash2 } from "lucide-react";

export default function RemoveCommentButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 transition"
    >
      <Trash2 size={16} />
      Remove Comment
    </button>
  );
}