import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EventItem } from "@/data/mockData";

interface Props {
  events: EventItem[];
}

const EventsSection = ({ events }: Props) => {
  if (!events?.length) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Events & Festivals</h2>
      <p className="mt-1 text-sm text-muted-foreground">Don't miss what's happening during your stay</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {events.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-lg border border-gray-300 bg-card shadow-card transition-shadow hover:shadow-elegant">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={e.image} alt={e.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold">{e.name}</h3>
                <Badge variant="secondary" className="shrink-0">{e.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{e.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsSection;
