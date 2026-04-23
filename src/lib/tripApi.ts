// TripManagement endpoints + adapter from API payloads to the existing UI Trip shape.

import { apiRequest } from "@/lib/api";
import type { Trip, TripDay, Attraction, Hotel, Restaurant, JoinRequest } from "@/data/mockData";

// ---------- API response types ----------

export interface ApiTripTraveler {
  id: string;
  userName: string;
}

export interface ApiTravelPreference {
  id: string;
  name: string;
}

export interface ApiPlanItineraryItem {
  place?: string;
  arrival_time?: string;
  departure_time?: string;
  Duration?: number;
  Ticket_Price?: number;
  Category?: string;
  Government?: string;
  Description?: string;
  Image?: string;
  Location?: string;
  List_of_recommendations?: ApiRecommendation[];
}

export interface ApiRecommendation {
  Name: string;
  Description?: string;
  Image?: string;
  Government?: string;
  Category?: string;
  Location?: string;
  Latitude?: number;
  Longitude?: number;
  "Open Time"?: string;
  "Close Time"?: string;
  "Ticket Price"?: number;
  Duration?: number;
}

export interface ApiTrip {
  tripId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  gender: number;
  tripGender: string;
  numberOfTravelers: number;
  imageUrl: string;
  status: number;
  tripStatus: string;
  budget: number;
  ageGroup: number;
  tripAgeGroup: string;
  profileId: string;
  profileUserName: string;
  destinationId: string;
  destinationName: string;
  countryId: string;
  countryName: string;
  conversationId?: string;
  travelers: ApiTripTraveler[];
  travelPreferences: ApiTravelPreference[];
  planData?: {
    itinerary?: ApiPlanItineraryItem[][];
  } | null;
  isPublic?: boolean;
  isFavorite?: boolean;
  isAiGenerated?: boolean;
}

export interface ApiPendingRequest {
  requestId: string;
  requesterId: string;
  requesterName: string;
  requesterProfilePicture: string;
  createdDate: string;
}

export interface PagedResult<T> {
  items: T[];
  totalRecords: number;
  totalPages: number;
}

// ---------- Endpoints ----------

export const getTripById = (tripId: string, signal?: AbortSignal) =>
  apiRequest<ApiTrip>("/TripManagement/GetById", { query: { TripId: tripId }, signal });

export const deleteTrip = (tripId: string) =>
  apiRequest<{ message?: string } | null>("/TripManagement/Delete", {
    method: "DELETE",
    body: { tripId },
  });

export const changeTripVision = (tripId: string) =>
  apiRequest<{ message: string }>("/TripManagement/ChangeTripVision", {
    method: "PATCH",
    body: { tripId },
  });

export const requestJoinTrip = (tripId: string) =>
  apiRequest<{ requestId: string }>("/TripManagement/RequestJoin", {
    method: "POST",
    body: { tripId },
  });

export const saveTrip = (tripId: string) =>
  apiRequest<{ message: string }>("/TripManagement/SaveTrip", {
    method: "POST",
    body: { tripId },
  });

export interface UpdateTripPayload {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO
  endDate: string; // ISO
  numberOfTravelers: number;
  budget: number;
  gender: number;
  ageGroup: number;
  status: number;
  destinationId: string;
  countryId: string;
  travelPreferencesId: string[];
}

export const updateTrip = (payload: UpdateTripPayload) =>
  apiRequest<null>("/TripManagement/Update", { method: "PATCH", body: payload });

export const getPendingRequests = (
  tripId: string,
  pageNumber = 1,
  pageSize = 20,
  signal?: AbortSignal
) =>
  apiRequest<PagedResult<ApiPendingRequest>>("/TripManagement/GetAllPendingRequests", {
    query: { TripId: tripId, PageNumber: pageNumber, PageSize: pageSize },
    signal,
  });

export type HandleRequestStatus = "Accepted" | "Rejected";

export const handleJoinRequest = (requestId: string, newStatus: HandleRequestStatus) =>
  apiRequest<{ requestId: string; newStatus: string }>("/TripManagement/HandleRequest", {
    method: "POST",
    body: { requestId, newStatus },
  });

// ---------- Adapter: ApiTrip -> UI Trip ----------

const slugifyId = (s: string, i: number) => `${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`;

