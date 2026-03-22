import { Link, useLocation } from "react-router-dom";
import { Compass, Plus, Sparkles, LayoutList, GitCompareArrows, Menu, X, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Create Trip", path: "/create-trip", icon: Plus },
  { label: "AI Planner", path: "/ai-planner", icon: Sparkles },
  { label: "Matching", path: "/matching", icon: GitCompareArrows },
  { label: "My Trips", path: "/my-trips", icon: Plane },
  { label: "Rahhal Feed", path: "/", icon: LayoutList },
];

const AppHeader = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="px-[24px] sticky top-0 z-50 bg-card/80 backdrop-blur-xl w-full">
      <div className="flex h-16 items-center justify-between">
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
            <div className="absolute inset-0 rounded-xl bg-indigo-600 dark:bg-indigo-500 -rotate-3" />
            <Plane className="relative h-5 w-5 text-white -rotate-45" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 ml-1 hidden sm:block">
            Rahhal<span className="text-orange-500 dark:text-orange-400 text-3xl">.</span>
            {/* <span className="font-display text-xl font-bold text-foreground">Rahhal</span> */}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
