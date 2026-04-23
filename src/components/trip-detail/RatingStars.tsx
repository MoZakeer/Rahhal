import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewsCount?: number;
  size?: "sm" | "md";
}

const RatingStars = ({ rating, reviewsCount, size = "sm" }: RatingStarsProps) => {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && hasHalf);
          return (
            <Star
              key={i}
              className={`${iconSize} ${filled ? "fill-secondary text-secondary" : "text-muted-foreground/40"}`}
            />
          );
        })}
      </div>
      <span className="font-medium">{rating.toFixed(1)}</span>
      {reviewsCount !== undefined && (
        <span className="text-muted-foreground">({reviewsCount.toLocaleString()})</span>
      )}
    </div>
  );
};

export default RatingStars;
