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
        return <div className="text-center py-20 text-stone-400 font-light">Loading catalog...</div>;
    }

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">Product Management</h2>
                <p className="text-sm text-stone-500 mt-1">Manage catalog listings, pricing, and stock inventory.</p>
            </div>
            <div className="text-sm bg-stone-100 text-stone-700 px-4 py-2 rounded-lg font-medium whitespace-nowrap">
                Total Items: {products.length}
            </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left text-stone-600 whitespace-nowrap">
                    <thead className="bg-stone-50 text-xs uppercase text-stone-500 font-semibold tracking-wider border-b border-stone-200">
                        <tr>
                            <th className="py-4 px-4 sm:px-6">Product</th>
                            <th className="py-4 px-4 sm:px-6">SKU</th>
                            <th className="py-4 px-4 sm:px-6">Price</th>
                            <th className="py-4 px-4 sm:px-6">Stock</th>
                            <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product._id} className='hover:bg-stone-50/60 transition-colors'>
                                    <td className="py-4 px-4 sm:px-6">
                                        <div className="flex items-center space-x-3 min-w-[200px]">
                                            <img 
                                                src={product.images?.[0]?.url || "https://placehold.co/100x100"} 
                                                alt={product.name} 
                                                className="w-10 h-12 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                                            />
                                            <div className="truncate">
                                                <p className="font-medium text-stone-900 text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-stone-400 truncate">{product.category || "General"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 sm:px-6 font-mono text-xs text-stone-600">{product.sku || "N/A"}</td>
                                    <td className="py-4 px-4 sm:px-6 font-semibold text-stone-900">${product.price?.toFixed(2)}</td>
                                    <td className="py-4 px-4 sm:px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.countInStock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                            {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 sm:px-6 text-right space-x-2">
                                        <Link 
                                            to={`/admin/products/${product._id}/edit`}
                                            className='inline-block bg-stone-900 text-white px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-stone-800 transition'
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product._id)}
                                            className='bg-red-50 text-red-700 border border-red-200 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 hover:text-white transition'
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className='py-12 text-center text-stone-400 font-light'>
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