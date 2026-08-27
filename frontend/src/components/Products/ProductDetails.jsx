import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { FiStar, FiUploadCloud, FiTrash2, FiUserCheck } from "react-icons/fi";
import ProductGrid from "./ProductGrid";

const getColorHex = (colorName) => {
    if (!colorName) return "#000000";
    const map = {
        Black: "#18181B",
        Charcoal: "#3F3F46",
        Cream: "#FBF7EE",
        Ivory: "#FFFFF0",
        Navy: "#1E293B",
        Emerald: "#065F46",
        Champagne: "#F7E6BD",
        Sand: "#D4B996",
        Olive: "#556B2F",
        White: "#FFFFFF",
        Red: "#991B1B",
        Blue: "#2563EB",
        Gray: "#6B7280"
    };
    return map[colorName] || colorName.toLowerCase();
};

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    // Review Form state
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [reviewImages, setReviewImages] = useState([]);
    const [uploadingReviewImg, setUploadingReviewImg] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/id/${id}`);
            const data = await response.json();

            if (response.ok) {
                const prod = data.product;
                setProduct(prod);
                setMainImage(prod.images?.[0]?.url || "");
                if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
                if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
                
                if (prod.category) {
                    const simResponse = await fetch(`/api/products?category=${prod.category}&limit=6`);
                    const simData = await simResponse.json();
                    if (simResponse.ok) {
                        let simList = (simData.products || []).filter(p => p._id !== id);
                        if (simList.length < 4) {
                            const fallbackRes = await fetch(`/api/products?limit=6`);
                            const fallbackData = await fallbackRes.json();
                            if (fallbackRes.ok) {
                                const extras = (fallbackData.products || []).filter(p => p._id !== id && !simList.some(item => item._id === p._id));
                                simList = [...simList, ...extras];
                            }
                        }
                        setSimilarProducts(simList.slice(0, 4));
                    }
                }

            } else {
                console.error("Failed to fetch product:", data.message);
            }
        } catch (error) {
            console.error("Error loading product details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const handleQuantityChange = (action) => {
        if(action === "plus") setQuantity((prev) => prev + 1);
        if(action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            if (!selectedSize || !selectedColor) {
                toast.error("Please select a size and color before adding to cart", { duration: 1500 });
                return;
            }

            const pendingCartItem = {
                productId: product._id,
                size: selectedSize,
                color: selectedColor,
                quantity: quantity
            };
            sessionStorage.setItem("pendingCartItem", JSON.stringify(pendingCartItem));

            toast.error("Please log in first to add items to your cart", { duration: 2000 });
            navigate("/login");
            return;
        }

        if (!selectedSize || !selectedColor) {
            toast.error("Please select a size and color before adding to cart", { duration: 1500 });
            return;
        }
        
        setIsButtonDisabled(true);

        try {
            const response = await fetch('/api/cart', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    size: selectedSize,
                    color: selectedColor,
                    quantity: quantity
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Product added to cart", { duration: 1500 });
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                toast.error(data.message || "Failed to add to cart", { duration: 1500 });
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Server error while adding to cart", { duration: 1500 });
        } finally {
            setIsButtonDisabled(false);
        }
    };

    // Review Image Upload Handler
    const handleReviewImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        try {
            setUploadingReviewImg(true);
            const token = localStorage.getItem("token");
            const response = await fetch('/api/products/upload', {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setReviewImages((prev) => [...prev, ...(data.images || [])]);
                toast.success("Photo attached to review!");
            } else {
                toast.error(data.message || "Image upload failed");
            }
        } catch (err) {
            console.error("Review upload error:", err);
            toast.error("Error uploading review image");
        } finally {
            setUploadingReviewImg(false);
        }
    };

    // Submit Review Handler
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Please login to submit a product review");
            navigate("/login");
            return;
        }

        if (!newComment.trim()) {
            toast.error("Please enter a review comment");
            return;
        }

        try {
            setSubmittingReview(true);
            const response = await fetch(`/api/products/${id}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: newRating,
                    comment: newComment,
                    images: reviewImages
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Thank you! Review submitted successfully.");
                setNewComment("");
                setReviewImages([]);
                fetchProductDetails();
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (err) {
            console.error("Review submission error:", err);
            toast.error("Server error submitting review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading product details...</div>;
    }

    if (!product) {
        return <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Product not found.</div>;
    }

  return (
    <div className="py-16 px-6 lg:px-8 bg-stone-50/50 dark:bg-stone-950 min-h-screen text-stone-900 dark:text-stone-100 transition-colors">
        <div className="max-w-6xl mx-auto bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200/80 dark:border-stone-800">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Left Thumbnails */}
                <div className="hidden md:flex flex-col space-y-4">
                    {product.images?.map((image, index) => (
                        <img 
                        key={index}
                        src={image.url} 
                        alt={image.altText || `Thumbnail ${index}`} 
                        className={`w-20 h-24 object-cover rounded-xl cursor-pointer border transition-all ${mainImage ===
                            image.url ? "border-stone-950 dark:border-stone-100 ring-2 ring-stone-950/20 dark:ring-stone-100/20" : "border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setMainImage(image.url)}
                        />
                    ))}
                </div>

                {/* Main Image */}
                <div className="md:w-1/2">
                    <div className="overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 shadow-sm">
                        <img src={mainImage} alt={product.name} 
                        className="w-full h-[500px] sm:h-[600px] object-cover" />
                    </div>
                </div>

                {/* Mobile Thumbnails */}
                <div className="md:hidden flex overflow-x-auto space-x-4 pb-2 scrollbar-none">
                    {product.images?.map((image, index) => (
                        <img 
                        key={index}
                        src={image.url} 
                        alt={image.altText || `Thumbnail ${index}`} 
                        className={`w-20 h-24 object-cover rounded-xl cursor-pointer border flex-shrink-0 ${mainImage ===
                            image.url ? "border-stone-950 dark:border-stone-100" : "border-stone-200 dark:border-stone-800 opacity-70"
                        }`}
                        onClick={() => setMainImage(image.url)}/>
                    ))}
                </div>

                {/* Right Section */}
                <div className="md:w-1/2 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium block mb-1">
                        {product.brand || "Zaaish Reserve"} &bull; {product.category}
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-wide mb-3 text-stone-900 dark:text-stone-100">
                        {product.name}
                    </h1>

                    {/* Rating Badge Header */}
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar 
                                    key={star} 
                                    className={`w-4 h-4 ${star <= Math.round(product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} 
                                />
                            ))}
                        </div>
                        <span className="text-xs text-stone-500 font-medium">
                            {(product.rating || 5.0).toFixed(1)} ({product.numReviews || product.reviews?.length || 0} reviews)
                        </span>
                    </div>

                    <p className="text-2xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-6">
                        $ {product.currentPrice || product.price}
                    </p>
                    <p className="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed text-sm font-light">
                        {product.description}
                    </p>
                    
                    {/* AVAILABLE COLORS SWATCHES */}
                    <div className="mb-6">
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
                            Color: <span className="text-stone-900 dark:text-stone-100 font-semibold">{selectedColor || "Select Color"}</span>
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {product.colors?.map((color) => (
                                <button key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`relative w-8 h-8 rounded-full border cursor-pointer transition-transform hover:scale-110 flex items-center justify-center
                                        ${selectedColor === color ? "border-2 border-stone-950 dark:border-stone-100 ring-2 ring-offset-2 ring-stone-950 dark:ring-stone-100 shadow-sm" : "border-stone-300 dark:border-stone-700 opacity-80 hover:opacity-100"}`}
                                    style={{ backgroundColor: getColorHex(color) }}
                                    title={color}
                                >
                                    {selectedColor === color && (
                                        <span className={`w-2 h-2 rounded-full ${["Cream", "Ivory", "Champagne", "White", "Sand"].includes(color) ? "bg-stone-950" : "bg-white"}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AVAILABLE SIZES */}
                    <div className="mb-6">
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
                            Size: <span className="text-stone-900 dark:text-stone-100 font-semibold">{selectedSize || "Select Size"}</span>
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {product.sizes?.map((size) => (
                                <button key={size} 
                                onClick={() => setSelectedSize(size)}
                                className={`px-5 py-2.5 rounded-xl border text-xs font-medium uppercase tracking-widest transition-all cursor-pointer
                                    ${selectedSize === size ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-sm" : "bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"}`}
                                > 
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-8">
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3">Quantity</p>
                        <div className="flex items-center space-x-5">
                            <button 
                            onClick={() => handleQuantityChange("minus")}
                            className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer">
                                -
                            </button>
                            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{quantity}</span>
                            <button
                            onClick={() => handleQuantityChange("plus")}
                            className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer">
                                + 
                            </button>
                        </div>
                    </div>

                    <button
                    onClick={handleAddToCart}
                    disabled={isButtonDisabled}
                    className={`bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-xl w-full mb-8 text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer shadow-sm ${isButtonDisabled
                        ? "cursor-not-allowed opacity-50" : "hover:bg-stone-800 dark:hover:bg-stone-200"
                    }`}
                    >
                        {isButtonDisabled ? "Adding to Cart..." : "Add to Cart"}
                    </button>

                    <div className="border-t border-stone-100 dark:border-stone-800 pt-6 text-stone-700 dark:text-stone-300">
                        <h3 className="text-xs font-serif font-medium mb-3 uppercase tracking-[0.2em] text-stone-400">Specifications</h3>
                        <table className="w-full text-left text-xs text-stone-600 dark:text-stone-400">
                            <tbody>
                                <tr>
                                    <td className="py-2 font-medium uppercase tracking-[0.15em] text-[10px] text-stone-400">SKU Code</td>
                                    <td className="py-2 font-mono text-stone-500">{product.sku}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium uppercase tracking-[0.15em] text-[10px] text-stone-400">Brand Atelier</td>
                                    <td className="py-2 font-light">{product.brand || "Zaaish Reserve"}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium uppercase tracking-[0.15em] text-[10px] text-stone-400">Material Craft</td>
                                    <td className="py-2 font-light">{product.material || "Premium Cashmere"}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium uppercase tracking-[0.15em] text-[10px] text-stone-400">Gender Target</td>
                                    <td className="py-2 font-light">{product.gender}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CUSTOMER REVIEWS SECTION */}
            <div className="mt-20 border-t border-stone-100 dark:border-stone-800 pt-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium block mb-1">Customer Feedback</span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide">Product Reviews ({product.reviews?.length || 0})</h2>
                    </div>

                    <div className="flex items-center space-x-3 bg-stone-50 dark:bg-stone-950 px-5 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                        <span className="text-2xl font-serif font-medium text-stone-900 dark:text-stone-100">{(product.rating || 5.0).toFixed(1)}</span>
                        <div>
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                                ))}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-stone-400">Verified Ratings</span>
                        </div>
                    </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleSubmitReview} className="mb-12 bg-stone-50/70 dark:bg-stone-950/70 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-5">
                    <h3 className="text-sm font-serif font-medium uppercase tracking-[0.15em] text-stone-900 dark:text-stone-100">Write a Customer Review</h3>

                    <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Select Your Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                                >
                                    <FiStar className={`w-6 h-6 ${star <= newRating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Your Feedback *</label>
                        <textarea
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                            placeholder="Share your thoughts on craftsmanship, fit, fabric texture..."
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-xs tracking-wide focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                        />
                    </div>

                    {/* Customer Photo Upload via Cloudinary */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Attach Customer Photos (Optional Cloudinary Upload)</label>
                        <div className="flex flex-wrap gap-3">
                            {reviewImages.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                                    <img src={img.url} alt="Review" className="w-full h-full object-cover" />
                                </div>
                            ))}

                            <label className="w-16 h-16 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-950 rounded-xl flex flex-col items-center justify-center cursor-pointer p-1">
                                <FiUploadCloud className="w-5 h-5 text-stone-400 mb-1" />
                                <span className="text-[9px] uppercase tracking-wider text-stone-500 font-medium">
                                    {uploadingReviewImg ? "..." : "Photo"}
                                </span>
                                <input type="file" multiple accept="image/*" onChange={handleReviewImageUpload} className="hidden" disabled={uploadingReviewImg} />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-8 py-3 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>

                {/* Review List */}
                <div className="space-y-6">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((rev, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center text-xs font-serif font-light">
                                            {rev.name?.charAt(0).toUpperCase() || "C"}
                                        </div>
                                        <div>
                                            <span className="font-serif font-medium text-xs text-stone-900 dark:text-stone-100 block">{rev.name}</span>
                                            <span className="text-[10px] text-stone-400 font-light">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-stone-600 dark:text-stone-300 text-xs font-light leading-relaxed">{rev.comment}</p>

                                {rev.images && rev.images.length > 0 && (
                                    <div className="flex gap-2 pt-2">
                                        {rev.images.map((img, i) => (
                                            <img key={i} src={img.url} alt="Review attachment" className="w-14 h-14 object-cover rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-12 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">
                            No reviews submitted yet. Be the first to share your experience!
                        </p>
                    )}
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="mt-24 border-t border-stone-100 dark:border-stone-800 pt-16">
                    <h2 className="text-2xl text-center font-serif font-light tracking-wide mb-10 text-stone-900 dark:text-stone-100">
                        You May Also Like
                    </h2>
                    <ProductGrid products={similarProducts}/>
                </div>
            )}
        </div>
    </div>
  );
};

export default ProductDetails;