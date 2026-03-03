// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { motion } from "framer-motion";
// import { useProfileStore } from "../store/profile.store";
// import type { UpdateProfileRequest } from "../types/profile.types";

// export default function EditProfilePage() {
//     const { profile, updateProfile } = useProfileStore();
//     const { register, handleSubmit, setValue } = useForm<UpdateProfileRequest>();
//     const [previewImage, setPreviewImage] = useState<string | null>(null);
//     const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
//     const [dreamCountries, setDreamCountries] = useState<string[]>([]);
//     const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
//     const [selectedPersonality, setSelectedPersonality] = useState<string>("");

//     const [allCountries, setAllCountries] = useState<string[]>([]);

//     useEffect(() => {
//         const fetchCountries = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 const res = await fetch(
//                     "https://rahhal-api.runasp.net/Country/GetAll?SortByLastAdded=true",
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );
//                 const data = await res.json();
//                 console.log("hello")
//                 setAllCountries(data || []);
//                 console.log("Fetched countries:", data);
//             } catch (error) {
//                 console.error("Error fetching countries:", error);
//             }
//         };

//         fetchCountries();
//         console.log("All countries state:", allCountries);
//         console.log("Profile data:", profile);
//     }, []);



//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onloadend = () => setPreviewImage(reader.result as string);
//         reader.readAsDataURL(file);
//     };

//     const togglePreference = (pref: string) => {
//         setSelectedPreferences((prev) =>
//             prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
//         );
//     };

//     const onSubmit = async (data: UpdateProfileRequest) => {
//         // Append selected personality & preferences
//         data.TravelPersonality = selectedPersonality;
//         data.TravelPreferenceIds = selectedPreferences;

//         if (previewImage) data.ProfilePicture = previewImage;

//         // Arrays for countries
//         data.VisitedCountryIds = visitedCountries.map(Number);
//         data.DreamCountryIds = dreamCountries.map(Number);

//         await updateProfile(data);
//         alert("Profile updated!");
//     };

//     if (!profile) return <div className="text-center py-10">Loading...</div>;

//     const travelPreferences = [
//         "Adventure",
//         "Nature",
//         "Beach",
//         "Culture",
//         "Shopping",
//         "Nightlife",
//         "Foodie",
//         "Luxury",
//     ];

//     const travelPersonalities = [
//         "Explorer",
//         "Relaxer",
//         "Social Traveler",
//         "Backpacker",
//         "Luxury Traveler",
//     ];

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-3xl mx-auto p-6 space-y-8 bg-white rounded-3xl shadow-lg"
//         >
//             {/* Profile Photo */}
//             <div className="flex flex-col items-center gap-4">
//                 <motion.img
//                     src={previewImage || "/avater.png"}
//                     alt="Profile"
//                     className="w-24 h-24 rounded-full object-cover border-4 border-cyan-300"
//                     whileHover={{ scale: 1.05 }}
//                 />
//                 <input type="file" onChange={handleFileChange} />
//             </div>

//             <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
//                 {/* Basic Info */}
//                 <div className="space-y-2">
//                     <h3 className="text-lg font-semibold text-gray-800">Basic Info</h3>
//                     <div className="flex gap-4">
//                         <motion.input
//                             {...register("Fname")}
//                             placeholder="First Name"
//                             className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
//                             whileFocus={{ scale: 1.02 }}
//                         />
//                         <motion.input
//                             {...register("Lname")}
//                             placeholder="Last Name"
//                             className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
//                             whileFocus={{ scale: 1.02 }}
//                         />
//                     </div>
//                     <motion.select
//                         {...register("Gender")}
//                         className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
//                     >
//                         <option value="">Select Gender</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                     </motion.select>
//                 </div>

//                 {/* Travel Preferences */}
//                 <div className="space-y-2">
//                     <h3 className="text-lg font-semibold text-gray-800">Travel Preferences</h3>
//                     <div className="flex flex-wrap gap-2">
//                         {travelPreferences.map((pref) => (
//                             <motion.button
//                                 key={pref}
//                                 type="button"
//                                 onClick={() => togglePreference(pref)}
//                                 className={`px-4 py-2 border rounded-full text-sm transition ${selectedPreferences.includes(pref)
//                                         ? "bg-cyan-600 text-white border-cyan-600"
//                                         : "hover:bg-cyan-100"
//                                     }`}
//                                 whileHover={{ scale: 1.05 }}
//                             >
//                                 {pref}
//                             </motion.button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Travel Personality */}
//                 <div className="space-y-2">
//                     <h3 className="text-lg font-semibold text-gray-800">Travel Personality</h3>
//                     <div className="flex gap-2">
//                         {travelPersonalities.map((person) => (
//                             <motion.button
//                                 key={person}
//                                 type="button"
//                                 onClick={() => setSelectedPersonality(person)}
//                                 className={`flex-1 p-3 border rounded-xl text-sm transition ${selectedPersonality === person
//                                         ? "bg-cyan-600 text-white border-cyan-600"
//                                         : "hover:bg-cyan-100"
//                                     }`}
//                                 whileHover={{ scale: 1.02 }}
//                             >
//                                 {person}
//                             </motion.button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Geography */}
//                 <div className="space-y-2">
//                     <h3 className="text-lg font-semibold text-gray-800">Geography</h3>
//                     <input
//                         placeholder="Visited Countries (comma separated)"
//                         value={visitedCountries.join(", ")}
//                         onChange={(e) =>
//                             setVisitedCountries(e.target.value.split(",").map((c) => c.trim()))
//                         }
//                         className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
//                     />
//                     <input
//                         placeholder="Dream Destinations (comma separated)"
//                         value={dreamCountries.join(", ")}
//                         onChange={(e) =>
//                             setDreamCountries(e.target.value.split(",").map((c) => c.trim()))
//                         }
//                         className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
//                     />
//                 </div>

//                 <div className="flex justify-end">
//                     <button
//                         type="submit"
//                         className="px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition"
//                     >
//                         Save Profile
//                     </button>
//                 </div>
//             </form>
//         </motion.div>
//     );
// }