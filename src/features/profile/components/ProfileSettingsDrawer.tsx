import { motion } from "framer-motion";
import { X, LogOut, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

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
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/landing-page");
  };

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId;

 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={drawerRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      /* absolute تعني موضعه بالنسبة للترس، top-12 ينزل تحته، right-0 يحاذيه من اليمين */
      className="absolute  top-46 right-0 bg-white dark:bg-slate-900 w-64 h-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 p-4 flex flex-col gap-3 transition-colors duration-300 z-50"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        <button
          onClick={() => {
            onEditProfile();
            onClose();
          }}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer group"
        >
          <div className="p-1.5 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-100 transition-colors">
            <User size={16} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          Edit Profile Info
        </button>

        <button
          onClick={() => {
            navigate(`/profile/${profileId}/change_password`);
            onClose();
          }}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer group"
        >
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Lock size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          Change Password
        </button>
      </div>

      {/* Logout Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-xs font-bold cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </motion.div>
  );
}