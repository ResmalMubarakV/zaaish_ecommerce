import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: "",
        gender: "",
        color: "",
        size: [],
        material: [],
        brand: [],
        minPrice: 0,
        maxPrice: 100,
    });

    const [priceRange, setPriceRange] = useState([0, 100]);

    const categories = ["Top Wear", "Bottom Wear"];
    const colors = ["Red", "Blue", "Black", "Green", "Yellow", "Gray", "White", "Pink", "Beige", "Navy"];
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const materials = ["Cotton", "Wool", "Denim", "Polyster", "Silk", "Linen", "Viscose", "Fleece"];
    const brands = ["Urban Threads", "Modern Fit", "Street Style", "Beach Breeze", "Fashionista", "ChicStyle"];
    const genders = ["Men", "Women"];

    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
    
        setFilters({
            category: params.category || "",
            gender: params.gender || "",
            color: params.color || "",
            size: params.size ? params.size.split(",") : [],
            material: params.material ? params.material.split(",") : [],
            brand: params.brand ? params.brand.split(",") : [],
            minPrice: params.minPrice || 0,
            maxPrice: params.maxPrice || 100,
        });
        setPriceRange([0, params.maxPrice || 100]);
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const { name, value, checked, type } = e.target;
        let newFilters = { ...filters };

        if (type === "checkbox") {
            if (checked) {
                newFilters[name] = [...(newFilters[name] || []), value];
            } else {
                newFilters[name] = newFilters[name].filter((item) => item !== value);
            }
        } else {
            if (newFilters[name] === value) {
                newFilters[name] = "";
            } else {
                newFilters[name] = value;
            }
        }
        setFilters(newFilters); 
        updateURLParams(newFilters);   
    };

    const updateURLParams = (newFilters) => {
        const params = new URLSearchParams();
        const searchQuery = searchParams.get("search");
        if (searchQuery) params.set("search", searchQuery);

        const sortQuery = searchParams.get("sortBy");
        if (sortQuery) params.set("sortBy", sortQuery);
        
        Object.keys(newFilters).forEach((key) => {
            if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
                params.set(key, newFilters[key].join(","));
            } else if (newFilters[key] && newFilters[key] !== 0) {
                params.set(key, newFilters[key]);
            } else {
                params.delete(key);
            }
        });
        
        setSearchParams(params);
        navigate(`?${params.toString()}`);
    };

    const handlePriceChange = (e) => {
        const newPrice = e.target.value;
        setPriceRange([0, newPrice]);
        const newFilters = { ...filters, minPrice: 0, maxPrice: newPrice };
        updateURLParams(newFilters);
    };

    const handleResetFilters = () => {
        const resetState = { category: "", gender: "", color: "", size: [], material: [], brand: [], minPrice: 0, maxPrice: 100 };
        setFilters(resetState);
        setPriceRange([0, 100]);
        
        const params = new URLSearchParams();
        const searchQuery = searchParams.get("search");
        if (searchQuery) params.set("search", searchQuery);
        setSearchParams(params);
        navigate(`?${params.toString()}`);
    };

    return (
        <div className='p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm text-stone-900 dark:text-stone-100 transition-colors'>
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-stone-100 dark:border-stone-800'>
                <h3 className='text-lg font-serif text-stone-900 dark:text-stone-100'>Filters</h3>
                <button 
                    onClick={handleResetFilters}
                    className='text-xs uppercase tracking-widest bg-stone-100 dark:bg-stone-800 hover:bg-stone-900 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-lg transition cursor-pointer'
                >
                    Reset All
                </button>
            </div>

            {/* Category filter */}
            <div className='mb-6'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Category</label>
                {categories.map((category) => (
                  <div key={category} className='flex items-center mb-2 cursor-pointer' onClick={() => {
                      const newVal = filters.category === category ? "" : category;
                      const newFilters = { ...filters, category: newVal };
                      setFilters(newFilters);
                      updateURLParams(newFilters);
                  }}>
                    <input type="radio" 
                    name="category" 
                    value={category}
                    onChange={handleFilterChange}
                    checked={filters.category === category}
                    className='mr-3 h-4 w-4 text-stone-900 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 cursor-pointer' />
                    <span className='text-stone-600 dark:text-stone-300 text-sm cursor-pointer'>{category}</span>
                  </div>
                ))}
            </div>

            {/* Gender filter */}
            <div className='mb-6'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Gender</label>
                {genders.map((gender) => (
                  <div key={gender} className='flex items-center mb-2 cursor-pointer' onClick={() => {
                      const newVal = filters.gender === gender ? "" : gender;
                      const newFilters = { ...filters, gender: newVal };
                      setFilters(newFilters);
                      updateURLParams(newFilters);
                  }}>
                    <input type="radio" 
                    name="gender"
                    value={gender}
                    onChange={handleFilterChange} 
                    checked={filters.gender === gender}
                    className='mr-3 h-4 w-4 text-stone-900 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 cursor-pointer' />
                    <span className='text-stone-600 dark:text-stone-300 text-sm cursor-pointer'>{gender}</span>
                  </div>
                ))}
            </div>

            {/* Color filter */}
            <div className='mb-6'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Color</label>
                <div className='flex flex-wrap gap-2'>
                    {colors.map((color) => (
                        <button
                            key={color} 
                            type="button"
                            name="color"
                            value={color}
                            onClick={() => {
                                const newColor = filters.color === color ? "" : color;
                                const newFilters = { ...filters, color: newColor };
                                setFilters(newFilters);
                                updateURLParams(newFilters);
                            }}
                            className={`w-7 h-7 rounded-full border border-stone-300 dark:border-stone-700 cursor-pointer transition
                            hover:scale-105 ${filters.color === color ? "ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900" : ""}`}
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Size Filter */}  
            <div className='mb-6'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Size</label>
                {sizes.map((size) => (
                    <div key={size} className='flex items-center mb-2 cursor-pointer'>
                        <input type="checkbox"
                        name="size"
                        value={size}
                        onChange={handleFilterChange}
                        checked={filters.size.includes(size)}
                        className='mr-3 h-4 w-4 text-stone-900 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 rounded cursor-pointer' />
                        <span className='text-stone-600 dark:text-stone-300 text-sm cursor-pointer'>{size}</span>
                    </div>
                ))}
            </div>       

            {/* Material Filter */}  
            <div className='mb-6'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Material</label> 
                {materials.map((material) => (
                    <div key={material} className='flex items-center mb-2 cursor-pointer'>
                        <input type="checkbox"
                        name="material"
                        value={material}
                        onChange={handleFilterChange}
                        checked={filters.material.includes(material)}
                        className='mr-3 h-4 w-4 text-stone-900 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 rounded cursor-pointer' />
                        <span className='text-stone-600 dark:text-stone-300 text-sm cursor-pointer'>{material}</span>
                    </div>
                ))}
            </div> 

            {/* Brands Filter */}  
            <div className='mb-6'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Brand</label> 
                {brands.map((brand) => (
                    <div key={brand} className='flex items-center mb-2 cursor-pointer'>
                        <input type="checkbox"
                        name="brand"
                        value={brand}
                        onChange={handleFilterChange}
                        checked={filters.brand.includes(brand)}
                        className='mr-3 h-4 w-4 text-stone-900 dark:text-stone-100 focus:ring-stone-500 border-stone-300 dark:border-stone-700 rounded cursor-pointer' />
                        <span className='text-stone-600 dark:text-stone-300 text-sm cursor-pointer'>{brand}</span>
                    </div>
                ))}
            </div> 

            {/* Price Range Filter */}
            <div className='mb-2'>
                <label className='block text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-3'>Price Range</label>
                <input type="range"
                name="priceRange" 
                min={0}
                max={100}
                value={priceRange[1]}
                onChange={handlePriceChange}
                className='w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-stone-100' />
                <div className='flex justify-between text-stone-500 dark:text-stone-400 text-xs mt-2 font-medium'>
                    <span>$0</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;