import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // الخطوة الأهم لحل مشكلة الـ Layers
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

// Animations
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const modalAnimation = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
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

  const fetchUsers = async (endpoint: string, key: string, title: string) => {
    if (!profileId) return;
    setLoading(true);
    setModalTitle(title);
    setShowModal(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/${endpoint}`, {
        params: {
          ProfileId: profileId,
          PageNumber: 1,
          PageSize: 50, 
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalUsers(res.data.data[key] || []);
    } catch (error) {
      console.log("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Stats Row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-6 flex items-center justify-around text-center py-2"
      >
        {statsToShow.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={item}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 ${stat.endpoint ? "cursor-pointer group" : ""}`}
              onClick={() =>
                stat.endpoint &&
                fetchUsers(stat.endpoint, stat.key!, stat.label)
              }
            >
              <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                {stat.value}
              </p>
              <div className="flex items-center justify-center gap-1 text-[9px] font-medium text-gray-400 uppercase tracking-wider mt-1">
                <Icon className="text-sm" />
                <span>{stat.label}</span>
              </div>
              {index !== statsToShow.length - 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 right-0 h-8 w-px bg-gray-100 dark:bg-zinc-800" />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999"
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
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 w-[90%] sm:w-[400px] max-h-[75vh] rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-50 dark:border-zinc-800">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {modalTitle}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Users List Body */}
                <div className="overflow-y-auto max-h-[55vh] p-4 custom-scrollbar">
                  {loading ? (
                    <div className="py-12 text-center text-gray-400 font-medium">
                      <div className="animate-spin mb-2 inline-block">⏳</div>
                      <p>Loading users...</p>
                    </div>
                  ) : modalUsers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <IoPeopleOutline className="text-4xl mx-auto mb-2 opacity-20" />
                      <p>No {modalTitle.toLowerCase()} yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {modalUsers.map((user) => {
                        const image = getProfileImage(user.profilePicture);
                        return (
                          <motion.div
                            key={user.profileId}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-2xl cursor-pointer transition-all"
                            onClick={() => {
                              setShowModal(false);
                              navigate(`/profile/${user.profileId}`);
                            }}
                          >
                            <div className="relative">
                               <img
                                src={image || `https://ui-avatars.com/api/?name=${user.profileName}&background=random`}
                                alt={user.profileName}
                                className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {user.profileName}
                              </p>
                              <p className="text-xs text-gray-500 truncate leading-relaxed">
                                {user.bio || "Exploring the world 🌍"}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ProfileStats;