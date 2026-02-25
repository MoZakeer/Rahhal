// PasswordTab.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useProfileStore } from "../store/profile.store";
import { useForm } from "react-hook-form";

interface PasswordTabProps {
  activeTab: "profile" | "password";
  onClose: () => void;
  // register: any;
  // handleSubmit: any;
}
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export default function PasswordTab({ activeTab, onClose }: PasswordTabProps) {
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

  if (activeTab !== "password") return null;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitPassword)}>
      <div className="relative">
        <motion.input
          type={showOldPassword ? "text" : "password"}
          {...register("oldPassword")}
          placeholder="Old Password"
          className="w-full p-3 pr-10 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          whileFocus={{ scale: 1.01 }}
        />
        <button
          type="button"
          onClick={() => setShowOldPassword(!showOldPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative">
        <motion.input
          type={showNewPassword ? "text" : "password"}
          {...register("newPassword")}
          placeholder="New Password"
          className="w-full p-3 pr-10 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          whileFocus={{ scale: 1.01 }}
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative">
        <motion.input
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword")}
          placeholder="Confirm New Password"
          className="w-full p-3 pr-10 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          whileFocus={{ scale: 1.01 }}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex justify-end gap-4 mt-5">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border rounded-xl text-gray-700 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition"
        >
          Change Password
        </button>
      </div>
    </form>
  );
}