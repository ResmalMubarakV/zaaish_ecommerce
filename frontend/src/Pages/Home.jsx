import React, { useEffect, useState, useRef } from 'react';
import Hero from "../components/Layout/Hero";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductGrid from "../components/Products/ProductGrid";
import ProductSkeleton from "../components/Products/ProductSkeleton";
import { preloadProductImages } from "../utils/cloudinaryHelper";

const HOME_CACHE_KEY = "zaaish_home_products";
const HOME_CACHE_TTL = 5 * 60 * 1000;

const readHomeCache = () => {
  try {
    const raw = sessionStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;

    const { timestamp, bestSellers, womenProducts, newArrivals } = JSON.parse(raw);
    if (Date.now() - timestamp > HOME_CACHE_TTL) return null;

    return { bestSellers, womenProducts, newArrivals };
  } catch {
    return null;
  }
};

const writeHomeCache = (data) => {
  try {
    sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      ...data,
    }));
  } catch {
    // Ignore storage quota errors
  }
};

const Home = () => {
  const [cached] = useState(() => readHomeCache());

  const [bestSellers, setBestSellers] = useState(cached?.bestSellers || []);
  const [womenProducts, setWomenProducts] = useState(cached?.womenProducts || []);
  const [newArrivals, setNewArrivals] = useState(cached?.newArrivals || []);
  const [loadingNew, setLoadingNew] = useState(!cached?.newArrivals?.length);
  const [loadingBest, setLoadingBest] = useState(!cached?.bestSellers?.length);
  const [loadingWomen, setLoadingWomen] = useState(!cached?.womenProducts?.length);

  // Lazy loading observers state & refs
  const [loadBestTriggered, setLoadBestTriggered] = useState(false);
  const [loadWomenTriggered, setLoadWomenTriggered] = useState(false);
  const bestSellersRef = useRef(null);
  const womenProductsRef = useRef(null);

  const fetchSection = async (url, setter, setLoading, variant) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        const products = data.products || [];
        setter(products);
        preloadProductImages(products, { variant, count: 8 });
      }
    } catch (error) {
      console.error(`Error loading home products from ${url}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cached) {
      preloadProductImages(cached.newArrivals, { variant: "carousel", count: 4 });
      preloadProductImages(cached.bestSellers, { variant: "grid", count: 4 });
      preloadProductImages(cached.womenProducts, { variant: "grid", count: 4 });
    }

    // Always fetch New Arrivals immediately (above the fold)
    fetchSection('/api/products?limit=8&sortBy=newest', setNewArrivals, setLoadingNew, "carousel");
  }, [cached]);

  // Observer for Best Sellers
  useEffect(() => {
    if (bestSellers.length > 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadBestTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );

    if (bestSellersRef.current) {
      observer.observe(bestSellersRef.current);
    }

    return () => observer.disconnect();
  }, [bestSellers]);

  // Fetch Best Sellers when visible
  useEffect(() => {
    if (loadBestTriggered && bestSellers.length === 0) {
      fetchSection('/api/products?sortBy=popularity&limit=4', setBestSellers, setLoadingBest, "grid");
    }
  }, [loadBestTriggered, bestSellers]);

  // Observer for Women's Products
  useEffect(() => {
    if (womenProducts.length > 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadWomenTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );

    if (womenProductsRef.current) {
      observer.observe(womenProductsRef.current);
    }

    return () => observer.disconnect();
  }, [womenProducts]);

  // Fetch Women's Products when visible
  useEffect(() => {
    if (loadWomenTriggered && womenProducts.length === 0) {
      fetchSection('/api/products?gender=Women&limit=4', setWomenProducts, setLoadingWomen, "grid");
    }
  }, [loadWomenTriggered, womenProducts]);

  useEffect(() => {
    if (!loadingNew && !loadingBest && !loadingWomen) {
      writeHomeCache({ bestSellers, womenProducts, newArrivals });
    }
  }, [loadingNew, loadingBest, loadingWomen, bestSellers, womenProducts, newArrivals]);

  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
        <Hero />
        <GenderCollectionSection />

        <NewArrivals products={newArrivals} loading={loadingNew} />

        <div ref={bestSellersRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 font-medium block mb-2">Most Popular</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-wide">Best Sellers</h2>
          </div>
          {loadingBest ? (
            <ProductSkeleton count={4} />
          ) : (
            <ProductGrid products={bestSellers} priorityCount={4} />
          )}
        </div>

        <div ref={womenProductsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 font-medium block mb-2">Featured Category</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-wide">Top Wears For Women</h2>
          </div>
          {loadingWomen ? (
            <ProductSkeleton count={4} />
          ) : (
            <ProductGrid products={womenProducts} priorityCount={4} />
          )}
        </div>

        <FeaturedCollection />
        <FeaturesSection />
    </div>
  );
};

export default Home;
