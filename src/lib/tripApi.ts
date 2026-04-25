// TripManagement endpoints + adapter from API payloads to the existing UI Trip shape.

import { apiRequest } from "@/lib/api";
import type { Trip, TripDay, ItineraryStop, Attraction, Hotel, Restaurant, JoinRequest } from "@/types/trip";

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

// Manual trips (withPlan = false) — recommendations grouped by type.
export interface ApiManualRecommendationItem {
  name: string;
  description?: string;
  image?: string;
  location?: string;
  category?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
  ticketPrice?: number;
  duration?: number;
  rating?: number;
  reviewsCount?: number;
  pricePerNight?: string | number;
  cuisine?: string;
  priceRange?: string;
}

export interface ApiManualRecommendations {
  attractions?: ApiManualRecommendationItem[];
  hotels?: ApiManualRecommendationItem[];
  restaurants?: ApiManualRecommendationItem[];
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
  withPlan?: boolean;
  planData?: {
    itinerary?: ApiPlanItineraryItem[][];
  } | null;
  recommendations?: ApiManualRecommendations | null;
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

// Filter values used by the backend's GetById endpoint.
// Adjust if the backend documents different semantics.
export type TripDetailsFilter = "all" | "attractions" | "hotels" | "restaurants";

export const filterToParam = (f: TripDetailsFilter): number | undefined => {
  switch (f) {
    case "attractions":
      return 0;
    case "hotels":
      return 1;
    case "restaurants":
      return 2;
    case "all":
    default:
      return undefined;
  }
};

export const getTripById = (
  tripId: string,
  filter?: TripDetailsFilter,
  signal?: AbortSignal
) =>
  apiRequest<ApiTrip>("/TripManagement/GetById", {
    query: { TripId: tripId, Filter: filterToParam(filter ?? "all") },
    signal,
  });

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
  startDate: string;
  endDate: string;
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
    const stops: ItineraryStop[] = slots.map((s) => ({
      place: s.place || s.Category || "",
      arrivalTime: s.arrival_time,
      departureTime: s.departure_time,
      duration: s.Duration,
      ticketPrice: s.Ticket_Price,
      category: s.Category,
      government: s.Government,
      description: s.Description,
      image: s.Image,
      mapsUrl: s.Location,
      recommendations: (s.List_of_recommendations ?? []).map((r, ri) => 
        recoToAttraction(r, `reco-${idx}-${ri}`, api.destinationName)
      )
    }));
    const activities = stops
      .map((s) => s.place || s.category || "")
      .filter(Boolean) as string[];
    const description = stops
      .map((s) => s.description)
      .filter(Boolean)
      .slice(0, 1)
      .join(" ");
    return {
      day: idx + 1,
      title: `Day ${idx + 1}`,
      description: description || `${slots.length} planned stop${slots.length === 1 ? "" : "s"}`,
      activities,
      stops,
    };
  });
};

const recoToAttraction = (r: ApiRecommendation, id: string, fallbackLocation: string): Attraction => ({
  id,
  name: r.Name,
  description: r.Description ?? "",
  image: r.Image || "",
  location: r.Government ?? fallbackLocation,
  category: r.Category ?? "Place",
  mapsUrl: r.Location,
  latitude: r.Latitude,
  longitude: r.Longitude,
  openTime: r["Open Time"],
  closeTime: r["Close Time"],
  ticketPrice: r["Ticket Price"],
  duration: r.Duration,
});

const recoToHotel = (r: ApiRecommendation, id: string, fallbackLocation: string): Hotel => ({
  id,
  name: r.Name,
  description: r.Description ?? "",
  image: r.Image || "",
  rating: 4.5,
  reviewsCount: 0,
  pricePerNight: r["Ticket Price"] ? `$${r["Ticket Price"]}` : "—",
  location: r.Government ?? fallbackLocation,
  mapsUrl: r.Location,
  latitude: r.Latitude,
  longitude: r.Longitude,
  openTime: r["Open Time"],
  closeTime: r["Close Time"],
});

