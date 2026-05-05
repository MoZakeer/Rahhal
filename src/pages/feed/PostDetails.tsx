import { usePageTitle } from "@/hooks/usePageTitle";
import PostDetails from "../../features/post/components/PostDetails";
import { useFavicon } from "@/hooks/useFavicon";
export default function PostDetailsPage() {
  usePageTitle("Post Details")
  useFavicon("/post.png")
  return (
    <div className="min-h-screen pt-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PostDetails />
      </div>
    </div>
  );
}