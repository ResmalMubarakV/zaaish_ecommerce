import React from "react";

export const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse flex flex-col">
          <div className="w-full h-[420px] mb-4 rounded-2xl bg-stone-200 dark:bg-stone-800/60 shadow-inner" />
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