const recoToRestaurant = (r: ApiRecommendation, id: string, fallbackLocation: string): Restaurant => ({
  id,
  name: r.Name,
  description: r.Description ?? "",
  image: r.Image || "",
  rating: 4.5,
  reviewsCount: 0,
  cuisine: r.Category ?? "Local",
  priceRange: r["Ticket Price"] && r["Ticket Price"] > 30 ? "$$$" : "$$",
  location: r.Government ?? fallbackLocation,
  mapsUrl: r.Location,
  latitude: r.Latitude,
  longitude: r.Longitude,
  openTime: r["Open Time"],
  closeTime: r["Close Time"],
});

const collectAttractionsFromPlan = (api: ApiTrip): Attraction[] => {
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
        out.push(recoToAttraction(r, slugifyId(r.Name || `attraction-${di}-${si}-${ri}`, ri), api.destinationName));
      });
    });
  });
  return out;
};

const collectByCategoryFromPlan = <T,>(
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

// Manual recommendations (withPlan = false) — items already grouped by type.
const manualToAttraction = (r: ApiManualRecommendationItem, id: string, fallback: string): Attraction => ({
  id,
  name: r.name,
  description: r.description ?? "",
  image: r.image || "",
  location: r.location ?? fallback,
  category: r.category ?? "Place",
  mapsUrl: r.mapsUrl,
  latitude: r.latitude,
  longitude: r.longitude,
  openTime: r.openTime,
  closeTime: r.closeTime,
  ticketPrice: r.ticketPrice,
  duration: r.duration,
});

const manualToHotel = (r: ApiManualRecommendationItem, id: string, fallback: string): Hotel => ({
  id,
  name: r.name,
  description: r.description ?? "",
  image: r.image || "",
  rating: r.rating ?? 4.5,
  reviewsCount: r.reviewsCount ?? 0,
  pricePerNight:
    typeof r.pricePerNight === "number"
      ? `$${r.pricePerNight}`
      : (r.pricePerNight ?? (r.ticketPrice ? `$${r.ticketPrice}` : "—")),
  location: r.location ?? fallback,
  mapsUrl: r.mapsUrl,
  latitude: r.latitude,
  longitude: r.longitude,
  openTime: r.openTime,
  closeTime: r.closeTime,
});

const manualToRestaurant = (r: ApiManualRecommendationItem, id: string, fallback: string): Restaurant => ({
  id,
  name: r.name,
  description: r.description ?? "",
  image: r.image || "",
  rating: r.rating ?? 4.5,
  reviewsCount: r.reviewsCount ?? 0,
  cuisine: r.cuisine ?? r.category ?? "Local",
  priceRange: r.priceRange ?? (r.ticketPrice && r.ticketPrice > 30 ? "$$$" : "$$"),
  location: r.location ?? fallback,
  mapsUrl: r.mapsUrl,
  latitude: r.latitude,
  longitude: r.longitude,
  openTime: r.openTime,
  closeTime: r.closeTime,
});

export const mapApiTripToTrip = (api: ApiTrip): Trip => {
  const initials = (api.profileUserName || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fallbackLoc = api.destinationName ?? "";
  const usePlan = api.withPlan !== false && Boolean(api.planData?.itinerary?.length);

  let attractions: Attraction[] = [];
  let hotels: Hotel[] = [];
  let restaurants: Restaurant[] = [];

  if (usePlan) {
    attractions = collectAttractionsFromPlan(api);
    hotels = collectByCategoryFromPlan(api, (c) => c.includes("hotel"), (r, id) =>
      recoToHotel(r, id, fallbackLoc)
    );
    restaurants = collectByCategoryFromPlan(
      api,
      (c) => c.includes("restaurant") || c.includes("cafe"),
      (r, id) => recoToRestaurant(r, id, fallbackLoc)
    );
  } else if (api.recommendations) {
    attractions = (api.recommendations.attractions ?? []).map((r, i) =>
      manualToAttraction(r, slugifyId(r.name || `attr-${i}`, i), fallbackLoc)
    );
    hotels = (api.recommendations.hotels ?? []).map((r, i) =>
      manualToHotel(r, slugifyId(r.name || `hotel-${i}`, i), fallbackLoc)
    );
    restaurants = (api.recommendations.restaurants ?? []).map((r, i) =>
      manualToRestaurant(r, slugifyId(r.name || `rest-${i}`, i), fallbackLoc)
    );
  }

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
    itinerary: usePlan ? flattenItinerary(api) : [],
    isAiGenerated: api.isAiGenerated ?? usePlan,
    attractions,
    hotels,
    restaurants,
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
