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
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import VibesStoryBar from "@/features/vibes/components/VibesStoryBar";

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
  const { t, language } = useLanguage();
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
      toast.success(t("tripDetail.imageUpdated"));
      queryClient.invalidateQueries({ queryKey: ["tripDetails", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("tripDetail.imageUpdateFailed"));
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

  const formatBudget = (amount: any) => {
    if (!amount) return t("tripDetail.unknown");

    const cleanAmount = String(amount).replace(/[^0-9.]/g, "");
    const value = Number(cleanAmount);

    if (isNaN(value) || cleanAmount === "") {
      return t("tripDetail.unknown");
    }

    const formattedNumber = new Intl.NumberFormat(
      language === "ar" ? "ar-EG" : "en-US",
      {
        style: "decimal",
        maximumFractionDigits: 0,
      },
    ).format(value);

    return language === "ar"
      ? `${formattedNumber} ${t("tripDetail.budgetLabel")}`
      : `${t("tripDetail.budgetLabel")} ${formattedNumber}`;
  };
  // Floating <div> block removed to fix the React syntax error

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-blue-500" />
        <p className="text-sm text-muted-foreground dark:text-slate-400">
          {t("tripDetail.loadingTrip")}
        </p>
      </div>
    );
  }

  if (error || !trip || !apiTrip) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-lg text-muted-foreground dark:text-slate-400">
          {error ?? t("tripDetail.tripNotFound")}
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
        >
          {t("tripDetail.backToExplore")}
        </Button>
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
    toast.success(t("tripDetail.linkCopied"));
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
      toast.success(
        !isPublic
          ? t("tripDetail.tripMadePublic")
          : t("tripDetail.tripMadePrivate"),
      );
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : t("tripDetail.failedToChangeVisibility");
      toast.error(msg);
    } finally {
      setChangingVision(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      toast.success(t("tripDetail.deleteSuccess"));
      navigate("/");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : t("tripDetail.deleteFailed");
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
    <div className="relative min-h-screen pb-12">
      <div className="transition-all duration-300">
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
                {/* Dark mode overlay adjustment */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 dark:from-slate-900/90 dark:via-slate-900/40 to-transparent" />
              </div>
            </DialogTrigger>

            {uploadImageMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <Loader2 className="h-10 w-10 animate-spin text-white drop-shadow-md" />
              </div>
            )}

            {/* Changed left-4 to start-4 */}
            <div className="absolute start-4 top-4 z-10">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(-1);
                }}
                variant="ghost"
                size="icon"
                className="rounded-full bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-card dark:hover:bg-slate-700"
              >
                {/* Added RTL flip for the back arrow */}
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>

            {isAdmin && (
              // Changed right-4 to end-4
              <div className="absolute end-4 bottom-4 z-10">
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
                    {t("tripDetail.changeCover")}
                  </span>
                </Button>
              </div>
            )}

            {/* Changed left-0 right-0 to start-0 end-0 */}
            <div className="absolute bottom-6 start-0 end-0 px-4 pointer-events-none">
              <div className="container pointer-events-auto">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {trip.isAiGenerated && (
                    <Badge className="gap-1 border-0 bg-secondary text-secondary-foreground">
                      <Sparkles className="h-3 w-3" />{" "}
                      {t("tripDetail.aiGenerated")}
                    </Badge>
                  )}
                  {/* Added dark mode styling */}
                  <Badge className="gap-1 border-0 bg-card/80 dark:bg-slate-800/80 text-card-foreground dark:text-slate-100 backdrop-blur-sm">
                    {isPublic ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {isPublic ? t("tripDetail.public") : t("tripDetail.private")}
                  </Badge>
                  {apiTrip.tripStatus && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "backdrop-blur-sm px-3 py-1 font-bold transition-all",
                        apiTrip.tripStatus.toLowerCase() === "completed" &&
                        "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400",
                        apiTrip.tripStatus.toLowerCase() === "planned" &&
                        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400",
                        apiTrip.tripStatus.toLowerCase() === "upcoming" &&
                        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400",
                        apiTrip.tripStatus.toLowerCase() === "past" &&
                        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400",
                      )}
                    >
                      {t(`tripDetail.status.${apiTrip.tripStatus.toLowerCase()}`)}
                    </Badge>
                  )}
                </div>
                {/* Forced text-white for visibility in both modes */}
                <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
                  {trip.name}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
              </div>
            </div>
          </div>

          {trip.image && (
            <DialogContent className="max-w-5xl bg-transparent border-none shadow-none p-0 flex items-center justify-center [&>button]:fixed [&>button]:top-6 [&>button]:right-6 [&>button]:z-[100] [&>button]:text-white [&>button]:bg-black/50 hover:[&>button]:bg-black/80 [&>button]:p-3 [&>button]:rounded-full [&>button]:backdrop-blur-sm [&>button]:border [&>button]:border-white/20 [&_svg]:h-6 [&_svg]:w-6">
              <DialogTitle className="sr-only">
                {t("tripDetail.tripCoverImage")}
              </DialogTitle>
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
        
        <VibesStoryBar
          tripId={trip.id}
          trip={{
            ownerId: apiTrip.profileId,
            travelers:
              apiTrip.travelers?.map((t: any) => ({
                profileId: t.profileId,
                userName: t.userName,
                imageUrl: t.imageUrl,
              })) || [],
          }}
          currentUserId={currentUserId}
          currentUserName="You"
        />

        <div className="container mt-2 px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-6 lg:col-span-2 min-w-0">
              {/* About Section */}
              <div>
                <h2 className="font-display text-xl font-semibold dark:text-slate-100">
                  {t("tripDetail.aboutTrip")}
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground dark:text-slate-400">
                  {trip.description || t("tripDetail.noDescription")}
                </p>
                {trip.tags && trip.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trip.tags.map((tag) => {
                      const tagKey = tag.toLowerCase();

                      const translatedTag = t(`categories.${tagKey}`);
                      const displayTag =
                        translatedTag !== `categories.${tagKey}`
                          ? translatedTag
                          : tag;

                      return (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={cn(
                            "px-3 py-1 text-xs font-semibold transition-colors",
                            "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent",
                            "dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700 backdrop-blur-sm",
                          )}
                        >
                          {displayTag}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator className="dark:bg-slate-800" />

              {/* Itinerary Section */}
              {trip.itinerary.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold dark:text-slate-100">
                    {t("tripDetail.itinerary")}
                  </h2>
                  <div className="mt-6 space-y-8">
                    {trip.itinerary.map((day) => (
                      <div
                        key={day.day}
                        className="relative ps-8 border-s-2 border-primary/20"
                      >
                        <div className="absolute -start-[11px] top-0 h-5 w-5 rounded-full bg-primary" />
                        <h3 className="text-lg font-bold text-primary">
                          {t("tripDetail.day")} {day.day}
                        </h3>

                        <div className="mt-4 space-y-6">
                          {day.stops?.map((stop, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-gray-200/50 dark:border-slate-800 bg-card dark:bg-slate-900 overflow-hidden shadow-sm"
                            >
                              <div className="flex flex-col md:flex-row">
                                {stop.image && (
                                  <div className="overflow-hidden md:w-[320px] md:h-full shrink-0">
                                    <SafeImage
                                      src={stop.image}
                                      category={stop.category}
                                      className="h-48 w-full md:h-full md:min-h-[220px] object-cover bg-muted dark:bg-slate-800 transition-transform duration-300 md:group-hover:scale-110"
                                    />
                                  </div>
                                )}

                                <div className="p-4 flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-bold text-lg dark:text-slate-100">
                                        {stop.place || stop.category}
                                      </h4>
                                      <Badge
                                        variant="secondary"
                                        className="mt-1 dark:bg-slate-800 dark:text-slate-300"
                                      >
                                        {stop.category}
                                      </Badge>
                                    </div>
                                    {stop.arrivalTime && (
                                      <Badge
                                        variant="outline"
                                        className="gap-1 dark:border-slate-700 dark:text-slate-300"
                                      >
                                        <Clock className="h-3 w-3" />{" "}
                                        {stop.arrivalTime}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400 line-clamp-3">
                                    {stop.description}
                                  </p>

                                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground dark:text-slate-400">
                                    {stop.ticketPrice !== undefined && (
                                      <span className="flex items-center gap-1">
                                        <Ticket className="h-3 w-3" />{" "}
                                        {stop.ticketPrice === 0
                                          ? t("tripDetail.free")
                                          : `$${stop.ticketPrice}`}
                                      </span>
                                    )}
                                    {stop.mapsUrl && (
                                      <a
                                        href={stop.mapsUrl}
                                        target="_blank"
                                        className="flex items-center gap-1 text-primary hover:underline ms-auto"
                                      >
                                        <ExternalLink className="h-3 w-3" />{" "}
                                        {t("tripDetail.viewMap")}
                                      </a>
                                    )}
                                  </div>

                                  {stop?.recommendations &&
                                    (stop?.recommendations as any[]).length >
                                    0 && (
                                      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-800">
                                        <p className="text-xs font-semibold text-muted-foreground dark:text-slate-400 mb-3 uppercase tracking-wider">
                                          {t("tripDetail.nearbyPlaces")}
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
                                                        t(
                                                          "tripDetail.mapNotAvailable",
                                                        ),
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="overflow-hidden rounded-md">
                                                    <img
                                                      src={reco.image}
                                                      className="h-20 w-full object-cover bg-muted dark:bg-slate-800 transition-transform duration-300 group-hover:scale-110"
                                                      alt={reco.name}
                                                    />
                                                  </div>
                                                  <p className="text-xs font-medium mt-1.5 truncate transition-colors group-hover:text-primary dark:text-slate-300">
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

              {/* Discover Destination / Tabs Section */}
              {!trip.isAiGenerated &&
                (trip.attractions?.length ||
                  trip.hotels?.length ||
                  trip.restaurants?.length) ? (
                <>
                  <div>
                    <h2 className="font-display text-xl font-semibold dark:text-slate-100">
                      {t("tripDetail.discoverDestination")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                      {t("tripDetail.filterByCategory")}
                    </p>

                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => setActiveTab(v as TripDetailsFilter)}
                      className="mt-4"
                    >
                      <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-muted/50 dark:bg-slate-800/50 p-1.5 rounded-xl">
                        <TabsTrigger
                          value="all"
                          className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
                        >
                          <LayoutGrid className="w-4 h-4 me-2" />
                          {t("tripDetail.all")}
                        </TabsTrigger>

                        {trip.attractions && trip.attractions.length > 0 && (
                          <TabsTrigger
                            value="attractions"
                            className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
                          >
                            <MapPin className="w-4 h-4 me-2" />
                            {t("tripDetail.attractions")}
                            <Badge
                              variant="secondary"
                              className="ms-2 text-[10px] px-1.5 py-0 bg-background dark:bg-slate-900 dark:text-slate-300"
                            >
                              {trip.attractions.length}
                            </Badge>
                          </TabsTrigger>
                        )}

                        {trip.hotels && trip.hotels.length > 0 && (
                          <TabsTrigger
                            value="hotels"
                            className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
                          >
                            <Bed className="w-4 h-4 me-2" />
                            {t("tripDetail.hotels")}
                            <Badge
                              variant="secondary"
                              className="ms-2 text-[10px] px-1.5 py-0 bg-background dark:bg-slate-900 dark:text-slate-300"
                            >
                              {trip.hotels.length}
                            </Badge>
                          </TabsTrigger>
                        )}

                        {trip.restaurants && trip.restaurants.length > 0 && (
                          <TabsTrigger
                            value="restaurants"
                            className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
                          >
                            <Utensils className="w-4 h-4 me-2" />
                            {t("tripDetail.restaurants")}
                            <Badge
                              variant="secondary"
                              className="ms-2 text-[10px] px-1.5 py-0 bg-background dark:bg-slate-900 dark:text-slate-300"
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
                // Drag works only in vertical mode (y)
                drag={isDocked ? "y" : false}
                dragConstraints={{ top: -200, bottom: 300 }}
                dragElastic={0.1}
                dragMomentum={false}
                className={`
      group duration-500 ease-in-out transition-all will-change-transform z-50 mb-[2px]
      
      /* --- 1. Horizontal Mode (Mobile and Desktop) --- */
      ${!isDocked
                    ? `max-lg:fixed max-lg:top-4 max-lg:inset-x-0 max-lg:mx-auto 
           max-lg:w-[96%] max-lg:max-w-md /* 96% width for better UX */
           max-lg:flex-row max-lg:rounded-full max-lg:border max-lg:border-white/20 
           max-lg:bg-background/80 dark:max-lg:bg-slate-900/80 max-lg:p-2 max-lg:px-3 /* Reduced inner padding */
           max-lg:backdrop-blur-xl max-lg:shadow-2xl 
           lg:relative lg:rounded-lg lg:border lg:border-gray-200/50 dark:lg:border-slate-800 lg:bg-card dark:lg:bg-slate-900 lg:p-5 lg:w-full lg:shadow-card lg:mt-[2px] 
           ${isNavVisible ? "max-lg:translate-y-16" : "max-lg:translate-y-0"}`
                    : ""
                  }
        
      /* --- 2. Vertical Mode (Docked) for Mobile --- */
      ${isDocked
                    ? "max-lg:fixed max-lg:end-3 max-lg:top-1/4 max-lg:w-auto max-lg:flex-col max-lg:rounded-full max-lg:border max-lg:border-white/20 max-lg:bg-background/90 dark:max-lg:bg-slate-900/90 max-lg:p-3 max-lg:backdrop-blur-xl max-lg:shadow-2xl lg:relative lg:rounded-lg lg:border lg:border-gray-200/50 dark:lg:border-slate-800 lg:bg-card dark:lg:bg-slate-900 lg:p-5 lg:w-full lg:shadow-card lg:mt-[2px]"
                    : ""
                  }
    `}
              >
                {/* Title (Shows in desktop only) */}
                <h3
                  className={`font-display font-semibold mb-3 dark:text-slate-100 ${isDocked ? "max-lg:hidden" : "hidden lg:block"}`}
                >
                  {t("tripDetail.tripDetails")}
                </h3>

                <div
                  className={`flex transition-all duration-300
      ${isDocked
                      ? "max-lg:flex-col max-lg:space-y-4 max-lg:items-center"
                      : "flex-row items-center justify-between w-full gap-1" /* gap-1 to reduce clutter */
                    }
      lg:flex-col lg:space-y-4 lg:items-start lg:mt-[3px]
    `}
                >
                  {/* --- Date --- */}
                  <div
                    className={`flex shrink-0 items-center gap-1.5 lg:gap-3 text-sm ${isDocked ? "max-lg:flex-col max-lg:gap-0.5" : ""}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 lg:h-auto lg:w-auto lg:bg-transparent lg:p-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div
                      className={`text-center ${isDocked ? "max-lg:text-[10px] max-lg:leading-none max-lg:text-foreground" : ""}`}
                    >
                      <span
                        className={`hidden font-bold dark:text-slate-200 ${isDocked ? "max-lg:block" : ""}`}
                      >
                        {daysDiff}d
                      </span>
                      <div className={`${isDocked ? "max-lg:hidden" : ""}`}>
                        <p className="hidden font-medium lg:block dark:text-slate-200">
                          {new Date(trip.startDate).toLocaleDateString(
                            language === "ar" ? "ar-EG" : "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )}
                        </p>
                        <p className="font-medium lg:hidden dark:text-slate-200">
                          {new Date(trip.startDate).toLocaleDateString(
                            language === "ar" ? "ar-EG" : "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 lg:text-sm">
                          {daysDiff} {t("tripDetail.day")}s
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator
                    orientation="vertical"
                    className={`bg-foreground/10 dark:bg-slate-800 ${isDocked ? "max-lg:hidden" : "h-6 lg:hidden"}`}
                  />

                  {/* --- Travelers --- */}
                  <div
                    className={`flex shrink-0 items-center gap-1.5 lg:gap-3 text-sm ${isDocked ? "max-lg:flex-col max-lg:gap-0.5" : ""}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 lg:h-auto lg:w-auto lg:bg-transparent lg:p-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div
                      className={`text-center ${isDocked ? "max-lg:text-[10px] max-lg:leading-none max-lg:text-foreground" : ""}`}
                    >
                      <span className="font-medium max-lg:font-bold dark:text-slate-200">
                        {trip.travelers}
                      </span>
                      <span
                        className={`hidden lg:inline dark:text-slate-400 ${isDocked ? "max-lg:hidden" : ""}`}
                      >
                        {" "}
                        {t("tripDetail.travelers")}
                      </span>
                      <p
                        className={`text-xs text-muted-foreground dark:text-slate-400 lg:hidden ${isDocked ? "max-lg:hidden" : ""}`}
                      >
                        {t("tripDetail.people")}
                      </p>
                    </div>
                  </div>

                  {/* --- Budget --- */}
                  {/* --- Budget --- */}
                  {trip.budget && (
                    <>
                      <Separator
                        orientation="vertical"
                        className={`bg-foreground/10 dark:bg-slate-800 ${isDocked ? "max-lg:hidden" : "h-6 lg:hidden"}`}
                      />
                      <div
                        className={`flex shrink-0 items-center gap-1.5 lg:gap-3 text-sm ${isDocked ? "max-lg:flex-col max-lg:gap-0.5" : ""}`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 lg:h-auto lg:w-auto lg:bg-transparent lg:p-0">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div
                          className={`text-center ${isDocked ? "max-lg:text-[10px] max-lg:leading-none max-lg:text-foreground" : ""}`}
                        >
                          {/* التعديل هنا: نستخدم formatBudget */}
                          <p className="font-medium max-lg:font-bold truncate max-w-[80px] lg:max-w-none dark:text-slate-200">
                            {formatBudget(trip.budget)}
                          </p>
                          <p
                            className={`text-xs text-muted-foreground dark:text-slate-400 lg:hidden ${isDocked ? "max-lg:hidden" : ""}`}
                          >
                            {t("tripDetail.budget")}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator
                    orientation="vertical"
                    className={`bg-foreground/10 dark:bg-slate-800 ${isDocked ? "max-lg:hidden" : "h-6 lg:hidden"}`}
                  />

                  {/* --- Creator --- */}
                  <div
                    onClick={() => navigate(`/profile/${apiTrip?.profileId}`)}
                    className={`flex shrink-0 items-center gap-1.5 cursor-pointer transition-colors lg:hover:bg-muted/80 dark:lg:hover:bg-slate-700/80 lg:w-full lg:rounded-lg lg:bg-muted dark:lg:bg-slate-800 lg:p-[6px] ${isDocked ? "max-lg:justify-center" : ""}`}
                  >
                    <div className="flex h-7 w-7 lg:h-8 lg:w-8 overflow-hidden items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                      {creatorImage ? (
                        <img
                          src={creatorImage}
                          alt="Creator"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {trip.createdByAvatar ||
                            apiTrip?.profileUserName?.charAt(0) ||
                            "U"}
                        </span>
                      )}
                    </div>
                    <div
                      className={isDocked ? "max-lg:hidden" : "hidden lg:block"}
                    >
                      <p className="text-[13px] font-medium hover:underline lg:text-sm dark:text-slate-200">
                        {trip.createdBy || apiTrip?.profileUserName}
                      </p>
                      <p className="text-[10px] text-muted-foreground dark:text-slate-400 lg:text-xs">
                        {t("tripDetail.tripCreator")}
                      </p>
                    </div>
                  </div>

                  {/* --- Toggle Button --- */}
                  <div
                    className={`lg:hidden shrink-0 flex items-center justify-center ${isDocked ? "mt-2" : "ms-0.5"}`}
                  >
                    <button
                      onClick={() => setIsDocked(!isDocked)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-90 shadow-sm
            ${isDocked ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                    >
                      {isDocked ? (
                        <AlignVerticalSpaceAround className="h-4 w-4" />
                      ) : (
                        <PanelRight className="h-4 w-4" />
                      )}
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
  max-lg:rounded-full max-lg:border max-lg:border-white/20 max-lg:bg-background/80 dark:max-lg:bg-slate-900/80 max-lg:p-2 max-lg:px-4 max-lg:backdrop-blur-xl max-lg:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
  lg:relative lg:space-y-3 lg:rounded-lg lg:border lg:border-gray-200/50 dark:lg:border-slate-800 lg:bg-card dark:lg:bg-slate-900 lg:p-5 lg:shadow-card
  ${isNavVisible ? "max-lg:translate-y-0 max-lg:opacity-100" : "max-lg:translate-y-32 max-lg:opacity-0 max-lg:pointer-events-none"}
`}
              >
                <h3 className="hidden font-display font-semibold lg:block dark:text-slate-100">
                  {t("tripDetail.actions")}
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
                    className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 dark:lg:border-slate-800 lg:bg-blue-50/50 dark:lg:bg-slate-800/50 hover:lg:bg-blue-50 dark:hover:lg:bg-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-400"
                    onClick={handleSaveTrip}
                    disabled={savingFav}
                    title={
                      isFav ? t("tripDetail.saved") : t("tripDetail.saveTrip")
                    }
                  >
                    {savingFav ? (
                      <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" />
                    ) : (
                      <Bookmark
                        className={`h-5 w-5 lg:h-4 lg:w-4 ${isFav ? "fill-current text-primary" : ""}`}
                      />
                    )}
                    <span className="hidden lg:inline">
                      {isFav ? t("tripDetail.saved") : t("tripDetail.saveTrip")}
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
                          className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 dark:lg:border-slate-800 lg:bg-blue-50/50 dark:lg:bg-slate-800/50 hover:lg:bg-blue-50 dark:hover:lg:bg-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-400"
                          title={t("tripDetail.tripChat")}
                        >
                          <MessageCircle className="h-5 w-5 lg:h-4 lg:w-4" />
                          <span className="hidden lg:inline font-medium">
                            {t("tripDetail.tripChat")}
                          </span>
                        </Button>
                      </Link>
                    )}

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 dark:lg:border-slate-800 lg:bg-blue-50/50 dark:lg:bg-slate-800/50 hover:lg:bg-blue-50 dark:hover:lg:bg-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-400"
                      onClick={handleChangeVision}
                      disabled={changingVision}
                      title={
                        isPublic
                          ? t("tripDetail.makePrivate")
                          : t("tripDetail.makePublic")
                      }
                    >
                      {changingVision ? (
                        <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" />
                      ) : isPublic ? (
                        <Lock className="h-5 w-5 lg:h-4 lg:w-4" />
                      ) : (
                        <Globe className="h-5 w-5 lg:h-4 lg:w-4" />
                      )}
                      <span className="hidden lg:inline">
                        {isPublic
                          ? t("tripDetail.makePrivate")
                          : t("tripDetail.makePublic")}
                      </span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 dark:lg:border-slate-800 lg:bg-blue-50/50 dark:lg:bg-slate-800/50 hover:lg:bg-blue-50 dark:hover:lg:bg-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-400"
                    onClick={handleShare}
                    title={t("tripDetail.shareTrip")}
                  >
                    <Share2 className="h-5 w-5 lg:h-4 lg:w-4" />
                    <span className="hidden lg:inline">
                      {t("tripDetail.shareTrip")}
                    </span>
                  </Button>

                  {isAdmin && (
                    <Dialog onOpenChange={(o) => o && loadPendingRequests()}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full gap-2 relative max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border max-lg:bg-transparent lg:justify-start lg:border lg:border-blue-100 dark:lg:border-slate-800 lg:bg-blue-50/50 dark:lg:bg-slate-800/50 hover:lg:bg-blue-50 dark:hover:lg:bg-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-400"
                          title={t("tripDetail.joinRequests")}
                        >
                          <UserCheck className="h-5 w-5 lg:h-4 lg:w-4" />
                          <span className="hidden lg:inline">
                            {t("tripDetail.joinRequests")}
                          </span>
                          {pendingCount > 0 && (
                            <Badge className="absolute max-lg:top-1 max-lg:end-1 lg:ms-auto border-0 bg-secondary text-secondary-foreground max-lg:h-4 max-lg:w-4 max-lg:p-0 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-[10px]">
                              {pendingCount}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="font-display dark:text-slate-100">
                            {t("tripDetail.joinRequests")}
                          </DialogTitle>
                          <DialogDescription className="dark:text-slate-400">
                            {t("tripDetail.reviewRequests")}
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
                          className="w-full gap-2 max-lg:h-12 max-lg:w-12 max-lg:rounded-full max-lg:p-0 max-lg:bg-transparent lg:justify-start lg:border lg:border-gray-100 dark:lg:border-slate-800 lg:bg-destructive lg:text-destructive-foreground lg:hover:bg-destructive/90 text-destructive hover:bg-destructive/10 dark:text-red-400"
                          disabled={deleting}
                          title={t("tripDetail.deleteTrip")}
                        >
                          {deleting ? (
                            <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" />
                          ) : (
                            <Trash2 className="h-5 w-5 lg:h-4 lg:w-4" />
                          )}
                          <span className="hidden lg:inline">
                            {t("tripDetail.deleteTrip")}
                          </span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-slate-100">
                            {t("tripDetail.deleteTripConfirm")}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-slate-400">
                            {t("tripDetail.deleteTripWarning")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                            {t("tripDetail.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("tripDetail.delete")}
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
    </div>
  );
};

export default TripDetail;
