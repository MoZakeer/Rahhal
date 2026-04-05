import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// الواجهة مطابقة للـ API الحقيقي
export interface ApiMatchTrip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  numberOfUser: number;
  imageUrl: string | null;
  createdBy: string;
  status: number;
  tripStatus: string;
  matchPercentage: number; // الحقل الجديد من الـ API
  travelPreference?: { id: string; name: string }[];
  destination?: string;
  budget?: number;
}

interface MatchResultCardProps {
  trip: ApiMatchTrip;
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
  const avatarLetter = trip.createdBy ? trip.createdBy.charAt(0).toUpperCase() : "U";
  const imageSeed = encodeURIComponent(trip.destination || trip.name || trip.id);
  
  const hasValidImage = Boolean(trip.imageUrl && trip.imageUrl !== "string" && trip.imageUrl.startsWith("http"));
  const displayImage = hasValidImage ? trip.imageUrl : `https://picsum.photos/seed/${imageSeed}/800/600`;

  // تقريب نسبة المطابقة لعدد صحيح
  const formattedMatch = Math.round(trip.matchPercentage || 0);
  console.log(trip)
  return (
    <Card
      className="animate-fade-in border border-border/90 overflow-hidden transition-shadow hover:shadow-elevated"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative h-48 w-full shrink-0 md:h-auto md:w-56 bg-slate-200">
            <img src={displayImage as string} alt={trip.name} className="h-full w-full object-cover" />
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
                  {trip.destination && (
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {trip.destination}
                    </div>
                  )}
                </div>

                {/* Match circle */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${getBorderColor(formattedMatch)}`}>
                    <span className={`text-lg font-bold ${getMatchColor(formattedMatch)}`}>
                      {formattedMatch}%
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">Match</span>
                </div>
              </div>

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {trip.numberOfUser} travelers
                </span>
                {trip.budget && <span className="font-medium text-foreground">${trip.budget}</span>}
              </div>

              <div className="mt-3">
                <Progress value={formattedMatch} className="h-1.5" />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {trip.travelPreference?.map((pref) => (
                  <Badge key={pref.id} variant="secondary" className="text-xs font-normal">
                    {pref.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/90 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {avatarLetter}
                </div>
                <span className="text-sm text-muted-foreground">{trip.createdBy || "Unknown"}</span>
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