import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const OrderConfirmationPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderConfirmation = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setOrder(data.order);
                } else {
                    console.error("Failed to load order confirmation:", data.message);
                }
            } catch (error) {
                console.error("Error fetching order confirmation:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderConfirmation();
    }, [id]);

    const handlePrintInvoice = () => {
        window.print();
    };

    if (loading) {
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading order receipt...</div>;
    }

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 py-12 px-6 transition-colors">
      <style>{`
        @page { margin: 0; }
        @media print {
          body, html { background-color: #ffffff !important; margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; }
          body * { visibility: hidden; }
          .receipt-box, .receipt-box * { visibility: visible; }
          .receipt-box { position: absolute; left: 50% !important; top: 20mm !important; transform: translateX(-50%) !important; width: 170mm !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className='max-w-xl mx-auto p-6 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200/80 dark:border-stone-800 receipt-box text-stone-900 dark:text-stone-100'>
          
          <div className='flex justify-between items-center mb-6 no-print'>
              <Link to="/my-orders" className='text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium text-xs uppercase tracking-wider'>
                  &larr; Back to My Orders
              </Link>
              <button 
                  onClick={handlePrintInvoice}
                  className='bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer'
              >
                  Print / Save Receipt
              </button>
          </div>

          <div className='font-sans'>
              <div className='text-center border-b border-stone-200 dark:border-stone-800 pb-5 mb-5'>
                  <h2 className='text-2xl font-serif font-medium tracking-[0.2em] uppercase'>ZAAISH</h2>
                  <p className='text-[10px] uppercase tracking-widest text-stone-400 mt-0.5'>Luxury Fashion Store</p>
                  <p className='text-xs font-medium text-stone-600 dark:text-stone-400 mt-2'>Official Purchase Receipt</p>
              </div>

              {order ? (
                  <div>
                      <div className='flex justify-between text-xs text-stone-600 dark:text-stone-400 mb-4 bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800'>
                          <div>
                              <p><span className='font-semibold text-stone-700 dark:text-stone-300'>Order ID:</span> #{order._id}</p>
                              <p className='mt-1'><span className='font-semibold text-stone-700 dark:text-stone-300'>Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <p><span className='font-semibold text-stone-700 dark:text-stone-300'>Payment:</span> {order.paymentMethod}</p>
                              <p className='mt-1 text-emerald-600 dark:text-emerald-400 font-semibold'>{order.isPaid ? "Paid Successfully" : "Pending"}</p>
                          </div>
                      </div>

                      <div className='mb-4 text-xs bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800'>
                          <p className='font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1 text-[10px]'>Delivery Address:</p>
                          <p className='text-stone-900 dark:text-stone-100 font-medium'>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                          <p className='text-stone-600 dark:text-stone-400'>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
                      </div>

                      <div className='mb-5'>
                          <table className='w-full text-left text-xs'>
                              <thead>
                                  <tr className='border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider text-[10px]'>
                                      <th className='py-2 font-semibold'>Item</th>
                                      <th className='py-2 text-center font-semibold'>Qty</th>
                                      <th className='py-2 text-right font-semibold'>Price</th>
                                      <th className='py-2 text-right font-semibold'>Amount</th>
                                  </tr>
                              </thead>
                              <tbody className='divide-y divide-stone-100 dark:divide-stone-800'>
                                  {order.orderItems.map((item, index) => (
                                      <tr key={index}>
                                          <td className='py-2.5 pr-2'>
                                              <p className='font-medium text-stone-900 dark:text-stone-100'>{item.name}</p>
                                              <p className='text-[10px] text-stone-400'>{item.color} / {item.size}</p>
                                          </td>
                                          <td className='py-2.5 text-center text-stone-600 dark:text-stone-400'>{item.quantity}</td>
                                          <td className='py-2.5 text-right text-stone-600 dark:text-stone-400'>${item.price.toFixed(2)}</td>
                                          <td className='py-2.5 text-right font-semibold text-stone-900 dark:text-stone-100'>${(item.price * item.quantity).toFixed(2)}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>

                      <div className='border-t border-stone-200 dark:border-stone-800 pt-3 space-y-1 text-xs'>
                          <div className='flex justify-between text-stone-600 dark:text-stone-400'>
                              <span>Subtotal</span>
                              <span>${order.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className='flex justify-between text-stone-600 dark:text-stone-400'>
                              <span>Shipping</span>
                              <span>$0.00</span>
                          </div>
                          <div className='flex justify-between text-stone-900 dark:text-stone-100 font-bold text-sm border-t border-stone-200 dark:border-stone-800 pt-2.5'>
                              <span>Total Amount</span>
                              <span>${order.totalPrice.toFixed(2)}</span>
                          </div>
                      </div>

                      <div className='text-center mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400'>
                          <p>Thank you for shopping with Zaaish!</p>
                          <p className='mt-0.5'>For support, contact support@zaaish.com</p>
                      </div>
                  </div>
              ) : (
                  <p className="text-center text-stone-400 text-xs">No order details found.</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;