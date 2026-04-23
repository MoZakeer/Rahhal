import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Attraction } from "@/data/mockData";

interface Props {
  attractions: Attraction[];
}

const AttractionsSection = ({ attractions }: Props) => {
  if (!attractions?.length) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Tourist Attractions</h2>
      <p className="mt-1 text-sm text-muted-foreground">Must-see spots around the destination</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {attractions.map((a) => (
          <div key={a.id} className="overflow-hidden rounded-lg border border-gray-300 bg-card shadow-card transition-shadow hover:shadow-elegant">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={a.image} alt={a.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold">{a.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0">{a.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{a.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttractionsSection;
