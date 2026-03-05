import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

export default function ProfileSettingsDrawer({
  isOpen,
  onClose,
  onEditProfile,
}: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.clear();
  navigate("/landing-page");
};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ duration: 0.3 }}
            className="fixed right-6 top-20 w-72 bg-white shadow-2xl rounded-2xl z-50 p-6 flex flex-col gap-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Settings</h3>
              <button onClick={onClose}>
                <X />
              </button>
            </div>

            <button
              onClick={() => {
                onEditProfile();
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              <User size={18} />
              Edit Profile Info
            </button>

            <button
              onClick={() => {
                navigate("/profile/change_password"); 
                onClose(); 
              }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              <Lock size={18} />
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition mt-auto"
            >
              <LogOut size={18} />
              Logout
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}