import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiCheck, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi'

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

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
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading order details...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors'>
            
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
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 no-print'>
                <button 
                    onClick={handleBack} 
                    className='inline-flex items-center text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer'
                >
                    <FiArrowLeft className='mr-2 text-sm' /> 
                    {location.state?.from === "/profile" ? "Back to Profile" : "Back to My Orders"}
                </button>

                <button 
                    onClick={handleDownloadReceipt}
                    className='w-full sm:w-auto inline-flex items-center justify-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-3 rounded-xl text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer'
                >
                    <FiDownload className='mr-2 text-sm' /> Download Invoice
                </button>
            </div>

            <h2 className='text-xl sm:text-3xl font-serif font-light mb-6 sm:mb-8 tracking-wide no-print'>Order Details</h2>
            
            {!orderDetails ? (<p className="text-center text-stone-400 text-xs">No Order details found</p>) : (
                <div className='p-5 sm:p-8 lg:p-12 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm printable-receipt'>
                    
                    {/* Dedicated Store Header for Print view */}
                    <div className='hidden print:block text-center border-b border-stone-200 pb-6 mb-8'>
                        <h2 className='text-3xl font-serif font-light tracking-[0.25em] uppercase text-stone-900'>ZAAISH</h2>
                        <p className='text-[10px] uppercase tracking-[0.2em] text-stone-500 mt-1'>Official Purchase Invoice</p>
                    </div>

                    <div className='flex flex-col sm:flex-row justify-between mb-8 pb-6 border-b border-stone-100 dark:border-stone-800 print:border-stone-200'>
                        <div>
                            <h3 className='text-base sm:text-xl font-serif font-light text-stone-900 dark:text-stone-100 print:text-stone-900 tracking-wide break-words'>
                                Order ID: #{orderDetails._id}
                            </h3>
                            <p className='text-stone-400 dark:text-stone-500 print:text-stone-500 text-xs mt-1 font-light'>
                                {new Date(orderDetails.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-wrap sm:flex-col items-start sm:items-end mt-4 sm:mt-0 gap-2 no-print">
                            <span className={`${orderDetails.isPaid ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"} px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider`}>
                                {orderDetails.isPaid ? "Paid / Approved" : "Payment Pending"}
                            </span>

                            <span className={`${orderDetails.status === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"} px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider`}>
                                {orderDetails.status || "Processing"}
                            </span>
                        </div>
                    </div>

                    {/* Visual Order Tracking Timeline Stepper */}
                    <div className="mb-8 sm:mb-10 p-4 sm:p-8 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 no-print">
                        <h4 className="font-serif font-light text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-stone-400 mb-6 sm:mb-8 text-center sm:text-left">
                            Fulfillment Pipeline Timeline
                        </h4>

                        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-2 sm:px-8">
                            {/* Connecting Progress Lines */}
                            <div className="absolute top-4 sm:top-5 left-8 sm:left-12 right-8 sm:right-12 h-0.5 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 z-0" />
                            <div 
                                className="absolute top-4 sm:top-5 left-8 sm:left-12 h-0.5 bg-stone-950 dark:bg-stone-100 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                                style={{
                                    width: orderDetails.status === "Delivered" 
                                        ? "calc(100% - 4rem)" 
                                        : orderDetails.status === "Shipped" 
                                        ? "50%" 
                                        : "0%"
                                }}
                            />

                            {/* Step 1: Processing */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                                    orderDetails.status === "Processing" || orderDetails.status === "Shipped" || orderDetails.status === "Delivered"
                                        ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-md ring-4 ring-stone-950/10 dark:ring-stone-100/10"
                                        : "bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                                }`}>
                                    {orderDetails.status === "Shipped" || orderDetails.status === "Delivered" ? (
                                        <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                                    ) : (
                                        <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>
                                <span className="mt-2.5 sm:mt-3 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-900 dark:text-stone-100">
                                    Processing
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-stone-400 font-light mt-0.5 text-center">
                                    {new Date(orderDetails.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Step 2: Shipped */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                                    orderDetails.status === "Shipped" || orderDetails.status === "Delivered"
                                        ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-md ring-4 ring-stone-950/10 dark:ring-stone-100/10"
                                        : "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500"
                                }`}>
                                    {orderDetails.status === "Delivered" ? (
                                        <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                                    ) : (
                                        <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>
                                <span className={`mt-2.5 sm:mt-3 text-[10px] sm:text-xs font-medium uppercase tracking-wider ${
                                    orderDetails.status === "Shipped" || orderDetails.status === "Delivered"
                                        ? "text-stone-900 dark:text-stone-100"
                                        : "text-stone-400 dark:text-stone-500"
                                }`}>
                                    Shipped
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-stone-400 font-light mt-0.5 text-center">
                                    {orderDetails.shippedAt ? new Date(orderDetails.shippedAt).toLocaleDateString() : (orderDetails.status === "Shipped" || orderDetails.status === "Delivered" ? "In Transit" : "Pending")}
                                </span>
                            </div>

                            {/* Step 3: Delivered */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                                    orderDetails.status === "Delivered"
                                        ? "bg-emerald-600 dark:bg-emerald-400 text-white dark:text-stone-950 shadow-md ring-4 ring-emerald-500/20"
                                        : "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500"
                                }`}>
                                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className={`mt-2.5 sm:mt-3 text-[10px] sm:text-xs font-medium uppercase tracking-wider ${
                                    orderDetails.status === "Delivered"
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-stone-400 dark:text-stone-500"
                                }`}>
                                    Delivered
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-stone-400 font-light mt-0.5 text-center">
                                    {orderDetails.deliveredAt ? new Date(orderDetails.deliveredAt).toLocaleDateString() : (orderDetails.status === "Delivered" ? "Completed" : "Expected")}
                                </span>
                            </div>
                        </div>
                    </div>


                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 text-xs font-light'>
                        <div className='bg-stone-50 dark:bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800'>
                            <h4 className='font-medium text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2.5'>Payment Info</h4>
                            <p className='text-stone-600 dark:text-stone-300 print:text-stone-600 mb-1'>Method: {orderDetails.paymentMethod}</p>
                            <p className='text-stone-600 dark:text-stone-300 print:text-stone-600'>Status: {orderDetails.isPaid ? "Paid" : "Unpaid"}</p>
                        </div>
                        <div className='bg-stone-50 dark:bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800'>
                            <h4 className='font-medium text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2.5'>Shipping Info</h4>
                            <p className='text-stone-600 dark:text-stone-300 print:text-stone-600 mb-1 font-medium'>Recipient: {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                            <p className='text-stone-600 dark:text-stone-300 print:text-stone-600'>Address: {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.country}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-none">
                        <h4 className='font-serif font-light text-base mb-4 tracking-wide text-stone-900 dark:text-stone-100 print:text-stone-900'>Products</h4>
                        <table className='min-w-full text-stone-600 dark:text-stone-400 print:text-stone-600 text-xs whitespace-nowrap'>
                            <thead className='bg-stone-50 dark:bg-stone-950/60 print:bg-stone-100 text-[10px] uppercase text-stone-400 dark:text-stone-500 print:text-stone-600 tracking-[0.2em] font-medium'>
                                <tr>
                                    <th className='py-3.5 px-4 text-left'>Name</th>
                                    <th className='py-3.5 px-4 text-left'>Unit Price</th>
                                    <th className='py-3.5 px-4 text-left'>Quantity</th>
                                    <th className='py-3.5 px-4 text-left'>Total</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-stone-100 dark:divide-stone-800/80 print:divide-stone-200 font-light'>
                                {orderDetails.orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className='py-4 px-4 flex items-center'>
                                            <img src={item.image} alt={item.name} className='w-10 h-12 object-cover rounded-xl mr-4 border border-stone-200 dark:border-stone-800 no-print shadow-sm'/>
                                            <span className='text-stone-900 dark:text-stone-100 print:text-stone-900 font-serif font-medium'>{item.name}</span>
                                        </td> 
                                        <td className="py-4 px-4">₹{item.price.toFixed(2)}</td>   
                                        <td className="py-4 px-4">{item.quantity}</td>   
                                        <td className="py-4 px-4 font-medium text-stone-900 dark:text-stone-100 print:text-stone-900">₹{(item.price * item.quantity).toFixed(2)}</td>   
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className='border-t border-stone-200 dark:border-stone-800 print:border-stone-200 mt-8 pt-6 max-w-xs ml-auto space-y-2 text-xs font-light'>
                        <div className='flex justify-between text-stone-600 dark:text-stone-400 print:text-stone-600'>
                            <span>Subtotal</span>
                            <span>₹{(orderDetails.itemsPrice || (orderDetails.totalPrice - (orderDetails.codFee || 0))).toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-stone-600 dark:text-stone-400 print:text-stone-600'>
                            <span>Shipping</span>
                            <span>₹{(orderDetails.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        {(orderDetails.codFee > 0 || orderDetails.paymentMethod === "Cash on Delivery") && (
                            <div className='flex justify-between text-amber-600 dark:text-amber-400 font-medium'>
                                <span>COD Handling Fee</span>
                                <span>+ ₹{(orderDetails.codFee || 60).toFixed(2)}</span>
                            </div>
                        )}
                        <div className='flex justify-between text-stone-900 dark:text-stone-100 print:text-stone-900 font-serif font-medium text-base border-t border-stone-200 dark:border-stone-800 print:border-stone-200 pt-3'>
                            <span>Total</span>
                            <span>₹{orderDetails.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer Message (Print Only) */}
                    <div className='hidden print:block text-center mt-12 pt-6 border-t border-stone-200 text-[10px] text-stone-500 font-light'>
                        <p>Thank you for shopping with Zaaish!</p>
                        <p className='mt-0.5'>For support, contact support@zaaish.com</p>
                    </div>

                </div>
            )} 
        </div>
    );
};

export default OrderDetailsPage;