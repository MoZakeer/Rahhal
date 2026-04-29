import type { ReportEntityType } from "../types";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import {
  createCommentReport,
  createPostReport,
  createUserReport,
} from "../services/reportApi";
import { useEffect, useRef, useState } from "react";
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

  const isDisabled = !type || loading;

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
            description,
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0  backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Report Content
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-500">
            Reason
          </label>

          <div className="relative">
            <CustomDropdown value={type} onChange={(val) => setType(val)} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-500">
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
            className="flex-1 border border-gray-300 text-gray-600 dark:text-gray-500 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`flex-1 py-2 rounded-xl text-white font-medium transition
              ${
                isDisabled
                  ? "bg-red-500 opacity-70 cursor-default  "
                  : "bg-red-500 hover:bg-red-600 cursor-pointer active:scale-95"
              }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// 1. Define types for the component props
interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: string[] = [
    "Illegal Activities",
    "Hate Or Bullying",
    "Sexual Content",
    "Impersonation",
    "Privacy Violation",
    "Other",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border p-3 rounded-xl transition-all outline-none
          ${
            isOpen
              ? "border-red-500 ring-2 ring-red-200"
              : "border-gray-300 hover:border-gray-400"
          }`}
      >
        <span
          className={
            !value ? "text-gray-400" : "text-gray-900 dark:text-gray-400"
          }
        >
          {value || "Select reason"}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-150">
          <ul className="py-1">
            {options.map((option: string) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors rounded-md
                  ${
                    value === option
                      ? "bg-red-50 text-red-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-950"
                  }`}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
