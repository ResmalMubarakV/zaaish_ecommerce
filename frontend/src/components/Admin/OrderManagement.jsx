import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiPrinter, FiSearch, FiTruck, FiPackage, FiCheckCircle, FiEye, FiX } from 'react-icons/fi';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [printConsignmentOrder, setPrintConsignmentOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setOrders(data.orders || []);
            } else {
                console.error("Failed to fetch orders:", data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, status) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`Order status updated to ${status}`);
                fetchOrders();
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(data.order);
                }
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Server error updating status");
        }
    };

    const handlePrintConsignment = (order) => {
        setPrintConsignmentOrder(order);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        const matchesSearch = 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingAddress?.phone && order.shippingAddress.phone.includes(searchTerm));
        return matchesStatus && matchesSearch;
    });

    const statusCounts = {
        All: orders.length,
        Processing: orders.filter(o => o.status === "Processing").length,
        Shipped: orders.filter(o => o.status === "Shipped").length,
        Delivered: orders.filter(o => o.status === "Delivered").length,
        Cancelled: orders.filter(o => o.status === "Cancelled").length,
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading orders...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100'>
            
            {/* Dedicated Print Styles for Shipping Consignment Label */}
            <style>{`
                @page { size: A4 portrait; margin: 10mm; }
                @media print {
                    body * { visibility: hidden !important; }
                    .consignment-label-print, .consignment-label-print * { 
                        visibility: visible !important; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    .consignment-label-print { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100% !important; 
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 0 !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
                <div>
                    <h1 className='text-2xl sm:text-3xl font-serif font-light tracking-wide'>Order Management</h1>
                    <p className='text-xs uppercase tracking-[0.15em] text-stone-400 mt-1'>Monitor orders, print consignment shipping labels, and update fulfillment status.</p>
                </div>
                <div className='text-xs uppercase tracking-[0.15em] bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap border border-stone-200/80 dark:border-stone-800'>
                    Total Orders: {orders.length}
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="space-y-4 mb-6 no-print">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all cursor-pointer ${
                                statusFilter === tab
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                            }`}
                        >
                            {tab} ({statusCounts[tab] || 0})
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search by Order ID, customer name, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 pl-10 text-xs tracking-wide focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 shadow-sm"
                    />
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full no-print">
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        <thead className="bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800">
                            <tr>
                                <th className="py-4 px-6">Order ID</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Total Price</th>
                                <th className="py-4 px-6">Payment</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                        <td className='py-4 px-6 font-mono text-xs font-medium text-stone-900 dark:text-stone-100'>
                                            #{order._id.substring(order._id.length - 8)}
                                        </td>
                                        <td className="py-4 px-6 text-stone-800 dark:text-stone-200 font-medium text-sm">
                                            {order.shippingAddress?.firstName ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : (order.user?.name || "Guest")}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                            ₹{(order.totalPrice || 0).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${order.isPaid ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"}`}>
                                                {order.isPaid ? "Paid" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className='bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-stone-900 font-medium cursor-pointer'
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className='inline-flex items-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition cursor-pointer'
                                                title="View Details"
                                            >
                                                <FiEye className="mr-1" /> View
                                            </button>

                                            <button 
                                                onClick={() => handlePrintConsignment(order)}
                                                className='inline-flex items-center bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-200 transition cursor-pointer'
                                                title="Print Consignment Label"
                                            >
                                                <FiPrinter className="mr-1" /> Label
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                        No Orders Match Filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-[95%] sm:w-full max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                        <div className="flex justify-between items-start mb-6 border-b border-stone-100 dark:border-stone-800 pb-5">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Order Inspection</span>
                                <h3 className="text-xl sm:text-2xl font-serif font-light mt-1 tracking-wide">Order #{selectedOrder._id}</h3>
                                <p className="text-xs text-stone-400 mt-1 font-light">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-stone-400 hover:text-stone-900 text-2xl p-1 leading-none cursor-pointer"
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
                            <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                                <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Customer & Shipping Address</h4>
                                <p className="text-stone-800 dark:text-stone-200 font-medium">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                                <p className="text-stone-500 text-xs mt-1 font-light">{selectedOrder.shippingAddress?.address}</p>
                                <p className="text-stone-500 text-xs font-light">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                                <p className="text-stone-500 text-xs mt-1 font-light">Phone: {selectedOrder.shippingAddress?.phone}</p>
                            </div>
                            <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                                <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Payment & Fulfillment</h4>
                                <p className="text-stone-600 text-xs font-light"><span className="text-stone-400 uppercase tracking-wider">Method:</span> {selectedOrder.paymentMethod}</p>
                                <p className="text-stone-600 text-xs font-light mt-1"><span className="text-stone-400 uppercase tracking-wider">Payment Status:</span> <span className={selectedOrder.isPaid ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{selectedOrder.isPaid ? "Paid" : "Pending"}</span></p>
                                <p className="text-stone-600 text-xs font-light mt-1"><span className="text-stone-400 uppercase tracking-wider">Status:</span> <span className="font-medium text-stone-900 dark:text-stone-100">{selectedOrder.status}</span></p>
                            </div>
                        </div>

                        <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Ordered Items ({selectedOrder.orderItems?.length})</h4>
                        <div className="space-y-3 mb-6">
                            {selectedOrder.orderItems?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                                    <div className="flex items-center space-x-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm" />
                                        <div>
                                            <p className="text-xs sm:text-sm font-serif font-medium text-stone-900 dark:text-stone-100 line-clamp-1">{item.name}</p>
                                            <p className="text-[11px] text-stone-500 font-light mt-0.5">Size: {item.size} &bull; Color: {item.color} &bull; Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap ml-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-stone-100 dark:border-stone-800 pt-5 flex justify-between items-center">
                            <span className="font-serif font-light text-base tracking-wide">Total Order Amount</span>
                            <span className="text-lg sm:text-xl font-serif font-medium">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                            <button 
                                onClick={() => handlePrintConsignment(selectedOrder)}
                                className="inline-flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 px-6 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-200 transition cursor-pointer"
                            >
                                <FiPrinter className="mr-2" /> Print Shipping Label
                            </button>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-8 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-800 transition cursor-pointer shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN PRINT-ONLY CONSIGNMENT SHIPPING LABEL */}
            {printConsignmentOrder && (
                <div className="consignment-label-print hidden print:block p-8 border-4 border-black font-sans text-black">
                    <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-widest uppercase">ZAAISH LUXURY</h1>
                            <p className="text-xs uppercase font-bold tracking-wider mt-1">Consignment Dispatch Label &bull; Priority Air Mail</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold font-mono">TRACKING NO:</div>
                            <div className="text-xl font-extrabold font-mono">TRK-{printConsignmentOrder._id.toUpperCase()}</div>
                        </div>
                    </div>

                    {/* Barcode Graphic Box */}
                    <div className="my-6 text-center border-2 border-black p-4 bg-stone-50">
                        <div className="font-mono text-3xl font-bold tracking-widest mb-1">||| | |||| ||| ||||| || ||||| ||| |||</div>
                        <div className="text-xs font-mono font-bold uppercase">* TRK-{printConsignmentOrder._id} *</div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 border-b-2 border-black pb-6 mb-6">
                        {/* Sender */}
                        <div className="border-r-2 border-black pr-4">
                            <h2 className="text-xs font-extrabold uppercase tracking-widest bg-black text-white px-2 py-1 inline-block mb-3">FROM (SHIPPER)</h2>
                            <p className="font-bold text-sm">ZAAISH LUXURY ATELIER</p>
                            <p className="text-xs">Dispatch Center &bull; Gate 4</p>
                            <p className="text-xs">100 Fashion Way, Suite 400</p>
                            <p className="text-xs">New York, NY 10001, USA</p>
                            <p className="text-xs font-semibold mt-1">Contact: dispatch@zaaish.com</p>
                        </div>

                        {/* Recipient */}
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-widest bg-black text-white px-2 py-1 inline-block mb-3">TO (CONSIGNEE)</h2>
                            <p className="font-extrabold text-base uppercase">
                                {printConsignmentOrder.shippingAddress?.firstName} {printConsignmentOrder.shippingAddress?.lastName}
                            </p>
                            <p className="text-sm font-semibold mt-1">{printConsignmentOrder.shippingAddress?.address}</p>
                            <p className="text-sm font-semibold">
                                {printConsignmentOrder.shippingAddress?.city}, {printConsignmentOrder.shippingAddress?.state} {printConsignmentOrder.shippingAddress?.postalCode}
                            </p>
                            <p className="text-sm font-bold uppercase">{printConsignmentOrder.shippingAddress?.country}</p>
                            <p className="text-sm font-bold mt-2">TEL: {printConsignmentOrder.shippingAddress?.phone}</p>
                        </div>
                    </div>

                    {/* Package Specs */}
                    <div className="grid grid-cols-3 gap-4 border-b-2 border-black pb-4 mb-4 text-center">
                        <div className="border-r-2 border-black pr-2">
                            <span className="text-[10px] font-bold uppercase block">PAYMENT MODE</span>
                            <span className="text-sm font-extrabold uppercase">{printConsignmentOrder.paymentMethod} ({printConsignmentOrder.isPaid ? "PREPAID" : "COD"})</span>
                        </div>
                        <div className="border-r-2 border-black pr-2">
                            <span className="text-[10px] font-bold uppercase block">DECLARED VALUE</span>
                            <span className="text-sm font-extrabold">₹{printConsignmentOrder.totalPrice?.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase block">PACKAGE COUNT</span>
                            <span className="text-sm font-extrabold">1 OF 1 &bull; 1.2 KG</span>
                        </div>
                    </div>

                    {/* Order Contents */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2">CONSIGNMENT CONTENTS:</h3>
                        <table className="w-full text-xs text-left border border-black">
                            <thead className="bg-stone-200 uppercase font-bold border-b border-black">
                                <tr>
                                    <th className="p-2">Item Name</th>
                                    <th className="p-2">SKU</th>
                                    <th className="p-2">Size/Color</th>
                                    <th className="p-2 text-right">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                {printConsignmentOrder.orderItems?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 font-bold">{item.name}</td>
                                        <td className="p-2 font-mono">{item.sku}</td>
                                        <td className="p-2">{item.size} / {item.color}</td>
                                        <td className="p-2 text-right font-bold">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest border-t border-black pt-4">
                        *** OFFICIAL ZAAISH DISPATCH LABEL &bull; FRAGILE &bull; HANDLE WITH CARE ***
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderManagement;