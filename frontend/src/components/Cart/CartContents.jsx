import React from "react";
import { RiDeleteBin3Line } from "react-icons/ri";

const CartContents = ({ cart, onUpdateCart }) => {
    const handleQuantityChange = async (itemId, delta, currentQty) => {
        const newQty = currentQty + delta;
        if (newQty <= 0) {
            handleRemoveItem(itemId);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/cart/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQty })
            });
            const data = await response.json();
            if (response.ok) {
                onUpdateCart(data.cart);
            } else {
                alert(data.message || "Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/cart/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                onUpdateCart(data.cart);
            } else {
                alert(data.message || "Failed to remove item");
            }
        } catch (error) {
            console.error("Error removing cart item:", error);
        }
    };

    if (!cart || cart.length === 0) {
        return <div className="text-center py-12 text-stone-400 text-sm">Your cart is empty</div>;
    }

    return (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {cart.map((item) => {
                const itemPrice = item.product?.currentPrice || item.product?.price || 0;
                
                return (
                    <div key={item._id} className="flex items-start justify-between py-5">
                        <div className="flex items-start">
                            {item.product?.images?.[0]?.url && (
                                <img src={item.product.images[0].url} alt={item.product.name} className="w-20 h-24 object-cover mr-4 rounded-xl border border-stone-200 dark:border-stone-800" />
                            )}
                            <div>
                                <h3 className="font-serif font-medium text-stone-900 dark:text-stone-100">{item.product?.name || "Product"}</h3>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    Size: {item.size} | Color: {item.color}
                                </p>
                                <div className="flex items-center mt-3">
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, -1, item.quantity)}
                                        className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 rounded-lg px-2.5 py-0.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer">-</button>
                                    <span className="mx-3 text-sm font-medium text-stone-900 dark:text-stone-100">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, 1, item.quantity)}
                                        className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 rounded-lg px-2.5 py-0.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer">+</button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">$ {(itemPrice * item.quantity).toLocaleString()}</p>
                            <button onClick={() => handleRemoveItem(item._id)} className="cursor-pointer">
                                <RiDeleteBin3Line className="h-5 w-5 mt-3 text-rose-500 hover:text-rose-700 transition-colors"/>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CartContents;