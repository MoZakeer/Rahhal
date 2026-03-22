import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";
import { useProfileStore } from "../store/profile.store";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ProfileHeaderSkeleton from "../skeletons/ProfileHeaderSkeleton";
import FollowButton from "../../../shared/components/followButton";
import axios from "axios";

interface Props {
  profileId?: string;
  isMyProfile?: boolean;
}

const ProfileHeader: React.FC<Props> = ({
  profileId,
  isMyProfile,
}) => {
  const { profile, fetchProfile, loading } = useProfileStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (profileId) fetchProfile(profileId);
  }, [profileId, fetchProfile]);

  const baseUrl = "https://rahhal-api.runasp.net";

  const getProfileImage = (image?: string | null) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return baseUrl + image;
  };

  // Start DM
  const handleSendMessage = async () => {
    try {
      if (!profileId) return;

      const response = await axios.post(
        "https://rahhal-api.runasp.net/Chat/StartDM",
        {
          targetProfileId: profileId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
            "Content-Type": "application/json",
          },
        }
      );

      const conversationId =
        response?.data?.data?.conversationId;

      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.log("Start DM Error:", error);
    }
  };

  if (loading || !profile)
    return <ProfileHeaderSkeleton />;

  const handleNavigation = (option: string) => {
    setIsDrawerOpen(false);

    if (option === "edit") {
      navigate(`/profile/${profileId}/edit`);
    }

    if (option === "logout") {
      localStorage.clear();
      navigate("/landing-page");
    }
  };

  const handleCloseDrawer = () => {
    console.log("Closing drawer, profileId:", profileId);
    setIsDrawerOpen(false);

    if (profileId) {
      navigate(`/profile/${profileId}`);
    }
  };

  const image = getProfileImage(profile.profilePicture);
  const firstLetter =
    profile.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-center sm:justify-between p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100"
      >
        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
          <motion.div className="rounded-full overflow-hidden shrink-0">
            {image ? (
              <img
                src={image}
                alt="Profile Picture"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-cyan-500 bg-gray-200"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-3xl font-semibold border-2 border-cyan-500">
                {firstLetter}
              </div>
            )}
          </motion.div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {profile.fullName}
            </h2>

            <p className="text-gray-500 text-sm">
              @{profile.userName}
            </p>

            <p className="text-gray-500 text-sm mt-1 line-clamp-3">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {isMyProfile ? (
            <motion.button
              onClick={() => setIsDrawerOpen(true)}
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm"
            >
              <IoMdSettings
                size={20}
                className="text-gray-600 hover:text-gray-800 transition"
              />
            </motion.button>
          ) : (
            profileId && (
              <div className="flex gap-2">
                <FollowButton
                  profileId={profileId}
                  isMyProfile={isMyProfile}
                />

                <motion.button
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-sm hover:bg-cyan-700 transition"
                >
                  Message
                </motion.button>
              </div>
            )
          )}
        </div>
      </motion.div>

      {/* Drawer */}
      {isMyProfile && (
        <ProfileSettingsDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onEditProfile={() =>
            handleNavigation("edit")
          }
        />
      )}
    </>
  );
};

export default ProfileHeader;