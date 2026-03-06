import { useState } from "react";
import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";
import CreatePostModal from "../../features/post/components/createPostModal";

export default function HomeFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="min-h-screen bg-slate-50 pt-[80px] pb-20 md:pb-8">
      {/* Centralized feed column for optimal reading width */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 flex flex-col gap-6">
        
        <FeedHeader onCreatePost={openModal} />
        
        <PostsList />

      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={closeModal} />
    </main>
  );
}