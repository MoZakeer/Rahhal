import { useCallback, useEffect, useMemo, useState } from "react";

import VibeAvatarRing from "./VibeAvatarRing";
import VibeCreator from "./VibeCreator";
import FullVibeViewer from "./FullVibeViewer";

import {
  fetchTripVibesByTripId,
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
  onOpen?: () => void;
  onClose?: () => void;
}

const getSeenKey = (tripId: string) => `rahhal:vibes:seen:${tripId}`;

const loadSeen = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const saveSeen = (key: string, set: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {}
};

const VibesStoryBar = ({
  tripId,
  trip,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onOpen,
  onClose
}: VibesStoryBarProps) => {
  // ---------------- STATE ----------------
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [viewer, setViewer] = useState<{
    groups: UserVibesGroup[];
    groupIndex: number;
  } | null>(null);
  useEffect(() => {
  if (viewer) {
    onOpen?.();
  } else {
    onClose?.();
  }
}, [viewer]);

  const seenKey = useMemo(() => getSeenKey(tripId), [tripId]);

  const [seen, setSeen] = useState<Set<string>>(() =>
    loadSeen(getSeenKey(tripId))
  );

  const canPost = canPostVibe(trip, currentUserId);

  // ---------------- FETCH ----------------
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchTripVibesByTripId(tripId);
        if (mounted) setVibes(data);
      } catch (err) {
        console.error("Failed to load vibes", err);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [tripId]);

  // ---------------- DERIVED DATA ----------------
  const groups = useMemo(
    () => groupVibesByUser(vibes),
    [vibes]
  );

  // ---------------- SEEN LOGIC ----------------
  const markGroupSeen = useCallback(
    (group: UserVibesGroup) => {
      setSeen((prev) => {
        const next = new Set(prev);
        group.vibes.forEach((v) => next.add(v.id));
        saveSeen(seenKey, next);
        return next;
      });
    },
    [seenKey]
  );

  const isGroupSeen = useCallback(
    (group: UserVibesGroup) =>
      group.vibes.every((v) => seen.has(v.id)),
    [seen]
  );

  // ---------------- UPDATE VIBE ----------------
  const handleVibeUpdate = useCallback((updated: Vibe) => {
    setVibes((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : v))
    );

    setViewer((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        groups: prev.groups.map((g) => ({
          ...g,
          vibes: g.vibes.map((v) =>
            v.id === updated.id ? updated : v
          ),
        })),
      };
    });
  }, []);

  // ---------------- OPEN GROUP ----------------
  const openGroup = useCallback(
    (idx: number) => {
      setViewer({ groups, groupIndex: idx });
      markGroupSeen(groups[idx]);
    },
    [groups, markGroupSeen]
  );

  // ---------------- OPEN ALL ----------------
  const openAll = useCallback(() => {
    if (!groups.length) return;

    const all = [...vibes].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    const merged: UserVibesGroup = {
      userId: "__all__",
      userName: "All Vibes",
      userAvatar: "",
      vibes: all,
      lastVibeAt:
        all.at(-1)?.createdAt ?? new Date().toISOString(),
    };

    setSeen((prev) => {
      const next = new Set(prev);
      all.forEach((v) => next.add(v.id));
      saveSeen(seenKey, next);
      return next;
    });

    setViewer({ groups: [merged], groupIndex: 0 });
  }, [groups, vibes, seenKey]);

  // ---------------- UTILS ----------------
  const initials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, []);

  // ---------------- RENDER ----------------
  return (
  <div
    className="
      rounded-2xl
      border border-slate-200/70
      dark:border-slate-700/60
      bg-white/80
      dark:bg-slate-900
      
      p-3
      shadow-sm
      dark:shadow-black/20
      transition-colors duration-300
    "
  >
    {/* HEADER */}
    <div className="mb-3 flex items-center justify-between px-1">
      <h3
        className="
          font-display text-sm font-semibold
          text-slate-800
          dark:text-slate-100
        "
      >
        Vibes
      </h3>

      {groups.length > 0 && (
        <button
          onClick={openAll}
          className="
            text-xs font-medium
            text-blue-600
            dark:text-blue-400
            hover:text-blue-700
            dark:hover:text-blue-300
            transition-colors
          "
        >
          View All
        </button>
      )}
    </div>

    {/* AVATARS */}
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
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
        <p
          className="
            px-2 py-4 text-xs
            text-slate-500
            dark:text-slate-400
          "
        >
          No vibes shared yet.
        </p>
      )}
    </div>

    {/* CREATOR */}
    {creatorOpen && (
      <VibeCreator
        tripId={tripId}
        currentUserId={currentUserId ?? "user-1"}
        currentUserName={currentUserName ?? "You"}
        currentUserAvatar={currentUserAvatar ?? ""}
        onClose={() => setCreatorOpen(false)}
      />
    )}

    {/* VIEWER */}
    {viewer && (
      <FullVibeViewer
        groups={viewer.groups}
        startGroupIndex={viewer.groupIndex}
        currentUserId={currentUserId ?? null}
        tripOwnerId={trip.ownerId}
        onClose={() => setViewer(null)}
        onVibeUpdate={handleVibeUpdate}
      />
    )}
  </div>
);
};

export default VibesStoryBar;