import { Link } from "react-router-dom"
import heroImg from "../../assets/homepage.jpg"

const Hero = () => {
  return (
    <section className="relative">
       <img src={heroImg} alt="Zaaish" className="w-full h-[400px] 
       md:h-[600px] lg:h-[750px] object-cover brightness-90 dark:brightness-75 transition-all"/> 
       <div className="absolute inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-3xl">
                <h1 className="text-4xl md:text-8xl font-serif font-normal tracking-[0.1em]
                uppercase mb-4">vacation <br /> ready </h1>
                <p className="text-xs tracking-[0.2em] uppercase md:text-sm mb-8 font-light text-stone-200">
                    Explore Our Vacation-Ready Outfits With Fast Worldwide Shipping.
                </p>
                <Link to="/collections/all" className="bg-white dark:bg-stone-100 text-stone-950 px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-semibold hover:bg-stone-100 dark:hover:bg-white transition shadow-lg cursor-pointer">
                    Shop Now
                </Link>
            </div>
       </div>
    </section>
  )
}

export default Hero