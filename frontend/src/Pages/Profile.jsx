import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FiArrowLeft, FiMapPin, FiPackage, FiHeart, FiLogOut, FiUser } from 'react-icons/fi';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfileAndOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // Fetch fresh profile details
        const profileRes = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setUserInfo(profileData.user);
          localStorage.setItem("userInfo", JSON.stringify(profileData.user));
        }

        // Fetch user orders
        const ordersRes = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        if (ordersRes.ok) {
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className='min-h-screen bg-stone-50/50 dark:bg-stone-950 py-12 px-6 lg:px-8 text-stone-900 dark:text-stone-100 transition-colors'>
      <div className='max-w-7xl mx-auto'>
        
        {/* Navigation Header */}
        <div className='mb-8 flex justify-between items-center'>
          <Link 
            to="/" 
            className='inline-flex items-center text-xs uppercase tracking-[0.2em] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer'
          >
            <FiArrowLeft className='mr-2 text-sm' /> Back to Store
          </Link>

          <Link
            to="/wishlist"
            className="inline-flex items-center text-xs uppercase tracking-[0.2em] font-medium text-rose-600 dark:text-rose-400 hover:underline"
          >
            <FiHeart className="mr-2" /> My Wishlist ({userInfo?.wishlist?.length || 0})
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 items-start'>
          
          {/* User Side Panel */}
          <div className='lg:col-span-1 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 shadow-sm space-y-6'>
            <div className='flex flex-col items-center text-center'>
              <div className='w-20 h-20 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 rounded-full flex items-center justify-center text-2xl font-serif font-light mb-4 shadow-md'>
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
              </div>
              
              <h1 className='text-xl font-serif font-light tracking-wide text-stone-950 dark:text-stone-100'>
                {userInfo ? userInfo.name : "Member"}
              </h1>
              
              <p className='text-xs text-stone-400 dark:text-stone-500 break-all mt-1 font-light'>
                {userInfo ? userInfo.email : ""}
              </p>

              <span className="mt-3 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full text-[10px] uppercase tracking-widest font-medium">
                {userInfo?.role === "admin" ? "Administrator" : "Valued Customer"}
              </span>
            </div>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-6 space-y-3">
              <Link 
                to="/my-orders"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium uppercase tracking-wider text-stone-700 dark:text-stone-300 transition"
              >
                <span className="flex items-center"><FiPackage className="mr-2.5 text-stone-400" /> Orders ({orders.length})</span>
                <span>&rarr;</span>
              </Link>

              <Link 
                to="/wishlist"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium uppercase tracking-wider text-stone-700 dark:text-stone-300 transition"
              >
                <span className="flex items-center"><FiHeart className="mr-2.5 text-rose-500" /> Saved Wishlist</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
              <button 
                onClick={handleLogout}
                className='w-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 py-3.5 px-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-950 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-950 hover:border-stone-950 transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center'
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          </div>

          {/* Main Account Details & History Panel */}
          <div className='lg:col-span-3 space-y-8'>
            
            {/* Shipping Addresses Summary */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100 flex items-center">
                  <FiMapPin className="mr-2.5 text-stone-400 text-lg" /> Saved Shipping Destination
                </h2>
              </div>

              {userInfo?.shippingAddresses && userInfo.shippingAddresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userInfo.shippingAddresses.map((addr, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-xs font-light space-y-1">
                      <p className="font-medium text-stone-900 dark:text-stone-100">{addr.firstName} {addr.lastName}</p>
                      <p className="text-stone-600 dark:text-stone-400">{addr.address}</p>
                      <p className="text-stone-600 dark:text-stone-400">{addr.city}, {addr.country} - {addr.postalCode}</p>
                      <p className="text-stone-500 font-mono mt-1">Tel: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-center">
                  <p className="text-stone-400 text-xs uppercase tracking-wider font-light">
                    No default shipping address saved. Your address will be saved automatically upon your first checkout!
                  </p>
                </div>
              )}
            </div>

            {/* Recent Purchases Table */}
            <div className='bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 shadow-sm'>
              <div className='flex justify-between items-center mb-8'>
                <h2 className='text-xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100'>Order History</h2>
                {orders.length > 0 && (
                  <Link to="/my-orders" className='text-xs uppercase tracking-[0.2em] font-medium text-stone-900 dark:text-stone-100 hover:underline'>
                    View All ({orders.length}) &rarr;
                  </Link>
                )}
              </div>

              {loading ? (
                <p className="text-stone-400 text-xs py-12 text-center uppercase tracking-[0.2em] font-light">Loading order history...</p>
              ) : orders.length === 0 ? (
                <p className="text-stone-400 text-xs py-12 text-center uppercase tracking-[0.2em] font-light">You haven't placed any orders yet.</p>
              ) : (
                <div className='w-full overflow-x-auto'>
                  <table className='min-w-full text-left text-stone-600 dark:text-stone-400 text-xs sm:text-sm whitespace-nowrap'>
                    <thead className='bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800'>
                      <tr>
                        <th className='py-4 px-4'>Item</th>
                        <th className='py-4 px-4'>Order ID</th>
                        <th className='py-4 px-4'>Date</th>
                        <th className='py-4 px-4 text-right'>Total</th>
                        <th className='py-4 px-4 text-center'>Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-stone-100 dark:divide-stone-800/80'>
                      {orders.slice(0, 5).map((order) => (
                        <tr 
                          key={order._id} 
                          onClick={() => navigate(`/order/${order._id}`, { state: { from: "/profile" } })}
                          className='hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition cursor-pointer'
                        >
                          <td className='py-4 px-4'>
                            {order.orderItems?.[0] && (
                              <img 
                                src={order.orderItems[0].image} 
                                alt="Item" 
                                className='w-10 h-12 object-cover rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm' 
                              />
                            )}
                          </td>
                          <td className='py-4 px-4 font-mono text-xs font-medium text-stone-900 dark:text-stone-100'>#{order._id.substring(order._id.length - 8)}</td>
                          <td className='py-4 px-4 text-stone-500 dark:text-stone-400 font-light'>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className='py-4 px-4 text-right font-medium text-stone-900 dark:text-stone-100'>${(order.totalPrice || 0).toFixed(2)}</td>
                          <td className='py-4 px-4 text-center'>
                            <span className='px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'>
                              {order.status || "Processing"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;