import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * MainLayout bao gồm Navbar + <Outlet> + Footer.
 * Dùng cho tất cả trang public (Home, Blog, BlogDetail).
 */
function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
