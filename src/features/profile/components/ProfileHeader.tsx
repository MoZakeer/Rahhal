import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";
import { useProfileStore } from "../store/profile.store";
import Image from "../../../../public/avater.png";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ProfileHeaderSkeleton from "../skeletons/ProfileHeaderSkeleton";

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

  if (loading || !profile) return <ProfileHeaderSkeleton />;

  const handleNavigation = (option: string) => {
    setIsDrawerOpen(false);
    if (option === "edit") navigate(`/profile/edit`);
    else if (option === "settings") navigate("/settings");
    else if (option === "logout") {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/landing-page");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-center sm:justify-between p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
          <motion.div className="rounded-full overflow-hidden shrink-0">
           <img
  src={
    profile.profilePicture && profile.profilePicture !== "string"
      ? `https://rahhal-api.runasp.net${profile.profilePicture}`
      : Image
  }
  alt="Profile Picture"
  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-cyan-500 bg-gray-200"
/>
          </motion.div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{profile.fullName}</h2>
            <p className="text-gray-500 text-sm">@{profile.userName}</p>
            <p className="text-gray-500 text-sm mt-1 line-clamp-3">{profile.bio}</p>
          </div>
        </div>

        {isMyProfile && (
          <motion.button
            onClick={() => setIsDrawerOpen(true)}
            whileHover={{ scale: 1.05 }}
            className="mt-3 sm:mt-0 p-2 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm"
          >
            <IoMdSettings size={20} className="text-gray-600 hover:text-gray-800 transition" />
          </motion.button>
        )}
      </motion.div>

      {isMyProfile && (
        <ProfileSettingsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onEditProfile={() => handleNavigation("edit")}
        />
      )}
    </>
  );
};

export default ProfileHeader;