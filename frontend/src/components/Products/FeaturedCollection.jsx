import React from 'react'
import { Link } from "react-router-dom";
import featured from "../../assets/featured.webp"

const FeaturedCollection = () => {
  return (
    <section className='py-24 px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center bg-[#F9F8F6] dark:bg-stone-900/90 rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 dark:border-stone-800 transition-colors'>
        {/* Left content */}
        <div className='lg:w-1/2 p-8 sm:p-12 lg:p-16 text-center lg:text-left'>
          <span className='text-[10px] sm:text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 font-medium mb-3 block'>
            Comfort &amp; Style
          </span>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100 mb-6 leading-tight'>
            Apparel Made For Everyday Life
          </h2>
          <p className='text-stone-600 dark:text-stone-300 font-light text-sm sm:text-base mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0'>
            Discover high-quality, comfortable clothing that effortlessly blends fashion and function. Designed to make you look and feel exceptional every day.
          </p>
          <Link 
            to="/collections/all" 
            className="inline-block bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-9 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-sm cursor-pointer">
            Shop Collection
          </Link>
        </div>

        {/* Right content */}
        <div className='lg:w-1/2 w-full h-[400px] sm:h-[450px] lg:h-[600px] overflow-hidden relative'>
          <img 
            src={featured} 
            alt="Featured collection"
            className='w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out' 
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturedCollection;