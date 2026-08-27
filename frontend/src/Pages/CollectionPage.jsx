import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from "react-icons/fa";
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12
  });
  const [wishlist, setWishlist] = useState([]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categoryPills = ["All", "Top Wear", "Bottom Wear", "Outerwear", "Accessories", "Footwear"];

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch logged-in user wishlist if token exists
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("/api/users/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setWishlist(data.wishlist || []);
        }
      } catch (err) {
        console.error("Error fetching user wishlist:", err);
      }
    };

    fetchWishlist();
  }, []);

  // Fetch paginated products based on route params and search query params
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams); 
        
        if (collection && collection.toLowerCase() !== "all") {
          queryParams.set("collection", collection);
        }

        if (!queryParams.has("page")) {
          queryParams.set("page", "1");
        }

        if (!queryParams.has("limit")) {
          queryParams.set("limit", "12");
        }

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products || []);
          setPagination({
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1,
            totalProducts: data.totalProducts || (data.products ? data.products.length : 0),
            limit: data.limit || 12
          });
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collection, searchParams]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePillClick = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleToggleWishlist = async (productId) => {
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
        body: JSON.stringify({ productId })
      });

      const data = await response.json();

      if (response.ok) {
        setWishlist(data.wishlist || []);
        if (data.action === "added") {
          toast.success("Added to your wishlist ❤️");
        } else {
          toast.info("Removed from your wishlist");
        }
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Something went wrong updating wishlist");
    }
  };

  const searchQuery = searchParams.get("search");
  const activeCategory = searchParams.get("category") || "All";

  return (
    <div className='flex flex-col lg:flex-row relative min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pt-6 lg:pt-8 pb-16'>
      {/* Mobile Filter Button */}
      <div className='lg:hidden px-6 mb-4'>
        <button
          onClick={toggleSidebar}
          className='w-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 flex justify-center items-center rounded-xl text-xs uppercase tracking-[0.15em] font-medium cursor-pointer shadow-sm'
        >
          <FaFilter className='mr-2' /> Filters
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Filter Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 z-50 left-0 w-80 bg-white dark:bg-stone-900 overflow-y-auto p-6 shadow-2xl border-r border-stone-200/80 dark:border-stone-800
          lg:translate-x-0 lg:sticky lg:top-28 lg:h-[calc(100vh-120px)] lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent
          transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <FilterSidebar />
      </div>

      <div className='flex-1 px-6 lg:px-12'>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium block mb-1">
              {pagination.totalProducts} Items Available
            </span>
            <h2 className='text-2xl sm:text-3xl font-serif font-light uppercase tracking-wide'>
              {searchQuery 
                ? `Search Results for "${searchQuery}"`
                : collection === "all" || !collection 
                  ? "All Collections" 
                  : `${collection} Collection`
              }
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <SortOptions />
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categoryPills.map((cat) => (
            <button
              key={cat}
              onClick={() => handlePillClick(cat)}
              className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all cursor-pointer ${
                (cat === "All" && !searchParams.get("category")) || activeCategory === cat
                  ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm"
                  : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid Component */}
        <ProductGrid 
          products={products} 
          loading={loading} 
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* Server-Side Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14 pt-8 border-t border-stone-200/80 dark:border-stone-800">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-medium transition-all ${
                  pagination.currentPage === pageNum
                    ? "bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 shadow-sm font-semibold"
                    : "border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;