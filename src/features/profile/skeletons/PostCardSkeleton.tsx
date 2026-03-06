// src/features/profile/skeletons/PostCardSkeleton.tsx
import { motion } from "framer-motion";

const PostCardSkeleton: React.FC = () => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow p-4 animate-pulse"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gray-300" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>

      {/* Description */}
      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6 mb-2"></div>

      {/* Media */}
      <div className="w-full h-40 bg-gray-300 rounded-lg mb-2"></div>

      {/* Footer */}
      <div className="flex gap-6 text-sm text-gray-400 mt-2">
        <div className="h-3 w-10 bg-gray-300 rounded"></div>
        <div className="h-3 w-10 bg-gray-300 rounded"></div>
      </div>
    </motion.div>
  );
};

export default PostCardSkeleton;