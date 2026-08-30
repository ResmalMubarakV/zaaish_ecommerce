import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCart([]);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCart(data.cart || []);
            } else {
                setCart([]);
            }
        } catch (error) {
            console.error("Failed to load cart items:", error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (drawerOpen) {
            fetchCart();
        }

        const handleCartUpdate = () => {
            if (drawerOpen) fetchCart();
        };

        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, [drawerOpen]);

    const handleCheckout = () => {
        toggleCartDrawer();
        navigate("/checkout");
    };

    const totalPrice = cart && cart.length > 0 ? cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) : 0;

    return (
        <>
            {/* Drawer Container */}
            <div className={`fixed top-0 right-0 w-4/5 sm:w-1/2 md:w-[32rem] h-full bg-white dark:bg-stone-900 shadow-2xl transform 
                transition-transform duration-300 ease-out flex flex-col z-50 text-stone-900 dark:text-stone-100 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex justify-between items-center p-6 border-b border-stone-100 dark:border-stone-800">
                    <h2 className="text-sm font-serif font-medium uppercase tracking-[0.25em] text-stone-900 dark:text-stone-100">Shopping Cart</h2>
                    <button onClick={toggleCartDrawer} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer p-1 transition-transform hover:scale-110">
                        <IoMdClose className="h-6 w-6 stroke-[1.5]" />
                    </button>
                </div>

                {/* Free Shipping Tracker */}
                {cart && cart.length > 0 && (
                    <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-800 text-xs">
                        <div className="flex justify-between font-medium mb-1.5">
                            <span className="text-stone-600 dark:text-stone-400">
                                {totalPrice >= 3000 
                                    ? "🎉 You've unlocked FREE shipping!" 
                                    : `Spend ₹${(3000 - totalPrice).toLocaleString(undefined, {minimumFractionDigits: 2})} more for FREE shipping!`
                                }
                            </span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-stone-950 dark:bg-stone-100 h-full rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${Math.min((totalPrice / 3000) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="grow p-6 sm:p-8 overflow-y-auto">
                    {loading ? (
                        <p className="text-stone-400 text-xs py-16 text-center uppercase tracking-[0.2em] font-light">Loading cart items...</p>
                    ) : (!cart || cart.length === 0) ? (
                        <p className="text-stone-400 text-xs py-16 text-center uppercase tracking-[0.2em] font-light">Your shopping cart is empty.</p>
                    ) : (
                        <CartContents cart={cart} onUpdateCart={fetchCart} />
                    )}
                </div>

                {cart && cart.length > 0 && (
                    <div className="p-6 sm:p-8 bg-stone-50/80 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 sticky bottom-0">
                        <div className="flex justify-between items-center mb-6 font-serif font-light text-base tracking-wide text-stone-900 dark:text-stone-100">
                            <span className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Subtotal</span>
                            <span className="font-medium">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <button 
                            onClick={handleCheckout} 
                            className="w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer shadow-sm"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>

            {/* Backdrop */}
            {drawerOpen && (
                <div onClick={toggleCartDrawer} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-pointer transition-opacity"></div>
            )}
        </>
    );
};

export default CartDrawer;