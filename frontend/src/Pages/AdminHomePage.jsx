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
        return <div className="text-center py-20 text-stone-400 font-light">Loading admin dashboard...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10'>
        <div className="mb-8">
            <h1 className='text-3xl font-serif text-stone-900 tracking-tight'>Dashboard Overview</h1>
            <p className='text-sm text-stone-500 mt-1'>Welcome back, Administrator. Here is what is happening with your store today.</p>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-white shadow-sm rounded-2xl border border-stone-200/80 flex flex-col justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Total Revenue</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center text-xs text-emerald-600 font-medium">
                    <span>Verified Earnings</span>
                </div>
            </div>

            <div className="p-6 bg-white shadow-sm rounded-2xl border border-stone-200/80 flex flex-col justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Total Orders</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100">
                    <Link to="/admin/orders" className='text-stone-900 hover:text-stone-600 text-xs font-semibold uppercase tracking-wider flex items-center justify-between'>
                        <span>Manage Orders</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="p-6 bg-white shadow-sm rounded-2xl border border-stone-200/80 flex flex-col justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Catalog Products</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">{stats.totalProducts}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100">
                    <Link to="/admin/products" className='text-stone-900 hover:text-stone-600 text-xs font-semibold uppercase tracking-wider flex items-center justify-between'>
                        <span>Manage Products</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="p-6 bg-white shadow-sm rounded-2xl border border-stone-200/80 flex flex-col justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Registered Users</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100">
                    <Link to="/admin/users" className='text-stone-900 hover:text-stone-600 text-xs font-semibold uppercase tracking-wider flex items-center justify-between'>
                        <span>Manage Users</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-center mb-6">
                <h2 className='text-xl font-serif text-stone-900'>Recent Orders Activity</h2>
                <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-stone-900 font-semibold hover:underline">
                    View All Orders
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-stone-600">
                    <thead className='bg-stone-50 text-xs uppercase text-stone-500 font-semibold tracking-wider border-b border-stone-200'>
                        <tr>
                            <th className="py-4 px-4">Order ID</th>
                            <th className="py-4 px-4">Customer</th>
                            <th className="py-4 px-4">Total Price</th>
                            <th className="py-4 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <tr key={order._id} className='hover:bg-stone-50/60 transition-colors'>
                                    <td className='py-4 px-4 font-mono text-xs font-semibold text-stone-900'>
                                        #{order._id.substring(order._id.length - 6)}
                                    </td>
                                    <td className='py-4 px-4 font-medium text-stone-800'>{order.user ? order.user.name : "Guest User"}</td>
                                    <td className='py-4 px-4 font-semibold text-stone-900'>${order.totalPrice.toFixed(2)}</td>
                                    <td className='py-4 px-4'>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            order.status === "Delivered" ? "bg-emerald-50 text-emerald-700" :
                                            order.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                                            "bg-amber-50 text-amber-700"
                                        }`}>
                                            {order.status || "Processing"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className='py-12 text-center text-stone-400'>
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