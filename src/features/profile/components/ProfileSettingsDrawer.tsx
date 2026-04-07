import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

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

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // هنا السر: الـ Overlay يغطي الشاشة بالكامل مع Blur
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-end z-9999"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
           
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 w-72 h-fit mt-24 mr-6 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Settings
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onEditProfile();
                  onClose();
                }}
                className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                  <User size={18} className="text-violet-600" />
                </div>
                Edit Profile Info
              </button>

              <button
                onClick={() => {
                  navigate(`/profile/${profileId}/change_password`);
                  onClose();
                }}
                className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Lock size={18} className="text-blue-600" />
                </div>
                Change Password
              </button>
            </div>

            {/* Logout Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-bold"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}