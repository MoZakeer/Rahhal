import { useEffect, useMemo, useState } from "react";

import { fetchFeedVibes } from "../services/vibesApi";

import {
  groupVibesByUser,
  type UserVibesGroup,
  type Vibe,
} from "../data/vibesData";

import VibeAvatarRing from "./VibeAvatarRing";
import FullVibeViewer from "./FullVibeViewer";

const FeedVibesBar = ({ currentUserId }: { currentUserId?: string | null }) => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<{
    groups: UserVibesGroup[];
    groupIndex: number;
  } | null>(null);

  // -------------------
  // FETCH FEED VIBES
  // -------------------

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchFeedVibes();
        setVibes(data);
      } catch (err) {
        console.error("Failed to fetch feed vibes", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -------------------
  // GROUP BY USER
  // -------------------

  const groups = useMemo(() => groupVibesByUser(vibes), [vibes]);

  // -------------------
  // HELPERS
  // -------------------

  const initials = (n: string) =>
    n
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // -------------------
  // VIBE UPDATE — keeps like state alive across open/close cycles
  // Updates the flat vibes array; groups are recomputed via useMemo
  // -------------------

  const handleVibeUpdate = (updatedVibe: Vibe) => {
    setVibes((prev) =>
      prev.map((v) => (v.id === updatedVibe.id ? updatedVibe : v)),
    );

    // Also keep the active viewer's snapshot in sync so the heart
    // doesn't flicker back while the viewer is still open
    setViewer((prev) =>
      prev
        ? {
            ...prev,
            groups: prev.groups.map((group) => ({
              ...group,
              vibes: group.vibes.map((v) =>
                v.id === updatedVibe.id ? updatedVibe : v,
              ),
            })),
          }
        : null,
    );
  };

  // -------------------
  // EMPTY
  // -------------------

  if (!loading && groups.length === 0) {
    return null;
  }

  // -------------------
  // UI
  // -------------------

  return (
    <div className="container mt-2 mx-auto px-4">
      {/* Header Section */}
      <div className="mb-3 px-1">
        <h3 className="font-display text-sm font-semibold tracking-tight text-blue-900">
          Latest Vibes
        </h3>
      </div>

      {/* Active Vibes List */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory">
        {/* LOADING SKELETON */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 shrink-0 animate-pulse"
            >
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          ))}

        {/* ACTIVE VIBES LIST */}
        {!loading &&
          groups.map((g, i) => (
            <div
              key={g.userId}
              className="shrink-0 snap-tight transition-transform duration-200 active:scale-95"
            >
              <VibeAvatarRing
                variant="user"
                src={g.userAvatar}
                fallback={initials(g.userName)}
                label={g.userName.split(" ")[0]}
                onClick={() =>
                  setViewer({
                    groups,
                    groupIndex: i,
                  })
                }
              />
            </div>
          ))}
      </div>

      {/* FULL SCREEN VIEWER */}
      {viewer && (
        <FullVibeViewer
          groups={viewer.groups}
          startGroupIndex={viewer.groupIndex}
          currentUserId={currentUserId ?? null}
          onClose={() => setViewer(null)}
          onVibeUpdate={handleVibeUpdate}
        />
      )}
    </div>
  );
};

export default FeedVibesBar;
