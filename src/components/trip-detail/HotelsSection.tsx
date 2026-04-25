import { MapPin, Clock, ExternalLink, Bed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import type { Hotel } from "@/types/trip";

interface Props {
  hotels: Hotel[];
}

const getGoogleMapsLink = (item: any) => {
  if (item.mapsUrl) return item.mapsUrl;
  if (item.latitude && item.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
  }
  const searchQuery = encodeURIComponent(`${item.name || item.place} ${item.location || ''}`);
  return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
};

const HotelsSection = ({ hotels }: Props) => {
  if (!hotels?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bed className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Recommended Hotels</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {hotels.map((h) => {
          const mapUrl = getGoogleMapsLink(h); 

          return (
            <a
              key={h.id}
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-gray-200/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {h.image && (
                  <img
                    src={h.image}
                    alt={h.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold transition-colors group-hover:text-primary">
                    {h.name}
                  </h3>
                  {h.pricePerNight && h.pricePerNight !== "—" && (
                    <Badge className="bg-primary text-primary-foreground">
                      {h.pricePerNight}
                    </Badge>
                  )}
                </div>

                {h.reviewsCount > 0 && (
                  <div className="mt-2">
                    <RatingStars rating={h.rating} reviewsCount={h.reviewsCount} />
                  </div>
                )}

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {h.description || "Explore this luxury stay at your destination."}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200/50 pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {h.location}
                  </span>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    View Location <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default HotelsSection;