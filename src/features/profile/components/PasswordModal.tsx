import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useProfileStore } from "../store/profile.store";
import { useForm } from "react-hook-form";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { ChangePassword } = useProfileStore();
  const { register, handleSubmit } = useForm<ChangePasswordRequest>();

  const onSubmitPassword = async (data: ChangePasswordRequest) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    await ChangePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmPassword,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-lg font-bold mb-4">Change Password</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmitPassword)}>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              {...register("oldPassword")}
              placeholder="Old Password"
              className="w-full p-3 pr-10 border rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder="New Password"
              className="w-full p-3 pr-10 border rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm New Password"
              className="w-full p-3 pr-10 border rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-xl text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700"
            >
              Change Password
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}