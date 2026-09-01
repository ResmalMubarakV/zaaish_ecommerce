import React from 'react'
import { HiArrowPathRoundedSquare, HiOutlineCreditCard, HiShoppingBag } from 'react-icons/hi2'

const FeaturesSection = () => {
  return (
    <section className='py-12 sm:py-20 lg:py-28 px-4 sm:px-6 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-900 transition-colors'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 text-center'>
        
        {/* Feature 1 */}
        <div className='flex flex-col items-center group p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:bg-stone-50/50 dark:hover:bg-stone-900/40'>
          <div className='p-4 bg-stone-100 dark:bg-stone-900 rounded-2xl mb-5 text-stone-900 dark:text-stone-100 group-hover:bg-stone-950 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-950 transition-all duration-300 shadow-sm'>
            <HiShoppingBag className="text-xl stroke-[1.5]" /> 
          </div>
          <h4 className='font-medium text-stone-900 dark:text-stone-100 tracking-[0.15em] text-xs uppercase mb-2'>
            Free International Shipping
          </h4>
          <p className='text-stone-500 dark:text-stone-400 font-light text-xs tracking-wide'>
            Complimentary shipping on all orders above $100.00
          </p>
        </div>

        {/* Feature 2 */}
        <div className='flex flex-col items-center group p-6 rounded-2xl transition-all duration-300 hover:bg-stone-50/50 dark:hover:bg-stone-900/40'>
          <div className='p-4 bg-stone-100 dark:bg-stone-900 rounded-2xl mb-5 text-stone-900 dark:text-stone-100 group-hover:bg-stone-950 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-950 transition-all duration-300 shadow-sm'>
            <HiArrowPathRoundedSquare className="text-xl stroke-[1.5]" /> 
          </div>
          <h4 className='font-medium text-stone-900 dark:text-stone-100 tracking-[0.15em] text-xs uppercase mb-2'>
            45 Days Return
          </h4>
          <p className='text-stone-500 dark:text-stone-400 font-light text-xs tracking-wide'>
            Hassle-free money back guarantee
          </p>
        </div>

        {/* Feature 3 */}
        <div className='flex flex-col items-center group p-6 rounded-2xl transition-all duration-300 hover:bg-stone-50/50 dark:hover:bg-stone-900/40'>
          <div className='p-4 bg-stone-100 dark:bg-stone-900 rounded-2xl mb-5 text-stone-900 dark:text-stone-100 group-hover:bg-stone-950 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-950 transition-all duration-300 shadow-sm'>
            <HiOutlineCreditCard className="text-xl stroke-[1.5]" /> 
          </div>
          <h4 className='font-medium text-stone-900 dark:text-stone-100 tracking-[0.15em] text-xs uppercase mb-2'>
            Secure Checkout
          </h4>
          <p className='text-stone-500 dark:text-stone-400 font-light text-xs tracking-wide'>
            100% encrypted &amp; protected payments
          </p>
        </div>

      </div>
    </section>
  )
}

export default FeaturesSection;