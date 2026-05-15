import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
   Compass, MessageCircle, GitCompareArrows,
   Plus, Sparkles, Plane, Sun, Moon, Languages
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function FloatingSidebar() {
   const [isOpen, setIsOpen] = useState(false);
   const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
   const longPressTimer = useRef<number | null>(null);
   const timeoutRef = useRef<number | null>(null);


   const location = useLocation();
   const { language, toggleLanguage, t } = useLanguage();
   const { theme, toggleTheme } = useTheme();
   const isRTL = language === 'ar';

   const menuItems = [
      { icon: Compass, path: "/explore", labelKey: "explore" },
      { icon: MessageCircle, path: "/chat", labelKey: "messages" },
      { icon: GitCompareArrows, path: "/matching", labelKey: "matching" },
      { icon: Plus, path: "/create-trip", labelKey: "createTrip" },
      { icon: Sparkles, path: "/ai-planner", labelKey: "aiPlanner", isAI: true },
      { icon: Plane, path: "/my-trips", labelKey: "myTrips" },
   ];

   const startLongPress = () => {
      longPressTimer.current = window.setTimeout(() => setIsOpen(true), 400);
   };

   const cancelLongPress = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
   };


   const handleTouchStart = (label: string) => {
      timeoutRef.current = window.setTimeout(() => {
         setActiveTooltip(label);
      }, 500);
   };

   const handleTouchEnd = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setActiveTooltip(null);
   };

   const triggerHaptic = (pattern: number | number[]) => {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
         navigator.vibrate(pattern);
      }
   };

   // const lightTick = 10;           // اهتزاز خفيف جداً للنقر العادي
   const barOpenPattern = 20;      // اهتزاز أوضح لفتح الـ Bar
   // const aiMagicPattern = [15, 30, 15]; // اهتزاز "نبضي" مميز للذكاء الاصطناعي
   return (
      <div className="lg:hidden">
         {/* --- (Handle) --- */}
         <AnimatePresence>
            {!isOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onPointerDown={startLongPress}
                  onPointerUp={cancelLongPress}
                  onPointerLeave={cancelLongPress}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                     const swipeDistance = isRTL ? info.offset.x : -info.offset.x;
                     if (swipeDistance > 20) {
                        setIsOpen(true);
                        triggerHaptic(barOpenPattern);
                     }
                  }}
                  className={`fixed top-[30%] z-[60] w-2.5 h-14 bg-blue-600/30 cursor-grab active:cursor-grabbing transition-colors hover:bg-blue-600/50 ${isRTL ? "left-0 rounded-r-full" : "right-0 rounded-l-full"
                     }`}
               >
                  <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600/60 rounded-full ${isRTL ? 'left-0.5' : 'right-0.5'}`} />
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isOpen && (
               <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)} />

                  <motion.div
                     initial={{ x: isRTL ? -100 : 100 }}
                     animate={{ x: 0 }}
                     exit={{ x: isRTL ? -100 : 100 }}
                     className={`fixed top-[20%] w-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl py-4 flex flex-col items-center gap-4 z-[60] ${isRTL ? "left-0 rounded-r-2xl" : "right-0 rounded-l-2xl"
                        }`}
                  >
                     {menuItems.map((item) => (
                        <div key={item.path} className="relative flex items-center">
                           <Link
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              onContextMenu={(e) => e.preventDefault()} // منع ظهور قائمة المتصفح عند الضغط المطول
                              onTouchStart={() => handleTouchStart(t(`navbar.${item.labelKey}`))}
                              onTouchEnd={handleTouchEnd}
                              onMouseEnter={() => setActiveTooltip(t(`navbar.${item.labelKey}`))} // للـ Desktop
                              onMouseLeave={() => setActiveTooltip(null)}
                           >
                              <motion.div
                                 whileTap={{ scale: 0.9 }}
                                 className={`p-2 rounded-xl transition-all ${location.pathname === item.path
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-500 dark:text-slate-400"
                                    }`}
                              >
                                 <item.icon className={`h-5 w-5 ${item.isAI && location.pathname !== item.path ? 'text-amber-500' : ''}`} />
                              </motion.div>
                           </Link>

                           {/* Tooltip*/}
                           <AnimatePresence>
                              {activeTooltip === t(`navbar.${item.labelKey}`) && (
                                 <motion.div
                                    initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isRTL ? -10 : 10 }}
                                    className={`absolute pointer-events-none px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-bold shadow-xl whitespace-nowrap z-[70] ${isRTL ? "left-14" : "right-14"
                                       }`}
                                 >
                                    {activeTooltip}
                                    <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-800 dark:bg-slate-700 ${isRTL ? "-left-1" : "-right-1"
                                       }`} />
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     ))}

                     <div className="h-px w-6 bg-slate-100 dark:bg-slate-800 my-1" />

                     <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                     </button>
                     <button onClick={toggleLanguage} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                        <Languages className="h-5 w-5" />
                     </button>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}