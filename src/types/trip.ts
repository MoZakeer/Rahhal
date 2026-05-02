// src/types/trip.ts

export interface ItineraryStop {
  place?: string;
  arrivalTime?: string;
  departureTime?: string;
  duration?: number;
  ticketPrice?: number;
  category?: string;
  government?: string;
  description?: string;
  image?: string;
  mapsUrl?: string;
  recommendations: any
}

export interface TripDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  stops?: ItineraryStop[];
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  category: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
  ticketPrice?: number;
  duration?: number;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  pricePerNight: string;
  location: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  cuisine: string;
  priceRange: string;
  location?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
}

export interface EventItem {
  id: string;
  name: string;
  description: string;
  image: string;
  date: string;
  location: string;
  category: string;
}

export type JoinRequestStatus = "pending" | "accepted" | "rejected";

export interface JoinRequest {
  id: string;
  userName: string;
  userAvatar: string;
  message: string;
  requestedAt: string;
  status: JoinRequestStatus;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  travelers: number;
  image: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdBy: string;
  createdByAvatar: string;
  matchPercentage?: number;
  tags: string[];
  budget?: string;
  itinerary: TripDay[];
  isAiGenerated: boolean;
  attractions?: Attraction[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  events?: EventItem[];
  joinRequests?: JoinRequest[];
  userJoinStatus?: number;
}