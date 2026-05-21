import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

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
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const translatedItem = itemType === "post" ? t("feed.itemPost") : t("feed.itemComment");

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-[110]" 
        onClose={onClose}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* PRO MAX Background: Blur Overlay */}
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            >
              {/* PRO MAX Panel */}
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-6 pt-8 pb-6 text-start shadow-2xl shadow-slate-900/20 dark:shadow-black/50 transition-all w-full max-w-[400px] border border-slate-100/50 dark:border-slate-700/50">
                
                <div className="flex flex-col items-center sm:items-start sm:flex-row gap-5">
                  {/* Warning Icon Badge */}
                  <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 sm:mx-0 sm:h-12 sm:w-12 border border-red-200 dark:border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="mt-3 text-center sm:mt-0 sm:text-start">
                    <Dialog.Title as="h3" className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {t("feed.confirmRemoveTitle")}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-[15px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {t("feed.confirmRemoveDesc")} <span className="font-bold text-slate-900 dark:text-slate-200">{translatedItem}</span>؟ <br/>
                        <span className="text-red-500 dark:text-red-400 text-sm">{t("feed.confirmRemoveWarning")}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={cn(
                      "inline-flex w-full justify-center items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-bold text-white transition-all sm:w-auto shadow-lg shadow-red-600/20",
                      loading 
                        ? "bg-red-400 dark:bg-red-600/50 cursor-not-allowed" 
                        : "bg-red-600 hover:bg-red-700 active:scale-95 hover:shadow-red-600/40"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("feed.removingBtn")}...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                        {t("feed.removeBtn")}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-[15px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors sm:w-auto disabled:opacity-50"
                  >
                    {t("feed.cancelBtn")}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}