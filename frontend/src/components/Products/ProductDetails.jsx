import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from "sonner"
import ProductGrid from "./ProductGrid"

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

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/id/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setProduct(data.product);
                    setMainImage(data.product.images?.[0]?.url || "");
                    
                    if (data.product.category) {
                        const simResponse = await fetch(`/api/products?category=${data.product.category}&limit=4`);
                        const simData = await simResponse.json();
                        if (simResponse.ok) {
                            setSimilarProducts((simData.products || []).filter(p => p._id !== id));
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

        fetchProductDetails();
    }, [id]);

    const handleQuantityChange = (action) => {
        if(action === "plus") setQuantity((prev) => prev + 1);
        if(action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
    }

    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            if (!selectedSize || !selectedColor) {
                toast.error("Please Select A Size And Color Before Adding To Cart", { duration: 1500 });
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
            toast.error("Please Select A Size And Color Before Adding To Cart", { duration: 1500 });
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
                toast.success("Product Added To Cart", { duration: 1500 });
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

    if (loading) {
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading product details...</div>;
    }

    if (!product) {
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Product not found.</div>;
    }

  return (
    <div className="p-6 bg-stone-50/50 dark:bg-stone-950 min-h-screen text-stone-900 dark:text-stone-100 transition-colors">
        <div className="max-w-6xl mx-auto bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 dark:border-stone-800">
            <div className="flex flex-col md:flex-row">
                {/* Left Thumbnails */}
                <div className="hidden md:flex flex-col space-y-4 mr-6">
                    {product.images?.map((image, index) => (
                        <img 
                        key={index}
                        src={image.url} 
                        alt={image.altText || `Thumbnail ${index}`} 
                        className={`w-20 h-20 object-cover rounded-xl cursor-pointer border transition ${mainImage ===
                            image.url ? "border-stone-900 dark:border-stone-100 ring-2 ring-stone-900/20 dark:ring-stone-100/20" : "border-stone-200 dark:border-stone-700"
                        }`}
                        onClick={() => setMainImage(image.url)}
                        />
                    ))}
                </div>
                {/* Main Image */}
                <div className="md:w-1/2">
                    <div className="mb-4 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
                        <img src={mainImage} alt="Main Product" 
                        className="w-full h-[500px] object-cover" />
                    </div>
                </div>
                {/* Mobile Thumbnails */}
                <div className="md:hidden flex overflow-x-scroll space-x-4 mb-4">
                    {product.images?.map((image, index) => (
                        <img 
                        key={index}
                        src={image.url} 
                        alt={image.altText || `Thumbnail ${index}`} 
                        className={`w-20 h-20 object-cover rounded-xl cursor-pointer border ${mainImage ===
                            image.url ? "border-stone-900 dark:border-stone-100" : "border-stone-200 dark:border-stone-700"
                        }`}
                        onClick={() => setMainImage(image.url)}/>
                    ))}
                </div>

                {/* Right Section */}
                <div className="md:w-1/2 md:ml-10">
                    <h1 className="text-2xl md:text-3xl font-serif font-medium mb-2 text-stone-900 dark:text-stone-100">
                        {product.name}
                    </h1>
                    <p className="text-sm text-stone-400 dark:text-stone-500 mb-1 line-through">
                        {product.originalPrice && `$${product.originalPrice}`}
                    </p>
                    <p className="text-2xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-4">
                        $ {product.currentPrice || product.price}
                    </p>
                    <p className="text-stone-600 dark:text-stone-300 mb-6 leading-relaxed text-sm font-light">
                        {product.description}
                    </p>
                    
                    {/* Colors */}
                    <div className="mb-6">
                        <p className="text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-2">Color: </p>
                        <div className="flex gap-2.5">
                            {product.colors?.map((color) => (
                                <button key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border cursor-pointer transition
                                    ${selectedColor === color ? "border-2 border-stone-900 dark:border-stone-100 ring-2 ring-offset-2 ring-stone-900 dark:ring-stone-100" : "border-stone-300 dark:border-stone-700"}`}
                                style={{backgroundColor: color.toLowerCase()}}
                                title={color}></button>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mb-6">
                        <p className="text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-2">Size:</p>
                        <div className="flex gap-2">
                            {product.sizes?.map((size) => (
                                <button key={size} 
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 rounded-xl border text-xs font-semibold uppercase tracking-widest transition cursor-pointer
                                    ${selectedSize === size ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100" : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"}`}
                                > 
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-6">
                        <p className="text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-2">Quantity:</p>
                        <div className="flex items-center space-x-4">
                            <button 
                            onClick={() => handleQuantityChange("minus")}
                            className="px-3 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer">
                                -
                            </button>
                            <span className="text-base font-medium text-stone-900 dark:text-stone-100">{quantity}</span>
                            <button
                            onClick={() => handleQuantityChange("plus")}
                            className="px-3 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer">
                                + 
                            </button>
                        </div>
                    </div>

                    <button
                    onClick={handleAddToCart}
                    disabled={isButtonDisabled}
                    className={`bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-3.5 rounded-xl w-full mb-6 text-xs uppercase tracking-widest font-semibold transition cursor-pointer shadow-sm ${isButtonDisabled
                        ? "cursor-not-allowed opacity-50" : "hover:bg-stone-800 dark:hover:bg-stone-200"
                    }`}
                    >
                        {isButtonDisabled ? "Adding..." : "ADD TO CART"}
                    </button>

                    <div className="border-t border-stone-100 dark:border-stone-800 pt-6 text-stone-700 dark:text-stone-300">
                        <h3 className="text-sm font-serif font-medium mb-3 uppercase tracking-wider">Characteristics:</h3>
                        <table className="w-full text-left text-xs text-stone-600 dark:text-stone-400">
                            <tbody>
                                <tr>
                                    <td className="py-1.5 font-medium uppercase tracking-wider text-[10px]">Brand</td>
                                    <td className="py-1.5">{product.brand || "Zaaish Exclusive"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 font-medium uppercase tracking-wider text-[10px]">Material</td>
                                    <td className="py-1.5">{product.material || "Premium Blend"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="mt-20 border-t border-stone-100 dark:border-stone-800 pt-10">
                    <h2 className="text-2xl text-center font-serif font-medium mb-8 text-stone-900 dark:text-stone-100">
                        You May Also Like
                    </h2>
                    <ProductGrid products={similarProducts}/>
                </div>
            )}
        </div>
    </div>
  )
}

export default ProductDetails;