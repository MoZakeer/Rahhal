import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useNotifications } from "../../hooks/useNotifications";
import ThemeToggleButton from "./ThemeToggleButton";
const API_BASE_URL = "https://rahhal-api.runasp.net";

const navItems = [
  { icon: Home, label: "Home", path: "/feed" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Plane, label: "My Trips", path: "/my-trips" },
  { icon: MessageCircle, label: "Messages", path: "/chat" },
];
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
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId || "";
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState<Profile>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasToken, setHasToken] = useState(
    () => !!localStorage.getItem("token"),
  );
  const { unreadCount } = useNotifications(hasToken);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    setHasToken(false);
    setMobileOpen(false);
    navigate("/landing-page");
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-500 ease-in-out ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
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
            <div className="absolute inset-0 rounded-xl bg-orange-400 rotate-6 opacity-80" />
            <div className="absolute inset-0 rounded-xl bg-indigo-600 dark:bg-indigo-500 -rotate-3" />
            <Plane
              className="relative h-5 w-5 text-white -rotate-45"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 ml-1 hidden sm:block">
            Rahhal
            <span className="text-orange-500 dark:text-orange-400 text-3xl">
              .
            </span>
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActivePath(path)
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 ml-auto lg:gap-3">
          {hasToken ? (
            <>
              <Link
  to="/notifications"
  className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
>
  <Bell className="h-5 w-5" />

  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )}
</Link>

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
                    <div className="h-9 w-9 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 bg-linear-to-br from-purple-600 to-blue-500">
                      <span className="text-xs font-black text-white uppercase">
                        {profile?.fullName?.charAt(0) ||
                          profile?.userName?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
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
                      <Link
                        to={`/profile/${profileId}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <ThemeToggleButton />
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                        <Languages className="h-4 w-4" /> Arabic Language
                      </button>
                    </div>
                    <div className="mt-1 pt-1 border-t border-slate-50 dark:border-slate-700">
                      <button
                        onClick={handleLogout}
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
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2 text-sm font-bold text-white shadow-lg"
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
                  className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 mb-2 border border-indigo-100 dark:border-indigo-500/20"
                >
                  <img
                    src={
                      profile?.profilePicture
                        ? `${API_BASE_URL}${profile.profilePicture}`
                        : "/api/placeholder/40/40"
                    }
                    className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                    alt="avatar"
                  />
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-100 leading-none">
                      {profile?.userName || "User"}
                    </p>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      View My Profile
                    </p>
                  </div>
                </Link>
              )}

              {navItems.map(({ icon: Icon, label, path }) => {
                if (label === "Messages" && !hasToken) return null;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 rounded-xl p-4 text-base font-bold transition-colors ${
                      isActivePath(path)
                        ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-6 w-6" /> {label}
                  </Link>
                );
              })}

              <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
              <ThemeToggleButton />
              <button className="flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <Languages className="h-6 w-6" /> Arabic Language
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              {hasToken ? (
                <button
                  onClick={handleLogout}
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
                    className="flex justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 p-4 font-bold text-white shadow-lg"
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
