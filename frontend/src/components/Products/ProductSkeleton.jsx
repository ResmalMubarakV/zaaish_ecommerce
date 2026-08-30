import React from "react";

export const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse flex flex-col">
          <div className="w-full h-[200px] sm:h-[300px] lg:h-[380px] xl:h-[420px] mb-2 sm:mb-4 rounded-xl sm:rounded-2xl bg-stone-200 dark:bg-stone-800/60 shadow-inner" />
          <div className="h-3 sm:h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mb-1 sm:mb-2" />
          <div className="h-2.5 sm:h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
