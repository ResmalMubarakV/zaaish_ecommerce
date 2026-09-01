import { useState } from "react"
import { IoLogoInstagram } from "react-icons/io"
import { RiTwitterXLine } from "react-icons/ri"
import { TbBrandMeta } from "react-icons/tb"
import { Link } from "react-router-dom"

const Footer = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 dark:text-stone-400 py-10 sm:py-12 md:py-16 border-t border-stone-800 dark:border-stone-900/80 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Socials */}
        <div className="space-y-3 md:space-y-4 text-center sm:text-left">
            <h3 className="text-white font-serif text-base md:text-lg tracking-[0.2em] sm:tracking-[0.25em] uppercase font-light">Zaaish</h3>
            <p className="text-stone-400 dark:text-stone-500 text-[11px] md:text-xs tracking-wide max-w-xs mx-auto sm:mx-0 font-light leading-relaxed">
              Curated luxury apparel designed for the modern minimalist wardrobe.
            </p>
            <div className="flex justify-center sm:justify-start items-center space-x-5 pt-2 text-stone-400">
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
        <div className="text-center sm:text-left">
            <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-medium mb-2.5 md:mb-4">Collections</h4>
            <ul className="space-y-2.5 text-xs font-light text-stone-400">
                <li><Link to="/collections/Men" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Men's Apparel</Link></li>
                <li><Link to="/collections/Women" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Women's Apparel</Link></li>
                <li><Link to="/collections/Top Wear" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Top Wear</Link></li>
                <li><Link to="/collections/Bottom Wear" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5">Bottom Wear</Link></li>
            </ul>
        </div>

        {/* Support Links */}
        <div className="text-center sm:text-left">
            <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-medium mb-2.5 md:mb-4">Client Services</h4>
            <ul className="space-y-2.5 text-xs font-light text-stone-400">
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5 font-light">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5 font-light">About Our Brand</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5 font-light">FAQs &amp; Shipping</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors cursor-pointer inline-block py-0.5 font-light">Store Policy</Link></li>
            </ul>
        </div>
        
        {/* Newsletter Form */}
        <div className="text-center sm:text-left">
            <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-medium mb-2.5 md:mb-4">Newsletter</h4>
            <p className="text-stone-400 text-[11px] md:text-xs font-light mb-3 md:mb-4 leading-relaxed">Subscribe to receive updates, access to exclusive releases, and 10% off.</p>
            <form className="flex max-w-sm mx-auto sm:mx-0 shadow-sm">
                <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="p-3 w-full text-xs bg-stone-800/80 dark:bg-stone-900 border border-stone-700/80 dark:border-stone-800 text-white rounded-l-xl placeholder:text-stone-500 focus:outline-none focus:border-stone-400 transition-colors" 
                    required
                />
                <button 
                    type="submit" 
                    className="bg-white text-stone-950 px-4 sm:px-5 py-3 text-[11px] uppercase tracking-[0.15em] font-medium rounded-r-xl hover:bg-stone-200 transition-all cursor-pointer whitespace-nowrap"
                >
                    Join
                </button>
            </form>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-10 md:mt-14 px-4 sm:px-6 lg:px-8 border-t border-stone-800/60 dark:border-stone-900 pt-6 md:pt-8 text-center flex flex-col sm:flex-row justify-between items-center text-stone-500 text-[10px] md:text-[11px] tracking-widest uppercase">
          <p>&copy; {new Date().getFullYear()} ZAAISH. All Rights Reserved.</p>
          <div className="mt-4 sm:mt-0 space-x-6">
              <span onClick={() => setIsPrivacyOpen(true)} className="hover:text-stone-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span onClick={() => setIsTermsOpen(true)} className="hover:text-stone-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
      </div>

      {/* Terms & Conditions Modal */}
      {isTermsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print" onClick={() => setIsTermsOpen(false)}>
              <div 
                  className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-[95%] sm:w-full max-w-lg rounded-3xl p-5 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 cursor-default"
                  onClick={(e) => e.stopPropagation()}
              >
                  <button 
                      type="button"
                      onClick={() => setIsTermsOpen(false)}
                      className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                      ✕
                  </button>
                  <h3 className="font-serif font-light text-lg uppercase tracking-wider mb-4 border-b border-stone-100 dark:border-stone-800 pb-3">Terms &amp; Conditions</h3>
                  <div className="overflow-y-auto max-h-[50vh] text-xs font-light text-stone-600 dark:text-stone-300 leading-relaxed pr-2 space-y-3.5 scrollbar-thin">
                      <p className="font-medium text-stone-900 dark:text-stone-100">Welcome to ZAAISH. By browsing or making a purchase on our boutique platform, you agree to comply with and be bound by the following terms of use.</p>
                      <div>
                          <h4 className="font-semibold text-stone-850 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1">1. Orders &amp; Billing</h4>
                          <p>All prices listed on the catalog are in INR (₹). We reserve the right to cancel orders or adjust pricing in case of typographical errors or stock discrepancies. Orders are only processed upon successful payment verification.</p>
                      </div>
                      <div>
                          <h4 className="font-semibold text-stone-850 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1">2. Shipping &amp; Logistics</h4>
                          <p>Standard orders are processed within 1-2 business days. Express shipping is complementary on orders above ₹3,000. Risk of loss passes to the customer upon delivery handover to the transport partner.</p>
                      </div>
                      <div>
                          <h4 className="font-semibold text-stone-850 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1">3. Intellectual Property</h4>
                          <p>All brand content, designs, images, and collections are protected by domestic and international copyright laws. Unauthorized reproduction or commercial use is strictly prohibited.</p>
                      </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800 mt-5">
                      <button 
                          onClick={() => setIsTermsOpen(false)}
                          className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition cursor-pointer"
                      >
                          Accept &amp; Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print" onClick={() => setIsPrivacyOpen(false)}>
              <div 
                  className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-[95%] sm:w-full max-w-lg rounded-3xl p-5 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 cursor-default"
                  onClick={(e) => e.stopPropagation()}
              >
                  <button 
                      type="button"
                      onClick={() => setIsPrivacyOpen(false)}
                      className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                      ✕
                  </button>
                  <h3 className="font-serif font-light text-lg uppercase tracking-wider mb-4 border-b border-stone-100 dark:border-stone-800 pb-3">Privacy Policy</h3>
                  <div className="overflow-y-auto max-h-[50vh] text-xs font-light text-stone-600 dark:text-stone-300 leading-relaxed pr-2 space-y-3.5 scrollbar-thin">
                      <p className="font-medium text-stone-900 dark:text-stone-100">At ZAAISH, we prioritize your data security. This privacy policy documents the types of customer details we gather and how we utilize them.</p>
                      <div>
                          <h4 className="font-semibold text-stone-850 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1">1. Information Collection</h4>
                          <p>We collect customer names, shipping addresses, email addresses, and contact numbers exclusively to complete your retail transaction and ship packages safely.</p>
                      </div>
                      <div>
                          <h4 className="font-semibold text-stone-850 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1">2. Payment &amp; Security</h4>
                          <p>Payment information is processed securely by certified payment gateways (Razorpay/PayPal). ZAAISH never stores or has access to your full credit card credentials or banking passcodes.</p>
                      </div>
                      <div>
                          <h4 className="font-semibold text-stone-850 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1">3. Third Party Disclosures</h4>
                          <p>We do not sell, trade, or distribute your email contacts or account logs to marketing brokers. We share shipping details solely with courier providers to coordinate package delivery.</p>
                      </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800 mt-5">
                      <button 
                          onClick={() => setIsPrivacyOpen(false)}
                          className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-medium hover:bg-stone-850 dark:hover:bg-stone-200 transition cursor-pointer"
                      >
                          Close Policy
                      </button>
                  </div>
              </div>
          </div>
      )}
    </footer>
  )
}

export default Footer;