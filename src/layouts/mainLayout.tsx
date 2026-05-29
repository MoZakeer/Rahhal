import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../shared/components/navbar";
import Footer from "../shared/components/footer";
// import AppHeader from "@/components/AppHeader";
import FloatingSidebar from "@/components/FloatingSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
// import FloatingChatBubble from "@/features/aiChatBot/components/FloatingChatBubble";
import UploadProgressIndicator from "@/pages/feed/UploadProgressIndicator"
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
    navigate("/landing-page");

    onLogout();
  };
  const hiddenFooterPaths = ["/landing-page"];

  const appHeaderPaths = [
    "/explore",
    "/create-trip",
    "/ai-planner",
    "/matching",
    "/my-trips",
  ];

  const shouldnotHideFooter = hiddenFooterPaths.includes(location.pathname);

  const showAppHeader =
    appHeaderPaths.includes(location.pathname) ||
    location.pathname.startsWith("/trip/");

  return (
    <>
      <UploadProgressIndicator />
      <Navbar onLogoutClick={handleLogout} />
      <FloatingSidebar />
      <MobileBottomNav />
      {/* <FloatingChatBubble /> */}

      <main
        className={`min-h-screen bg-gray-100 ${showAppHeader ? "mt-15" : ""}`}
      >
        <Outlet />
      </main>

      {shouldnotHideFooter && <Footer />}
    </>
  );
};

export default MainLayout;
