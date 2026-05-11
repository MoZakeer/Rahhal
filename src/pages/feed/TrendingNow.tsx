import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

interface TrendingTrip {
  city: string;
  amount: number;
}

export default function TrendingNow() {
  const [trendingTrips, setTrendingTrips] = useState<TrendingTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTrips = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "https://rahhal-api.runasp.net/TripManagement/MostRelevantTrips",
          {
            method: "GET",
            headers: {
              accept: "text/plain",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.isSuccess) {
          setTrendingTrips(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch trending trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTrips();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-rose-500 dark:text-rose-400" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">
          Trending Now
        </h3>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Skeleton count={3} height={50} className="mb-2" />
        ) : trendingTrips.length > 0 ? (
          trendingTrips.map((trip) => (
            <div key={trip.city} className="cursor-pointer group">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                #{trip.city.replace(/\s+/g, "_")}
              </p>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                {trip.amount} adventures shared
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No trending trips found.</p>
        )}
      </div>
    </div>
  );
}
