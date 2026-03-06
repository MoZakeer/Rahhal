type Props = {
  onPost: () => void;
  onCancel: () => void; // لازم يكون موجود عشان المودال
  isPosting: boolean;
  title?: string;
  mode?: "create" | "edit";
};

export default function PostHeader({ onPost, onCancel, isPosting, title, mode = "create" }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-gray-300 pb-6 flex-wrap gap-3">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        {title || (mode === "edit" ? "Edit Post" : "Create Post")}
      </h1>

      <div className="flex items-center gap-3">
        <button
          onClick={onPost}
          disabled={isPosting}
          className={`px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold text-white shadow-sm transition
            ${isPosting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]"
            }`}
        >
          {isPosting
            ? mode === "edit"
              ? "Saving..."
              : "Posting..."
            : mode === "edit"
              ? "Save"
              : "Post"}
        </button>

        <button
          onClick={onCancel} 
          className="px-5 py-2.5 rounded-full text-sm sm:text-base font-medium
            border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}