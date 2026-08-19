import { IoLogoInstagram } from "react-icons/io"
import { RiTwitterXLine } from "react-icons/ri"
import { TbBrandMeta } from "react-icons/tb"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 dark:text-stone-400 py-10 border-t border-stone-800 dark:border-stone-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 lg:px-8 items-center">
        
        <div className="space-y-3 text-center md:text-left">
            <h3 className="text-white font-serif text-base tracking-[0.2em] uppercase">Zaaish</h3>
            <div className="flex justify-center md:justify-start items-center space-x-4 text-stone-400">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" title="Meta">
                    <TbBrandMeta className="h-4 w-4 stroke-[1.5]"/>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" title="Instagram">
                    <IoLogoInstagram className="h-4 w-4"/>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" title="Twitter">
                    <RiTwitterXLine className="h-3.5 w-3.5"/>
                </a>
            </div>
        </div>

        <div className="text-center md:text-left">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-2">Shop</h4>
            <ul className="space-y-1.5 text-xs font-light text-stone-400 dark:text-stone-400">
                <li><Link to="/collections/Men" className="hover:text-white transition-colors cursor-pointer">Men's Apparel</Link></li>
                <li><Link to="/collections/Women" className="hover:text-white transition-colors cursor-pointer">Women's Apparel</Link></li>
                <li><Link to="/collections/Top Wear" className="hover:text-white transition-colors cursor-pointer">Top Wear</Link></li>
                <li><Link to="/collections/Bottom Wear" className="hover:text-white transition-colors cursor-pointer">Bottom Wear</Link></li>
            </ul>
        </div>

        <div className="text-center md:text-left">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-2">Support</h4>
            <ul className="space-y-1.5 text-xs font-light text-stone-400">
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer">About Our Brand</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer">FAQs &amp; Shipping</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer">Store Policy</Link></li>
            </ul>
        </div>
        
        <div className="text-center md:text-left">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-2">Newsletter</h4>
            <p className="text-stone-400 text-xs font-light mb-3">Get 10% off your first order.</p>
            <form className="flex max-w-sm mx-auto md:mx-0">
                <input 
                    type="email" 
                    placeholder="Enter email" 
                    className="p-2.5 w-full text-xs bg-stone-800 dark:bg-stone-900 border border-stone-700 dark:border-stone-800 text-white rounded-l-lg placeholder:text-stone-500 focus:outline-none focus:border-stone-500 transition-colors" 
                    required
                />
                <button 
                    type="submit" 
                    className="bg-white text-stone-900 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-r-lg hover:bg-stone-200 transition-colors cursor-pointer"
                >
                    Join
                </button>
            </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-6 lg:px-8 border-t border-stone-800/80 dark:border-stone-900 pt-6 text-center">
          <p className="text-stone-500 text-[11px] tracking-wider">
            &copy; {new Date().getFullYear()} ZAAISH. All Rights Reserved.
          </p>
      </div>
    </footer>
  )
}

export default Footer;