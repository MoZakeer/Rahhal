import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  UserPlus,
  ArrowRight,
  Clock,
  Check,
  Wallet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

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
  matchPercentage: number;
  travelPreference?: { id: string; name: string }[];
  destination?: string;
  budget?: number;
  userJoinStatus: number;
}

interface MatchResultCardProps {
  trip: ApiMatchTrip;
  index: number;
  onJoin: (id: string, name: string) => void;
}

const getMatchStyles = (pct: number) => {
  if (pct >= 80)
    return {
      text: "text-primary",
      bg: "bg-primary/10",
      ring: "ring-primary/20",
      progress: "bg-primary",
    };
  if (pct >= 60)
    return {
      text: "text-primary/80",
      bg: "bg-primary/5",
      ring: "ring-primary/10",
      progress: "bg-primary/80",
    };
  return {
    text: "text-slate-500",
    bg: "bg-slate-50",
    ring: "ring-slate-100",
    progress: "bg-slate-400",
  };
};

const MatchResultCard = ({ trip, onJoin }: MatchResultCardProps) => {
  const avatarLetter = trip.createdBy
    ? trip.createdBy.charAt(0).toUpperCase()
    : "U";
  const imageSeed = encodeURIComponent(
    trip.destination || trip.name || trip.id,
  );
  const hasValidImage = Boolean(
    trip.imageUrl &&
    trip.imageUrl !== "string" &&
    trip.imageUrl.startsWith("http"),
  );
  const displayImage = hasValidImage
    ? trip.imageUrl
    : `https://picsum.photos/seed/${imageSeed}/800/600`;
  const formattedMatch = Math.round(trip.matchPercentage || 0);
  const matchStyle = getMatchStyles(formattedMatch);

  // 1. حالات زرار الانضمام (Micro-interaction States)
  const [isJoining, setIsJoining] = useState(false);
  const isPastTrip = trip.startDate
    ? new Date(trip.startDate) < new Date()
    : false;

  const handleJoinClick = () => {
    setIsJoining(true);
    // تأخير مصطنع (600ms) لإعطاء إحساس نفسي للمستخدم بأن النظام يعالج طلبه
    setTimeout(() => {
      onJoin(trip.id, trip.name);
      setIsJoining(false);
    }, 600);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group flex flex-col md:flex-row overflow-hidden rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
    >
      {/* --- Image Section --- */}
      <div className="relative h-56 w-full shrink-0 md:h-auto md:w-64 overflow-hidden bg-slate-50">
        <img
          src={displayImage as string}
          alt={trip.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* --- Info Section --- */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {trip.name}
              </h3>
              {trip.destination && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <MapPin className="h-4 w-4" />
                  {trip.destination}
                </div>
              )}
            </div>

            {/* Premium Match Indicator */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${matchStyle.bg} ring-4 ${matchStyle.ring} shadow-sm transition-colors`}
              >
                <span className={`text-lg font-bold ${matchStyle.text}`}>
                  {formattedMatch}%
                </span>
              </div>
              <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Match
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500 leading-relaxed line-clamp-2">
            {trip.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {trip.startDate
                ? new Date(trip.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "TBD"}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              {trip.numberOfUser} travelers
            </span>
            {trip.budget && (
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Wallet className="h-4 w-4 text-slate-400" />${trip.budget}
              </span>
            )}
          </div>

          {/* Minimalist Progress Bar */}
          <div className="mt-4">
            <Progress
              value={formattedMatch}
              className={`h-1 bg-slate-100 ${matchStyle.progress}`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {trip.travelPreference?.map((pref) => (
              <Badge
                key={pref.id}
                variant="secondary"
                className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 text-xs font-medium px-2.5 py-0.5 rounded-md transition-colors"
              >
                {pref.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* --- Footer / Actions --- */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shadow-sm border border-primary/20">
              {avatarLetter}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Created by
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {trip.createdBy || "Unknown"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/trip/${trip.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                Details <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* 🚀 السحر يبدأ هنا: التفاعلات الدقيقة (Micro-interactions) 🚀 */}
            <AnimatePresence mode="popLayout">
              {isPastTrip ? (
                <motion.div
                  key="ended"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-slate-200 bg-slate-50 text-slate-400 cursor-default rounded-lg"
                    disabled
                  >
                    <Clock className="h-4 w-4" />
                    Trip Ended
                  </Button>
                </motion.div>
              ) : trip.userJoinStatus === 1 ? (
                <motion.div
                  key="joined"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-green-200 bg-green-50 text-green-700 cursor-default rounded-lg"
                    disabled
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", bounce: 0.6 }}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </motion.div>
                    Joined
                  </Button>
                </motion.div>
              ) : trip.userJoinStatus === 2 ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.5, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700 cursor-default rounded-lg"
                    disabled
                  >
                    {/* دوران خفيف جداً لأيقونة الساعة لتعطي إحساس بالانتظار */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Clock className="h-4 w-4 text-amber-600" />
                    </motion.div>
                    Pending
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="join"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm transition-all w-[90px] flex justify-center items-center"
                    onClick={handleJoinClick}
                    disabled={isJoining}
                  >
                    <AnimatePresence mode="wait">
                      {isJoining ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-1.5"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-1.5"
                        >
                          <UserPlus className="h-4 w-4" /> Join
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchResultCard;
