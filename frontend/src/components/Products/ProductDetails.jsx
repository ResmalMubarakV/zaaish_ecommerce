import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from "sonner";
import { FiStar, FiUploadCloud, FiChevronLeft, FiChevronRight, FiHeart, FiShare2 } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

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
        Gray: "#6B7280",
        Grey: "#6B7280",
        Brown: "#78350F"
    };
    return map[colorName] || "#78716C";
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

    // Zoom and Size Guide state
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center' });

    // Wishlist state and handlers
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Reviews filters and photo zoom states
    const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
    const [activeReviewPhoto, setActiveReviewPhoto] = useState(null);
    const [reviewSearchQuery, setReviewSearchQuery] = useState("");

    // Accordion state
    const [activeAccordion, setActiveAccordion] = useState(null);
    const toggleAccordion = (index) => {
        setActiveAccordion(prev => prev === index ? null : index);
    };

    const fetchWishlistStatus = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const response = await fetch("/api/users/wishlist", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const wishlist = data.wishlist || [];
                setIsWishlisted(wishlist.some(item => (typeof item === "string" ? item : item?._id) === id));
            }
        } catch (error) {
            console.error("Error fetching wishlist status:", error);
        }
    };

    const handleToggleWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to save items to your wishlist");
            return;
        }

        try {
            const response = await fetch("/api/users/wishlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId: id })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.action === "added") {
                    setIsWishlisted(true);
                    toast.success("Added to your wishlist ❤️");
                } else {
                    setIsWishlisted(false);
                    toast.info("Removed from your wishlist");
                }
                window.dispatchEvent(new Event("wishlistUpdated"));
            } else {
                toast.error(data.message || "Failed to update wishlist");
            }
        } catch (err) {
            console.error("Wishlist error:", err);
            toast.error("Something went wrong updating wishlist");
        }
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomStyle({
            transform: 'scale(1.8)',
            transformOrigin: `${x}% ${y}%`
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' });
    };

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
                    const simResponse = await fetch(`/api/products?category=${prod.category}&limit=8`);
                    const simData = await simResponse.json();
                    if (simResponse.ok) {
                        let simList = (simData.products || []).filter(p => p._id !== id);
                        if (simList.length < 5) {
                            const fallbackRes = await fetch(`/api/products?limit=8`);
                            const fallbackData = await fallbackRes.json();
                            if (fallbackRes.ok) {
                                const extras = (fallbackData.products || []).filter(p => p._id !== id && !simList.some(item => item._id === p._id));
                                simList = [...simList, ...extras];
                            }
                        }
                        setSimilarProducts(simList.slice(0, 5));
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
        fetchWishlistStatus();
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
                window.dispatchEvent(new Event("openCart"));
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

    // These are the exact variants assigned in the admin product editor. The
    // de-duplication also keeps legacy product data from creating duplicate choices.
    const availableSizes = [...new Set((product.sizes || []).map((size) => String(size).trim()).filter(Boolean))];
    const availableColors = [...new Set((product.colors || []).map((color) => String(color).trim()).filter(Boolean))];

    // Ratings distribution helper calculations
    const totalReviewsCount = product.reviews?.length || 0;
    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = (product.reviews || []).filter((r) => r.rating === stars).length;
        const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
        return { stars, count, percentage };
    });

  return (
    <div className="min-h-screen bg-stone-50/50 px-4 py-8 text-stone-900 transition-colors sm:px-6 sm:py-12 lg:px-8 lg:py-16 dark:bg-stone-950 dark:text-stone-100">
        <div className="mx-auto max-w-6xl rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-8 lg:p-10 dark:border-stone-800 dark:bg-stone-900">
            <div className="grid items-start gap-6 lg:grid-cols-[5rem_minmax(0,1fr)_minmax(19rem,0.9fr)] lg:gap-8">
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
                <div className="min-w-0">
                    <div 
                        className="aspect-[4/5] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm lg:h-[620px] dark:border-stone-800 dark:bg-stone-800 cursor-zoom-in relative mx-auto lg:w-[496px]"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img src={mainImage} alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-100 ease-out"
                        style={zoomStyle} />
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
                <div className="min-w-0 lg:flex lg:min-h-[620px] lg:flex-col lg:justify-center">
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
                        ₹{product.currentPrice || product.price}
                    </p>
                    <p className="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed text-sm font-light">
                        {product.description}
                    </p>
                    
                    {/* AVAILABLE COLORS SWATCHES */}
                    {availableColors.length > 0 && <div className="mb-6">
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
                            Color: <span className="text-stone-900 dark:text-stone-100 font-semibold">{selectedColor || "Select Color"}</span>
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {availableColors.map((color) => (
                                <button key={color}
                                    onClick={() => setSelectedColor(color)}
                                    aria-label={`Select ${color} colour`}
                                    aria-pressed={selectedColor === color}
                                    className={`relative w-8 h-8 rounded-full border cursor-pointer transition-transform hover:scale-110 flex items-center justify-center
                                        ${selectedColor === color ? "border-2 border-stone-950 dark:border-stone-100 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 ring-stone-950 dark:ring-stone-100 shadow-sm" : "border-stone-300 dark:border-stone-700 opacity-80 hover:opacity-100"}`}
                                    style={{ backgroundColor: getColorHex(color) }}
                                    title={color}
                                >
                                    {selectedColor === color && (
                                        <span className={`w-2 h-2 rounded-full ${["Cream", "Ivory", "Champagne", "White", "Sand"].includes(color) ? "bg-stone-950" : "bg-white"}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>}

                    {/* AVAILABLE SIZES */}
                    {availableSizes.length > 0 && <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium uppercase tracking-[0.2em]">
                                Size: <span className="text-stone-900 dark:text-stone-100 font-semibold">{selectedSize || "Select Size"}</span>
                            </p>
                            <button 
                                type="button"
                                onClick={() => setIsSizeGuideOpen(true)}
                                className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer"
                            >
                                Size Guide
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {availableSizes.map((size) => (
                                <button key={size} 
                                onClick={() => setSelectedSize(size)}
                                className={`px-5 py-2.5 rounded-xl border text-xs font-medium uppercase tracking-widest transition-all cursor-pointer
                                    ${selectedSize === size ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-sm" : "bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"}`}
                                > 
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>}

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

                    {product.countInStock === 0 ? (
                        <div className="mb-8 p-4 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1 uppercase tracking-wider">Out of Stock</p>
                            <p className="text-[11px] text-stone-400 mb-3.5 leading-normal">Enter your email to receive a notification as soon as this item is restocked.</p>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const email = e.target.email.value;
                                    if(email) {
                                        toast.success(`Thank you! We'll notify you at ${email} when it's back in stock.`);
                                        e.target.reset();
                                    }
                                }} 
                                className="flex shadow-sm rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 focus-within:border-stone-900 dark:focus-within:border-stone-100 transition-colors"
                            >
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Enter your email" 
                                    required 
                                    className="p-3 w-full text-xs bg-stone-50 dark:bg-stone-950 text-stone-950 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none" 
                                />
                                <button 
                                    type="submit" 
                                    className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-4 py-3 text-[10px] uppercase tracking-wider font-semibold cursor-pointer hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors whitespace-nowrap border-l border-stone-300 dark:border-stone-700"
                                >
                                    Notify Me
                                </button>
                            </form>
                        </div>
                    ) : null}

                    {/* Actions row: Add to Cart (if stock > 0), Wishlist, and Share */}
                    <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
                        {product.countInStock > 0 && (
                            <button
                            onClick={handleAddToCart}
                            disabled={isButtonDisabled}
                            className={`grow bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer shadow-sm ${isButtonDisabled
                                ? "cursor-not-allowed opacity-50" : "hover:bg-stone-800 dark:hover:bg-stone-200"
                            }`}
                            >
                                {isButtonDisabled ? "Adding..." : "Add to Cart"}
                            </button>
                        )}
                        <div className={`flex gap-3 ${product.countInStock === 0 ? 'w-full' : 'sm:w-auto'}`}>
                            <button
                                type="button"
                                onClick={handleToggleWishlist}
                                className={`flex-1 sm:px-5 py-4 border rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-stone-50 dark:hover:bg-stone-900 border-stone-200 dark:border-stone-800 ${product.countInStock === 0 ? 'grow' : ''}`}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <FiHeart className={`w-5 h-5 transition-transform hover:scale-110 active:scale-95 ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-stone-700 dark:text-stone-300'}`} />
                                {product.countInStock === 0 && <span className="ml-2 text-xs font-medium uppercase tracking-[0.15em] text-stone-700 dark:text-stone-300">Add to Wishlist</span>}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Product link copied to clipboard!");
                                }}
                                className={`flex-1 sm:px-5 py-4 border rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-stone-50 dark:hover:bg-stone-900 border-stone-200 dark:border-stone-800 ${product.countInStock === 0 ? 'grow' : ''}`}
                                title="Share Product"
                            >
                                <FiShare2 className="w-5 h-5 text-stone-700 dark:text-stone-300 transition-transform hover:scale-110 active:scale-95" />
                                {product.countInStock === 0 && <span className="ml-2 text-xs font-medium uppercase tracking-[0.15em] text-stone-700 dark:text-stone-300">Share</span>}
                            </button>
                        </div>
                    </div>

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

                    {/* Animated Luxury Accordions */}
                    <div className="border-t border-stone-100 dark:border-stone-800 mt-6 pt-4 divide-y divide-stone-100 dark:divide-stone-800">
                        {/* Sizing & Fit Accordion */}
                        <div className="py-4">
                            <button 
                                type="button" 
                                onClick={() => toggleAccordion(0)}
                                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 cursor-pointer"
                            >
                                <span>Sizing & Fit</span>
                                <span className="text-sm font-light">{activeAccordion === 0 ? "−" : "+"}</span>
                            </button>
                            {activeAccordion === 0 && (
                                <div className="mt-3 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed animate-fadeIn">
                                    Designed for a relaxed, slightly oversized fit. Take your normal size for the intended slouchy luxury silhouette, or size down for a more structured, close fit. Sizing guides are available via the chart trigger.
                                </div>
                            )}
                        </div>

                        {/* Care & Composition Accordion */}
                        <div className="py-4">
                            <button 
                                type="button" 
                                onClick={() => toggleAccordion(1)}
                                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 cursor-pointer"
                            >
                                <span>Composition & Care</span>
                                <span className="text-sm font-light">{activeAccordion === 1 ? "−" : "+"}</span>
                            </button>
                            {activeAccordion === 1 && (
                                <div className="mt-3 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed animate-fadeIn">
                                    100% sustainably sourced organic cashmere blend. Dry clean only. To maintain the fine knit surface, store flat in a drawer and avoid hanging on structured hangers. Keep away from rough jewelry.
                                </div>
                            )}
                        </div>

                        {/* Shipping & Returns Accordion */}
                        <div className="py-4">
                            <button 
                                type="button" 
                                onClick={() => toggleAccordion(2)}
                                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 cursor-pointer"
                            >
                                <span>Shipping & Returns</span>
                                <span className="text-sm font-light">{activeAccordion === 2 ? "−" : "+"}</span>
                            </button>
                            {activeAccordion === 2 && (
                                <div className="mt-3 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed animate-fadeIn">
                                    We offer complimentary express shipping across India on orders above ₹3,000. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery for unworn items with tags attached.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CUSTOMER REVIEWS SECTION */}
            <div className="mt-20 border-t border-stone-100 dark:border-stone-800 pt-16">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.2fr] gap-8 items-start mb-12 border-b border-stone-100 dark:border-stone-800 pb-10">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium block mb-1">Customer Feedback</span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide mb-2">Product Reviews ({totalReviewsCount})</h2>
                        <p className="text-stone-400 dark:text-stone-500 text-xs font-light">Verified reviews from verified buyers who bought this item.</p>
                    </div>

                    {/* Big Score Box */}
                    <div className="flex items-center space-x-4 bg-stone-50 dark:bg-stone-950 px-6 py-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 h-full justify-center">
                        <span className="text-4xl font-serif font-medium text-stone-900 dark:text-stone-100">{(product.rating || 5.0).toFixed(1)}</span>
                        <div>
                            <div className="flex text-amber-400 mb-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                                ))}
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">Verified Ratings</span>
                        </div>
                    </div>

                    {/* Star Rating Breakdown Bars */}
                    <div className="space-y-2.5 max-w-sm w-full md:ml-auto">
                        {ratingDistribution.map(({ stars, count, percentage }) => (
                            <button
                                key={stars}
                                type="button"
                                onClick={() => count > 0 && setSelectedRatingFilter(stars)}
                                className={`w-full flex items-center text-xs group text-left cursor-pointer transition-colors ${count > 0 ? 'hover:text-stone-900 dark:hover:text-stone-100' : 'opacity-35 cursor-not-allowed'}`}
                                disabled={count === 0}
                            >
                                <span className="w-12 text-stone-500 font-medium">{stars} Star</span>
                                <div className="grow h-2 bg-stone-100 dark:bg-stone-850 rounded-full mx-3 overflow-hidden">
                                    <div 
                                        className="h-full bg-stone-950 dark:bg-stone-100 rounded-full transition-all duration-500" 
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-stone-400 dark:text-stone-500 font-light">{percentage}%</span>
                            </button>
                        ))}
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

                {/* Review Rating Filters & Keyword Search Row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 no-print">
                    {product.reviews && product.reviews.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider mr-2">Filter Reviews:</span>
                            <button 
                                type="button"
                                onClick={() => setSelectedRatingFilter(null)}
                                className={`px-3.5 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer ${
                                    selectedRatingFilter === null 
                                        ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-sm" 
                                        : "border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900"
                                }`}
                            >
                                All Reviews
                            </button>
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = (product.reviews || []).filter(r => r.rating === stars).length;
                                if (count === 0) return null;
                                return (
                                    <button 
                                        key={stars}
                                        type="button"
                                        onClick={() => setSelectedRatingFilter(stars)}
                                        className={`px-3.5 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                                            selectedRatingFilter === stars 
                                                ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 border-stone-950 dark:border-stone-100 shadow-sm" 
                                                : "border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900"
                                        }`}
                                    >
                                        <span>{stars} ★</span>
                                        <span className="text-[10px] opacity-75">({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {product.reviews && product.reviews.length > 0 && (
                        <div className="w-full sm:w-auto relative">
                            <input 
                                type="text"
                                value={reviewSearchQuery}
                                onChange={(e) => setReviewSearchQuery(e.target.value)}
                                placeholder="Search reviews..."
                                className="w-full sm:w-60 px-3.5 py-2 pl-3 pr-8 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs font-light focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors placeholder:text-stone-400"
                            />
                            {reviewSearchQuery && (
                                <button 
                                    onClick={() => setReviewSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs cursor-pointer p-0.5"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Review List */}
                <div className="space-y-6">
                    {product.reviews && product.reviews.length > 0 ? (
                        (() => {
                            let filtered = selectedRatingFilter 
                                ? product.reviews.filter(rev => rev.rating === selectedRatingFilter)
                                : product.reviews;

                            if (reviewSearchQuery.trim()) {
                                const q = reviewSearchQuery.toLowerCase();
                                filtered = filtered.filter(rev => 
                                    rev.comment?.toLowerCase().includes(q) || 
                                    rev.name?.toLowerCase().includes(q)
                                );
                            }

                            if (filtered.length === 0) {
                                return (
                                    <div className="text-center py-12 bg-stone-50/50 dark:bg-stone-950 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                                        <p className="text-stone-400 text-xs font-light">
                                            No {selectedRatingFilter}-star reviews found matching your search.
                                        </p>
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedRatingFilter(null)}
                                            className="text-stone-900 dark:text-stone-100 text-xs font-medium uppercase tracking-wider underline underline-offset-4 mt-3 cursor-pointer"
                                        >
                                            Show All Reviews
                                        </button>
                                    </div>
                                );
                            }

                            return filtered.map((rev, idx) => (
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
                                                <img 
                                                    key={i} 
                                                    src={img.url} 
                                                    alt="Review attachment" 
                                                    onClick={() => setActiveReviewPhoto(img.url)}
                                                    className="w-14 h-14 object-cover rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity" 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ));
                        })()
                    ) : (
                        <p className="text-center py-12 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">
                            No reviews submitted yet. Be the first to share your experience!
                        </p>
                    )}
                </div>
            </div>

            {/* Similar Products — compact strip (Amazon/Flipkart style) */}
            {similarProducts.length > 0 && (
                <div className="mt-16 sm:mt-24 border-t border-stone-100 dark:border-stone-800 pt-10 sm:pt-14">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium block mb-1">Explore More</span>
                            <h2 className="text-lg sm:text-xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100">
                                You May Also Like
                            </h2>
                        </div>
                        <Link
                            to="/collections/all"
                            className="text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-medium whitespace-nowrap"
                        >
                            View All →
                        </Link>
                    </div>

                    {/* Horizontal scroll strip on mobile / 5-col grid on large screens */}
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 lg:grid lg:grid-cols-5">
                        {similarProducts.map((prod) => (
                            <Link
                                key={prod._id}
                                to={`/product/${prod._id}`}
                                className="group flex-shrink-0 w-[140px] sm:w-[170px] lg:w-auto flex flex-col"
                            >
                                {/* Thumbnail */}
                                <div className="w-full h-[170px] sm:h-[210px] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 mb-2 flex-shrink-0">
                                    <img
                                        src={prod.images?.[0]?.url || "https://placehold.co/300x380"}
                                        alt={prod.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                </div>

                                {/* Info */}
                                <p className="text-[11px] sm:text-xs font-serif text-stone-800 dark:text-stone-200 truncate group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors mb-0.5 leading-snug">
                                    {prod.name}
                                </p>
                                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium tracking-wider">
                                    ₹{(prod.currentPrice || prod.price || 0).toFixed(2)}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Guide Modal */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-lg tracking-wide uppercase text-stone-900 dark:text-stone-100">Size Guide</h3>
                            <button 
                                onClick={() => setIsSizeGuideOpen(false)}
                                className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-sm font-semibold p-1 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-400">
                                        <th className="py-2.5">Size</th>
                                        <th className="py-2.5">Chest (in)</th>
                                        <th className="py-2.5">Waist (in)</th>
                                        <th className="py-2.5">Hips (in)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
                                    <tr>
                                        <td className="py-2.5 font-bold">S</td>
                                        <td className="py-2.5">34 - 36</td>
                                        <td className="py-2.5">28 - 30</td>
                                        <td className="py-2.5">35 - 37</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 font-bold">M</td>
                                        <td className="py-2.5">38 - 40</td>
                                        <td className="py-2.5">32 - 34</td>
                                        <td className="py-2.5">39 - 41</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 font-bold">L</td>
                                        <td className="py-2.5">42 - 44</td>
                                        <td className="py-2.5">36 - 38</td>
                                        <td className="py-2.5">43 - 45</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 font-bold">XL</td>
                                        <td className="py-2.5">46 - 48</td>
                                        <td className="py-2.5">40 - 42</td>
                                        <td className="py-2.5">47 - 49</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 font-bold">XXL</td>
                                        <td className="py-2.5">50 - 52</td>
                                        <td className="py-2.5">44 - 46</td>
                                        <td className="py-2.5">51 - 53</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-5 text-[10px] text-stone-400 leading-normal font-light">
                            * Measurements shown are in inches. If you are between sizes, we recommend sizing up for a more comfortable relaxed fit.
                        </p>
                    </div>
                </div>
            )}

            {/* Expanded Review Image Lightbox */}
            {activeReviewPhoto && (
                <div 
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setActiveReviewPhoto(null)}
                >
                    <button 
                        onClick={() => setActiveReviewPhoto(null)}
                        className="absolute top-6 right-6 text-white hover:text-stone-300 p-2 cursor-pointer transition-transform hover:scale-110"
                    >
                        <IoMdClose className="w-8 h-8" />
                    </button>
                    <img 
                        src={activeReviewPhoto} 
                        alt="Expanded customer review attachment" 
                        className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-stone-800 animate-zoomIn"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default ProductDetails;

