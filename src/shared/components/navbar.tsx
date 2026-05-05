import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import {
  Popover,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
} from "@headlessui/react";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Languages,
  ChevronDown,
} from "lucide-react";
import { useNotificationContext } from "../../context/NotificationProvider";
import ThemeToggleButton from "./ThemeToggleButton";
const API_BASE_URL = "https://rahhal-api.runasp.net";
import { getUserRole } from "../../utils/auth";
import AnimatedSearch from "../components/AnimatedSearch";
// import SearchComponent from "../../features/search/components/SearchComponent";
import { Plus, Sparkles, GitCompareArrows } from "lucide-react";
import { useNavbar } from "../hooks/useNavbar";
import { isTokenValid } from "../../utils/auth";

const travelDropdownItems = [
  { label: "Create Trip", path: "/create-trip", icon: Plus },
  { label: "AI Planner", path: "/ai-planner", icon: Sparkles },
  { label: "Matching", path: "/matching", icon: GitCompareArrows },
  { label: "My Trips", path: "/my-trips", icon: Plane },
];
// Before Travel
const navItemsBefore = [
  { icon: Home, label: "Home", path: "/feed" },
  { icon: Compass, label: "Explore", path: "/explore" },
];
// After Travel
const navItemsAfter = [
  { icon: MessageCircle, label: "Messages", path: "/chat" },
];
const travelPaths = travelDropdownItems.map((i) => i.path);
interface Profile {
  // data: ProfileData | null | undefined;
  Id: string;
  Fname: string;
  Lname: string;
  userName: string;
  fullName: string;
  Bio: string;
  Location: string;
  profilePicture: string; // Base64 string or URL
  BirthDate: string; // ISO string
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
  const role = getUserRole();
  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId || "";
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState<Profile>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>();
  const [hasToken] = useState(() => isTokenValid());
  const navigate = useNavigate();
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
  /* ================= FETCH PROFILE DATA ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId || !token) return;

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
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
    const handleUpdate = () => {
      fetchProfile();
    };

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
    // 1️⃣ initial fetch
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
  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("auth");
  //   localStorage.removeItem("user");
  //   setHasToken(false);
  //   setMobileOpen(false);
  //   navigate("/landing-page");
  // };

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
  const travelLabel = activeTravelItem?.label ?? "Trips";
  return (
    <header
      className={`fixed top-0 z-40  w-full  bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-500 ease-in-out ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto  flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo Section */}
        <Link
          to="/feed"
          className="flex items-center gap-2 group cursor-pointer"
          onClick={(e) => {
            if (location.pathname === "/feed") e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="relative flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-110">
            <div className="absolute inset-0 rounded-xl bg-orange-400 dark:bg-blue-200 rotate-6 opacity-80" />
            <div className="absolute inset-0 rounded-xl bg-blue-600 dark:bg-blue-500 -rotate-3" />
            <Plane
              className="relative h-5 w-5 text-white -rotate-45"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 ml-1 hidden sm:block">
            Rahhal
            <span className="text-orange-500 dark:text-blue-400 text-3xl">
              .
            </span>
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItemsBefore.map(({ icon: Icon, label, path }) => (
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
              <span>{label}</span>
            </Link>
          ))}

          {/* Travel dropdown trigger */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isTravelActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <TravelIcon className="h-5 w-5" />
              <span>{travelLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 overflow-hidden transition-all duration-200 z-50 ${
                dropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
            >
              {/* small arrow pointer */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-l border-t border-slate-200 dark:border-slate-700" />

              <div className="p-1.5 relative">
                {travelDropdownItems.map(({ label, path, icon: Icon }) => (
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
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {navItemsAfter.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActivePath(path)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {/* <Icon className="h-5 w-5" />
              {label === "Messages" ? (
                <span>
                  {label}{" "}
                  {unreadMessages && unreadMessages > 0
                    ? `(${unreadMessages})`
                    : ""}
                </span>
              ) : (
                <span>{label}</span>
              )} */}
              <div className="relative">
                <Icon className="h-5 w-5" />
                {unreadMessages && unreadMessages > 0 ? (
                  <>
                    {unreadMessages && unreadMessages > 0 && (
                      <span className="absolute -top-2.5 -right-2 min-w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-xs text-white px-1 font-bold">
                        {unreadMessages && unreadMessages > 9
                          ? "9+"
                          : unreadMessages}
                      </span>
                    )}
                  </>
                ) : (
                  ""
                )}
              </div>

              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 ml-auto lg:gap-3">
          {hasToken ? (
            <>
              {(isAllowedPage || isFeedPage) && (
                <div className={isFeedPage ? "lg:hidden" : ""}>
                  <AnimatedSearch />
                </div>
              )}
              <button
                onClick={handleClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 "
              >
                <Bell className="h-5 w-5 dark:text-blue-400 text-slate-500 " />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
              {/* User Account Popover */}
              <Popover className="relative hidden lg:block">
                <Popover.Button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all outline-none border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                  {profile?.profilePicture ? (
                    <img
                      src={`${API_BASE_URL}${profile.profilePicture}?t=${new Date().getTime()}`}
                      className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700"
                      alt="user"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 bg-linear-to-br  to-blue-500 from-blue-900">
                      <span className="text-xs font-black text-white uppercase">
                        {profile?.fullName?.charAt(0) ||
                          profile?.userName?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {profile?.userName || "User"}
                  </p>
                  <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 group-ui-open:rotate-180 transition-transform" />
                </Popover.Button>

                <Transition
                  enter="transition duration-150 ease-out"
                  enterFrom="scale-95 opacity-0"
                  enterTo="scale-100 opacity-100"
                  leave="transition duration-100 ease-in"
                  leaveFrom="scale-100 opacity-100"
                  leaveTo="scale-95 opacity-0"
                >
                  <Popover.Panel className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 outline-none">
                    <div className="space-y-0.5">
                      {role === "SuperAdmin" && (
                        <Link
                          to="/admin/reports/users"
                          className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold 
               bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900
               text-slate-600 dark:text-slate-300 
               hover:text-blue-600 dark:hover:text-white
               border border-slate-200 dark:border-slate-700
               hover:border-blue-200 dark:hover:border-blue-500/50
               shadow-sm hover:shadow-blue-500/10
               transition-all duration-300 ease-out"
                        >
                          {/* Subtle Inner Glow on Hover */}
                          <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/[0.03] transition-colors" />

                          <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <ShieldCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                          </div>

                          <span className="relative">Admin Panel</span>

                          {/* Small "Live" Indicator or Badge */}
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        </Link>
                      )}
                      <Link
                        to={`/profile/${profileId}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <ThemeToggleButton />
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                        <Languages className="h-4 w-4" /> Arabic Language
                      </button>
                    </div>
                    <div className="mt-1 pt-1 border-t border-slate-50 dark:border-slate-700">
                      <button
                        onClick={onLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-2 text-sm font-bold text-white shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}

          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* --- Mobile Sidebar (Drawer) --- */}
      <Dialog
        open={mobileOpen}
        onClose={setMobileOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel
            transition
            className="relative flex h-full w-full max-w-sm flex-col bg-white dark:bg-slate-900 px-6 py-6 shadow-2xl transition duration-300 data-[closed]:translate-x-full"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
              {hasToken && (
                <Link
                  to={`/profile/${profileId}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-500/10 mb-2 border border-blue-100 dark:border-blue-500/20"
                >
                  {profile?.profilePicture ? (
                    <img
                      src={`${API_BASE_URL}${profile.profilePicture}?t=${new Date().getTime()}`}
                      className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700"
                      alt="user"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 bg-linear-to-br  to-blue-500 from-blue-900">
                      <span className="text-xs font-black text-white uppercase">
                        {profile?.fullName?.charAt(0) ||
                          profile?.userName?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-100 leading-none">
                      {profile?.userName || "User"}
                    </p>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                      View My Profile
                    </p>
                  </div>
                </Link>
              )}
              {role === "SuperAdmin" && (
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/admin/reports/users"
                  className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold 
               bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900
               text-slate-600 dark:text-slate-300 
               hover:text-blue-600 dark:hover:text-white
               border border-slate-200 dark:border-slate-700
               hover:border-blue-200 dark:hover:border-blue-500/50
               shadow-sm hover:shadow-blue-500/10
               transition-all duration-300 ease-out"
                >
                  {/* Subtle Inner Glow on Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/[0.03] transition-colors" />

                  <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <ShieldCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>

                  <span className="relative">Admin Panel</span>

                  {/* Small "Live" Indicator or Badge */}
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                </Link>
              )}

              {navItemsBefore.map(({ icon: Icon, label, path }) => {
                if (label === "Messages" && !hasToken) return null;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 rounded-xl p-4 text-base font-bold transition-colors ${
                      isActivePath(path)
                        ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-6 w-6" /> {label}
                  </Link>
                );
              })}
              {navItemsAfter.map(({ icon: Icon, label, path }) => {
                if (label === "Messages" && !hasToken) return null;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 rounded-xl p-4 text-base font-bold transition-colors ${
                      isActivePath(path)
                        ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-6 w-6" /> {label}
                  </Link>
                );
              })}
              {travelDropdownItems.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 rounded-xl p-4 text-base font-bold transition-colors ${
                    isActivePath(path)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-6 w-6 " />
                  {label}
                </Link>
              ))}

              <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
              <ThemeToggleButton />
              <button className="flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <Languages className="h-6 w-6" /> Arabic Language
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              {hasToken ? (
                <button
                  onClick={onLogoutClick}
                  className="flex w-full items-center gap-4 rounded-xl bg-red-50 dark:bg-red-500/10 p-4 text-red-600 dark:text-red-400 font-bold shadow-sm"
                >
                  <LogOut className="h-6 w-6" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center rounded-xl bg-blue-600 dark:bg-blue-500 p-4 font-bold text-white shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  );
}
