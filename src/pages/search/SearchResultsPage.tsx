import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimateSharedLayout } from "framer-motion";
import SearchComponent from "../../features/search/components/SearchComponent";
import Image from "../../../public/profile_img.jpg";
import SearchPostCard from "../../features/search/components/SearchPostCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";

interface User {
  profileId: string;
  username: string;
  bio: string;
  profilePictureUrl?: string;
}

interface PostPreview {
  postId: string;
  description: string;
  authorUsername: string;
  authorProfilePicture?: string;
  createdAt: string;
  mediaUrLs?: { id: string; url: string }[];
}

interface SearchResults {
  users?: { items?: User[] };
  usersPreview?: User[];
  posts?: { items?: PostPreview[] };
  postsPreview?: PostPreview[];
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Skeleton Component
const Skeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-14 bg-gray-200 rounded w-full " />
    ))}
  </div>
);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SearchResults() {
  usePageTitle("Search");
  useFavicon("/global-research.png");
  const query = useQuery();
  const navigate = useNavigate();
  const keyword = query.get("keyword") || "";
  const defaultTab = parseInt(query.get("tab") || "0");

  const [tab, setTab] = useState(defaultTab);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "https://rahhal-api.runasp.net";
  const tabs = ["All", "Users", "Posts"]; // 0 = All, 1 = Users, 2 = Posts

  const fetchData = async (currentTab: number) => {
    if (!keyword) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const params = new URLSearchParams({
        Keyword: keyword,
        Tab: currentTab.toString(),
        PageNumber: "1",
        PageSize: "10",
      });
      const res = await fetch(`${BASE_URL}/Search/Global?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tab);
  }, [tab, keyword]);

  const allPosts = results?.posts?.items || results?.postsPreview || [];
  const allUsers = results?.users?.items || results?.usersPreview || [];
  // console.log("Search results:", { allUsers, allPosts });
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div
        className="flex items-center gap-3 mb-6 cursor-pointer"
        onClick={() => navigate("/feed")}
      >
        <ArrowLeft className="w-6 h-6 text-gray-900" />
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Search Results for "{keyword}"
        </h1>
      </div>

      <SearchComponent />

      {/* Tabs */}
      <AnimateSharedLayout>
        <div className="flex gap-6 border-b border-gray-300 mb-6 relative overflow-x-auto">
          {tabs.map((t, idx) => (
            <button
              key={t}
              className={`pb-2 font-medium text-gray-700 relative`}
              onClick={() => setTab(idx)}
            >
              {t}
              {tab === idx && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </AnimateSharedLayout>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Results */}
      {loading ? (
        <Skeleton count={5} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Tab 0 = All */}
          {tab === 0 && (
            <>
              {/* Users  */}
              <div className="flex flex-col gap-4">
                {allUsers.map((user: User) => (
                  <motion.div
                    key={user.profileId}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="flex items-center justify-between w-full gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer dark:bg-slate-700 dark:border-slate-600"
                      onClick={() => navigate(`/profile/${user.profileId}`)}
                    >
                      <div className="flex items-center gap-3 dark:bg-slate-700">
                        <motion.img
                          whileHover={{ scale: 1.08 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          src={
                            user.profilePictureUrl
                              ? `${BASE_URL}${user.profilePictureUrl}`
                              : Image
                          }
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 "
                          alt={user.username}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-sm dark:text-slate-100">
                            {user.username}
                          </span>
                          {user.bio && (
                            <span className="text-gray-500 text-xs line-clamp-1 dark:text-slate-100">
                              {user.bio}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {allPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {allPosts.map((post: PostPreview) => (
                    <motion.div
                      key={post.postId}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <SearchPostCard post={post} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab 1 = Users */}
          {tab === 1 && (
            <div className="flex flex-col gap-4">
              {allUsers.map((u: User) => (
                <motion.div
                  key={u.profileId}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className="flex items-center justify-between w-full gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer dark:bg-slate-700 dark:border-slate-600"
                    onClick={() => navigate(`/profile/${u.profileId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <motion.img
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        src={
                          u.profilePictureUrl
                            ? `${BASE_URL}${u.profilePictureUrl}`
                            : Image
                        }
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                        alt={u.username}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm dark:text-slate-100">
                          {u.username}
                        </span>
                        {u.bio && (
                          <span className="text-gray-500 text-xs line-clamp-1 dark:text-slate-100">
                            {u.bio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tab 2 = Posts */}
          {tab === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPosts.map((p: PostPreview) => (
                <motion.div
                  key={p.postId}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.03 }}
                >
                  <SearchPostCard post={p} />
                </motion.div>
              ))}
            </div>
          )}

          {/* No results */}
          {((tab === 0 && !allPosts.length && !allUsers.length) ||
            (tab === 1 && !allUsers.length) ||
            (tab === 2 && !allPosts.length)) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center mt-8"
            >
              No results found.
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
