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
    <main className="min-h-screen bg-[#F8FAFC] pb-20 transition-all duration-500 relative">
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
            className="col-span-12 lg:col-span-6 flex flex-col gap-6 transition-all duration-300 relative"
          >
            <FeedHeader onCreatePost={() => setIsModalOpen(true)} />
            <PostsList />

            {/*(Create Post FAB)*/}
            <motion.button
              animate={{ 
                scale: isNavVisible ? 1 : 0,     
                opacity: isNavVisible ? 1 : 0,   
                y: isNavVisible ? 0 : 50        
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-24 right-6 lg:bottom-10 lg:right-[calc(25vw)] z-50 flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-colors"
              aria-label="Create Post"
            >
              {/*(Plus Icon) */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </motion.button>
            
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