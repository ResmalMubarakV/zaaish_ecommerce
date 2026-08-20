import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        countInStock: "",
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "Unisex",
        images: []
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/id/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setProductData(data.product);
                } else {
                    alert("Failed to load product details");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('/api/uploads', {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setProductData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...data.images]
                }));
                alert("Images uploaded successfully!");
            } else {
                alert(data.message || "Image upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading images");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
            const data = await response.json();

            if (response.ok) {
                alert("Product updated successfully!");
                navigate("/admin/products");
            } else {
                alert(data.message || "Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Server error during update");
        }
    };

  return (
    <div className='max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100">Edit Product</h2>
                <p className="text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mt-1">Update merchandise information, imagery, and variant options.</p>
            </div>
            <Link 
                to="/admin/products"
                className="text-[11px] uppercase tracking-[0.2em] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition whitespace-nowrap"
            >
                &larr; Back to Catalog
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 w-full">
            {/* Product Title */}
            <div>
                <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Product Title</label>
                <input 
                    type="text" 
                    name='name' 
                    value={productData.name || ""} 
                    onChange={handleChange}
                    className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light'
                    required
                />
            </div>
            
            {/* Description */}
            <div>
                <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Description</label>
                <textarea 
                    name="description" 
                    value={productData.description || ""}
                    onChange={handleChange}
                    className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light'
                    rows={4}
                    required
                />
            </div>

            {/* Price & Discount Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Regular Price ($)</label>
                    <input 
                        type="number" 
                        name='price' 
                        value={productData.price || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                        required 
                    />
                </div>
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Discount Price ($)</label>
                    <input 
                        type="number" 
                        name='discountPrice' 
                        value={productData.discountPrice || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                    />
                </div>
            </div>
           
            {/* Stock Count & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Stock Quantity</label>
                    <input 
                        type="number" 
                        name='countInStock' 
                        value={productData.countInStock || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                        required 
                    />
                </div>
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Stock Keeping Unit (SKU)</label>
                    <input 
                        type="text" 
                        name='sku' 
                        value={productData.sku || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                        required 
                    />
                </div>
            </div>

            {/* Category & Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Category</label>
                    <input 
                        type="text" 
                        name='category' 
                        value={productData.category || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                        required 
                    />
                </div>
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Collection</label>
                    <input 
                        type="text" 
                        name='collections' 
                        value={productData.collections || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                        required 
                    />
                </div>
            </div>

            {/* Sizes & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Sizes (comma-separated)</label>
                    <input 
                        type="text" 
                        name='sizes' 
                        value={Array.isArray(productData.sizes) ? productData.sizes.join(", ") : ""}
                        onChange={(e) => 
                            setProductData({
                                ...productData, 
                                sizes: e.target.value.split(",").map((size) => size.trim()),
                            })
                        } 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                    />
                </div>
                <div>
                    <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Colors (comma-separated)</label>
                    <input 
                        type="text" 
                        name='colors' 
                        value={Array.isArray(productData.colors) ? productData.colors.join(", ") : ""}
                        onChange={(e) => 
                            setProductData({
                                ...productData, 
                                colors: e.target.value.split(",").map((color) => color.trim()),
                            })
                        } 
                        className='w-full border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-sm bg-stone-50 dark:bg-stone-950 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 text-stone-900 dark:text-stone-100 font-light' 
                    />
                </div>
            </div>

            {/* Image Gallery Upload */}
            <div className="pt-2">
                <label className='block text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2'>Imagery</label>
                <input 
                    type='file' 
                    multiple 
                    onChange={handleImageUpload} 
                    className='block w-full text-xs text-stone-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-[11px] file:uppercase file:tracking-wider file:font-medium file:bg-stone-100 dark:file:bg-stone-800 file:text-stone-700 dark:file:text-stone-300 hover:file:bg-stone-200 dark:hover:file:bg-stone-700 cursor-pointer transition-colors'
                />
                {uploading && <p className="text-stone-400 text-xs mt-2 font-light">Uploading assets...</p>}
                
                <div className="flex gap-4 mt-4 flex-wrap">
                    {productData.images && productData.images.map((image, index) => (
                        <div key={index} className="relative group">
                            <img 
                                src={image.url} 
                                alt="Product variant" 
                                className='w-20 h-24 object-cover rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm'
                            />
                        </div>
                    ))}
                </div>
            </div>   

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                <button 
                    type='submit' 
                    className='w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer shadow-sm'
                >
                    Save Changes
                </button>   
            </div>
        </form>
    </div>
  );
};

export default EditProductPage;