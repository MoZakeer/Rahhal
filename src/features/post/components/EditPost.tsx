import PostHeader from "../components/Shared/postHeader";
import PostUser from "../components/Shared/postUser";
import PostCaption from "../components/Shared/postCaption";
import PostMedia from "../components/Shared/postMedia";
import { useEditPost } from "./hooks/useEditPost";
import { useParams } from "react-router-dom";
import Spinner from "../../../shared/components/SpinnerMini";

const MAX_CHARS = 300;

export default function EditPostPage() {
  const { postId } = useParams<{ postId: string }>();

  const { caption, setCaption, media, setMedia, loading, user, handleUpdatePost, fileRef } =
    useEditPost(postId!);

  return (
    <div className="w-full min-h-screen bg-white px-5 py-5">
      <div className="w-full min-h-screen mx-auto flex flex-col gap-8">

        <PostHeader onPost={handleUpdatePost} isPosting={loading} title="Edit Post" mode="edit" />

        
        {user ? (
          <PostUser {...user} />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 text-sm">
            <Spinner />
            <p className="mt-3">Loading user...</p>
          </div>
        )}

       
        <PostCaption caption={caption} onChange={setCaption} maxChars={MAX_CHARS} />

        <PostMedia media={media} setMedia={setMedia} fileRef={fileRef} />

      </div>
    </div>
  );
}







