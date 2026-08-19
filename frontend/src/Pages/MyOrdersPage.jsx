import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data.orders || []);
          setFilteredOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);

    let sorted = [...orders];
    if (value === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (value === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (value === "priceAsc") {
      sorted.sort((a, b) => a.totalPrice - b.totalPrice);
    } else if (value === "priceDesc") {
      sorted.sort((a, b) => b.totalPrice - a.totalPrice);
    }
    setFilteredOrders(sorted);
  };

  if (loading) {
    return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading your orders...</div>;
  }

  return (
    <div className='min-h-screen bg-stone-50/50 dark:bg-stone-950 py-12 px-6 lg:px-8 text-stone-900 dark:text-stone-100 transition-colors'>
      <div className='max-w-7xl mx-auto'>
        
        {/* Back to Profile & Title Header */}
        <div className='flex items-center justify-between mb-8'>
          <Link 
            to="/profile" 
            className='inline-flex items-center text-xs uppercase tracking-widest font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer'
          >
            <FiArrowLeft className='mr-2 text-sm' /> Back to Profile
          </Link>

          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className='border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-2.5 text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-100 shadow-sm cursor-pointer'
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>

        <div className='mb-6'>
          <h2 className='text-2xl font-serif font-medium tracking-wide'>All Orders</h2>
        </div>

        <div className='bg-white dark:bg-stone-900 border border-stone-200/85 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm'>
          <div className='w-full overflow-x-auto'>
            <table className='min-w-full text-left text-stone-600 dark:text-stone-300 text-xs sm:text-sm whitespace-nowrap'>
              <thead className='bg-stone-50 dark:bg-stone-800 text-[10px] sm:text-xs uppercase text-stone-500 dark:text-stone-400 tracking-wider'>
                <tr>
                  <th className='py-3 px-4 rounded-l-lg'>Image</th>
                  <th className='py-3 px-4'>Order ID</th>
                  <th className='py-3 px-4'>Created</th>
                  <th className='py-3 px-4'>Shipping Address</th>
                  <th className='py-3 px-4 text-center'>Items</th>
                  <th className='py-3 px-4 text-right'>Price</th>
                  <th className='py-3 px-4 text-center'>Payment</th>
                  <th className='py-3 px-4 text-center rounded-r-lg'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-100 dark:divide-stone-800'>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order._id}
                      onClick={() => navigate(`/order/${order._id}`, { state: { from: "/my-orders" } })}
                      className='hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition cursor-pointer'
                    >
                      <td className='py-3 px-4'>
                        {order.orderItems?.[0] && (
                          <img
                            src={order.orderItems[0].image}
                            alt={order.orderItems[0].name}
                            className='w-10 h-10 object-cover rounded-lg border border-stone-200 dark:border-stone-700'
                          />
                        )}
                      </td>
                      <td className='py-3 px-4 font-medium text-stone-900 dark:text-stone-100'>
                        #{order._id.substring(order._id.length - 6)}
                      </td>
                      <td className='py-3 px-4 text-stone-500 dark:text-stone-400'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className='py-3 px-4 text-stone-500 dark:text-stone-400 max-w-[150px] truncate'>
                        {order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.country}` : "N/A"}
                      </td>
                      <td className='py-3 px-4 text-center text-stone-600 dark:text-stone-300'>
                        {order.orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                      </td>
                      <td className='py-3 px-4 text-right font-medium text-stone-900 dark:text-stone-100'>
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${order.isPaid ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.status === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : order.status === "Shipped" ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300" : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                        }`}>
                          {order.status || "Processing"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className='text-center py-12 text-stone-400 text-sm'>
                      You Have No Orders Yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table> 
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyOrdersPage;