import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useTheme } from "@/context/ThemeContext";

function ChatSettingsSkeleton() {
  const { theme } = useTheme();

  const baseColor =
    theme === "dark" ? "var(--color-gray-200)" : "var(--color-gray-100)";

  const highlightColor =
    theme === "dark" ? "var(--color-gray-300)" : "var(--color-gray-200)";

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="flex-1 overflow-y-auto px-6 py-8 ">
        <div className="w-full flex flex-col items-center gap-6">
          <Skeleton circle width={112} height={112} />

          <div className="flex flex-col items-center gap-2">
            <Skeleton width={180} height={20} />
            <Skeleton width={220} height={14} />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <Skeleton width={100} height={12} />
          <Skeleton height={42} borderRadius={12} />
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <Skeleton width={120} height={12} />
          <Skeleton height={70} borderRadius={12} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton height={48} borderRadius={12} className="flex-1" />
          <Skeleton height={48} borderRadius={12} className="flex-1" />
        </div>

        {/* 👇 Members زي ما هي */}
        <div className="space-y-6">
          <Skeleton width={100} height={16} className="mb-4" />
          <ul className="space-y-3">
            <MemberSkeleton />
            <MemberSkeleton />
            <MemberSkeleton />
          </ul>
        </div>

        <div className="space-y-6">
          <Skeleton width={120} height={16} className="mb-4" />
          <ul className="space-y-3">
            <MemberSkeleton />
            <MemberSkeleton />
          </ul>
        </div>
      </div>
    </SkeletonTheme>
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
