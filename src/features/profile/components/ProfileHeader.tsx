// import Button from "../../../shared/components/button";
// import type { Profile } from "../types/profile.types";
// // import Image from "../../../../public/avater.png";
// import { IoSettingsOutline } from "react-icons/io5";
// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// // import { Edit } from "lucide-react";
// import EditProfileForm from "./EditProfileForm";
// // const profile: Profile = {
// //   name: "Mohamed Abdelnaser",
// //   location: "📍 San Francisco, CA",
// //   bio: "✈️ Travel enthusiast | 🌍 8 countries & counting | 📸 Capturing moments",
// //   avatar: Image,
// // };

// const ProfileHeader: React.FC = () => {
//   const [userData, setUserData] = useState<Profile | undefined>(undefined)
//   const [ismodelOpen, setIsModelOpen] = useState(false)
//   const openModal = () => setIsModelOpen(true);
//   const closeModal = () => setIsModelOpen(false);

//   const handleUpdate = (updatedData: Profile) => {
//     setUserData(updatedData);
//     // هنا كمان ممكن تعملي API call لتحديث البيانات على السيرفر
//   };
//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await axios.post('https://rahhal-api.runasp.net/Profile/GetProfile', {
//         "ProfileId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
//       })
//       setUserData(res.data)
//     }
//     fetchData()
//   }, [])
//   return (
//     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//       {/* Left side: Avatar + Info */}
//       <div className="flex flex-col md:flex-row md:items-center gap-3">
//         <img
//           src={userData?.profilePicture}
//           alt={userData?.fullName}
//           width={100}
//           height={100}
//           className="rounded-full object-cover"
//         />

//         <div>
//           <h2 className="text-base font-bold">{userData?.userName}</h2>
//           <p className="text-xs text-gray-500">{userData?.location}</p>
//           <p className="mt-1 text-sm text-gray-700 leading-tight">
//             {userData?.bio}
//           </p>

//           {/* Buttons — Mobile only */}
//           <div className="mt-3 flex gap-2 md:hidden">
//             <Button onClick={openModal}>Edit</Button>
//             <Button variant="outline">Share</Button>
//             <Link to='/settings'>
//               <Button variant="outline">
//                 <IoSettingsOutline className="w-5 h-5" />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Buttons — Desktop only */}
//       <div className="hidden md:flex gap-2">
//         <Button onClick={openModal}>Edit</Button>
//         <Button variant="outline">Share</Button>
//         <Button variant="outline">
//           <IoSettingsOutline className="w-5 h-5" />
//         </Button>
//       </div>
//       <EditProfileForm isOpen={ismodelOpen} closeModal={closeModal} userData={userData} onUpdate={handleUpdate} />
//     </div>
//   );
// };

// export default ProfileHeader;
