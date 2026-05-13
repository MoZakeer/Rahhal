import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useProfileStore } from "../../features/profile/store/profile.store";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const { ChangePassword } = useProfileStore();
  const { register, handleSubmit } = useForm<ChangePasswordRequest>();
  const navigate = useNavigate();
  const id = localStorage.getItem("auth");
  const parsedId = id ? JSON.parse(id) : null;
  const profileId = parsedId?.profileId;

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  usePageTitle("Change Password");
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
    navigate(`/profile/${profileId}`);
  };

  return (
    /* 1. الخلفية أصبحت تتغير لـ slate-900 في الدارك مود */
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        /* 2. الكارد أصبح يقلب لـ slate-800 مع حدود خفيفة */
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-transparent dark:border-slate-700/50"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
          Change Password
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmitPassword)}>
          {/* الـ Inputs أصبحت داكنة مع نصوص فاتحة */}
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              {...register("oldPassword")}
              placeholder="Old Password"
              className="w-full p-3 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder="New Password"
              className="w-full p-3 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm New Password"
              className="w-full p-3 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate(`/profile/${profileId}`)}
              /* زر الإلغاء بلون هادئ يتناسب مع الدارك مود */
              className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              /* زر التغيير بلون البراند الأزرق الموحد */
              className="flex-1 px-6 py-3 bg-blue-700 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-800 dark:hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all font-semibold"
            >
              Update
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
