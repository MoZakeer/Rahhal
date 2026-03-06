import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const profileId = parsedAuth?.profileId;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

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

  // Prevent scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto flex items-center h-16 justify-between px-4 md:px-6 relative">
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl gradient-sunset">
            <Plane className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          <span className="text-xl md:text-2xl font-bold">Rahhal</span>
        </Link>

        {/* Center: Navigation */}

        <nav className="hidden lg:flex gap-4 flex-wrap py-2 px-2 justify-center flex-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = isActivePath(path);
            return (
              <Link
                key={path}
                to={path}
                className={[
                  "flex items-center gap-1 rounded-xl px-3 py-2 text-base font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Actions */}
        <div className="hidden lg:flex items-center gap-2 md:gap-3 ml-auto">
          {hasToken ? (
            <>
              {/* Notification */}
              <button className="h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Profile */}
              <button

                onClick={() => navigate(`/profile/${profileId}`)}
                className="h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer"
              >
                <CircleUser className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Settings */}
              {/* <button
                onClick={() => navigate("/settings")}
                className="h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </button> */}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="h-9 md:h-10 px-3 md:px-4 rounded-xl flex items-center gap-1 md:gap-2 text-sm md:text-base font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-sm md:text-base font-medium hover:text-primary transition">
                  Sign In
                </button>
              </Link>
              <Link to="/sign-up">
                <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-black text-white text-sm md:text-base font-medium transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-muted transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative ml-auto w-3/4 sm:w-2/3 max-w-xs bg-white h-full shadow-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {navItems.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted transition"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}

              {hasToken ? (
                <>
                  <button
                    onClick={() => {
                      navigate(`/profile/${profileId}`);

                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition"
                  >
                    <CircleUser className="h-5 w-5" />
                    Profile
                  </button>
                  {/* <button
                    onClick={() => {
                      navigate("/settings");
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition"
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </button> */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2 rounded-xl block text-center hover:bg-muted transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2 rounded-xl block text-center bg-black text-white hover:bg-gray-800 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
