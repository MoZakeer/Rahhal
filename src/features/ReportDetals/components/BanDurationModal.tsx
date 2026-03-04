import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";


interface BanDurationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (hours: number | null) => Promise<void>;
}

export const BanDurationModal = ({ open, onClose, onConfirm }: BanDurationModalProps) => {
  const [hours, setHours] = useState<number | null | "">("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isDisabled = hours === "" || hours === 0 || loading;

  const handleSubmit = async () => {
     console.log("handleSubmit called, hours:", hours);
    if (isDisabled) return;
    setLoading(true);
    try {
      await onConfirm(hours);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Ban Duration</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Select duration
          </label>
          <select
            value={hours === null ? "null" : hours}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") setHours("");
              else if (val === "null") setHours(null);
              else setHours(Number(val));
            }}
            className="w-full border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none p-3 rounded-xl transition"
          >
            <option value="">Choose duration</option>
            <option value={24}>1 Day</option>
            <option value={72}>3 Days</option>
            <option value={168}>1 Week</option>
            <option value={720}>1 Month</option>
            <option value="null">Permanent</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`flex-1 py-2 rounded-xl text-white font-medium transition ${
              isDisabled
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 active:scale-95"
            }`}
          >
            {loading ? "Banning..." : "Confirm Ban"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};