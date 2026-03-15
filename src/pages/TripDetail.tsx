import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin, Heart, Share2, Globe, Lock, Sparkles, Copy, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockTrips } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const TripDetail = () => {
  const { id } = useParams();
  const trip = mockTrips.find((t) => t.id === id);
  const [isFav, setIsFav] = useState(trip?.isFavorite ?? false);
  const [isPublic, setIsPublic] = useState(trip?.isPublic ?? true);

  if (!trip) {
    return (
      <div className="  flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Trip not found</p>
        <Link to="/"><Button className="mt-4">Back to Explore</Button></Link>
      </div>
    );
  }

  const daysDiff = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleShare = () => {
    toast.success("Trip link copied! Share it on Rahhal's social feed.");
  };

  const handleMatch = () => {
    toast.success(`Finding travelers with similar plans... ${trip.matchPercentage || 75}% match found!`);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hero image */}
      <div className="relative h-[300px] md:h-[400px]">
        <img src={trip.image} alt={trip.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        <div className="absolute left-4 top-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-card">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className=" ">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {trip.isAiGenerated && (
                <Badge className="gap-1 bg-secondary text-secondary-foreground">
                  <Sparkles className="h-3 w-3" /> AI Generated
                </Badge>
              )}
              <Badge className="gap-1 bg-card/80 backdrop-blur-sm text-card-foreground">
                {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">{trip.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-primary-foreground/80">
              <MapPin className="h-4 w-4" />
              <span>{trip.destination}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto  mt-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">About This Trip</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{trip.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Itinerary */}
            <div>
              <h2 className="font-display text-xl font-semibold">Itinerary</h2>
              <div className="mt-4 space-y-4">
                {trip.itinerary.map((day) => (
                  <div key={day.day} className="relative rounded-lg bg-card p-4 shadow-card">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold">{day.title}</h3>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {day.activities.map((act) => (
                            <Badge key={act} variant="outline" className="text-xs font-normal">{act}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold">Trip Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{new Date(trip.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p className="text-muted-foreground">{daysDiff} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="font-medium">{trip.travelers} Travelers</p>
                </div>
                {trip.budget && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <p className="font-medium">{trip.budget}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {trip.createdByAvatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{trip.createdBy}</p>
                  <p className="text-xs text-muted-foreground">Trip Creator</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-display font-semibold">Actions</h3>
              <Button
                variant={isFav ? "default" : "outline"}
                className="w-full gap-2 border border-border/90"
                onClick={() => { setIsFav(!isFav); toast.success(isFav ? "Removed from favorites" : "Added to favorites"); }}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                {isFav ? "Favorited" : "Add to Favorites"}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border border-border/90"
                onClick={() => { setIsPublic(!isPublic); toast.success(`Trip set to ${!isPublic ? "public" : "private"}`); }}
              >
                {isPublic ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                Make {isPublic ? "Private" : "Public"}
              </Button>
              <Button variant="outline" className="w-full gap-2 border border-border/90" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share on Rahhal
              </Button>
              <Button variant="outline" className="w-full gap-2 border border-border/90" onClick={handleMatch}>
                <Copy className="h-4 w-4" />
                Find Matching Trips
              </Button>
            </div>

            {trip.matchPercentage && (
              <div className="rounded-lg bg-card p-5 shadow-card">
                <h3 className="font-display font-semibold">Trip Matching</h3>
                <p className="mt-1 text-sm text-muted-foreground">Similar trips from the community</p>
                <div className="mt-4 space-y-3">
                  {mockTrips
                    .filter((t) => t.id !== trip.id && t.isPublic && t.matchPercentage)
                    .slice(0, 3)
                    .map((t) => (
                      <Link key={t.id} to={`/trip/${t.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                        <img src={t.image} alt={t.name} className="h-10 w-10 rounded-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.destination}</p>
                        </div>
                        <Badge className="bg-success text-success-foreground shrink-0">
                          {t.matchPercentage}%
                        </Badge>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;