import React from 'react'
import { FaBoxOpen, FaClipboardList, FaSignOutAlt, FaStore, FaUser } from 'react-icons/fa'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/admin/login");
    }

  return (
    <div className='h-full flex flex-col justify-between p-6 bg-stone-900 text-stone-300'>
        <div>
            {/* Logo / Brand */}
            <div className="mb-10 px-2 pt-2 md:pt-0">
                <Link to="/admin" className="text-xl font-serif tracking-[0.2em] uppercase text-white font-light block">
                    Zaaish
                    <span className="text-stone-500 text-[10px] font-sans uppercase tracking-[0.25em] block mt-1">Admin Panel</span>
                </Link>
            </div>

            {/* Navigation links */}
            <nav className='flex flex-col space-y-2'>
                <NavLink 
                    to="/admin/users" 
                    className={({isActive}) =>
                     isActive 
                        ? "bg-stone-800 text-white py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium shadow-sm transition-all"
                        : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium transition-all"
                    }
                >
                    <FaUser className="text-stone-400 text-xs" />
                    <span>Users</span>
                </NavLink>

                <NavLink 
                    to="/admin/products" 
                    className={({isActive}) =>
                     isActive 
                        ? "bg-stone-800 text-white py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium shadow-sm transition-all"
                        : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium transition-all"
                    }
                >
                    <FaBoxOpen className="text-stone-400 text-xs" />
                    <span>Products</span>
                </NavLink>

                <NavLink 
                    to="/admin/orders" 
                    className={({isActive}) =>
                     isActive 
                        ? "bg-stone-800 text-white py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium shadow-sm transition-all"
                        : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium transition-all"
                    }
                >
                    <FaClipboardList className="text-stone-400 text-xs" />
                    <span>Orders</span>
                </NavLink>

                <div className="pt-4 mt-4 border-t border-stone-800/80">
                    <NavLink 
                        to="/" 
                        className="text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 py-3 px-4 rounded-xl flex items-center space-x-3 text-xs uppercase tracking-[0.15em] font-medium transition-all"
                    >
                        <FaStore className="text-stone-400 text-xs" />
                        <span>View Store</span>
                    </NavLink>
                </div>
            </nav>
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t border-stone-800/80 mb-2">
            <button 
                onClick={handleLogout} 
                className='w-full border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer'
            >
                <FaSignOutAlt className="text-xs" />
                <span>Logout</span>
            </button>
        </div>
    </div>
  )
}

export default AdminSidebar;