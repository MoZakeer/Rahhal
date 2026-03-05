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
    <div className="box px-4 py-8 sm:px-8 sm:py-10 gap-8">
      
      <PostHeader onPost={handleUpdatePost} isPosting={loading} title="Edit Post" mode="edit" />

      
      {user ? <PostUser {...user} /> : 
       <div className="text-gray-500 text-sm">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>}

      <PostCaption caption={caption} onChange={setCaption} maxChars={MAX_CHARS} />

      <PostMedia media={media} setMedia={setMedia} fileRef={fileRef} />
    </div>
  );
}







