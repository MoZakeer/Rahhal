import { Fragment, useState } from "react";
import type { ReportEntityType } from "../types";
import { X, ChevronDown, Flag, Loader2, AlertCircle, Check } from "lucide-react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import {
  createCommentReport,
  createPostReport,
  createUserReport,
} from "../services/reportApi";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const MAX_DESC_CHARS = 500;

interface Props {
  entityType: ReportEntityType;
  entityId: string;
  reporterId?: string;
  profileId?: string;
  messageId?: string;
  onClose: () => void;
  open: boolean;
}

const options = [
  { id: "Illegal Activities", labelKey: "feed.reasonIllegal" },
  { id: "Hate Or Bullying", labelKey: "feed.reasonHate" },
  { id: "Sexual Content", labelKey: "feed.reasonSexual" },
  { id: "Impersonation", labelKey: "feed.reasonImpersonation" },
  { id: "Privacy Violation", labelKey: "feed.reasonPrivacy" },
  { id: "Other", labelKey: "feed.reasonOther" },
];

export const ReportModal = ({
  entityType,
  entityId,
  reporterId,
  profileId,
  messageId,
  onClose,
  open,
}: Props) => {
  const [selectedReason, setSelectedReason] = useState<(typeof options)[0] | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const isDisabled = !selectedReason || loading;
  const descCharsCount = description.length;
  const isDescNearLimit = descCharsCount > MAX_DESC_CHARS - 50;
  const isDescOverLimit = descCharsCount > MAX_DESC_CHARS;

  const handleSubmit = async () => {
    if (isDisabled || isDescOverLimit) return;

    try {
      setLoading(true);
      const reportType = selectedReason!.id;

      switch (entityType) {
        case "post":
          await createPostReport(entityId, reportType, description);
          break;
        case "comment":
          await createCommentReport(profileId!, entityId, reportType, description);
          break;
        case "user":
          await createUserReport(reporterId!, entityId, messageId!, reportType, description);
          break;
      }

      toast.success(t("feed.reportSuccess"), {
        icon: <Flag className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: "15px",
          background: "#1e293b",
          color: "#fff",
        },
      });
      onClose();
      setSelectedReason(null);
      setDescription("");
    } catch (error) {
      console.error("Report failed:", error);
      toast.error(t("feed.reportFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose} dir={isRtl ? "rtl" : "ltr"}>
        {/* PRO MAX Background: Blur + Subtle Gradient Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            >
              {/* PRO MAX Panel: Large rounded corners, subtle borders, soft shadow */}
              <Dialog.Panel className="relative transform overflow-visible rounded-[2.5rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-6 pt-8 pb-8 text-start shadow-2xl shadow-slate-900/20 dark:shadow-black/50 transition-all w-full max-w-md border border-slate-100/50 dark:border-slate-700/50 sm:my-8 sm:px-8">
                
                {/* PRO MAX Header: Icon container with soft background */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 shadow-sm">
                      <Flag className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {t("feed.reportTitle")}
                      </Dialog.Title>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {t("feed.reportSubtitle")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className={cn(
                      "absolute top-6 p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all",
                      isRtl ? "left-6" : "right-6"
                    )}
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Listbox */}
                  <Listbox value={selectedReason} onChange={setSelectedReason}>
                    {({ open }) => (
                      <div className="relative space-y-2">
                        <Listbox.Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {t("feed.reportReason")}
                        </Listbox.Label>
                        
                        <Listbox.Button 
                          className={cn(
                            "relative w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 border p-4 rounded-2xl text-left transition-all outline-none group",
                            open 
                              ? "border-red-500 ring-4 ring-red-500/10 bg-white dark:bg-slate-900 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900"
                          )}
                        >
                          <span className={cn(
                            "block truncate text-[15px] font-semibold transition-colors",
                            selectedReason ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                          )}>
                            {selectedReason ? t(selectedReason.labelKey) : t("feed.selectReason")}
                          </span>
                          <span className={cn("pointer-events-none flex items-center", isRtl ? "pl-1" : "pr-1")}>
                            <ChevronDown className={cn("h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all duration-300", open ? "rotate-180" : "")} />
                          </span>
                        </Listbox.Button>

                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-[110] mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-2 shadow-xl shadow-black/5 focus:outline-none text-[15px] animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                            {options.map((option) => (
                              <Listbox.Option
                                key={option.id}
                                value={option}
                                className={({ active, selected }) => cn(
                                  "relative cursor-pointer select-none rounded-xl p-3.5 flex items-center justify-between transition-all duration-200",
                                  selected 
                                    ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold"
                                    : active 
                                      ? "bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 font-medium" 
                                      : "text-slate-600 dark:text-slate-300 font-medium"
                                )}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className="block truncate">{t(option.labelKey)}</span>
                                    {selected && (
                                      <Check className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 animate-in zoom-in" strokeWidth={3} />
                                    )}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    )}
                  </Listbox>

                  {/* Textarea */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {t("feed.reportDescLabel")}
                      </label>
                      <div className={cn(
                        "flex items-center gap-1 text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full",
                        isDescOverLimit ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : 
                        isDescNearLimit ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" : 
                        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {(isDescNearLimit || isDescOverLimit) && <AlertCircle className="w-3 h-3" strokeWidth={3} />}
                        <span dir="ltr">{descCharsCount} / {MAX_DESC_CHARS}</span>
                      </div>
                    </div>
                    
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("feed.reportDescPlaceholder")}
                      rows={4}
                      maxLength={MAX_DESC_CHARS}
                      className={cn(
                        "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none p-4 rounded-2xl resize-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium text-[15px]",
                        isDescOverLimit && "border-red-500 focus:border-red-600 focus:ring-red-600/10 bg-white"
                      )}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-8">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-[15px] disabled:opacity-50"
                  >
                    {t("feed.cancelBtn")}
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={isDisabled || isDescOverLimit}
                    className={cn(
                      "flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all duration-300",
                      (isDisabled || isDescOverLimit)
                        ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-[0.98]"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("feed.loadingSubmit")}
                      </>
                    ) : (
                      t("feed.submitBtn")
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};