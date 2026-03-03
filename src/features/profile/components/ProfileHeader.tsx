import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";
import { useProfileStore } from "../store/profile.store";
import Image from "../../../../public/avater.png";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ProfileHeader = () => {
  const { profile, fetchProfile, loading } = useProfileStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  if (loading || !profile)
    return <div className="text-center py-10 text-gray-500">Loading...</div>;

  const handleNavigation = (option: string) => {
    setIsDrawerOpen(false);
    if (option === "edit") {
      navigate("/profile/edit");
    } else if (option === "settings") {
      navigate("/settings");
    } else if (option === "logout") {
      localStorage.removeItem("token");

      navigate("/login");
      console.log("Logging out...");

    }
  };

  return (
    <>
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center sm:justify-between p-5 bg-linear-to-r from-white via-gray-50 to-white rounded-xl shadow-md border border-gray-100"
      >
        {/* Left: Profile */}
        <div className="flex items-center gap-4 sm:gap-5">
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <img
              src={
                profile.profilePicture
                  ? `https://rahhal-api.runasp.net${profile.profilePicture}`
                  : Image
              }
              alt="Profile Picture"
              className="w-30 h-30 rounded-full object-cover border-2 border-cyan-500"
            />
            {/* <span className="absolute -bottom-1  bg-cyan-500 w-3 h-3 rounded-full border border-white"></span> */}
          </motion.div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800">{profile.fullName}</h2>
            <p className="text-gray-500 text-sm mt-1">@{profile.userName}</p>
            <p className="text-gray-500 text-sm mt-1">{profile.bio}</p>
          </div>
        </div>

        {/* Right: Settings Button */}
        <motion.button
          onClick={() => setIsDrawerOpen(true)}
          whileHover={{ scale: 1.1 }}
          className="mt-3 sm:mt-0 p-2 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm"
        >
          <IoMdSettings size={20} className="text-gray-600 hover:text-gray-800 transition" />
        </motion.button>
      </motion.div>

      {/* Drawer Sidebar */}
      <ProfileSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEditProfile={() => handleNavigation("edit")}
      // onLogout={() => handleNavigation("logout")}
      />
    </>
  );
};

export default ProfileHeader;