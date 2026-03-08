import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";
import CreatePostModal from "../../features/post/components/createPostModal";
import { LeftSidebar } from "./LeftSidebar"; // استيراد الجنب الشمال
import { RightSidebar } from "./RightSidebar"; // استيراد الجنب اليمين

export default function HomeFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // منطق مراقبة الـ Scroll لإخفاء/إظهار الـ Nav وتحريك المحتوى
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false); // المستخدم بينزل لتحت
      } else {
        setIsNavVisible(true); // المستخدم بيطلع لفوق
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 transition-all duration-500">
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- Sidebar الشمال --- */}
          <motion.aside 
            animate={{ translateY: isNavVisible ? 80 : 20 }}
            className="hidden lg:block lg:col-span-3 sticky top-0 h-fit transition-all duration-300"
          >
            <LeftSidebar />
          </motion.aside>

          {/* --- المحتوى الأساسي (Center) --- */}
          <motion.div 
            animate={{ marginTop: isNavVisible ? 80 : 20 }}
            className="lg:col-span-6 flex flex-col gap-8 transition-all duration-300"
          >
            <FeedHeader onCreatePost={() => setIsModalOpen(true)} />
            <PostsList />
          </motion.div>

          {/* --- Sidebar اليمين --- */}
          <motion.aside 
            animate={{ translateY: isNavVisible ? 80 : 20 }}
            className="hidden lg:block lg:col-span-3 sticky top-0 h-fit transition-all duration-300"
          >
            <RightSidebar />
          </motion.aside>

        </div>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}