import trip1 from "@/assets/trip-1.jpg";
import trip2 from "@/assets/trip-2.jpg";
import trip3 from "@/assets/trip-3.jpg";
import trip4 from "@/assets/trip-4.jpg";
import trip5 from "@/assets/trip-5.jpg";
import trip6 from "@/assets/trip-6.jpg";

export interface TripDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
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
}

export const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Maldives Paradise Escape",
    destination: "Maldives",
    description: "A luxurious week exploring crystal-clear waters, pristine beaches, and world-class snorkeling in the heart of the Indian Ocean.",
    startDate: "2026-04-15",
    endDate: "2026-04-22",
    travelers: 2,
    image: trip1,
    isPublic: true,
    isFavorite: false,
    createdBy: "Sarah Ahmed",
    createdByAvatar: "SA",
    matchPercentage: 92,
    tags: ["Beach", "Luxury", "Snorkeling"],
    budget: "$3,500",
    itinerary: [
      { day: 1, title: "Arrival & Resort Check-in", description: "Arrive at Velana Airport, speedboat to resort", activities: ["Airport transfer", "Resort tour", "Sunset dinner"] },
      { day: 2, title: "Ocean Adventure", description: "Full day of water activities", activities: ["Snorkeling trip", "Kayaking", "Beach BBQ"] },
      { day: 3, title: "Island Hopping", description: "Explore nearby islands", activities: ["Local island visit", "Dolphin watching", "Spa evening"] },
    ],
    isAiGenerated: false,
  },
  {
    id: "2",
    name: "Swiss Alps Adventure",
    destination: "Switzerland",
    description: "An adventurous journey through the majestic Swiss Alps with hiking, skiing, and breathtaking mountain views.",
    startDate: "2026-06-01",
    endDate: "2026-06-08",
    travelers: 4,
    image: trip2,
    isPublic: true,
    isFavorite: true,
    createdBy: "Omar Khalil",
    createdByAvatar: "OK",
    matchPercentage: 78,
    tags: ["Mountains", "Hiking", "Adventure"],
    budget: "$4,200",
    itinerary: [
      { day: 1, title: "Zurich Arrival", description: "Explore Zurich old town", activities: ["Old town walk", "Lake cruise", "Swiss dinner"] },
      { day: 2, title: "Interlaken Day", description: "Adventure sports capital", activities: ["Paragliding", "Lake Brienz", "Mountain dinner"] },
      { day: 3, title: "Jungfrau Summit", description: "Top of Europe experience", activities: ["Jungfraujoch train", "Ice Palace", "Alpine views"] },
    ],
    isAiGenerated: true,
  },
  {
    id: "3",
    name: "Tokyo Culture Immersion",
    destination: "Tokyo, Japan",
    description: "Dive deep into Japanese culture, from ancient temples to cutting-edge technology, street food to fine dining.",
    startDate: "2026-03-20",
    endDate: "2026-03-28",
    travelers: 3,
    image: trip3,
    isPublic: true,
    isFavorite: false,
    createdBy: "Lina Mansour",
    createdByAvatar: "LM",
    matchPercentage: 85,
    tags: ["Culture", "Food", "City"],
    budget: "$2,800",
    itinerary: [
      { day: 1, title: "Shibuya & Harajuku", description: "Explore trendy Tokyo", activities: ["Shibuya crossing", "Harajuku street fashion", "Ramen dinner"] },
      { day: 2, title: "Traditional Tokyo", description: "Ancient meets modern", activities: ["Senso-ji Temple", "Tea ceremony", "Tsukiji market"] },
      { day: 3, title: "Akihabara & Tech", description: "Technology and anime district", activities: ["Akihabara tour", "Robot restaurant", "Karaoke night"] },
    ],
    isAiGenerated: false,
  },
  {
    id: "4",
    name: "Dubai Luxury Getaway",
    destination: "Dubai, UAE",
    description: "Experience the glamour of Dubai with world-class shopping, desert safaris, and architectural marvels.",
    startDate: "2026-05-10",
    endDate: "2026-05-15",
    travelers: 2,
    image: trip4,
    isPublic: false,
    isFavorite: true,
    createdBy: "Ahmed Hassan",
    createdByAvatar: "AH",
    tags: ["Luxury", "Shopping", "Desert"],
    budget: "$5,000",
    itinerary: [
      { day: 1, title: "Downtown Dubai", description: "Iconic landmarks", activities: ["Burj Khalifa", "Dubai Mall", "Fountain show"] },
      { day: 2, title: "Desert Safari", description: "Arabian adventure", activities: ["Dune bashing", "Camel ride", "Desert camp dinner"] },
    ],
    isAiGenerated: true,
  },
  {
    id: "5",
    name: "Roman Holiday",
    destination: "Rome, Italy",
    description: "Walk through centuries of history, savor authentic Italian cuisine, and marvel at Renaissance masterpieces.",
    startDate: "2026-07-01",
    endDate: "2026-07-07",
    travelers: 5,
    image: trip5,
    isPublic: true,
    isFavorite: false,
    createdBy: "Fatima Al-Rashid",
    createdByAvatar: "FR",
    matchPercentage: 65,
    tags: ["History", "Food", "Art"],
    budget: "$3,000",
    itinerary: [
      { day: 1, title: "Ancient Rome", description: "Walk through history", activities: ["Colosseum", "Roman Forum", "Trattoria dinner"] },
      { day: 2, title: "Vatican City", description: "Art and spirituality", activities: ["St. Peter's Basilica", "Sistine Chapel", "Gelato tour"] },
    ],
    isAiGenerated: false,
  },
  {
    id: "6",
    name: "Bali Wellness Retreat",
    destination: "Bali, Indonesia",
    description: "A rejuvenating escape combining yoga, meditation, rice terrace treks, and Balinese cultural experiences.",
    startDate: "2026-08-15",
    endDate: "2026-08-23",
    travelers: 1,
    image: trip6,
    isPublic: true,
    isFavorite: false,
    createdBy: "Nour Eldin",
    createdByAvatar: "NE",
    matchPercentage: 71,
    tags: ["Wellness", "Nature", "Culture"],
    budget: "$1,800",
    itinerary: [
      { day: 1, title: "Ubud Arrival", description: "Spiritual heart of Bali", activities: ["Rice terrace walk", "Yoga session", "Organic dinner"] },
      { day: 2, title: "Temple Day", description: "Sacred Balinese temples", activities: ["Tirta Empul", "Goa Gajah", "Traditional dance show"] },
    ],
    isAiGenerated: true,
  },
];

export const aiTripPreferences = {
  destinations: ["Maldives", "Switzerland", "Japan", "Dubai", "Italy", "Bali", "Greece", "Iceland", "Morocco", "New Zealand"],
  travelStyles: ["Adventure", "Relaxation", "Culture", "Luxury", "Budget", "Solo", "Family", "Romantic"],
  interests: ["Beaches", "Mountains", "History", "Food", "Nightlife", "Nature", "Shopping", "Art", "Sports", "Photography"],
  budgetRanges: ["$500 - $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000+"],
};
