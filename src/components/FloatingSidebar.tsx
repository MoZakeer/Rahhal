import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
   Compass, MessageCircle, GitCompareArrows,
   Plus, Sparkles, Plane, Sun, Moon, Languages
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { isTokenValid } from "@/utils/auth"; 

const API_BASE_URL = "https://rahhal-api.runasp.net";

// Self-contained dictionary for inline localization control
const LOCAL_DICTIONARY: Record<string, Record<string, string>> = {
   en: {
      explore: "Explore",
      messages: "Chat",
      matching: "Match",
      createTrip: "New Trip",
      aiPlanner: "AI Plan",
      myTrips: "Trips",
   },
   ar: {
      explore: "استكشف",
      messages: "المحادثات",
      matching: "المطابقة",
      createTrip: "رحلة جديدة",
      aiPlanner: "خطة ذكية",
      myTrips: "رحلاتي",
   }
};

export default function FloatingSidebar() {
   const [isOpen, setIsOpen] = useState(false);
   const [unreadMessages, setUnreadMessages] = useState<number>(0);
   
   const longPressTimer = useRef<number | undefined>(undefined);
   const location = useLocation();
   const { language, toggleLanguage } = useLanguage();
   const { theme, toggleTheme } = useTheme();
   
   const isRTL = language === 'ar';
   const token = localStorage.getItem("token");
   const hasToken = isTokenValid();

   // Get current localized labels map
   const labels = LOCAL_DICTIONARY[language] || LOCAL_DICTIONARY['en'];

   // Menu items configuration
   const menuItems = [
      { icon: Compass, path: "/explore", labelKey: "explore" },
      { icon: MessageCircle, path: "/chat", labelKey: "messages" },
      { icon: GitCompareArrows, path: "/matching", labelKey: "matching" },
      { icon: Plus, path: "/create-trip", labelKey: "createTrip" },
      { icon: Sparkles, path: "/ai-planner", labelKey: "aiPlanner", isAI: true },
      { icon: Plane, path: "/my-trips", labelKey: "myTrips" },
   ];

   // Sync unread messages counter
   useEffect(() => {
      const fetchUnreadCount = async () => {
         if (!hasToken || !token) return;
         try {
            const res = await fetch(`${API_BASE_URL}/Chat/GetTotalUnreadCount`, {
               headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
               },
            });
            if (!res.ok) throw new Error("Failed to fetch unread count");
            const result = await res.json();
            if (result.isSuccess) {
               setUnreadMessages(result.data.totalUnreadCount);
            }
         } catch (err) {
            console.error("Unread count error:", err);
         }
      };

      fetchUnreadCount();
      const handleMessageUpdate = () => fetchUnreadCount();
      window.addEventListener("chatUpdated", handleMessageUpdate);
      return () => window.removeEventListener("chatUpdated", handleMessageUpdate);
   }, [token, hasToken]);

   // Gesture & Long Press Interaction Logic
   const startLongPress = () => {
      if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
      longPressTimer.current = window.setTimeout(() => setIsOpen(true), 400) as any;
   };

   const cancelLongPress = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
   };

   const triggerHaptic = (pattern: number | number[]) => {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
         navigator.vibrate(pattern);
      }
   };

   const barOpenPattern = 20; 

   return (
      <div className="lg:hidden">
         {/* 1. Drag Handle (Classic Blue Styling) */}
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
                  className={`fixed top-[30%] z-[60] w-2.5 h-14 bg-blue-600/30 cursor-grab active:cursor-grabbing transition-colors hover:bg-blue-600/50 ${
                     isRTL ? "left-0 rounded-r-full" : "right-0 rounded-l-full"
                  }`}
               >
                  <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600/60 rounded-full ${isRTL ? 'left-0.5' : 'right-0.5'}`} />
               </motion.div>
            )}
         </AnimatePresence>

         {/* 2. Expanded Premium Sidebar Panel */}
         <AnimatePresence>
            {isOpen && (
               <>
                  {/* Dismiss Backdrop */}
                  <div 
                     className="fixed inset-0 z-[55] bg-slate-900/10 backdrop-blur-[2px]" 
                     onClick={() => setIsOpen(false)} 
                  />

                  {/* Sidebar Panel Container */}
                  <motion.div
                     initial={{ x: isRTL ? -100 : 100 }}
                     animate={{ x: 0 }}
                     exit={{ x: isRTL ? -100 : 100 }}
                     transition={{ type: "spring", damping: 25, stiffness: 250 }}
                     className={`fixed top-[15%] w-20 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.15)] py-5 flex flex-col items-center gap-4 z-[60] ${
                        isRTL ? "left-0 rounded-r-3xl" : "right-0 rounded-l-3xl"
                     }`}
                  >
                     {/* Menu Navigation Items */}
                     {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const labelText = labels[item.labelKey] || item.labelKey;

                        return (
                           <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              onContextMenu={(e) => e.preventDefault()}
                              className="w-full flex flex-col items-center justify-center group outline-none"
                           >
                              <motion.div
                                 whileTap={{ scale: 0.92 }}
                                 className={`relative p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300 w-[64px] ${
                                    isActive
                                       ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                       : "text-slate-500 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/60"
                                 }`}
                              >
                                 {/* Slightly bigger professional icons */}
                                 <item.icon className={`h-5.5 w-5.5 ${item.isAI && !isActive ? 'text-amber-500' : ''}`} />
                                 
                                 {/* Unread Badge Overlay */}
                                 {item.labelKey === "messages" && unreadMessages > 0 && (
                                    <span className="absolute top-1 -inset-e-0.5 min-w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-[9px] text-white px-1 shadow-sm font-bold border-2 border-white dark:border-slate-900">
                                       {unreadMessages > 9 ? "9+" : unreadMessages}
                                    </span>
                                 )}
                              </motion.div>

                              {/* Elegant minimalist typography label */}
                              <span className={`text-[9px] font-extrabold mt-1 text-center truncate max-w-full px-1 tracking-wide leading-none transition-colors ${
                                 isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                              }`}>
                                 {labelText}
                              </span>
                           </Link>
                        );
                     })}

                     {/* Clean Decorative Divider */}
                     <div className="h-px w-10 bg-slate-100 dark:bg-slate-800/80 my-1" />

                     {/* Action Controls Group */}
                     <div className="flex flex-col items-center gap-1.5 w-full">
                        {/* Theme Toggle Button */}
                        <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all outline-none">
                           {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5 text-blue-500" />}
                        </button>
                        
                        {/* Language Toggle Button */}
                        <button onClick={toggleLanguage} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all outline-none">
                           <Languages className="h-5 w-5" />
                        </button>
                     </div>

                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}