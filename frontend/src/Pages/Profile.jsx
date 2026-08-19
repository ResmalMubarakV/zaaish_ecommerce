import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    } else {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className='min-h-screen bg-stone-50/50 dark:bg-stone-950 py-12 px-6 lg:px-8 text-stone-900 dark:text-stone-100 transition-colors'>
      <div className='max-w-7xl mx-auto'>
        
        {/* Back to Home Navigation Header */}
        <div className='mb-8'>
          <Link 
            to="/" 
            className='inline-flex items-center text-xs uppercase tracking-widest font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer'
          >
            <FiArrowLeft className='mr-2 text-sm' /> Back to Home
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 items-start'>
          
          <div className='lg:col-span-1 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 shadow-sm'>
            <div className='flex items-center space-x-4 mb-6 lg:block lg:space-x-0'>
              <div className='w-14 h-14 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full flex items-center justify-center text-lg font-serif font-medium mb-0 lg:mb-4 shadow-sm'>
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className='text-lg font-serif font-medium text-stone-950 dark:text-stone-100 tracking-wide'>
                  {userInfo ? userInfo.name : "User"}
                </h1>
                <p className='text-xs text-stone-500 dark:text-stone-400 break-all mt-0.5'>
                  {userInfo ? userInfo.email : "user@example.com"}
                </p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className='w-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-stone-900 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 hover:border-stone-900 dark:hover:border-stone-100 transition-all duration-200 cursor-pointer shadow-sm'>
              Logout
            </button>
          </div>

          <div className='lg:col-span-3 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 shadow-sm'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-serif font-medium text-stone-900 dark:text-stone-100'>Recent Orders</h2>
              {orders.length > 0 && (
                <Link to="/my-orders" className='text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100 hover:underline'>
                  View All ({orders.length}) &rarr;
                </Link>
              )}
            </div>

            {loading ? (
              <p className="text-stone-400 text-xs py-8 text-center">Loading recent orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-stone-400 text-xs py-8 text-center">You haven't placed any orders yet.</p>
            ) : (
              <div className='w-full overflow-x-auto'>
                <table className='min-w-full text-left text-stone-600 dark:text-stone-300 text-xs sm:text-sm whitespace-nowrap'>
                  <thead className='bg-stone-50 dark:bg-stone-800 text-[10px] sm:text-xs uppercase text-stone-500 dark:text-stone-400 tracking-wider'>
                    <tr>
                      <th className='py-3 px-4 rounded-l-lg'>Image</th>
                      <th className='py-3 px-4'>Order ID</th>
                      <th className='py-3 px-4'>Date</th>
                      <th className='py-3 px-4 text-right'>Price</th>
                      <th className='py-3 px-4 text-center'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-stone-100 dark:divide-stone-800'>
                    {orders.slice(0, 4).map((order) => (
                      <tr 
                        key={order._id} 
                        onClick={() => navigate(`/order/${order._id}`, { state: { from: "/profile" } })}
                        className='hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition cursor-pointer'
                      >
                        <td className='py-3 px-4'>
                          {order.orderItems?.[0] && (
                            <img 
                              src={order.orderItems[0].image} 
                              alt="Item" 
                              className='w-10 h-10 object-cover rounded-lg border border-stone-200 dark:border-stone-700' 
                            />
                          )}
                        </td>
                        <td className='py-3 px-4 font-medium text-stone-900 dark:text-stone-100'>#{order._id.substring(order._id.length - 6)}</td>
                        <td className='py-3 px-4 text-stone-500 dark:text-stone-400'>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className='py-3 px-4 text-right font-medium text-stone-900 dark:text-stone-100'>${order.totalPrice.toFixed(2)}</td>
                        <td className='py-3 px-4 text-center'>
                          <span className='px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'>
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
  );
};

export default Profile;