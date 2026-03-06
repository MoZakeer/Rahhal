import PostHeader from "./Shared/postHeader";
import PostUser from "./Shared/postUser";
import PostCaption from "./Shared/postCaption";
import PostMedia from "./Shared/postMedia";
import { useCreatePost } from "./hooks/useCreatePost";
import Spinner from "../../../shared/components/SpinnerMini";

const MAX_CHARS = 300;

export default function CreatePostPage() {
  const { caption, setCaption, media, setMedia, user, isPosting, handleCreatePost, fileRef } = useCreatePost();

  return (
    <div className="w-full min-h-screen  bg-white px-5 py-5">
      <div className="w-full min-h-screen mx-auto flex flex-col gap-8">

        <PostHeader onPost={handleCreatePost} isPosting={isPosting} mode="create" />

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




