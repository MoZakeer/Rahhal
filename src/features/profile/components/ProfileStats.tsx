import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileStore } from "../store/profile.store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";
import {
  IoGlobeOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
} from "react-icons/io5";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const modalAnimation = {
  hidden: { opacity: 0, scale: 0.96, y: 15 },
  show: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 15 },
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

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  if (!profile) return null;

  const statsToShow = [
    {
      label: "Countries",
      value: profile.countriesCount,
      icon: IoGlobeOutline,
    },
    {
      label: "Followers",
      value: profile.followersCount,
      endpoint: "Followers/GetAllUserFollowers",
      key: "followers",
      icon: IoPeopleOutline,
    },
    {
      label: "Following",
      value: profile.followingCount,
      endpoint: "Followers/GetAllUserFollowings",
      key: "followings",
      icon: IoPersonAddOutline,
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
      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-6 flex items-center justify-around text-center"
      >
        {statsToShow.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              variants={item}
              whileTap={{ scale: 0.95 }}
              className="flex-1 cursor-pointer"
              onClick={() =>
                stat.endpoint &&
                fetchUsers(stat.endpoint, stat.key!, stat.label)
              }
            >
              <p className="text-lg font-semibold text-gray-900">
                {stat.value}
              </p>

              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                <Icon className="text-sm" />
                <span>{stat.label}</span>
              </div>

              {/* Divider */}
              {index !== statsToShow.length - 1 && (
                <div className="absolute top-2 right-0 h-8 w-px bg-gray-200" />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
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
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-[95%] sm:w-[380px] max-h-[80vh] rounded-xl shadow-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800 text-sm">
                  {modalTitle}
                </h3>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[65vh] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    Loading...
                  </div>
                ) : modalUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
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
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
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
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-medium">
                              {firstLetter}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {user.profileName}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
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