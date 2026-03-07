import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Save, Loader2 } from "lucide-react";
import PostUser from "./Shared/postUser";
import PostCaption from "./Shared/postCaption";
import PostMedia from "./Shared/postMedia";
import { useEditPost } from "./hooks/useEditPost";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MAX_CHARS = 300;

type Props = {
  postId: string;
  onCancel: () => void;
};

export default function EditPostModal({ postId, onCancel }: Props) {
  const {
    caption,
    setCaption,
    media,
    setMedia,
    loading,
    user,
    handleUpdatePost,
    fileRef,
  } = useEditPost(postId);

  const handleSave = async () => {
    if (!caption?.trim() && !media) return;
    await handleUpdatePost();
    onCancel();
  };

  const handleTriggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  return (
    <Dialog open={true} onClose={onCancel} className="relative z-50">
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
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              {user ? (
                <PostUser {...user} />
              ) : (
                <div className="flex items-center gap-3">
                  <Skeleton circle height={48} width={48} />
                  <div className="flex flex-col gap-1">
                    <Skeleton height={16} width={120} />
                    <Skeleton height={12} width={80} />
                  </div>
                </div>
              )}

              <button
                onClick={onCancel}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[55vh] px-6 py-2 flex flex-col gap-4 custom-scrollbar">
              <PostCaption
                caption={caption}
                onChange={setCaption}
                maxChars={MAX_CHARS}
                placeholder="Edit your adventure..."
              />

              <PostMedia media={media} setMedia={setMedia} fileRef={fileRef} />
            </div>

            <div className="px-6 py-4 mt-2 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-semibold ${caption?.length > MAX_CHARS - 20 ? "text-rose-500" : "text-slate-400"}`}
                >
                  {caption?.length || 0}/{MAX_CHARS}
                </span>

                <button
                  onClick={handleSave}
                  disabled={loading || (!caption?.trim() && !media)}
                  className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 hover:shadow-cyan-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm">Save Changes</span>
                      <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
