import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, Dialog, DialogBackdrop, DialogPanel, Transition } from "@headlessui/react";
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
  Moon,
  Languages,
  ChevronDown,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useProfileStore } from "../../features/profile/store/profile.store";

const API_BASE_URL = "https://rahhal-api.runasp.net";

const navItems = [
  { icon: Home, label: "Home", path: "/feed" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Plane, label: "My Trips", path: "/my-trips" },
  { icon: MessageCircle, label: "Messages", path: "/chat" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, fetchProfile } = useProfileStore();

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId || "";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem("token"));
  const { unreadCount } = useNotifications(hasToken);

  // جلب بيانات البروفايل لضمان وجود الصورة والاسم
  useEffect(() => {
    if (profileId && !profile) {
      fetchProfile(profileId);
    }
  }, [profileId, fetchProfile, profile]);

  // --- Scroll Magic (Twitter Style) ---
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
    <header className={`fixed top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-transform duration-500 ease-in-out ${isNavVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo */}
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
            <div className="absolute inset-0 rounded-xl bg-indigo-600 -rotate-3" />
            <Plane className="relative h-5 w-5 text-white -rotate-45" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 ml-1 hidden sm:block">
            Rahhal<span className="text-orange-500 text-3xl">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActivePath(path) ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto lg:gap-3">
          {hasToken ? (
            <>
              {/* --- Notifications (Restored Logic) --- */}
              <Popover className="relative">
                <Popover.Button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer outline-none">
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Popover.Button>

                <Transition
                  enter="transition duration-200 ease-out" enterFrom="scale-95 opacity-0" enterTo="scale-100 opacity-100"
                  leave="transition duration-150 ease-in" leaveFrom="scale-100 opacity-100" leaveTo="scale-95 opacity-0"
                >
                  <Popover.Panel className="absolute right-0 mt-3 w-80 max-w-sm rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 origin-top-right z-50">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">Notifications</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Your profile is updated!</p>
                        <p className="text-xs text-slate-400">Just now</p>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>

              <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1" />

              {/* --- User Profile Dropdown (The Masterpiece) --- */}
              <Popover className="relative hidden lg:block">
                <Popover.Button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-all outline-none border border-transparent hover:border-slate-100 group">
                  <img
                    src={profile?.profilePicture ? `${API_BASE_URL}${profile.profilePicture}` : "/api/placeholder/40/40"}
                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-100"
                    alt="user"
                  />
                    <p className="text-sm font-bold text-indigo-600 ">{profile?.userName || "Account"}</p>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-ui-open:rotate-180 transition-transform" />
                </Popover.Button>

                <Transition
                  enter="transition duration-150 ease-out" enterFrom="scale-95 opacity-0" enterTo="scale-100 opacity-100"
                  leave="transition duration-100 ease-in" leaveFrom="scale-100 opacity-100" leaveTo="scale-95 opacity-0"
                >
                  <Popover.Panel className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 outline-none">
                    <div className="space-y-0.5">
                      <Link
                        to={`/profile/${profileId}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <User className="h-4 w-4" /> My Profile
                      </Link>

                      <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full cursor-pointer">
                        <Moon className="h-4 w-4" /> Dark Mode
                      </button>

                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
                        <Languages className="h-4 w-4" /> Arabic Language
                      </button>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
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
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600">Sign In</Link>
              <Link to="/sign-up" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* --- Mobile Drawer (Original Preserved & Enhanced) --- */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 data-[closed]:opacity-0" />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel transition className="relative flex h-full w-full max-w-sm flex-col bg-white px-6 py-6 shadow-2xl transition duration-300 data-[closed]:translate-x-full">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xl font-black text-slate-800">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full bg-slate-50"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
              {/* Profile Card in Mobile Drawer */}
              {hasToken && (
                <Link
                  to={`/profile/${profileId}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 mb-2 border border-indigo-100"
                >
                  <img src={profile?.profilePicture ? `${API_BASE_URL}${profile.profilePicture}` : "/api/placeholder/40/40"} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <p className="font-black text-slate-800 leading-none">{profile?.userName}</p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">View My Profile</p>
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
                    className={`flex items-center gap-4 rounded-xl p-4 text-base font-bold transition-colors ${isActivePath(path) ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Icon className="h-6 w-6" /> {label}
                  </Link>
                );
              })}

              <div className="h-px bg-slate-50 my-2" />
              <button className="flex items-center gap-4 p-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"><Moon className="h-6 w-6" /> Dark Mode</button>
              <button className="flex items-center gap-4 p-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"><Languages className="h-6 w-6" /> Arabic Language</button>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              {hasToken ? (
                <button onClick={handleLogout} className="flex w-full items-center gap-4 rounded-xl bg-red-50 p-4 text-red-600 font-bold shadow-sm">
                  <LogOut className="h-6 w-6" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex justify-center rounded-xl bg-slate-100 p-4 font-bold text-slate-700">Sign In</Link>
                  <Link to="/sign-up" onClick={() => setMobileOpen(false)} className="flex justify-center rounded-xl bg-indigo-600 p-4 font-bold text-white shadow-lg">Sign Up</Link>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  );
}