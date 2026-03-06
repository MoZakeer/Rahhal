const ProfileStatsSkeleton = () => {
  return (
    <div className="mt-6 flex justify-between bg-gray-50 rounded-xl p-4 shadow-sm animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-1 text-center">
          <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
          <div className="h-3 w-16 bg-gray-300 rounded mx-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStatsSkeleton;