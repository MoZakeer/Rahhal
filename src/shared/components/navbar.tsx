import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, Transition } from "@headlessui/react";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  Bell,
  LogOut,
  Languages,
  ChevronDown,
  ShieldCheck,
  Plus,
  Sparkles,
  GitCompareArrows,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useNotificationContext } from "../../context/NotificationProvider";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { getUserRole, isTokenValid } from "../../utils/auth";
import AnimatedSearch from "../components/AnimatedSearch";
import { useNavbar } from "../hooks/useNavbar";

const API_BASE_URL = "https://rahhal-api.runasp.net";

const travelDropdownItems = [
  { labelKey: "createTrip", path: "/create-trip", icon: Plus },
  { labelKey: "aiPlanner", path: "/ai-planner", icon: Sparkles },
  { labelKey: "matching", path: "/matching", icon: GitCompareArrows },
  { labelKey: "myTrips", path: "/my-trips", icon: Plane },
];

const navItemsBefore = [
  { icon: Home, labelKey: "home", path: "/feed" },
  { icon: Compass, labelKey: "explore", path: "/explore" },
];

const navItemsAfter = [
  { icon: MessageCircle, labelKey: "messages", path: "/chat" },
];

const travelPaths = travelDropdownItems.map((i) => i.path);

interface Profile {
  Id: string;
  Fname: string;
  Lname: string;
  userName: string;
  fullName: string;
  Bio: string;
  Location: string;
  profilePicture: string;
  BirthDate: string;
  Gender: number;
  TravelPersonality: number;
  TravelPreferenceIds: number[];
  VisitedCountryIds: number[];
  DreamCountryIds: number[];
}

interface NavbarProps {
  onLogoutClick?: () => void;
}

