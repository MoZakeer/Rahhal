import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  Bell,
  LogOut,
  CircleUser,
  Menu,
  X,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const navItems = [
  { icon: Home, label: "Home", path: "/feed" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Plane, label: "My Trips", path: "/my-trips" },
  { icon: MessageCircle, label: "Messages", path: "/chat" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const profileId = parsedAuth?.profileId || "";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(() => !!localStorage.getItem("token"));
  const { unreadCount } = useNotifications(hasToken);

  useEffect(() => {
    document.documentElement.dir = "ltr";
  }, []);

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
  // ------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    setHasToken(false);
    setMobileOpen(false);
    navigate("/landing-page");
  };

  const isActivePath = useMemo(() => {
    return (path: string) => location.pathname === path;
  }, [location.pathname]);

  return (
    <header className={`fixed top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-transform duration-300 ease-in-out ${isNavVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <Link
          to="/feed"
          className="flex items-center gap-2 group cursor-pointer"
          onClick={(e) => {
            if (location.pathname === "/feed") e.preventDefault(); 
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.dispatchEvent(new CustomEvent("refreshFeed"));
            setMobileOpen(false);
          }}
        >
          <div className="relative flex h-10 w-10 items-center justify-center group-active:scale-95 transition-transform">
            <div className="absolute inset-0 rounded-xl bg-orange-400 rotate-6 opacity-80 transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 rounded-xl bg-indigo-600 -rotate-3 transition-transform group-hover:rotate-0" />
            <Plane className="relative h-5 w-5 text-white -rotate-45" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 ml-1">
            Rahhal<span className="text-orange-500 text-3xl">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = isActivePath(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={(e) => { if (isActive) e.preventDefault(); }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section (Desktop & Mobile combined) */}
        <div className="flex items-center gap-2 ml-auto lg:gap-3">
          {hasToken ? (
            <>
              {/* Notifications (Visible on Desktop & Mobile) */}
              <Popover className="relative">
                <Popover.Button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer outline-none">
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Popover.Button>

                <Popover.Panel className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 origin-top-right transition">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        New trip has been added!
                      </p>
                      <p className="text-xs text-slate-400">5 mins ago</p>
                    </div>
                  </div>
                </Popover.Panel>
              </Popover>

              <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1" />

              {/* Profile (Visible on Desktop & Mobile) */}
              <button
                onClick={() => {
                  const targetPath = `/profile/${profileId}`;
                  if (location.pathname !== targetPath) navigate(targetPath);
                }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              >
                <CircleUser className="h-5 w-5" />
              </button>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                onClick={(e) => { if (location.pathname === "/login") e.preventDefault(); }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                onClick={(e) => { if (location.pathname === "/sign-up") e.preventDefault(); }}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 ml-1"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 lg:hidden">
        {/* Animated Backdrop */}
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-linear data-[closed]:opacity-0" 
        />

        <div className="fixed inset-0 flex justify-end">
          {/* Animated Panel */}
          <DialogPanel 
            transition
            className="relative flex h-full w-full max-w-sm flex-col bg-white px-6 py-6 shadow-2xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xl font-black text-slate-800">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = isActivePath(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={(e) => {
                      if (isActive) e.preventDefault(); 
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-4 rounded-xl p-4 text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions Container */}
            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100">
              {hasToken ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 rounded-xl bg-red-50 p-4 text-red-600 font-bold hover:bg-red-100 cursor-pointer transition-colors"
                >
                  <LogOut className="h-6 w-6" />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={(e) => {
                      if (location.pathname === "/login") e.preventDefault();
                      setMobileOpen(false);
                    }}
                    className="flex items-center justify-center rounded-xl bg-slate-100 p-4 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={(e) => {
                      if (location.pathname === "/sign-up") e.preventDefault(); 
                      setMobileOpen(false);
                    }}
                    className="flex items-center justify-center rounded-xl bg-indigo-600 p-4 font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  );
}