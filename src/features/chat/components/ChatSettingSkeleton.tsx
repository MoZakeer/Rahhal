import Skeleton from "react-loading-skeleton";

function ChatSettingsSkeleton() {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
        {/* 1. SettingInfo Skeleton */}
        <div className="w-full flex flex-col items-center gap-6">
          <Skeleton circle width={96} height={96} /> 
          <div className="flex flex-col items-center gap-2">
            <Skeleton width={200} height={28} /> 
            <Skeleton width={250} height={16} /> 
          </div>
        </div>

        {/* 2. Group Members Skeleton */}
        <div className="space-y-6">
          <Skeleton width={100} height={16} className="mb-4" />
          <ul className="space-y-3">
            <MemberSkeleton />
            <MemberSkeleton />
            <MemberSkeleton />
          </ul>
        </div>

        <div className="space-y-6">
          <Skeleton width={120} height={16} className="mb-4" />{" "}
          <ul className="space-y-3">
            <MemberSkeleton />
            <MemberSkeleton />
          </ul>
        </div>

        <div className="mt-8">
          <Skeleton height={48} borderRadius={8} /> 
        </div>
      </div>
    </>
  );
}

function MemberSkeleton() {
  return (
    <li className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3 flex-1 px-2 py-2">
        <div className="shrink-0">
          <Skeleton circle width={40} height={40} />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <Skeleton width={140} height={16} className="mb-1" />
          <Skeleton width={180} height={12} />
        </div>
      </div>

      <div className="ml-3 flex gap-2">
        <Skeleton width={60} height={24} borderRadius={6} />
      </div>
    </li>
  );
}

export default ChatSettingsSkeleton;
