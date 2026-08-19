import React from 'react'
import { Link } from "react-router-dom";
import featured from "../../assets/featured.webp"

const FeaturedCollection = () => {
  return (
    <section className='py-20 px-4 lg:px-6'>
      <div className='max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center bg-[#F9F8F6] dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-800 transition-colors'>
        {/* Left content */}
        <div className='lg:w-1/2 p-10 lg:p-16 text-center lg:text-left'>
          <span className='text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3 block'>
            Comfort And Style
          </span>
          <h2 className='text-3xl lg:text-5xl font-serif font-normal tracking-tight text-stone-900 dark:text-stone-100 mb-6 leading-tight'>
            Apparel Made For Everyday Life
          </h2>
          <p className='text-stone-600 dark:text-stone-300 font-light text-base lg:text-lg mb-8 leading-relaxed'>
            Discover high-quality, comfortable clothing that effortlessly blends fashion and function. 
            Designed to make you look and feel great every day.
          </p>
          <Link 
            to="/collections/all" 
            className="inline-block bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-8 py-4 rounded-none text-sm uppercase tracking-widest font-medium hover:bg-stone-800 dark:hover:bg-white transition-all duration-300 shadow-sm cursor-pointer">
            Shop Now
          </Link>
        </div>

        {/* Right content */}
        <div className='lg:w-1/2 w-full h-[400px] lg:h-[550px] overflow-hidden'>
          <img 
            src={featured} 
            alt="Featured collection"
            className='w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700' 
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturedCollection;