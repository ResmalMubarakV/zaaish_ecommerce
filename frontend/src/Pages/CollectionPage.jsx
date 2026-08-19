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
    <div className='flex flex-col lg:flex-row relative min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors'>
      {/* Mobile Filter Button */}
      <button
        onClick={toggleSidebar}
        className='lg:hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 flex justify-center items-center m-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm'
      >
        <FaFilter className='mr-2' /> Filters
      </button>

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
          fixed inset-y-0 z-50 left-0 w-72 bg-white dark:bg-stone-900 overflow-y-auto p-6 shadow-2xl border-r border-stone-200/80 dark:border-stone-800
          lg:translate-x-0 lg:static lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent
          transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <FilterSidebar />
      </div>

      <div className='flex-1 p-6 lg:p-8'>
        <h2 className='text-2xl font-serif font-medium uppercase tracking-wide mb-6'>
          {searchQuery 
            ? `Search Results for "${searchQuery}"`
            : collection === "all" || !collection 
              ? "All Collection" 
              : `${collection} Collection`
          }
        </h2>

        {/* Sort Options */}
        <div className="flex justify-end mb-6">
          <SortOptions />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading products...</div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">
            No products match your search or filters. Try clearing them!
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;