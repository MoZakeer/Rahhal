import { useState, useMemo, lazy, Suspense, useEffect } from "react";
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
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

const CreatePostModal = lazy(() => import("../../features/post/components/createPostModal"));

export default function HomeFeed() {
  useFavicon("/plane-globe (2).png");

  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  useScrollRestoration("home-feed");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const currentUserId = useMemo(() => getUserId(), []);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current > previous && current > 100) {
      if (isNavVisible) setIsNavVisible(false);
    } else {
      if (!isNavVisible) setIsNavVisible(true);
    }
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchUser = async () => {
      const userJS = localStorage.getItem("user");
      if (!userJS) return;
      const storedUser = JSON.parse(userJS);

      queryClient.prefetchQuery({
        queryKey: ["currentUserProfile", storedUser.userId],
        queryFn: async () => {
          const BASE_URL = "https://rahhal-api.runasp.net";
          const res = await axios.get(`${BASE_URL}/Profile/GetUserProfile`, {
            params: { ProfileId: storedUser.userId },
            headers: {
              Authorization: `Bearer ${storedUser.token}`,
              accept: "application/json",
            },
          });

          const data = res.data?.data;
          return {
            name: data?.fullName || "Unknown User",
            username: data?.userName || "unknown",
            avatar: data?.profilePicture
              ? data.profilePicture.startsWith("http")
                ? data.profilePicture
                : `${BASE_URL}${data.profilePicture}`
              : "https://www.gravatar.com/avatar/?d=mp&f=y",
          };
        },
      });
    };

    prefetchUser();
  }, [queryClient]);

// ====================================================
useEffect(() => {
  const handleSoftRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    };

    window.addEventListener("refreshFeed", handleSoftRefresh);

    return () => {
      window.removeEventListener("refreshFeed", handleSoftRefresh);
    };
  }, [queryClient]);

  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener("openCreatePostModal", handleOpenModal);

    return () => {
      window.removeEventListener("openCreatePostModal", handleOpenModal);
    };
  }, []);
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-500 relative overflow-x-clip">
      {/* باقي كود الـ UI بتاعك زي ما هو بالظبط بدون أي تغيير */}
      <div className="w-full max-w-[1440px] mx-auto px-0 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <motion.aside
            animate={{ top: isNavVisible ? 96 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:block lg:col-span-3 sticky z-10 w-full"
          >
            <LeftSidebar />
          </motion.aside>

          <motion.div
            animate={{ marginTop: isNavVisible ? 80 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="col-span-12 lg:col-span-6 flex flex-col gap-6 transition-all duration-300 relative min-w-0"
          >
            <FeedHeader onCreatePost={() => setIsModalOpen(true)} />

            <div className="block lg:hidden -mt-2">
              <TrendingNow variant="mobile" />
            </div>

            <FeedVibesBar currentUserId={currentUserId} />

            <PostsList />

            <motion.button
              animate={{
                scale: isNavVisible ? 1 : 0,
                opacity: isNavVisible ? 1 : 0,
                y: isNavVisible ? 0 : 50,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setIsModalOpen(true)}
              className={cn(
                // تم إضافة hidden lg:flex هنا لإخفائه من الموبايل
                "hidden lg:flex fixed bottom-24 z-50 items-center justify-center w-14 h-14 bg-blue-900 text-white rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50 hover:bg-indigo-700 dark:hover:bg-blue-600 active:scale-95 transition-colors outline-none",
                isRtl
                  ? "left-[calc(25vw)]" // شلنا كلاسات الموبايل لأنها مبقتش لازمة
                  : "right-[calc(25vw)]",
              )}
              aria-label={t("feed.createPostBtn") || "Create Post"}
            >
              <Plus
                className="w-6 h-6 text-white dark:text-slate-100"
                strokeWidth={2.5}
              />
            </motion.button>
          </motion.div>

          <motion.aside
            animate={{ top: isNavVisible ? 96 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:block lg:col-span-3 sticky z-10 w-full"
          >
            <RightSidebar />
          </motion.aside>
        </div>
      </div>

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