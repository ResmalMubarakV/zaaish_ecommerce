import React, { useEffect, useRef, useState } from 'react'
import { FaFilter } from "react-icons/fa";
import { useParams, useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams); 
        
        if (collection && collection !== "all") {
            queryParams.append("collection", collection);
        }

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products || []);
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

  const searchQuery = searchParams.get("search");

  return (
    <div className='flex flex-col lg:flex-row relative min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pt-6 lg:pt-8'>
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

      {/* Filter Sidebar (Using sticky positioning so it naturally anchors below the header without overlapping) */}
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
        <h2 className='text-2xl sm:text-3xl font-serif font-light uppercase tracking-wide mb-8'>
          {searchQuery 
            ? `Search Results for "${searchQuery}"`
            : collection === "all" || !collection 
              ? "All Collections" 
              : `${collection} Collection`
          }
        </h2>

        {/* Sort Options */}
        <div className="flex justify-end mb-8">
          <SortOptions />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">Loading products...</div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-32 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">
            No products match your search or filters. Try clearing them!
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;