const flattenItinerary = (api: ApiTrip): TripDay[] => {
  const days = api.planData?.itinerary ?? [];
  return days.map((slots, idx) => {
    const activities = slots
      .map((s) => s.place || s.Category || "")
      .filter(Boolean) as string[];
    const description = slots
      .map((s) => s.Description)
      .filter(Boolean)
      .slice(0, 1)
      .join(" ");
    return {
      day: idx + 1,
      title: `Day ${idx + 1}`,
      description: description || `${slots.length} planned stop${slots.length === 1 ? "" : "s"}`,
      activities,
    };
  });
};

const collectAttractions = (api: ApiTrip): Attraction[] => {
  const out: Attraction[] = [];
  const seen = new Set<string>();
  const days = api.planData?.itinerary ?? [];
  days.forEach((slots, di) => {
    slots.forEach((slot, si) => {
      (slot.List_of_recommendations ?? []).forEach((r, ri) => {
        const cat = (r.Category || "").toLowerCase();
        if (cat.includes("hotel") || cat.includes("restaurant") || cat.includes("cafe")) return;
        const key = `${r.Name}-${r.Location}`;
        if (seen.has(key)) return;
        seen.add(key);
        out.push({
          id: slugifyId(r.Name || `attraction-${di}-${si}-${ri}`, ri),
          name: r.Name,
          description: r.Description ?? "",
          image: r.Image || "",
          location: r.Government ?? api.destinationName,
          category: r.Category ?? "Place",
        });
      });
    });
  });
  return out;
};

const collectByCategory = <T,>(
  api: ApiTrip,
  match: (cat: string) => boolean,
  build: (r: ApiRecommendation, key: string) => T
): T[] => {
  const out: T[] = [];
  const seen = new Set<string>();
  const days = api.planData?.itinerary ?? [];
  days.forEach((slots) => {
    slots.forEach((slot) => {
      (slot.List_of_recommendations ?? []).forEach((r, ri) => {
        const cat = (r.Category || "").toLowerCase();
        if (!match(cat)) return;
        const key = `${r.Name}-${r.Location}`;
        if (seen.has(key)) return;
        seen.add(key);
        out.push(build(r, slugifyId(r.Name || `item-${ri}`, ri)));
      });
    });
  });
  return out;
};

const collectHotels = (api: ApiTrip): Hotel[] =>
  collectByCategory(
    api,
    (cat) => cat.includes("hotel"),
    (r, id) => ({
      id,
      name: r.Name,
      description: r.Description ?? "",
      image: r.Image || "",
      rating: 4.5,
      reviewsCount: 0,
      pricePerNight: r["Ticket Price"] ? `$${r["Ticket Price"]}` : "—",
      location: r.Government ?? api.destinationName,
    })
  );

const collectRestaurants = (api: ApiTrip): Restaurant[] =>
  collectByCategory(
    api,
    (cat) => cat.includes("restaurant") || cat.includes("cafe"),
    (r, id) => ({
      id,
      name: r.Name,
      description: r.Description ?? "",
      image: r.Image || "",
      rating: 4.5,
      reviewsCount: 0,
      cuisine: r.Category ?? "Local",
      priceRange: r["Ticket Price"] && r["Ticket Price"] > 30 ? "$$$" : "$$",
    })
  );

export const mapApiTripToTrip = (api: ApiTrip): Trip => {
  const initials = (api.profileUserName || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    id: api.tripId,
    name: api.name,
    destination: [api.destinationName, api.countryName].filter(Boolean).join(", "),
    description: api.description ?? "",
    startDate: api.startDate,
    endDate: api.endDate,
    travelers: api.numberOfTravelers,
    image: api.imageUrl || "",
    isPublic: api.isPublic ?? true,
    isFavorite: api.isFavorite ?? false,
    createdBy: api.profileUserName,
    createdByAvatar: initials,
    tags: api.travelPreferences?.map((p) => p.name) ?? [],
    budget: api.budget ? `$${api.budget}` : undefined,
    itinerary: flattenItinerary(api),
    isAiGenerated: api.isAiGenerated ?? Boolean(api.planData?.itinerary?.length),
    attractions: collectAttractions(api),
    hotels: collectHotels(api),
    restaurants: collectRestaurants(api),
    events: [],
    joinRequests: [],
  };
};

export const mapPendingToJoinRequest = (p: ApiPendingRequest): JoinRequest => {
  const initials = (p.requesterName || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    id: p.requestId,
    userName: p.requesterName,
    userAvatar: initials,
    message: "",
    requestedAt: p.createdDate,
    status: "pending",
  };
};
