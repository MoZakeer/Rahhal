import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useProfileStore } from "../../profile/store/profile.store"; 
import {
  groupVibesByUser,
  type UserVibesGroup,
  type Vibe,
} from "../../vibes/data/vibesData";
import VibeAvatarRing from "../../vibes/components/VibeAvatarRing";
import FullVibeViewer from "../../vibes/components/FullVibeViewer";
import { Compass, ArrowRight } from "lucide-react"; // إضافة السهم اللطيف للتوجيه

interface ProfileVibesHighlightsProps {
  profileId: string;
  currentUserId: string | null;
}

export default function ProfileVibesHighlights({
  profileId,
  currentUserId,
}: ProfileVibesHighlightsProps) {
  const { profile } = useProfileStore();
  const navigate = useNavigate();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<{
    groups: UserVibesGroup[];
    groupIndex: number;
  } | null>(null);

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const myProfileId = parsedAuth?.profileId || "";
  const isMyProfile = myProfileId === profileId;

  // ProfileData doesn't have `id` property — use `profileId` if available, otherwise fall back to the provided prop
  const targetUserId = profile?.profileId || profileId || "";

  useEffect(() => {
    if (!targetUserId) return;
    
    let mounted = true;
    const loadVibes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const res = await fetch(
          `https://rahhal-api.runasp.net/Vibes/GetByUserId?UserId=${targetUserId}&PageNumber=1&PageSize=20&VibesOnly=true`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              Accept: "application/json"
            },
          }
        );
        
        const result = await res.json();
        
        if (mounted && result?.isSuccess && result?.data?.items) {
          const mappedVibes = result.data.items.map((item: any) => ({
            id: item.id,
            userId: item.userId,
            userName: item.userName,
            userAvatar: item.profileUrl, 
            content: item.description,   
            type: (item.mediaUrLs && item.mediaUrLs[0]?.url?.endsWith(".mp4")) ? "video" : "image",
            mediaUrLs: item.mediaUrLs || [],
            isLiked: item.isLiked,
            isSaved: item.isSaved,
            likes: item.likes || 0,
            comments: item.comments || 0,
            createdDate: item.createdDate,
            tripId: item.tripId
          }));
          
          setVibes(mappedVibes);
        }
      } catch (err) {
        console.error("Failed to fetch user vibes via Swagger endpoint", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadVibes();

    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  const groups = useMemo(() => {
    if (vibes.length === 0) return [];
    return groupVibesByUser(vibes, currentUserId ?? "");
  }, [vibes, currentUserId]);

  if (loading) {
    return (
      <div className="w-full px-2 py-2 flex flex-col gap-3 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded-sm" />
        <div className="flex gap-4 py-1">
          <div className="h-16 w-16 rounded-full bg-gray-200/70 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (groups.length === 0 && !isMyProfile) return null;

  return (
    <>
      <div className="w-full px-2 py-2 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
          Pinned Vibes
        </h3>
        
        <div className="w-full py-1">
          {groups.length > 0 ? (
            /* عرض قائمة الستوريز الدائرية في حالة وجود داتا */
            <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
              {groups.map((group, index) => (
                <div
                  key={group.userId}
                  className="flex flex-col items-center shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <VibeAvatarRing
                    variant="user"
                    src={group.userAvatar}
                    fallback={group.userName ? group.userName.substring(0, 2).toUpperCase() : "VB"}
                    label={group.userName || "Vibe"}
                    seen={false}
                    onClick={() =>
                      setViewer({
                        groups,
                        groupIndex: index,
                      })
                    }
                  />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 mt-2 max-w-[68px] truncate text-center">
                    Memories
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* 🚀 الـ UI المودرن والأكبر: تصميم بانر عريض وجذاب على ستايل الـ Bento Grid */
            <button
              onClick={() => navigate("/my-trips")}
              className="group flex w-full items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/20 dark:from-zinc-900/40 dark:to-zinc-900/10 hover:from-gray-100/70 hover:to-blue-50/40 dark:hover:from-zinc-800/60 dark:hover:to-zinc-800/30 rounded-2xl transition-all duration-300 active:scale-[0.99] border border-dashed border-gray-200 dark:border-zinc-800 text-left focus:outline-none"
            >
              <div className="flex items-center gap-4">
                {/* الدائرة الزجاجية للأيقونة - حجم أكبر ومودرن */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700/50 text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <Compass className="h-5 w-5 stroke-[1.8] animate-spin-slow group-hover:text-blue-600" />
                </div>
                
                {/* النصوص بحجم أكبر وتنسيق فخم */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-200 tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Share your travel moments
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 max-w-[260px] sm:max-w-none leading-normal">
                    Your posted vibes within active trips will automatically group here.
                  </span>
                </div>
              </div>

              {/* سهم جانبي ناعم يعطي إيحاء بالحركة والدخول لصفحة الرحلات */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent group-hover:bg-white dark:group-hover:bg-zinc-800 group-hover:shadow-sm text-gray-400 group-hover:text-blue-500 transition-all duration-300 transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4 stroke-[2]" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Viewer Modal */}
      {viewer && (
        <FullVibeViewer
          groups={viewer.groups}
          startGroupIndex={viewer.groupIndex}
          currentUserId={currentUserId}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}