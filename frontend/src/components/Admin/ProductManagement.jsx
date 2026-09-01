import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, FiAlertTriangle, FiBox, FiCheckCircle } from 'react-icons/fi';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products?limit=0');
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

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This will also remove associated Cloudinary assets.`)) {
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
                    toast.success("Product deleted successfully");
                    setProducts(products.filter((product) => product._id !== id));
                } else {
                    toast.error(data.message || "Failed to delete product");
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.error("Server error while deleting product");
            }
        }
    };

    const handleExportCSV = () => {
        if (products.length === 0) {
            toast.error("No products available to export");
            return;
        }

        const headers = ["ID", "SKU", "Name", "Category", "Current Price", "Original Price", "Stock", "Sizes", "Colors", "Created Date"];
        const rows = products.map(p => [
            `"${p._id}"`,
            `"${p.sku || 'N/A'}"`,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${p.category || 'General'}"`,
            p.currentPrice || p.price || 0,
            p.originalPrice || 0,
            p.countInStock || 0,
            `"${(p.sizes || []).join(';')}"`,
            `"${(p.colors || []).join(';')}"`,
            `"${p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A'}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `zaaish_catalog_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Product catalog exported to CSV");
    };

    const lowStockCount = products.filter(p => (p.countInStock || 0) > 0 && (p.countInStock || 0) <= 5).length;
    const outOfStockCount = products.filter(p => (p.countInStock || 0) === 0).length;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const stock = product.countInStock || 0;
        if (filterStatus === "low-stock") return matchesSearch && stock > 0 && stock <= 5;
        if (filterStatus === "out-of-stock") return matchesSearch && stock === 0;
        if (filterStatus === "in-stock") return matchesSearch && stock > 5;
        return matchesSearch;
    });

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading product catalog...</div>;
    }

    return (
        <div className='max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100'>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-xl sm:text-3xl font-serif font-light tracking-wide">Product Catalog Management</h1>
                    <p className="text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mt-1">Manage catalog listings, pricing, and stock inventory.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center justify-center border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-4 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition shadow-sm cursor-pointer"
                        title="Download CSV Catalog"
                    >
                        <FiDownload className="mr-2 text-sm" /> Export CSV
                    </button>
                    <Link
                        to="/admin/products/new"
                        className="grow sm:grow-0 inline-flex items-center justify-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer"
                    >
                        <FiPlus className="mr-2 text-sm" /> Add Product
                    </Link>
                </div>
            </div>

            {/* Low Stock Warning Banner if any items low */}
            {(lowStockCount > 0 || outOfStockCount > 0) && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                        <FiAlertTriangle className="text-amber-600 dark:text-amber-400 text-lg shrink-0" />
                        <div>
                            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Inventory Alert:</span>
                            <span className="text-xs text-amber-800 dark:text-amber-300 ml-1.5">
                                {lowStockCount} item{lowStockCount === 1 ? '' : 's'} running low (&le; 5 units) {outOfStockCount > 0 ? `and ${outOfStockCount} out of stock.` : '.'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setFilterStatus(lowStockCount > 0 ? "low-stock" : "out-of-stock")}
                        className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 underline underline-offset-4 hover:text-amber-700"
                    >
                        View Depleted Items &rarr;
                    </button>
                </div>
            )}

            {/* Filter / Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
                
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: "all", label: `All (${products.length})` },
                        { id: "in-stock", label: "In Stock" },
                        { id: "low-stock", label: `⚠️ Low Stock (${lowStockCount})` },
                        { id: "out-of-stock", label: `Out of Stock (${outOfStockCount})` },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition cursor-pointer ${
                                filterStatus === tab.id
                                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                                    : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search product, SKU, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 pl-10 text-xs tracking-wide focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                    />
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm w-full">
                <div className="overflow-x-auto scrollbar-none w-full">
                    <table className="min-w-full text-left text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        <thead className="bg-stone-50 dark:bg-stone-950/60 text-[10px] uppercase text-stone-400 dark:text-stone-500 font-medium tracking-[0.2em] border-b border-stone-200 dark:border-stone-800">
                            <tr>
                                <th className="py-4 px-6">Product</th>
                                <th className="py-4 px-6">SKU</th>
                                <th className="py-4 px-6">Price</th>
                                <th className="py-4 px-6">Stock Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => {
                                    const stock = product.countInStock || 0;
                                    const isLow = stock > 0 && stock <= 5;
                                    const isOut = stock === 0;

                                    return (
                                        <tr key={product._id} className='hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors'>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-4 min-w-[200px]">
                                                    <img 
                                                        src={product.images?.[0]?.url || "https://picsum.photos/100/100"} 
                                                        alt={product.name} 
                                                        className="w-11.5 h-14 object-cover rounded-xl border border-stone-200 dark:border-stone-800 flex-shrink-0 shadow-sm"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-serif font-medium text-stone-900 dark:text-stone-100 text-sm line-clamp-1 break-words">{product.name}</p>
                                                        <p className="text-[11px] text-stone-400 uppercase tracking-wider line-clamp-1 mt-0.5">{product.category || "General"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-stone-500 dark:text-stone-400">{product.sku || "N/A"}</td>
                                            <td className="py-4 px-6 font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                                ₹{(product.currentPrice || product.price || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider border ${
                                                    isOut 
                                                        ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                                        : isLow
                                                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 animate-pulse"
                                                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                                }`}>
                                                    {isOut ? "Out of stock" : isLow ? `⚠️ Low: ${stock} left` : `${stock} in stock`}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <Link 
                                                    to={`/admin/products/${product._id}/edit`}
                                                    className='inline-flex items-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition'
                                                >
                                                    <FiEdit2 className="mr-1.5" /> Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(product._id, product.name)}
                                                    className='inline-flex items-center bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-rose-600 hover:text-white transition cursor-pointer'
                                                >
                                                    <FiTrash2 className="mr-1.5" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className='py-16 text-center text-stone-400 text-xs uppercase tracking-[0.2em] font-light'>
                                        No products match your filter criteria.
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