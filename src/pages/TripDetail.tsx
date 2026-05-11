/* eslint-disable react-hooks/set-state-in-effect */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
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
  Camera,
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
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

// Components
import AttractionsSection from "@/components/trip-detail/AttractionsSection";
import HotelsSection from "@/components/trip-detail/HotelsSection";
import RestaurantsSection from "@/components/trip-detail/RestaurantsSection";
import JoinRequestsSection from "@/components/trip-detail/JoinRequestsSection";
import JoinTripDialog from "@/components/trip-detail/JoinTripDialog";
import EditTripDialog from "@/components/trip-detail/EditTripDialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import { PanelRight, AlignVerticalSpaceAround } from "lucide-react";

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
import { updateTripImage } from "@/lib/tripApi";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFavicon } from "@/hooks/useFavicon";

interface SafeImageProps {
  src?: string;
  alt?: string;
  category?: string;
  className?: string;
}

const SafeImage = ({ src, alt, className, category }: SafeImageProps) => {
  const initialSrc = src?.startsWith("http://")
    ? src.replace("http://", "https://")
    : src;

  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!initialSrc);

  const getFallback = (cat?: string) => {
    const categoryLower = cat?.toLowerCase() || "";
    if (categoryLower.includes("beach") || categoryLower.includes("sea"))
      return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80";
    if (
      categoryLower.includes("restaurant") ||
      categoryLower.includes("food") ||
      categoryLower.includes("cafe")
    )
      return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80";
    if (
      categoryLower.includes("historic") ||
      categoryLower.includes("museum") ||
      categoryLower.includes("temple")
    )
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

  const {
    data: apiTrip,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["tripDetails", id, activeTab],
    queryFn: () => getTripById(id!, activeTab),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  const error =
    queryError instanceof ApiError
      ? queryError.message
      : queryError?.message || null;

  // Local states for optimistic UI updates
  const [isFav, setIsFav] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [savingFav, setSavingFav] = useState(false);
  const [changingVision, setChangingVision] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Join requests (admin)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

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
  // console.log(trip);

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

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => updateTripImage(trip!.id, file),
    onSuccess: () => {
      toast.success("Trip image updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tripDetails", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update image");
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  const BASE_URL = "https://rahhal-api.runasp.net";

  const getFullImageUrl = (path: string) => {
    if (!path) return "";

    if (path.startsWith("http")) return path;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${BASE_URL}${cleanPath}`;
  };

  useFavicon(trip?.image ? getFullImageUrl(trip.image) : "");

  const creatorImage = getFullImageUrl(apiTrip?.profilePicture || "");

  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary shadow-sm">
    {creatorImage ? (
      <img
        src={creatorImage}
        alt={apiTrip?.profileUserName}
        className="h-full w-full object-cover"
      />
    ) : (
      <span className="uppercase">
        {apiTrip?.profileUserName?.charAt(0) || "U"}
      </span>
    )}
  </div>;

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
      <Dialog>
        <div className="relative h-[300px] md:h-[400px] group/hero overflow-hidden">

          <DialogTrigger asChild>
            <div className="absolute inset-0 w-full h-full cursor-zoom-in">
              {trip.image ? (
                <img
                  src={getFullImageUrl(trip.image)}
                  alt={trip.name}
                  className={`h-full w-full object-cover transition-all duration-700 group-hover/hero:scale-105 ${uploadImageMutation.isPending ? "opacity-50" : "opacity-100"
                    }`}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/30 to-secondary/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            </div>
          </DialogTrigger>

          {uploadImageMutation.isPending && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <Loader2 className="h-10 w-10 animate-spin text-white drop-shadow-md" />
            </div>
          )}

          <div className="absolute left-4 top-4 z-10">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
              }}
              variant="ghost"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          {isAdmin && (
            <div className="absolute right-4 bottom-4 z-10">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
                disabled={uploadImageMutation.isPending}
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/30 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                <Camera className="h-4 w-4 drop-shadow-md" />
                <span className="hidden sm:inline font-medium drop-shadow-md">
                  Change Cover
                </span>
              </Button>
            </div>
          )}

          <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none">
            <div className="container pointer-events-auto">
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

        {trip.image && (
          <DialogContent
            className="max-w-5xl bg-transparent border-none shadow-none p-0 flex items-center justify-center [&>button]:fixed [&>button]:top-6 [&>button]:right-6 [&>button]:z-[100] [&>button]:text-white [&>button]:bg-black/50 hover:[&>button]:bg-black/80 [&>button]:p-3 [&>button]:rounded-full [&>button]:backdrop-blur-sm [&>button]:border [&>button]:border-white/20 [&_svg]:h-6 [&_svg]:w-6"
          >
            <DialogTitle className="sr-only">Trip Cover Image</DialogTitle>
            <div
              className="relative w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getFullImageUrl(trip.image)}
                alt={trip.name}
                className="max-h-[90vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
              />
            </div>
          </DialogContent>
        )}
      </Dialog>

      <div className="container mt-2 px-6">
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
                                <div className="overflow-hidden md:w-[320px] md:h-full shrink-0">
                                  <SafeImage
                                    src={stop.image}
                                    category={stop.category}
                                    className="h-48 w-full md:h-full md:min-h-[220px] object-cover bg-muted transition-transform duration-300 md:group-hover:scale-110"
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
          <div className="space-y-4 md:sticky md:top-5 h-fit">
            {/* 1. Trip Details / Floating Top Summary Bar */}
            <motion.div
              drag={isDocked ? "y" : false}
              dragConstraints={{ top: -200, bottom: 300 }}
              dragElastic={0.1}
              dragMomentum={false}
              className={`
    group duration-500 ease-in-out transition-all will-change-transform z-50 mb-[2px]
    
    ${!isDocked
                  ? `max-lg:fixed max-lg:top-4 max-lg:inset-x-0 max-lg:mx-auto max-lg:w-[92%] max-lg:max-w-md max-lg:flex-row max-lg:rounded-full max-lg:border max-lg:border-white/20 max-lg:bg-background/80 max-lg:p-2.5 max-lg:px-5 max-lg:backdrop-blur-xl max-lg:shadow-2xl lg:relative lg:rounded-lg lg:border lg:border-gray-200/50 lg:bg-card lg:p-5 lg:w-full lg:shadow-card lg:mt-[2px] ${isNavVisible ? "max-lg:translate-y-16" : "max-lg:translate-y-0"}`
                  : ""}
      
    /* الوضع الرأسي (Docked) للموبايل */
    ${isDocked
                  ? "max-lg:fixed max-lg:right-3 max-lg:top-1/4 max-lg:w-auto max-lg:flex-col max-lg:rounded-full max-lg:border max-lg:border-white/20 max-lg:bg-background/90 max-lg:p-3 max-lg:backdrop-blur-xl max-lg:shadow-2xl lg:relative lg:rounded-lg lg:border lg:border-gray-200/50 lg:bg-card lg:p-5 lg:w-full lg:shadow-card lg:mt-[2px]"
                  : ""}
  `}
            >
              <h3 className={`font-display font-semibold mb-3 ${isDocked ? "max-lg:hidden" : "hidden lg:block"}`}>
                Trip Details
              </h3>

              <div className={`flex transition-all duration-300
    ${isDocked ? "max-lg:flex-col max-lg:space-y-4 max-lg:items-center" : "flex-row items-center justify-between w-full"}
    lg:flex-col lg:space-y-4 lg:items-start lg:mt-[3px]
  `}>

                {/* --- Date --- */}
                <div className={`flex shrink-0 items-center gap-2 lg:gap-3 text-sm ${isDocked ? "max-lg:flex-col max-lg:gap-0.5" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 lg:h-auto lg:w-auto lg:bg-transparent lg:p-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className={`text-center ${isDocked ? "max-lg:text-[10px] max-lg:leading-none max-lg:text-foreground" : ""}`}>
                    <span className={`hidden font-bold ${isDocked ? "max-lg:block" : ""}`}>{daysDiff}d</span>

                    <div className={`${isDocked ? "max-lg:hidden" : ""}`}>
                      <p className="hidden font-medium lg:block">
                        {new Date(trip.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="font-medium lg:hidden">
                        {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground lg:text-sm">{daysDiff} days</p>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className={`bg-foreground/10 ${isDocked ? "max-lg:hidden" : "h-8 lg:hidden"}`} />

                {/* --- Travelers --- */}
                <div className={`flex shrink-0 items-center gap-2 lg:gap-3 text-sm ${isDocked ? "max-lg:flex-col max-lg:gap-0.5" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 lg:h-auto lg:w-auto lg:bg-transparent lg:p-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className={`text-center ${isDocked ? "max-lg:text-[10px] max-lg:leading-none max-lg:text-foreground" : ""}`}>
                    <span className="font-medium max-lg:font-bold">{trip.travelers}</span>
                    <span className={`hidden lg:inline ${isDocked ? "max-lg:hidden" : ""}`}> Travelers</span>
                    <p className={`text-xs text-muted-foreground lg:hidden ${isDocked ? "max-lg:hidden" : ""}`}>
                      People
                    </p>
                  </div>
                </div>

                {/* --- Budget --- */}
                {trip.budget && (
                  <>
                    <Separator orientation="vertical" className={`bg-foreground/10 ${isDocked ? "max-lg:hidden" : "h-8 lg:hidden"}`} />
                    <div className={`flex shrink-0 items-center gap-2 lg:gap-3 text-sm ${isDocked ? "max-lg:flex-col max-lg:gap-0.5" : ""}`}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 lg:h-auto lg:w-auto lg:bg-transparent lg:p-0">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div className={`text-center ${isDocked ? "max-lg:text-[10px] max-lg:leading-none max-lg:text-foreground" : ""}`}>
                        <p className="font-medium max-lg:font-bold truncate max-w-[40px] lg:max-w-none">{trip.budget}</p>
                        <p className={`text-xs text-muted-foreground lg:hidden ${isDocked ? "max-lg:hidden" : ""}`}>Budget</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator orientation="vertical" className={`bg-foreground/10 ${isDocked ? "max-lg:hidden" : "h-8 lg:hidden"}`} />

                {/* --- Creator --- */}
                <div
                  onClick={() => navigate(`/profile/${apiTrip?.profileId}`)}
                  className={`flex shrink-0 items-center gap-2 cursor-pointer transition-colors lg:hover:bg-muted/80 lg:w-full lg:rounded-lg lg:bg-muted lg:p-[6px] ${isDocked ? "max-lg:justify-center" : ""}`}
                >
                  <div className="flex h-8 w-8 overflow-hidden items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {creatorImage ? (
                      <img src={creatorImage} alt="Creator" className="h-full w-full object-cover" />
                    ) : (
                      <span>{trip.createdByAvatar || apiTrip?.profileUserName?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className={isDocked ? "max-lg:hidden" : "hidden lg:block"}>
                    <p className="text-sm font-medium hover:underline">
                      {trip.createdBy || apiTrip?.profileUserName}
                    </p>
                    <p className="text-xs text-muted-foreground">Trip Creator</p>
                  </div>
                </div>

                <div className={`lg:hidden shrink-0 flex items-center justify-center ${isDocked ? "mt-2" : "ml-1"}`}>
                  <button
                    onClick={() => setIsDocked(!isDocked)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-95 shadow-sm
          ${isDocked ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                  >
                    {isDocked ? <AlignVerticalSpaceAround className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                  </button>
                </div>

              </div>
            </motion.div>

            {/* Actions / Floating Bottom Bar */}
            <div
              className={`
  group duration-500 ease-in-out transition-all will-change-transform
  max-lg:fixed max-lg:bottom-6 max-lg:inset-x-0 max-lg:z-50 max-lg:mx-auto max-lg:w-fit max-lg:max-w-[95%]
  max-lg:flex max-lg:flex-row max-lg:items-center max-lg:justify-center max-lg:gap-2 
  max-lg:rounded-full max-lg:border max-lg:border-white/20 max-lg:bg-background/80 max-lg:p-2 max-lg:px-4 max-lg:backdrop-blur-xl max-lg:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
  lg:relative lg:space-y-3 lg:rounded-lg lg:border lg:border-gray-200/50 lg:bg-card lg:p-5 lg:shadow-card
  ${isNavVisible ? "max-lg:translate-y-0 max-lg:opacity-100" : "max-lg:translate-y-32 max-lg:opacity-0 max-lg:pointer-events-none"}
`}
            >
              <h3 className="hidden font-display font-semibold lg:block">
                Actions
              </h3>

              <div className="flex w-full max-lg:flex-row max-lg:items-center max-lg:justify-center max-lg:gap-2 lg:flex-col lg:gap-[6px]">
                {trip && apiTrip && !isAdmin && (
                  <div className="max-lg:shrink-0">
                    <JoinTripDialog
                      tripId={trip.id}
                      tripName={trip.name}
                      userStatus={apiTrip?.userJoinStatus}
                    />
                  </div>
                )}

                {isAdmin && (
                  <div className="max-lg:shrink-0">
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
                      onSaved={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["tripDetails", id],
                        })
                      }
                    />
                  </div>
                )}

                <Button
                  variant={isFav ? "ghost" : "ghost"}
                  className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 lg:bg-blue-50/50 hover:lg:bg-blue-50 hover:text-blue-700"
                  onClick={handleSaveTrip}
                  disabled={savingFav}
                  title={isFav ? "Saved" : "Save Trip"}
                >
                  {savingFav ? (
                    <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" />
                  ) : (
                    <Bookmark
                      className={`h-5 w-5 lg:h-4 lg:w-4 ${isFav ? "fill-current text-primary" : ""}`}
                    />
                  )}
                  <span className="hidden lg:inline">
                    {isFav ? "Saved" : "Save Trip"}
                  </span>
                </Button>

                {apiTrip?.conversationId &&
                  (apiTrip?.userJoinStatus === 1 || isAdmin) && (
                    <Link
                      to={`/chat/${apiTrip.conversationId}`}
                      className="w-full max-lg:w-auto max-lg:shrink-0"
                    >
                      <Button
                        variant="ghost"
                        className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 lg:bg-blue-50/50 hover:lg:bg-blue-50 hover:text-blue-700"
                        title="Trip Chat"
                      >
                        <MessageCircle className="h-5 w-5 lg:h-4 lg:w-4" />
                        <span className="hidden lg:inline font-medium">
                          Trip Chat
                        </span>
                      </Button>
                    </Link>
                  )}
                {/* ------------------------------------------------ */}

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 lg:bg-blue-50/50 hover:lg:bg-blue-50 hover:text-blue-700"
                    onClick={handleChangeVision}
                    disabled={changingVision}
                    title={isPublic ? "Make Private" : "Make Public"}
                  >
                    {changingVision ? (
                      <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" />
                    ) : isPublic ? (
                      <Lock className="h-5 w-5 lg:h-4 lg:w-4" />
                    ) : (
                      <Globe className="h-5 w-5 lg:h-4 lg:w-4" />
                    )}
                    <span className="hidden lg:inline">
                      Make {isPublic ? "Private" : "Public"}
                    </span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 lg:bg-blue-50/50 hover:lg:bg-blue-50 hover:text-blue-700"
                  onClick={handleShare}
                  title="Share Trip"
                >
                  <Share2 className="h-5 w-5 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline">Share Trip</span>
                </Button>

                {isAdmin && (
                  <Dialog onOpenChange={(o) => o && loadPendingRequests()}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full gap-2 relative max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 lg:bg-blue-50/50 hover:lg:bg-blue-50 hover:text-blue-700"
                        title="Join Requests"
                      >
                        <UserCheck className="h-5 w-5 lg:h-4 lg:w-4" />
                        <span className="hidden lg:inline">Join Requests</span>
                        {pendingCount > 0 && (
                          <Badge className="absolute max-lg:top-1 max-lg:right-1 lg:ml-auto border-0 bg-secondary text-secondary-foreground max-lg:h-4 max-lg:w-4 max-lg:p-0 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-[10px]">
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
                        variant="ghost"
                        className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border lg:border-gray-100 lg:bg-destructive lg:text-destructive-foreground lg:hover:bg-destructive/90 text-destructive hover:bg-destructive/10"
                        disabled={deleting}
                        title="Delete Trip"
                      >
                        {deleting ? (
                          <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" />
                        ) : (
                          <Trash2 className="h-5 w-5 lg:h-4 lg:w-4" />
                        )}
                        <span className="hidden lg:inline">Delete Trip</span>
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
    </div>
  );
};

export default TripDetail;
