import { useTheme } from "@/context/ThemeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ChatItemSkeleton() {
  const { theme } = useTheme();

  const baseColor = theme === "dark" ? "#1f2937" : "#f3f4f6";
  const highlightColor = theme === "dark" ? "#374151" : "#e5e7eb";
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg w-full">
      <div className="shrink-0">
        <Skeleton
          circle
          width={48}
          height={48}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      <div className="flex flex-col flex-1 w-full justify-center">
        <Skeleton
          width="40%"
          height={20}
          baseColor={baseColor}
          highlightColor={highlightColor}
          className="mb-1"
        />

        <Skeleton
          width="80%"
          height={16}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      <div className="ml-auto shrink-0">
        <Skeleton
          circle
          width={24}
          height={24}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>
    </div>
  );
}

export default ChatItemSkeleton;
