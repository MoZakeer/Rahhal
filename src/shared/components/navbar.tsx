import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  // User,
  Bell,
  // Menu,
  // X,
  Settings,
  LogOut,
  CircleUser,
} from "lucide-react";

// import { AnimatePresence, motion } from "framer-motion";
const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Plane, label: "My Trips", path: "/my-trips" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setProfileMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  // const isLandingPage = location.pathname === "/landing-page";

  const handleLogout = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    setMobileOpen(false);
    setProfileMenuOpen(false);
    navigate("/login");
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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setProfileMenuOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
   <header className="sticky top-0 bg-white shadow-sm">
  <div className="container mx-auto flex items-center h-16 justify-between px-4">
    {/* Left: Logo */}
    <Link
      to="/"
      className="flex items-center gap-2"
      onClick={() => setMobileOpen(false)}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-sunset">
        <Plane className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold">Rahhal</span>
    </Link>

    {/* Center: Navigation (4 items) */}
    <nav className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
      {navItems.slice(0, 4).map(({ icon: Icon, label, path }) => {
        const isActive = isActivePath(path);
        return (
          <Link
            key={path}
            to={path}
            className={[
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>

    {/* Right: User Actions (3 icons) */}
    <div className="hidden md:flex items-center gap-3">
      {hasToken ? (
        <>
          {/* Notification */}
          <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer">
            <Bell className="h-5 w-5" />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate(`/profile`)}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer"
          >
            <CircleUser className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate("/settings")}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">
            <button className="px-4 py-2 rounded-xl text-sm font-medium hover:text-primary transition">
              Sign In
            </button>
          </Link>
          <Link to="/sign-up">
            <button className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium transition">
              Sign Up
            </button>
          </Link>
        </>
      )}
    </div>
  </div>
</header>
  );
}