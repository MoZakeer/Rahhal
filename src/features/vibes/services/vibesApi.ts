// Mock API layer for the Vibes feature.
// Designed to be swapped with real endpoints later (and SignalR for realtime).
import {
  mockVibes,
  type Vibe,
  type VibeComment,
  type VibeType,
  getVibesByTrip,
  getVibesByUser,
  getAllVibes,
} from "../data/vibesData";

// In-memory store (mock).
let store: Vibe[] = [...mockVibes];

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

// Subscribers — placeholder for SignalR-like realtime updates.
type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => l());
export const subscribeVibes = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// ----- Reads -----
export async function fetchTripVibes(tripId: string): Promise<Vibe[]> {
  await delay();
  return store.filter((v) => v.tripId === tripId);
}

export async function fetchUserVibes(userId: string): Promise<Vibe[]> {
  await delay();
  return store.filter((v) => v.userId === userId);
}

export async function fetchFeedVibes(): Promise<Vibe[]> {
  await delay();
  return [...store].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Sync helpers (for components that don't need async)
// export const tripVibesSync = (tripId: string) => getVibesByTrip(tripId);
// export const userVibesSync = (userId: string) => getVibesByUser(userId);
// export const allVibesSync = () => getAllVibes();

export const tripVibesSync = (tripId: string) => store.filter((v) => v.tripId === tripId);
export const userVibesSync = (userId: string) => store.filter((v) => v.userId === userId);
export const allVibesSync = () => [...store];

// ----- Mutations -----
export interface CreateVibeInput {
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: VibeType;
  content?: string;
  mediaUrls: string[];
}

export async function createVibe(input: CreateVibeInput): Promise<Vibe> {
  await delay();
  const vibe: Vibe = {
    id: uid(),
    ...input,
    reactions: { emoji: "❤️", count: 0, userReacted: false },
    commentsCount: 0,
    comments: [],
    createdAt: new Date().toISOString(),
  };
  store = [vibe, ...store];
  notify();
  return vibe;
}

export async function deleteVibe(id: string): Promise<void> {
  await delay();
  store = store.filter((v) => v.id !== id);
  notify();
}

export async function updateVibe(
  id: string,
  patch: Partial<Pick<Vibe, "content" | "mediaUrls" | "type">>
): Promise<Vibe | null> {
  await delay();
  const idx = store.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...patch };
  notify();
  return store[idx];
}

export async function toggleReaction(vibeId: string): Promise<Vibe | null> {
  await delay(120);
  const idx = store.findIndex((v) => v.id === vibeId);
  if (idx === -1) return null;
  const v = store[idx];
  const reacted = !v.reactions.userReacted;
  store[idx] = {
    ...v,
    reactions: {
      ...v.reactions,
      userReacted: reacted,
      count: v.reactions.count + (reacted ? 1 : -1),
    },
  };
  notify();
  return store[idx];
}

export async function addComment(
  vibeId: string,
  comment: Omit<VibeComment, "id" | "createdAt">
): Promise<VibeComment | null> {
  await delay(150);
  const idx = store.findIndex((v) => v.id === vibeId);
  if (idx === -1) return null;
  const c: VibeComment = {
    ...comment,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  const v = store[idx];
  store[idx] = {
    ...v,
    comments: [...v.comments, c],
    commentsCount: v.commentsCount + 1,
    latestComment: c,
  };
  notify();
  return c;
}

// ----- Permissions -----
export interface TripLite {
  ownerId?: string; // admin
  memberIds?: string[];
}

export const canPostVibe = (trip: TripLite | null, userId?: string | null) => {
  if (!userId || !trip) return false;
  if (trip.ownerId === userId) return true;
  return Boolean(trip.memberIds?.includes(userId));
};

export const canEditVibe = (vibe: Vibe, userId?: string | null) =>
  Boolean(userId && vibe.userId === userId);

// Owner-only delete. Trip admins are intentionally NOT granted delete rights.
export const canDeleteVibe = (
  vibe: Vibe,
  userId?: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _trip?: TripLite | null
) => Boolean(userId && vibe.userId === userId);

// TODO: Hook up SignalR here for realtime vibe/reaction/comment updates.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useVibesRealtime(_tripId?: string) {
  // placeholder
}
