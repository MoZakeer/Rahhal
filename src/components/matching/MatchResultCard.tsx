import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Trip } from "@/data/mockData";

interface MatchResultCardProps {
  trip: Trip & { matchPercentage: number };
  index: number;
  joined: boolean;
  onJoin: (id: string, name: string) => void;
}

const getMatchColor = (pct: number) => {
  if (pct >= 80) return "text-success";
  if (pct >= 60) return "text-secondary";
  return "text-muted-foreground";
};

const getBorderColor = (pct: number) => {
  if (pct >= 80) return "border-success";
  if (pct >= 60) return "border-secondary";
  return "border-muted";
};

const MatchResultCard = ({ trip, index, joined, onJoin }: MatchResultCardProps) => {
  return (
    <Card
      className="animate-fade-in border border-border/90 overflow-hidden transition-shadow hover:shadow-elevated"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative h-48 w-full shrink-0 md:h-auto md:w-56">
            <img src={trip.image} alt={trip.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/30 hidden md:block" />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-card-foreground">
                    {trip.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {trip.destination}
                  </div>
                </div>

                {/* Match circle */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${getBorderColor(trip.matchPercentage)}`}
                  >
                    <span className={`text-lg font-bold ${getMatchColor(trip.matchPercentage)}`}>
                      {trip.matchPercentage}%
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">Match</span>
                </div>
              </div>

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" – "}
                  {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {trip.travelers} travelers
                </span>
                {trip.budget && <span className="font-medium text-foreground">{trip.budget}</span>}
              </div>

              <div className="mt-3">
                <Progress value={trip.matchPercentage} className="h-1.5" />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {trip.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/90 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {trip.createdByAvatar}
                </div>
                <span className="text-sm text-muted-foreground">{trip.createdBy}</span>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/trip/${trip.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant={joined ? "outline" : "default"}
                  className="gap-1.5"
                  onClick={() => onJoin(trip.id, trip.name)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {joined ? "Joined" : "Join Trip"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchResultCard;
