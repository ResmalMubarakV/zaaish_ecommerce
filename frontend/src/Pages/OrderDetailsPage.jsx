import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Order Details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setOrderDetails(data.order);
                } else {
                    console.error("Failed to fetch order details:", data.message);
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    // SMART PRINTING: Temporarily remove dark mode right before printing, and restore it right after.
    // This ensures the generated PDF/Printout is always a clean, light-themed universal invoice.
    useEffect(() => {
        const handleBeforePrint = () => {
            document.documentElement.classList.remove('dark');
        };
        const handleAfterPrint = () => {
            if (localStorage.getItem('theme') === 'dark') {
                document.documentElement.classList.add('dark');
            }
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    const handleBack = () => {
        const previousPath = location.state?.from || "/my-orders";
        navigate(previousPath);
    };

    const handleDownloadReceipt = () => {
        window.print();
    };

    if (loading) {
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading order details...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto py-12 px-6 lg:px-8 min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors'>
            
            {/* Strict Print Styling for Universal Light Mode Layout */}
            <style>{`
                @page { margin: 0; }
                @media print {
                    body, html { 
                        background-color: #ffffff !important; 
                        color: #000000 !important;
                        margin: 0 !important; 
                        padding: 0 !important; 
                    }
                    body * { visibility: hidden; }
                    .printable-receipt, .printable-receipt * { 
                        visibility: visible; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    .printable-receipt { 
                        position: absolute; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100% !important; 
                        padding: 20mm !important; 
                        background: #ffffff !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Top Action Bar */}
            <div className='flex justify-between items-center mb-6 no-print'>
                <button 
                    onClick={handleBack} 
                    className='inline-flex items-center text-xs uppercase tracking-widest font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer'
                >
                    <FiArrowLeft className='mr-2 text-sm' /> 
                    {location.state?.from === "/profile" ? "Back to Profile" : "Back to My Orders"}
                </button>

                <button 
                    onClick={handleDownloadReceipt}
                    className='inline-flex items-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer'
                >
                    <FiDownload className='mr-2 text-sm' /> Download Invoice
                </button>
            </div>

            <h2 className='text-2xl md:text-3xl font-serif font-medium mb-8 tracking-wide no-print'>Order Details</h2>
            
            {!orderDetails ? (<p className="text-center text-stone-400 text-xs">No Order details found</p>) : (
                <div className='p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm printable-receipt'>
                    
                    {/* Dedicated Store Header for Print view */}
                    <div className='hidden print:block text-center border-b border-stone-200 pb-5 mb-8'>
                        <h2 className='text-3xl font-serif font-medium tracking-[0.2em] uppercase text-stone-900'>ZAAISH</h2>
                        <p className='text-[10px] uppercase tracking-widest text-stone-500 mt-1'>Official Purchase Invoice</p>
                    </div>

                    <div className='flex flex-col sm:flex-row justify-between mb-8 pb-6 border-b border-stone-100 dark:border-stone-800 print:border-stone-200'>
                        <div>
                            <h3 className='text-lg md:text-xl font-serif font-medium text-stone-900 dark:text-stone-100 print:text-stone-900'>
                                Order ID: #{orderDetails._id}
                            </h3>
                            <p className='text-stone-500 dark:text-stone-400 print:text-stone-500 text-xs mt-1'>
                                {new Date(orderDetails.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0 gap-2 no-print">
                            <span className={`${orderDetails.isPaid ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"} px-3 py-1 rounded-full text-xs font-semibold`}>
                                {orderDetails.isPaid ? "Paid / Approved" : "Payment Pending"}
                            </span>

                            <span className={`${orderDetails.status === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"} px-3 py-1 rounded-full text-xs font-semibold`}>
                                {orderDetails.status || "Processing"}
                            </span>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 text-xs'>
                        <div>
                            <h4 className='font-serif font-medium text-sm mb-2 text-stone-900 dark:text-stone-100 print:text-stone-900'>Payment Info</h4>
                            <p className='text-stone-600 dark:text-stone-400 print:text-stone-600 mb-1'>Method: {orderDetails.paymentMethod}</p>
                            <p className='text-stone-600 dark:text-stone-400 print:text-stone-600'>Status: {orderDetails.isPaid ? "Paid" : "Unpaid"}</p>
                        </div>
                        <div>
                            <h4 className='font-serif font-medium text-sm mb-2 text-stone-900 dark:text-stone-100 print:text-stone-900'>Shipping Info</h4>
                            <p className='text-stone-600 dark:text-stone-400 print:text-stone-600 mb-1'>Recipient: {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                            <p className='text-stone-600 dark:text-stone-400 print:text-stone-600'>Address: {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.country}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <h4 className='font-serif font-medium text-sm mb-4 text-stone-900 dark:text-stone-100 print:text-stone-900'>Products</h4>
                        <table className='min-w-full text-stone-600 dark:text-stone-300 print:text-stone-600 text-xs whitespace-nowrap'>
                            <thead className='bg-stone-50 dark:bg-stone-800 print:bg-stone-100 text-[10px] uppercase text-stone-500 dark:text-stone-400 print:text-stone-600 tracking-wider'>
                                <tr>
                                    <th className='py-3 px-4 text-left rounded-l-lg'>Name</th>
                                    <th className='py-3 px-4 text-left'>Unit Price</th>
                                    <th className='py-3 px-4 text-left'>Quantity</th>
                                    <th className='py-3 px-4 text-left rounded-r-lg'>Total</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-stone-100 dark:divide-stone-800 print:divide-stone-200'>
                                {orderDetails.orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className='py-3 px-4 flex items-center'>
                                            <img src={item.image} alt={item.name} className='w-10 h-10 object-cover rounded-lg mr-4 border border-stone-200 dark:border-stone-700 no-print'/>
                                            <span className='text-stone-900 dark:text-stone-100 print:text-stone-900 font-medium'>{item.name}</span>
                                        </td> 
                                        <td className="py-3 px-4">${item.price.toFixed(2)}</td>   
                                        <td className="py-3 px-4">{item.quantity}</td>   
                                        <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100 print:text-stone-900">${(item.price * item.quantity).toFixed(2)}</td>   
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className='border-t border-stone-200 dark:border-stone-800 print:border-stone-200 mt-6 pt-4 max-w-xs ml-auto space-y-2 text-xs'>
                        <div className='flex justify-between text-stone-600 dark:text-stone-400 print:text-stone-600'>
                            <span>Subtotal</span>
                            <span>${orderDetails.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-stone-600 dark:text-stone-400 print:text-stone-600'>
                            <span>Shipping</span>
                            <span>$0.00</span>
                        </div>
                        <div className='flex justify-between text-stone-900 dark:text-stone-100 print:text-stone-900 font-serif font-medium text-base border-t border-stone-200 dark:border-stone-800 print:border-stone-200 pt-2'>
                            <span>Total</span>
                            <span>${orderDetails.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer Message (Print Only) */}
                    <div className='hidden print:block text-center mt-12 pt-4 border-t border-stone-200 text-[10px] text-stone-500'>
                        <p>Thank you for shopping with Zaaish!</p>
                        <p className='mt-0.5'>For support, contact support@zaaish.com</p>
                    </div>

                </div>
            )} 
        </div>
    );
};

export default OrderDetailsPage;