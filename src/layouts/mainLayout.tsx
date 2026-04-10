import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../shared/components/navbar";
import Footer from "../shared/components/footer";
import AppHeader from "@/components/AppHeader";

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout = ({ onLogout }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    // 1. Clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    localStorage.removeItem("user");

    // 2. Notify the parent (Pages.tsx) to re-render
    onLogout();

    // 3. Kick them to the landing page
    navigate("/landing-page");
  };
  // 1. قائمة المسارات التي سيتم إخفاء الفوتر منها
  const hiddenFooterPaths = ["/", "/feed", "/create-post"];

  // 2. قائمة المسارات اللي هيظهر فيها AppHeader بدل الـ Navbar
  const appHeaderPaths = [
    "/explore",
    "/create-trip",
    "/ai-planner",
    "/matching",
    "/my-trips",
  ];

  const shouldHideFooter = hiddenFooterPaths.includes(location.pathname);

  // 3. التحقق إذا كان المسار الحالي يحتاج AppHeader
  // استخدمنا startsWith عشان مسار تفاصيل الرحلة اللي فيه ID متغير زي /trip/123
  const showAppHeader =
    appHeaderPaths.includes(location.pathname) ||
    location.pathname.startsWith("/trip/");

  return (
    <>
      {showAppHeader ?(
        <AppHeader  />
      ) : (
        <Navbar onLogoutClick={handleLogout} />
      )}

      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>

      {!shouldHideFooter && <Footer />}
    </>
  );
};

export default MainLayout;
