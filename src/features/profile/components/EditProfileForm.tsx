import { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import type { UpdateProfileRequest, ProfileResponse } from "../types/profile.types";

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  userData: ProfileResponse;
  onSuccess: () => void;
}

export default function EditProfileForm({
  isOpen,
  onClose,
  userData,
  onSuccess,
}: EditProfileFormProps) {
  const { register, handleSubmit, reset } = useForm<UpdateProfileRequest>();
  const [previewImage, setPreviewImage] = useState<File | string | null>(null);

  // Reset form when userData changes
  useEffect(() => {
    reset({
      Fname: userData.Fname,
      Lname: userData.Lname,
      UserName: userData.UserName,
      Bio: userData.Bio,
      Location: userData.Location,
      ProfilePicture: userData.ProfilePicture,
      BirthDate: userData.BirthDate,
      Gender: userData.Gender,
      TravelPersonality: userData.TravelPersonality,
      TravelPreferenceIds: userData.TravelPreferenceIds,
      VisitedCountryIds: userData.VisitedCountryIds,
      DreamCountryIds: userData.DreamCountryIds,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewImage(userData.ProfilePicture || null);
  }, [userData, reset]);
  const id= localStorage.getItem("profileId") || "";
  const onSubmit = async (data: UpdateProfileRequest) => {
    const formData = new FormData();

    // Append text fields
    formData.append("Fname", data.Fname || "");
    formData.append("Lname", data.Lname || "");
    formData.append("UserName", data.UserName || "");
    formData.append("Bio", data.Bio || "");
    formData.append("Location", data.Location || "");
    formData.append("BirthDate", data.BirthDate || "");
    formData.append("Gender", String(data.Gender || 0));
    formData.append("TravelPersonality", String(data.TravelPersonality || 0));

    // Append arrays as JSON strings
    formData.append("TravelPreferenceIds", JSON.stringify(data.TravelPreferenceIds || ["1","2","3"]));
    formData.append("VisitedCountryIds", JSON.stringify(data.VisitedCountryIds || ["1","2","3"]));
    formData.append("DreamCountryIds", JSON.stringify(data.DreamCountryIds || ["1","2","3"]));

    // Append profile picture
    if (previewImage instanceof File) {
      formData.append("ProfilePicture", previewImage);
    } else if (typeof previewImage === "string") {
      // If it's Base64, convert to blob
      const res = await fetch(previewImage);
      const blob = await res.blob();
      formData.append("ProfilePicture", blob, "profile.png");
    }

    try {
      await fetch(`https://rahhal-api.runasp.net/Profile/UpdateProfile/${id}`, {
        method: "PUT",
        body: formData, 
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <div className="bg-white rounded-lg w-full max-w-md p-6 z-10 overflow-y-auto">
            <Dialog.Title className="text-lg font-bold mb-4">Edit Profile</Dialog.Title>
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <input {...register("Fname")} placeholder="First Name" className="w-full p-2 border rounded" />
              <input {...register("Lname")} placeholder="Last Name" className="w-full p-2 border rounded" />
              <input {...register("UserName")} placeholder="Username" className="w-full p-2 border rounded" />
              <textarea {...register("Bio")} placeholder="Bio" className="w-full p-2 border rounded" />
              <input {...register("Location")} placeholder="Location" className="w-full p-2 border rounded" />

              <label>Profile Picture</label>
              <input type="file" onChange={handleFileChange} />
              {previewImage && typeof previewImage === "string" && (
                <img src={previewImage} className="w-20 h-20 object-cover rounded mt-2" />
              )}

              <input type="date" {...register("BirthDate")} className="w-full p-2 border rounded" />

              <select {...register("Gender")} className="w-full p-2 border rounded">
                <option value={0}>Select Gender</option>
                <option value={1}>Male</option>
                <option value={2}>Female</option>
                <option value={3}>Other</option>
              </select>

              <select {...register("TravelPersonality")} className="w-full p-2 border rounded">
                <option value={0}>Select Personality</option>
                <option value={1}>Explorer</option>
                <option value={2}>Relaxed</option>
                <option value={3}>Adventurous</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}