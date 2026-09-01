import { Link } from "react-router-dom"
import mensCollectionImage from "../../assets/mens-collection.webp"
import womensCollectionImage from "../../assets/womens-collection.webp"

const GenderCollectionSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 sm:gap-8">

        {/* Womens collection */}
        <div className="relative flex-1 group overflow-hidden rounded-3xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
            <img 
              src={womensCollectionImage} 
              alt="Women's Collection" 
              className="w-full h-[380px] sm:h-[520px] md:h-[650px] object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-black/15 dark:bg-black/30 group-hover:bg-black/25 transition-colors duration-500"></div>
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl py-4 px-5 sm:py-6 sm:px-8 rounded-2xl shadow-lg border border-stone-200/80 dark:border-stone-800">
                <h2 className="text-lg sm:text-2xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100 mb-1.5 sm:mb-2">Women's Collection</h2>
                <Link 
                  to="/collections/all?gender=Women" 
                  className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-stone-900 dark:text-stone-100 font-medium underline underline-offset-8 hover:text-stone-500 dark:hover:text-stone-400 transition-colors cursor-pointer"
                >
                    Explore Now
                </Link>
             </div>
        </div>

        {/* Mens collection */}
        <div className="relative flex-1 group overflow-hidden rounded-3xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
            <img 
              src={mensCollectionImage} 
              alt="Men's Collection" 
              className="w-full h-[380px] sm:h-[520px] md:h-[650px] object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-black/15 dark:bg-black/30 group-hover:bg-black/25 transition-colors duration-500"></div>
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl py-4 px-5 sm:py-6 sm:px-8 rounded-2xl shadow-lg border border-stone-200/80 dark:border-stone-800">
                <h2 className="text-lg sm:text-2xl font-serif font-light tracking-wide text-stone-900 dark:text-stone-100 mb-1.5 sm:mb-2">Men's Collection</h2>
                <Link 
                  to="/collections/all?gender=Men" 
                  className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-stone-900 dark:text-stone-100 font-medium underline underline-offset-8 hover:text-stone-500 dark:hover:text-stone-400 transition-colors cursor-pointer"
                >
                    Explore Now
                </Link>
             </div>
        </div>

      </div>
    </section>
  )
}

export default GenderCollectionSection;