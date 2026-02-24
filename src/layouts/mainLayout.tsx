import Navbar from '../shared/components/navbar';
import Footer from '../shared/components/footer';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
<<<<<<< HEAD
      {/* <Navbar /> */}
      <main>
=======
      <Navbar />
      <main className="min-h-screen bg-gray-100">
>>>>>>> e628c46d50ad8d1c1769a05b03fd0db1da8d50ab
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default MainLayout;
