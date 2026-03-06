import { useState } from "react";
import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";
import CreatePostModal from "../../features/post/components/createPostModal";

export default function HomeFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-4 min-h-screen bg-gray-100 relative">
      
   
      <FeedHeader onCreatePost={openModal} />

      
      <PostsList />

      
      {isModalOpen && <CreatePostModal onCancel={closeModal} />}
    </div>
  );
}
