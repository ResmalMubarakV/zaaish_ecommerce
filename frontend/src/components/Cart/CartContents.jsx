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
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                alert(data.message || "Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    };

    const handleVariantChange = async (itemId, field, value) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/cart/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: value })
            });
            const data = await response.json();
            if (response.ok) {
                onUpdateCart(data.cart);
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                alert(data.message || "Failed to update item options");
            }
        } catch (error) {
            console.error("Error updating cart variant:", error);
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
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                alert(data.message || "Failed to remove item");
            }
        } catch (error) {
            console.error("Error removing cart item:", error);
        }
    };

    if (!cart || cart.length === 0) {
        return <div className="text-center py-16 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Your cart is empty</div>;
    }

    return (
        <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {cart.map((item) => {
                const itemPrice = item.product?.currentPrice || item.product?.price || 0;
                const availableSizes = item.product?.sizes || [];
                const availableColors = item.product?.colors || [];

                return (
                    <div key={item._id} className="flex items-start justify-between py-4 sm:py-6 gap-3 sm:gap-4 group">
                        <div className="flex items-start min-w-0 pr-1">
                            {item.product?.images?.[0]?.url && (
                                <img src={item.product.images[0].url} alt={item.product.name} className="w-16 h-20 sm:w-20 sm:h-24 object-cover mr-3 sm:mr-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                                <h3 className="font-serif font-medium text-stone-900 dark:text-stone-100 text-xs sm:text-sm tracking-wide line-clamp-2 break-words leading-snug">{item.product?.name || "Product"}</h3>
                                
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-light">
                                    {availableSizes.length > 0 ? (
                                        <div className="flex items-center gap-1">
                                            <span>Size:</span>
                                            <select 
                                                value={item.size}
                                                onChange={(e) => handleVariantChange(item._id, "size", e.target.value)}
                                                className="bg-transparent border border-stone-200 dark:border-stone-850 px-1 py-0.5 rounded focus:outline-none text-[9px] sm:text-[10px] uppercase font-semibold text-stone-700 dark:text-stone-300"
                                            >
                                                {availableSizes.map(sz => (
                                                    <option key={sz} value={sz} className="dark:bg-stone-900">{sz}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <span>Size: {item.size}</span>
                                    )}

                                    {availableColors.length > 0 ? (
                                        <div className="flex items-center gap-1">
                                            <span>Color:</span>
                                            <select 
                                                value={item.color}
                                                onChange={(e) => handleVariantChange(item._id, "color", e.target.value)}
                                                className="bg-transparent border border-stone-200 dark:border-stone-850 px-1 py-0.5 rounded focus:outline-none text-[9px] sm:text-[10px] uppercase font-semibold text-stone-700 dark:text-stone-300"
                                            >
                                                {availableColors.map(cl => (
                                                    <option key={cl} value={cl} className="dark:bg-stone-900">{cl}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <span>Color: {item.color}</span>
                                    )}
                                </div>

                                <div className="flex items-center mt-3 sm:mt-4">
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, -1, item.quantity)}
                                        className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 rounded-lg px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer"
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </button>
                                    <span className="mx-2.5 sm:mx-3.5 text-xs font-semibold text-stone-900 dark:text-stone-100">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, 1, item.quantity)}
                                        className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 rounded-lg px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col justify-between items-end h-full shrink-0">
                            <p className="font-medium text-stone-900 dark:text-stone-100 text-xs sm:text-sm tracking-wide whitespace-nowrap">₹{(itemPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <button onClick={() => handleRemoveItem(item._id)} className="cursor-pointer mt-4 sm:mt-6 p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" aria-label="Remove item">
                                <RiDeleteBin3Line className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CartContents;