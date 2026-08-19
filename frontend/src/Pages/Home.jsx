import React, { useEffect, useState } from 'react';
import Hero from "../components/Layout/Hero";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductGrid from "../components/Products/ProductGrid";

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const bestRes = await fetch('/api/products?sortBy=popularity&limit=4');
        const bestData = await bestRes.json();
        if (bestRes.ok) setBestSellers(bestData.products || []);

        const womenRes = await fetch('/api/products?gender=Women&limit=4');
        const womenData = await womenRes.json();
        if (womenRes.ok) setWomenProducts(womenData.products || []);
      } catch (error) {
        console.error("Error loading home products:", error);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
        <Hero />
        <GenderCollectionSection />
        <NewArrivals />

        {/* Best Seller */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-serif font-medium text-center mb-8">Best Sellers</h2>
          <ProductGrid products={bestSellers} />
        </div>

        {/* Top Wears For Women */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-serif font-medium text-center mb-8">Top Wears For Women</h2>
          <ProductGrid products={womenProducts} />
        </div>

        <FeaturedCollection />
        <FeaturesSection />
    </div>
  );
};

export default Home;