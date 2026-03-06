import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  X,
  Send,
  Loader2
} from "lucide-react";
import PostUser from "./Shared/postUser";
import PostCaption from "./Shared/postCaption";
import PostMedia from "./Shared/postMedia";
import { useCreatePost } from "./hooks/useCreatePost";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MAX_CHARS = 300;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const {
    caption,
    setCaption,
    media,
    setMedia,
    user,
    isPosting,
    handleCreatePost,
    fileRef
  } = useCreatePost();

  const handlePost = async () => {
    if (!caption.trim() && !media) return;
    await handleCreatePost();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">

      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center p-0 sm:p-4">

          <DialogPanel
            transition
            className="relative w-full max-w-2xl flex flex-col bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl transition-all data-[closed]:translate-y-full sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-transparent">
              {user ? (
                <PostUser {...user} />
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <Skeleton circle height={48} width={48} />
                  <Skeleton height={16} width={120} />
                </div>
              )}

              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] px-6 py-4 flex flex-col gap-4">
              <PostCaption
                caption={caption}
                onChange={setCaption}
                maxChars={MAX_CHARS}
                placeholder="What's your next adventure?..."
              />

              <PostMedia
                media={media}
                setMedia={setMedia}
                fileRef={fileRef}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end mt-auto">

              {/* Submit Button */}
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold ${caption.length > MAX_CHARS - 20 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {caption.length}/{MAX_CHARS}
                </span>

                <button
                  onClick={handlePost}
                  disabled={isPosting || (!caption.trim() && !media)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 cursor-pointer"
                >
                  {isPosting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 -mt-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span className="hidden sm:inline">Post</span>
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