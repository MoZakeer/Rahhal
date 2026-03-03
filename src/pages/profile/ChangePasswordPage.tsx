import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useProfileStore } from "../../features/profile/store/profile.store";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const { ChangePassword } = useProfileStore();
  const { register, handleSubmit } = useForm<ChangePasswordRequest>();
  const navigate = useNavigate();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    alert("Password changed successfully!");
    navigate("/profile"); // يرجع لصفحة البروفيل بعد التغيير
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Change Password</h1>

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

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700"
            >
              Change Password
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}