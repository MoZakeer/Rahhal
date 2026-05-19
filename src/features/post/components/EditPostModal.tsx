import { useRef } from "react"; // ضيف دي
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Save, Loader2 } from "lucide-react";
import PostUser from "./Shared/postUser";
import PostCaption from "./Shared/postCaption";
import PostMedia from "./Shared/postMedia";
import { useEditPost } from "./hooks/useEditPost";
import type { Post } from "../../../types/post";

type Props = {
  post: Post;
  onCancel: () => void;
};

export default function EditPostModal({ post, onCancel }: Props) {
  const { caption, setCaption, media, setMedia, loading, user, handleUpdatePost, fileRef } = useEditPost(post, onCancel);

  const initialFocusRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog 
      open={true} 
      onClose={onCancel} 
      className="relative z-[110]" 
      initialFocus={initialFocusRef}
    >
      <div ref={initialFocusRef} tabIndex={-1} className="sr-only" aria-hidden="true" />

      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center p-0 sm:p-4">
          <DialogPanel
            transition
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl flex flex-col bg-white dark:bg-slate-800 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl transition-all overflow-hidden border border-transparent dark:border-slate-700/50"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <PostUser {...user} />
              <button
                type="button"
                onClick={onCancel}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[55vh] px-6 py-2 flex flex-col gap-4 custom-scrollbar">
              <PostCaption caption={caption} onChange={setCaption} placeholder="Edit your adventure..." />
              <PostMedia media={media} setMedia={setMedia} fileRef={fileRef} />
            </div>

            <div className="px-6 py-4 mt-2 bg-slate-50 dark:bg-slate-900/30 border-t flex items-center justify-end">
              <button
                type="button"
                onClick={handleUpdatePost}
                disabled={loading || (!caption?.trim() && media.length === 0)}
                className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <><span className="text-sm">Save Changes</span> <Save className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}