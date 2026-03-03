import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimateSharedLayout } from "framer-motion";
import SearchComponent from "../../features/search/components/SearchComponent";
import Image from "../../../public/profile_img.jpg";

interface User {
  profileId: string;
  username: string;
  bio: string;
  profilePictureUrl?: string;
}

interface Post {
  postId: string;
  description: string;
}

interface SearchResults {
  users?: { items?: User[] };
  usersPreview?: User[];
  posts?: { items?: Post[] };
  postsPreview?: Post[];
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Skeleton Component
const Skeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-14 bg-gray-200 rounded w-full" />
    ))}
  </div>
);

export default function SearchResults() {
  const query = useQuery();
  const navigate = useNavigate();
  const keyword = query.get("keyword") || "";
  const defaultTab = parseInt(query.get("tab") || "0");

  const [tab, setTab] = useState(defaultTab);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "https://rahhal-api.runasp.net";
  const tabs = ["Posts", "Users"]; // Tab 0 = Posts, Tab 1 = Users

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
        PageSize: "5",
      });
      const res = await fetch(
        `https://rahhal-api.runasp.net/Search/Global?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.data);
      console.log("SearchResults - API response:", data);
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header with Back Arrow */}
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
        <div className="flex gap-6 border-b border-gray-300 mb-6 relative">
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
        <div className="space-y-4">
          {/* Tab 0 = Posts */}
          {tab === 0 &&
            (results?.posts?.items?.length
              ? results.posts.items
              : results?.postsPreview ?? []
            ).map((p) => (
              <div
                key={p.postId}
                className="border p-3 rounded bg-white shadow-sm"
              >
                <p className="text-gray-900">{p.description}</p>
              </div>
            ))}

          {/* Tab 1 = Users */}
          {tab === 1 &&
            (results?.users?.items?.length
              ? results.users.items
              : results?.usersPreview ?? []
            ).map((u) => (
              <div
                key={u.profileId}
                className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/profile/${u.profileId}`)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      u.profilePictureUrl
                        ? `${BASE_URL}${u.profilePictureUrl}`
                        : Image
                    }
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                    alt={u.username}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                      {u.username}
                    </span>
                    {u.bio && (
                      <span className="text-gray-500 text-xs line-clamp-1">
                        {u.bio}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* No results */}
          {(
            (tab === 0 &&
              !(results?.posts?.items?.length || results?.postsPreview?.length)) ||
            (tab === 1 &&
              !(results?.users?.items?.length || results?.usersPreview?.length))
          ) && (
            <p className="text-gray-500 text-center mt-4">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}