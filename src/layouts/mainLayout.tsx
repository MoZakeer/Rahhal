import Navbar from '../shared/components/navbar';
import Footer from '../shared/components/footer';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
