import PostHeader from "./Shared/postHeader";
import PostUser from "./Shared/postUser";
import PostCaption from "./Shared/postCaption";
import PostMedia from "./Shared/postMedia";
import { useEditPost } from "./hooks/useEditPost";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import ReactDOM from "react-dom";

const MAX_CHARS = 300;

type Props = {
  postId: string;
  onCancel: () => void;
};

export default function EditPostModal({ postId, onCancel }: Props) {
  const { caption, setCaption, media, setMedia, loading, user, handleUpdatePost, fileRef } =
    useEditPost(postId);

  
  const handleSave = async () => {
    await handleUpdatePost(); 
    onCancel(); 
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      
    
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 flex flex-col gap-6 z-50 overflow-auto max-h-[90vh]">
        
        <PostHeader
          onPost={handleSave} 
          isPosting={loading}
          onCancel={onCancel}
          title="Edit Post"
          mode="edit"
        />

        {user ? (
          <PostUser {...user} />
        ) : (
          <div className="flex flex-col justify-center py-6 text-gray-500 text-sm w-full gap-2">
            <Skeleton circle height={40} width={40} />
            <Skeleton height={20} width={120} />
          </div>
        )}

        <PostCaption caption={caption} onChange={setCaption} maxChars={MAX_CHARS} />

        <PostMedia media={media} setMedia={setMedia} fileRef={fileRef} />

      </div>
    </div>,
    document.body
  );
}







