import { motion } from "framer-motion";
import { useProfileStore } from "../store/profile.store";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const ProfileStats = () => {
  const { profile } = useProfileStore();

  if (!profile) return null; // guard against null profile

  // pick only the last three stats you want to display
if (!profile || !("countriesCount" in profile)) return null;

const statsToShow = [
  { label: "Countries", value: profile.countriesCount },
  { label: "Followers", value: profile.followersCount },
  { label: "Following", value: profile.followingCount },
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