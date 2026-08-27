import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProductGrid from "../components/Products/ProductGrid";
import { FiArrowLeft } from "react-icons/fi";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view your wishlist");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/users/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        setWishlist(data.wishlist || []);
      } else {
        toast.error(data.message || "Failed to load wishlist");
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      toast.error("Error fetching wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh wishlist list from response or refetch
        fetchWishlist();
        toast.info("Removed from your wishlist");
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-xs uppercase tracking-[0.2em] font-medium text-stone-500 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
        >
          <FiArrowLeft className="mr-2 text-sm" /> Back to Store
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-serif font-light mb-2 tracking-wide">
        My Wishlist
      </h1>
      <p className="text-stone-500 dark:text-stone-400 text-xs tracking-wider uppercase font-light mb-10">
        Saved items in your personal collection
      </p>

      {loading ? (
        <ProductGrid products={[]} loading={true} />
      ) : wishlist.length > 0 ? (
        <ProductGrid 
          products={wishlist} 
          wishlist={wishlist} 
          onToggleWishlist={handleToggleWishlist} 
        />
      ) : (
        <div className="text-center py-32 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 shadow-sm">
          <p className="text-stone-400 text-xs uppercase tracking-[0.2em] font-light mb-6">
            Your wishlist is currently empty.
          </p>
          <Link
            to="/collections/all"
            className="inline-flex items-center bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-6 py-3 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm"
          >
            Explore Collections
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
