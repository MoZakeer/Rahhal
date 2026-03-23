import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileStore } from "../store/profile.store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const modalAnimation = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  show: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 30 },
};

interface Props {
  profileId?: string;
}

interface User {
  profileId: string;
  profileName: string;
  profilePicture: string | null;
  bio: string | null;
}

const ProfileStats: React.FC<Props> = ({ profileId }) => {
  const { profile } = useProfileStore();
  const navigate = useNavigate();

  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = "https://rahhal-api.runasp.net";

  const getProfileImage = (image?: string | null) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return baseUrl + image;
  };

  // close with ESC
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  if (!profile) return null;

  const statsToShow = [
    { label: "Countries", value: profile.countriesCount },

    {
      label: "Followers",
      value: profile.followersCount,
      endpoint: "Followers/GetAllUserFollowers",
      key: "followers",
    },

    {
      label: "Following",
      value: profile.followingCount,
      endpoint: "Followers/GetAllUserFollowings",
      key: "followings",
    },
  ];

  const fetchUsers = async (
    endpoint: string,
    key: string,
    title: string
  ) => {
    if (!profileId) return;

    setLoading(true);
    setModalTitle(title);
    setShowModal(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://rahhal-api.runasp.net/${endpoint}`,
        {
          params: {
            ProfileId: profileId,
            PageNumber: 1,
            PageSize: 20,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModalUsers(res.data.data[key] || []);
    } catch (error) {
      console.log("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-6 flex justify-between bg-gray-50 rounded-xl p-4 shadow-sm"
      >
        {statsToShow.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="flex-1 text-center cursor-pointer"
            onClick={() =>
              stat.endpoint &&
              fetchUsers(stat.endpoint, stat.key, stat.label)
            }
          >
            <p className="text-xl font-semibold text-gray-900">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalAnimation}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-[95%] sm:w-105 max-h-[80vh] rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {modalTitle}
                </h3>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[65vh] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Loading...
                  </div>
                ) : modalUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No users found
                  </div>
                ) : (
                  <ul>
                    {modalUsers.map((user) => {
                      const image = getProfileImage(
                        user.profilePicture
                      );

                      const firstLetter =
                        user.profileName
                          ?.charAt(0)
                          .toUpperCase() || "U";

                      return (
                        <li
                          key={user.profileId}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => {
                            setShowModal(false);
                            navigate(
                              `/profile/${user.profileId}`
                            );
                          }}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={user.profileName}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                              {firstLetter}
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-gray-800">
                              {user.profileName}
                            </p>

                            <p className="text-sm text-gray-500">
                              {user.bio || "No bio available"}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileStats;