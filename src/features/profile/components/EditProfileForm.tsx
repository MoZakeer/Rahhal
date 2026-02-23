// // features/profile/components/EditProfileForm.tsx
// import { useForm, Controller } from "react-hook-form";
// import { Fragment, useState } from "react";
// import { Dialog, Transition } from "@headlessui/react";

// interface EditProfileFormProps {
//   isOpen: boolean;
//   closeModal: () => void;
//   userData: any;
//   onUpdate: (data: any) => void;
// }

// export default function EditProfileForm({ isOpen, closeModal, userData, onUpdate }: EditProfileFormProps) {
//   const { register, handleSubmit, control } = useForm({
//     defaultValues: userData,
//   });

//   const [previewImage, setPreviewImage] = useState(userData.ProfilePicture || "");

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setPreviewImage(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const submit = (data: any) => {
//     // استبدلي ProfilePicture بالصورة المحملة
//     data.ProfilePicture = previewImage;
//     onUpdate(data);
//     closeModal();
//   };

//   return (
//     <Transition show={isOpen} as={Fragment}>
//       <Dialog onClose={closeModal} className="fixed inset-0 z-10 overflow-y-auto">
//         <div className="flex items-center justify-center min-h-screen">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
//           <div className="bg-white p-6 rounded z-20 w-96 max-h-[90vh] overflow-y-auto">
//             <Dialog.Title className="text-lg font-bold mb-4">Edit Profile</Dialog.Title>
//             <form onSubmit={handleSubmit(submit)} className="space-y-3">
//               <input {...register("Fname")} placeholder="First Name" className="w-full p-2 border rounded" />
//               <input {...register("Lname")} placeholder="Last Name" className="w-full p-2 border rounded" />
//               <input {...register("UserName")} placeholder="Username" className="w-full p-2 border rounded" />
//               <textarea {...register("Bio")} placeholder="Bio" className="w-full p-2 border rounded" />
//               <input {...register("Location")} placeholder="Location" className="w-full p-2 border rounded" />

//               <label>Profile Picture</label>
//               <input type="file" onChange={handleFileChange} />
//               {previewImage && <img src={previewImage} className="w-20 h-20 object-cover rounded mt-2" />}

//               <input type="date" {...register("BirthDate")} className="w-full p-2 border rounded" />

//               <select {...register("Gender")} className="w-full p-2 border rounded">
//                 <option value={0}>Select Gender</option>
//                 <option value={1}>Male</option>
//                 <option value={2}>Female</option>
//                 <option value={3}>Other</option>
//               </select>

//               <select {...register("TravelPersonality")} className="w-full p-2 border rounded">
//                 <option value={0}>Select Personality</option>
//                 <option value={1}>Explorer</option>
//                 <option value={2}>Relaxed</option>
//                 <option value={3}>Adventurous</option>
//               </select>

//               {/* Arrays: TravelPreferenceIds, VisitedCountryIds, DreamCountryIds */}
//               <Controller
//                 control={control}
//                 name="TravelPreferenceIds"
//                 render={({ field }) => (
//                   <input
//                     type="text"
//                     placeholder="Travel Preferences (comma separated IDs)"
//                     {...field}
//                     onChange={(e) =>
//                       field.onChange(e.target.value.split(",").map((id) => parseInt(id.trim())))
//                     }
//                     className="w-full p-2 border rounded"
//                   />
//                 )}
//               />

//               <Controller
//                 control={control}
//                 name="VisitedCountryIds"
//                 render={({ field }) => (
//                   <input
//                     type="text"
//                     placeholder="Visited Countries (comma separated IDs)"
//                     {...field}
//                     onChange={(e) =>
//                       field.onChange(e.target.value.split(",").map((id) => parseInt(id.trim())))
//                     }
//                     className="w-full p-2 border rounded"
//                   />
//                 )}
//               />

//               <Controller
//                 control={control}
//                 name="DreamCountryIds"
//                 render={({ field }) => (
//                   <input
//                     type="text"
//                     placeholder="Dream Countries (comma separated IDs)"
//                     {...field}
//                     onChange={(e) =>
//                       field.onChange(e.target.value.split(",").map((id) => parseInt(id.trim())))
//                     }
//                     className="w-full p-2 border rounded"
//                   />
//                 )}
//               />

//               <div className="flex justify-end space-x-2 mt-4">
//                 <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">Cancel</button>
//                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }