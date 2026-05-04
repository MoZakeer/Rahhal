/* eslint-disable react-hooks/set-state-in-effect */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Globe,
  Lock,
  Sparkles,
  DollarSign,
  Trash2,
  UserCheck,
  Loader2,
  Bookmark,
  Share2,
  Clock,
  Ticket,
  ExternalLink,
} from "lucide-react";
import { LayoutGrid, Bed, Utensils } from "lucide-react";

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

// Components
import AttractionsSection from "@/components/trip-detail/AttractionsSection";
import HotelsSection from "@/components/trip-detail/HotelsSection";
import RestaurantsSection from "@/components/trip-detail/RestaurantsSection";
import JoinRequestsSection from "@/components/trip-detail/JoinRequestsSection";
import JoinTripDialog from "@/components/trip-detail/JoinTripDialog";
import EditTripDialog from "@/components/trip-detail/EditTripDialog";
import { usePageTitle } from "@/hooks/usePageTitle";

// API & Types
import {
  getTripById,
  deleteTrip,
  changeTripVision,
  saveTrip,
  getPendingRequests,
  mapApiTripToTrip,
  mapPendingToJoinRequest,
  type TripDetailsFilter,
} from "@/lib/tripApi";
import { ApiError, getUserId } from "@/lib/api";
import type { JoinRequest, JoinRequestStatus } from "@/types/trip";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SafeImageProps {
  src?: string;
  alt?: string;
  category?: string;
  className?: string;
}

