import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Compass, Plus, Plane, Sparkles, Home, FileText, SquarePen, GitCompareArrows } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileBottomNav() {
   const location = useLocation();
   const { t } = useLanguage();

   // Menu toggle state for dynamic actions (Create Trip/Post)
   const [isMenuOpen, setIsMenuOpen] = useState(false);

   // Bottom nav visibility state based on scroll direction
   const [isVisible, setIsVisible] = useState(true);
   const { scrollY } = useScroll();
   const lastScrollY = useRef(0);

   const isFeedPage = location.pathname === "/feed";

   // Handle scroll events to hide/show the bottom nav
   useMotionValueEvent(scrollY, "change", (latest) => {
      // Prevent iOS rubber-band effect issues
      if (latest < 0) return; 
      // Do not hide the nav if the action menu is currently open
      if (isMenuOpen) return; 

      const diff = latest - lastScrollY.current;
      
      // Hide on scroll down, show on scroll up
      if (diff > 5 && latest > 50) {
         setIsVisible(false);
      } else if (diff < -5) {
         setIsVisible(true);
      }
      lastScrollY.current = latest;
   });

   // Auto-close action menu on route change
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMenuOpen(false);
   }, [location.pathname]);

   // Trigger mobile device haptic feedback
   const triggerHaptic = (intensity = 12) => {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
         navigator.vibrate(intensity);
      }
   };

   // Navigation items configuration
   const navItems = [
      { icon: Compass, path: "/explore", labelKey: "explore" },
      { icon: GitCompareArrows, path: "/matching", labelKey: "matching" },
      { icon: Home, path: "/feed", labelKey: "home", isSpecial: true },
      { icon: Plane, path: "/my-trips", labelKey: "myTrips" },
      {
         icon: isFeedPage
            ? SquarePen
            : (location.pathname === "/ai-planner" ? Sparkles : Plus),
         path: "#",
         labelKey: isFeedPage
            ? "createPost"
            : (location.pathname === "/ai-planner" ? "createAiTrip" : "createTrip"),
         isDynamicAction: true,
         activePaths: ["/create-trip", "/ai-planner"]
      },
   ];

   return (
      <>
         {/* 1. Dimmed Backdrop for Action Menu */}
         <AnimatePresence>
            {isMenuOpen && !isFeedPage && (
               <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[55] lg:hidden"
               />
            )}
         </AnimatePresence>

         {/* 2. Floating Action Menu (Create Trip / AI Planner) */}
         <AnimatePresence>
            {isMenuOpen && isVisible && !isFeedPage && (
               <div key="menu" className="fixed bottom-24 right-6 z-[58] flex flex-col gap-3 items-end lg:hidden">
                  
                  {/* Option 1: AI Trip Planner */}
                  <motion.div
                     initial={{ opacity: 0, y: 20, scale: 0.8 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 20, scale: 0.8 }}
                     transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.05 }}
                  >
                     <Link
                        to="/ai-planner"
                        onClick={() => { setIsMenuOpen(false); triggerHaptic(15); }}
                        className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/20 text-xs font-semibold"
                     >
                        <span>{t('navbar.createAiTrip') || 'Create AI Trip'}</span>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                     </Link>
                  </motion.div>

                  {/* Option 2: Manual Trip Creation */}
                  <motion.div
                     initial={{ opacity: 0, y: 20, scale: 0.8 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 20, scale: 0.8 }}
                     transition={{ type: "spring", stiffness: 350, damping: 18 }}
                  >
                     <Link
                        to="/create-trip"
                        onClick={() => { setIsMenuOpen(false); triggerHaptic(15); }}
                        className="flex items-center gap-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold"
                     >
                        <span>{t('navbar.createManualTrip') || 'Create Manual Trip'}</span>
                        <FileText className="w-4 h-4 text-blue-600" />
                     </Link>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* 3. Main Bottom Navigation Bar */}
         <AnimatePresence>
            {isVisible && (
               <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "120%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] select-none"
               >
                  {/* Glassmorphism Background */}
                  <div className="absolute inset-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" />

                  <div
                     className="relative flex justify-around items-end px-2 h-16"
                     style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
                  >
                     {navItems.map((item, index) => {
                        const isActive = item.activePaths
                           ? item.activePaths.includes(location.pathname)
                           : location.pathname === item.path;

                        const label = t(`navbar.${item.labelKey}`);

                        // A. Premium Center Home Button (Special)
                        if (item.isSpecial) {
                           return (
                              <div key={item.path} className="relative -top-5 z-20">
                                 <Link
                                    to={item.path}
                                    onClick={(e) => {
                                       triggerHaptic(20);

                                       // Smooth scroll to top and refresh feed if already active
                                       if (isActive) {
                                          e.preventDefault();
                                          window.scrollTo({ top: 0, behavior: "smooth" });
                                          window.dispatchEvent(new CustomEvent("refreshFeed"));
                                       }
                                    }}
                                    aria-label={label}
                                    aria-current={isActive ? "page" : undefined}
                                 >
                                    <motion.div
                                       whileTap={{ scale: 0.9 }}
                                       className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-[3px] border-white dark:border-slate-900"
                                    >
                                       <item.icon className="w-6 h-6" />
                                    </motion.div>
                                 </Link>
                              </div>
                           );
                        }

                        // B. Dynamic Action Button (Create Post / Actions Menu)
                        if (item.isDynamicAction) {
                           return (
                              <button
                                 key={index}
                                 onClick={(e) => {
                                    e.preventDefault();
                                    triggerHaptic(15);

                                    if (isFeedPage) {
                                       // Trigger create post modal in Feed
                                       window.dispatchEvent(new CustomEvent("openCreatePostModal"));
                                    } else {
                                       // Toggle actions menu on other pages
                                       setIsMenuOpen(!isMenuOpen);
                                    }
                                 }}
                                 aria-label={label}
                                 className="flex flex-col items-center justify-center w-16 h-full z-10"
                              >
                                 <div className="relative flex items-center justify-center p-1.5">
                                    <motion.div
                                       whileTap={{ scale: 0.9 }}
                                       animate={{
                                          rotate: (isMenuOpen && !isFeedPage) ? 135 : 0,
                                          scale: (isMenuOpen && !isFeedPage) ? 1.1 : (isActive ? 1.15 : 1),
                                          color: (isMenuOpen && !isFeedPage)
                                             ? "rgb(239, 68, 68)" // Red (Menu Open)
                                             : isActive
                                                ? "rgb(37, 99, 235)" // Blue (Active)
                                                : "rgb(148, 163, 184)" // Slate (Inactive)
                                       }}
                                       transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                       <item.icon className="w-5.5 h-5.5" />
                                    </motion.div>

                                    {/* Active indicator dot (hidden when menu is open) */}
                                    {isActive && !isMenuOpen && (
                                       <motion.div
                                          layoutId="mobileNavIndicator"
                                          className="absolute -bottom-1.5 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                       />
                                    )}
                                 </div>
                                 <span
                                    className={`text-[10px] font-medium mt-1.5 w-full text-center truncate px-1 transition-colors ${
                                       isActive && !isMenuOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-500"
                                    }`}
                                 >
                                    {label}
                                 </span>
                              </button>
                           );
                        }

                        // C. Standard Navigation Tabs
                        return (
                           <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => triggerHaptic(10)}
                              aria-label={label}
                              aria-current={isActive ? "page" : undefined}
                              className="flex flex-col items-center justify-center w-16 h-full z-10 overflow-hidden"
                           >
                              <div className="relative flex items-center justify-center p-1.5">
                                 <motion.div
                                    animate={{
                                       scale: isActive ? 1.15 : 1,
                                       y: isActive ? -2 : 0,
                                       color: isActive ? "rgb(37, 99, 235)" : "rgb(148, 163, 184)"
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="dark:text-slate-400"
                                 >
                                    <item.icon className="w-5.5 h-5.5" />
                                 </motion.div>

                                 {isActive && (
                                    <motion.div
                                       layoutId="mobileNavIndicator"
                                       className="absolute -bottom-1.5 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                       transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                 )}
                              </div>

                              <motion.span
                                 animate={{
                                    scale: isActive ? 1 : 0.95,
                                    opacity: isActive ? 1 : 0.7
                                 }}
                                 className={`text-[10px] font-medium mt-1.5 transition-colors w-full text-center truncate px-1 ${
                                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500"
                                 }`}
                              >
                                 {label}
                              </motion.span>
                           </Link>
                        );
                     })}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </>
   );
}