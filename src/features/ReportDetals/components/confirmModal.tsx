
interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemType: "post" | "comment";
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  itemType,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg">
        <h2 className="text-lg font-semibold mb-3">
          Confirm Remove
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to remove this {itemType}?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-red-600 text-white"
          >
            {loading ? `Removing ${itemType}...` : `Yes, Remove ${itemType}`}
          </button>
        </div>
      </div>
    </div>
  );
}