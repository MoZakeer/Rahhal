import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import type { Hotel } from "@/data/mockData";

interface Props {
  hotels: Hotel[];
}

const HotelsSection = ({ hotels }: Props) => {
  if (!hotels?.length) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Recommended Hotels</h2>
      <p className="mt-1 text-sm text-muted-foreground">Top-rated places to stay</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {hotels.map((h) => (
          <div key={h.id} className="overflow-hidden rounded-lg border  border-gray-300 bg-card shadow-card transition-shadow hover:shadow-elegant">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={h.image} alt={h.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold">{h.name}</h3>
                <Badge className="bg-primary text-primary-foreground border-0 shrink-0">{h.pricePerNight}/night</Badge>
              </div>
              <div className="mt-1.5">
                <RatingStars rating={h.rating} reviewsCount={h.reviewsCount} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{h.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{h.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelsSection;
