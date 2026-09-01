import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiPrinter, FiSearch, FiTruck, FiPackage, FiCheckCircle, FiEye, FiX, FiDollarSign, FiRefreshCw } from 'react-icons/fi';

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

    const handleTogglePaymentStatus = async (orderId, currentPaidStatus) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isPaid: !currentPaidStatus })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(!currentPaidStatus ? "Marked as Paid!" : "Marked as Payment Pending");
                fetchOrders();
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(data.order);
                }
            } else {
                toast.error(data.message || "Failed to update payment status");
            }
        } catch (error) {
            toast.error("Server error updating payment");
        }
    };

    const handlePrintConsignment = (order) => {
        setPrintConsignmentOrder(order);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const filteredOrders = orders.filter(order => {
        let matchesStatus = true;
        if (statusFilter === "COD") {
            matchesStatus = order.paymentMethod === "Cash on Delivery";
        } else if (statusFilter !== "All") {
            matchesStatus = order.status === statusFilter;
        }

        const matchesSearch = 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingAddress?.firstName && order.shippingAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingAddress?.lastName && order.shippingAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingAddress?.phone && order.shippingAddress.phone.includes(searchTerm));
        return matchesStatus && matchesSearch;
    });

    const statusCounts = {
        All: orders.length,
        COD: orders.filter(o => o.paymentMethod === "Cash on Delivery").length,
        Processing: orders.filter(o => o.status === "Processing" || !o.status).length,
        Shipped: orders.filter(o => o.status === "Shipped").length,
        Delivered: orders.filter(o => o.status === "Delivered").length,
        Cancelled: orders.filter(o => o.status === "Cancelled").length,
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading orders console...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100'>
            
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

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 no-print">
                <div>
                    <h1 className='text-xl sm:text-3xl font-serif font-light tracking-wide'>Order & Fulfillment Console</h1>
                    <p className='text-xs uppercase tracking-[0.15em] text-stone-400 mt-1'>
                        Monitor all orders, manage Cash on Delivery (COD) dispatches, and print shipping labels.
                    </p>
                </div>
                <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
                    <button
                        onClick={fetchOrders}
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition cursor-pointer shadow-sm"
                        title="Refresh Orders"
                    >
                        <FiRefreshCw className="text-sm" />
                    </button>
                    <div className='text-xs uppercase tracking-[0.15em] bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap border border-stone-200/80 dark:border-stone-800'>
                        Total: {orders.length} ({statusCounts.COD} COD)
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="space-y-4 mb-6 no-print">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-scroll">
                    {[
                        { id: "All", label: "All Orders", count: statusCounts.All },
                        { id: "COD", label: "COD Orders (₹60 Fee)", count: statusCounts.COD, highlight: true },
                        { id: "Processing", label: "Processing", count: statusCounts.Processing },
                        { id: "Shipped", label: "Shipped", count: statusCounts.Shipped },
                        { id: "Delivered", label: "Delivered", count: statusCounts.Delivered },
                        { id: "Cancelled", label: "Cancelled", count: statusCounts.Cancelled },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                                statusFilter === tab.id
                                    ? tab.highlight 
                                        ? "bg-amber-500 text-stone-950 shadow-md font-bold" 
                                        : "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                                    : tab.highlight
                                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-900/60 hover:bg-amber-100"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                statusFilter === tab.id ? "bg-black/20 text-current font-bold" : "bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Search by Order ID, customer, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 sm:py-3 pl-10 text-xs tracking-wide focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 shadow-sm"
                    />
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full no-print">
                <div className="overflow-x-auto scrollbar-none w-full">
                    <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        <thead className="bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800">
                            <tr>
                                <th className="py-4 px-6">Order ID & Date</th>
                                <th className="py-4 px-6">Customer & Phone</th>
                                <th className="py-4 px-6">Total Amount</th>
                                <th className="py-4 px-6">Payment Mode</th>
                                <th className="py-4 px-6">Fulfillment</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    const isCOD = order.paymentMethod === "Cash on Delivery";
                                    return (
                                        <tr key={order._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                            <td className='py-4 px-6'>
                                                <p className='font-mono text-xs font-medium text-stone-900 dark:text-stone-100'>
                                                    #{order._id.substring(order._id.length - 8)}
                                                </p>
                                                <p className='text-[10px] text-stone-400 font-light mt-0.5'>
                                                    {new Date(order.createdAt).toLocaleDateString()} &bull; {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>

                                            <td className="py-4 px-6">
                                                <p className="text-stone-800 dark:text-stone-200 font-medium text-sm">
                                                    {order.shippingAddress?.firstName ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : (order.user?.name || "Customer")}
                                                </p>
                                                <p className="text-[10px] text-stone-400 font-light mt-0.5">
                                                    {order.shippingAddress?.city || "India"} {order.shippingAddress?.phone ? `&bull; 📞 ${order.shippingAddress.phone}` : ""}
                                                </p>
                                            </td>

                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                                    ₹{(order.totalPrice || 0).toFixed(2)}
                                                </p>
                                                {isCOD && (
                                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium tracking-wide mt-0.5">
                                                        Includes ₹{(order.codFee || 60).toFixed(2)} COD fee
                                                    </p>
                                                )}
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex flex-col space-y-1 items-start">
                                                    {isCOD ? (
                                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                                            <FiTruck className="text-[10px]" /> Cash on Delivery
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                                                            {order.paymentMethod || "Prepaid"}
                                                        </span>
                                                    )}

                                                    <span className={`text-[10px] font-medium ${order.isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                                        {order.isPaid ? "● Paid Successfully" : isCOD ? "● Collect at Doorstep" : "● Payment Pending"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <select 
                                                    value={order.status || "Processing"} 
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className='bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900 font-medium cursor-pointer'
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
                                                    className='inline-flex items-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer shadow-sm'
                                                    title="Inspect Order"
                                                >
                                                    <FiEye className="mr-1.5" /> Details
                                                </button>

                                                <button 
                                                    onClick={() => handlePrintConsignment(order)}
                                                    className='inline-flex items-center bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer shadow-sm'
                                                    title="Print Shipping Label"
                                                >
                                                    <FiPrinter className="mr-1.5" /> Label
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className='py-20 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                        No orders matching current filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-[95%] sm:w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 lg:p-10 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                        <div className="flex justify-between items-start mb-5 sm:mb-6 border-b border-stone-100 dark:border-stone-800 pb-4 sm:pb-5">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Order Inspection</span>
                                <h3 className="text-lg sm:text-2xl font-serif font-light mt-1 tracking-wide break-words">Order #{selectedOrder._id}</h3>
                                <p className="text-xs text-stone-400 mt-1 font-light">
                                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-stone-400 hover:text-stone-900 dark:hover:text-white text-2xl p-1 leading-none cursor-pointer"
                            >
                                <FiX />
                            </button>
                        </div>

                        {selectedOrder.paymentMethod === "Cash on Delivery" && (
                            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 mb-6 text-xs text-amber-900 dark:text-amber-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 font-medium">
                                        <FiTruck className="text-amber-600 text-base" />
                                        <span>Cash on Delivery (COD) Order</span>
                                    </div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded">
                                        + ₹{(selectedOrder.codFee || 60).toFixed(2)} Fee Applied
                                    </span>
                                </div>
                                <p className="mt-1 text-stone-600 dark:text-stone-300 font-light">
                                    Courier must collect ₹{selectedOrder.totalPrice.toFixed(2)} from recipient before handover.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
                            <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                                <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Customer & Delivery Address</h4>
                                <p className="text-stone-800 dark:text-stone-200 font-medium">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                                <p className="text-stone-500 text-xs mt-1 font-light">{selectedOrder.shippingAddress?.address}</p>
                                <p className="text-stone-500 text-xs font-light">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                                <p className="text-stone-500 text-xs mt-1 font-medium">Phone: {selectedOrder.shippingAddress?.phone}</p>
                            </div>
                            <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                                <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Payment & Fulfillment</h4>
                                <p className="text-stone-600 dark:text-stone-300 text-xs font-light"><span className="text-stone-400 uppercase tracking-wider">Method:</span> {selectedOrder.paymentMethod}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-stone-400 text-xs uppercase tracking-wider">Payment:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePaymentStatus(selectedOrder._id, selectedOrder.isPaid)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider cursor-pointer transition ${
                                            selectedOrder.isPaid 
                                                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                                : "bg-amber-500 text-stone-950 hover:bg-amber-600"
                                        }`}
                                    >
                                        {selectedOrder.isPaid ? "Paid (Click to Toggle)" : "Mark as Paid"}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-stone-400 text-xs uppercase tracking-wider">Status:</span>
                                    <select
                                        value={selectedOrder.status || "Processing"}
                                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                                        className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs rounded-lg px-2.5 py-1 text-stone-800 dark:text-stone-200"
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Ordered Products ({selectedOrder.orderItems?.length})</h4>
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                            {selectedOrder.orderItems?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                                    <div className="flex items-center space-x-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm" />
                                        <div>
                                            <p className="text-xs sm:text-sm font-serif font-medium text-stone-900 dark:text-stone-100 line-clamp-1">{item.name}</p>
                                            <p className="text-[11px] text-stone-500 font-light mt-0.5">Size: {item.size} &bull; Color: {item.color} &bull; Qty: {item.quantity} {item.sku ? `• SKU: ${item.sku}` : ""}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap ml-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Breakdown Totals */}
                        <div className="border-t border-stone-100 dark:border-stone-800 pt-5 space-y-2 text-xs font-light text-stone-500 dark:text-stone-400">
                            <div className="flex justify-between">
                                <span>Items Subtotal</span>
                                <span>₹{(selectedOrder.itemsPrice || (selectedOrder.totalPrice - (selectedOrder.codFee || 0))).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>₹{(selectedOrder.shippingPrice || 0).toFixed(2)}</span>
                            </div>
                            {(selectedOrder.codFee > 0 || selectedOrder.paymentMethod === "Cash on Delivery") && (
                                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                                    <span>Cash on Delivery Handling Fee</span>
                                    <span>+ ₹{(selectedOrder.codFee || 60).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-stone-900 dark:text-stone-100 font-serif font-medium text-base border-t border-stone-200 dark:border-stone-800 pt-3">
                                <span>Grand Total</span>
                                <span className="text-xl">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                            <button 
                                onClick={() => handlePrintConsignment(selectedOrder)}
                                className="inline-flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 px-6 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
                            >
                                <FiPrinter className="mr-2" /> Print Shipping Label
                            </button>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-8 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer shadow-sm"
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
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Z A A I S H</h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1 text-stone-500">Luxury Atelier &bull; Consignment Center</p>
                        </div>
                        <div className="bg-black text-white px-4 py-2 text-center rounded">
                            <span className="text-xl font-black block leading-none">PRIORITY</span>
                            <span className="text-[8px] uppercase tracking-widest font-bold">AIR EXPRESS</span>
                        </div>
                    </div>

                    {/* COD Banner for Courier */}
                    {printConsignmentOrder.paymentMethod === "Cash on Delivery" && (
                        <div className="p-3 bg-black text-white border-2 border-black mb-4 text-center">
                            <span className="text-sm font-black uppercase tracking-widest block">
                                ⚠️ CASH ON DELIVERY &bull; COLLECT CASH BEFORE DELIVERY
                            </span>
                            <span className="text-2xl font-black block mt-0.5">
                                AMOUNT TO COLLECT: ₹{printConsignmentOrder.totalPrice.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Routing Details Block */}
                    <div className="grid grid-cols-3 gap-2 border-b-2 border-black pb-4 mb-4">
                        <div className="border-r border-stone-300 pr-2">
                            <span className="text-[9px] font-bold uppercase text-stone-500 block">CARRIER</span>
                            <span className="text-xs font-black uppercase">BLUE DART / DELHIVERY</span>
                        </div>
                        <div className="border-r border-stone-300 px-2 text-center">
                            <span className="text-[9px] font-bold uppercase text-stone-500 block">ROUTE ZONE</span>
                            <span className="text-sm font-black uppercase">IND-DEL-09</span>
                        </div>
                        <div className="pl-2 text-right">
                            <span className="text-[9px] font-bold uppercase text-stone-500 block">HUB CODE</span>
                            <span className="text-xs font-black uppercase">DEL-T3</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 border-b-4 border-black pb-6 mb-6">
                        {/* Sender */}
                        <div className="border-r-2 border-black pr-4">
                            <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">FROM (SHIPPER)</span>
                            <p className="font-extrabold text-xs uppercase">ZAAISH LUXURY LOGISTICS</p>
                            <p className="text-[10px] text-stone-600">Dispatch Annex &bull; Suite 400</p>
                            <p className="text-[10px] text-stone-600">100 Fashion Way, Mumbai, MH</p>
                            <p className="text-[10px] text-stone-600 mt-1 font-semibold">support@zaaish.com</p>
                        </div>

                        {/* Recipient */}
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">TO (CONSIGNEE)</span>
                            <p className="font-black text-sm uppercase">
                                {printConsignmentOrder.shippingAddress?.firstName} {printConsignmentOrder.shippingAddress?.lastName}
                            </p>
                            <p className="text-xs font-bold mt-1 text-stone-850">{printConsignmentOrder.shippingAddress?.address}</p>
                            <p className="text-xs font-bold text-stone-850">
                                {printConsignmentOrder.shippingAddress?.city}, {printConsignmentOrder.shippingAddress?.state} {printConsignmentOrder.shippingAddress?.postalCode}
                            </p>
                            <p className="text-xs font-black uppercase mt-1">{printConsignmentOrder.shippingAddress?.country}</p>
                            <p className="text-xs font-bold mt-2 bg-stone-100 px-2 py-0.5 rounded inline-block">TEL: {printConsignmentOrder.shippingAddress?.phone}</p>
                        </div>
                    </div>

                    {/* Barcode Block */}
                    <div className="border-b-4 border-black pb-6 mb-6 text-center">
                        <div className="font-mono text-4xl tracking-[0.25em] font-light leading-none mb-1 text-stone-900 select-none">
                            ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
                        </div>
                        <div className="text-xs font-mono font-black uppercase tracking-widest">* TRK-{printConsignmentOrder._id.toUpperCase()} *</div>
                    </div>

                    {/* Package Specs */}
                    <div className="grid grid-cols-4 gap-4 border-b-2 border-black pb-4 mb-4 text-center">
                        <div className="border-r border-stone-300 pr-2">
                            <span className="text-[8px] font-bold uppercase text-stone-400 block">WEIGHT</span>
                            <span className="text-xs font-black">1.20 KG</span>
                        </div>
                        <div className="border-r border-stone-300 pr-2">
                            <span className="text-[8px] font-bold uppercase text-stone-400 block">ITEMS</span>
                            <span className="text-xs font-black">{printConsignmentOrder.orderItems?.length || 1} UNIT</span>
                        </div>
                        <div className="border-r border-stone-300 pr-2">
                            <span className="text-[8px] font-bold uppercase text-stone-400 block">DECLARED VALUE</span>
                            <span className="text-xs font-black">₹{printConsignmentOrder.totalPrice?.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-[8px] font-bold uppercase text-stone-400 block">PAYMENT MODE</span>
                            <span className="text-xs font-black uppercase bg-stone-100 px-1 py-0.5 rounded">{printConsignmentOrder.paymentMethod}</span>
                        </div>
                    </div>

                    {/* Order Contents */}
                    <div className="mb-6">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-450 block mb-2">CONSIGNMENT CONTENT CHECKLIST</span>
                        <table className="w-full text-[10px] text-left border-collapse border border-stone-300">
                            <thead>
                                <tr className="border-b-2 border-black bg-stone-100 text-stone-600 uppercase font-black">
                                    <th className="p-2">DESCRIPTION</th>
                                    <th className="p-2">SKU</th>
                                    <th className="p-2">VARIANT</th>
                                    <th className="p-2 text-right">QTY</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-250">
                                {printConsignmentOrder.orderItems?.map((item, idx) => (
                                    <tr key={idx} className="font-medium">
                                        <td className="p-2 font-bold uppercase text-stone-900">{item.name}</td>
                                        <td className="p-2 font-mono text-stone-500">{item.sku || "N/A"}</td>
                                        <td className="p-2 text-stone-600 uppercase">{item.size} &bull; {item.color}</td>
                                        <td className="p-2 text-right font-black text-stone-900">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center border-t border-stone-300 pt-4 text-[9px] font-bold uppercase text-stone-400 tracking-wider">
                        <span>ZAAISH LUXURY ATELIER</span>
                        <span>SCAN BARCODE TO DISPATCH</span>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderManagement;