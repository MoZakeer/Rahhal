import { Link } from "react-router-dom";
import {
  Heart,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getTripById } from "@/lib/tripApi";

export interface ApiTrip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  numberOfUser: number;
  imageUrl: string | null;
  createdBy: string;
  status: number;
  tripStatus: string;
  travelPreference?: { id: string; name: string }[];
  destination?: string;
  withPlan?: boolean;
  isPublic?: boolean;
  isSaved?: boolean;
  matchPercentage?: number;
}

interface TripCardProps {
  trip: ApiTrip;
  onToggleFavorite?: (id: string) => void;
}

const TripCard = ({ trip, onToggleFavorite }: TripCardProps) => {
  const queryClient = useQueryClient(); // 3. تهيئة الكلاينت
  const isMyTripsPage = location.pathname === "/my-trips";
  const avatarLetter = trip.createdBy
    ? trip.createdBy.charAt(0).toUpperCase()
    : "U";

  const hasValidImage = Boolean(
    trip.imageUrl &&
    trip.imageUrl !== "" &&
    trip.imageUrl !== "string" &&
    trip.imageUrl.startsWith("http"),
  );

  const imageSeed = encodeURIComponent(
    trip.destination || trip.name || trip.id,
  );

  const displayImage = hasValidImage
    ? (trip.imageUrl ?? `https://picsum.photos/seed/${imageSeed}/800/600`)
    : `https://picsum.photos/seed/${imageSeed}/800/600`;

  let prefetchTimeout: ReturnType<typeof setTimeout>;

  const handlePrefetch = () => {
    // eslint-disable-next-line react-hooks/immutability
    prefetchTimeout = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ["tripDetails", trip.id, "all"],
        queryFn: () => getTripById(trip.id, "all"),
        staleTime: 1000 * 60 * 2,
      });
    }, 150);
  };
  const handleCancelPrefetch = () => {
    clearTimeout(prefetchTimeout);
  };

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="group block w-full"
      onMouseEnter={handlePrefetch}
      onMouseLeave={handleCancelPrefetch}
      onTouchStart={handlePrefetch}
    >
      <div className="relative flex h-auto md:h-[420px] dark:bg-slate-800 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm md:transition-all md:duration-500 md:ease-out md:group-hover:-translate-y-2 md:group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] border border-slate-100 md:border-none">
        {/* Image Section */}
        <div className="relative h-[240px] w-full shrink-0 overflow-hidden dark:bg-slate-800 bg-slate-50 md:absolute md:inset-0 md:h-full">
          <img
            src={displayImage}
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/800x600/F8F9FA/D1D5DB?text=RAHHAL";
            }}
          />

          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="md:hidden absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="absolute left-4 top-4 md:left-5 md:top-5 z-20 flex flex-col gap-2">
            {isMyTripsPage && (
              <div
                className={`flex items-center gap-1.5 max-w-28 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md border
      ${
        trip.isPublic
          ? "bg-blue-500/10 text-blue-700 border-blue-200"
          : "bg-rose-500/10 text-rose-700 border-rose-200"
      }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    trip.isPublic ? "bg-blue-500" : "bg-rose-500"
                  }`}
                />
                <span>{trip.isPublic ? "Public Trip" : "Private Trip"}</span>
              </div>
            )}

            {trip.withPlan && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span>AI-Generated Plan</span>
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 md:right-5 md:top-5 h-10 w-10 rounded-full bg-white/90 dark:bg-slate-700  backdrop-blur-md shadow-sm border border-white/50 dark:border-slate-400 hover:bg-white dark:hover:bg-slate-300 transition-all duration-300 z-30"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(trip.id);
            }}
          >
            <Heart
              className={`h-5 w-5 transition-colors duration-300 ${
                trip.isSaved
                  ? "fill-red-500 text-red-500 dark:fill-red-600 dark:text-red-600"
                  : "text-slate-400"
              }`}
            />
          </Button>

          {/* Match Percentage */}
          {trip.matchPercentage && (
            <div className="absolute bottom-4 right-4 md:bottom-32 md:group-hover:bottom-56 md:right-5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5 md:transition-all md:duration-500 z-20">
              <Navigation className="h-3.5 w-3.5 text-blue-100" />
              {trip.matchPercentage}%
            </div>
          )}
        </div>

        <div className="relative z-20 flex flex-1 flex-col dark:bg-slate-800 bg-white p-5 md:absolute md:bottom-0 md:left-0 md:right-0 md:p-6 md:transition-transform md:duration-500 md:ease-out md:translate-y-[120px] md:group-hover:translate-y-0">
          <div className="mb-3 md:mb-4">
            {/* Location */}
            {trip.destination && (
              <div className="mb-1.5 flex items-center gap-1 text-[11px] md:text-xs font-bold text-blue-600/80 uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination}
              </div>
            )}

            {/* Title */}
            <h3 className="font-display text-xl md:text-2xl font-bold text-slate-900  dark:text-slate-300 line-clamp-1 md:transition-colors md:duration-300 md:group-hover:text-blue-900 dark:md:group-hover:text-slate-100">
              {trip.name}
            </h3>
          </div>

          <div className="flex flex-1 flex-col md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-500 md:delay-100">
            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
              {trip.description}
            </p>

            {/* Tags */}
            <div className="mt-auto md:mt-4 flex flex-wrap gap-2 mb-5 md:mb-0">
              {trip.travelPreference?.map((pref) => (
                <Badge
                  key={pref.id}
                  variant="secondary"
                  className="bg-slate-50 text-slate-600 border dark:bg-slate-900 dark:text-blue-700 dark:border-slate-700 border-slate-100 text-[11px] md:text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {pref.name}
                </Badge>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-0 md:mt-6 pt-4 md:pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-400 dark:text-blue-700" />
                    {trip.startDate
                      ? new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-400 dark:text-blue-700" />
                    {trip.numberOfUser || 0}
                  </span>
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-300 hidden sm:block">
                    {trip.createdBy || "Unknown"}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-500 text-xs font-bold text-blue-700 dark:text-blue-800 border border-blue-100 dark:border-slate-500">
                    {avatarLetter}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
