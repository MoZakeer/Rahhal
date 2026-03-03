import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ChatItemSkeleton() {
  return (
    // نفس المسافات والـ padding بتاعة ChatItem بالظبط
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg w-full">
      {/* 1. محاكاة الـ Avatar */}
      <div className="shrink-0">
        <Skeleton circle width={48} height={48} />
      </div>

      {/* 2. محاكاة الاسم والرسالة الأخيرة */}
      <div className="flex flex-col flex-1 w-full justify-center">
        {/* الاسم (عرضه 40% عشان يبان كأنه اسم شخص) */}
        <Skeleton width="40%" height={20} className="mb-1" />

        {/* الرسالة الأخيرة (عرضها 80% عشان تبان كأنها سطر طويل) */}
        <Skeleton width="80%" height={16} />
      </div>

      {/* 3. محاكاة دايرة الرسايل غير المقروءة (على اليمين خالص) */}
      <div className="ml-auto shrink-0">
        <Skeleton circle width={24} height={24} />
      </div>
    </div>
  );
}

export default ChatItemSkeleton;
