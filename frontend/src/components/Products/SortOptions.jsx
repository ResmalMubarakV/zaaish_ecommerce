import React from 'react'
import { useSearchParams } from 'react-router-dom'

const SortOptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (e) => {
    const sortBy = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (sortBy) {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    setSearchParams(params);
  };

  return (
    <div className='mb-8 flex items-center justify-end'>
      <select 
        id="sort" 
        onChange={handleSortChange}
        value={searchParams.get("sortBy") || ""}
        className='border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 text-[11px] uppercase tracking-[0.2em] font-medium text-stone-700 dark:text-stone-300 rounded-xl focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 shadow-sm cursor-pointer transition-colors'
      >
        <option value="">Sort By: Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  )
}

export default SortOptions;