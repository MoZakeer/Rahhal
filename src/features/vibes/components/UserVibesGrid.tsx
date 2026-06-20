import { useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";
import { fetchUserVibes } from "../services/vibesApi";
import {
  groupVibesByUser,
  type UserVibesGroup,
  type Vibe,
} from "../data/vibesData";
import FullVibeViewer from "./FullVibeViewer";

interface UserVibesGridProps {
  userId: string;
  currentUserId?: string | null;
}

const UserVibesGrid = ({ userId, currentUserId }: UserVibesGridProps) => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [viewer, setViewer] = useState<{
    groups: UserVibesGroup[];
    groupIndex: number;
  } | null>(null);

  // -----------------------
  // LOAD FROM API
  // -----------------------
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchUserVibes(userId);
        if (mounted) setVibes(data);
      } catch (err) {
        console.error("Failed to fetch user vibes", err);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const groups = useMemo(
    () => groupVibesByUser(vibes, currentUserId ?? ""),
    [vibes, currentUserId],
  );
  // -----------------------
  // EMPTY STATE
  // -----------------------
  if (vibes.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No vibes yet.
      </p>
    );
  }

  // -----------------------
  // OPEN VIBE VIEWER
  // -----------------------
  const openAt = (vibeId: string) => {
    const sorted = [...vibes].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const idx = sorted.findIndex((v) => v.id === vibeId);

    const merged: UserVibesGroup = {
      userId,
      userName: groups[0]?.userName ?? "User",
      userAvatar: groups[0]?.userAvatar ?? "",
      vibes: sorted,
      lastVibeAt: sorted.at(-1)?.createdAt ?? new Date().toISOString(),
    };

    // start from clicked vibe
    merged.vibes = [...sorted.slice(idx), ...sorted.slice(0, idx)];

    setViewer({
      groups: [merged],
      groupIndex: 0,
    });
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {vibes.map((v) => {
          const thumb = v.mediaUrls?.[0] ?? null;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => openAt(v.id)}
              className="group relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              {/* IMAGE / VIDEO */}
              {thumb ? (
                v.type === "video" ? (
                  <video
                    src={thumb}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] font-medium text-white"
                  style={{
                    background: "var(--gradient-ocean)",
                  }}
                >
                  <span className="line-clamp-4">{v.content}</span>
                </div>
              )}

              {/* VIDEO ICON */}
              {v.type === "video" && (
                <div className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white">
                  <Play className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEWER */}
      {viewer && (
        <FullVibeViewer
          groups={viewer.groups}
          startGroupIndex={viewer.groupIndex}
          currentUserId={currentUserId ?? null}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
};

export default UserVibesGrid;