export default function Navbar({ onLogoutClick }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const role = getUserRole();
  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId || "";
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState<Profile>();
  const [unreadMessages, setUnreadMessages] = useState<number>();
  const [hasToken] = useState(() => isTokenValid());
  const isFeedPage = location.pathname === "/feed";

  const allowedPages = new Set([
    "/ai-planner",
    "/profile",
    "/admin/reports/users",
    "/admin/reports/posts",
    "/admin/reports/comments",
    "/create-trip",
  ]);

  const isAllowedPage = allowedPages.has(location.pathname);
  const { unreadCount, markAllAsRead } = useNotificationContext();

  const handleClick = async () => {
    await markAllAsRead();
    navigate("/notifications");
  };

  // 🔥 Smart Fetching System (Nav-Only Optimization)
  useEffect(() => {
    const fetchProfile = async (forceFetch = false) => {
      if (!profileId || !token) return;

      const cacheKey = `nav_profile_cache_${profileId}`;

      // 1. Check local session cache first (if not forcing a fetch)
      if (!forceFetch) {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          setProfile(JSON.parse(cachedData));
          return; // Skip the API call completely!
        }
      }

      // 2. Fetch from API if no cache exists or if forced to update
      try {
        const url = `${API_BASE_URL}/Profile/GetUserProfile?ProfileId=${profileId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const result = await res.json();
        
        if (result && result.data) {
          setProfile(result.data);
          // Save to cache for next time
          sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
          localStorage.setItem("username", result.data.fullName || result.data.firstName || "");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile(); // Initial run

    // 3. Listen for profile updates to force a fresh fetch and overwrite cache
    const handleUpdate = () => fetchProfile(true);
    window.addEventListener("profileUpdated", handleUpdate);
    return () => window.removeEventListener("profileUpdated", handleUpdate);
  }, [profileId, token]);

  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
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
  }, [token]);

  useNavbar(setUnreadMessages);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActivePath = (path: string) => location.pathname === path;
  const isTravelActive = travelPaths.some((p) => isActivePath(p));

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 120);
  };

  const activeTravelItem = travelDropdownItems.find((i) =>
    isActivePath(i.path),
  );
  const TravelIcon = activeTravelItem?.icon ?? Plane;
  const travelLabel = activeTravelItem
    ? t(`navbar.${activeTravelItem.labelKey}`)
    : t("navbar.trips");

  return (
    <header
      className={`fixed top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-500 ease-in-out ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-360 mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Logo Section */}
        <Link
          to="/feed"
          className="flex items-center  group cursor-pointer outline-none"
          onClick={(e) => {
            if (location.pathname === "/feed") e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="relative flex h-18 w-18 items-center justify-center transition-transform group-hover:scale-105">
            <img src="/lo.png" alt="Rahhal Logo" className="relative h-18 w-18 object-contain block dark:hidden" />
            <img src="/dark-lo.png" alt="Rahhal Logo" className="relative h-18 w-18 object-contain hidden dark:block" />
          </div>
          <span className=" -ml-2 text-2xl tracking-tighter ms-0 hidden sm:flex items-baseline">
            {language === "en" ? (
              <>
                <span className="font-black text-slate-800 dark:text-slate-100">Rah</span>
                <span className="font-light text-slate-600 dark:text-slate-300">hal</span>
              </>
            ) : (
              <span className="font-black text-slate-800 dark:text-slate-100">رَحَّال</span>
            )}
            <span className="text-blue-500 text-3xl font-black ms-0.5">.</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItemsBefore.map(({ icon: Icon, labelKey, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActivePath(path)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{t(`navbar.${labelKey}`)}</span>
            </Link>
          ))}

          {/* Travel Dropdown Trigger */}
          <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isTravelActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <TravelIcon className="h-5 w-5" />
              <span>{travelLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Travel Dropdown Menu */}
            <div
              className={`absolute top-full inset-s-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 mt-1.5 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 overflow-hidden transition-all duration-200 z-50 ${
                dropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
            >
              <div className="absolute -top-1.5 inset-s-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 ltr:border-l rtl:border-r border-t border-slate-200 dark:border-slate-700" />
              <div className="p-1.5 relative">
                {travelDropdownItems.map(({ labelKey, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActivePath(path)
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(`navbar.${labelKey}`)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navItemsAfter.map(({ icon: Icon, labelKey, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActivePath(path)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {unreadMessages && unreadMessages > 0 ? (
                  <span className="absolute -top-2.5 -inset-e-2 min-w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-xs text-white px-1 font-bold">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </div>
              <span>{t(`navbar.${labelKey}`)}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3 lg:gap-4 relative">
          {hasToken ? (
            <>
              {(isAllowedPage || isFeedPage) && (
                <div className={isFeedPage ? "lg:hidden relative" : "relative"}>
                  <AnimatedSearch />
                </div>
              )}

              {/* Mobile Messages Button (Hidden on Desktop) */}
              <Link
                to="/chat"
                className="lg:hidden relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t("navbar.messages")}
              >
                <MessageCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {unreadMessages !== undefined && unreadMessages > 0 && (
                  <span className="absolute -top-1 -inset-e-1 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1 shadow-sm font-bold border-2 border-white dark:border-slate-900">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notifications Button */}
              <button
                onClick={handleClick}
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -inset-e-1 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1 shadow-sm font-bold border-2 border-white dark:border-slate-900">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

              {/* Desktop User Profile Popover */}
              <Popover className="relative hidden lg:block">
                {({ open, close }) => (
                  <>
                    <Popover.Button className="flex items-center gap-2 p-1 pe-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all outline-none border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                      {profile?.profilePicture ? (
                        <img
                          src={`${API_BASE_URL}${profile.profilePicture}`}
                          className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                          alt="user"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 bg-gradient-to-br to-blue-500 from-blue-700">
                          <span className="text-xs font-black text-white uppercase">
                            {profile?.fullName?.charAt(0) || profile?.userName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {profile?.userName || "User"}
                      </p>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </Popover.Button>

                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="scale-95 opacity-0 translate-y-[-10px]"
                      enterTo="scale-100 opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="scale-100 opacity-100 translate-y-0"
                      leaveTo="scale-95 opacity-0 translate-y-[-10px]"
                    >
                      <Popover.Panel className="absolute top-full end-0 mt-3 w-64 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-slate-200 dark:ring-slate-800 outline-none z-50">
                        <div className="absolute -top-1.5 end-4 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-t border-s border-slate-200 dark:border-slate-800" />
                        <div className="relative z-10">
                          
                          {/* Profile Premium Card */}
                          <Link
                            to={`/profile/${profileId}`}
                            onClick={() => close()}
                            className="group flex items-center gap-3 p-3 mb-2 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all duration-300"
                          >
                            {profile?.profilePicture ? (
                              <img
                                src={`${API_BASE_URL}${profile.profilePicture}`}
                                className="h-11 w-11 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-700"
                                alt="user"
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-br to-blue-500 from-blue-700 shadow-sm ring-2 ring-white dark:ring-slate-700">
                                <span className="text-sm font-black text-white uppercase">
                                  {profile?.fullName?.charAt(0) || profile?.userName?.charAt(0) || "U"}
                                </span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                {profile?.fullName || profile?.userName || "User"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {(role === "SuperAdmin" || role === "Admin") && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    {role}
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate">
                                  {t("navbar.viewProfile") || "View Profile"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                          </Link>

                          {/* Profile Menu Actions */}
                          <div className="space-y-1 px-1 pb-1">
                            
                            {/* Admin Panel */}
                            {role === "SuperAdmin" && (
                              <Link
                                to="/admin/reports/users"
                                onClick={close}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                <span className="flex-1">{t("navbar.adminPanel") || "Admin Panel"}</span>
                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                              </Link>
                            )}

                            {/* Theme Toggle */}
                            <button
                              onClick={() => { toggleTheme(); close(); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
                              <span>{theme === "dark" ? (t("navbar.lightMode") || "Light Mode") : (t("navbar.darkMode") || "Dark Mode")}</span>
                            </button>

                            {/* Language Toggle */}
                            <button
                              onClick={() => { toggleLanguage(); close(); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Languages className="h-4 w-4 text-teal-500" />
                              <span>{language === "en" ? (t("navbar.arabicLanguage") || "Arabic") : (t("navbar.englishLanguage") || "English")}</span>
                            </button>

                            {/* Logout */}
                            <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => {
                                  close();
                                  if (onLogoutClick) onLogoutClick();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>{t("navbar.logout") || "Logout"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>

              {/* Mobile User Profile Popover */}
              <Popover className="relative lg:hidden">
                {({ open, close }) => (
                  <>
                    <Popover.Button className="relative p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none active:scale-90 outline-none">
                      {profile?.profilePicture ? (
                        <img
                          src={`${API_BASE_URL}${profile.profilePicture}`}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                          alt="user"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br to-blue-500 from-blue-700 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <span className="text-[10px] font-black text-white uppercase">
                            {profile?.fullName?.charAt(0) || profile?.userName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}

                      {/* Mobile Dropdown Indicator */}
                      <div className="absolute -bottom-0.5 -end-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <ChevronDown className={`h-2.5 w-2.5 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                      </div>
                    </Popover.Button>

                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="scale-95 opacity-0 translate-y-[-10px]"
                      enterTo="scale-100 opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="scale-100 opacity-100 translate-y-0"
                      leaveTo="scale-95 opacity-0 translate-y-[-10px]"
                    >
                      <Popover.Panel className="absolute top-full end-0 mt-3 w-64 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-slate-200 dark:ring-slate-800 outline-none z-50">
                        <div className="absolute -top-1.5 end-4 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-t border-s border-slate-200 dark:border-slate-800" />
                        <div className="relative z-10">
                          
                          {/* Profile Premium Card */}
                          <Link
                            to={`/profile/${profileId}`}
                            onClick={() => close()}
                            className="group flex items-center gap-3 p-3 mb-2 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all duration-300"
                          >
                            {profile?.profilePicture ? (
                              <img
                                src={`${API_BASE_URL}${profile.profilePicture}`}
                                className="h-11 w-11 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-700"
                                alt="user"
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-br to-blue-500 from-blue-700 shadow-sm ring-2 ring-white dark:ring-slate-700">
                                <span className="text-sm font-black text-white uppercase">
                                  {profile?.fullName?.charAt(0) || profile?.userName?.charAt(0) || "U"}
                                </span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                {profile?.fullName || profile?.userName || "User"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {(role === "SuperAdmin" || role === "Admin") && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    {role}
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate">
                                  {t("navbar.viewProfile") || "View Profile"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                          </Link>

                          {/* Profile Menu Actions */}
                          <div className="space-y-1 px-1 pb-1">
                            
                            {/* Admin Panel */}
                            {role === "SuperAdmin" && (
                              <Link
                                to="/admin/reports/users"
                                onClick={close}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                <span className="flex-1">{t("navbar.adminPanel") || "Admin Panel"}</span>
                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                              </Link>
                            )}

                            {/* Theme Toggle */}
                            <button
                              onClick={() => { toggleTheme(); close(); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
                              <span>{theme === "dark" ? (t("navbar.lightMode") || "Light Mode") : (t("navbar.darkMode") || "Dark Mode")}</span>
                            </button>

                            {/* Language Toggle */}
                            <button
                              onClick={() => { toggleLanguage(); close(); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Languages className="h-4 w-4 text-teal-500" />
                              <span>{language === "en" ? (t("navbar.arabicLanguage") || "Arabic") : (t("navbar.englishLanguage") || "English")}</span>
                            </button>

                            {/* Logout */}
                            <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => {
                                  close();
                                  if (onLogoutClick) onLogoutClick();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>{t("navbar.logout") || "Logout"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </>
          ) : (
            /* Guest User Actions (Responsive) */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="px-2 sm:px-4 py-1.5 text-[11px] sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
              >
                {t("navbar.signIn") || "Sign In"}
              </Link>
              <Link
                to="/sign-up"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
              >
                {t("navbar.signUp") || "Sign Up"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}