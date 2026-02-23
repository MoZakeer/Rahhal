import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Plane,
  MessageCircle,
  User,
  Bell,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Plane, label: "My Trips", path: "/my-trips" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLandingPage = location.pathname === "/landing-page";

  const isActivePath = useMemo(() => {
    return (path: string) => location.pathname === path;
  }, [location.pathname]);

  // Prevent scroll when drawer open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
          <span className="text-xl font-bold text-foreground">Rahhal</span>
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
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isLandingPage ? (
            <>
              <Link to="/login">
                <button className="px-4 py-2 rounded-xl text-sm shadow-sm font-medium hover:text-primary transition">
                  Sign In
                </button>
              </Link>

              <Link to="/sign-up">
                <button className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <>
              <button
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-foreground" />
              </button>

              <Link
                to="/profile"
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition"
              >
                <User className="h-5 w-5 text-foreground" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* ===== Mobile Drawer ===== */}
      <div
        className={[
          "fixed inset-0 z-[60] md:hidden transition",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {/* Overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={[
            "absolute inset-0 bg-black/60 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* Drawer */}
        <div
          className={[
            "absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white",
            "transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-sunset">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Rahhal</span>
            </div>

            <button
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-4 flex flex-col gap-3">
            {/* Nav Items */}
            <div className="flex flex-col gap-1">
              {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = isActivePath(path);

                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
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
            </div>

            <div className="h-px bg-border" />

            {/* Mobile Actions */}
            {isLandingPage ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 hover:bg-muted rounded-xl"
                >
                  Sign In
                </Link>

                <Link
                  to="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 bg-black text-white rounded-xl"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-xl"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>

                <button className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-xl">
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}