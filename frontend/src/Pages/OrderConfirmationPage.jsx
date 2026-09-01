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
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading order receipt...</div>;
    }

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 py-16 px-6 transition-colors">
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

      <div className='max-w-xl mx-auto p-8 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 receipt-box text-stone-900 dark:text-stone-100'>
          
          <div className='flex justify-between items-center mb-8 no-print'>
              <Link to="/my-orders" className='text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white font-medium text-xs uppercase tracking-[0.2em]'>
                  &larr; Back to My Orders
              </Link>
              <button 
                  onClick={handlePrintInvoice}
                  className='bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-3 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer'
              >
                  Print / Save Receipt
              </button>
          </div>

          <div className='font-sans'>
              <div className='text-center border-b border-stone-200 dark:border-stone-800 pb-6 mb-6'>
                  <h2 className='text-2xl font-serif font-light tracking-[0.25em] uppercase'>ZAAISH</h2>
                  <p className='text-[10px] uppercase tracking-[0.2em] text-stone-400 mt-1 font-light'>Luxury Fashion Store</p>
                  <p className='text-xs font-medium text-stone-600 dark:text-stone-400 mt-2 uppercase tracking-widest'>Official Purchase Receipt</p>
              </div>

              {order ? (
                  <div>
                      <div className='flex justify-between text-xs text-stone-600 dark:text-stone-400 mb-6 bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 font-light'>
                          <div>
                              <p><span className='font-medium text-stone-700 dark:text-stone-300 uppercase text-[10px] tracking-wider'>Order ID:</span> #{order._id}</p>
                              <p className='mt-1.5'><span className='font-medium text-stone-700 dark:text-stone-300 uppercase text-[10px] tracking-wider'>Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <p><span className='font-medium text-stone-700 dark:text-stone-300 uppercase text-[10px] tracking-wider'>Payment:</span> {order.paymentMethod}</p>
                              <p className={`mt-1.5 font-medium ${order.isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                  {order.paymentMethod === "Cash on Delivery" && !order.isPaid ? "To Pay on Delivery" : order.isPaid ? "Paid Successfully" : "Payment Pending"}
                              </p>
                          </div>
                      </div>

                      {order.paymentMethod === "Cash on Delivery" && !order.isPaid && (
                          <div className="mb-6 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 font-light">
                              <p className="font-medium uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-400 mb-1">Cash on Delivery Notice</p>
                              Please keep ₹{order.totalPrice.toFixed(2)} ready in cash or UPI to hand over to the delivery agent when your parcel arrives.
                          </div>
                      )}

                      <div className='mb-6 text-xs bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 font-light'>
                          <p className='font-medium uppercase tracking-[0.2em] text-stone-400 mb-1.5 text-[10px]'>Delivery Address:</p>
                          <p className='text-stone-900 dark:text-stone-100 font-medium'>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                          <p className='text-stone-600 dark:text-stone-400 mt-0.5'>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.postalCode && `- ${order.shippingAddress.postalCode}`}</p>
                          {order.shippingAddress.phone && <p className='text-stone-500 mt-1'>Tel: {order.shippingAddress.phone}</p>}
                      </div>

                      <div className='mb-6'>
                          <table className='w-full text-left text-xs'>
                              <thead>
                                  <tr className='border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase tracking-[0.2em] text-[10px] font-medium'>
                                      <th className='py-3 pb-2'>Item</th>
                                      <th className='py-3 pb-2 text-center'>Qty</th>
                                      <th className='py-3 pb-2 text-right'>Price</th>
                                      <th className='py-3 pb-2 text-right'>Amount</th>
                                  </tr>
                              </thead>
                              <tbody className='divide-y divide-stone-100 dark:divide-stone-800/80 font-light'>
                                  {order.orderItems.map((item, index) => (
                                      <tr key={index}>
                                          <td className='py-3 pr-2'>
                                              <p className='font-serif font-medium text-stone-900 dark:text-stone-100'>{item.name}</p>
                                              <p className='text-[10px] text-stone-400 uppercase tracking-wider'>{item.color} &bull; {item.size}</p>
                                          </td>
                                          <td className='py-3 text-center text-stone-600 dark:text-stone-400'>{item.quantity}</td>
                                          <td className='py-3 text-right text-stone-600 dark:text-stone-400'>₹{item.price.toFixed(2)}</td>
                                          <td className='py-3 text-right font-medium text-stone-900 dark:text-stone-100'>₹{(item.price * item.quantity).toFixed(2)}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>

                      <div className='border-t border-stone-200 dark:border-stone-800 pt-4 space-y-2 text-xs font-light'>
                          <div className='flex justify-between text-stone-600 dark:text-stone-400'>
                              <span>Subtotal</span>
                              <span>₹{(order.itemsPrice || (order.totalPrice - (order.codFee || 0))).toFixed(2)}</span>
                          </div>
                          <div className='flex justify-between text-stone-600 dark:text-stone-400'>
                              <span>Shipping</span>
                              <span>₹{(order.shippingPrice || 0).toFixed(2)}</span>
                          </div>
                          {(order.codFee > 0 || order.paymentMethod === "Cash on Delivery") && (
                              <div className='flex justify-between text-amber-600 dark:text-amber-400 font-medium'>
                                  <span>Cash on Delivery Handling Fee</span>
                                  <span>+ ₹{(order.codFee || 60).toFixed(2)}</span>
                              </div>
                          )}
                          <div className='flex justify-between text-stone-900 dark:text-stone-100 font-serif font-medium text-sm border-t border-stone-200 dark:border-stone-800 pt-3'>
                              <span>Total Amount</span>
                              <span>₹{order.totalPrice.toFixed(2)}</span>
                          </div>
                      </div>

                      <div className='text-center mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-light tracking-wide'>
                          <p>Thank you for choosing Zaaish Luxury!</p>
                          <p className='mt-0.5'>For inquiries, contact support@zaaish.com</p>
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