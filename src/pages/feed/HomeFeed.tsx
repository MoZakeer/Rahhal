import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";
import CreatePostModal from "../../features/post/components/createPostModal";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { useFavicon } from "@/hooks/useFavicon";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import FeedVibesBar from "@/features/vibes/components/FeedVibesBar";
import { getUserId } from "@/lib/api";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import TrendingNow from "./TrendingNow";

export default function HomeFeed() {
  useFavicon("/plane-globe (2).png");

  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  useScrollRestoration("home-feed");

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
  const currentUserId = getUserId(); // Replace with actual user ID retrieval logic
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-500 relative overflow-x-clip">
      <div className="w-full max-w-[1440px] mx-auto px-0 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.aside
            animate={{
              top: isNavVisible ? 96 : 20,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:block lg:col-span-3 sticky z-10 w-full"
          >
            <LeftSidebar />
          </motion.aside>

          {/* Middle Feed */}
          <motion.div
            animate={{ marginTop: isNavVisible ? 80 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="col-span-12 lg:col-span-6 flex flex-col gap-6 transition-all duration-300 relative min-w-0"
          >
            <FeedHeader onCreatePost={() => setIsModalOpen(true)} />
            <FeedVibesBar currentUserId={currentUserId} />
            <div className="block lg:hidden w-full overflow-hidden mt-2">
              <TrendingNow variant="mobile" />
            </div>
            <PostsList />

            {/* Floating Create Post Button */}
            <motion.button
              animate={{
                scale: isNavVisible ? 1 : 0,
                opacity: isNavVisible ? 1 : 0,
                y: isNavVisible ? 0 : 50,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "fixed bottom-24 z-50 flex items-center justify-center w-14 h-14 bg-blue-900 text-white rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50 hover:bg-indigo-700 dark:hover:bg-blue-600 active:scale-95 transition-colors outline-none",
                isRtl
                  ? "left-6 lg:left-[calc(25vw)]"
                  : "right-6 lg:right-[calc(25vw)]",
              )}
              aria-label={t("feed.createPostBtn") || "Create Post"}
            >
              <Plus
                className="w-6 h-6 text-white dark:text-slate-100"
                strokeWidth={2.5}
              />
            </motion.button>
          </motion.div>

          {/* Right Sidebar */}
          <motion.aside
            animate={{
              top: isNavVisible ? 96 : 20,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:block lg:col-span-3 sticky z-10 w-full"
          >
            <RightSidebar />
          </motion.aside>
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
