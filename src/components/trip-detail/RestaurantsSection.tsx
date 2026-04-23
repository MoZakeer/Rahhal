import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import type { Restaurant } from "@/data/mockData";

interface Props {
  restaurants: Restaurant[];
}

const RestaurantsSection = ({ restaurants }: Props) => {
  if (!restaurants?.length) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Top Restaurants</h2>
      <p className="mt-1 text-sm text-muted-foreground">Where to eat during your trip</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {restaurants.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-lg border border-gray-300 bg-card shadow-card transition-shadow hover:shadow-elegant">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={r.image} alt={r.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold">{r.name}</h3>
                <span className="text-sm font-semibold text-primary shrink-0">{r.priceRange}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <RatingStars rating={r.rating} reviewsCount={r.reviewsCount} />
                <Badge variant="outline" className="text-xs">{r.cuisine}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsSection;
