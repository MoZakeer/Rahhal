import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdSettings, IoMdMail } from "react-icons/io";
import { HiOutlineLocationMarker, HiOutlineUsers } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";
import { useProfileStore } from "../store/profile.store";
import ProfileHeaderSkeleton from "../skeletons/ProfileHeaderSkeleton";
import FollowButton from "../../../shared/components/followButton";
import axios from "axios";

interface Props {
  profileId?: string;
  isMyProfile?: boolean;
}

const ProfileHeader: React.FC<Props> = ({ profileId, isMyProfile }) => {
  const { profile, fetchProfile, loading } = useProfileStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileId) fetchProfile(profileId);
  }, [profileId, fetchProfile]);

  const baseUrl = "https://rahhal-api.runasp.net";
  const getProfileImage = (image?: string | null) => {
    if (!image) return null;
    return image.startsWith("http") ? image : baseUrl + image;
  };

  const handleSendMessage = async () => {
    try {
      if (!profileId) return;
      const response = await axios.post(
        `${baseUrl}/Chat/StartDM`,
        { targetProfileId: profileId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const conversationId = response?.data?.data?.conversationId;
      if (conversationId) navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.log("DM Error:", error);
    }
  };

  if (loading || !profile) return <ProfileHeaderSkeleton />;

  const image = getProfileImage(profile.profilePicture);
  const firstLetter = profile.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        
        {/* Avatar Section */}
        <div className="relative mb-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 md:w-36 md:h-36 rounded-[2rem] overflow-hidden shadow-xl ring-4 ring-white dark:ring-zinc-800"
          >
            {image ? (
              <img 
                src={image} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {firstLetter}
              </div>
            )}
          </motion.div>
          
          {isMyProfile && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="absolute -bottom-1 -right-1 p-2.5 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-colors"
            >
              <IoMdSettings size={18} />
            </button>
          )}
        </div>

        {/* Name & Username */}
        <div className="space-y-1 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {profile.fullName}
          </h1>
          <p className="text-violet-600 dark:text-violet-400 font-medium text-sm">
            @{profile.userName}
          </p>
        </div>

        {/* Bio */}
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 px-4 lg:px-0">
          {profile.bio || "Passionate traveler exploring the world one city at a time."}
        </p>

        {/* Meta Stats (Location/Users) */}
        <div className="flex flex-col gap-3 w-full mb-6">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <HiOutlineLocationMarker className="text-violet-500" size={18} />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">10 Countries Visited</span>
          </div>
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <HiOutlineUsers className="text-violet-500" size={18} />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">3 Followers</span>
          </div>
        </div>

        {/* Action Buttons: Full width in sidebar */}
        {!isMyProfile && (
          <div className="flex flex-col gap-3 w-full mt-2">
            <FollowButton profileId={profileId!} isMyProfile={false} />
            <motion.button
              onClick={handleSendMessage}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all"
            >
              <IoMdMail size={20} />
              <span>Message</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Drawer Component */}
      <AnimatePresence>
        {isMyProfile && isDrawerOpen && (
          <ProfileSettingsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onEditProfile={() => navigate(`/profile/${profileId}/edit`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileHeader;