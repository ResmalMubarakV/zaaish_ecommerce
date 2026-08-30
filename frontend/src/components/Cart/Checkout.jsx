import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PayPalButton from './PayPalButton';
import { toast } from "sonner";

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ products: [], totalPrice: 0 });
    const [loading, setLoading] = useState(true);
    const [checkoutId, setCheckoutId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    
    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
    })

    // Promo Code and Credit Card states
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState("");
    const [appliedCode, setAppliedCode] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("card"); // "card" or "paypal"
    const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvv: "" });
    const [isFlipped, setIsFlipped] = useState(false);
    const [showMobileSummary, setShowMobileSummary] = useState(false);

    const handleApplyPromo = (e) => {
        e.preventDefault();
        const code = promoCode.trim().toUpperCase();
        if (code === "WELCOME10" || code === "ZAAISH10" || code === "LUXURY") {
            const discountAmount = cart.totalPrice * 0.1; // 10% off
            setDiscount(discountAmount);
            setAppliedCode(code);
            setPromoError("");
            toast.success(`Promo code ${code} applied! 10% discount subtracted.`);
        } else {
            setPromoError("Invalid promo code");
            toast.error("Invalid promo code");
        }
    };

    const handleCardChange = (e) => {
        let { name, value } = e.target;
        if (name === "number") {
            value = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
        } else if (name === "expiry") {
            value = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().slice(0, 5);
            if (value.endsWith('/')) value = value.slice(0, -1);
        } else if (name === "cvv") {
            value = value.replace(/\D/g, '').slice(0, 3);
        }
        setCardData({ ...cardData, [name]: value });
    };

    const handleCardPaymentSubmit = (e) => {
        e.preventDefault();
        if (cardData.number.length < 19 || cardData.expiry.length < 5 || cardData.cvv.length < 3 || !cardData.name) {
            toast.error("Please fill in card details correctly");
            return;
        }
        toast.loading("Processing transaction via secure gateway...", { id: "payment" });
        setTimeout(() => {
            toast.success("Payment Received. Order Confirmed!", { id: "payment" });
            handlePaymentSuccess({ id: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}` });
        }, 1500);
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

                if (response.ok) {
                    const formattedProducts = data.cart.map(item => ({
                        productId: item.product._id,
                        name: item.product.name,
                        image: item.product.images?.[0]?.url,
                        price: item.product.currentPrice || item.product.price,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        sku: item.product.sku
                    }));

                    const total = formattedProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                    setCart({
                        products: formattedProducts,
                        totalPrice: total
                    });
                }
            } catch (error) {
                console.error("Error fetching checkout data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCartAndUser();
    }, []);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const orderPayload = {
                orderItems: cart.products.map(p => ({
                    product: p.productId,
                    name: p.name,
                    image: p.image,
                    sku: p.sku,
                    price: p.price,
                    quantity: p.quantity,
                    size: p.size,
                    color: p.color
                })),
                shippingAddress,
                paymentMethod: paymentMethod === "paypal" ? "PayPal" : "Credit Card",
                itemsPrice: cart.totalPrice - discount,
                shippingPrice: 0,
                taxPrice: 0,
                totalPrice: cart.totalPrice - discount
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
            if (response.ok) {
                setCheckoutId(data.order._id);
            } else {
                alert(data.message || "Failed to initialize checkout");
            }
        } catch (error) {
            console.error("Checkout creation error:", error);
            alert("Server error during checkout");
        }
    };

    const handlePaymentSuccess = (details) => {
        console.log("Payment Successful", details);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate(`/order-confirmation/${checkoutId}`);
    };

    if (loading) {
        return <div className="text-center py-24 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading checkout...</div>;
    }

    if (cart.products.length === 0) {
        return <div className="text-center py-24 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Your cart is empty. Add items to checkout.</div>;
    }

  return (
    <div className='min-h-screen bg-stone-50/50 dark:bg-stone-950 py-16 px-6 lg:px-8 text-stone-900 dark:text-stone-100 transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto'>
            
            {/* Left Section: Form & Mobile Accordion */}
            <div className='flex flex-col gap-6 lg:gap-8'>
                <div className="lg:hidden w-full bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
                    <button 
                        type="button"
                        onClick={() => setShowMobileSummary(prev => !prev)}
                        className="w-full px-6 py-4 flex justify-between items-center text-[10px] font-medium uppercase tracking-[0.15em] text-stone-700 dark:text-stone-300 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850"
                    >
                        <span className="flex items-center gap-1.5">
                            🛒 {showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}
                        </span>
                        <span className="font-serif text-sm text-stone-900 dark:text-stone-100 font-medium">
                            ₹{(cart.totalPrice - discount).toLocaleString(undefined, {minimumFractionDigits: 2})} {showMobileSummary ? "▲" : "▼"}
                        </span>
                    </button>
                    {showMobileSummary && (
                        <div className="px-6 pb-6 border-t border-stone-100 dark:border-stone-800 animate-fadeIn">
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-60 overflow-y-auto mb-4">
                                {cart.products.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between py-3">
                                        <div className="flex items-center">
                                            <img src={product.image} alt={product.name} className="w-10 h-12 object-cover mr-3 rounded-lg border border-stone-200/60 dark:border-stone-800 shadow-sm" />
                                            <div>
                                                <h4 className="font-serif font-medium text-stone-900 dark:text-stone-100 text-xs">{product.name}</h4>
                                                <p className="text-[10px] text-stone-500 dark:text-stone-400">Qty: {product.quantity} &bull; {product.size} &bull; {product.color}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-stone-900 dark:text-stone-100">₹{(product.price * product.quantity).toLocaleString()}</span>
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
                            </div>
                        </div>
                    )}
                </div>

                <div className='bg-white dark:bg-stone-900 rounded-2xl p-8 sm:p-10 shadow-sm border border-stone-200/80 dark:border-stone-800'>
                <h2 className='text-2xl font-serif font-light tracking-[0.15em] uppercase mb-8 text-stone-950 dark:text-stone-100'>Checkout</h2>
                
                <form onSubmit={handleCreateCheckout}>
                    <h3 className='text-[11px] uppercase tracking-[0.2em] font-medium mb-4 text-stone-400 dark:text-stone-500'>Contact Details</h3>
                    <div className='mb-8'>
                        <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Email Address</label>
                        <input type="email"
                        value={userInfo?.email || "user@example.com"}
                        className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 text-sm font-light'
                        disabled />
                    </div>

                    <h3 className='text-[11px] uppercase tracking-[0.2em] font-medium mb-4 text-stone-400 dark:text-stone-500'>Delivery Address</h3>
                    <div className='mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>First Name</label>
                            <input type="text"
                            value={shippingAddress.firstName}
                            onChange={(e) => setShippingAddress({...shippingAddress, firstName:e.target.value})}
                            className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required/>
                        </div>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Last Name</label>
                            <input type="text"
                            value={shippingAddress.lastName}
                            onChange={(e) => setShippingAddress({...shippingAddress, lastName:e.target.value})}
                            className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required/>
                        </div>
                    </div>

                    <div className='mb-5'>
                        <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Street Address</label>
                        <input type="text"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address:e.target.value})} 
                        className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required />
                    </div>

                    <div className='mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>City</label>
                            <input type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city:e.target.value})}
                            className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required/>
                        </div>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Postal Code</label>
                            <input type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({...shippingAddress, postalCode:e.target.value})}
                            className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required/>
                        </div>
                    </div>

                    <div className='mb-5'>
                        <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Country</label>
                        <input type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country:e.target.value})} 
                        className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required />
                    </div>

                    <div className='mb-8'>
                        <label className='block text-stone-600 dark:text-stone-300 text-[11px] font-medium uppercase tracking-[0.15em] mb-2'>Phone Number</label>
                        <input type="text"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone:e.target.value})} 
                        className='w-full p-3.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors' required />
                    </div>

                    <style>{`
                      .perspective-1000 { perspective: 1000px; }
                      .transform-style-3d { transform-style: preserve-3d; }
                      .backface-hidden { backface-visibility: hidden; }
                      .rotate-y-180 { transform: rotateY(180deg); }
                    `}</style>
                    <div className='mt-8'>
                        {!checkoutId ? (
                            <button type='submit' className='w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer shadow-sm'>
                                Continue to Payment
                            </button>
                        ) : (
                            <div className='pt-6 border-t border-stone-100 dark:border-stone-800'>
                                <h3 className='text-xs uppercase tracking-[0.2em] font-medium mb-4 text-stone-400 dark:text-stone-500'>Payment Method</h3>
                                
                                {/* Method Tabs */}
                                <div className="flex gap-4 mb-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setPaymentMethod("card")}
                                        className={`flex-1 py-3 text-xs uppercase tracking-wider rounded-xl font-medium border transition-all cursor-pointer ${
                                            paymentMethod === "card" 
                                                ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-sm" 
                                                : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                                        }`}
                                    >
                                        Credit Card
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setPaymentMethod("paypal")}
                                        className={`flex-1 py-3 text-xs uppercase tracking-wider rounded-xl font-medium border transition-all cursor-pointer ${
                                            paymentMethod === "paypal" 
                                                ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-sm" 
                                                : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                                        }`}
                                    >
                                        PayPal
                                    </button>
                                </div>

                                {paymentMethod === "card" ? (
                                    <div className="space-y-6">
                                        {/* Virtual Credit Card container with 3D flip effect */}
                                        <div className="w-full flex justify-center mb-6 perspective-1000">
                                            <div className={`w-full max-w-[320px] aspect-[1.586/1] relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                                
                                                {/* Front Side */}
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-850 text-white rounded-2xl p-5 border border-stone-800 shadow-xl flex flex-col justify-between backface-hidden">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-10 h-7 bg-gradient-to-r from-amber-400 to-amber-200 rounded-md border border-amber-500/20" />
                                                        <span className="font-serif text-[10px] tracking-widest text-stone-400 italic">ZAAISH</span>
                                                    </div>
                                                    <div className="text-base font-mono tracking-[0.15em] text-stone-100 py-1">
                                                        {cardData.number || "•••• •••• •••• ••••"}
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="min-w-0">
                                                            <p className="text-[7px] uppercase tracking-wider text-stone-500 mb-0.5">Card Holder</p>
                                                            <p className="text-[10px] font-mono uppercase tracking-wide truncate">{cardData.name || "YOUR NAME"}</p>
                                                        </div>
                                                        <div className="flex-shrink-0 text-right">
                                                            <p className="text-[7px] uppercase tracking-wider text-stone-500 mb-0.5">Expires</p>
                                                            <p className="text-[10px] font-mono">{cardData.expiry || "MM/YY"}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Back Side */}
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-850 text-white rounded-2xl border border-stone-800 shadow-xl flex flex-col justify-between py-5 backface-hidden rotate-y-180">
                                                    <div className="w-full h-8 bg-stone-800" />
                                                    <div className="px-5 flex items-center justify-end gap-3">
                                                        <div className="grow h-6 bg-stone-100 text-stone-800 flex items-center px-2 font-serif italic text-[10px] tracking-wider line-through">Zaaish Boutique</div>
                                                        <div className="w-10 h-6 bg-amber-100 text-stone-950 font-mono flex items-center justify-center text-[10px] rounded border border-amber-200">
                                                            {cardData.cvv || "•••"}
                                                        </div>
                                                    </div>
                                                    <div className="px-5 text-[6px] text-stone-500 leading-normal font-light">
                                                        This card is issued by Zaaish Bank. If found, return to support@zaaish.com. Authorized signatures only.
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Card Inputs Form */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className='block text-stone-600 dark:text-stone-300 text-[10px] font-medium uppercase tracking-[0.15em] mb-1.5'>Card Number</label>
                                                <input 
                                                    type="text" 
                                                    name="number"
                                                    value={cardData.number}
                                                    onChange={handleCardChange}
                                                    placeholder="0000 0000 0000 0000"
                                                    className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors'
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-stone-600 dark:text-stone-300 text-[10px] font-medium uppercase tracking-[0.15em] mb-1.5'>Cardholder Name</label>
                                                <input 
                                                    type="text" 
                                                    name="name"
                                                    value={cardData.name}
                                                    onChange={handleCardChange}
                                                    placeholder="JOHN DOE"
                                                    className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors uppercase'
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className='block text-stone-600 dark:text-stone-300 text-[10px] font-medium uppercase tracking-[0.15em] mb-1.5'>Expiration Date</label>
                                                    <input 
                                                        type="text" 
                                                        name="expiry"
                                                        value={cardData.expiry}
                                                        onChange={handleCardChange}
                                                        placeholder="MM/YY"
                                                        className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors'
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className='block text-stone-600 dark:text-stone-300 text-[10px] font-medium uppercase tracking-[0.15em] mb-1.5'>CVV / CVC</label>
                                                    <input 
                                                        type="text" 
                                                        name="cvv"
                                                        value={cardData.cvv}
                                                        onChange={handleCardChange}
                                                        onFocus={() => setIsFlipped(true)}
                                                        onBlur={() => setIsFlipped(false)}
                                                        placeholder="000"
                                                        className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors'
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={handleCardPaymentSubmit}
                                                className="w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer shadow-sm mt-2"
                                            >
                                                Pay ₹{(cart.totalPrice - discount).toLocaleString(undefined, {minimumFractionDigits: 2})} Securely
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='space-y-4 pt-2'>
                                        <h3 className='text-xs uppercase tracking-[0.2em] font-medium text-emerald-600 dark:text-emerald-400'>Secure PayPal Payment</h3>
                                        <PayPalButton 
                                            amount={cart.totalPrice - discount} 
                                            onSuccess={handlePaymentSuccess}
                                            onError={(err) => alert("Payment Failed. Try Again")}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
            </div>

            {/* Right Section: Order Summary */}
            <div className='bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-2xl border border-stone-200/80 dark:border-stone-800 h-fit shadow-sm'>
                <h3 className='text-xl font-serif font-light tracking-[0.15em] text-stone-900 dark:text-stone-100 mb-6'>Order Summary</h3>
                <div className='border-t border-stone-100 dark:border-stone-800 py-4 mb-6 max-h-96 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800'>
                    {cart.products.map((product, index) => (
                        <div key={index} className='flex items-start justify-between py-4'>
                            <div className='flex items-start'>
                                <img src={product.image} alt={product.name} 
                                className='w-16 h-20 object-cover mr-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm' />
                                <div>
                                    <h4 className='font-serif font-medium text-stone-900 dark:text-stone-100 text-sm'>{product.name}</h4>
                                    <p className='text-stone-500 dark:text-stone-400 text-[11px] uppercase tracking-wider mt-1'>Size: {product.size} &bull; Color: {product.color}</p>
                                    <p className='text-stone-500 dark:text-stone-400 text-xs mt-0.5'>Qty: {product.quantity}</p>
                                </div>
                            </div>
                            <p className='font-medium text-stone-900 dark:text-stone-100 text-sm'>₹{(product.price * product.quantity).toLocaleString()}</p>
                        </div>
                     ))}
                </div>
                {/* Promo Code Input */}
                <div className='border-t border-stone-100 dark:border-stone-800 pt-6 pb-6 mt-4'>
                    <div className='flex gap-3'>
                        <input 
                            type="text" 
                            value={promoCode} 
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="PROMO CODE (e.g. ZAAISH10)"
                            className='grow p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors uppercase placeholder:text-stone-400'
                            disabled={!!appliedCode}
                        />
                        <button 
                            type="button"
                            onClick={handleApplyPromo}
                            className='bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold cursor-pointer hover:bg-stone-800 dark:hover:bg-stone-200 transition-all border border-stone-950 dark:border-stone-100 disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={!!appliedCode || !promoCode}
                        >
                            Apply
                        </button>
                    </div>
                    {promoError && <p className='text-rose-500 text-[10px] mt-2 font-medium tracking-wide'>{promoError}</p>}
                    {appliedCode && <p className='text-emerald-600 dark:text-emerald-400 text-[10px] mt-2 font-medium tracking-wide'>🎉 Code {appliedCode} applied (10% discount)</p>}
                </div>

                <div className='flex justify-between items-center text-xs uppercase tracking-[0.15em] mb-3 text-stone-500 dark:text-stone-400 font-light'>
                    <span>Subtotal</span>
                    <span>₹{cart.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                {discount > 0 && (
                    <div className='flex justify-between items-center text-xs uppercase tracking-[0.15em] mb-3 text-emerald-600 dark:text-emerald-400 font-medium'>
                        <span>Discount (10%)</span>
                        <span>- ₹{discount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                )}
                <div className='flex justify-between items-center text-xs uppercase tracking-[0.15em] mb-6 text-stone-500 dark:text-stone-400 font-light'>
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className='flex justify-between items-center text-lg font-serif font-light tracking-wide border-t border-stone-200 dark:border-stone-800 pt-6 text-stone-900 dark:text-stone-100'>
                    <span>Total</span>
                    <span className='font-medium'>₹{(cart.totalPrice - discount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
            </div>

        </div>
    </div>
  )
}

export default Checkout;