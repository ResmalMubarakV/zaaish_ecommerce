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
        return <div className="text-center py-20 text-stone-400 font-light">Loading orders...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className='text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight'>Order Management</h2>
                <p className='text-sm text-stone-500 mt-1'>Monitor and manage customer fulfillment statuses.</p>
            </div>
            <div className='text-sm bg-stone-100 text-stone-700 px-4 py-2 rounded-lg font-medium whitespace-nowrap'>
                Total Orders: {orders.length}
            </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left text-stone-600 whitespace-nowrap">
                    <thead className="bg-stone-50 text-xs uppercase text-stone-500 font-semibold tracking-wider border-b border-stone-200">
                        <tr>
                            <th className="py-4 px-4 sm:px-6">Order ID</th>
                            <th className="py-4 px-4 sm:px-6">Customer</th>
                            <th className="py-4 px-4 sm:px-6">Total Price</th>
                            <th className="py-4 px-4 sm:px-6">Payment</th>
                            <th className="py-4 px-4 sm:px-6">Status</th>
                            <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id} className='hover:bg-stone-50/60 transition-colors'>
                                    <td className='py-4 px-4 sm:px-6 font-mono text-xs font-semibold text-stone-900'>
                                        #{order._id.substring(order._id.length - 6)}
                                    </td>
                                    <td className="py-4 px-4 sm:px-6 text-stone-800 font-medium">{order.user ? order.user.name : "Guest User"}</td>
                                    <td className="py-4 px-4 sm:px-6 font-semibold text-stone-900">${order.totalPrice.toFixed(2)}</td>
                                    <td className="py-4 px-4 sm:px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                            {order.isPaid ? "Paid" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 sm:px-6">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className='bg-white border border-stone-300 text-stone-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900 font-medium cursor-pointer'
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-4 sm:px-6 text-right space-x-2">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className='bg-stone-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-stone-800 transition'
                                        >
                                            View
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(order._id, "Delivered")}
                                            className='bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition hidden sm:inline-block'
                                        >
                                            Deliver
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className='py-12 text-center text-stone-400'>
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
                <div className="bg-white rounded-2xl max-w-2xl w-[95%] sm:w-full max-h-[85vh] overflow-y-auto p-5 sm:p-8 shadow-xl border border-stone-100">
                    <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
                        <div>
                            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Order Details</span>
                            <h3 className="text-lg sm:text-xl font-serif text-stone-900 mt-1">Order #{selectedOrder._id}</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="text-stone-400 hover:text-stone-900 text-2xl font-bold p-1 leading-none"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 text-sm">
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                            <h4 className="font-semibold text-stone-800 mb-2">Customer & Shipping</h4>
                            <p className="text-stone-600 font-medium">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                            <p className="text-stone-500 mt-1">{selectedOrder.shippingAddress?.address}</p>
                            <p className="text-stone-500">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                            <p className="text-stone-500 mt-1">Phone: {selectedOrder.shippingAddress?.phone}</p>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                            <h4 className="font-semibold text-stone-800 mb-2">Payment & Fulfillment</h4>
                            <p className="text-stone-600"><span className="text-stone-400">Method:</span> {selectedOrder.paymentMethod}</p>
                            <p className="text-stone-600 mt-1"><span className="text-stone-400">Payment:</span> <span className={selectedOrder.isPaid ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>{selectedOrder.isPaid ? "Paid" : "Pending"}</span></p>
                            <p className="text-stone-600 mt-1"><span className="text-stone-400">Fulfillment:</span> <span className="font-semibold text-stone-900">{selectedOrder.status}</span></p>
                        </div>
                    </div>

                    <h4 className="font-semibold text-stone-800 mb-3">Ordered Items ({selectedOrder.orderItems?.length})</h4>
                    <div className="space-y-3 mb-6">
                        {selectedOrder.orderItems?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-stone-50/50 rounded-xl border border-stone-100">
                                <div className="flex items-center space-x-3">
                                    <img src={item.image} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg border border-stone-200" />
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-stone-900 line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] sm:text-xs text-stone-500">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-stone-900 whitespace-nowrap ml-2">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                        <span className="font-semibold text-stone-800">Total Amount</span>
                        <span className="text-lg sm:text-xl font-bold text-stone-900">${selectedOrder.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="w-full sm:w-auto bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition"
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