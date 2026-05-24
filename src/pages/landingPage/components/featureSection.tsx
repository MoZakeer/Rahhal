import { useState, useEffect } from "react";
import {
  MapPin, Sparkles, Users, Share2, ArrowRight, Heart,
  MessageCircle, Send, CheckCheck, X, Calendar, Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthNavigation from "../hooks/useAuthNavigation";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface Feature {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  gradient: string;
}

// Store translation keys instead of raw text
const features: Feature[] = [
  {
    id: "map",
    icon: <MapPin className="w-6 h-6 text-white" />,
    titleKey: "landingPage.features.tabs.map.title",
    descKey: "landingPage.features.tabs.map.desc",
    gradient: "from-blue-500 to-sky-400",
  },
  {
    id: "ai",
    icon: <Sparkles className="w-6 h-6 text-white" />,
    titleKey: "landingPage.features.tabs.ai.title",
    descKey: "landingPage.features.tabs.ai.desc",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "chat",
    icon: <Users className="w-6 h-6 text-white" />,
    titleKey: "landingPage.features.tabs.chat.title",
    descKey: "landingPage.features.tabs.chat.desc",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    id: "vibes",
    icon: <Share2 className="w-6 h-6 text-white" />,
    titleKey: "landingPage.features.tabs.vibes.title",
    descKey: "landingPage.features.tabs.vibes.desc",
    gradient: "from-amber-500 to-orange-400",
  },
];

const getMatchStyles = (pct: number) => {
  if (pct >= 80)
    return {
      text: "text-blue-600 dark:text-blue-400 font-black",
      bg: "bg-blue-100 dark:bg-blue-900/40",
      ring: "ring-blue-200 dark:ring-blue-800/50",
      progress: "bg-blue-600 dark:bg-blue-500",
    };
  if (pct >= 60)
    return {
      text: "text-purple-600 dark:text-purple-400 font-bold",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      ring: "ring-purple-200 dark:ring-purple-800/40",
      progress: "bg-purple-500",
    };
  return {
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    ring: "ring-slate-200 dark:ring-slate-700",
    progress: "bg-slate-400",
  };
};

export default function FeaturesSection() {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const handleNavigation = useAuthNavigation();
  const [activeFeature, setActiveFeature] = useState<number>(0);

  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoinedFromMap, setIsJoinedFromMap] = useState<boolean>(false);

  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlay || selectedPin) return;

    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, selectedPin]);

  const renderMockup = () => {
    switch (activeFeature) {
      case 0: // Interactive Map
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60 dark:opacity-40"></div>

            <div className="absolute top-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("landingPage.features.mockups.map.clusters")}</span>
            </div>

            {/* Map Pins */}
            {[
              { id: 1, pct: 89, budget: 150, users: 4, img: "https://hurghadaholiday.com/uploads/0000/37/2022/11/15/fullday-scuba-diving6.jpg", top: '25%', left: '42%' },
              { id: 2, pct: 95, budget: 230, users: 3, img: "https://backpacker-eg.com/wp-content/uploads/2024/10/blog_campping.jpeg", top: '40%', left: '65%' },
              { id: 3, pct: 76, budget: 190, users: 6, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnPJzXtjN5iTbOePthPyLOUBo2nO9wWvkSnQ&s", top: '65%', left: '30%' },
              { id: 4, pct: 65, budget: 120, users: 12, img: "https://img.youm7.com/ArticleImgs/2024/12/11/319087-%D8%B4%D8%AE%D8%B5-%D9%8A%D8%B3%D8%A7%D8%B9%D8%AF-%D8%A7%D9%84%D8%AE%D8%B1-%D8%B9%D9%84%D9%89-%D9%86%D8%B3%D9%84%D9%82-%D8%A7%D9%84%D8%AC%D8%A8%D9%84.png", top: '30%', left: '75%' },
              { id: 5, pct: 82, budget: 400, users: 8, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4wjRIqL1GN8keH1d9BUmCiFtx4qdCR7ihaw&s", top: '75%', left: '55%' },
            ].map((pinData) => {
              const localizedPin = {
                ...pinData,
                name: t(`landingPage.features.mockups.map.pins.p${pinData.id}.name`),
                destination: t(`landingPage.features.mockups.map.pins.p${pinData.id}.destination`),
                date: t(`landingPage.features.mockups.map.pins.p${pinData.id}.date`),
                creator: t(`landingPage.features.mockups.map.pins.p${pinData.id}.creator`),
                prefs: [
                  t(`landingPage.features.mockups.map.pins.p${pinData.id}.prefs.0`),
                  t(`landingPage.features.mockups.map.pins.p${pinData.id}.prefs.1`)
                ]
              };

              const isSelected = selectedPin?.id === localizedPin.id;

              return (
                <motion.button
                  key={localizedPin.id}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => {
                    setSelectedPin(localizedPin);
                    setIsJoinedFromMap(false);
                    setIsAutoPlay(false);
                  }}
                  className="absolute flex flex-col items-center z-10 outline-none cursor-pointer group"
                  style={{ top: localizedPin.top, left: localizedPin.left }}
                >
                  <div className="relative flex items-center justify-center">
                    <MapPin className={`w-10 h-10 drop-shadow-xl transition-colors duration-300 ${isSelected ? 'text-blue-500 fill-blue-100 dark:fill-blue-500/20 scale-125' : 'text-slate-400 fill-slate-200 dark:text-slate-600 dark:fill-slate-900 group-hover:text-blue-400'}`} />
                    <span className="absolute top-2 text-[8px] font-black text-slate-600 dark:text-slate-200">{localizedPin.pct}%</span>
                  </div>
                </motion.button>
              );
            })}

            <AnimatePresence>
              {selectedPin && (
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.95 }}
                  className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-900 rounded-[1.25rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-30 flex flex-col sm:flex-row max-h-[300px]"
                >
                  <button onClick={() => setSelectedPin(null)} className="absolute top-2 right-2 z-40 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-colors">
                    <X className="w-3 h-3" />
                  </button>

                  <div className="relative h-24 sm:h-auto sm:w-32 shrink-0 bg-slate-100">
                    <img src={selectedPin.img} alt="trip" loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent sm:hidden" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{selectedPin.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3" /> {selectedPin.destination}
                        </div>
                      </div>

                      {(() => {
                        const styles = getMatchStyles(selectedPin.pct);
                        return (
                          <div className={`flex flex-col items-center shrink-0`}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${styles.bg} ring-2 ${styles.ring}`}>
                              <span className={`text-[10px] ${styles.text}`}>{selectedPin.pct}%</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" />{selectedPin.date}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" />{selectedPin.users} {t("landingPage.features.mockups.map.travelers")}</span>
                      <span className="flex items-center gap-1 font-medium"><Wallet className="w-3 h-3 text-slate-400" />${selectedPin.budget}</span>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${getMatchStyles(selectedPin.pct).progress}`} style={{ width: `${selectedPin.pct}%` }}></div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedPin.prefs.map((p: string, i: number) => (
                          <span key={i} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{p}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center">{selectedPin.creator[0]}</div>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{selectedPin.creator}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 1: // AI Itinerary
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full h-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 mb-5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 w-fit px-4 py-2 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800/50">
              <Sparkles className="w-4 h-4" /> {t("landingPage.features.mockups.ai.badge")}
            </div>

            <div className={cn("flex-1 relative overflow-y-auto no-scrollbar pb-4", isRtl ? "pl-2" : "pr-2")}>
              <div className={cn("absolute top-2 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800", isRtl ? "right-[11px]" : "left-[11px]")}></div>

              <div className="space-y-5 relative">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 z-10 shadow-md">1</div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 flex-1 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{t("landingPage.features.mockups.ai.d1Title")}</h4>
                    <div className="flex flex-col gap-2">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d1i1")}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d1i2")}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d1i3")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 z-10 shadow-md">2</div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 flex-1 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{t("landingPage.features.mockups.ai.d2Title")}</h4>
                    <div className="flex flex-col gap-2">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d2i1")}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d2i2")}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d2i3")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold shrink-0 z-10 border border-slate-200 dark:border-slate-700">3</div>
                  <div className="bg-white/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex-1">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("landingPage.features.mockups.ai.d3Title")}</h4>
                    <div className="flex flex-col gap-2">
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d3i1")}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1 shrink-0"></span>
                        <span>{t("landingPage.features.mockups.ai.d3i2")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none"></div>
          </motion.div>
        );

      case 2: // Chat Interaction
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors"
          >
            <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-xl border border-blue-100 dark:border-slate-700 shadow-sm">🌊</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t("landingPage.features.mockups.chat.title")}</h4>
                <p className="text-[10px] text-slate-500">{t("landingPage.features.mockups.chat.members")}</p>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-90 dark:opacity-100 dark:bg-none">
              <div className="text-center text-[10px] font-semibold text-slate-500 bg-white/60 dark:bg-slate-800/50 px-3 py-1 rounded-full w-fit mx-auto backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                {t("landingPage.features.mockups.chat.date")}
              </div>

              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="self-start max-w-[80%] mt-2">
                <span className={cn("text-[10px] text-slate-500", isRtl ? "mr-1" : "ml-1")}>{t("landingPage.features.mockups.chat.user1")}</span>
                <div className={cn("bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mt-0.5", isRtl ? "rounded-tr-sm" : "rounded-tl-sm")}>
                  {t("landingPage.features.mockups.chat.msg1")}
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="self-end max-w-[80%] relative group">
                <div className={cn("bg-blue-600 text-white text-xs px-4 py-2.5 rounded-2xl shadow-sm flex items-end gap-2", isRtl ? "rounded-tl-sm" : "rounded-tr-sm")}>
                  <span>{t("landingPage.features.mockups.chat.msg2")}</span>
                  <CheckCheck className="w-3 h-3 text-blue-200" />
                </div>
                <div className={cn("absolute -bottom-2.5 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm border border-slate-200 dark:border-slate-700 text-[10px]", isRtl ? "-right-2" : "-left-2")}>❤️😃+2</div>
              </motion.div>

              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="self-start max-w-[80%] mt-2">
                <span className={cn("text-[10px] text-slate-500", isRtl ? "mr-1" : "ml-1")}>{t("landingPage.features.mockups.chat.user3")}</span>
                <div className={cn("bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mt-0.5", isRtl ? "rounded-tr-sm" : "rounded-tl-sm")}>
                  {t("landingPage.features.mockups.chat.msg3")}
                  <br />
                  {t("landingPage.features.mockups.chat.msg4")}
                </div>
              </motion.div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-9 flex items-center px-4 text-xs text-slate-400 border border-slate-200/50 dark:border-slate-700">
                {t("landingPage.features.mockups.chat.input")}
              </div>
              <div className={cn("w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm", isRtl && "rotate-180")}><Send className="w-4 h-4" /></div>
            </div>
          </motion.div>
        );

      case 3: // Share Your Vibes
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 flex items-center justify-center rounded-3xl shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-colors duration-300"
          >
            <div className="w-full h-full max-w-[340px] bg-slate-200 dark:bg-slate-900 rounded-[2rem] overflow-hidden relative flex flex-col justify-between p-4 border border-slate-300 dark:border-slate-700 shadow-xl">
              <div className="absolute top-3 left-4 right-4 h-[2px] bg-white/30 rounded-full overflow-hidden z-30">
                <motion.div
                  key={activeFeature}
                  initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 6, ease: "linear" }}
                  className={cn("h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]", isRtl ? "origin-right" : "origin-left")}
                />
              </div>

              <div className="relative z-30 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 shadow-md">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white drop-shadow-md">{t("landingPage.features.mockups.vibes.user")}</span>
                    <span className="text-[9px] font-medium text-white/80 drop-shadow-sm">{t("landingPage.features.mockups.vibes.time")}</span>
                  </div>
                </div>
                <button className="text-white hover:text-slate-200 transition-colors"><X className="w-5 h-5 drop-shadow-md" /></button>
              </div>

              <div className="absolute inset-0 z-0 bg-slate-900">
                <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80" alt="Story" loading="lazy" className="w-full h-full object-cover grayscale opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
              </div>

              <div className="relative z-30 flex flex-col gap-3 w-full mt-auto pb-1">
                <p className="text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit border border-white/10">
                  {t("landingPage.features.mockups.vibes.caption")}
                </p>
                <div className="flex items-center gap-3 w-full border-t border-white/20 pt-3">
                  <div className="flex-1 bg-black/20 backdrop-blur-md border border-white/30 rounded-full h-10 flex items-center px-4 text-[11px] text-white/80">
                    {t("landingPage.features.mockups.vibes.reply")}
                  </div>
                  <button className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
                    <Heart className="w-4 h-4 fill-white text-white" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-fit border border-blue-100 dark:border-blue-800/50 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">{t("landingPage.features.badge")}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] text-slate-900 dark:text-white">
            {t("landingPage.features.title1")} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 dark:from-blue-400 dark:to-sky-300 py-2 inline-block">
              {t("landingPage.features.title2")}
            </span>
          </h2>

          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium mb-10">
            {t("landingPage.features.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
        <div className="flex flex-col w-full min-w-0">
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:flex-col lg:space-y-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {features.map((feature, index) => {
              const isActive = activeFeature === index;
              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    setActiveFeature(index);
                    setSelectedPin(null);
                    setIsAutoPlay(false);
                  }}
                  className={`relative flex-shrink-0 w-[85vw] sm:w-[320px] snap-center lg:w-full flex flex-col lg:flex-row gap-4 lg:items-start p-5 rounded-2xl cursor-pointer transition-all duration-300 border mr-4 lg:mr-0 ${isActive
                    ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl lg:scale-[1.02] z-10"
                    : "lg:bg-transparent border-slate-100 lg:border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 opacity-100 lg:opacity-60 lg:hover:opacity-100"
                    }`}
                >
                  <div className="relative flex-shrink-0 mt-1">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-md transition-transform duration-300 ${isActive ? "lg:scale-110" : ""}`}>
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-1 transition-colors ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700 lg:text-slate-500 dark:text-slate-300 lg:dark:text-slate-400"}`}>
                      {t(feature.titleKey)}
                    </h3>
                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                        >
                          {t(feature.descKey)}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleNavigation("/ai-planner")}
            className="hidden md:flex mt-6 sm:w-auto items-center justify-center gap-2 bg-blue-700 dark:bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 hover:bg-blue-800 dark:hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 active:scale-95 group border border-blue-600 dark:border-blue-500 w-fit"
          >
            <span>{t("landingPage.features.cta")}</span>
            <ArrowRight className={cn("w-5 h-5 group-hover:translate-x-1 transition-transform", isRtl && "rotate-180 group-hover:-translate-x-1")} />
          </button>
        </div>

        <div className="relative h-[400px] sm:h-[450px] lg:h-[520px] w-full rounded-[2rem] p-2 sm:p-4 bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-2xl flex items-center justify-center overflow-hidden transition-colors duration-300">
          <AnimatePresence mode="wait">
            {renderMockup()}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}