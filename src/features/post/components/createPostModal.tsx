import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Send, Loader2 } from "lucide-react";
import PostUser from "./Shared/postUser";
import PostCaption from "./Shared/postCaption";
import PostMedia from "./Shared/postMedia";
import { useCreatePost } from "./hooks/useCreatePost";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils"; 

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { t, language } = useLanguage(); 
  const isRtl = language === "ar";

  const {
    caption,
    setCaption,
    media,
    setMedia,
    user,
    isPosting,
    handleCreatePost,
    fileRef,
    isCompressing,
    setIsCompressing
  } = useCreatePost();

  const handlePost = async () => {
    if (!caption.trim() && media.length === 0) return;
    await handleCreatePost(onClose);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center p-0 sm:p-4">
          <DialogPanel
            transition
            dir={isRtl ? "rtl" : "ltr"}
            className="relative w-full max-w-2xl flex flex-col bg-white dark:bg-slate-800 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl dark:shadow-slate-900/50 transition-all data-[closed]:translate-y-full sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden border border-transparent dark:border-slate-700/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-transparent">
              {user ? (
                <PostUser {...user} />
              ) : (
                <div className={cn("flex items-center gap-3 w-full", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <Skeleton circle height={48} width={48} />
                  <Skeleton height={16} width={120} />
                </div>
              )}

              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] px-6 py-4 flex flex-col gap-4">
              <PostCaption
                caption={caption}
                onChange={setCaption}
                placeholder={t("feed.createPostPlaceholder") || "What's your next adventure?..."} 
              />
              <PostMedia
                media={media}
                setMedia={setMedia}
                fileRef={fileRef}
                isCompressing={isCompressing}      
                setIsCompressing={setIsCompressing} 
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-end mt-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePost}
                  disabled={isPosting || isCompressing || (!caption.trim() && media.length === 0)}
                  className="flex items-center gap-2 bg-blue-700 dark:bg-blue-700 border border-blue-700 dark:border-blue-900 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-800 dark:hover:bg-blue-900 shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 cursor-pointer outline-none"
                >
                  {isPosting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span className="hidden sm:inline">
                        {isCompressing ? t("feed.processingMedia") : t("feed.postBtn")}
                      </span> 
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}