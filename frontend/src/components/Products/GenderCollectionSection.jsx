import { Link } from "react-router-dom"
import mensCollectionImage from "../../assets/mens-collection.webp"
import womensCollectionImage from "../../assets/womens-collection.webp"

const GenderCollectionSection = () => {
  return (
    <section className="py-20 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

        {/* Womens collection */}
        <div className="relative flex-1 group overflow-hidden rounded-2xl border border-stone-100 dark:border-stone-800">
            <img 
              src={womensCollectionImage} 
              alt="Women's Collection" 
              className="w-full h-[650px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
            <div className="absolute bottom-10 left-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm py-6 px-8 rounded-xl shadow-sm border border-stone-200/50 dark:border-stone-800">
                <h2 className="text-2xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-2">Women's Collection</h2>
                <Link 
                  to="/collections/all?gender=Women" 
                  className="text-xs uppercase tracking-widest text-stone-900 dark:text-stone-100 font-semibold underline underline-offset-8 hover:text-stone-600 dark:hover:text-stone-400 transition-colors cursor-pointer"
                >
                    Explore
                </Link>
             </div>
        </div>

        {/* Mens collection */}
        <div className="relative flex-1 group overflow-hidden rounded-2xl border border-stone-100 dark:border-stone-800">
            <img 
              src={mensCollectionImage} 
              alt="Men's Collection" 
              className="w-full h-[650px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
            <div className="absolute bottom-10 left-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm py-6 px-8 rounded-xl shadow-sm border border-stone-200/50 dark:border-stone-800">
                <h2 className="text-2xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-2">Men's Collection</h2>
                <Link 
                  to="/collections/all?gender=Men" 
                  className="text-xs uppercase tracking-widest text-stone-900 dark:text-stone-100 font-semibold underline underline-offset-8 hover:text-stone-600 dark:hover:text-stone-400 transition-colors cursor-pointer"
                >
                    Explore
                </Link>
             </div>
        </div>

      </div>
    </section>
  )
}

export default GenderCollectionSection;