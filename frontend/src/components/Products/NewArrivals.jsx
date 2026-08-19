import React, { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { Link } from "react-router-dom"

const NewArrivals = () => {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await fetch('/api/products?limit=8&sortBy=newest');
                const data = await response.json();
                if (response.ok) {
                    setNewArrivals(data.products || []);
                }
            } catch (error) {
                console.error("Error fetching new arrivals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
       if (!isDragging) return;
       const x = e.pageX - scrollRef.current.offsetLeft; 
       const walk = x - startX;
       scrollRef.current.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const scroll = (direction) => {
        const scrollAmount = direction === "left" ? -350 : 350;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const updateScrollButtons = () => {
         const container = scrollRef.current;
         if (container) {
            const leftScroll = container.scrollLeft;
            const rightScrollable = container.scrollWidth > leftScroll + container.clientWidth;

            setCanScrollLeft(leftScroll > 0);
            setCanScrollRight(rightScrollable);
         }
    };

    useEffect(() => {
        const container = scrollRef.current;
        if(container) {
            container.addEventListener("scroll", updateScrollButtons);
            updateScrollButtons();
            return () => container.removeEventListener("scroll", updateScrollButtons);
        }
    }, [newArrivals]);

    if (loading) {
        return <div className="text-center py-20 text-stone-400 text-xs uppercase tracking-widest">Loading new arrivals...</div>;
    }

    if (newArrivals.length === 0) {
        return null;
    }

  return (
    <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative">
            <div className="max-w-xl">
                <span className="text-stone-400 dark:text-stone-400 text-xs uppercase tracking-[0.2em] font-medium block mb-2">Curated Collection</span>
                <h2 className="text-3xl lg:text-4xl font-serif font-normal text-stone-900 dark:text-stone-100 tracking-tight mb-3">
                    Explore New Arrivals
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed">
                    Discover the latest styles straight off the runway, freshly added to keep your wardrobe on the cutting edge of fashion.
                </p>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="hidden md:flex space-x-2 mt-4 md:mt-0">
                <button
                  onClick={() => scroll("left")}  
                  disabled={!canScrollLeft}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${canScrollLeft ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800"
                  : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"}`}>
                    <FiChevronLeft className="text-lg"/>
                </button>
                <button 
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${canScrollRight ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800"
                    : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"}`}>
                    <FiChevronRight className="text-lg"/>
                </button>
            </div>
        </div>

        {/* Scrollable Content Container */}
        <div 
            ref={scrollRef} 
            className={`w-full overflow-x-auto flex space-x-6 relative scrollbar-none pb-4 
                ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
        >
            {newArrivals.map((product) => (
                <div key={product._id} className="min-w-[85%] sm:min-w-[45%] lg:min-w-[30%] relative flex-shrink-0 group">
                    <div className="overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 mb-3">
                        <img 
                            src={product.images?.[0]?.url || "https://placehold.co/500x500"} 
                            alt={product.images?.[0]?.altText || product.name} 
                            className="w-full h-[450px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                            draggable="false" 
                        />
                    </div>

                    <div className="flex justify-between items-start px-1">
                        <Link to={`/product/${product._id}`} className="block">
                            <h4 className="font-serif text-stone-900 dark:text-stone-100 font-medium tracking-wide truncate hover:text-stone-600 dark:hover:text-stone-300 transition-colors">{product.name}</h4>
                            <p className="mt-1 text-stone-500 dark:text-stone-400 text-sm font-light">${product.price.toFixed(2)}</p>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    </section>
  )
}

export default NewArrivals;