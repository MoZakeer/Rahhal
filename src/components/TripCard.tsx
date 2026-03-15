import { Link } from "react-router-dom";
import { Heart, Users, Calendar, MapPin, Lock, Globe, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/data/mockData";

interface TripCardProps {
  trip: Trip;
  onToggleFavorite?: (id: string) => void;
}

const TripCard = ({ trip, onToggleFavorite }: TripCardProps) => {
  return (
    <Link to={`/trip/${trip.id}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={trip.image}
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

          <div className="absolute left-3 top-3 flex gap-2">
            {trip.isAiGenerated && (
              <Badge className="gap-1 bg-secondary text-secondary-foreground border-0">
                <Sparkles className="h-3 w-3" /> AI
              </Badge>
            )}
            <Badge variant={trip.isPublic ? "default" : "outline"} className="gap-1 border-0 bg-card/80 text-card-foreground backdrop-blur-sm">
              {trip.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {trip.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(trip.id);
            }}
          >
            <Heart className={`h-4 w-4 ${trip.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </Button>

          {trip.matchPercentage && (
            <div className="absolute bottom-3 right-3 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
              {trip.matchPercentage}% Match
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-card-foreground line-clamp-1">{trip.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {trip.destination}
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {trip.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {trip.travelers}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {trip.createdByAvatar}
              </div>
              <span className="text-xs text-muted-foreground">{trip.createdBy}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
