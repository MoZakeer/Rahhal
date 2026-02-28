import { useState, useEffect } from "react";
import EditProfileForm from "./EditProfileForm";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";
import { useProfileStore } from "../store/profile.store";
import Image from "../../../../public/avater.png";
import { IoMdSettings } from "react-icons/io";

const ProfileHeader = () => {
  const { profile, fetchProfile, loading } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  if (loading || !profile) return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center sm:justify-between p-6 bg-white rounded-xl shadow-md">
        <div className="flex items-center gap-5">
          <img
            src={profile.ProfilePicture || Image}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {profile.fullName}
            </h2>
            <p className="text-gray-500 text-sm">@{profile.userName}</p>
          </div>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="mt-4 sm:mt-0 p-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
        >
          <IoMdSettings size={20} />
        </button>
      </div>

      {/* Drawer */}
      <ProfileSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEditProfile={() => {
          setActiveTab("profile");
          setIsModalOpen(true);
        }}
        onChangePassword={() => {
          setActiveTab("password");
          setIsModalOpen(true);
        }}
      />

      {/* Modal */}
      {isModalOpen && (
        <EditProfileForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultTab={activeTab}
        />
      )}
    </>
  );
};

export default ProfileHeader;