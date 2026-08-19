import React from 'react'
import { HiArrowPathRoundedSquare, HiOutlineCreditCard, HiShoppingBag } from 'react-icons/hi2'

const FeaturesSection = () => {
  return (
    <section className='py-24 px-6 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-900 transition-colors'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center'>
        {/* Feature 1 */}
        <div className='flex flex-col items-center group'>
          <div className='p-4 bg-stone-50 dark:bg-stone-900 rounded-full mb-5 text-stone-900 dark:text-stone-100 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900 transition-colors duration-300'>
            <HiShoppingBag className="text-2xl stroke-[1.5]" /> 
          </div>
          <h4 className='font-medium text-stone-900 dark:text-stone-100 tracking-wider text-sm mb-2'>
            FREE INTERNATIONAL SHIPPING
          </h4>
          <p className='text-stone-500 dark:text-stone-400 font-light text-sm'>
            On all orders above $100.00
          </p>
        </div>

        {/* Feature 2 */}
        <div className='flex flex-col items-center group'>
          <div className='p-4 bg-stone-50 dark:bg-stone-900 rounded-full mb-5 text-stone-900 dark:text-stone-100 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900 transition-colors duration-300'>
            <HiArrowPathRoundedSquare className="text-2xl stroke-[1.5]" /> 
          </div>
          <h4 className='font-medium text-stone-900 dark:text-stone-100 tracking-wider text-sm mb-2'>
            45 DAYS RETURN
          </h4>
          <p className='text-stone-500 dark:text-stone-400 font-light text-sm'>
            Money Back Guarantee
          </p>
        </div>

        {/* Feature 3 */}
        <div className='flex flex-col items-center group'>
          <div className='p-4 bg-stone-50 dark:bg-stone-900 rounded-full mb-5 text-stone-900 dark:text-stone-100 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900 transition-colors duration-300'>
            <HiOutlineCreditCard className="text-2xl stroke-[1.5]" /> 
          </div>
          <h4 className='font-medium text-stone-900 dark:text-stone-100 tracking-wider text-sm mb-2'>
            SECURE CHECKOUT
          </h4>
          <p className='text-stone-500 dark:text-stone-400 font-light text-sm'>
            100% secured checkout process
          </p>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection;