import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Share2,
  Globe,
  Lock,
  Sparkles,
  DollarSign,
  Trash2,
  UserCheck,
  Loader2,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AttractionsSection from "@/components/trip-detail/AttractionsSection";
import HotelsSection from "@/components/trip-detail/HotelsSection";
import RestaurantsSection from "@/components/trip-detail/RestaurantsSection";
import EventsSection from "@/components/trip-detail/EventsSection";
import JoinRequestsSection from "@/components/trip-detail/JoinRequestsSection";
import JoinTripDialog from "@/components/trip-detail/JoinTripDialog";
import EditTripDialog from "@/components/trip-detail/EditTripDialog";
import {
  getTripById,
  deleteTrip,
  changeTripVision,
  saveTrip,
  getPendingRequests,
  mapApiTripToTrip,
  mapPendingToJoinRequest,
  type ApiTrip,
} from "@/lib/tripApi";
import { ApiError, getUserId } from "@/lib/api";
import type { JoinRequest, JoinRequestStatus } from "@/data/mockData";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apiTrip, setApiTrip] = useState<ApiTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [savingFav, setSavingFav] = useState(false);
  const [changingVision, setChangingVision] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Join requests (admin)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const fetchTrip = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTripById(id);
      setApiTrip(data);
      setIsPublic(data.isPublic ?? true);
      setIsFav(data.isFavorite ?? false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load trip";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const trip = apiTrip ? mapApiTripToTrip(apiTrip) : null;
  const currentUserId = getUserId();
  const isAdmin = Boolean(apiTrip && currentUserId && apiTrip.profileId === currentUserId);

  const loadPendingRequests = useCallback(async () => {
    if (!id) return;
    setRequestsLoading(true);
    try {
      const page = await getPendingRequests(id, 1, 50);
      setJoinRequests((page?.items ?? []).map(mapPendingToJoinRequest));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load requests";
      toast.error(msg);
    } finally {
      setRequestsLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading trip...</p>
      </div>
    );
  }

  if (error || !trip || !apiTrip) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-lg text-muted-foreground">{error ?? "Trip not found"}</p>
        <Link to="/">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const daysDiff = Math.max(
    1,
    Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.success("Trip link copied to clipboard");
  };

  const handleSaveTrip = async () => {
    if (savingFav) return;
    setSavingFav(true);
    try {
      await saveTrip(trip.id);
      setIsFav((v) => !v);
      toast.success(isFav ? "Removed from saved" : "Saved to your trips");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save trip";
      toast.error(msg);
    } finally {
      setSavingFav(false);
    }
  };

  const handleChangeVision = async () => {
    if (changingVision) return;
    setChangingVision(true);
    try {
      await changeTripVision(trip.id);
      setIsPublic((v) => !v);
      toast.success(`Trip is now ${!isPublic ? "public" : "private"}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to change visibility";
      toast.error(msg);
    } finally {
      setChangingVision(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      toast.success("Trip deleted successfully");
      navigate("/");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete trip";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleRequestStatusChange = (id: string, status: JoinRequestStatus) => {
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const pendingCount = joinRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero image */}
      <div className="relative h-[300px] md:h-[400px]">
        {trip.image ? (
          <img src={trip.image} alt={trip.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        <div className="absolute left-4 top-4">
          <Link to="/explore">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="container">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {trip.isAiGenerated && (
                <Badge className="gap-1 border-0 bg-secondary text-secondary-foreground">
                  <Sparkles className="h-3 w-3" /> AI Generated
                </Badge>
              )}
              <Badge className="gap-1 border-0 bg-card/80 text-card-foreground backdrop-blur-sm">
                {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {isPublic ? "Public" : "Private"}
              </Badge>
              {apiTrip.tripStatus && (
                <Badge variant="outline" className="border-card/40 bg-card/60 text-card-foreground backdrop-blur-sm">
                  {apiTrip.tripStatus}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              {trip.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-primary-foreground/80">
              <MapPin className="h-4 w-4" />
              <span>{trip.destination}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-6 px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="font-display text-xl font-semibold">About This Trip</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {trip.description || "No description provided."}
              </p>
              {trip.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {trip.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Itinerary */}
            {trip.itinerary.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Itinerary</h2>
                <div className="mt-4 space-y-4">
                  {trip.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="relative rounded-lg border  border-gray-300 bg-card p-4 shadow-card"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-semibold">{day.title}</h3>
                          <p className="text-sm text-muted-foreground">{day.description}</p>
                          {day.activities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {day.activities.map((act, i) => (
                                <Badge
                                  key={`${act}-${i}`}
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {act}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(trip.attractions?.length ||
              trip.hotels?.length ||
              trip.restaurants?.length ||
              trip.events?.length) && (
              <>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold">Discover the Destination</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Filter by category to explore
                  </p>

                  <Tabs defaultValue="all" className="mt-4">
                    <TabsList className="flex h-auto flex-wrap justify-start gap-1">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {trip.attractions?.length ? (
                        <TabsTrigger value="attractions">Attractions</TabsTrigger>
                      ) : null}
                      {trip.hotels?.length ? <TabsTrigger value="hotels">Hotels</TabsTrigger> : null}
                      {trip.restaurants?.length ? (
                        <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                      ) : null}
                      {trip.events?.length ? <TabsTrigger value="events">Events</TabsTrigger> : null}
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-6">
                      {trip.attractions?.length ? (
                        <AttractionsSection attractions={trip.attractions} />
                      ) : null}
                      {trip.hotels?.length ? <HotelsSection hotels={trip.hotels} /> : null}
                      {trip.restaurants?.length ? (
                        <RestaurantsSection restaurants={trip.restaurants} />
                      ) : null}
                      {trip.events?.length ? <EventsSection events={trip.events} /> : null}
                    </TabsContent>

                    {trip.attractions?.length ? (
                      <TabsContent value="attractions" className="mt-6">
                        <AttractionsSection attractions={trip.attractions} />
                      </TabsContent>
                    ) : null}
                    {trip.hotels?.length ? (
                      <TabsContent value="hotels" className="mt-6">
                        <HotelsSection hotels={trip.hotels} />
                      </TabsContent>
                    ) : null}
                    {trip.restaurants?.length ? (
                      <TabsContent value="restaurants" className="mt-6">
                        <RestaurantsSection restaurants={trip.restaurants} />
                      </TabsContent>
                    ) : null}
                    {trip.events?.length ? (
                      <TabsContent value="events" className="mt-6">
                        <EventsSection events={trip.events} />
                      </TabsContent>
                    ) : null}
                  </Tabs>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg borderborder-gray-300 bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold">Trip Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
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
            <div className="space-y-3 rounded-lg border border-gray-300 bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold">Actions</h3>

              {!isAdmin && <JoinTripDialog tripId={trip.id} tripName={trip.name} />}
              {isAdmin && (
                <EditTripDialog
                  trip={trip}
                  destinationId={apiTrip.destinationId}
                  countryId={apiTrip.countryId}
                  travelPreferencesId={apiTrip.travelPreferences?.map((p) => p.id) ?? []}
                  gender={apiTrip.gender}
                  ageGroup={apiTrip.ageGroup}
                  status={apiTrip.status}
                  onSaved={fetchTrip}
                />
              )}

              <Button
                variant={isFav ? "default" : "outline"}
                className="w-full gap-2"
                onClick={handleSaveTrip}
                disabled={savingFav}
              >
                {savingFav ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                )}
                {isFav ? "Saved" : "Save Trip"}
              </Button>

              {isAdmin && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleChangeVision}
                  disabled={changingVision}
                >
                  {changingVision ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPublic ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Make {isPublic ? "Private" : "Public"}
                </Button>
              )}

              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share Trip
              </Button>

              {/* <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Matching coming soon")}>
                <Copy className="h-4 w-4" />
                Find Matching Trips
              </Button> */}

              {isAdmin && (
                <Dialog onOpenChange={(o) => o && loadPendingRequests()}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <UserCheck className="h-4 w-4" />
                      Join Requests
                      {pendingCount > 0 && (
                        <Badge className="ml-auto border-0 bg-secondary text-secondary-foreground">
                          {pendingCount}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-display">Join Requests</DialogTitle>
                      <DialogDescription>
                        Review and respond to travelers who want to join this trip.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                      <JoinRequestsSection
                        requests={joinRequests}
                        loading={requestsLoading}
                        onStatusChange={handleRequestStatusChange}
                        hideHeader
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2" disabled={deleting}>
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete Trip
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The trip and all its details will be
                        permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
