import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { useProfileStore } from "../store/profile.store";
import type { UpdateProfileRequest } from "../types/profile.types";
import { TravelPersonality } from "../types/travelPersonality.enum";
import PasswordTab from "./passwordTab";

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "password";
}

export default function EditProfileForm({
  isOpen,
  onClose,
  defaultTab = "profile",
}: EditProfileFormProps) {
  const { profile, updateProfile } = useProfileStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password">(
    defaultTab
  );

  const {
    register,
    handleSubmit,
    
  } = useForm<UpdateProfileRequest>();

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /* ===============================
     Sync active tab when changed
  =============================== */
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  /* ===============================
     Fill form with profile data
  =============================== */


  const onSubmitProfile = async (data: UpdateProfileRequest) => {
    if (previewImage) {
      data.ProfilePicture = previewImage;
    }

    await updateProfile(data);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4">

          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          {/* Modal */}
          <Transition.Child
            as={Fragment}
            enter="transition duration-300 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-200 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-[#f5f7fa] rounded-3xl w-full max-w-lg max-h-[90vh] p-6 z-10 overflow-y-auto shadow-2xl"
            >
              <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Account Settings
              </Dialog.Title>

              {/* Tabs */}
              <div className="flex justify-center mb-6 gap-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    activeTab === "profile"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile Info
                </button>

                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    activeTab === "password"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("password")}
                >
                  Change Password
                </button>
              </div>

              {/* ================= PROFILE TAB ================= */}
              {activeTab === "profile" && (
                <form
                  className="space-y-4"
                  onSubmit={handleSubmit(onSubmitProfile)}
                >
                  <div className="flex gap-4">
                    <motion.input
                      {...register("Fname")}
                      placeholder="First Name"
                      className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.input
                      {...register("Lname")}
                      placeholder="Last Name"
                      className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  <motion.input
                    {...register("UserName")}
                    placeholder="Username"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    whileFocus={{ scale: 1.02 }}
                  />

                  <motion.textarea
                    {...register("Bio")}
                    placeholder="Bio"
                    rows={3}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  />

                  <motion.input
                    {...register("Location")}
                    placeholder="Location"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  />

                  {/* Image Upload */}
                  <div className="flex flex-col items-center border-2 border-dashed border-cyan-300 rounded-xl p-4">
                    <label className="font-semibold mb-2 block">
                      Profile Picture
                    </label>

                    <input type="file" onChange={handleFileChange} />

                    {previewImage && (
                      <motion.img
                        src={previewImage}
                        className="w-28 h-28 object-cover rounded-full border-4 border-cyan-300 mt-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      />
                    )}
                  </div>

                  <motion.input
                    type="date"
                    {...register("BirthDate")}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  />

                  <div className="flex gap-4">
                    <motion.select
                      {...register("Gender", { valueAsNumber: true })}
                      className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    >
                      <option value={0}>Select Gender</option>
                      <option value={1}>Male</option>
                      <option value={2}>Female</option>
                      <option value={3}>Other</option>
                    </motion.select>

                    <motion.select
                      {...register("TravelPersonality", {
                        valueAsNumber: true,
                      })}
                      className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    >
                      <option value="">Select Personality</option>

                      {Object.entries(TravelPersonality)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, value]) => (
                          <option key={value} value={value}>
                            {key}
                          </option>
                        ))}
                    </motion.select>
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
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* ================= PASSWORD TAB ================= */}
              <PasswordTab activeTab={activeTab} onClose={onClose} />
            </motion.div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}