import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";

export default function HomeFeed() {
  // Inline mock data

  return (

    <div className="p-4 min-h-screen bg-gray-100 mt-[60px]">
      <FeedHeader />
      <PostsList />

    </div>
  )
}
