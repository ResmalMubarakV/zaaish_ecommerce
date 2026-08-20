import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const AdminHomePage = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch('/api/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data.stats);
                    setRecentOrders(data.recentOrders || []);
                } else {
                    console.error("Failed to load admin metrics:", data.message);
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStats();
    }, []);

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading admin dashboard...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 w-full'>
        <div className="mb-8">
            <h1 className='text-2xl sm:text-3xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100'>Dashboard Overview</h1>
            <p className='text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mt-1'>Welcome back, Administrator. Here is what is happening with your store today.</p>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Total Revenue</p>
                    <p className="text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-light">
                    <span>Verified Earnings</span>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Total Orders</p>
                    <p className="text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">{stats.totalOrders}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <Link to="/admin/orders" className='text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-between transition-colors'>
                        <span>Manage Orders</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Catalog Products</p>
                    <p className="text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">{stats.totalProducts}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <Link to="/admin/products" className='text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-between transition-colors'>
                        <span>Manage Products</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Registered Users</p>
                    <p className="text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">{stats.totalUsers}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <Link to="/admin/users" className='text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-between transition-colors'>
                        <span>Manage Users</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className='text-xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100'>Recent Orders Activity</h2>
                <Link to="/admin/orders" className="text-[11px] uppercase tracking-[0.2em] text-stone-900 dark:text-stone-100 font-medium hover:underline">
                    View All Orders
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                    <thead className='bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800'>
                        <tr>
                            <th className="py-4 px-6">Order ID</th>
                            <th className="py-4 px-6">Customer</th>
                            <th className="py-4 px-6">Total Price</th>
                            <th className="py-4 px-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <tr key={order._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                    <td className='py-4 px-6 font-mono text-xs font-medium text-stone-900 dark:text-stone-100'>
                                        #{order._id.substring(order._id.length - 6)}
                                    </td>
                                    <td className='py-4 px-6 font-medium text-stone-800 dark:text-stone-200 text-sm'>{order.user ? order.user.name : "Guest User"}</td>
                                    <td className='py-4 px-6 font-semibold text-stone-900 dark:text-stone-100 text-sm'>${order.totalPrice.toFixed(2)}</td>
                                    <td className='py-4 px-6'>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                                            order.status === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" :
                                            order.status === "Shipped" ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800" :
                                            "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                        }`}>
                                            {order.status || "Processing"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                    No recent orders found
                                </td>
                            </tr>
                        )}  
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminHomePage;