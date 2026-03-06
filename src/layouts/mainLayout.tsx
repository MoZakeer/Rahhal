import { useLocation, Outlet } from "react-router-dom";
import Navbar from "../shared/components/navbar";
import Footer from "../shared/components/footer";

const MainLayout = () => {
  const location = useLocation();

  // 1. قائمة المسارات التي سيتم إخفاء الفوتر منها
  const hiddenFooterPaths = [
    "/",            
    "/feed",        
    "/create-post",            
  ];

  const shouldHideFooter = hiddenFooterPaths.includes(location.pathname);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>

      {!shouldHideFooter && <Footer />}
    </>
  );
};

export default MainLayout;