const SafeImage = ({ src, alt, className, category }: SafeImageProps) => {
  const initialSrc = src?.startsWith("http://") ? src.replace("http://", "https://") : src;

  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!initialSrc);

  const getFallback = (cat?: string) => {
    const categoryLower = cat?.toLowerCase() || "";
    if (categoryLower.includes("beach") || categoryLower.includes("sea"))
      return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80";
    if (categoryLower.includes("restaurant") || categoryLower.includes("food") || categoryLower.includes("cafe"))
      return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80";
    if (categoryLower.includes("historic") || categoryLower.includes("museum") || categoryLower.includes("temple"))
      return "https://images.unsplash.com/photo-1548013146-72479768bbaa?w=500&q=80";
    if (categoryLower.includes("hotel") || categoryLower.includes("resort"))
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80";

    return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&q=80";
  };

  return (
    <img
      src={imgSrc || getFallback(category)}
      alt={alt || "Trip image"}
      loading="lazy"
      className={`${className} ${hasError ? "opacity-90" : "opacity-100"}`}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(getFallback(category));
        }
      }}
    />
  );
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TripDetailsFilter>("all");

  // 2. استخدام React Query لجلب الداتا بدل الـ useEffect
  const { 
    data: apiTrip, 
    isLoading: loading, 
    error: queryError 
  } = useQuery({
    // المفتاح هنا بيعتمد على الـ id والـ tab الحالي
    queryKey: ['tripDetails', id, activeTab], 
    queryFn: () => getTripById(id!, activeTab),
    enabled: !!id, // ميعملش ريكويست لو مفيش ID
    staleTime: 1000 * 60 * 2, // الكاش بيعيش دقيقتين
  });

  const error = queryError instanceof ApiError ? queryError.message : queryError?.message || null;

  // Local states for optimistic UI updates
  const [isFav, setIsFav] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [savingFav, setSavingFav] = useState(false);
  const [changingVision, setChangingVision] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Join requests (admin)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // تحديث حالة الزرار المفضل والرؤية أول ما الداتا تيجي
  useEffect(() => {
    if (apiTrip) {
      setIsPublic(apiTrip.isPublic ?? true);
      setIsFav(apiTrip.isFavorite ?? false);
    }
  }, [apiTrip]);

  const trip = apiTrip ? mapApiTripToTrip(apiTrip) : null;
  const currentUserId = getUserId();
  const isAdmin = Boolean(
    apiTrip && currentUserId && apiTrip.profileId === currentUserId,
  );
  usePageTitle(trip?.name || "Trip Detail");

  const loadPendingRequests = useCallback(async () => {
    if (!id) return;
    setRequestsLoading(true);
    try {
      const page = await getPendingRequests(id, 1, 50);
      setJoinRequests((page?.items ?? []).map(mapPendingToJoinRequest));
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to load requests";
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
        <p className="text-lg text-muted-foreground">
          {error ?? "Trip not found"}
        </p>
        <Button onClick={() => navigate(-1)}>Back to Explore</Button>
      </div>
    );
  }

  const daysDiff = Math.max(
    1,
    Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
    ),
  );

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).catch(() => { });
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
      const msg =
        err instanceof ApiError ? err.message : "Failed to change visibility";
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
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete trip";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleRequestStatusChange = (
    reqId: string,
    status: JoinRequestStatus,
  ) => {
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status } : r)),
    );
  };

  const pendingCount = joinRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero image */}
      <div className="relative h-[300px] md:h-[400px]">
        {trip.image ? (
          <img
            src={trip.image}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        <div className="absolute left-4 top-4">
          <Button
            onClick={() => navigate(-1)} 
            variant="ghost"
            size="icon"
            className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
                {isPublic ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {isPublic ? "Public" : "Private"}
              </Badge>
              {apiTrip.tripStatus && (
                <Badge
                  variant="outline"
                  className="border-card/40 bg-card/60 text-card-foreground backdrop-blur-sm"
                >
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
          <div className="space-y-6 lg:col-span-2 min-w-0">
            <div>
              <h2 className="font-display text-xl font-semibold">
                About This Trip
              </h2>
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

            {trip.itinerary.length > 0 && (
              <section>
                <h2 className="text-xl font-bold">Itinerary</h2>
                <div className="mt-6 space-y-8">
                  {trip.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="relative pl-8 border-l-2  border-primary/20"
                    >
                      <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-primary" />
                      <h3 className="text-lg font-bold text-primary">
                        Day {day.day}
                      </h3>

                      <div className="mt-4 space-y-6">
                        {day.stops?.map((stop, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-gray-200/50 bg-card overflow-hidden shadow-sm"
                          >
                            <div className="flex flex-col md:flex-row">
                              {stop.image && (
                                <div className="overflow-hidden rounded-md">
                                  <SafeImage
                                    src={stop.image}
                                    category={stop.category}
                                    className="h-20 w-full object-cover bg-muted transition-transform duration-300 md:group-hover:scale-110"
                                  />
                                </div>
                              )}

                              <div className="p-4 flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-bold text-lg">
                                      {stop.place || stop.category}
                                    </h4>
                                    <Badge variant="secondary" className="mt-1">
                                      {stop.category}
                                    </Badge>
                                  </div>
                                  {stop.arrivalTime && (
                                    <Badge variant="outline" className="gap-1">
                                      <Clock className="h-3 w-3" />{" "}
                                      {stop.arrivalTime}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                  {stop.description}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  {stop.ticketPrice !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <Ticket className="h-3 w-3" />{" "}
                                      {stop.ticketPrice === 0
                                        ? "Free"
                                        : `$${stop.ticketPrice}`}
                                    </span>
                                  )}
                                  {stop.mapsUrl && (
                                    <a
                                      href={stop.mapsUrl}
                                      target="_blank"
                                      className="flex items-center gap-1 text-primary hover:underline ml-auto"
                                    >
                                      <ExternalLink className="h-3 w-3" /> View
                                      Map
                                    </a>
                                  )}
                                </div>

                                {stop?.recommendations &&
                                  (stop?.recommendations as any[]).length >
                                  0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                                      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                        Nearby Places
                                      </p>
                                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {(stop.recommendations as any[]).map(
                                          (reco: any, ri: number) => {
                                            const mapLink =
                                              reco.mapsUrl ||
                                              (reco.latitude && reco.longitude
                                                ? `https://www.google.com/maps/search/?api=1&query=${reco.latitude},${reco.longitude}`
                                                : undefined);

                                            return (
                                              <a
                                                key={ri}
                                                href={mapLink || "#"}
                                                target={
                                                  mapLink ? "_blank" : undefined
                                                }
                                                rel={
                                                  mapLink
                                                    ? "noopener noreferrer"
                                                    : undefined
                                                }
                                                className="min-w-[120px] max-w-[120px] text-center block group cursor-pointer"
                                                onClick={(e) => {
                                                  if (!mapLink) {
                                                    e.preventDefault();
                                                    toast.info(
                                                      "Map location not available",
                                                    );
                                                  }
                                                }}
                                              >
                                                <div className="overflow-hidden rounded-md">
                                                  <img
                                                    src={reco.image}
                                                    className="h-20 w-full object-cover bg-muted transition-transform duration-300 group-hover:scale-110"
                                                    alt={reco.name}
                                                  />
                                                </div>
                                                <p className="text-xs font-medium mt-1.5 truncate transition-colors group-hover:text-primary">
                                                  {reco.name}
                                                </p>
                                              </a>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!trip.isAiGenerated &&
              (trip.attractions?.length ||
                trip.hotels?.length ||
                trip.restaurants?.length) ? (
              <>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    Discover the Destination
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Filter by category to explore recommendations
                  </p>

                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as TripDetailsFilter)}
                    className="mt-4"
                  >
                    <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-muted/50 p-1.5 rounded-xl">
                      <TabsTrigger
                        value="all"
                        className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
                      >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        All
                      </TabsTrigger>

                      {trip.attractions && trip.attractions.length > 0 && (
                        <TabsTrigger
                          value="attractions"
                          className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Attractions
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] px-1.5 py-0 bg-background"
                          >
                            {trip.attractions.length}
                          </Badge>
                        </TabsTrigger>
                      )}

                      {trip.hotels && trip.hotels.length > 0 && (
                        <TabsTrigger
                          value="hotels"
                          className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
                        >
                          <Bed className="w-4 h-4 mr-2" />
                          Hotels
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] px-1.5 py-0 bg-background"
                          >
                            {trip.hotels.length}
                          </Badge>
                        </TabsTrigger>
                      )}

                      {trip.restaurants && trip.restaurants.length > 0 && (
                        <TabsTrigger
                          value="restaurants"
                          className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
                        >
                          <Utensils className="w-4 h-4 mr-2" />
                          Restaurants
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] px-1.5 py-0 bg-background"
                          >
                            {trip.restaurants.length}
                          </Badge>
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-6">
                      {trip.attractions?.length ? (
                        <AttractionsSection attractions={trip.attractions} />
                      ) : null}
                      {trip.hotels?.length ? (
                        <HotelsSection hotels={trip.hotels} />
                      ) : null}
                      {trip.restaurants?.length ? (
                        <RestaurantsSection restaurants={trip.restaurants} />
                      ) : null}
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
                  </Tabs>
                </div>
              </>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg borderborder-gray-200/50 bg-card p-5 shadow-card">
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
            <div className="space-y-3 rounded-lg border border-gray-200/50 bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold">Actions</h3>

              {trip && apiTrip && !isAdmin && (
                <JoinTripDialog
                  tripId={trip.id}
                  tripName={trip.name}
                  userStatus={apiTrip?.userJoinStatus}
                />
              )}

              {isAdmin && (
                <EditTripDialog
                  trip={trip}
                  destinationId={apiTrip.destinationId}
                  countryId={apiTrip.countryId}
                  travelPreferencesId={
                    apiTrip.travelPreferences?.map((p) => p.id) ?? []
                  }
                  gender={apiTrip.gender}
                  ageGroup={apiTrip.ageGroup}
                  status={apiTrip.status}
                  // 3. لما التعديل يخلص، بنقول للـ React Query يـ Invalidate الكاش عشان يطلب الداتا الجديدة
                  onSaved={() => queryClient.invalidateQueries({ queryKey: ['tripDetails', id] })}
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
                  <Bookmark
                    className={`h-4 w-4 ${isFav ? "fill-current" : ""}`}
                  />
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

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share Trip
              </Button>

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
                      <DialogTitle className="font-display">
                        Join Requests
                      </DialogTitle>
                      <DialogDescription>
                        Review and respond to travelers who want to join this
                        trip.
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
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      disabled={deleting}
                    >
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
                        This action cannot be undone. The trip and all its
                        details will be permanently removed.
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