import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FiArrowLeft, FiUploadCloud, FiTrash2, FiLoader } from 'react-icons/fi';
import ProductVariantFields from './ProductVariantFields';

const AddProductPage = () => {
    const navigate = useNavigate();

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        countInStock: "",
        sku: `ZSH-${Math.floor(100 + Math.random() * 900)}`,
        category: "Top Wear",
        subCategory: "",
        brand: "Zaaish Reserve",
        sizes: [],
        colors: [],
        collections: "Men",
        material: "Cashmere Blend",
        gender: "Men",
        images: []
    });
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleVariantChange = (field, values) => {
        setProductData((prevData) => ({ ...prevData, [field]: values }));
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = 8 - productData.images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        if (filesToUpload.length < files.length) {
            toast.info(`Only ${remainingSlots} image slot${remainingSlots === 1 ? "" : "s"} remaining.`);
        }

        const formData = new FormData();
        for (const file of filesToUpload) {
            formData.append("images", file);
        }

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('/api/products/upload', {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setProductData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...(data.images || [])]
                }));
                toast.success("Images uploaded to Cloudinary successfully!");
            } else {
                toast.error(data.message || "Cloudinary image upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading images to server");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleRemoveImage = (index) => {
        setProductData((prev) => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productData.name || !productData.price || !productData.category) {
            toast.error("Please complete all required fields");
            return;
        }

        if (productData.images.length === 0) {
            toast.error("Please upload at least one product image");
            return;
        }

        if (productData.sizes.length === 0 || productData.colors.length === 0) {
            toast.error("Choose at least one available size and colour");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...productData,
                price: Number(productData.price),
                discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
                countInStock: Number(productData.countInStock || 0)
            };

            const response = await fetch('/api/products', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Product created successfully!");
                navigate("/admin/products");
            } else {
                toast.error(data.message || "Failed to create product");
            }
        } catch (error) {
            console.error("Create product error:", error);
            toast.error("Server error creating product");
        }
    };

    // Full-screen upload overlay prevents navigation during Cloudinary upload
    const UploadOverlay = () => uploading ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col items-center max-w-xs w-full mx-4">
                <div className="relative w-14 h-14 mb-5">
                    <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-stone-950 dark:border-t-stone-100 animate-spin" />
                </div>
                <p className="text-sm font-serif font-medium text-stone-900 dark:text-stone-100 mb-2 text-center">Uploading Images</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 text-center font-light">Please don't close or navigate away while your images upload to Cloudinary.</p>
            </div>
        </div>
    ) : null;

    return (
        <div className="max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 w-full text-stone-900 dark:text-stone-100">
            <UploadOverlay />
            <div className="mb-8">
                <Link to="/admin/products" className="inline-flex items-center text-xs uppercase tracking-[0.2em] font-medium text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors mb-4">
                    <FiArrowLeft className="mr-2" /> Back to Products
                </Link>
                <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-wide">Add New Product</h1>
                <p className="text-xs uppercase tracking-[0.15em] text-stone-400 mt-1">Create a new item in your luxury catalog with Cloudinary image streaming.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-stone-900 p-5 sm:p-8 lg:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
                
                {/* Cloudinary Image Upload Section */}
                <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-3">
                        Product Images (Cloudinary Multi-Upload)
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {productData.images.map((img, index) => (
                            <div key={index} className="relative group rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 aspect-square bg-stone-100 dark:bg-stone-950">
                                <img src={img.url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        ))}

                        {productData.images.length < 8 && (
                            <label className={`relative border-2 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center p-4 text-center transition-colors ${uploading ? "border-stone-300 dark:border-stone-700 cursor-wait" : "border-stone-300 dark:border-stone-800 hover:border-stone-950 dark:hover:border-stone-100 cursor-pointer"}`}>
                                {uploading ? <FiLoader className="w-8 h-8 text-stone-700 dark:text-stone-200 mb-2 animate-spin" /> : <FiUploadCloud className="w-8 h-8 text-stone-400 mb-2" />}
                                <span className="text-[11px] font-medium uppercase tracking-wider text-stone-600 dark:text-stone-300">
                                    {uploading ? "Uploading images" : "Upload image"}
                                </span>
                                {uploading && <span className="mt-1 text-[10px] text-stone-400">Please keep this page open</span>}
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Product Name *</label>
                        <input type="text" name="name" value={productData.name} onChange={handleChange} required className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="e.g. Silk Charmeuse Blouse" />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">SKU Code *</label>
                        <input type="text" name="sku" value={productData.sku} onChange={handleChange} required className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Regular Price ($) *</label>
                        <input type="number" name="price" value={productData.price} onChange={handleChange} required min="0" step="0.01" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="290.00" />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Discount Price ($)</label>
                        <input type="number" name="discountPrice" value={productData.discountPrice} onChange={handleChange} min="0" step="0.01" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="Optional" />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Stock Inventory *</label>
                        <input type="number" name="countInStock" value={productData.countInStock} onChange={handleChange} required min="0" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="25" />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Category *</label>
                        <select name="category" value={productData.category} onChange={handleChange} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100">
                            <option value="Top Wear">Top Wear</option>
                            <option value="Bottom Wear">Bottom Wear</option>
                            <option value="Outerwear">Outerwear</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Footwear">Footwear</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Collection *</label>
                        <select name="collections" value={productData.collections} onChange={handleChange} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100">
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Top Wear">Top Wear</option>
                            <option value="Bottom Wear">Bottom Wear</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Gender *</label>
                        <select name="gender" value={productData.gender} onChange={handleChange} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100">
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Material *</label>
                        <input type="text" name="material" value={productData.material} onChange={handleChange} required className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="e.g. Mulberry Silk" />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Brand *</label>
                        <input type="text" name="brand" value={productData.brand} onChange={handleChange} required className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="e.g. Zaaish Reserve" />
                    </div>
                </div>

                <ProductVariantFields
                    sizes={productData.sizes}
                    colors={productData.colors}
                    onChange={handleVariantChange}
                />

                <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-medium mb-2">Description *</label>
                    <textarea name="description" value={productData.description} onChange={handleChange} required rows={4} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100" placeholder="Detailed product craftsmanship, silhouette, and fabric description..." />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 border-t border-stone-100 sm:flex-row sm:justify-end sm:space-x-4 dark:border-stone-800">
                    <Link to="/admin/products" className="px-6 py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-center text-xs font-medium uppercase tracking-[0.15em] hover:bg-stone-100 dark:hover:bg-stone-800 transition">
                        Cancel
                    </Link>
                    <button type="submit" disabled={uploading} className="px-8 py-3 rounded-xl bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-medium uppercase tracking-[0.15em] hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? "Uploading images..." : "Save Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;
