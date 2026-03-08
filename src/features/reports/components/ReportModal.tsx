import type { ReportEntityType } from "../types";
import { createPortal } from "react-dom";
import {
  createCommentReport,
  createPostReport,
  createUserReport,
} from "../services/reportApi";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  entityType: ReportEntityType;
  entityId: string;
  reporterId?: string;
  profileId?: string;
  messageId?: string;
  onClose: () => void;
}

export const ReportModal = ({
  entityType,
  entityId,
  reporterId,
  profileId,
  messageId,
  onClose,
}: Props) => {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = !type || !description.trim() || loading;

  const handleSubmit = async () => {
    if (isDisabled) return;

    try {
      setLoading(true);

      switch (entityType) {
        case "post":
          await createPostReport(entityId, type, description);
          break;
        case "comment":
          await createCommentReport(profileId!, entityId, type, description);
          break;
        case "user":
          await createUserReport(
            reporterId!,
            entityId,
            messageId!,
            type,
            description
          );
          break;
      }

      onClose();
    } catch (error) {
      console.error("Report failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Report Content
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Reason
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none p-3 rounded-xl transition"
          >
            <option value="">Select reason</option>
            <option value="Illegal Activities">Illegal activities</option>
            <option value="Hate Or Bullying">Hate or bullying</option>
            <option value="Sexual Content">Sexual content</option>
            <option value="Impersonation">Impersonation</option>
            <option value="Privacy Violation">Privacy violation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            rows={4}
            className="w-full border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none p-3 rounded-xl resize-none transition"
          />
        </div>

        {/* Buttons */}
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
            className={`flex-1 py-2 rounded-xl text-white font-medium transition
              ${
                isDisabled
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 active:scale-95"
              }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>,
      document.body

  );
};