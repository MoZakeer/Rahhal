import { useState, useMemo, lazy, Suspense } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Plus } from "lucide-react";
import PostsList from "../../features/post/components/PostList";
import FeedHeader from "../../features/post/components/feedHeader";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { useFavicon } from "@/hooks/useFavicon";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import FeedVibesBar from "@/features/vibes/components/FeedVibesBar";
import { getUserId } from "@/lib/api";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import TrendingNow from "./TrendingNow";

// OPTIMIZATION 1: Lazy Loading the CreatePostModal.
// This prevents the modal's heavy code from loading until the user actually opens it,
// significantly improving the initial load time of the HomeFeed.
const CreatePostModal = lazy(() => import("../../features/post/components/createPostModal"));

export default function HomeFeed() {
  // Hook to set the page favicon
  useFavicon("/plane-globe (2).png");

  // Language context for RTL/LTR support and translations
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  
  // Restore scroll position when returning to this page
  useScrollRestoration("home-feed");

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // OPTIMIZATION 2: Memoizing the currentUserId.
  // preventing unnecessary recalculations or local storage reads on every re-render.
  const currentUserId = useMemo(() => getUserId(), []);

  // OPTIMIZATION 3: Using framer-motion's useScroll instead of window.addEventListener.
  // This tracks scroll position outside of React's render cycle, preventing massive 
  // re-renders and lag when the user scrolls the page.
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Hide navigation if scrolling down and past 100px, show if scrolling up
    if (current > previous && current > 100) {
      if (isNavVisible) setIsNavVisible(false);
    } else {
      if (!isNavVisible) setIsNavVisible(true);
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-500 relative overflow-x-clip">
      <div className="w-full max-w-[1440px] mx-auto px-0 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================= */}
          {/* LEFT SIDEBAR (Hidden on smaller screens)  */}
          {/* ======================================= */}
          <motion.aside
            animate={{
              top: isNavVisible ? 96 : 20,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:block lg:col-span-3 sticky z-10 w-full"
          >
            <LeftSidebar />
          </motion.aside>

          {/* ======================================= */}
          {/* MIDDLE FEED (Main Content Area)         */}
          {/* ======================================= */}
          <motion.div
            animate={{ marginTop: isNavVisible ? 80 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="col-span-12 lg:col-span-6 flex flex-col gap-6 transition-all duration-300 relative min-w-0"
          >
            {/* Header with create post trigger */}
            <FeedHeader onCreatePost={() => setIsModalOpen(true)} />

            {/* Mobile ONLY Trending Section (Horizontal Scroll) */}
            {/* Displayed below the header only on mobile devices to save space */}
            <div className="block lg:hidden -mt-2">
              <TrendingNow variant="mobile" />
            </div>

            {/* Vibes Navigation Bar */}
            <FeedVibesBar currentUserId={currentUserId} />

            {/* Main Posts Feed */}
            <PostsList />

            {/* Floating Action Button (FAB) to Create Post */}
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

          {/* ======================================= */}
          {/* RIGHT SIDEBAR (Hidden on smaller screens) */}
          {/* ======================================= */}
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

      {/* ======================================= */}
      {/* MODALS (Lazy Loaded)                      */}
      {/* ======================================= */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <CreatePostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Suspense>
      )}
    </main>
  );
}