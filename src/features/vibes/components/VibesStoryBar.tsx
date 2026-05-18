import { useEffect, useMemo, useState } from "react";
import VibeAvatarRing from "./VibeAvatarRing";
import VibeCreator from "./VibeCreator";
import FullVibeViewer from "./FullVibeViewer";

import {
  fetchTripVibes,
  canPostVibe,
  type TripLite,
} from "../services/vibesApi";

import {
  groupVibesByUser,
  type UserVibesGroup,
  type Vibe,
} from "../data/vibesData";

interface VibesStoryBarProps {
  tripId: string;
  trip: TripLite;
  currentUserId?: string | null;
  currentUserName?: string;
  currentUserAvatar?: string;
}

const SEEN_KEY = "rahhal:vibes:seen";

const loadSeen = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const saveSeen = (set: Set<string>) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const VibesStoryBar = ({
  tripId,
  trip,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: VibesStoryBarProps) => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [viewer, setViewer] = useState<{
    groups: UserVibesGroup[];
    groupIndex: number;
  } | null>(null);

  const [seen, setSeen] = useState<Set<string>>(() => loadSeen());

  // -----------------------
  // FETCH FROM API (NO MOCK)
  // -----------------------
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTripVibes(tripId);
        setVibes(data);
      } catch (err) {
        console.error("Failed to load vibes", err);
      }
    };

    load();
  }, [tripId]);

  const groups = useMemo(() => groupVibesByUser(vibes), [vibes]);
  const canPost = canPostVibe(trip, currentUserId);

  // -----------------------
  // SEEN LOGIC
  // -----------------------
  const markGroupSeen = (g: UserVibesGroup) => {
    const next = new Set(seen);
    g.vibes.forEach((v) => next.add(v.id));
    setSeen(next);
    saveSeen(next);
  };

  const isGroupSeen = (g: UserVibesGroup) =>
    g.vibes.every((v) => seen.has(v.id));

  // -----------------------
  // OPEN GROUP VIEWER
  // -----------------------
  const openGroup = (idx: number) => {
    setViewer({ groups, groupIndex: idx });
    markGroupSeen(groups[idx]);
  };

  const openAll = () => {
    if (!groups.length) return;

    const all = [...vibes].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const merged: UserVibesGroup = {
      userId: "__all__",
      userName: "All Vibes",
      userAvatar: "",
      vibes: all,
      lastVibeAt: all.at(-1)?.createdAt ?? new Date().toISOString(),
    };

    const next = new Set(seen);
    all.forEach((v) => next.add(v.id));
    setSeen(next);
    saveSeen(next);

    setViewer({ groups: [merged], groupIndex: 0 });
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="rounded-xl border border-gray-50 bg-card/60 p-3 shadow-card backdrop-blur">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="font-display text-sm font-semibold">Vibes</h3>

        {groups.length > 0 && (
          <button
            onClick={openAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {canPost && (
          <VibeAvatarRing
            variant="add"
            label="Add Vibe"
            fallback="+"
            onClick={() => setCreatorOpen(true)}
          />
        )}

        {groups.map((g, i) => (
          <VibeAvatarRing
            key={g.userId}
            variant="user"
            src={g.userAvatar}
            fallback={initials(g.userName)}
            label={g.userName.split(" ")[0]}
            seen={isGroupSeen(g)}
            onClick={() => openGroup(i)}
          />
        ))}

        {groups.length === 0 && !canPost && (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No vibes shared yet.
          </p>
        )}
      </div>

      {/* Creator */}
      {creatorOpen && (
        <VibeCreator
          tripId={tripId}
          currentUserId={currentUserId ?? "user-1"}
          currentUserName={currentUserName ?? "You"}
          currentUserAvatar={currentUserAvatar ?? ""}
          onClose={() => setCreatorOpen(false)}
        />
      )}

      {/* Viewer */}
      {viewer && (
        <FullVibeViewer
          groups={viewer.groups}
          startGroupIndex={viewer.groupIndex}
          currentUserId={currentUserId ?? null}
          tripOwnerId={trip.ownerId}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
};

export default VibesStoryBar;
