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
    <div className='max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 w-full'>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">Edit Product</h2>
                <p className="text-sm text-stone-500 mt-1">Update merchandise information, imagery, and variant options.</p>
            </div>
            <Link 
                to="/admin/products"
                className="text-xs uppercase tracking-widest font-medium text-stone-600 hover:text-stone-900 transition whitespace-nowrap"
            >
                &larr; Back to Catalog
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm space-y-6 w-full">
            {/* Product Title */}
            <div>
                <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Product Title</label>
                <input 
                    type="text" 
                    name='name' 
                    value={productData.name || ""} 
                    onChange={handleChange}
                    className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900'
                    required
                />
            </div>
            
            {/* Description */}
            <div>
                <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Description</label>
                <textarea 
                    name="description" 
                    value={productData.description || ""}
                    onChange={handleChange}
                    className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900'
                    rows={4}
                    required
                />
            </div>

            {/* Price & Discount Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Regular Price ($)</label>
                    <input 
                        type="number" 
                        name='price' 
                        value={productData.price || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                        required 
                    />
                </div>
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Discount Price ($)</label>
                    <input 
                        type="number" 
                        name='discountPrice' 
                        value={productData.discountPrice || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                    />
                </div>
            </div>
           
            {/* Stock Count & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Stock Quantity</label>
                    <input 
                        type="number" 
                        name='countInStock' 
                        value={productData.countInStock || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                        required 
                    />
                </div>
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Stock Keeping Unit (SKU)</label>
                    <input 
                        type="text" 
                        name='sku' 
                        value={productData.sku || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                        required 
                    />
                </div>
            </div>

            {/* Category & Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Category</label>
                    <input 
                        type="text" 
                        name='category' 
                        value={productData.category || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                        required 
                    />
                </div>
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Collection</label>
                    <input 
                        type="text" 
                        name='collections' 
                        value={productData.collections || ""}
                        onChange={handleChange} 
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                        required 
                    />
                </div>
            </div>

            {/* Sizes & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Sizes (comma-separated)</label>
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
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                    />
                </div>
                <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Colors (comma-separated)</label>
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
                        className='w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900' 
                    />
                </div>
            </div>

            {/* Image Gallery Upload */}
            <div className="pt-2">
                <label className='block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2'>Imagery</label>
                <input 
                    type='file' 
                    multiple 
                    onChange={handleImageUpload} 
                    className='block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer'
                />
                {uploading && <p className="text-stone-500 text-xs mt-2">Uploading assets...</p>}
                
                <div className="flex gap-4 mt-4 flex-wrap">
                    {productData.images && productData.images.map((image, index) => (
                        <div key={index} className="relative group">
                            <img 
                                src={image.url} 
                                alt="Product variant" 
                                className='w-20 h-24 object-cover rounded-xl border border-stone-200 shadow-sm'
                            />
                        </div>
                    ))}
                </div>
            </div>   

            <div className="pt-4 border-t border-stone-100">
                <button 
                    type='submit' 
                    className='w-full bg-stone-900 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-stone-800 transition duration-200 shadow-sm'
                >
                    Save Changes
                </button>   
            </div>
        </form>
    </div>
  );
};

export default EditProductPage;