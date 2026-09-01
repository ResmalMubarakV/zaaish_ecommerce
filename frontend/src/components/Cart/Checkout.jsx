import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalButton from './PayPalButton';
import { toast } from "sonner";
import { FiCheckCircle, FiTruck, FiCreditCard, FiDollarSign, FiShield, FiTag } from "react-icons/fi";

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ products: [], totalPrice: 0 });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const getEstimatedDeliveryDate = () => {
        const start = new Date();
        start.setDate(start.getDate() + 7);
        const end = new Date();
        end.setDate(end.getDate() + 10);
        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)} (7–10 Business Days)`;
    };
    
    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
    });

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showSavedSelector, setShowSavedSelector] = useState(false);

    // Promo Code and Credit Card states
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState("");
    const [appliedCode, setAppliedCode] = useState("");
    const [appliedMessage, setAppliedMessage] = useState("");
    const [activeOffers, setActiveOffers] = useState([
        { code: "ZAAISH10", discountType: "percentage", discountValue: 10 },
        { code: "WELCOME10", discountType: "percentage", discountValue: 10 }
    ]);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    // Payment Methods: "cod" | "paypal"
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [showMobileSummary, setShowMobileSummary] = useState(false);

    const isIndia = (shippingAddress.country || "").trim().toLowerCase() === "india" || 
                    (shippingAddress.country || "").trim().toLowerCase() === "in" ||
                    (shippingAddress.country || "").trim() === "";

    const codFee = (paymentMethod === "cod" && isIndia) ? 60 : 0;
    const finalTotal = Math.max(0, cart.totalPrice - discount + codFee);

    const handleApplyPromo = async (codeToApply) => {
        const targetCode = typeof codeToApply === "string" ? codeToApply.trim().toUpperCase() : promoCode.trim().toUpperCase();
        if (!targetCode) {
            setPromoError("Please enter a promo code");
            return;
        }

        try {
            setIsValidatingPromo(true);
            setPromoError("");

            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: targetCode,
                    orderAmount: cart.totalPrice
                })
            });

            const data = await res.json();
            if (res.ok && data.valid) {
                setDiscount(data.discountAmount);
                setAppliedCode(data.code);
                setPromoCode(data.code);
                setAppliedMessage(data.message || `Code ${data.code} applied!`);
                setPromoError("");
                toast.success(data.message || `Promo code ${data.code} applied!`);
            } else {
                setPromoError(data.message || "Invalid promo code");
                toast.error(data.message || "Invalid promo code");
            }
        } catch (error) {
            console.error("Coupon validation error:", error);
            setPromoError("Error validating promo code");
            toast.error("Error validating promo code");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setDiscount(0);
        setAppliedCode("");
        setPromoCode("");
        setAppliedMessage("");
        setPromoError("");
        toast.info("Promo code removed");
    };

    useEffect(() => {
        const fetchCartAndUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const storedUser = localStorage.getItem("userInfo");
                if (storedUser) setUserInfo(JSON.parse(storedUser));

                const response = await fetch('/api/cart', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok && data.cart) {
                    const formattedProducts = data.cart.map(item => ({
                        productId: item.product?._id || item.product,
                        name: item.product?.name || "Product",
                        image: item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
                        price: item.product?.currentPrice || item.product?.price || 0,
                        quantity: item.quantity,
                        size: item.size || "Standard",
                        color: item.color || "Standard",
                        sku: item.product?.sku || "ZSH-ITEM"
                    }));

                    const total = formattedProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                    setCart({
                        products: formattedProducts,
                        totalPrice: total
                    });
                }

                // Fetch profile to get saved shipping destinations
                if (token) {
                    const profileResponse = await fetch('/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const profileData = await profileResponse.json();
                    if (profileResponse.ok && profileData.user) {
                        setSavedAddresses(profileData.user.shippingAddresses || []);
                        // Autofill if default is present
                        const defaultAddress = (profileData.user.shippingAddresses || []).find(addr => addr.isDefault);
                        if (defaultAddress) {
                            setShippingAddress({
                                firstName: defaultAddress.firstName || "",
                                lastName: defaultAddress.lastName || "",
                                address: defaultAddress.address || "",
                                city: defaultAddress.city || "",
                                state: defaultAddress.state || "",
                                postalCode: defaultAddress.postalCode || "",
                                country: defaultAddress.country || "India",
                                phone: defaultAddress.phone || ""
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching checkout data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchActiveCoupons = async () => {
            try {
                const res = await fetch('/api/coupons/active');
                const data = await res.json();
                if (res.ok && data.coupons && data.coupons.length > 0) {
                    setActiveOffers(data.coupons);
                }
            } catch (e) {
                console.warn("Could not load active coupons:", e);
            }
        };

        fetchCartAndUser();
        fetchActiveCoupons();
    }, []);

    const validateAddress = () => {
        if (!shippingAddress.firstName.trim() || !shippingAddress.lastName.trim()) {
            toast.error("Please enter first and last name");
            return false;
        }
        if (!shippingAddress.address.trim()) {
            toast.error("Please enter your street address");
            return false;
        }
        if (!shippingAddress.city.trim()) {
            toast.error("Please enter city");
            return false;
        }
        if (!shippingAddress.postalCode.trim()) {
            toast.error("Please enter postal code / PIN code");
            return false;
        }
        if (!shippingAddress.phone.trim() || shippingAddress.phone.trim().length < 7) {
            toast.error("Please enter a valid phone number for courier delivery");
            return false;
        }
        return true;
    };

    const processOrderSubmission = async (chosenPaymentMethod, paymentDetails = null) => {
        if (!validateAddress()) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            let backendPaymentMethod = "PayPal";
            let orderCodFee = 0;
            let isOrderPaid = true;

            if (chosenPaymentMethod === "cod") {
                if (!isIndia) {
                    toast.error("Cash on Delivery is only available for deliveries in India");
                    setIsSubmitting(false);
                    return;
                }
                backendPaymentMethod = "Cash on Delivery";
                orderCodFee = 60;
                isOrderPaid = false;
            } else {
                backendPaymentMethod = "PayPal";
                orderCodFee = 0;
                isOrderPaid = true;
            }

            const computedOrderTotal = Math.max(0, cart.totalPrice - discount + orderCodFee);

            const orderPayload = {
                orderItems: cart.products.map(p => ({
                    product: p.productId,
                    name: p.name,
                    image: p.image,
                    sku: p.sku || "ZSH-ITEM",
                    price: p.price,
                    quantity: p.quantity,
                    size: p.size || "Standard",
                    color: p.color || "Standard"
                })),
                shippingAddress,
                paymentMethod: backendPaymentMethod,
                itemsPrice: cart.totalPrice - discount,
                shippingPrice: 0,
                taxPrice: 0,
                codFee: orderCodFee,
                totalPrice: computedOrderTotal,
                isPaid: isOrderPaid,
                paymentResult: paymentDetails || undefined
            };

            const response = await fetch('/api/orders', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            const data = await response.json();

            if (response.ok && data.order) {
                window.dispatchEvent(new Event("cartUpdated"));
                if (chosenPaymentMethod === "cod") {
                    toast.success("Order Placed! Please pay in cash upon delivery.");
                } else {
                    toast.success("Payment Received! Your order is confirmed.");
                }
                navigate(`/order-confirmation/${data.order._id}`);
            } else {
                toast.error(data.message || "Failed to process order. Please try again.");
            }
        } catch (error) {
            console.error("Order submission error:", error);
            toast.error("An unexpected error occurred while placing your order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCODPaymentSubmit = (e) => {
        e.preventDefault();
        processOrderSubmission("cod");
    };

    const handlePayPalSuccess = (details) => {
        processOrderSubmission("paypal", {
            id: details.id || `PAYPAL-${Date.now()}`,
            status: "COMPLETED",
            emailAddress: details.payer?.email_address || userInfo?.email || "customer@zaaish.com"
        });
    };

    if (loading) {
        return <div className="text-center py-24 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading checkout...</div>;
    }

    if (cart.products.length === 0) {
        return (
            <div className="text-center py-32 max-w-md mx-auto px-6">
                <p className="text-stone-400 text-xs uppercase tracking-[0.2em] font-light mb-6">Your shopping bag is empty.</p>
                <button
                    onClick={() => navigate("/collections/all")}
                    className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer"
                >
                    Discover Collections
                </button>
            </div>
        );
    }

  return (
    <div className='min-h-screen bg-stone-50/50 dark:bg-stone-950 py-8 sm:py-16 px-3 sm:px-6 lg:px-8 text-stone-900 dark:text-stone-100 transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto'>
            
            {/* Left Section: Delivery & Payment Details */}
            <div className='lg:col-span-7 flex flex-col gap-6'>
                
                {/* Mobile Order Summary Accordion */}
                <div className="lg:hidden w-full bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">
                    <button 
                        type="button"
                        onClick={() => setShowMobileSummary(prev => !prev)}
                        className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center text-[10px] font-medium uppercase tracking-[0.15em] text-stone-700 dark:text-stone-300 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850"
                    >
                        <span className="flex items-center gap-1.5">
                            🛒 {showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}
                        </span>
                        <span className="font-serif text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-medium">
                            ₹{finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {showMobileSummary ? "▲" : "▼"}
                        </span>
                    </button>
                    {showMobileSummary && (
                        <div className="px-4 sm:px-6 pb-5 sm:pb-6 border-t border-stone-100 dark:border-stone-800">
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-60 overflow-y-auto mb-4">
                                {cart.products.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between py-3">
                                        <div className="flex items-center min-w-0 pr-2">
                                            <img src={product.image} alt={product.name} className="w-10 h-12 object-cover mr-3 rounded-lg border border-stone-200/60 dark:border-stone-800 shadow-sm flex-shrink-0" />
                                            <div className="min-w-0">
                                                <h4 className="font-serif font-medium text-stone-900 dark:text-stone-100 text-xs line-clamp-1 break-words">{product.name}</h4>
                                                <p className="text-[10px] text-stone-500 dark:text-stone-400">Qty: {product.quantity} &bull; {product.size} &bull; {product.color}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap ml-2">₹{(product.price * product.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-2.5 pt-2 text-[11px] uppercase tracking-wider text-stone-500 font-light">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-stone-850 dark:text-stone-200">₹{cart.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <span>Discount (10%)</span>
                                        <span>- ₹{discount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-medium text-stone-850 dark:text-stone-200">Free</span>
                                </div>
                                {paymentMethod === "cod" && isIndia && (
                                    <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                                        <span>Cash on Delivery Fee</span>
                                        <span>+ ₹60.00</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className='bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm border border-stone-200/80 dark:border-stone-800'>
                    
                    {/* Header */}
                    <div className="border-b border-stone-100 dark:border-stone-800 pb-5 sm:pb-6 mb-6 sm:mb-8">
                        <span className="text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-stone-400 font-medium block mb-1">Step 1 of 2</span>
                        <h2 className='text-xl sm:text-3xl font-serif font-light tracking-wide uppercase text-stone-950 dark:text-stone-100'>Express Checkout</h2>
                    </div>

                    {/* Contact Details */}
                    <div className="mb-8">
                        <h3 className='text-[11px] uppercase tracking-[0.2em] font-medium mb-3 text-stone-400 dark:text-stone-500'>1. Contact Information</h3>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Account Email</label>
                            <input 
                                type="email"
                                value={userInfo?.email || "customer@zaaish.com"}
                                className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 text-sm font-light'
                                disabled 
                            />
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4 border-b border-stone-100 dark:border-stone-800 pb-2">
                            <h3 className='text-[11px] uppercase tracking-[0.2em] font-medium text-stone-400 dark:text-stone-500'>2. Shipping Address</h3>
                            {savedAddresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowSavedSelector(!showSavedSelector)}
                                    className="text-[10px] uppercase tracking-wider font-semibold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer"
                                >
                                    {showSavedSelector ? "Hide Saved" : "Choose From Saved"}
                                </button>
                            )}
                        </div>

                        {showSavedSelector && savedAddresses.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in duration-200">
                                {savedAddresses.map((addr) => (
                                    <div 
                                        key={addr._id}
                                        onClick={() => {
                                            setShippingAddress({
                                                firstName: addr.firstName || "",
                                                lastName: addr.lastName || "",
                                                address: addr.address || "",
                                                city: addr.city || "",
                                                state: addr.state || "",
                                                postalCode: addr.postalCode || "",
                                                country: addr.country || "India",
                                                phone: addr.phone || ""
                                            });
                                            setShowSavedSelector(false);
                                            toast.success(`Autofilled "${addr.label || 'Saved'}" address`);
                                        }}
                                        className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-stone-950 dark:hover:border-stone-100 cursor-pointer transition text-left"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded">
                                                {addr.label || "Address"}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">
                                                    DEFAULT
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-1">
                                            {addr.firstName} {addr.lastName}
                                        </p>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                                            {addr.address}, {addr.city}
                                        </p>
                                        <p className="text-[10px] text-stone-400 mt-0.5">
                                            TEL: {addr.phone}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className='mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                            <div>
                                <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>First Name</label>
                                <input 
                                    type="text"
                                    value={shippingAddress.firstName}
                                    onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                                    placeholder="Enter first name"
                                    className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Last Name</label>
                                <input 
                                    type="text"
                                    value={shippingAddress.lastName}
                                    onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                                    placeholder="Enter last name"
                                    className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                    required
                                />
                            </div>
                        </div>

                        <div className='mb-5'>
                            <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Street Address & Apartment</label>
                            <input 
                                type="text"
                                value={shippingAddress.address}
                                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} 
                                placeholder="House / Flat No., Building, Street, Area"
                                className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                required 
                            />
                        </div>

                        <div className='mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                            <div>
                                <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>City</label>
                                <input 
                                    type="text"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                    placeholder="City / Town"
                                    className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Postal / PIN Code</label>
                                <input 
                                    type="text"
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                                    placeholder="6-digit PIN code"
                                    className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                    required
                                />
                            </div>
                        </div>

                        <div className='mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                            <div>
                                <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Country</label>
                                <input 
                                    type="text"
                                    value={shippingAddress.country}
                                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})} 
                                    placeholder="India"
                                    className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                    required 
                                />
                            </div>
                            <div>
                                <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Contact Phone Number</label>
                                <input 
                                    type="text"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} 
                                    placeholder="+91 98765 43210"
                                    className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Review Ordered Items (Product Summary placed ABOVE Payment Section) */}
                    <div className="pt-6 border-t border-stone-100 dark:border-stone-800 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className='text-[11px] uppercase tracking-[0.2em] font-medium text-stone-400 dark:text-stone-500'>
                                3. Review Ordered Items ({cart.products.length})
                            </h3>
                            <span className="text-[10px] text-stone-400 font-light">
                                {cart.products.reduce((acc, p) => acc + p.quantity, 0)} items total
                            </span>
                        </div>

                        {/* Product Items List Card */}
                        <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 space-y-3">
                            <div className="divide-y divide-stone-200/60 dark:divide-stone-800 max-h-64 overflow-y-auto scrollbar-none pr-1">
                                {cart.products.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                                        <div className="flex items-center min-w-0 pr-2">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-12 h-15 object-cover mr-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm shrink-0" 
                                            />
                                            <div className="min-w-0">
                                                <h4 className="font-serif font-medium text-stone-900 dark:text-stone-100 text-xs sm:text-sm line-clamp-1">
                                                    {product.name}
                                                </h4>
                                                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light mt-0.5">
                                                    {product.size && `Size: ${product.size}`} {product.color && ` • Color: ${product.color}`}
                                                </p>
                                                <p className="text-[10px] text-stone-400 mt-0.5 font-light">
                                                    Qty: {product.quantity} &bull; ₹{product.price.toLocaleString()} each
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-stone-900 dark:text-stone-100 text-xs sm:text-sm whitespace-nowrap">
                                            ₹{(product.price * product.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Mini Subtotal Preview */}
                            <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex justify-between items-center text-xs">
                                <span className="text-stone-500 font-light">Items Subtotal</span>
                                <span className="font-serif font-medium text-stone-900 dark:text-stone-100">
                                    ₹{cart.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Payment Method Selector */}
                    <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                        <h3 className='text-[11px] uppercase tracking-[0.2em] font-medium mb-4 text-stone-400 dark:text-stone-500'>4. Select Payment Method</h3>
                        
                        {/* 2 Payment Tabs: Cash on Delivery, PayPal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            
                            {/* Option 1: Cash on Delivery (India Only) */}
                            <button 
                                type="button" 
                                onClick={() => {
                                    if (!isIndia) {
                                        toast.error("Cash on Delivery is only available for addresses in India");
                                        return;
                                    }
                                    setPaymentMethod("cod");
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                                    paymentMethod === "cod" 
                                        ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-md ring-2 ring-stone-950/10 dark:ring-stone-100/10" 
                                        : isIndia
                                        ? "bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600"
                                        : "bg-stone-100/50 dark:bg-stone-900/50 border-stone-200/50 dark:border-stone-800/50 text-stone-400 opacity-60 cursor-not-allowed"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <FiTruck className="text-lg" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                                        + ₹60 Fee
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-serif font-medium uppercase tracking-wider">Cash on Delivery</p>
                                    <p className="text-[10px] opacity-70 mt-0.5 font-light">Pay upon arrival (India)</p>
                                </div>
                            </button>

                            {/* Option 2: PayPal */}
                            <button 
                                type="button" 
                                onClick={() => setPaymentMethod("paypal")}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    paymentMethod === "paypal" 
                                        ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-md ring-2 ring-stone-950/10 dark:ring-stone-100/10" 
                                        : "bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-serif italic font-black text-sm">P</span>
                                    {paymentMethod === "paypal" && <FiCheckCircle className="text-sm" />}
                                </div>
                                <div>
                                    <p className="text-xs font-serif font-medium uppercase tracking-wider">PayPal</p>
                                    <p className="text-[10px] opacity-70 mt-0.5 font-light">Global Gateway</p>
                                </div>
                            </button>
                        </div>

                        {/* Payment Tab View: 2. Cash on Delivery */}
                        {paymentMethod === "cod" && (
                            <div className="pt-2 space-y-5">
                                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-stone-800 dark:text-stone-200">
                                    <div className="flex items-start space-x-3.5">
                                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                            <FiTruck className="text-lg" />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-medium text-sm text-stone-900 dark:text-stone-100">Cash on Delivery (India Exclusive)</h4>
                                            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                                                An additional handling charge of <strong className="text-amber-700 dark:text-amber-400">₹60.00</strong> applies to Cash on Delivery orders. You can pay via cash or UPI scan to the courier representative when your parcel arrives.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400">
                                    <div className="flex items-center space-x-2">
                                        <FiCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
                                        <span>No upfront digital transaction needed</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
                                        <span>Full order tracking & SMS dispatch notifications</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
                                        <span>Estimated Doorstep Delivery: {getEstimatedDeliveryDate()}</span>
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={handleCODPaymentSubmit}
                                    disabled={isSubmitting}
                                    className="w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-3.5 sm:py-4 rounded-xl text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "Placing Order..." : `Confirm COD Order (₹${finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})})`}
                                </button>
                            </div>
                        )}

                        {/* Payment Tab View: 3. PayPal */}
                        {paymentMethod === "paypal" && (
                            <div className='space-y-4 pt-4'>
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                        You will be securely routed through the PayPal portal to authorize payment. No extra fees applied.
                                    </p>
                                </div>
                                <PayPalButton 
                                    amount={finalTotal} 
                                    onSuccess={handlePayPalSuccess}
                                    onError={(err) => toast.error("PayPal transaction failed. Please try again.")}
                                />
                            </div>
                        )}

                    </div>

                </div>
            </div>

            {/* Right Section: Order Summary */}
            <div className='lg:col-span-5'>
                <div className='bg-white dark:bg-stone-900 p-5 sm:p-8 lg:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 sticky top-24 shadow-sm'>
                    
                    <h3 className='text-lg sm:text-xl font-serif font-light tracking-[0.15em] text-stone-900 dark:text-stone-100 mb-4 sm:mb-6'>Order Summary</h3>
                    
                    {/* Item list */}
                    <div className='border-t border-stone-100 dark:border-stone-800 py-3 sm:py-4 mb-4 sm:mb-6 max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 scrollbar-none'>
                        {cart.products.map((product, index) => (
                            <div key={index} className='flex items-start justify-between py-3.5 sm:py-4'>
                                <div className='flex items-start min-w-0 pr-2'>
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className='w-12 h-16 sm:w-14 sm:h-18 object-cover mr-3 sm:mr-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex-shrink-0' 
                                    />
                                    <div className="min-w-0">
                                        <h4 className='font-serif font-medium text-stone-900 dark:text-stone-100 text-xs sm:text-sm line-clamp-2 break-words leading-snug'>{product.name}</h4>
                                        <p className='text-stone-500 dark:text-stone-400 text-[10px] uppercase tracking-wider mt-1'>Size: {product.size} &bull; Color: {product.color}</p>
                                        <p className='text-stone-400 text-xs mt-0.5'>Qty: {product.quantity}</p>
                                    </div>
                                </div>
                                <p className='font-medium text-stone-900 dark:text-stone-100 text-xs sm:text-sm whitespace-nowrap ml-2'>
                                    ₹{(product.price * product.quantity).toLocaleString()}
                                </p>
                            </div>
                         ))}
                    </div>

                    {/* Promo Code Input */}
                    <div className='border-t border-stone-100 dark:border-stone-800 pt-5 sm:pt-6 pb-5 sm:pb-6'>
                        <form onSubmit={(e) => { e.preventDefault(); handleApplyPromo(promoCode); }} className='flex gap-2 sm:gap-3'>
                            <input 
                                type="text" 
                                value={promoCode} 
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="PROMO CODE"
                                className='grow p-2.5 sm:p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors uppercase placeholder:text-stone-400 min-w-0'
                                disabled={!!appliedCode}
                            />
                            {appliedCode ? (
                                <button 
                                    type="button"
                                    onClick={handleRemovePromo}
                                    className='bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 px-3.5 sm:px-4 rounded-xl text-xs uppercase tracking-wider font-semibold cursor-pointer hover:bg-rose-100 transition-all shrink-0'
                                >
                                    Remove
                                </button>
                            ) : (
                                <button 
                                    type="submit"
                                    disabled={isValidatingPromo || !promoCode}
                                    className='bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-3.5 sm:px-4 rounded-xl text-xs uppercase tracking-wider font-semibold cursor-pointer hover:bg-stone-800 dark:hover:bg-stone-200 transition-all border border-stone-950 dark:border-stone-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
                                >
                                    {isValidatingPromo ? "..." : "Apply"}
                                </button>
                            )}
                        </form>
                        {promoError && <p className='text-rose-500 text-[10px] mt-2 font-medium tracking-wide'>{promoError}</p>}
                        {appliedCode && <p className='text-emerald-600 dark:text-emerald-400 text-[10px] mt-2 font-medium tracking-wide'>{appliedMessage || `🎉 Code ${appliedCode} applied!`}</p>}
                        
                        {!appliedCode && activeOffers.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-none touch-scroll py-1">
                                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold shrink-0">Offers:</span>
                                {activeOffers.map((offer) => (
                                    <button
                                        key={offer.code}
                                        type="button"
                                        onClick={() => handleApplyPromo(offer.code)}
                                        className="p-1.5 px-2.5 sm:px-3 border border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:border-stone-950 dark:hover:border-stone-100 transition cursor-pointer whitespace-nowrap"
                                    >
                                        {offer.code} ({offer.discountType === "fixed" ? `₹${offer.discountValue} OFF` : `${offer.discountValue}% OFF`})
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3 pt-2 text-xs uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400 font-light">
                        <div className='flex justify-between items-center'>
                            <span>Subtotal</span>
                            <span className="font-medium text-stone-800 dark:text-stone-200">₹{cart.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        
                        {discount > 0 && (
                            <div className='flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium'>
                                <span>Promo Discount ({appliedCode || "Applied"})</span>
                                <span>- ₹{discount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        )}
                        
                        <div className='flex justify-between items-center'>
                            <span>Shipping</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Complimentary (₹0.00)</span>
                        </div>

                        {paymentMethod === "cod" && isIndia && (
                            <div className='flex justify-between items-center text-amber-600 dark:text-amber-400 font-semibold'>
                                <span>COD Handling Fee (India)</span>
                                <span>+ ₹60.00</span>
                            </div>
                        )}
                    </div>

                    {/* Grand Total */}
                    <div className='flex justify-between items-center text-lg font-serif font-light tracking-wide border-t border-stone-200 dark:border-stone-800 pt-6 mt-6 text-stone-900 dark:text-stone-100'>
                        <div>
                            <span>Total Amount</span>
                            {paymentMethod === "cod" && isIndia && (
                                <p className="text-[10px] font-sans uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium">Includes ₹60 COD Fee</p>
                            )}
                        </div>
                        <span className='font-medium text-2xl'>₹{finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    {/* Delivery Promise Guarantee */}
                    <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center space-x-3 text-stone-400 dark:text-stone-500">
                        <FiShield className="text-xl flex-shrink-0" />
                        <p className="text-[10px] uppercase tracking-wider leading-relaxed">
                            Encrypted 256-bit SSL Checkout &bull; 7-Day Luxury Return Policy
                        </p>
                    </div>

                </div>
            </div>

        </div>
    </div>
  );
};

export default Checkout;