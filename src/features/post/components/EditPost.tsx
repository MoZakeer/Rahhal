import PostHeader from "../components/Shared/postHeader";
import PostUser from "../components/Shared/postUser";
import PostCaption from "../components/Shared/postCaption";
import PostMedia from "../components/Shared/postMedia";
import { useEditPost } from "./hooks/useEditPost";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

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
          <div className="flex flex-col justify-center py-6 text-gray-500 text-sm w-full gap-2">
            <Skeleton circle={true} height={40} width={40} />
            <Skeleton height={20} width={120} />
          </div>
        )}

        <PostCaption caption={caption} onChange={setCaption} maxChars={MAX_CHARS} />

        <PostMedia media={media} setMedia={setMedia} fileRef={fileRef} />

      </div>
    </div>
  );
}







