import { MapPin, Clock, ExternalLink, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import type { Restaurant } from "@/types/trip";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  restaurants: Restaurant[];
}

const RestaurantsSection = ({ restaurants }: Props) => {
  const { t, language } = useLanguage();

  if (!restaurants?.length) return null;

  const getMapLink = (r: Restaurant) => {
    if (r.mapsUrl) return r.mapsUrl;
    const query = encodeURIComponent(`${r.name} ${r.location || ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Improved time formatting for i18n (AM/PM vs ص/م)
  const formatTime = (tStr?: string) => {
    if (!tStr) return "";
    try {
      const [hours, minutes] = tStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return tStr.slice(0, 5); // Fallback
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Utensils className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold dark:text-slate-100">
          {t("tripDetail.topRestaurants")}
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {restaurants.map((r) => {
          const mapUrl = getMapLink(r);
          const hours = r.openTime || r.closeTime 
            ? `${formatTime(r.openTime)} – ${formatTime(r.closeTime)}` 
            : null;

          return (
            <a
              key={r.id}
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-800 bg-card dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted dark:bg-slate-800">
                {r.image && (
                  <img 
                    src={r.image} 
                    alt={r.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold dark:text-slate-100 transition-colors group-hover:text-primary">
                    {r.name}
                  </h3>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {r.reviewsCount > 0 && <RatingStars rating={r.rating} reviewsCount={r.reviewsCount} />}
                  <Badge variant="secondary" className="text-[10px] dark:bg-slate-800 dark:text-slate-300">
                    {r.cuisine}
                  </Badge>
                </div>

                {r.description && (
                  <p className="mt-3 text-sm text-muted-foreground dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-200/50 dark:border-slate-800 pt-4 text-xs font-medium text-muted-foreground dark:text-slate-400">
                  <div className="flex flex-wrap gap-3">
                    {r.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {r.location}
                      </span>
                    )}
                    {hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span dir="ltr">{hours}</span> {/* Force LTR for time ranges */}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantsSection;