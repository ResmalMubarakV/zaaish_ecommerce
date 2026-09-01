import React from 'react';
import { FiHome, FiBox, FiShoppingBag, FiUsers, FiTag, FiExternalLink, FiLogOut } from 'react-icons/fi';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/admin/login");
    };

    const navItems = [
        { path: "/admin", name: "Dashboard", icon: FiHome, end: true },
        { path: "/admin/orders", name: "Orders & COD", icon: FiShoppingBag, end: false },
        { path: "/admin/products", name: "Products Catalog", icon: FiBox, end: false },
        { path: "/admin/coupons", name: "Promo & Coupons", icon: FiTag, end: false },
        { path: "/admin/users", name: "Customer Accounts", icon: FiUsers, end: false },
    ];

    return (
        <div className='h-full flex flex-col justify-between p-6 bg-stone-950 text-stone-300 border-r border-stone-850 select-none'>
            <div>
                {/* Logo / Brand */}
                <div className="mb-10 px-2 pt-2 md:pt-0">
                    <Link to="/admin" className="block group">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-serif tracking-[0.25em] uppercase text-white font-light">
                                ZAAISH
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Atelier
                            </span>
                        </div>
                        <span className="text-stone-500 text-[10px] uppercase tracking-[0.3em] font-light block mt-1.5">
                            Executive Admin Console
                        </span>
                    </Link>
                </div>

                {/* Navigation links */}
                <nav className='flex flex-col space-y-1.5'>
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path}
                            to={item.path} 
                            end={item.end}
                            className={({ isActive }) =>
                                isActive 
                                    ? "bg-gradient-to-r from-stone-900 to-stone-850 text-white border-l-2 border-amber-400 py-3.5 px-4 rounded-xl flex items-center space-x-3.5 text-xs uppercase tracking-[0.15em] font-medium shadow-sm transition-all"
                                    : "text-stone-400 hover:bg-stone-900/60 hover:text-stone-100 py-3.5 px-4 rounded-xl flex items-center space-x-3.5 text-xs uppercase tracking-[0.15em] font-light transition-all"
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`text-base ${isActive ? "text-amber-400" : "text-stone-500"}`} />
                                    <span>{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="pt-6 mt-6 border-t border-stone-900">
                        <NavLink 
                            to="/" 
                            target="_blank"
                            className="text-stone-400 hover:bg-stone-900/60 hover:text-stone-200 py-3 px-4 rounded-xl flex items-center justify-between text-xs uppercase tracking-[0.15em] font-light transition-all group"
                        >
                            <span className="flex items-center space-x-3">
                                <FiExternalLink className="text-stone-500 group-hover:text-stone-300 text-sm" />
                                <span>Live Storefront</span>
                            </span>
                            <span className="text-[10px] text-stone-600 group-hover:text-stone-400">&rarr;</span>
                        </NavLink>
                    </div>
                </nav>
            </div>

            {/* Logout Section */}
            <div className="pt-6 border-t border-stone-900 mb-2">
                <button 
                    onClick={handleLogout} 
                    className='w-full border border-stone-850 hover:border-rose-900/50 text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer'
                >
                    <FiLogOut className="text-sm" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;