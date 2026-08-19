import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PayPalButton from './PayPalButton';

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
                paymentMethod: "PayPal",
                itemsPrice: cart.totalPrice,
                shippingPrice: 0,
                taxPrice: 0,
                totalPrice: cart.totalPrice
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
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading checkout...</div>;
    }

    if (cart.products.length === 0) {
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Your cart is empty. Add items to checkout.</div>;
    }

  return (
    <div className='min-h-screen bg-stone-50/50 dark:bg-stone-950 py-12 px-6 lg:px-8 text-stone-900 dark:text-stone-100 transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto'>
            
            {/* Left Section: Form */}
            <div className='bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 dark:border-stone-800'>
                <h2 className='text-2xl font-serif font-medium tracking-wide uppercase mb-6 text-stone-950 dark:text-stone-100'>Checkout</h2>
                
                <form onSubmit={handleCreateCheckout}>
                    <h3 className='text-sm uppercase tracking-widest font-semibold mb-4 text-stone-500 dark:text-stone-400'>Contact Details</h3>
                    <div className='mb-6'>
                        <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>Email</label>
                        <input type="email"
                        value={userInfo?.email || "user@example.com"}
                        className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-sm'
                        disabled />
                    </div>

                    <h3 className='text-sm uppercase tracking-widest font-semibold mb-4 text-stone-500 dark:text-stone-400'>Delivery Address</h3>
                    <div className='mb-4 grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>First Name</label>
                            <input type="text"
                            value={shippingAddress.firstName}
                            onChange={(e) => setShippingAddress({...shippingAddress, firstName:e.target.value})}
                            className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required/>
                        </div>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>Last Name</label>
                            <input type="text"
                            value={shippingAddress.lastName}
                            onChange={(e) => setShippingAddress({...shippingAddress, lastName:e.target.value})}
                            className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required/>
                        </div>
                    </div>

                    <div className='mb-4'>
                        <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>Address</label>
                        <input type="text"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address:e.target.value})} 
                        className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required />
                    </div>

                    <div className='mb-4 grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>City</label>
                            <input type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city:e.target.value})}
                            className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required/>
                        </div>
                        <div>
                            <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>Postal Code</label>
                            <input type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({...shippingAddress, postalCode:e.target.value})}
                            className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required/>
                        </div>
                    </div>

                    <div className='mb-4'>
                        <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>Country</label>
                        <input type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country:e.target.value})} 
                        className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required />
                    </div>

                    <div className='mb-6'>
                        <label className='block text-stone-600 dark:text-stone-300 text-xs font-medium uppercase tracking-wider mb-1.5'>Phone Number</label>
                        <input type="text"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone:e.target.value})} 
                        className='w-full p-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100' required />
                    </div>

                    <div className='mt-6'>
                        {!checkoutId ? (
                            <button type='submit' className='w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer shadow-sm'>
                                Continue to Payment
                            </button>
                        ) : (
                            <div>
                                <h3 className='text-sm uppercase tracking-widest font-semibold mb-4 text-emerald-600 dark:text-emerald-400'>Pay with PayPal</h3>
                                <PayPalButton 
                                  amount={cart.totalPrice} 
                                  onSuccess={handlePaymentSuccess}
                                  onError={(err) => alert("Payment Failed. Try Again")}/>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Right Section: Order Summary */}
            <div className='bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 h-fit shadow-sm'>
                <h3 className='text-lg font-serif font-medium text-stone-900 dark:text-stone-100 mb-6'>Order Summary</h3>
                <div className='border-t border-stone-100 dark:border-stone-800 py-4 mb-4 max-h-96 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800'>
                    {cart.products.map((product, index) => (
                        <div key={index} className='flex items-start justify-between py-4'>
                            <div className='flex items-start'>
                                <img src={product.image} alt={product.name} 
                                className='w-16 h-20 object-cover mr-4 rounded-xl border border-stone-200 dark:border-stone-800' />
                                <div>
                                    <h4 className='font-serif font-medium text-stone-900 dark:text-stone-100 text-sm'>{product.name}</h4>
                                    <p className='text-stone-500 dark:text-stone-400 text-xs mt-0.5'>Size: {product.size} | Color: {product.color}</p>
                                    <p className='text-stone-500 dark:text-stone-400 text-xs'>Qty: {product.quantity}</p>
                                </div>
                            </div>
                            <p className='font-medium text-stone-900 dark:text-stone-100 text-sm'>${(product.price * product.quantity).toLocaleString()}</p>
                        </div>
                     ))}
                </div>
                <div className='flex justify-between items-center text-xs uppercase tracking-wider mb-3 text-stone-500 dark:text-stone-400'>
                    <span>Subtotal</span>
                    <span>${cart.totalPrice.toLocaleString()}</span>
                </div>
                <div className='flex justify-between items-center text-xs uppercase tracking-wider mb-4 text-stone-500 dark:text-stone-400'>
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className='flex justify-between items-center text-base font-serif font-medium mt-4 border-t border-stone-200 dark:border-stone-800 pt-4 text-stone-900 dark:text-stone-100'>
                    <span>Total</span>
                    <span>${cart.totalPrice.toLocaleString()}</span>
                </div>
            </div>

        </div>
    </div>
  )
}

export default Checkout;