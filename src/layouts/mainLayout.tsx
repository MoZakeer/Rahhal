import { useLocation, Outlet } from "react-router-dom";
import Navbar from "../shared/components/navbar";
import Footer from "../shared/components/footer";
import AppHeader from "@/components/AppHeader";

const MainLayout = () => {
  const location = useLocation();

  // 1. قائمة المسارات التي سيتم إخفاء الفوتر منها
  const hiddenFooterPaths = [
    "/",            
    "/feed",        
    "/create-post",            
  ];

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
      {showAppHeader ? <AppHeader /> : <Navbar />}

      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>

      {!shouldHideFooter && <Footer />}
    </>
  );
};

export default MainLayout;