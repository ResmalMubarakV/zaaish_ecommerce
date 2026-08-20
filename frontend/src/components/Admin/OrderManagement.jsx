import React, { useEffect, useState } from 'react'

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 

    const fetchOrders = async () => {
        try {
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
                alert("Order status updated successfully!");
                fetchOrders();
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(data.order);
                }
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Server error updating status");
        }
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading orders...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className='text-2xl sm:text-3xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100'>Order Management</h2>
                <p className='text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mt-1'>Monitor and manage customer fulfillment statuses.</p>
            </div>
            <div className='text-xs uppercase tracking-[0.15em] bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap border border-stone-200/80 dark:border-stone-800'>
                Total Orders: {orders.length}
            </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full">
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
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                    <td className='py-4 px-6 font-mono text-xs font-medium text-stone-900 dark:text-stone-100'>
                                        #{order._id.substring(order._id.length - 6)}
                                    </td>
                                    <td className="py-4 px-6 text-stone-800 dark:text-stone-200 font-medium text-sm">{order.user ? order.user.name : "Guest User"}</td>
                                    <td className="py-4 px-6 font-semibold text-stone-900 dark:text-stone-100 text-sm">${order.totalPrice.toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${order.isPaid ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"}`}>
                                            {order.isPaid ? "Paid" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className='bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 font-medium cursor-pointer transition-colors'
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
                                            className='bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer'
                                        >
                                            View
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(order._id, "Delivered")}
                                            className='bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-emerald-700 transition hidden sm:inline-block cursor-pointer'
                                        >
                                            Deliver
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                    No Orders Found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-[95%] sm:w-full max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                    <div className="flex justify-between items-start mb-6 border-b border-stone-100 dark:border-stone-800 pb-5">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Order Details</span>
                            <h3 className="text-xl sm:text-2xl font-serif font-light mt-1 tracking-wide">Order #{selectedOrder._id}</h3>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-light">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="text-stone-400 hover:text-stone-900 dark:hover:text-white text-2xl font-light p-1 leading-none cursor-pointer"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
                        <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                            <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Customer & Shipping</h4>
                            <p className="text-stone-800 dark:text-stone-200 font-medium">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                            <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 font-light">{selectedOrder.shippingAddress?.address}</p>
                            <p className="text-stone-500 dark:text-stone-400 text-xs font-light">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                            <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 font-light">Phone: {selectedOrder.shippingAddress?.phone}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                            <h4 className="font-medium text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">Payment & Fulfillment</h4>
                            <p className="text-stone-600 dark:text-stone-300 text-xs font-light"><span className="text-stone-400 uppercase tracking-wider">Method:</span> {selectedOrder.paymentMethod}</p>
                            <p className="text-stone-600 dark:text-stone-300 text-xs font-light mt-1"><span className="text-stone-400 uppercase tracking-wider">Payment:</span> <span className={selectedOrder.isPaid ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{selectedOrder.isPaid ? "Paid" : "Pending"}</span></p>
                            <p className="text-stone-600 dark:text-stone-300 text-xs font-light mt-1"><span className="text-stone-400 uppercase tracking-wider">Fulfillment:</span> <span className="font-medium text-stone-900 dark:text-stone-100">{selectedOrder.status}</span></p>
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
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light mt-0.5">Size: {item.size} &bull; Color: {item.color} &bull; Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap ml-2">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-stone-100 dark:border-stone-800 pt-5 flex justify-between items-center">
                        <span className="font-serif font-light text-base tracking-wide text-stone-900 dark:text-stone-100">Total Amount</span>
                        <span className="text-lg sm:text-xl font-serif font-medium text-stone-900 dark:text-stone-100">${selectedOrder.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="w-full sm:w-auto bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer shadow-sm"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default OrderManagement;