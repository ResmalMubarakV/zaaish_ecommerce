import React, { useEffect, useState } from 'react';
import Hero from "../components/Layout/Hero";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductGrid from "../components/Products/ProductGrid";
import ProductSkeleton from "../components/Products/ProductSkeleton";

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true);

        // Fetch all 3 datasets in parallel — avoids sequential 10-second wait
        const [bestRes, womenRes, newArrRes] = await Promise.all([
          fetch('/api/products?sortBy=popularity&limit=4'),
          fetch('/api/products?gender=Women&limit=4'),
          fetch('/api/products?limit=8&sortBy=newest')
        ]);

        const [bestData, womenData, newArrData] = await Promise.all([
          bestRes.json(),
          womenRes.json(),
          newArrRes.json()
        ]);

        if (bestRes.ok)    setBestSellers(bestData.products || []);
        if (womenRes.ok)   setWomenProducts(womenData.products || []);
        if (newArrRes.ok)  setNewArrivals(newArrData.products || []);
      } catch (error) {
        console.error("Error loading home products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
        <Hero />
        <GenderCollectionSection />

        {/* New Arrivals — data passed as prop so no extra internal fetch */}
        <NewArrivals products={newArrivals} loading={loading} />

        {/* Best Sellers */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 font-medium block mb-2">Most Popular</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-wide">Best Sellers</h2>
          </div>
          {loading ? (
            <ProductSkeleton count={4} />
          ) : (
            <ProductGrid products={bestSellers} />
          )}
        </div>

        {/* Top Wears For Women */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 font-medium block mb-2">Featured Category</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-wide">Top Wears For Women</h2>
          </div>
          {loading ? (
            <ProductSkeleton count={4} />
          ) : (
            <ProductGrid products={womenProducts} />
          )}
        </div>

        <FeaturedCollection />
        <FeaturesSection />
    </div>
  );
};

export default Home;