import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  User,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
  CircleUser,
} from "lucide-react";

import { getUserId } from "../../utils/auth";

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const isLandingPage = location.pathname === "/landing-page";

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
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ icon: Icon, label, path }) => {
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {hasToken ? (
            <>
              <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted">
                <Bell className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen((prev) => !prev);
                  }}
                  className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted"
                >
                  <CircleUser className="h-5 w-5" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                    <button
                      onClick={() => {
                        navigate(`/profile/${getUserId()}`);
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate("/settings");
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 rounded-xl text-sm font-medium hover:text-primary">
                  Sign In
                </button>
              </Link>

              <Link to="/sign-up">
                <button className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden flex items-center gap-2">
          {!isLandingPage && (
            <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted">
              <Bell className="h-5 w-5" />
            </button>
          )}

          <button
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white transition-transform ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}

            {hasToken ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-500"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link to="/sign-up" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}