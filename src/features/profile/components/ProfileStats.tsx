import { motion } from "framer-motion";
import { useProfileStore } from "../store/profile.store";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

interface Props {
  profileId?: string;
}

const ProfileStats: React.FC<Props> = ({ profileId }) => {
  const { profile } = useProfileStore();

  
  if (!profile) return null;
  console.log(profileId)
   
  const statsToShow = [
    { label: "Countries", value: profile.countriesCount || 0 },
    { label: "Followers", value: profile.followersCount || 0 },
    { label: "Following", value: profile.followingCount || 0 },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-6 flex justify-between bg-gray-50 rounded-xl p-4 shadow-sm"
    >
      {statsToShow.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          whileHover={{ scale: 1.05 }}
          className="flex-1 text-center cursor-pointer"
        >
          <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProfileStats;