import { MapPin, Clock, ExternalLink, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import type { Restaurant } from "@/types/trip";

interface Props {
  restaurants: Restaurant[];
}

const RestaurantsSection = ({ restaurants }: Props) => {
  if (!restaurants?.length) return null;

  const getMapLink = (r: Restaurant) => {
    if (r.mapsUrl) return r.mapsUrl;
    const query = encodeURIComponent(`${r.name} ${r.location || ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const formatTime = (t?: string) => (t ? t.slice(0, 5) : "");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Utensils className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Top Restaurants</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {restaurants.map((r) => {
          const mapUrl = getMapLink(r);
          const hours = r.openTime || r.closeTime ? `${formatTime(r.openTime)} – ${formatTime(r.closeTime)}` : null;

          return (
            <a
              key={r.id}
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-gray-200/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {r.image && (
                  <img 
                    src={r.image} 
                    alt={r.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold transition-colors group-hover:text-primary">
                    {r.name}
                  </h3>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {r.reviewsCount > 0 && <RatingStars rating={r.rating} reviewsCount={r.reviewsCount} />}
                  <Badge variant="secondary" className="text-[10px]">
                    {r.cuisine}
                  </Badge>
                </div>

                {r.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-200/50 pt-4 text-xs font-medium text-muted-foreground">
                  <div className="flex flex-wrap gap-3">
                    {r.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {r.location}
                      </span>
                    )}
                    {hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {hours}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantsSection;