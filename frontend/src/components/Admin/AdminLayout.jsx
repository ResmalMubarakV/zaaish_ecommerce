import React, { useEffect, useState } from 'react'
import { FaBars } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userInfo");

    if (!token || !storedUser) {
      navigate("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        alert("Access denied. Admin credentials required.");
        navigate("/admin/login");
      } else {
        setIsAdminAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/admin/login");
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAdminAuthenticated) {
    return null; 
  }

  return (
    <div className='h-screen w-full flex overflow-hidden bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors'>
      {/* Mobile Toggle Button Header */}
      <div className='flex md:hidden fixed top-0 left-0 right-0 p-4 bg-stone-900 dark:bg-stone-900 text-white z-40 items-center justify-between shadow-md border-b border-stone-800'>
        <div className="flex items-center space-x-3">
          <button onClick={toggleSidebar} className="p-1 cursor-pointer">
            <FaBars size={18} />
          </button>
          <span className='font-serif text-sm tracking-[0.2em] uppercase font-light'>Zaaish Admin</span>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className='fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm' 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sticky / Fixed Sidebar */} 
      <div className={`bg-stone-900 w-64 h-full fixed md:static inset-y-0 left-0 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 md:translate-x-0 z-40 flex-shrink-0 border-r border-stone-800`}>
        <AdminSidebar />
      </div> 

      {/* Main Content (Scrollable Area) */}
      <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;