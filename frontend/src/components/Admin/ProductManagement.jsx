import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products || []);
            } else {
                console.error("Failed to fetch products:", data.message);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/products/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    alert("Product deleted successfully");
                    setProducts(products.filter((product) => product._id !== id));
                } else {
                    alert(data.message || "Failed to delete product");
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Server error while deleting product");
            }
        }
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading catalog...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100">Product Management</h2>
                <p className="text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mt-1">Manage catalog listings, pricing, and stock inventory.</p>
            </div>
            <div className="text-xs uppercase tracking-[0.15em] bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap border border-stone-200/80 dark:border-stone-800">
                Total Items: {products.length}
            </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                    <thead className="bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800">
                        <tr>
                            <th className="py-4 px-6">Product</th>
                            <th className="py-4 px-6">SKU</th>
                            <th className="py-4 px-6">Price</th>
                            <th className="py-4 px-6">Stock</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-4 min-w-[220px]">
                                            <img 
                                                src={product.images?.[0]?.url || "https://placehold.co/100x100"} 
                                                alt={product.name} 
                                                className="w-11.5 h-14 object-cover rounded-xl border border-stone-200 dark:border-stone-800 flex-shrink-0 shadow-sm"
                                            />
                                            <div className="truncate">
                                                <p className="font-serif font-medium text-stone-900 dark:text-stone-100 text-sm truncate">{product.name}</p>
                                                <p className="text-[11px] text-stone-400 uppercase tracking-wider truncate mt-0.5">{product.category || "General"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-xs text-stone-500 dark:text-stone-400">{product.sku || "N/A"}</td>
                                    <td className="py-4 px-6 font-semibold text-stone-900 dark:text-stone-100 text-sm">${product.price?.toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${product.countInStock > 0 ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"}`}>
                                            {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2">
                                        <Link 
                                            to={`/admin/products/${product._id}/edit`}
                                            className='inline-block bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition'
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product._id)}
                                            className='bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-rose-600 hover:text-white transition cursor-pointer'
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                    No products found in inventory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ProductManagement;