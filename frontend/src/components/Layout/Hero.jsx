import { Link } from "react-router-dom"
import heroImg from "../../assets/homepage.jpg"

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
       <img src={heroImg} alt="Zaaish Luxury Collection" className="w-full h-[450px] md:h-[650px] lg:h-[800px] object-cover brightness-[0.85] dark:brightness-75 transition-all transform hover:scale-105 duration-1000"/> 
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10 flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-4xl mx-auto">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-light text-stone-300 block mb-3">Curated Collection</span>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-light tracking-[0.15em] uppercase mb-6 leading-tight">
                    Vacation <br /> Ready
                </h1>
                <p className="text-xs sm:text-sm tracking-[0.2em] uppercase mb-10 font-light text-stone-200 max-w-lg mx-auto leading-relaxed">
                    Explore our exclusive vacation-ready silhouettes engineered with exceptional craftsmanship and worldwide shipping.
                </p>
                <Link to="/collections/all" className="inline-block bg-white dark:bg-stone-100 text-stone-950 px-9 py-4 rounded-xl text-xs uppercase tracking-[0.25em] font-medium hover:bg-stone-100 dark:hover:bg-white transition-all shadow-xl cursor-pointer">
                    Explore Collection
                </Link>
            </div>
       </div>
    </section>
  )
}

export default Hero