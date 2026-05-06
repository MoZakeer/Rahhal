const ProfileHeaderSkeleton = () => {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      {/* Avatar Circle */}
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-800" />

      {/* Name and Username Lines */}
      <div className="space-y-2">
        <div className="w-40 h-5 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton;