import { useEffect, useMemo, useState } from "react";
import { allVibesSync, subscribeVibes } from "../services/vibesApi";
import { groupVibesByUser, type UserVibesGroup } from "../data/vibesData";
import VibeAvatarRing from "./VibeAvatarRing";
import FullVibeViewer from "./FullVibeViewer";

const FeedVibesBar = ({ currentUserId }: { currentUserId?: string | null }) => {
  const [vibes, setVibes] = useState(() => allVibesSync());
  const [viewer, setViewer] = useState<{
    groups: UserVibesGroup[];
    groupIndex: number;
  } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVibes(allVibesSync());
    const unsub = subscribeVibes(() => setVibes(allVibesSync()));
    return () => {
      unsub();
    };
  }, []);

  const groups = useMemo(() => groupVibesByUser(vibes), [vibes]);

  if (groups.length === 0) return null;

  const initials = (n: string) =>
    n
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="container mt-6">
      <div className="rounded-xl border border-gray-100 bg-card/60 p-3 shadow-card backdrop-blur">
        <h3 className="mb-2 px-1 font-display text-sm font-semibold">
          Latest Vibes
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {groups.map((g, i) => (
            <VibeAvatarRing
              key={g.userId}
              variant="user"
              src={g.userAvatar}
              fallback={initials(g.userName)}
              label={g.userName.split(" ")[0]}
              onClick={() => setViewer({ groups, groupIndex: i })}
            />
          ))}
        </div>
      </div>

      {viewer && (
        <FullVibeViewer
          groups={viewer.groups}
          startGroupIndex={viewer.groupIndex}
          currentUserId={currentUserId ?? null}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
};

export default FeedVibesBar;
