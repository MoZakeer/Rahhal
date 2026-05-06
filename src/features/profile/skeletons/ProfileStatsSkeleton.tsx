const ProfileStatsSkeleton = () => {
  return (
    <div className="mt-6 flex justify-between bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 shadow-sm animate-pulse border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-1 text-center">
          {/* الـ Number */}
          <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-2"></div>
          {/* الـ Label */}
          <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded mx-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStatsSkeleton;