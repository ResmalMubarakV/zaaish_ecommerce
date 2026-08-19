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
        <div className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[30rem] h-full bg-white dark:bg-stone-900 shadow-2xl transform 
            transition-transform duration-300 flex flex-col z-50 text-stone-900 dark:text-stone-100 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        >
            <div className="flex justify-end p-6 border-b border-stone-100 dark:border-stone-800">
                <button onClick={toggleCartDrawer} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                    <IoMdClose className="h-6 w-6 stroke-[1.5]" />
                </button>
            </div>

            <div className="grow p-6 overflow-y-auto">
                <h2 className="text-xl font-serif font-medium mb-6 text-stone-900 dark:text-stone-100">Your Cart</h2>
                {loading ? (
                    <p className="text-stone-400 text-xs py-10 text-center uppercase tracking-widest">Loading cart...</p>
                ) : (!cart || cart.length === 0) ? (
                    <p className="text-stone-400 text-xs py-10 text-center uppercase tracking-widest">Your cart is empty.</p>
                ) : (
                    <CartContents cart={cart} onUpdateCart={fetchCart} />
                )}
            </div>

            {cart && cart.length > 0 && (
                <div className="p-6 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 sticky bottom-0">
                    <div className="flex justify-between items-center mb-4 font-serif font-medium text-lg text-stone-900 dark:text-stone-100">
                        <span>Subtotal:</span>
                        <span>${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <button 
                        onClick={handleCheckout} 
                        className="w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer shadow-sm"
                    >
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartDrawer;