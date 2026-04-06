import { Link } from "react-router-dom";
import { Heart, Users, Calendar, MapPin, Lock, Globe, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 1. تعريف واجهة مطابقة للبيانات اللي راجعة من الـ API
export interface ApiTrip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  numberOfUser: number;
  imageUrl: string | null;
  createdBy: string;
  status: number;
  tripStatus: string;
  travelPreference?: { id: string; name: string }[];
  
  // حقول إضافية لخصائص الكارت (لو الـ Backend هيبعتها مستقبلاً)
  destination?: string; 
  isAiGenerated?: boolean;
  isPublic?: boolean;
  isFavorite?: boolean;
  matchPercentage?: number;
}

interface TripCardProps {
  trip: ApiTrip;
  onToggleFavorite?: (id: string) => void;
}

const TripCard = ({ trip, onToggleFavorite }: TripCardProps) => {
  // استخراج أول حرف من اسم صانع الرحلة
  const avatarLetter = trip.createdBy ? trip.createdBy.charAt(0).toUpperCase() : "U";

  // التأكد إن الصورة المبعوتة حقيقية ومش مجرد كلمة "string" أو null
  const hasValidImage = Boolean(
    trip.imageUrl && 
    trip.imageUrl !== "" && 
    trip.imageUrl !== "string" && 
    trip.imageUrl.startsWith("http")
  );

  // الفكرة الممتازة: استخدام الوجهة كـ Seed عشان نفس البلد تاخد نفس الصورة دايماً
  // لو الـ API مبعتش الوجهة، هنستخدم اسم الرحلة، ولو مفيش هنستخدم الـ ID كحل أخير
  const imageSeed = encodeURIComponent(trip.destination || trip.name || trip.id);

  // الحل المضمون: صورة حقيقية لو موجودة، أو صورة مبنية على اسم الوجهة
  const displayImage = hasValidImage 
    ? trip.imageUrl 
    : `https://picsum.photos/seed/${imageSeed}/800/600`;

  return (
    <Link to={`/trip/${trip.id}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden bg-slate-200">
          <img
            src={displayImage}
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // لو النت فصل والصورة محملتش، هنعرض مكانها لون رمادي شيك
              (e.target as HTMLImageElement).src = "https://placehold.co/800x600/e2e8f0/94a3b8?text=Travel+Trip";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

          <div className="absolute left-3 top-3 flex gap-2">
            {trip.isAiGenerated && (
              <Badge className="gap-1 bg-secondary text-secondary-foreground border-0">
                <Sparkles className="h-3 w-3" /> AI
              </Badge>
            )}
            <Badge variant={trip.isPublic !== false ? "default" : "outline"} className="gap-1 border-0 bg-card/80 text-card-foreground backdrop-blur-sm">
              {trip.isPublic !== false ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {trip.isPublic !== false ? "Public" : "Private"}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card z-10"
            onClick={(e) => {
              e.preventDefault(); // عشان الكارت ميعملش Navigate لما ندوس على القلب
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
          
          {trip.destination && (
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {trip.destination}
            </div>
          )}
          
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {/* عرض الاهتمامات/Tags من المصفوفة الجديدة المبعوتة من الـ API */}
            {trip.travelPreference?.map((pref) => (
              <Badge key={pref.id} variant="secondary" className="text-xs font-normal">
                {pref.name}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {trip.numberOfUser || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {avatarLetter}
              </div>
              <span className="text-xs text-muted-foreground">{trip.createdBy || "Unknown"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;