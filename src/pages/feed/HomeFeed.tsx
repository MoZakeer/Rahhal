import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";
import CreatePostModal from "../../features/post/components/createPostModal";
import { LeftSidebar } from "./LeftSidebar"; 
import { RightSidebar } from "./RightSidebar";

export default function HomeFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 transition-all duration-500">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* العمود الشمال: رادار وبحث */}
          <motion.aside 
            animate={{ translateY: isNavVisible ? 80 : 20 }}
            className="hidden lg:block lg:col-span-3 sticky top-0 h-[calc(100vh-40px)] overflow-y-auto no-scrollbar pt-4 transition-all duration-300"
          >
            <LeftSidebar />
          </motion.aside>

          {/* العمود الأوسط: الـ Feed */}
          <motion.div 
            animate={{ marginTop: isNavVisible ? 80 : 20 }}
            className="col-span-12 lg:col-span-6 flex flex-col gap-6 transition-all duration-300"
          >
            <FeedHeader onCreatePost={() => setIsModalOpen(true)} />
            <PostsList />
          </motion.div>

          {/* العمود اليمين: تريندات وتحديات */}
          <motion.aside 
            animate={{ translateY: isNavVisible ? 80 : 20 }}
            className="hidden lg:block lg:col-span-3 sticky top-0 h-[calc(100vh-40px)] overflow-y-auto no-scrollbar pt-4 transition-all duration-300"
          >
            <RightSidebar />
          </motion.aside>

        </div>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}