import { MapPin, Clock, Ticket, ExternalLink, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Attraction } from "@/types/trip";

interface Props {
  attractions: Attraction[];
}

const AttractionsSection = ({ attractions }: Props) => {
  if (!attractions?.length) return null;

  const getMapLink = (a: Attraction) => {
    if (a.mapsUrl) return a.mapsUrl;
    const query = encodeURIComponent(`${a.name} ${a.location || ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const formatTime = (t?: string) => (t ? t.slice(0, 5) : "");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Tourist Attractions</h2>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        {attractions.map((a) => {
          const mapUrl = getMapLink(a);
          const hours = a.openTime || a.closeTime ? `${formatTime(a.openTime)} – ${formatTime(a.closeTime)}` : null;

          return (
            <a
              key={a.id}
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-gray-200/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {a.image && (
                  <img 
                    src={a.image} 
                    alt={a.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
                   <span className="text-white text-xs font-medium flex items-center gap-1">
                     <ExternalLink className="h-3 w-3" /> Explore on Maps
                   </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold transition-colors group-hover:text-primary">
                    {a.name}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    {a.category}
                  </Badge>
                </div>

                {a.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-200/50 pt-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {a.location}
                  </span>
                  {hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {hours}
                    </span>
                  )}
                  {a.ticketPrice != null && (
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5 text-primary" />
                      {a.ticketPrice === 0 ? "Free" : `$${a.ticketPrice}`}
                    </span>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AttractionsSection;