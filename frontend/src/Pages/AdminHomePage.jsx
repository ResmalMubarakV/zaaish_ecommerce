import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FiDownload, FiTrendingUp, FiShoppingBag, FiUsers, FiBox } from 'react-icons/fi';

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

    const handleExportCSV = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('/api/orders/export-csv', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `zaaish_sales_report_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success("Sales Report downloaded successfully!");
            } else {
                toast.error("Failed to export sales report");
            }
        } catch (err) {
            console.error("CSV Export error:", err);
            toast.error("Error downloading sales CSV");
        }
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading admin dashboard...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100'>
            
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className='text-xl sm:text-3xl font-serif font-light tracking-wide'>Dashboard Overview</h1>
                    <p className='text-xs uppercase tracking-[0.15em] text-stone-400 mt-1'>Welcome back, Administrator. Real-time store performance and revenue analytics.</p>
                </div>

                <button
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer"
                >
                    <FiDownload className="mr-2 text-sm" /> Export Sales CSV
                </button>
            </div>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Total Revenue</span>
                            <FiTrendingUp className="text-emerald-500 text-lg" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">₹{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-emerald-600 dark:text-emerald-400 font-light">
                        <span>Verified Earnings</span>
                    </div>
                </div>

                <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Total Orders</span>
                            <FiShoppingBag className="text-stone-500 text-lg" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">{stats.totalOrders}</p>
                    </div>
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <Link to="/admin/orders" className='text-stone-900 dark:text-stone-100 hover:text-stone-600 text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-between transition-colors'>
                            <span>Manage Orders</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>

                <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Catalog Products</span>
                            <FiBox className="text-stone-500 text-lg" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">{stats.totalProducts}</p>
                    </div>
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <Link to="/admin/products" className='text-stone-900 dark:text-stone-100 hover:text-stone-600 text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-between transition-colors'>
                            <span>Manage Products</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>

                <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 shadow-sm rounded-3xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Registered Users</span>
                            <FiUsers className="text-stone-500 text-lg" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-serif font-light text-stone-900 dark:text-stone-100 mt-3">{stats.totalUsers}</p>
                    </div>
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <Link to="/admin/users" className='text-stone-900 dark:text-stone-100 hover:text-stone-600 text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-between transition-colors'>
                            <span>Manage Users</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Performance Sales Chart Graphic */}
            <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Sales Distribution</span>
                        <h2 className="text-base sm:text-lg font-serif font-light tracking-wide mt-0.5">Order Fulfillment Breakdown</h2>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">Live Analytics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 block mb-1">Delivered</span>
                        <span className="text-lg sm:text-xl font-serif font-medium text-emerald-600">
                            {recentOrders.filter(o => o.status === "Delivered").length} Orders
                        </span>
                    </div>
                    <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 block mb-1">Shipped</span>
                        <span className="text-lg sm:text-xl font-serif font-medium text-blue-600">
                            {recentOrders.filter(o => o.status === "Shipped").length} Orders
                        </span>
                    </div>
                    <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 block mb-1">Processing</span>
                        <span className="text-lg sm:text-xl font-serif font-medium text-amber-600">
                            {recentOrders.filter(o => o.status === "Processing" || !o.status).length} Orders
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-stone-900 p-4 sm:p-8 lg:p-10 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6">
                    <div>
                        <h2 className='text-lg sm:text-xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100'>Recent Store Orders</h2>
                        <p className='text-xs text-stone-400 font-light mt-0.5'>Latest customer checkout transactions and dispatch status</p>
                    </div>
                    <Link to="/admin/orders" className="text-[11px] uppercase tracking-[0.2em] text-stone-900 dark:text-stone-100 font-semibold hover:underline">
                        View All Orders &rarr;
                    </Link>
                </div>
                <div className="overflow-x-auto scrollbar-none">
                    <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        <thead className='bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800'>
                            <tr>
                                <th className="py-4 px-6">Order ID & Time</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Total Amount</th>
                                <th className="py-4 px-6">Payment Mode</th>
                                <th className="py-4 px-6">Fulfillment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => {
                                    const isCOD = order.paymentMethod === "Cash on Delivery";
                                    return (
                                        <tr key={order._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                            <td className='py-4 px-6'>
                                                <p className='font-mono text-xs font-medium text-stone-900 dark:text-stone-100'>
                                                    #{order._id.substring(order._id.length - 8)}
                                                </p>
                                                <p className='text-[10px] text-stone-400 font-light mt-0.5'>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className='py-4 px-6 font-medium text-stone-800 dark:text-stone-200 text-sm'>
                                                {order.shippingAddress?.firstName ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : (order.user ? order.user.name : "Customer")}
                                            </td>
                                            <td className='py-4 px-6'>
                                                <p className='font-semibold text-stone-900 dark:text-stone-100 text-sm'>
                                                    ₹{(order.totalPrice || 0).toFixed(2)}
                                                </p>
                                                {isCOD && (
                                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                                                        +₹{(order.codFee || 60).toFixed(2)} COD fee
                                                    </p>
                                                )}
                                            </td>
                                            <td className='py-4 px-6'>
                                                {isCOD ? (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 inline-block">
                                                        Cash on Delivery
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 inline-block">
                                                        {order.paymentMethod || "Card"}
                                                    </span>
                                                )}
                                            </td>
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
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
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