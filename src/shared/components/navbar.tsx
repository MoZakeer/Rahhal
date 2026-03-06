import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  Bell,
  // Settings,
  LogOut,
  CircleUser,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
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

  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }, []);

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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => setMobileOpen(false)}
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

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {hasToken ? (
            <div className="flex items-center gap-2">

              {/* Notifications */}
              <Popover className="relative">
                <Popover.Button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
                </Popover.Button>

                <Popover.Panel className="absolute right-0 mt-3 w-80 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">Notifications</span>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
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

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <button
                onClick={() => navigate(`/profile/${profileId}`)}
                className="flex h-10 w-10  cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              >
                <CircleUser className="h-5 w-5" />
              </button>

              {/* <button
                onClick={() => navigate("/settings")}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
              >
                <Settings className="h-5 w-5" />
              </button> */}

              <button
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>

            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
              >
                Sign In
              </Link>

              <Link
                to="/sign-up"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile button */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 lg:hidden">

        <DialogBackdrop className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <div className="fixed inset-0 flex justify-end">

          <DialogPanel className="relative flex h-full w-full max-w-sm flex-col bg-white px-6 py-6 shadow-2xl">

            <div className="mb-8 flex items-center justify-between">
              <span className="text-xl font-black text-slate-800">Menu</span>

              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = isActivePath(path);

                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 rounded-xl p-4 text-base font-semibold ${
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

            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100">

              {hasToken ? (
                <>
                  <button
                    onClick={() => {
                      navigate(`/profile/${profileId}`);
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-4 rounded-xl p-4 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    <CircleUser className="h-6 w-6" />
                    Profile
                  </button>

                  {/* <button
                    onClick={() => {
                      navigate("/settings");
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-4 rounded-xl p-4 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    <Settings className="h-6 w-6" />
                    Settings
                  </button> */}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 rounded-xl bg-red-50 p-4 text-red-600 font-bold hover:bg-red-100"
                  >
                    <LogOut className="h-6 w-6" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-slate-100 p-4 font-bold text-slate-700"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-indigo-600 p-4 font-bold text-white"
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