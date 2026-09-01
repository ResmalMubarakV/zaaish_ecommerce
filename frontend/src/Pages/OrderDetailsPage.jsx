import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { FiArrowLeft, FiDownload, FiCheck, FiPackage, FiTruck, FiCheckCircle, FiRotateCcw, FiAlertCircle, FiClock, FiX, FiShield } from 'react-icons/fi'

const RETURN_REASONS = [
    "Size / Fit Issue (Too small / Too large)",
    "Damaged or Defective Item",
    "Item Not as Pictured / Fabric Quality",
    "Received Incorrect Item / Variant",
    "Changed Mind / No Longer Needed",
    "Other"
];

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Return Request Modal State
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
    const [returnComments, setReturnComments] = useState("");
    const [selectedReturnItems, setSelectedReturnItems] = useState([]);
    const [bankDetails, setBankDetails] = useState({
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        upiId: ""
    });
    const [submittingReturn, setSubmittingReturn] = useState(false);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setOrderDetails(data.order);
                // Pre-populate return items with all order items
                if (data.order?.orderItems) {
                    setSelectedReturnItems(data.order.orderItems.map(item => ({ ...item })));
                }
            } else {
                console.error("Failed to fetch order details:", data.message);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const handleToggleItemSelection = (item) => {
        const exists = selectedReturnItems.some(i => i.product === item.product && i.size === item.size && i.color === item.color);
        if (exists) {
            setSelectedReturnItems(selectedReturnItems.filter(i => !(i.product === item.product && i.size === item.size && i.color === item.color)));
        } else {
            setSelectedReturnItems([...selectedReturnItems, item]);
        }
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        if (selectedReturnItems.length === 0) {
            toast.error("Please select at least one item to return");
            return;
        }

        try {
            setSubmittingReturn(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/orders/${id}/return`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    reason: returnReason,
                    comments: returnComments,
                    items: selectedReturnItems,
                    bankDetails: orderDetails.paymentMethod === "Cash on Delivery" ? bankDetails : undefined
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Return request submitted successfully!");
                setIsReturnModalOpen(false);
                setOrderDetails(data.order);
            } else {
                toast.error(data.message || "Failed to submit return request");
            }
        } catch (err) {
            console.error("Return submit error:", err);
            toast.error("Server error submitting return request");
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleCancelReturn = async () => {
        if (window.confirm("Are you sure you want to cancel your return request?")) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/orders/${id}/return/cancel`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success("Return request cancelled");
                    setOrderDetails(data.order);
                } else {
                    toast.error(data.message || "Failed to cancel return");
                }
            } catch (err) {
                console.error("Cancel return error:", err);
                toast.error("Error cancelling return");
            }
        }
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
                    {/* Active Return Status / Initiation Section (Delivered Orders) */}
                    {orderDetails.returnRequest && orderDetails.returnRequest.status && orderDetails.returnRequest.status !== "None" && orderDetails.returnRequest.status !== "Cancelled" ? (
                        <div className="mb-8 sm:mb-10 p-5 sm:p-8 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 no-print">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200/80 dark:border-stone-800">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <FiRotateCcw className="text-stone-900 dark:text-stone-100 text-sm" />
                                        <h4 className="font-serif font-medium text-sm sm:text-base tracking-wide text-stone-900 dark:text-stone-100">
                                            Product Return & Refund Lifecycle
                                        </h4>
                                    </div>
                                    <p className="text-xs text-stone-400 font-light mt-0.5">
                                        Reason: <span className="text-stone-700 dark:text-stone-300 font-medium">{orderDetails.returnRequest.reason}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                                        orderDetails.returnRequest.status === "Refunded" || orderDetails.returnRequest.status === "Completed"
                                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                            : orderDetails.returnRequest.status === "Rejected"
                                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                            : orderDetails.returnRequest.status === "Pickup Scheduled" || orderDetails.returnRequest.status === "Approved"
                                            ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                    }`}>
                                        {orderDetails.returnRequest.status}
                                    </span>

                                    {orderDetails.returnRequest.status === "Pending" && (
                                        <button
                                            onClick={handleCancelReturn}
                                            className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline uppercase tracking-wider font-medium cursor-pointer"
                                        >
                                            Cancel Request
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 4-Stage Return Stepper */}
                            <div className="relative flex items-center justify-between max-w-2xl mx-auto px-2 sm:px-8 my-6">
                                <div className="absolute top-4 sm:top-5 left-8 sm:left-12 right-8 sm:right-12 h-0.5 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 z-0" />
                                <div 
                                    className="absolute top-4 sm:top-5 left-8 sm:left-12 h-0.5 bg-stone-950 dark:bg-stone-100 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                                    style={{
                                        width: orderDetails.returnRequest.status === "Refunded" || orderDetails.returnRequest.status === "Completed"
                                            ? "calc(100% - 4rem)" 
                                            : orderDetails.returnRequest.status === "Pickup Scheduled" || orderDetails.returnRequest.status === "Approved"
                                            ? "40%" 
                                            : "0%"
                                    }}
                                />

                                {/* Step 1: Return Requested */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-md">
                                        <FiClock className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="mt-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-900 dark:text-stone-100">
                                        Requested
                                    </span>
                                </div>

                                {/* Step 2: Approved / Pickup Scheduled */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold ${
                                        ["Approved", "Pickup Scheduled", "Refunded", "Completed"].includes(orderDetails.returnRequest.status)
                                            ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-md"
                                            : "bg-stone-200 dark:bg-stone-800 text-stone-400"
                                    }`}>
                                        <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="mt-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-900 dark:text-stone-100">
                                        Pickup
                                    </span>
                                </div>

                                {/* Step 3: Refund Processed */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold ${
                                        orderDetails.returnRequest.status === "Refunded" || orderDetails.returnRequest.status === "Completed"
                                            ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20"
                                            : "bg-stone-200 dark:bg-stone-800 text-stone-400"
                                    }`}>
                                        <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="mt-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-900 dark:text-stone-100">
                                        Refunded
                                    </span>
                                </div>
                            </div>

                            {/* Return Info Box */}
                            <div className="mt-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs leading-relaxed space-y-1.5">
                                {orderDetails.returnRequest.pickupDate && (
                                    <p className="text-stone-700 dark:text-stone-300">
                                        <strong className="text-stone-900 dark:text-stone-100 font-medium">Scheduled Courier Pickup:</strong> {new Date(orderDetails.returnRequest.pickupDate).toLocaleDateString()}
                                    </p>
                                )}
                                {orderDetails.returnRequest.adminResponse && (
                                    <p className="text-stone-700 dark:text-stone-300">
                                        <strong className="text-stone-900 dark:text-stone-100 font-medium">Support Remarks:</strong> {orderDetails.returnRequest.adminResponse}
                                    </p>
                                )}
                                <p className="text-stone-500 dark:text-stone-400">
                                    Refund Amount: <span className="text-stone-900 dark:text-stone-100 font-semibold">₹{(orderDetails.returnRequest.refundAmount || orderDetails.totalPrice).toFixed(2)}</span> via {orderDetails.returnRequest.refundMethod || "Original Payment Method"}
                                </p>
                            </div>
                        </div>
                    ) : orderDetails.status === "Delivered" ? (
                        <div className="mb-8 sm:mb-10 p-5 sm:p-6 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
                            <div className="flex items-start space-x-3.5">
                                <div className="p-2.5 rounded-xl bg-stone-200/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shrink-0">
                                    <FiShield className="text-lg" />
                                </div>
                                <div>
                                    <h4 className="font-serif font-medium text-sm text-stone-900 dark:text-stone-100">
                                        Zaaish 7-Day Luxury Guarantee
                                    </h4>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                                        Need a different size or wish to return? Request a hassle-free doorstep pickup within 7 days of delivery.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="inline-flex items-center justify-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <FiRotateCcw className="mr-2" /> Request Return
                            </button>
                        </div>
                    ) : null}
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

            {/* RETURN REQUEST MODAL */}
            {isReturnModalOpen && orderDetails && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-[95%] sm:w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 lg:p-10 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                        <div className="flex justify-between items-start mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Doorstep Return / Exchange</span>
                                <h3 className="text-xl sm:text-2xl font-serif font-light mt-1 tracking-wide">Initiate Return Request</h3>
                                <p className="text-xs text-stone-400 mt-1 font-light">Order #{orderDetails._id}</p>
                            </div>
                            <button
                                onClick={() => setIsReturnModalOpen(false)}
                                className="text-stone-400 hover:text-stone-900 dark:hover:text-white text-2xl p-1 leading-none cursor-pointer"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReturn} className="space-y-6">
                            {/* Step 1: Select Items */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-3">
                                    1. Select Items to Return *
                                </label>
                                <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-none divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 bg-stone-50/50 dark:bg-stone-950/40">
                                    {orderDetails.orderItems.map((item, idx) => {
                                        const isSelected = selectedReturnItems.some(i => i.product === item.product && i.size === item.size && i.color === item.color);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleToggleItemSelection(item)}
                                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-white dark:bg-stone-900 shadow-sm" : "opacity-70 hover:opacity-100"}`}
                                            >
                                                <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="rounded text-stone-950 dark:text-stone-100 accent-stone-950 cursor-pointer"
                                                    />
                                                    <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg border border-stone-200 dark:border-stone-800 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-serif font-medium text-stone-900 dark:text-stone-100 line-clamp-1 break-words">{item.name}</p>
                                                        <p className="text-[10px] text-stone-400 font-light">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-stone-900 dark:text-stone-100 shrink-0 ml-2">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 2: Return Reason */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">
                                    2. Reason for Return *
                                </label>
                                <select
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    required
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                                >
                                    {RETURN_REASONS.map((r, i) => (
                                        <option key={i} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 3: Comments */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">
                                    3. Additional Comments / Details
                                </label>
                                <textarea
                                    value={returnComments}
                                    onChange={(e) => setReturnComments(e.target.value)}
                                    rows={3}
                                    placeholder="Please provide any relevant details regarding fit, garment condition, or preferred exchange size..."
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                                />
                            </div>

                            {/* Step 4: COD Payout Details (Only if order was Cash on Delivery) */}
                            {orderDetails.paymentMethod === "Cash on Delivery" && (
                                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-3">
                                    <div>
                                        <h5 className="text-xs font-serif font-medium text-amber-900 dark:text-amber-200">
                                            COD Refund Transfer Information
                                        </h5>
                                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                                            Since this order was placed with Cash on Delivery, please enter your UPI ID or Bank details for direct refund disbursement upon parcel receipt.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1">UPI ID (Instant Transfer)</label>
                                        <input
                                            type="text"
                                            value={bankDetails.upiId}
                                            onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                                            placeholder="e.g. yourname@okaxis"
                                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1">Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={bankDetails.accountName}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                                placeholder="Full name on account"
                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                value={bankDetails.accountNumber}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                placeholder="Bank account number"
                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1">IFSC Code</label>
                                            <input
                                                type="text"
                                                value={bankDetails.ifscCode}
                                                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                                placeholder="e.g. HDFC0001234"
                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1">Bank Name</label>
                                            <input
                                                type="text"
                                                value={bankDetails.bankName}
                                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                placeholder="e.g. HDFC Bank"
                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Estimated Refund Total */}
                            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 flex justify-between items-center text-xs">
                                <span className="text-stone-500 dark:text-stone-400">Estimated Refund Amount:</span>
                                <span className="font-serif font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                                    ₹{selectedReturnItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0).toFixed(2)}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="px-5 py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium uppercase tracking-[0.15em] hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReturn || selectedReturnItems.length === 0}
                                    className="px-6 py-3 rounded-xl bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-medium uppercase tracking-[0.15em] hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {submittingReturn ? "Submitting Request..." : "Submit Return Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;