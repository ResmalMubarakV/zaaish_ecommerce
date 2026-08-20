import { IoLogoInstagram } from "react-icons/io"
import { RiTwitterXLine } from "react-icons/ri"
import { TbBrandMeta } from "react-icons/tb"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 dark:text-stone-400 py-16 border-t border-stone-800 dark:border-stone-900/80 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6 lg:px-8">
        
        {/* Brand & Socials */}
        <div className="space-y-4 text-center md:text-left">
            <h3 className="text-white font-serif text-lg tracking-[0.25em] uppercase font-light">Zaaish</h3>
            <p className="text-stone-400 dark:text-stone-500 text-xs tracking-wide max-w-xs mx-auto md:mx-0 font-light leading-relaxed">
              Curated luxury apparel designed for the modern minimalist wardrobe.
            </p>
            <div className="flex justify-center md:justify-start items-center space-x-5 pt-2 text-stone-400">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer p-2 bg-stone-800/50 dark:bg-stone-900 rounded-full border border-stone-800" title="Meta">
                    <TbBrandMeta className="h-4 w-4 stroke-[1.5]"/>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer p-2 bg-stone-800/50 dark:bg-stone-900 rounded-full border border-stone-800" title="Instagram">
                    <IoLogoInstagram className="h-4 w-4"/>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer p-2 bg-stone-800/50 dark:bg-stone-900 rounded-full border border-stone-800" title="Twitter">
                    <RiTwitterXLine className="h-3.5 w-3.5"/>
                </a>
            </div>
        </div>

        {/* Shop Links */}
        <div className="text-center md:text-left">
            <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-medium mb-4">Collections</h4>
            <ul className="space-y-2.5 text-xs font-light text-stone-400">
                <li><Link to="/collections/Men" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Men's Apparel</Link></li>
                <li><Link to="/collections/Women" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Women's Apparel</Link></li>
                <li><Link to="/collections/Top Wear" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Top Wear</Link></li>
                <li><Link to="/collections/Bottom Wear" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Bottom Wear</Link></li>
            </ul>
        </div>

        {/* Support Links */}
        <div className="text-center md:text-left">
            <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-medium mb-4">Client Services</h4>
            <ul className="space-y-2.5 text-xs font-light text-stone-400">
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">About Our Brand</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">FAQs &amp; Shipping</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Store Policy</Link></li>
            </ul>
        </div>
        
        {/* Newsletter Form */}
        <div className="text-center md:text-left">
            <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-medium mb-4">Newsletter</h4>
            <p className="text-stone-400 text-xs font-light mb-4 leading-relaxed">Subscribe to receive updates, access to exclusive releases, and 10% off.</p>
            <form className="flex max-w-sm mx-auto md:mx-0 shadow-sm">
                <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="p-3 w-full text-xs bg-stone-800/80 dark:bg-stone-900 border border-stone-700/80 dark:border-stone-800 text-white rounded-l-xl placeholder:text-stone-500 focus:outline-none focus:border-stone-400 transition-colors" 
                    required
                />
                <button 
                    type="submit" 
                    className="bg-white text-stone-950 px-5 py-3 text-[11px] uppercase tracking-[0.15em] font-medium rounded-r-xl hover:bg-stone-200 transition-all cursor-pointer whitespace-nowrap"
                >
                    Join
                </button>
            </form>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-14 px-6 lg:px-8 border-t border-stone-800/60 dark:border-stone-900 pt-8 text-center flex flex-col sm:flex-row justify-between items-center text-stone-500 text-[11px] tracking-widest uppercase">
          <p>&copy; {new Date().getFullYear()} ZAAISH. All Rights Reserved.</p>
          <div className="mt-4 sm:mt-0 space-x-6">
              <span className="hover:text-stone-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-stone-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
      </div>
    </footer>
  )
}

export default Footer;